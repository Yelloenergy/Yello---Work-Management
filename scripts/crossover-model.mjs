import {CHECKS,blockers,stampFor,ready,releaseStamp,currentOrder,productLines,submitted,WORK_STATUSES} from '../public/crossover-policy.js';
import {validateRecord} from '../public/grid-model.js';
import {randomUUID} from 'node:crypto';
const clean=(v,max=500)=>{if(typeof v!=='string'||v.length>max)throw Error('Enter a valid text value.');return v.trim();};
function time(value,required=true){if(!value&&!required)return '';const date=Date.parse(value);if(!Number.isFinite(date)||date>Date.now())throw Error('Completion time must be a valid time in the past.');return new Date(date).toISOString();}
function due(value){if(!value)return '';if(!Number.isFinite(Date.parse(value)))throw Error('Enter a valid due date.');return new Date(value).toISOString();}
export function updateCrossover(record,body,context,event){
  if(context.role!=='management')throw Error('Management permission is required.');
  if(body.action==='save-grid-review'){
    if((record.gridReview?.fields['Last Update']||'')!==body.expectedGridUpdate)throw Error('Grid details changed. Refresh before saving.');
    if(body.grid?.id!==record.id||body.grid?.fields?.['Sale ID']!==record.fields['Sale ID'])throw Error('Grid and Sale ID must match.');
    const errors=validateRecord(body.grid);if(errors.length)throw Error(errors.join(' '));
    const previousEvents=record.gridReview?.events||[],submitted=body.grid.events?.at(-1);
    record.gridReview=structuredClone(body.grid);
    const at=new Date().toISOString();
    record.gridReview.fields['Last Update']=at;
    record.gridReview.events=[...previousEvents,{at,person:context.actor,action:clean(submitted?.action||'Grid review updated.',4000)}];
    event(record,context,'Grid Management','Grid review updated; affected crossover checks require review.');
  }else{
    if(body.revision!==record.revision)throw Error('This record changed. Refresh before saving.');
    record.crossover||={reviews:{},interactions:[]};const c=record.crossover;
    if(body.action==='crossover-status'){
      if(!WORK_STATUSES.includes(body.status))throw Error('Choose a valid crossover status.');
      if(body.status==='Approved'&&!submitted(record))throw Error('Approved requires all checks and confirmed Submission.');
      if(submitted(record)&&body.status!=='Approved')throw Error('This job has been submitted. Relevant source changes will reopen it.');
      c.status=body.status;event(record,context,'Job Crossover',`Status changed to ${body.status}.`);
    }else if(body.action==='crossover-prepare-submission'){
      if(!ready(record))throw Error('All seven stages must be checked and approved before Submission.');
      if(submitted(record))throw Error('This job has already been submitted.');
      c.confirmation={token:randomUUID(),stamp:releaseStamp(record),by:context.actor,expiresAt:Date.now()+5*60000};
    }else if(body.action==='crossover-cancel-submission'){
      if(c.confirmation?.token===body.token)delete c.confirmation;
    }else if(body.action==='crossover-submit'){
      const confirm=c.confirmation;
      if(!ready(record))throw Error('All seven stages must still be checked and approved.');
      if(submitted(record))throw Error('This job has already been submitted.');
      if(body.confirmed!==true||!confirm||body.token!==confirm.token||confirm.by!==context.actor||confirm.expiresAt<Date.now()||confirm.stamp!==releaseStamp(record))throw Error('Confirm Are you sure? again for the current checked order.');
      const at=new Date().toISOString(),stamp=releaseStamp(record);
      c.submission={id:randomUUID(),stamp,at,by:context.actor,version:currentOrder(record).version};
      c.submissions||=[];c.submissions.push(structuredClone(c.submission));
      c.release={...c.submission};c.status='Approved';delete c.confirmation;
      c.interactions||=[];
      const name=record.fields['Preferred Name'],sale=record.fields['Sale ID'];
      for(const channel of ['Email','SMS'])if(!c.interactions.some(i=>i.kind!=='submission-reminder'&&i.stamp===stamp&&i.channel===channel&&i.status.startsWith('Queued'))){
        c.interactions.push({id:randomUUID(),kind:'booking-ready',submissionId:c.submission.id,stamp,at,channel,recipient:record.fields[channel==='Email'?'Email 1':'Contact 1']||'',subject:channel==='Email'?'Your order is ready for booking':'',text:channel==='Email'?`Hi ${name},\n\nYour order ${sale} has passed our checks and is ready for booking. Our team will contact you to arrange your installation.\n\nThank you,\nYello Energy Group`:`Hi ${name}, your order ${sale} is ready for booking. Our team will contact you to arrange installation. Yello Energy Group.`,status:'Queued — delivery not connected'});
      }
      event(record,context,'Job Crossover','Submission confirmed YES. Job released to Job Management. Draft Email and SMS queued; delivery is not connected.');
    }else if(body.action==='crossover-save'){
      const key=body.key,data=body.evidence||{};
      if(!['stc','inventory','extras','order'].includes(key))throw Error('Choose a valid evidence section.');
      if(key==='order')c.order={owner:clean(data.owner),dueAt:due(data.dueAt)};
      else if(key==='extras'){
        if(!currentOrder(record))throw Error('Signed order is required.');
        c.extras={items:(currentOrder(record).extras||[]).map((_,i)=>{const v=data.items?.[i]||{};return {organised:v.organised===true,owner:clean(v.owner||''),reference:clean(v.reference||''),completedAt:time(v.completedAt,false),dueAt:due(v.dueAt)};})};
      }else{
        const e={owner:clean(data.owner||''),reference:clean(data.reference||''),completedAt:time(data.completedAt,false),dueAt:due(data.dueAt)};
        if(key==='stc')Object.assign(e,{platform:clean(data.platform||''),creator:clean(data.creator||'')});
        else{
          if(!['Not Ordered','Ordered','Reserved','Prepared'].includes(data.status))throw Error('Select an Inventory status.');
          Object.assign(e,{status:data.status,lines:productLines(record).map(p=>{const v=data.lines?.[p.index]||{},quantity=Number(v.quantity),packed=Number(v.packed);if(!Number.isInteger(quantity)||quantity<0||!Number.isInteger(packed)||packed<0||packed>quantity)throw Error('Inventory quantities must be whole numbers; packed cannot exceed confirmed quantity.');return {matched:v.matched===true,quantity,packed};})});
        }
        c[key]=e;
      }
      event(record,context,'Job Crossover',`${key} evidence saved. Previous verification must match the current evidence.`);
    }else if(body.action==='crossover-check'){
      if(!CHECKS.includes(body.key))throw Error('Choose a valid check.');
      const errors=blockers(record,body.key);if(errors.length)throw Error(errors.join(' '));
      if(!c.order?.owner)throw Error('Assign the responsible Admin in Order Details first.');
      c.reviews[body.key]={stamp:stampFor(record,body.key),at:new Date().toISOString(),by:context.actor};
      event(record,context,'Job Crossover',`${body.key} checked and approved for order version ${currentOrder(record).version}.`);
    }else if(body.action==='crossover-pack'){
      if(blockers(record,'inventory').length)throw Error('Match Inventory to the approved order before preparing a packing slip.');
      if(!productLines(record).every(p=>c.inventory.lines[p.index].packed===p.quantity))throw Error('Confirm every packed quantity before preparing a full-job packing slip.');
      if(c.inventory.status!=='Prepared')throw Error('Inventory must be Prepared before printing a full-job packing slip.');
      c.packingSlip={id:randomUUID(),at:new Date().toISOString(),by:context.actor,version:currentOrder(record).version,stamp:stampFor(record,'inventory'),lines:productLines(record).map(p=>({...p,packed:c.inventory.lines[p.index].packed}))};
      event(record,context,'Inventory','Sample packing slip prepared from confirmed packed quantities.');
    }else throw Error('Unsupported crossover action.');
  }
  reconcileRelease(record,context,event);return record;
}
export function reconcileRelease(record,context,event,now=Date.now()){
  const c=record.crossover;if(!c)return;
  c.interactions||=[];
  if(c.confirmation&&(!ready(record)||c.confirmation.stamp!==releaseStamp(record)))delete c.confirmation;
  if(c.release&&!submitted(record)){
    for(const i of c.interactions)if(i.stamp===c.release.stamp&&i.status.startsWith('Queued'))i.status='Cancelled — readiness changed';
    delete c.release;
    if(c.submission){c.submission.invalidatedAt=new Date().toISOString();const saved=c.submissions?.find(s=>s.id===c.submission.id);if(saved)saved.invalidatedAt=c.submission.invalidatedAt;delete c.submission;}
    c.status='Working On it';
    event(record,context,'Job Crossover','Release withdrawn. Seven current checks and a new YES-confirmed Submission are required before Job Management.');
  }
  const waiting=ready(record)&&!submitted(record),window=c.readyWindow;
  if(waiting&&(!window||window.closedAt||window.stamp!==releaseStamp(record))){
    if(window&&!window.closedAt)closeReminderWindow(record,context,event,now,'Checked order changed');
    const checkedAt=Math.max(...CHECKS.map(key=>Date.parse(c.reviews[key].at)));
    const start=Number.isFinite(checkedAt)?Math.min(now,checkedAt):now;
    c.readyWindow={id:randomUUID(),stamp:releaseStamp(record),readyAt:new Date(start).toISOString(),dueAt:new Date(start+24*3600000).toISOString()};
    event(record,context,'Job Crossover','All checks green. Submit is available; the 24-hour client reminder timer has started.',new Date(now).toISOString());
  }else if(window&&!window.closedAt&&(!waiting||window.stamp!==releaseStamp(record))){
    closeReminderWindow(record,context,event,now,submitted(record)?'Submission confirmed':'Checks require review');
  }
}
function closeReminderWindow(record,context,event,now,reason){
  const c=record.crossover,window=c.readyWindow;if(!window||window.closedAt)return;
  window.closedAt=new Date(now).toISOString();window.closedReason=reason;
  c.readyWindowHistory||=[];c.readyWindowHistory.push(structuredClone(window));
  for(const message of c.interactions)if(message.kind==='submission-reminder'&&message.windowId===window.id&&message.status.startsWith('Queued'))message.status='Cancelled — '+reason.toLowerCase();
  event(record,context,'Job Crossover',`24-hour reminder stopped: ${reason}.`,new Date(now).toISOString());
}
export function processCrossoverReminders(record,context,event,now=Date.now()){
  reconcileRelease(record,context,event,now);
  const c=record.crossover,window=c?.readyWindow;
  if(!window||window.closedAt||window.reminderQueuedAt||!ready(record)||submitted(record)||window.stamp!==releaseStamp(record)||now<Date.parse(window.dueAt))return;
  const at=new Date(now).toISOString(),name=record.fields['Preferred Name'],sale=record.fields['Sale ID'];
  for(const channel of ['Email','SMS']){
    c.interactions.push({id:randomUUID(),kind:'submission-reminder',windowId:window.id,stamp:window.stamp,at,channel,recipient:record.fields[channel==='Email'?'Email 1':'Contact 1']||'',subject:channel==='Email'?'Update on your order':'',text:channel==='Email'?`Hi ${name},\n\nThe checks for your order ${sale} are complete. Your order is awaiting final submission before it can move to booking. Our team will update you once that step is complete.\n\nThank you,\nYello Energy Group`:`Hi ${name}, checks for order ${sale} are complete and it is awaiting final submission before booking. We will update you once complete. Yello Energy Group.`,status:'Queued — delivery not connected'});
  }
  window.reminderQueuedAt=at;
  event(record,context,'Job Crossover','Unsubmitted for 24 hours after all checks turned green. Client Email and SMS reminder queued; delivery not connected.',at);
}
