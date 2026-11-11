// Review workflow metadata; Sales CRM field labels inside fields stay unchanged.
import {formatCrmDate} from './crm-standards.js';
import {reviewBlockers,activeReview} from './order-review-policy.js';
export const CHECKS=['order','grid','stc','products','inventory','pricing','extras'];
export const CHECK_LABELS={order:'Check Order',grid:'Check Grid',stc:'Check STC',products:'Check Product',inventory:'Check Inventory',pricing:'Pricing Checked',extras:'Extras Checked'};
export const WORK_STATUSES=['Awaiting','Working On it','Need Help','Approved'];
export function submitted(r){return ready(r)&&r.crossover?.submission?.stamp===releaseStamp(r)&&r.crossover?.release?.stamp===releaseStamp(r);}
export function workStatus(r){return submitted(r)?'Approved':['Awaiting','Working On it','Need Help'].includes(r.crossover?.status)?r.crossover.status:Object.keys(r.crossover?.reviews||{}).length?'Working On it':'Awaiting';}
export function dateChecked(r){return Object.values(r.crossover?.reviews||{}).map(v=>v.at).filter(Boolean).sort().at(-1)||'';}
export function formatCheckedAt(value){return formatCrmDate(value,'Not checked');}
export function currentOrder(r){return r.contracts.at(-1);}
export function productLines(r){return (currentOrder(r)?.products||[]).map((p,index)=>({index,group:p.group,fields:p.fields,quantity:Number(Object.entries(p.fields).find(([k])=>/^No Of (Panels|Battery|Inverter|Cabinet|Racking Kits)$/.test(k))?.[1])||null}));}
export function evidenceFor(r,key){const c=r.crossover||{};return key==='grid'?r.gridReview:key==='order'?{fields:r.fields,documents:r.documents.map(d=>d.id)}:key==='products'?r.changes:key==='pricing'?{price:currentOrder(r)?.price,extras:currentOrder(r)?.extras,finance:currentOrder(r)?.finance}:c[key];}
export function stampFor(r,key){
  const fields={...r.fields};delete fields['Last Activity'];delete fields['Last Update'];
  const source=key==='order'?{fields,documents:r.documents.map(d=>d.id),assignment:r.crossover?.order}:evidenceFor(r,key);
  return JSON.stringify({version:currentOrder(r)?.version||0,changes:r.changes.map(c=>[c.id,c.status]),source,documentReview:r.reviewRequired||r.documentReview?activeReview(r):undefined});
}
export function blockers(r,key){
  if(!currentOrder(r))return ['Signed contract is not recorded.'];
  if(r.changes.some(c=>c.status==='Pending'))return ['Resolve pending order changes first.'];
  if(['order','products','pricing','extras','inventory'].includes(key)){const errors=reviewBlockers(r,key);if(errors.length)return errors;}
  const c=r.crossover||{},e=c[key]||{};
  if(key==='order'||key==='products')return [];
  if(key==='pricing'){const p=currentOrder(r).price;return p&&['Total Price','STC Value','Discount Applied','Deposit','OFP Balance','Extra Balance'].every(k=>Number.isFinite(p[k])&&p[k]>=0)?[]:['Signed pricing is incomplete or invalid.'];}
  if(key==='grid'){
    const f=r.gridReview?.fields||{};
    return f['Grid Status']==='Grid Approved'&&f['Approval Number']&&f['Approval Date']?[]:['Grid approval reference and date are required.'];
  }
  const result=[];
  if(key==='extras'){
    const extras=currentOrder(r).extras||[];
    if(extras.some((_,i)=>!e.items?.[i]?.organised||!e.items[i].owner||!e.items[i].reference||!e.items[i].completedAt))result.push('Organise every signed extra and record its owner, completion time and reference.');
    return result;
  }
  if(!e.owner||!e.completedAt||!e.reference)result.push('Record responsible person, completion time and evidence reference.');
  if(key==='stc'&&(!e.platform||!e.creator))result.push('Record platform and creator.');
  if(key==='inventory'){
    if(!['Reserved','Prepared'].includes(e.status))result.push('Ordered alone is not ready. Confirm Reserved or Prepared for this review.');
    for(const p of productLines(r)){
      const line=e.lines?.[p.index];
      if(!p.quantity||!line?.matched||line.quantity!==p.quantity)result.push(`${p.group}: match the current approved quantity and product specification.`);
    }
  }
  return result;
}
export function checkState(r,key){const errors=blockers(r,key),review=r.crossover?.reviews?.[key];return {green:!errors.length&&!!review&&review.stamp===stampFor(r,key),errors,review,stale:!!review&&review.stamp!==stampFor(r,key)};}
export function ready(r){return CHECKS.every(k=>checkState(r,k).green);}
export function releaseStamp(r){return JSON.stringify(CHECKS.map(k=>stampFor(r,k)));}
