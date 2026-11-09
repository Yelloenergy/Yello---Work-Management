import { sampleOrders } from './sample-orders.js';
import { DAY,HOUR,fromSydney,PROVIDERS,addCalendarDays } from './grid-model.js';
export function createGridSamples(now=Date.now()){
  return sampleOrders.map((order,i)=>{
    const stage=i%7, sale=fromSydney(order.fields['Sales Date']);
    const approvalCandidate=stage>=2?addCalendarDays(sale,i%3===0?12:6):null;
    const approval=approvalCandidate?new Date(Math.min(Date.parse(approvalCandidate),now-4*HOUR)).toISOString():null;
    const paid=stage>=4;
    const proof=paid?new Date(now-(stage===5?80:[20,50,80,30,96][i%5])*HOUR).toISOString():null;
    const applied=stage===5?new Date(Date.parse(proof)+(i%2?24:60)*HOUR).toISOString():null;
    const install=paid?new Date(now-(4+i%4)*DAY).toISOString():null;
    const fields={...order.fields,
      'Grid Provider':PROVIDERS[i%4], 'NMI':`SAMPLE-${['431','410','400','999'][i%4]}-${String(i+1).padStart(6,'0')}`,
      'Location':`Sample site ${i+1}, ${order.fields['Suburb']}`, 'Grid Status':stage===0?'Grid Waiting':stage===1?'Grid - Applied':stage===3?'Grid - Client Connect':'Grid Approved',
      'Grid Applied Date':stage?addCalendarDays(sale,2):null,'Approval Number':approval?`SAMPLE-APP-${1245+i}`:'','Approval Date':approval,
      'Meter Applied':stage===5?'Applied':stage===6?'Meter - Client Connect':'Waiting','Meter Date + Time':applied,'Meter Ins Date':null,
      'Payment Done':paid?'Done':'Pending','Payment Proof Received':proof,'Install Date':install,'Creation Date':sale,
      'Last Update':paid?proof:approval||sale,'Year':'2026','Creation Log':'Sample creation event','Sales Prospect Details':order.fields['Sale ID'],'link to Client Projectline':order.fields['Sale ID']
    };
    const files=[];
    if(approval)files.push({id:`sample-grid-${i}`,name:'Sample grid approval.txt',group:'grid',sample:true});
    if(paid)files.push({id:`sample-proof-${i}`,name:'Sample payment proof.txt',group:'payment',sample:true});
    return {id:order.id,fields,files,events:[{at:sale,action:'Sample order received from Sales CRM',person:'Sample system'}]};
  });
}
