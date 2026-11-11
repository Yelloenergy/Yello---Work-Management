export function reviewSignature(r){const fields={...r.fields};delete fields['Last Activity'];delete fields['Last Update'];return JSON.stringify({fields,contract:r.contracts.at(-1),documents:r.documents.map(d=>[d.id,d.bytes]),signedEvidence:r.contractEvidence});}
export function activeReview(r){return r.documentReview?.rounds?.at(-1);}
export function reviewItems(r){
  const contract=r.contracts.at(-1),items=[];
  const add=(id,label,group,value,sources,target=null,optional=false)=>items.push({id,label,group,value,sources,target,optional});
  const field=(key,group='order',sources=['Signed Contract'],optional=false)=>add('field-'+key,key,group,r.fields[key],sources,{scope:'field',field:key},optional);
  field('Legal Name','order',['Identification']);field('Location','order',['Identification','Electricity Bill']);
  for(const key of ['Preferred Name','Legal Name','Location','Email 1','Contact 1']){
    if(['Legal Name','Location'].includes(key))add('contract-'+key,key+' · Signed Contract','order',r.fields[key],['Signed Contract'],{scope:'field',field:key});
    else field(key);
  }
  for(const key of ['Email 2','Contact 2','Suburb','Postcode'])if(r.fields[key])field(key);
  if(r.fields['Site Type']==='Commercial')for(const key of ['Company Name','Business Name','Industry','Position','ABN'])field(key,'order',['Signed Contract'],key==='Business Name');
  for(const key of ['Site Type','System Type','Phase Type','Roof Type','Height','Building Type','Strata Managed','Site Instructions / Rep Advice'])field(key,'order',['Signed Contract','Site Legend','PV Design','Strata Approval'],key==='Strata Managed'||key==='Site Instructions / Rep Advice');
  field('NMI','order',['Electricity Bill']);
  (contract?.products||[]).forEach((p,i)=>add('product-'+i,p.group,'products',p.fields,['Signed Contract'],{scope:'product',index:i}));
  for(const key of ['Total Price','STC Value','Discount Applied','Deposit','OFP Balance','Extra Balance','OFP Pay Mode','Payment Notes'])add('price-'+key,key,'pricing',contract?.price?.[key],['Signed Contract'],{scope:'price',field:key},key==='Payment Notes');
  add('final-balance','Final OFP Balance','pricing',contract?.price?((Math.round(contract.price['OFP Balance']*100)+Math.round(contract.price['Extra Balance']*100))/100):null,['Signed Contract']);
  if(contract?.finance)add('finance','Finance Application','pricing',contract.finance,['Signed Contract','Other']);
  (contract?.extras||[]).forEach((e,i)=>add('extra-'+i,e.name,'extras',e,['Signed Contract'],{scope:'extra',index:i}));
  if(!contract?.extras?.length)add('no-extras','No Extras Sold','extras','Confirm no extras in the signed contract',['Signed Contract']);
  add('signed-date','Signed Contract Date','order',contract?.['Signed Contract Date']||r.fields['Signed Contract Date'],['Signed Contract'],{scope:'contractDate',field:'Signed Contract Date'});
  add('signed-status','Signed Contract Status','order',r.fields['Signed Contract Status'],['Signed Contract']);
  add('sale-submission','Sale Submission History','order',r.submissionHistory,['Signed Contract','Other']);
  const required=new Set(['Signed Contract','Identification','Electricity Bill',...r.documents.map(d=>d.label)]);
  for(const label of required)add('file-'+label,label+' · File Check','order',r.documents.filter(d=>d.label===label).map(d=>({name:d.name,type:d.type,bytes:d.bytes})),[label]);
  return items;
}
export function reviewScore(round){
  if(!round)return {score:null,covered:0,total:0,unclassified:0};
  const first=Object.values(round.firstFindings||{}),unclassified=first.filter(v=>v.state==='Needs Fix'&&v.cause==='Unclear').length;
  const considered=first.filter(v=>v.state==='Checked'||(v.state==='Needs Fix'&&v.cause==='Rep Submission'));
  const score=considered.length?Math.round(100*considered.filter(v=>v.state==='Checked').length/considered.length):null;
  return {score:unclassified?null:score,covered:first.length,total:round.items.length,unclassified};
}
export function reviewBlockers(r,group){
  if(!r.reviewRequired&&!r.documentReview)return [];
  const round=activeReview(r);
  if(!round||round.signature!==reviewSignature(r))return ['Start a current source-document review.'];
  const items=round.items.filter(i=>i.group===(group==='inventory'?'products':group));
  if(!round.finalizedAt)return ['Complete and finalise the source-document review first.'];
  if(items.some(i=>!['Checked','Not Applicable'].includes(round.answers[i.id]?.state)))return ['Resolve the source-document issues in this section.'];
  return [];
}
