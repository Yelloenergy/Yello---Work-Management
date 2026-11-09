import { randomUUID } from 'node:crypto';
import {updateCrossover,reconcileRelease} from './crossover-model.mjs';
import { sampleOrders } from '../public/sample-orders.js';
export const PAGES=['Client Details','Project Details','Grid Details','Documents','Products','Price','Outcome','Activity Log'];
export const DOCUMENT_LABELS=['Electricity Bill','Meter Pic','Site Legend','PV Design','Battery Location','Build Plan','Interval Data','Signed Contract','Single Line Diagram (SLD)','Voltage Rise Calculation (VRC)','Identification','Strata Approval','Landlord Approval','Other'];
export const FIELDS={
  'Client Details':['Site Type','Preferred Name','Legal Name','Legal Name Verified','Company Name','Business Name','Industry','Position','ABN','Contact 1','Contact 2','Email 1','Email 2','Location','Suburb','Postcode','Bill Amount'],
  'Project Details':['System Type','Connection Type','Building Type','Strata Managed','Phase Type','Roof Type','Height','Site Visit','Remote Site Visit','Site Visit Notes','Remote Visit Notes'],
  'Grid Details':['NMI','Retailer Name','Grid Provider','Meter Number','Pole Number','Lot/DP Number'],
  'Documents':['Site Instructions / Rep Advice'],
};
export function providerFor(nmi){return nmi.startsWith('431')?'Endeavour':nmi.startsWith('410')?'Ausgrid':/^(400|420)/.test(nmi)?'Essential':null;}
export function validateFields(fields){
  if(!fields['Preferred Name']?.trim())throw Error('Preferred Name is required.');
  if(!['Residential','Commercial'].includes(fields['Site Type']))throw Error('Select a valid Site Type.');
  const nmi=fields.NMI||'';
  if(nmi&&(!/^\d{9,}$/.test(nmi)||/^(\d)\1+$/.test(nmi)))throw Error('NMI must have at least 9 digits and cannot contain only repeated digits.');
  for(const key of ['Bill Amount'])if(fields[key]!==''&&fields[key]!=null&&(!Number.isFinite(Number(fields[key]))||Number(fields[key])<0))throw Error(`${key} must be zero or greater.`);
  if(!Array.isArray(fields['Building Type']))throw Error('Building Type must be a list.');
  if(fields['Building Type'].includes('Torrens Title'))fields['Strata Managed']='Not applicable';
  const provider=providerFor(nmi);if(provider)fields['Grid Provider']=provider;
}
export function canAccess(record,context){return context.role==='management'||(context.role==='rep'&&record.fields['Rep Name']===context.rep);}
export function event(record,context,source,action,now=new Date().toISOString()){
  record.events.push({id:randomUUID(),at:now,person:context.actor,source,action});record.revision++;record.fields['Last Activity']=now;
}
export function finalBalance(price){return (Math.round(Number(price['OFP Balance'])*100)+Math.round(Number(price['Extra Balance'])*100))/100;}
function productsFor(f){
  const products=[];const pv=f['System Type'].includes('PV'),battery=f['System Type'].includes('Battery');
  if(pv)products.push({group:'Panels',fields:{'Panel Brand':f['Panel Brand'],'Panel Model No':f['Panel Model No'],'System Size':f['System Size'],'No Of Panels':f['No Of Panels']}});
  if(battery)products.push({group:'Battery',fields:{'Battery Brand':f['Battery Brand'],'Model No':f['Model No'],'Battery Size':f['Battery Size'],'No Of Battery':f['No Of Battery']}});
  products.push({group:'Inverter 1',fields:{'Inverter 1 Brand':'Sample inverter brand','Inverter Size':f['Inverter Size'],'Inverter Model No':f['Inverter Model No'],'Inverter Type':f['Inverter Type'],'Inverer Phase Type':f['Inverer Phase Type'],'No Of Inverter':'1'}});
  if(pv)products.push({group:'Racking',fields:{'Racking System':'Sample kit','Racking Brand Name':'Sample racking brand','No Of Rails':'Sample quantity','No Of Racking Kits':'Sample quantity'}});
  return products;
}
export function createClients(){
  return sampleOrders.map((order,i)=>{
    const status=['Active Leads','Active Deals','Won','Nurture','Lost'][i%5],suffix=order.fields['Sale ID'].slice(4),signed=status==='Won';
    const fields={...order.fields,'Preferred Name':order.fields['Client Name'],'Legal Name':order.fields['Client Name'],'Legal Name Verified':signed?'Yes':'No','Lead ID':`${status==='Active Leads'?'AL':'DEAL'}-${suffix}`,'Status':status,'Creation Date':`${order.fields['Sales Date']}T09:00:00+11:00`,'Status Update Date':order.fields['Last Update'],'Last Activity':order.fields['Last Update'],'Rep Name':order.fields['Sales Rep'],'Bill Amount':'','Company Name':order.fields['Site Type']==='Commercial'?`Sample Business ${i+1}`:'','Business Name':'','Industry':'Warehouse','Position':'Director','ABN':'','Contact 2':'','Email 2':'','Building Type':[order.fields['Building Type']],'Strata Managed':'Not applicable','Connection Type':'Existing Connect','Site Visit':'Visit Done','Remote Site Visit':[],'NMI':'','Meter Number':'','Pole Number':'','Lot/DP Number':'','Site Instructions / Rep Advice':order.fields['Site Visit Notes'],'Outcome':status==='Won'?'Sale Won':status==='Lost'?'Sale Lost':'In Progress','Signed Contract Status':signed?'Signed':'Not Recorded','Sale Submission Path':signed?'Approved Submission':'Not Submitted'};
    const draft={version:1,systemType:fields['System Type'],products:productsFor(order.fields),price:{'Total Price':14000+i*100,'STC Value':2000,'Discount Applied':250,'Deposit':1000,'OFP Balance':11000+i*100,'Extra Balance':150,'OFP Pay Mode':order.fields['OFP Pay Mode'],'Payment Notes':'Fictional signed payment arrangement'},extras:[{name:'Sample additional cable run',quantity:1,amount:150}],finance:order.fields['OFP Pay Mode']==='Finance'?{'Finance Provider':'Sample provider','Finance Status':'Pending','Application No':'Sample application'}:null};
    return {id:order.id,leadGenerated:true,revision:1,fields,documents:[],draftContract:draft,contracts:signed?[structuredClone(draft)]:[],changes:[],submissionHistory:signed?[{at:fields['Last Activity'],path:'Approved Submission',person:fields['Rep Name']}]:[],events:[{id:randomUUID(),at:fields['Creation Date'],person:'Sample lead source',source:'Lead Management',action:'Sample lead generated; linked client record created.'},{id:randomUUID(),at:fields['Last Activity'],person:fields['Rep Name'],source:signed?'Sales Submission':'Deals',action:signed?'Sample signed order submitted.':'Sample conversation saved; follow-up recorded.'}]};
  });
}
export function project(record,context){
  if(!canAccess(record,context))return null;
  const result=structuredClone(record);delete result.draftContract;
  if(context.role!=='management')result.changes=result.changes.filter(c=>c.status==='Approved');
  if(context.role!=='management'){delete result.crossover;delete result.gridReview;}
  // No direct cost, GP, stock count or internal approval-rule fields are exposed.
  return result;
}
export function updateClient(record,body,context){
  if(!canAccess(record,context))throw Error('Access denied.');
  if(body.action==='save-grid-review'||body.action?.startsWith('crossover-'))return updateCrossover(structuredClone(record),body,context,event);
  if(body.revision!==record.revision)throw Error('This record changed. Refresh it before saving.');
  const draft=structuredClone(record),action=body.action;
  if(action==='save-profile'){
    const allowed=FIELDS[body.page];if(!allowed)throw Error('This page cannot be edited directly.');
    const changes=body.fields||{};
    for(const key of Object.keys(changes))if(!allowed.includes(key))throw Error(`Direct editing of ${key} is not allowed.`);
    if(draft.contracts.length&&Object.hasOwn(changes,'System Type')&&changes['System Type']!==draft.fields['System Type'])throw Error('Signed System Type cannot be edited directly. Use an approved contract change.');
    if(draft.contracts.length&&Object.hasOwn(changes,'Legal Name')&&changes['Legal Name']!==draft.fields['Legal Name'])throw Error('Signed Legal Name cannot be edited directly. Use a controlled contract correction.');
    for(const value of Object.values(changes))if(!(typeof value==='string'&&value.length<=4000)&&!(Array.isArray(value)&&value.length<=20&&value.every(v=>typeof v==='string'&&v.length<=200)))throw Error('Invalid field value.');
    Object.assign(draft.fields,changes);validateFields(draft.fields);
    event(draft,context,'Management',`${body.page} updated. ${Object.keys(changes).join(', ')}.`);
  }else if(action==='add-note'){
    if(!body.note?.trim())throw Error('Enter a note.');
    event(draft,context,'Management',body.note.trim().slice(0,4000));
  }else if(action==='record-signed'){
    if(context.role!=='management')throw Error('Management permission is required.');
    if(draft.contracts.length)throw Error('A signed snapshot already exists. Use a controlled change.');
    if(!draft.documents.some(d=>d.label==='Signed Contract'))throw Error('Attach Signed Contract first.');
    if(draft.fields['Legal Name Verified']!=='Yes'||!draft.fields['Legal Name'])throw Error('Verify Legal Name first.');
    if(draft.fields['System Type']!==draft.draftContract.systemType&&draft.draftContract.systemType)throw Error('System Type differs from the source proposal. Record the matching signed source snapshot first.');
    const snapshot=structuredClone(draft.draftContract);snapshot.client={'Legal Name':draft.fields['Legal Name'],'Preferred Name':draft.fields['Preferred Name']};draft.contracts.push(snapshot);draft.fields['Signed Contract Status']='Signed';
    event(draft,context,'Sales Submission','Sample signed contract recorded; original product and price snapshot locked.');
  }else if(action==='request-change'){
    if(context.role!=='management')throw Error('Management permission is required.');
    if(!draft.contracts.length)throw Error('Signed contract must be recorded first.');
    if(!['product','price'].includes(body.target))throw Error('Choose Product or Price for the change.');
    if(!body.reason?.trim()||!body.value?.trim())throw Error('Proposed value and reason are required.');
    const active=draft.contracts.at(-1);const target=body.target==='price'?active.price:active.products[body.index]?.fields;
    if(!target||!Object.hasOwn(target,body.field))throw Error('Choose a valid signed field.');
    if(body.target==='price'&&typeof target[body.field]==='number'&&(!Number.isFinite(Number(body.value))||Number(body.value)<0))throw Error('Price amounts must be zero or greater.');
    if(body.target!=='price'&&body.field.startsWith('No Of')&&(!Number.isInteger(Number(body.value))||Number(body.value)<=0))throw Error('Product quantities must be positive whole numbers.');
    draft.changes.push({id:randomUUID(),baseVersion:active.version,target:body.target,index:body.index,field:body.field,old:target[body.field],value:typeof target[body.field]==='number'?Number(body.value):body.value.trim(),reason:body.reason.trim(),requestedBy:context.actor,requestedAt:new Date().toISOString(),status:'Pending'});
    event(draft,context,'Approvals',`Change requested for ${body.field}. Original signed value preserved.`);
  }else if(action==='decide-change'){
    if(context.role!=='management')throw Error('Management permission is required.');
    const change=draft.changes.find(c=>c.id===body.changeId);if(!change||change.status!=='Pending')throw Error('No pending change found.');
    if(!['Approved','Rejected'].includes(body.decision))throw Error('Choose Approve or Reject.');
    if(body.decision==='Approved'){
      const current=draft.contracts.at(-1);if(current.version!==change.baseVersion)throw Error('The signed record has a newer version. Submit a fresh request.');
      const next=structuredClone(current);next.version++;next.approvalId=change.id;next.effectiveAt=new Date().toISOString();
      if(change.target==='price')next.price[change.field]=change.value;else next.products[change.index].fields[change.field]=change.value;
      draft.contracts.push(next);
    }
    Object.assign(change,{status:body.decision,decidedBy:context.actor,decidedAt:new Date().toISOString()});
    event(draft,context,'Approvals',`${body.decision}: ${change.field}. ${body.decision==='Approved'?'New controlled version created.':'Signed values unchanged.'}`);
  }else throw Error('Unsupported action.');
  reconcileRelease(draft,context,event);
  return draft;
}
