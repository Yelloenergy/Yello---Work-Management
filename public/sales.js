import {formatCrmDate} from './crm-standards.js';
import { sampleOrders } from './sample-orders.js';
// Explicitly fictional sample orders. Never use them as business records.
export const registerFields = ['Client Name', 'Sale ID', 'System Type', 'Site Type', 'Sales Rep', 'System Size', 'Battery Size', 'Phase Type', 'Site Visit Notes', 'What Happened', 'Sales Date', 'Last Update'];
export const profileSections = {
  'Client Information': ['Site Type', 'Preferred Name', 'Legal Name', 'Company Name', 'Business Name', 'Contact 1', 'Contact 2', 'Email 1', 'Email 2', 'Location', 'Suburb', 'Postcode'],
  'Site Information': ['Building Type', 'Phase Type', 'Roof Type', 'Height', 'Battery Location', 'Site Visit Notes', 'Remote Visit Notes'],
  'Grid Information': ['Grid Connection', 'Retailer Name', 'Grid Provider', 'NMI', 'Meter Number', 'Pole Number'],
  'Product Information': ['System Type', 'System Size', 'No Of Panels', 'Panel Model No', 'Panel Brand', 'Inverter Size', 'Inverter Type', 'No Of Inverter', 'Inverter Model No', 'Inverer Phase Type', 'Battery Size', 'No Of Battery', 'Model No', 'Battery Brand', 'Cabinet Size', 'No Of Cabinet', 'Cabinet Model No', 'Cabinet Brand', 'EV Charger Model No'],
  'Price Information': ['OFP Pay Mode', 'Payment Notes'],
  'Document Information': ['PV Design', 'Meter Pic', 'Site Legend', 'Signed Contract'],
  'Sale Submission Information': ['Sale ID', 'Client ID', 'Deal ID', 'Sales Rep', 'Sales Date']
};
const previewIds = sampleOrders.map(order=>order.id);
const previews = new Map(sampleOrders.map(order=>[order.id,order]));
const state = { preview: true, search: '', scrollLeft: 0, scrollTop: 0, profile: 'Client Information' };
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stamp = value => formatCrmDate(value);
function latest(id) { return previews.get(id)?.events.at(-1); }
function fieldValue(id,field){const event=latest(id);return field==='What Happened'&&event?event.text:field==='Last Update'&&event?event.at:previews.get(id)?.fields[field];}
function values(id, field) {const value=fieldValue(id,field);return value?escape(field==='Last Update'?stamp(value):field==='Sales Date'?formatCrmDate(value):value):'—';}
function contactControls(id){return `<div class="contact-controls">${[['Phone','☎'],['Email','✉'],['SMS','▣'],['WhatsApp','W']].map(([channel,symbol])=>`<a href="#sales-management/${id}" data-contact="${id}" data-channel="${channel}" aria-label="${channel} ${escape(previews.get(id).fields['Client Name'])}" title="${channel}"><span aria-hidden="true">${symbol}</span><span class="visually-hidden">${channel}</span></a>`).join('')}</div>`;}
export function mountSales(panel, route) {
  document.querySelector('.journey').hidden = true;
  document.querySelector('#next-section').hidden = true;
  document.querySelector('main').classList.add('sales-page');
  if(route?.startsWith('preview-') && previews.has(route)) renderOrder(panel,route);
  else renderRegister(panel);
}
function renderRegister(panel) {
  document.querySelector('#page-description').textContent='Current and previous orders. Open an order to see its full details.';
  panel.innerHTML=`<div class="sales-toolbar"><div><h2>Sales Orders</h2><p>0 live orders · <span id="layout-count">Layout preview</span></p></div><div class="sales-tools"><label class="sales-search">Client Name / Sale ID<input id="order-search" type="search" placeholder="Search client name or order number…" value="${escape(state.search)}"></label><button class="sales-button" id="preview-toggle" type="button">${state.preview?'Show Empty Register':'Show Sample Orders'}</button></div></div><div class="sales-preview-banner">Fictional sample orders for review. Names, products, notes and dates are illustrative; no live customer data is connected.</div><div class="sales-scroll-top" tabindex="0" role="region" aria-label="Horizontal register scrollbar"><div></div></div><div class="sales-table-scroll" tabindex="0" role="region" aria-label="Sales order register — 20 rows high, scroll for more"><table class="sales-table"><caption class="visually-hidden">Sales order layout. No live customer data. Twenty rows visible before vertical scrolling.</caption><thead><tr>${registerFields.map(field=>`<th scope="col">${field}${field==='What Happened'?'<small>Latest update notes</small>':''}</th>`).join('')}</tr></thead><tbody></tbody></table></div><div class="sales-register-footer"><span id="register-result" aria-live="polite"></span><span>20 rows down · Scroll across for all selected columns</span></div>`;
  const tableScroll=panel.querySelector('.sales-table-scroll');
  const topScroll=panel.querySelector('.sales-scroll-top');
  const syncSize=()=>topScroll.firstElementChild.style.width=`${panel.querySelector('table').scrollWidth}px`;
  const observer=new ResizeObserver(syncSize); observer.observe(tableScroll);
  // Detach the observer when this register is replaced.
  panel._salesCleanup?.(); panel._salesCleanup=()=>observer.disconnect();
  tableScroll.addEventListener('scroll',()=>{topScroll.scrollLeft=tableScroll.scrollLeft;state.scrollLeft=tableScroll.scrollLeft;state.scrollTop=tableScroll.scrollTop;});
  topScroll.addEventListener('scroll',()=>{tableScroll.scrollLeft=topScroll.scrollLeft;});
  function rows(){
    const query=state.search.toLowerCase().trim();
    const ids=state.preview?previewIds.filter(id=>['Client Name','Sale ID'].some(field=>previews.get(id).fields[field].toLowerCase().includes(query))):[];
    const body=panel.querySelector('tbody');
    body.innerHTML=ids.map(id=>`<tr><td><div class="client-cell"><a href="#sales-management/${id}" class="order-open">${values(id,'Client Name')}</a>${contactControls(id)}</div></td>${registerFields.slice(1).map(field=>`<td><span class="register-value" title="${escape(fieldValue(id,field)||'Not given')}">${values(id,field)}</span></td>`).join('')}</tr>`).join('');
    if(!ids.length) body.innerHTML=`<tr class="register-empty"><td colspan="${registerFields.length}">${state.preview?'No orders match this client name or order number.':'No approved sales orders connected yet.'}</td></tr>`;
    const count=body.querySelectorAll('tr').length;
    for(let i=count;i<20;i++)body.insertAdjacentHTML('beforeend',`<tr class="blank-order-row" aria-hidden="true">${registerFields.map(()=>'<td></td>').join('')}</tr>`);
    panel.querySelector('#register-result').textContent=state.preview?`${ids.length} fictional sample orders · No live orders`:'0 live orders';
    panel.querySelector('#layout-count').textContent=state.preview?'Fictional sample data':'Awaiting Sales CRM connection';
    panel.querySelector('.sales-preview-banner').hidden=!state.preview;
    panel.querySelector('#order-search').disabled=false;
    syncSize();
  }
  rows(); tableScroll.scrollLeft=state.scrollLeft; tableScroll.scrollTop=state.scrollTop;
  panel.querySelector('#order-search').addEventListener('input',event=>{state.search=event.target.value;state.scrollTop=0;rows();tableScroll.scrollTop=0;});
  panel.querySelector('#preview-toggle').addEventListener('click',()=>{state.preview=!state.preview;state.search='';state.scrollTop=0;renderRegister(panel);});
  panel.querySelector('tbody').addEventListener('click',event=>{const contact=event.target.closest('[data-contact]');if(contact){event.preventDefault();showContacts(panel,contact.dataset.contact,contact.dataset.channel);}});
}
function showContacts(panel,id,channel='Phone') {
  const old=panel.querySelector('dialog'); old?.remove();
  const dialog=document.createElement('dialog');dialog.className='contact-dialog';
  dialog.innerHTML=`<form method="dialog"><div class="contact-dialog-heading"><h2>${escape(channel)}</h2><button class="sales-button" value="close" aria-label="Close client details">Close</button></div><p>${values(id,'Client Name')} · ${values(id,'Sale ID')} · Sample only</p><dl><dt>Contact 1</dt><dd>${values(id,'Contact 1')}</dd><dt>Email 1</dt><dd>${values(id,'Email 1')}</dd></dl><p>Fictional contact details. Live ${escape(channel)} links will use the order’s verified contact details; no call or message is sent from this sample.</p></form>`;
  dialog.addEventListener('close',()=>dialog.remove());panel.append(dialog);dialog.showModal();
}
function renderOrder(panel,id) {
  panel._salesCleanup?.(); panel._salesCleanup=null;
  document.querySelector('#page-description').textContent='Full order layout using the Sales CRM Client Profile sections.';
  panel.innerHTML=`<div class="order-topline"><a class="sales-button" href="#sales-management">← Back to Sales Orders</a><span class="not-connected">Layout Preview · ${escape(id)}</span></div><div class="order-summary"><div><span class="eyebrow">FULL ORDER VIEW</span><h2>Order Layout Preview</h2><p>No client or approved Sales Order is connected to this preview.</p></div><div class="order-contact"><button class="sales-button" type="button" data-contact="${id}">Phone</button><button class="sales-button" type="button" data-contact="${id}">Email</button></div></div><div class="order-sections" role="tablist" aria-label="Client Profile sections">${Object.keys(profileSections).map((name,i)=>`<button id="profile-tab-${i}" type="button" role="tab" aria-selected="${name===state.profile}" aria-controls="order-profile-panel" tabindex="${name===state.profile?0:-1}" data-profile="${name}">${name}</button>`).join('')}</div><div id="order-profile-panel" role="tabpanel"></div><section class="order-updates"><div><h2>Updates After Submission</h2><p>Site installation instructions stay with Site Information. Later updates are recorded separately.</p></div><form id="preview-note-form"><label>What Happened<textarea name="note" maxlength="2000" required placeholder="Try an update in this layout preview…"></textarea></label><button class="sales-button primary" type="submit">Add Preview Update</button></form><p class="preview-note">Preview updates stay in this tab’s memory and clear on reload. They do not change the approved Sales Order.</p><div id="preview-update-history" aria-live="polite"></div></section>`;
  const profilePanel=panel.querySelector('#order-profile-panel');
  function profile(){
    const names=Object.keys(profileSections);const index=names.indexOf(state.profile);
    panel.querySelectorAll('[data-profile]').forEach(button=>{button.setAttribute('aria-selected',String(button.dataset.profile===state.profile));button.tabIndex=button.dataset.profile===state.profile?0:-1;});
    profilePanel.setAttribute('aria-labelledby',`profile-tab-${index}`);
    profilePanel.innerHTML=`<h2>${state.profile}</h2><div class="order-field-grid">${profileSections[state.profile].map(field=>`<div class="order-field"><span>${field}</span><strong>${values(id,field)}</strong></div>`).join('')}</div><p class="preview-note">Fictional sample order. Product combinations and document placeholders are illustrative, not verified order or inventory data.</p>`;
  }
  profile();
  const tabs=panel.querySelector('.order-sections');
  tabs.addEventListener('click',event=>{const button=event.target.closest('[data-profile]');if(button){state.profile=button.dataset.profile;profile();}});
  tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const buttons=[...tabs.querySelectorAll('button')];let i=buttons.indexOf(document.activeElement);if(i<0)return;event.preventDefault();i=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;state.profile=buttons[i].dataset.profile;profile();buttons[i].focus();});
  panel.querySelector('.order-summary h2').textContent=previews.get(id).fields['Client Name'];
  panel.querySelector('.order-summary p').textContent=`${previews.get(id).fields['Sale ID']} · Fictional sample order · No live connection`;
  panel.querySelector('.order-contact').innerHTML=contactControls(id);
  panel.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();showContacts(panel,id,button.dataset.channel);}));
  function history(){panel.querySelector('#preview-update-history').innerHTML=[...previews.get(id).events].reverse().map(event=>`<article class="preview-event"><time>${stamp(event.at)} · Preview Update</time><p>${escape(event.text)}</p></article>`).join('')||'<p class="preview-note">No updates in this preview.</p>';}
  history();
  panel.querySelector('#preview-note-form').addEventListener('submit',event=>{event.preventDefault();const text=new FormData(event.currentTarget).get('note').trim();if(!text)return;previews.get(id).events.push({text,at:new Date().toISOString()});event.currentTarget.reset();history();});
}
