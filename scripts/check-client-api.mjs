import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import path from 'node:path';
const base='http://127.0.0.1:3115';
const directory=path.resolve('output',`api-test-${Date.now()}`);
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'3115',WORK_CRM_REVIEW_DATA_DIR:directory},stdio:'pipe',windowsHide:true});
try{
  let ready=false;for(let i=0;i<40;i++){try{ready=(await fetch(base+'/api/session')).ok;if(ready)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'API did not start');
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
  const repChild=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'3116',WORK_CRM_REVIEW_DATA_DIR:directory,WORK_CRM_REVIEW_ROLE:'rep'},stdio:'pipe',windowsHide:true});
  try{
    const repBase='http://127.0.0.1:3116';let repReady=false;for(let i=0;i<40;i++){try{repReady=(await fetch(repBase+'/api/session')).ok;if(repReady)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(repReady);
    const repList=await(await fetch(repBase+'/api/clients')).json();assert.ok(repList.records.length<25);assert.ok(repList.records.every(r=>r.fields['Rep Name']==='Jack'));
    const forged=await fetch(repBase+'/api/clients/preview-13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:signed.revision,role:'management',actor:'Forged Manager',action:'decide-change',changeId:'fake',decision:'Approved'})});assert.notEqual(forged.status,200);assert.match((await forged.json()).error,/Management permission/);
  }finally{repChild.kill();}
  console.log('Client API checks passed: no client creation, real file evidence, shared rep history, record scope, signed price lock and cross-origin rejection.');
}finally{child.kill();}
