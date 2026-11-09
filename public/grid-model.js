export const PROVIDERS = ['Endeavour', 'Ausgrid', 'Essential', 'Other'];
export const STATUSES = ['New Clients', 'Grid Applied', 'Grid Approved', 'Grid - Client Connect', 'Client Paid', 'Meter Applied', 'Meter - Client Connect'];
export const HOUR = 3600000;
export const DAY = 24 * HOUR;
const parts = value => Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
export function inputDate(value){if(!value)return '';const p=parts(value);return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;}
export function fromSydney(value){
  if(!value)return null;
  const wanted=Date.parse(value.length===10?`${value}T00:00:00Z`:`${value}:00Z`);
  if(!Number.isFinite(wanted))throw Error('Invalid date');
  let actual=wanted;
  for(let i=0;i<3;i++){const p=parts(actual);const represented=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);actual+=wanted-represented;}
  const iso=new Date(actual).toISOString();
  if(inputDate(iso)!==(value.length===10?`${value}T00:00`:value))throw Error('This Sydney time does not exist. Choose another time.');
  return iso;
}
export function addCalendarDays(value,days){const p=parts(value);const date=new Date(Date.UTC(+p.year,+p.month-1,+p.day+days));return fromSydney(`${date.toISOString().slice(0,10)}T${p.hour}:${p.minute}`);}
export function statusFor(record){
  const f=record.fields;
  if(f['Meter Applied']==='Meter - Client Connect')return 'Meter - Client Connect';
  if(['Applied','Completed'].includes(f['Meter Applied']))return 'Meter Applied';
  if(f['Payment Done']==='Done')return 'Client Paid';
  if(f['Grid Status']==='Grid - Client Connect')return 'Grid - Client Connect';
  if(f['Grid Status']==='Grid Approved')return 'Grid Approved';
  if(f['Grid Status']==='Grid - Applied')return 'Grid Applied';
  return 'New Clients';
}
export function timing(record,now=Date.now()){
  const f=record.fields;
  const sale=f['Sales Date']?fromSydney(f['Sales Date']):null;
  const gridEnd=f['Approval Date']||null;
  const gridDue=sale?addCalendarDays(sale,10):null;
  const hasProof=f['Payment Done']==='Done'&&record.files.some(file=>file.group==='payment')&&f['Payment Proof Received'];
  const meterDue=hasProof?new Date(Date.parse(f['Payment Proof Received'])+48*HOUR).toISOString():null;
  const escalates=hasProof?new Date(Date.parse(f['Payment Proof Received'])+72*HOUR).toISOString():null;
  const meterEnd=['Applied','Completed'].includes(f['Meter Applied'])?f['Meter Date + Time']:null;
  const meterExempt=f['Meter Applied']==='Not Required';
  return {
    grid:{due:gridDue,end:gridEnd,elapsed:sale?(Date.parse(gridEnd||new Date(now).toISOString())-Date.parse(sale)):null,late:!!(gridDue&&(gridEnd?Date.parse(gridEnd)>Date.parse(gridDue):now>=Date.parse(gridDue)))},
    meter:{due:meterExempt?null:meterDue,escalates:meterExempt?null:escalates,end:meterEnd,exempt:meterExempt,elapsed:f['Install Date']?(Date.parse(meterEnd||new Date(now).toISOString())-Date.parse(f['Install Date'])):null,late:!meterExempt&&!!(meterDue&&(meterEnd?Date.parse(meterEnd)>Date.parse(meterDue):now>=Date.parse(meterDue))),escalated:!meterExempt&&!meterEnd&&!!(escalates&&now>=Date.parse(escalates))}
  };
}
export function validateRecord(record){
  const f=record.fields,errors=[];
  if(['Grid - Applied','Grid Approved'].includes(f['Grid Status'])&&!f['Grid Applied Date'])errors.push('Grid Applied Date is required.');
  if(f['Grid Status']==='Grid Approved'&&(!f['Approval Number']?.trim()||!f['Approval Date']))errors.push('Approval Number and Approval Date are required for Grid Approved.');
  if(f['Approval Date']&&f['Grid Applied Date']&&Date.parse(f['Approval Date'])<Date.parse(f['Grid Applied Date']))errors.push('Approval Date cannot precede Grid Applied Date.');
  if(['Applied','Completed'].includes(f['Meter Applied'])&&!f['Meter Date + Time'])errors.push('Meter Date + Time is required for a submitted application.');
  if(f['Meter Applied']==='Completed'&&!f['Meter Ins Date'])errors.push('Meter Ins Date is required for Completed.');
  if(f['Meter Date + Time']&&f['Meter Ins Date']&&Date.parse(f['Meter Ins Date'])<Date.parse(f['Meter Date + Time']))errors.push('Meter Ins Date cannot precede Meter Date + Time.');
  if(f['Payment Proof Received']&&!record.files.some(file=>file.group==='payment'))errors.push('Attach Payment Proof before recording when it was received.');
  return errors;
}
