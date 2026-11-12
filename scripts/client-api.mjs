import { mkdir,readFile,writeFile,rename } from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {createClients,project,updateClient,canAccess,event,DOCUMENT_LABELS} from './client-model.mjs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createGridSamples} from '../public/grid-data.js';
import {reconcileRelease,processCrossoverReminders} from './crossover-model.mjs';
import {submitted} from '../public/crossover-policy.js';
import {pdfPreview} from './pdf-preview.mjs';
import {setTimeout as pause} from 'node:timers/promises';
const directory=process.env.WORK_CRM_REVIEW_DATA_DIR||fileURLToPath(new URL('../output/client-review/',import.meta.url));
const statePath=path.join(directory,'clients.json');
// Local review identity is configured by the server, never by a browser field.
// Replace this adapter with authenticated Sales CRM identity before production.
const role=process.env.WORK_CRM_REVIEW_ROLE||'management';
const context={role,actor:process.env.WORK_CRM_REVIEW_ACTOR||(role==='rep'?'Local Rep Reviewer':'Local Management Reviewer'),rep:process.env.WORK_CRM_REVIEW_REP||'Jack'};
let records;
let queue=Promise.resolve();
await mkdir(directory,{recursive:true});
try{records=JSON.parse(await readFile(statePath,'utf8'));}catch{
  records=createClients();
  for(const record of records)if(record.contracts.length){const id=randomUUID();const content=Buffer.from(`FICTIONAL SIGNED CONTRACT EXAMPLE\n${record.fields['Sale ID']}\nFor layout review only. Not a real signed agreement.`);await writeFile(path.join(directory,id),content);record.documents.push({id,label:'Signed Contract',name:'Sample signed contract.txt',type:'text/plain',bytes:content.length,at:record.fields['Last Activity']});}
  await writeFile(statePath,JSON.stringify(records));
}
async function persist(next){
  const temp=statePath+'.tmp';await writeFile(temp,JSON.stringify(next));
  for(let attempt=0;;attempt++){
    try{await rename(temp,statePath);break;}
    catch(error){if(!['EPERM','EACCES','EBUSY'].includes(error.code)||attempt>=5)throw error;await pause(40*2**attempt);}
  }
  records=next;
}
const gridSeeds=createGridSamples();
if(records.some(r=>!r.gridReview)){
  for(const r of records)if(!r.gridReview)r.gridReview=gridSeeds.find(g=>g.id===r.id);
  await persist(records);
}
let reopened=false;
for(const record of records){if(record.contracts.length&&!record.reviewRequired){record.reviewRequired=true;reopened=true;}const revision=record.revision;reconcileRelease(record,context,event);if(revision!==record.revision)reopened=true;}
if(reopened)await persist(records);
const reminderContext={role:'management',actor:'System 24-Hour Reminder'};
export async function runCrossoverTimers(now=Date.now()){
  if(context.role!=='management')return;
  const task=queue.then(async()=>{
    const next=structuredClone(records);let changed=false;
    for(const record of next){const revision=record.revision;processCrossoverReminders(record,reminderContext,event,now);if(record.revision!==revision)changed=true;}
    if(changed)await persist(next);
  });
  queue=task.catch(()=>{});return task;
}
await runCrossoverTimers();
const reminderTimer=setInterval(()=>{runCrossoverTimers().catch(error=>console.error('Crossover reminder persistence failed:',error.message));},60000);
reminderTimer.unref();
function json(response,status,value){response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});response.end(JSON.stringify(value));}
async function readBody(request){let result='',length=0;for await(const chunk of request){length+=chunk.length;if(length>12*1024*1024)throw Error('Request too large. Limit files to 8 MB.');result+=chunk;}return JSON.parse(result||'{}');}
export async function handleClients(request,response,url){
  if(!url.pathname.startsWith('/api/'))return false;
  try{
    if(!['management','rep'].includes(context.role)){json(response,403,{error:'No authorised review role configured.'});return true;}
    if(request.headers.origin&&request.headers.origin!==`http://${request.headers.host}`){json(response,403,{error:'Cross-origin requests are not allowed.'});return true;}
    await runCrossoverTimers();
    if(url.pathname==='/api/session'){json(response,200,{...context,mode:'Local sample review — production identity and Sales CRM connection pending'});return true;}
    if(url.pathname==='/api/job-management'){
      if(context.role!=='management'){json(response,403,{error:'Management permission is required.'});return true;}
      if(request.method!=='GET'){json(response,405,{error:'Read-only job inbox.'});return true;}
      json(response,200,{records:records.filter(submitted).map(r=>project(r,context))});return true;
    }
    const match=url.pathname.match(/^\/api\/(clients|rep-clients)(?:\/([^/]+))?(?:\/documents(?:\/([^/]+))?)?$/);
    if(!match){json(response,404,{error:'Not found.'});return true;}
    const [,kind,id,docId]=match;
    const view=kind==='rep-clients'?{...context,role:'rep'}:context;
    if(!id){if(request.method!=='GET'){json(response,405,{error:'Client creation is only allowed through lead generation.'});return true;}json(response,200,{records:records.map(r=>project(r,view)).filter(Boolean)});return true;}
    const record=records.find(r=>r.id===id);
    if(!record||!canAccess(record,view)){json(response,404,{error:'Client not found or outside your permitted records.'});return true;}
    if(request.method==='GET'){
      if(docId&&url.searchParams.has('preview')){
        const document=record.documents.find(d=>d.id===docId);if(!document||document.type!=='application/pdf')throw Error('Choose an attached PDF.');
        const mode=url.searchParams.get('preview');if(!['info','page'].includes(mode))throw Error('Invalid preview request.');
        let preview;
        try{preview=await pdfPreview(directory,document.id,mode,Number(url.searchParams.get('page')||1));}
        catch{throw Error('PDF preview unavailable. Check that the file is readable and not password-protected, or use Open File.');}
        if(mode==='info')json(response,200,preview);else{response.writeHead(200,{'Content-Type':'image/png','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});response.end(preview);}return true;
      }
      if(docId){const document=record.documents.find(d=>d.id===docId);if(!document){json(response,404,{error:'File not found.'});return true;}const bytes=await readFile(path.join(directory,document.id));response.writeHead(200,{'Content-Type':document.type,'Content-Disposition':`inline; filename="${document.name.replace(/[^a-zA-Z0-9 ._-]/g,'_')}"`,'Content-Security-Policy':"sandbox; default-src 'none'",'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});response.end(bytes);return true;}
      json(response,200,{record:project(record,view)});return true;
    }
    if(request.method!=='POST'||kind==='rep-clients'){json(response,405,{error:'This endpoint is read-only.'});return true;}
    if(!request.headers['content-type']?.startsWith('application/json')){json(response,415,{error:'JSON is required.'});return true;}
    const body=await readBody(request);
    const job=queue.then(async()=>{
      const current=records.find(r=>r.id===id);let updated;
      if(url.pathname.endsWith('/documents')){
        if(body.revision!==current.revision)throw Error('This record changed. Refresh before uploading.');
        if(!DOCUMENT_LABELS.includes(body.label))throw Error('Choose an approved document label.');
        if(typeof body.content!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(body.content))throw Error('Invalid file content.');
        const bytes=Buffer.from(body.content,'base64');if(!bytes.length||bytes.length>8*1024*1024)throw Error('Choose a non-empty file up to 8 MB.');
        const types={'.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.txt':'text/plain'};
        const name=String(body.name||'').slice(0,180),type=types[path.extname(name).toLowerCase()];if(!type)throw Error('Use PDF, PNG, JPG or TXT for this review.');
        const gridSource=body.gridFileId?current.gridReview?.files.find(f=>f.id===body.gridFileId&&!f.sample):null;
        if(body.gridFileId&&(!gridSource||(body.label==='Grid + Meter File'&&gridSource.group!=='grid')))throw Error('Choose a genuine Grid source attachment.');
        const fileId=randomUUID();await writeFile(path.join(directory,fileId),bytes);
        updated=structuredClone(current);updated.documents.push({id:fileId,label:body.label,name,type,bytes:bytes.length,at:new Date().toISOString()});
        if(gridSource)updated.documents.at(-1).gridSourceFileId=gridSource.id;
        event(updated,context,'Document',`${body.label} attached: ${name}.`);
      }else updated=updateClient(current,body,context);
      reconcileRelease(updated,context,event);
      await persist(records.map(r=>r.id===id?updated:r));return updated;
    });
    queue=job.catch(()=>{});const updated=await job;json(response,200,{record:project(updated,view)});
  }catch(error){json(response,400,{error:error.message});}
  return true;
}
