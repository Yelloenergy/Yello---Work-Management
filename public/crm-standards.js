// Shared, mandatory display rules for every Work CRM workspace.
export const CRM_TIME_ZONE='Australia/Sydney';
export function crmYear(now=new Date()){return Number(new Intl.DateTimeFormat('en-AU',{timeZone:CRM_TIME_ZONE,year:'numeric'}).format(now));}
export function crmYears(observed=[],now=new Date()){
  const current=crmYear(now),existing=observed.map(Number).filter(y=>Number.isInteger(y)&&y>=1900&&y<=9999);
  const first=Math.min(2026,current,...existing),last=Math.max(2030,current,...existing);
  return [current,...Array.from({length:current-first},(_,i)=>current-1-i),...Array.from({length:last-current},(_,i)=>current+1+i)].map(String);
}
export function watchCrmYear(onChange){
  let year=crmYear();
  const check=()=>{const next=crmYear();if(next!==year){year=next;onChange();}};
  const timer=setInterval(check,30000);window.addEventListener('focus',check);
  return ()=>{clearInterval(timer);window.removeEventListener('focus',check);};
}
export function formatCrmDate(value,missing='Not recorded'){
  if(!value)return missing;
  const onlyDate=/^\d{4}-\d{2}-\d{2}$/.test(value),date=new Date(onlyDate?value+'T00:00:00Z':value);
  if(!Number.isFinite(date.getTime()))return missing;
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-AU',{timeZone:CRM_TIME_ZONE,day:'numeric',month:'long',year:'numeric',...(onlyDate?{}:{hour:'numeric',minute:'2-digit',hour12:true})}).formatToParts(date).map(v=>[v.type,v.value]));
  return `${p.day} ${p.month} ${p.year}${onlyDate?'':` ${p.hour}:${p.minute}${p.dayPeriod.toUpperCase()}`}`;
}
