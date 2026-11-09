import { PROVIDERS,STATUSES,HOUR,DAY,inputDate,fromSydney,statusFor,timing,validateRecord } from './grid-model.js';
import { createGridSamples } from './grid-data.js';

const KEY='yello-grid-sample-workspace-v1';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate=value=>value?new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Sydney',dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'Not recorded';
const text=value=>value?esc(value):'—';
let records=createGridSamples();
try{const saved=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(saved)&&saved.length&&saved.every(r=>r.id&&r.fields&&Array.isArray(r.files)&&Array.isArray(r.events)))records=saved;}catch{}
// Repair only untouched fictional seed dates; never overwrite a reviewed update.
for(const r of records)if(r.events.length===1&&Date.parse(r.fields['Approval Date'])>Date.now()){r.fields['Approval Date']=new Date(Date.now()-4*HOUR).toISOString();r.fields['Last Update']=r.fields['Approval Date'];}
const state={query:'',provider:'All',status:'All',due:false,left:0,top:0};
const tabs=[['grid','Grid Approval'],['meter','Net Meter Application'],['payment','Payment Done']];
const columns=['Client Name','Status','Grid Provider','NMI','Last Update','Creation Date','Files','Sale to Grid Approval','Install to Meter Application','Install Date'];
function outstanding(r){const t=timing(r);return (t.grid.late&&!t.grid.end)||(t.meter.late&&!t.meter.end);}
function saveRecord(record){
  const next=records.map(r=>r.id===record.id?record:r);
  try{localStorage.setItem(KEY,JSON.stringify(next));records=next;return true;}catch{throw Error('Changes could not be saved in this browser. Please free browser storage and try again.');}
}
function duration(ms){if(ms===null)return 'Date missing';if(ms<0)return 'Check date order';const h=Math.floor(ms/HOUR);return h<48?`${h}h`:`${Math.floor(h/24)}d ${h%24}h`;}
function pill(label,kind=''){return `<span class="grid-badge ${kind}">${esc(label)}</span>`;}
function delayCell(t,which){
  const clock=t[which];
  if(which==='meter'&&clock.exempt)return '<span class="grid-muted">Not required</span>';
  const label=clock.end?(clock.late?'Completed late':'On time'):clock.late?(clock.escalated?'Escalated':'Overdue'):'In progress';
  return `<div class="grid-delay"><strong>${duration(clock.elapsed)}</strong>${pill(clock.elapsed===null?'Date missing':label,clock.late?'late':clock.end?'good':'')}<small>${which==='meter'&&!clock.due&&!clock.end?'Awaiting payment proof':clock.due?`Due ${formatDate(clock.due)}`:''}</small></div>`;
}
function channelButtons(r){return `<span class="grid-contact">${[['Phone','☎'],['Email','✉'],['SMS','▣'],['Location','⌖']].map(([name,symbol])=>`<button type="button" data-contact="${r.id}" data-channel="${name}" aria-label="${name} ${esc(r.fields['Client Name'])}" title="${name}">${symbol}</button>`).join('')}</span>`;}
function startPanel(panel){
  panel._gridCleanup?.();panel._gridCleanup=null;
  document.querySelector('main').classList.add('grid-page');
  document.querySelector('.journey').hidden=true;
  document.querySelector('#module-tabs').hidden=true;
  document.querySelector('#next-section').hidden=true;
  panel.removeAttribute('role');panel.removeAttribute('aria-labelledby');
}
export function mountGrid(panel,route){
  startPanel(panel);
  const [,id,section]=route.split('/');
  const record=records.find(r=>r.id===id);
  if(record)detail(panel,record,tabs.some(t=>t[0]===section)?section:'grid');else register(panel);
}
function register(panel){
  document.querySelector('#page-description').textContent='Grid approval first. Meter application next. Every deadline in view.';
  const allTimes=records.map(r=>timing(r));
  const gridLate=allTimes.filter(t=>t.grid.late&&!t.grid.end).length;
  const meterLate=allTimes.filter(t=>t.meter.late&&!t.meter.end).length;
  const escalated=allTimes.filter(t=>t.meter.escalated).length;
  panel.innerHTML=`<div class="grid-register-heading"><div><span class="eyebrow">GRID & METER APPROVALS</span><h2>Keep Every Connection Moving.</h2><p>Track applications, approvals and payment proof from one working list.</p></div><button class="sales-button" id="grid-alerts" type="button">Deadline Alerts ${pill(gridLate+meterLate,'late')}</button></div><div class="grid-counters" aria-label="Sample order deadlines"><div><span>Orders</span><strong>${records.length}</strong></div><div><span>Grid approval overdue</span><strong>${gridLate}</strong></div><div><span>Meter application overdue</span><strong>${meterLate}</strong></div><div><span>Meter escalated · 72h</span><strong>${escalated}</strong></div></div><div class="grid-demo">Fictional sample orders · Changes and files save in this browser. No live provider application or notification is sent.</div><div class="grid-search-row"><label>Search Orders<input id="grid-search" type="search" placeholder="Client Name, Phone, Address or NMI…" value="${esc(state.query)}"></label><label class="grid-due-filter"><input id="grid-due" type="checkbox" ${state.due?'checked':''}> Outstanding deadlines only</label><button class="sales-button" id="grid-clear" type="button">Clear Filters</button></div><div class="grid-filters"><div class="grid-filter-group" role="group" aria-label="Grid providers"><span>GRID PROVIDER</span><div>${['All',...PROVIDERS].map(p=>`<button type="button" data-provider="${p}" aria-pressed="${p===state.provider}">${p}</button>`).join('')}</div></div><div class="grid-filter-group" role="group" aria-label="Application status"><span>STATUS</span><div>${['All',...STATUSES].map(s=>`<button type="button" data-status="${s}" aria-pressed="${s===state.status}">${s}</button>`).join('')}</div></div></div><div class="grid-list-heading"><h2>Application Register</h2><span id="grid-result" aria-live="polite"></span></div><div class="grid-top-scroll" tabindex="0" role="region" aria-label="Horizontal application register scrollbar"><div></div></div><div class="grid-register-scroll" role="region" aria-label="Grid and meter register — 20 rows high" tabindex="0"><table class="grid-register"><caption class="visually-hidden">Fictional grid and meter orders. Twenty rows high with horizontal and vertical scrolling.</caption><thead><tr>${columns.map(c=>`<th scope="col">${c}</th>`).join('')}</tr></thead><tbody></tbody></table></div><div class="grid-register-foot"><span>20 compact rows · Client details stay visible</span><span>Grid: 10 calendar days · Meter: 48h deadline / 72h escalation · Sydney time</span></div>`;
  const scroll=panel.querySelector('.grid-register-scroll'),top=panel.querySelector('.grid-top-scroll');
  const size=()=>top.firstElementChild.style.width=`${panel.querySelector('table').scrollWidth}px`;
  const resize=new ResizeObserver(size);resize.observe(scroll);
  panel._gridCleanup=()=>resize.disconnect();
  let syncing=false;
  function mirror(source,target){if(syncing)return;if(Math.abs(source.scrollLeft-target.scrollLeft)<1)return;syncing=true;target.scrollLeft=source.scrollLeft;requestAnimationFrame(()=>{syncing=false;});}
  scroll.addEventListener('scroll',()=>{state.left=scroll.scrollLeft;state.top=scroll.scrollTop;mirror(scroll,top);});
  top.addEventListener('scroll',()=>mirror(top,scroll));
  function rows(){
    const q=state.query.toLowerCase().trim();
    const visible=records.filter(r=>(state.provider==='All'||r.fields['Grid Provider']===state.provider)&&(state.status==='All'||statusFor(r)===state.status)&&(!state.due||outstanding(r))&&['Client Name','Contact 1','Location','NMI','Sale ID'].some(key=>String(r.fields[key]||'').toLowerCase().includes(q)));
    panel.querySelector('tbody').innerHTML=visible.map(r=>{const f=r.fields,t=timing(r);return `<tr><td><div class="grid-client"><a href="#grid-management/${r.id}/grid">${text(f['Client Name'])}</a>${channelButtons(r)}</div><small class="grid-order-id">${text(f['Sale ID'])}</small></td><td>${pill(statusFor(r))}</td><td>${text(f['Grid Provider'])}</td><td>${text(f['NMI'])}</td><td>${formatDate(f['Last Update'])}</td><td>${formatDate(f['Creation Date'])}</td><td><a class="grid-file-link" href="#grid-management/${r.id}/grid#files" data-files="${r.id}">${r.files.length} files</a></td><td>${delayCell(t,'grid')}</td><td>${delayCell(t,'meter')}</td><td>${formatDate(f['Install Date'])}</td></tr>`;}).join('');
    if(!visible.length)panel.querySelector('tbody').innerHTML='<tr class="grid-empty"><td colspan="10">No orders match these filters. Clear the filters to see all orders.</td></tr>';
    panel.querySelector('#grid-result').textContent=`${visible.length} of ${records.length} sample orders`;
    panel.querySelectorAll('[data-provider]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.provider===state.provider)));
    panel.querySelectorAll('[data-status]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.status===state.status)));
    size();
  }
  rows();scroll.scrollLeft=state.left;scroll.scrollTop=state.top;
  const refresh=setInterval(()=>{
    rows();const current=records.map(r=>timing(r));
    const numbers=[records.length,current.filter(t=>t.grid.late&&!t.grid.end).length,current.filter(t=>t.meter.late&&!t.meter.end).length,current.filter(t=>t.meter.escalated).length];
    panel.querySelectorAll('.grid-counters strong').forEach((el,i)=>el.textContent=numbers[i]);
    panel.querySelector('#grid-alerts .grid-badge').textContent=numbers[1]+numbers[2];
  },60000);
  panel._gridCleanup=()=>{resize.disconnect();clearInterval(refresh);};
  panel.querySelector('#grid-search').addEventListener('input',e=>{state.query=e.target.value;rows();});
  panel.querySelector('#grid-due').addEventListener('change',e=>{state.due=e.target.checked;rows();});
  panel.querySelector('#grid-clear').addEventListener('click',()=>{Object.assign(state,{query:'',provider:'All',status:'All',due:false,top:0,left:0});register(panel);});
  panel.addEventListener('click',function click(e){if(!panel.isConnected)return;const provider=e.target.closest('[data-provider]'),status=e.target.closest('[data-status]');if(provider){state.provider=provider.dataset.provider;rows();}if(status){state.status=status.dataset.status;rows();}},{signal:cleanupSignal(panel)});
  panel.querySelector('#grid-alerts').addEventListener('click',()=>alerts(panel));
  bindContacts(panel);
  panel.querySelectorAll('[data-files]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();location.hash=`grid-management/${link.dataset.files}/grid`;}));
}
function cleanupSignal(panel){panel._gridAbort?.abort();panel._gridAbort=new AbortController();return panel._gridAbort.signal;}
function contact(panel,r,channel){
  const f=r.fields;
  dialog(panel,channel,`<p><strong>${text(f['Client Name'])}</strong> · ${text(f['Sale ID'])}</p><dl><dt>Contact 1</dt><dd>${text(f['Contact 1'])}</dd><dt>Email 1</dt><dd>${text(f['Email 1'])}</dd><dt>Location</dt><dd>${text(f['Location'])}</dd></dl><p class="grid-muted">Sample contact details only. No call, message or navigation to a real client location is started.</p>`);
}
function bindContacts(panel){panel.querySelectorAll('[data-contact]').forEach(b=>b.addEventListener('click',()=>contact(panel,records.find(r=>r.id===b.dataset.contact),b.dataset.channel)));}
function dialog(panel,title,body){panel.querySelector('dialog')?.remove();const d=document.createElement('dialog');d.className='grid-dialog';d.innerHTML=`<form method="dialog"><header><h2>${esc(title)}</h2><button class="sales-button" aria-label="Close dialog">Close</button></header></form>${body}`;d.addEventListener('close',()=>d.remove());panel.append(d);d.showModal();}
function alerts(panel){
  const notifications=records.flatMap(r=>{const t=timing(r),items=[];if(t.grid.late&&!t.grid.end)items.push({r,label:'Grid approval overdue',due:t.grid.due});if(t.meter.late&&!t.meter.end)items.push({r,label:t.meter.escalated?'Meter application escalated · 72h':'Meter application overdue · 48h',due:t.meter.due});return items;});
  dialog(panel,'Deadline Alerts',`<p class="grid-muted">In-app sample alerts. Unresolved deadlines remain visible. No external notifications are connected.</p><div class="grid-alert-list">${notifications.map(n=>`<a href="#grid-management/${n.r.id}/${n.label.startsWith('Grid')?'grid':'meter'}"><strong>${esc(n.label)}</strong><span>${text(n.r.fields['Client Name'])} · ${text(n.r.fields['Sale ID'])}</span><small>Due ${formatDate(n.due)}</small></a>`).join('')||'<p>No outstanding deadlines.</p>'}</div>`);
  panel.querySelectorAll('.grid-alert-list a').forEach(a=>a.addEventListener('click',()=>panel.querySelector('dialog')?.close()));
}
function readOnly(field,value){return `<div class="grid-readonly"><span>${esc(field)}</span><strong>${text(value)}</strong></div>`;}
function input(field,value,type='text'){return `<label>${esc(field)}<input aria-label="${esc(field)}" name="${esc(field)}" type="${type}" value="${esc(type==='datetime-local'?inputDate(value):value||'')}" ${type==='text'?'maxlength="250"':''}></label>`;}
function select(field,value,options){return `<label>${esc(field)}<select aria-label="${esc(field)}" name="${esc(field)}">${options.map(o=>`<option ${o===value?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;}
function fileList(r,group){const files=r.files.filter(f=>f.group===group);return `<div class="grid-file-list">${files.map(file=>`<button type="button" class="grid-file" data-download="${esc(file.id)}">▤ ${esc(file.name)} <span>Download</span></button>`).join('')||'<p class="grid-muted">No files attached in this section.</p>'}</div>`;}
function deadlineCard(label,t,which){const c=t[which];return `<article><span>${label}</span><strong>${c.exempt?'Not required':c.end?(c.late?'Completed late':'Completed on time'):c.late?(c.escalated?'Escalated':'Overdue'):c.due?'Within deadline':'Awaiting trigger'}</strong><small>${c.due?`${c.end?'Deadline':'Due'} ${formatDate(c.due)}`:which==='grid'?'Sales Date required':'Payment confirmation and proof required'}</small></article>`;}
function detail(panel,record,section,notice=''){
  panel._gridCleanup?.();panel._gridCleanup=null;panel._gridAbort?.abort();
  const f=record.fields,t=timing(record);
  document.querySelector('#page-description').textContent='One order. Grid approval, net meter application and payment proof together.';
  panel.innerHTML=`<div class="grid-detail-back"><a class="sales-button" href="#grid-management">← Back to Application Register</a>${pill('Fictional sample order')}</div><div class="grid-detail-hero"><div><span>${text(f['Sale ID'])} · ${text(f['Grid Provider'])}</span><h2>${text(f['Client Name'])}</h2><p>${text(f['Location'])} · ${text(f['NMI'])}</p></div>${channelButtons(record)}</div><div class="grid-deadline-cards">${deadlineCard('GRID APPROVAL · 10 DAYS',t,'grid')}${deadlineCard('NET METER · 48 HOURS',t,'meter')}</div><div class="grid-demo">Review workspace · Changes and attachments save only in this browser. Saving does not submit an application to a provider.</div><nav class="grid-detail-tabs" aria-label="Grid and meter sections">${tabs.map(([id,label])=>`<a href="#grid-management/${record.id}/${id}" ${id===section?'aria-current="page"':''}>${label}</a>`).join('')}</nav><div class="grid-save-notice" role="status">${esc(notice)}</div><div class="grid-shared-fields">${readOnly('Client Name',f['Client Name'])}${readOnly('Sales Date',f['Sales Date'])}${readOnly('Install Date',formatDate(f['Install Date']))}${readOnly('Grid Provider',f['Grid Provider'])}${readOnly('NMI',f['NMI'])}${readOnly('Last Update',formatDate(f['Last Update']))}</div><form id="grid-detail-form"><div class="grid-form-heading"><span>${section==='grid'?'01':section==='meter'?'02':'03'}</span><div><h2>${tabs.find(v=>v[0]===section)[1]}</h2><p>${section==='grid'?'Record the grid application and approval before organising the meter work.':section==='meter'?'Record when the net meter application was submitted and the meter installed.':'Confirm payment and record when its proof was received.'}</p></div></div><div class="grid-form-fields">${section==='grid'?`${select('Grid Status',f['Grid Status'],['Grid Waiting','Grid - Applied','Grid Approved','Grid - Client Connect'])}${input('Grid Applied Date',f['Grid Applied Date'],'datetime-local')}${input('Approval Number',f['Approval Number'])}${input('Approval Date',f['Approval Date'],'datetime-local')}`:section==='meter'?`${select('Meter Applied',f['Meter Applied'],['Waiting','Applied','Meter - Client Connect','Completed','Not Required'])}${input('Meter Date + Time',f['Meter Date + Time'],'datetime-local')}${input('Meter Ins Date',f['Meter Ins Date'],'datetime-local')}`:`${select('Payment Done',f['Payment Done'],['Pending','Done'])}${input('Payment Proof Received',f['Payment Proof Received'],'datetime-local')}<div class="grid-help">The 48-hour deadline starts from Payment Proof Received after payment is confirmed and proof is attached. An outstanding application escalates at 72 hours.</div>`}</div><section class="grid-files-section"><h3>${section==='payment'?'Payment Proof':'Grid + Meter File'}</h3>${fileList(record,section)}<label class="grid-upload">Attach ${section==='payment'?'Payment Proof':'Files'}<input type="file" name="attachments" multiple accept=".pdf,.png,.jpg,.jpeg,.txt,.docx,.xlsx"><span>Files are kept in this browser. Up to 15 MB per file.</span></label></section><label class="grid-change-note">What Happened<textarea name="What Happened" maxlength="2000" placeholder="Optional context for this update…"></textarea></label><div id="grid-form-error" role="alert"></div><div class="grid-save-row"><button type="submit" class="sales-button primary">Save Changes</button><span>Dates and times use Australia/Sydney.</span></div></form><section class="grid-history"><div><h2>Order Activity</h2><a href="#activity-logs">Open Central Activity Logs →</a></div>${[...record.events].reverse().map(event=>`<article><time>${formatDate(event.at)} · ${esc(event.person)}</time><p>${esc(event.action)}</p></article>`).join('')}</section>`;
  bindContacts(panel);
  const refresh=setInterval(()=>{const clocks=timing(record);panel.querySelector('.grid-deadline-cards').innerHTML=deadlineCard('GRID APPROVAL · 10 DAYS',clocks,'grid')+deadlineCard('NET METER · 48 HOURS',clocks,'meter');},60000);
  panel._gridCleanup=()=>clearInterval(refresh);
  panel.querySelectorAll('[data-download]').forEach(button=>button.addEventListener('click',async()=>{try{const file=record.files.find(v=>v.id===button.dataset.download);const blob=file.sample?new Blob([`FICTIONAL SAMPLE DOCUMENT\n${f['Sale ID']}\n${file.name}\nNot evidence of a real approval or payment.`],{type:'text/plain'}):await getFile(file.id);if(!blob)throw Error('This attachment is unavailable in this browser. Please attach it again.');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){panel.querySelector('#grid-form-error').textContent=error.message;}}));
  panel.querySelector('#grid-detail-form').addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget,button=form.querySelector('button[type=submit]'),errorBox=panel.querySelector('#grid-form-error');errorBox.textContent='';button.disabled=true;
    try{
      const data=new FormData(form),draft=structuredClone(record),changes=[];
      for(const [field,value]of data){if(['attachments','What Happened'].includes(field))continue;const next=['Grid Applied Date','Approval Date','Meter Date + Time','Meter Ins Date','Payment Proof Received'].includes(field)?fromSydney(value):value.trim();if(draft.fields[field]!==next){changes.push(`${field}: ${draft.fields[field]||'Not recorded'} → ${next||'Not recorded'}`);draft.fields[field]=next;}}
      const uploads=data.getAll('attachments').filter(file=>file.size);
      if(uploads.some(file=>file.size>15*1024*1024))throw Error('Each attachment must be 15 MB or smaller.');
      const newFiles=uploads.map(file=>({id:crypto.randomUUID(),name:file.name,group:section,sample:false}));
      draft.files.push(...newFiles);
      if(section==='payment'&&uploads.length&&!draft.fields['Payment Proof Received'])draft.fields['Payment Proof Received']=new Date().toISOString();
      const errors=validateRecord(draft);if(errors.length)throw Error(errors.join(' '));
      if(!changes.length&&!uploads.length&&!data.get('What Happened').trim())throw Error('There are no changes to save.');
      for(let i=0;i<uploads.length;i++)await putFile(newFiles[i].id,uploads[i]);
      const at=new Date().toISOString();draft.fields['Last Update']=at;
      const context=data.get('What Happened').trim();
      draft.events.push({at,person:'Local review user',action:`${tabs.find(t=>t[0]===section)[1]} updated. ${changes.join('; ')}${uploads.length?` · ${uploads.length} file(s) attached.`:''}${context?` · ${context}`:''}`});
      saveRecord(draft);detail(panel,draft,section,'Changes saved in this browser. Register, deadlines and activity have been updated.');
    }catch(error){errorBox.textContent=error.message;button.disabled=false;}
  });
}
function database(){return new Promise((resolve,reject)=>{const request=indexedDB.open('yello-grid-review-files',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Browser file storage is unavailable.'));});}
async function putFile(id,file){const db=await database();try{await new Promise((resolve,reject)=>{const transaction=db.transaction('files','readwrite');transaction.objectStore('files').put(file,id);transaction.oncomplete=resolve;transaction.onerror=()=>reject(Error('Could not save the attachment.'));});}finally{db.close();}}
async function getFile(id){const db=await database();try{return await new Promise((resolve,reject)=>{const request=db.transaction('files').objectStore('files').get(id);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Could not read the attachment.'));});}finally{db.close();}}
export function mountGridActivity(panel){
  startPanel(panel);
  document.querySelector('#page-description').textContent='Central activity history for Grid and Meter work in this review workspace.';
  const events=records.flatMap(r=>r.events.map(e=>({...e,id:r.id,client:r.fields['Client Name'],sale:r.fields['Sale ID']}))).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));
  panel.innerHTML=`<div class="grid-list-heading"><h2>Grid & Meter Activity</h2><span>${events.length} sample events</span></div><div class="grid-demo">Local review history only. Production audit permissions and server recording are not connected.</div><div class="grid-central-history">${events.map(e=>`<article><time>${formatDate(e.at)} · ${esc(e.person)}</time><a href="#grid-management/${e.id}/grid">${esc(e.client)} · ${esc(e.sale)}</a><p>${esc(e.action)}</p></article>`).join('')}</div>`;
}
