import {randomUUID} from 'node:crypto';
import {activeReview,reviewSignature,reviewItems,reviewScore} from '../public/order-review-policy.js';
import {fromSydney,inputDate} from '../public/grid-model.js';
const text=(v,max=2000)=>{if(typeof v!=='string'||v.length>max)throw Error('Enter a valid text value.');return v.trim();};
export function updateOrderReview(r,b,ctx,event){
  if(ctx.role!=='management')throw Error('Management permission is required.');
  if(b.revision!==r.revision)throw Error('This order changed. Refresh before saving.');
  if(!r.contracts.length)throw Error('Record the signed contract first.');
  const at=new Date().toISOString(),current=r.contracts.at(-1);r.reviewRequired=true;
  r.documentReview||={rounds:[]};let round=activeReview(r);
  if(b.action==='review-start'){
    if(round?.signature===reviewSignature(r))return r;
    round={id:randomUUID(),at,by:ctx.actor,version:current.version,rubricVersion:'equal-weight-v1',signature:reviewSignature(r),baseline:{fields:structuredClone(r.fields),contract:structuredClone(current),documents:structuredClone(r.documents),grid:structuredClone(r.gridReview||null)},rep:r.fields['Rep Name'],items:reviewItems(r),answers:{},firstFindings:{}};
    r.documentReview.rounds.push(round);event(r,ctx,'Document Review',`Review started for approved version ${current.version}. Baseline captured now; historical first-submission accuracy is not inferred.`);
  }else if(b.action==='review-contract-date'){
    const document=r.documents.find(d=>d.id===b.documentId&&d.label==='Signed Contract'&&d.bytes>0);
    if(!document||!validDate(b.date))throw Error('Select the attached signed contract and a valid past Signed Contract Date.');
    if(r.contractEvidence?.version===current.version)throw Error('Signed Contract Date is already recorded. Use a traceable revision to correct it.');
    const existing=current['Signed Contract Date']||r.fields['Signed Contract Date'];if(existing&&existing!==b.date&&inputDate(existing).slice(0,10)!==b.date)throw Error('Signed Contract Date differs from the source order. Use a controlled revision.');
    r.fields['Signed Contract Date']=existing||b.date;r.contractEvidence={version:current.version,documentId:document.id,at,by:ctx.actor};
    document.orderVersion=current.version;
    event(r,ctx,'Document Review',`Signed Contract Date recorded from ${document.name}: ${b.date}. Original contract snapshot preserved.`);
  }else if(b.action==='review-answer'){
    if(!round||round.signature!==reviewSignature(r))throw Error('Start a current review first.');
    if(round.finalizedAt)throw Error('This review is finalised. Start a new review after a source correction.');
    const item=round.items.find(i=>i.id===b.itemId);if(!item)throw Error('Unknown checklist item.');
    if(!['Checked','Needs Fix','Not Applicable'].includes(b.state))throw Error('Choose a check result.');
    const note=text(b.note||''),location=text(b.location||'',200),document=r.documents.find(d=>d.id===b.documentId&&d.bytes>0);
    if(b.state==='Checked'&&(!document||!item.sources.includes(document.label)||!location))throw Error('Attach/select the appropriate source and enter a page or section reference.');
    if(b.state==='Checked'&&document.label==='Signed Contract'&&(r.contractEvidence?.version!==current.version||r.contractEvidence.documentId!==document.id))throw Error('Record Signed Contract Date from the current signed source first, then use that same document for the checks.');
    if(b.state==='Checked'&&(item.value==null||item.value===''||(Array.isArray(item.value)&&!item.value.length)))throw Error('The recorded value is missing. Flag it for correction.');
    if(b.state==='Not Applicable'&&(!item.optional||!note))throw Error('Not Applicable is allowed only for optional items with a reason.');
    if(b.state==='Needs Fix'&&(!note||(item.scored!==false&&!['Rep Submission','Later Change','Review Correction','Unclear'].includes(b.cause))))throw Error('Explain the issue and classify its cause.');
    const answer={state:b.state,note,location,documentId:document?.id||'',cause:b.state==='Needs Fix'?(item.scored===false?'Operational Work':b.cause):'',at,by:ctx.actor};
    round.answers[item.id]=answer;
    if(!round.firstFindings[item.id]||(b.state==='Needs Fix'&&round.firstFindings[item.id].state!=='Needs Fix'))round.firstFindings[item.id]=structuredClone(answer);
    else if(round.firstFindings[item.id].state==='Needs Fix'&&!round.finalizedAt&&b.state==='Needs Fix')round.firstFindings[item.id].cause=answer.cause;
    event(r,ctx,'Document Review',`${item.label}: ${b.state}${answer.cause?' · '+answer.cause:''}. ${note}`);
  }else if(b.action==='review-finalise'){
    if(!round)throw Error('Start a review first.');
    if(round.finalizedAt)throw Error('This review is already finalised.');
    const score=reviewScore(round);
    if(score.covered!==score.total||score.unclassified)throw Error('Assess every item and classify all issues before finalising the score.');
    round.finalizedAt=at;round.finalizedBy=ctx.actor;round.score=score.score;round.scoreBreakdown={...score,repIssues:Object.values(round.firstFindings).filter(v=>v.state==='Needs Fix'&&v.cause==='Rep Submission').length};
    event(r,ctx,'Document Review',`Review finalised. Baseline coaching score: ${score.score==null?'Not rateable':score.score+'/100'}. Equal-weight rubric; later changes and Not Applicable excluded.`);
  }else if(b.action==='review-request-change'){
    if(!round||round.signature!==reviewSignature(r))throw Error('Start a current review first.');
    if(!round.finalizedAt)throw Error('Finalise the baseline assessment before creating a revision proposal.');
    const item=round.items.find(i=>i.id===b.itemId);if(!item?.target)throw Error('This item requires a source document correction, not a direct value edit.');
    const reason=text(b.reason||''),value=text(b.value||'',4000);if(!reason||!value)throw Error('Proposed value and reason are required.');
    const target={...item.target};
    if(target.scope==='product'||target.scope==='extra')target.field=text(b.field||'',100);
    const original=targetValue(r,target);if(original===undefined)throw Error('Choose an existing source field.');
    if(target.scope==='contractDate'&&(!validDate(value)))throw Error('Enter a valid Signed Contract Date.');
    if(r.changes.some(c=>c.target==='review'&&c.status==='Pending'&&c.baseVersion===current.version&&JSON.stringify(c.path)===JSON.stringify(target)))throw Error('A proposal for this field is already pending. Withdraw it before replacing it.');
    let proposed=typeof original==='number'?Number(value):Array.isArray(original)?value.split(',').map(v=>v.trim()).filter(Boolean):value;
    if(typeof original==='number'&&(!Number.isFinite(proposed)||proposed<0))throw Error('Enter a valid non-negative amount.');
    if((target.scope==='product'&&target.field.startsWith('No Of'))||(target.scope==='extra'&&target.field==='quantity')){proposed=Number(value);if(!Number.isInteger(proposed)||proposed<=0)throw Error('Quantity must be a positive whole number.');}
    const change={id:randomUUID(),target:'review',path:target,itemId:item.id,field:target.field,old:structuredClone(original),value:proposed,reason,baseVersion:current.version,fieldStamp:profileStamp(r),roundId:round.id,status:'Pending',requestedBy:ctx.actor,requestedAt:at};
    r.changes.push(change);event(r,ctx,'Approvals',`Contract revision requested for ${item.label}. Signed original unchanged.`);
  }else if(b.action==='review-apply-change'){
    const change=r.changes.find(c=>c.id===b.changeId&&c.target==='review'&&c.status==='Pending');
    if(!change||change.baseVersion!==current.version)throw Error('Revision is missing or stale.');
    const originalRound=r.documentReview.rounds.find(v=>v.id===change.roundId);if(!originalRound?.finalizedAt)throw Error('Finalise the baseline assessment before applying a correction.');
    const source=r.documents.find(d=>d.id===b.documentId&&d.label==='Signed Contract'&&d.bytes>0&&!originalRound.baseline.documents.some(old=>old.id===d.id));
    if(!source||b.acceptanceConfirmed!==true||!text(b.acceptanceReference||''))throw Error('Attach the replacement signed contract and record verified client acceptance before approving the revision.');
    if(!validDate(b.signedDate))throw Error('Record the replacement Signed Contract Date from its source.');
    const batch=r.changes.filter(c=>c.target==='review'&&c.status==='Pending'&&c.baseVersion===current.version);
    if(batch.some(c=>c.fieldStamp!==profileStamp(r)||!r.documentReview.rounds.find(v=>v.id===c.roundId)?.finalizedAt))throw Error('The source profile changed after the proposal. Review and create a current revision.');
    if(batch.some(c=>r.documentReview.rounds.find(v=>v.id===c.roundId).baseline.documents.some(d=>d.id===source.id)))throw Error('Attach the replacement signed contract after preparing all corrections.');
    if(batch.some(c=>c.path.scope==='contractDate'&&c.value!==b.signedDate))throw Error('The accepted Signed Contract Date must match the proposal.');
    const next=structuredClone(current);next.version++;next.approvalId=change.id;next.approvalIds=batch.map(c=>c.id);next.effectiveAt=at;
    for(const edit of batch){
      if(edit.path.scope==='field')r.fields[edit.path.field]=edit.value;
      else if(edit.path.scope==='product')next.products[edit.path.index].fields[edit.path.field]=edit.value;
      else if(edit.path.scope==='price')next.price[edit.path.field]=edit.value;
      else if(edit.path.scope==='extra')next.extras[edit.path.index][edit.path.field]=edit.value;
    }
    next.profile={...r.fields};next.systemType=r.fields['System Type'];next.client={...next.client,'Preferred Name':r.fields['Preferred Name'],'Legal Name':r.fields['Legal Name']};
    next['Signed Contract Date']=b.signedDate;r.fields['Signed Contract Date']=b.signedDate;next.profile={...r.fields};r.contractEvidence={version:next.version,documentId:source.id,at,by:ctx.actor};source.orderVersion=next.version;
    r.contracts.push(next);for(const edit of batch)Object.assign(edit,{status:'Approved',decidedAt:at,decidedBy:ctx.actor,signedDocumentId:source.id,acceptanceReference:b.acceptanceReference});
    event(r,ctx,'Approvals',`Revision approved as order V${next.version}; replacement signed contract and acceptance recorded. Recheck the new version.`);
  }else if(b.action==='review-withdraw-change'){
    const change=r.changes.find(c=>c.id===b.changeId&&c.target==='review'&&c.status==='Pending');const reason=text(b.reason||'');
    if(!change||!reason)throw Error('Choose a pending proposal and explain why it is withdrawn.');
    Object.assign(change,{status:'Rejected',decidedAt:at,decidedBy:ctx.actor,withdrawalReason:reason});event(r,ctx,'Approvals',`Revision proposal withdrawn: ${change.field}. ${reason}`);
  }else if(b.action==='review-share-change'){
    const change=r.changes.find(c=>c.id===b.changeId&&c.target==='review');if(!change)throw Error('Choose a revision.');
    if(change.status==='Rejected')throw Error('Withdrawn proposals cannot be shared.');
    r.revisionShares||=[];
    for(const audience of ['Rep',...(b.includeClient===true?['Client']:[])]){
      if(r.revisionShares.some(s=>s.changeId===change.id&&s.audience===audience))continue;
      r.revisionShares.push({id:randomUUID(),changeId:change.id,audience,recipient:audience==='Client'?r.fields['Email 1']:'',rep:r.fields['Rep Name'],at,by:ctx.actor,status:audience==='Rep'?'Draft — rep recipient required':'Queued — delivery not connected',text:`Order ${r.fields['Sale ID']} revision proposal: ${change.field}: ${JSON.stringify(change.old)} → ${JSON.stringify(change.value)}. Reason: ${change.reason}. This proposal does not replace the signed contract.`});
    }
    event(r,ctx,'Document Review','Revision sharing prepared for rep and selected client. No external message sent.');
  }else throw Error('Unknown review action.');
  return r;
}
function targetValue(r,t){const c=r.contracts.at(-1);if(t.scope==='field')return r.fields[t.field];if(t.scope==='price')return c.price[t.field];if(t.scope==='product')return c.products[t.index]?.fields[t.field];if(t.scope==='extra')return c.extras[t.index]?.[t.field];if(t.scope==='contractDate')return c['Signed Contract Date']||r.fields['Signed Contract Date']||null;}
function profileStamp(r){const fields={...r.fields};delete fields['Last Activity'];delete fields['Last Update'];return JSON.stringify(fields);}

export function validSourceDate(v,now=Date.now()){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v&&Date.parse(fromSydney(v))<=now;}
const validDate=validSourceDate;
