import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {CHECKS,productLines} from '../public/crossover-policy.js';
const base='http://127.0.0.1:3115';
const directory=path.resolve('output',`api-test-${Date.now()}`);
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'3115',WORK_CRM_REVIEW_DATA_DIR:directory},stdio:'pipe',windowsHide:true});
let bootOutput='';child.stdout.on('data',chunk=>bootOutput+=chunk);child.stderr.on('data',chunk=>bootOutput+=chunk);
try{
  let ready=false;for(let i=0;i<100;i++){try{ready=(await fetch(base+'/api/session')).ok;if(ready)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'API did not start: '+bootOutput);
  const request=async(url,body)=>{const response=await fetch(base+url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});return {status:response.status,value:await response.json()};};
  assert.equal((await request('/api/clients',{})).status,405);
  let result=await request('/api/clients/preview-01'),record=result.value.record;assert.equal(record.documents.length,0);
  const noFile=await request('/api/clients/preview-01/documents',{revision:record.revision,label:'Meter Pic',name:'meter.txt',content:''});assert.equal(noFile.status,400);
  assert.equal((await request('/api/clients/preview-01')).value.record.documents.length,0);
  const uploaded=await request('/api/clients/preview-01/documents',{revision:record.revision,label:'Meter Pic',name:'meter.txt',content:Buffer.from('Sample meter evidence').toString('base64')});assert.equal(uploaded.status,200);record=uploaded.value.record;assert.equal(record.documents[0].label,'Meter Pic');
  const fileResponse=await fetch(base+`/api/clients/preview-01/documents/${record.documents[0].id}`);assert.equal(await fileResponse.text(),'Sample meter evidence');
  const note=await request('/api/clients/preview-01',{revision:record.revision,action:'add-note',note:'Shared API test note'});assert.equal(note.status,200);
  const repView=await request('/api/rep-clients/preview-01');assert.equal(repView.value.record.events.at(-1).action,'Shared API test note');
  assert.equal((await request('/api/rep-clients/preview-02')).status,404);
  const signed=(await request('/api/clients/preview-13')).value.record;
  const direct=await request('/api/clients/preview-13',{revision:signed.revision,action:'save-profile',page:'Price',fields:{'Total Price':'1'}});assert.equal(direct.status,400);
  assert.deepEqual((await request('/api/clients/preview-13')).value.record.contracts,signed.contracts);
  const cross=await fetch(base+'/api/clients/preview-01',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://unrelated.example'},body:'{}'});assert.equal(cross.status,403);
  let job=(await request('/api/clients/preview-18')).value.record;
  const changeJob=async(action,body={})=>{const result=await request('/api/clients/preview-18',{revision:job.revision,action,...body});assert.equal(result.status,200,result.value.error);job=result.value.record;};
  const completedAt=new Date(Date.now()-3600000).toISOString();
  await changeJob('crossover-save',{key:'order',evidence:{owner:'API Test Admin'}});
  const grid=structuredClone(job.gridReview);grid.fields['Grid Status']='Grid Approved';
  await changeJob('save-grid-review',{grid,expectedGridUpdate:job.gridReview.fields['Last Update']});
  await changeJob('crossover-save',{key:'stc',evidence:{owner:'STC Admin',creator:'STC Creator',platform:'Bridgeselect',reference:'SAMPLE-STC',completedAt}});
  await changeJob('crossover-save',{key:'inventory',evidence:{owner:'Warehouse Admin',reference:'SAMPLE-PO',status:'Prepared',completedAt,lines:productLines(job).map(p=>({quantity:p.quantity,packed:p.quantity,matched:true}))}});
  await changeJob('crossover-save',{key:'extras',evidence:{items:job.contracts.at(-1).extras.map(()=>({organised:true,owner:'Extras Admin',reference:'SAMPLE-EXTRA',completedAt}))}});
  for(const label of ['Identification','Electricity Bill']){
    const result=await request('/api/clients/preview-18/documents',{revision:job.revision,label,name:'Sample review evidence.txt',content:Buffer.from('Fictional source for API review testing.').toString('base64')});assert.equal(result.status,200);job=result.value.record;
  }
  await changeJob('save-profile',{page:'Grid Details',fields:{NMI:'43123456789'}});
  await changeJob('review-contract-date',{date:'2026-10-22',documentId:job.documents.find(d=>d.label==='Signed Contract').id});
  await changeJob('review-start');
  for(const item of job.documentReview.rounds.at(-1).items){const source=job.documents.find(d=>item.sources.includes(d.label));await changeJob('review-answer',{itemId:item.id,state:'Checked',documentId:source.id,location:'Sample section 1',note:'API fixture reviewed'});}
  await changeJob('review-finalise');
  for(const key of CHECKS)await changeJob('crossover-check',{key});
  assert.equal((await request('/api/job-management')).value.records.length,0,'All green must not automatically release');
  const timerDirectory=path.join(directory,'reminder-restart');await mkdir(timerDirectory,{recursive:true});
  const dueJob=structuredClone(job);dueJob.crossover.readyWindow.readyAt=new Date(Date.now()-25*3600000).toISOString();dueJob.crossover.readyWindow.dueAt=new Date(Date.now()-3600000).toISOString();
  await writeFile(path.join(timerDirectory,'clients.json'),JSON.stringify([dueJob]));
  for(let boot=0;boot<2;boot++){
    const timerChild=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'3117',WORK_CRM_REVIEW_DATA_DIR:timerDirectory},stdio:'pipe',windowsHide:true});
    try{
      let result;for(let i=0;i<40;i++){try{const response=await fetch('http://127.0.0.1:3117/api/clients/preview-18');if(response.ok){result=await response.json();break;}}catch{}await new Promise(r=>setTimeout(r,100));}
      assert.ok(result,'Reminder test server did not start');assert.equal(result.record.crossover.interactions.length,2,'Restart must not duplicate overdue reminders');assert.ok(result.record.crossover.interactions.every(i=>i.kind==='submission-reminder'&&i.status.startsWith('Queued')));
    }finally{const stopped=new Promise(resolve=>timerChild.once('exit',resolve));timerChild.kill();await stopped;}
  }
  await changeJob('crossover-prepare-submission');let token=job.crossover.confirmation.token;
  await changeJob('crossover-cancel-submission',{token});assert.equal((await request('/api/job-management')).value.records.length,0);
  await changeJob('crossover-prepare-submission');token=job.crossover.confirmation.token;
  await changeJob('crossover-submit',{token,confirmed:true});
  assert.deepEqual((await request('/api/job-management')).value.records.map(r=>r.id),['preview-18']);
  assert.equal(job.crossover.interactions.length,2);assert.ok(job.crossover.interactions.every(i=>i.status.startsWith('Queued')));
  assert.equal((await request('/api/clients/preview-18',{revision:job.revision,action:'crossover-submit',token,confirmed:true})).status,400);
  await changeJob('save-profile',{page:'Project Details',fields:{'Site Visit Notes':'API test changed access'}});
  assert.equal((await request('/api/job-management')).value.records.length,0);assert.ok(job.crossover.interactions.every(i=>i.status.startsWith('Cancelled')));
  const repChild=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'3116',WORK_CRM_REVIEW_DATA_DIR:directory,WORK_CRM_REVIEW_ROLE:'rep'},stdio:'pipe',windowsHide:true});
  try{
    const repBase='http://127.0.0.1:3116';let repReady=false;for(let i=0;i<40;i++){try{repReady=(await fetch(repBase+'/api/session')).ok;if(repReady)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(repReady);
    const repList=await(await fetch(repBase+'/api/clients')).json();assert.ok(repList.records.length<25);assert.ok(repList.records.every(r=>r.fields['Rep Name']==='Jack'));
    assert.equal((await fetch(repBase+'/api/job-management')).status,403);
    const forged=await fetch(repBase+'/api/clients/preview-13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:signed.revision,role:'management',actor:'Forged Manager',action:'decide-change',changeId:'fake',decision:'Approved'})});assert.notEqual(forged.status,200);assert.match((await forged.json()).error,/Management permission/);
  }finally{repChild.kill();}
  console.log('Client API checks passed: shared history, file evidence, permissions, seven-stage YES/NO gating, queued channels, persisted 24-hour reminder catch-up without restart duplicates, and stale handover withdrawal.');
}finally{child.kill();}
