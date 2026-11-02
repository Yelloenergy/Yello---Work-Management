// Explicitly fictional review fixtures, never a source of production IDs.
const names = ['Maya Bennett','Oliver Chen','Amelia Singh','Noah Carter','Isla Morgan','Leo Patel','Grace Wilson','Ethan Walker','Zoe Thompson','Lucas Taylor','Ava Martin','Arjun Shah','Ruby Collins','Henry Wright','Chloe Evans','Liam Cooper','Sofia Nguyen','Jack Turner','Ella Murphy','James Parker','Mia Harris','Oscar Lewis','Lily Roberts','Thomas Allen','Harper Scott'];
const siteNotes = ['Side access; keep driveway clear.','Confirm cable route before installation.','Meter board is inside garage.','Call on arrival; gate access required.','Keep equipment clear of side walkway.'];
const updates = ['Client confirmed access arrangements.','Installation instructions updated.','Client requested a morning arrival.','Updated access photo received.','No changes since submission.'];
export const sampleOrders = names.map((name,i)=>{
  const sequence=1245+i, suffix=String(sequence).padStart(6,'0');
  const battery=i%4!==0, pv=i%4!==1;
  return {id:`preview-${String(i+1).padStart(2,'0')}`,events:[],fields:{
    'Client Name':name,'Preferred Name':name,'Legal Name':name,'Sale ID':`YEG-${suffix}`,'Client ID':`CID-${suffix}`,'Deal ID':`DEAL-${suffix}`,
    'System Type':pv?(battery?'PV + Battery':'PV Only'):'Battery Only','Site Type':i%6===0?'Commercial':'Residential','Sales Rep':['Jack','Priya','Alex'][i%3],
    'System Size':pv?['6.6 kW','10.35 kW','13.2 kW'][i%3]:'Not applicable','Battery Size':battery?['16 kWh','24 kWh','32 kWh'][i%3]:'Not applicable',
    'Phase Type':i%3===0?'Three - Phase':'One - Phase','Roof Type':i%2?'Metal':'Tile','Height':i%3===0?'Double':'Single','Building Type':i%6===0?'Warehouse':'Torrens Title',
    'Site Visit Notes':siteNotes[i%5],'Remote Visit Notes':'No remote visit notes in this sample.','What Happened':updates[i%5],
    'Sales Date':`2026-10-${String(5+i).padStart(2,'0')}`,'Last Update':`2026-11-${i%2?'01':'02'}T${String(8+i%8).padStart(2,'0')}:15:00+11:00`,
    'Contact 1':`04XX XXX ${String(i+1).padStart(3,'0')}`,'Email 1':`sample.order${i+1}@example.com`,
    'Location':'Sample site — address not connected','Suburb':['Parramatta','Blacktown','Penrith','Liverpool','Castle Hill'][i%5],'Postcode':['2150','2148','2750','2170','2154'][i%5],
    'Grid Connection':'Existing Connect','Retailer Name':'Sample retailer','Grid Provider':'Sample network','NMI':'Sample only',
    'No Of Panels':pv?[15,23,30][i%3]:'Not applicable','Panel Brand':pv?'Sample panel brand':'Not applicable','Panel Model No':pv?'Sample model — unverified':'Not applicable',
    'Inverter Size':['5 kW','10 kW','10 kW'][i%3],'Inverter Type':battery?'Hybrid':'PV','No Of Inverter':'1','Inverter Model No':'Sample model — unverified','Inverer Phase Type':i%3===0?'Three Phase':'Single Phase',
    'No Of Battery':battery?String(2+i%3):'Not applicable','Model No':battery?'Sample model — unverified':'Not applicable','Battery Brand':battery?'Sample battery brand':'Not applicable',
    'OFP Pay Mode':i%3?'Bank':'Finance','Payment Notes':'Sample only — no payment recorded',
    'PV Design':'Sample attachment placeholder','Meter Pic':'Sample attachment placeholder','Site Legend':'Sample attachment placeholder','Signed Contract':'Sample attachment placeholder — not signed evidence'
  }};
});
sampleOrders.forEach(order=>order.events.push({text:order.fields['What Happened'],at:order.fields['Last Update']}));
