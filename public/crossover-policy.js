// Review workflow metadata; Sales CRM field labels inside fields stay unchanged.
export const CHECKS=['order','products','grid','stc','inventory','extras'];
export const CHECK_LABELS={order:'Client Order Checked',products:'Product Changes',grid:'Grid Approved',stc:'STC Created',inventory:'Inventory Ready',extras:'Extras Aligned'};
export function currentOrder(r){return r.contracts.at(-1);}
export function productLines(r){return (currentOrder(r)?.products||[]).map((p,index)=>({index,group:p.group,fields:p.fields,quantity:Number(Object.entries(p.fields).find(([k])=>/^No Of (Panels|Battery|Inverter|Cabinet|Racking Kits)$/.test(k))?.[1])||null}));}
export function evidenceFor(r,key){const c=r.crossover||{};return key==='grid'?r.gridReview:key==='order'?{fields:r.fields,documents:r.documents.map(d=>d.id)}:key==='products'?r.changes:c[key];}
export function stampFor(r,key){
  const fields={...r.fields};delete fields['Last Activity'];delete fields['Last Update'];
  const source=key==='order'?{fields,documents:r.documents.map(d=>d.id),assignment:r.crossover?.order}:evidenceFor(r,key);
  return JSON.stringify({version:currentOrder(r)?.version||0,changes:r.changes.map(c=>[c.id,c.status]),source});
}
export function blockers(r,key){
  if(!currentOrder(r))return ['Signed contract is not recorded.'];
  if(r.changes.some(c=>c.status==='Pending'))return ['Resolve pending order changes first.'];
  const c=r.crossover||{},e=c[key]||{};
  if(key==='order'||key==='products')return [];
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
