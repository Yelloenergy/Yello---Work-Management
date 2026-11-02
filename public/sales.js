// Layout-only records. Never use these placeholders as business orders.
export const registerFields = ['Client Name', 'System Type', 'Site Type', 'Sales Rep', 'System Size', 'Battery Size', 'Phase Type', 'Site Visit Notes', 'What Happened', 'Sales Date', 'Last Update'];
export const profileSections = {
  'Client Information': ['Site Type', 'Preferred Name', 'Legal Name', 'Company Name', 'Business Name', 'Contact 1', 'Contact 2', 'Email 1', 'Email 2', 'Location', 'Suburb', 'Postcode'],
  'Site Information': ['Building Type', 'Phase Type', 'Roof Type', 'Height', 'Battery Location', 'Site Visit Notes', 'Remote Visit Notes'],
  'Grid Information': ['Grid Connection', 'Retailer Name', 'Grid Provider', 'NMI', 'Meter Number', 'Pole Number'],
  'Product Information': ['System Type', 'System Size', 'No Of Panels', 'Panel Model No', 'Panel Brand', 'Inverter Size', 'Inverter Type', 'No Of Inverter', 'Inverter Model No', 'Inverer Phase Type', 'Battery Size', 'No Of Battery', 'Model No', 'Battery Brand', 'Cabinet Size', 'No Of Cabinet', 'Cabinet Model No', 'Cabinet Brand', 'EV Charger Model No'],
  'Price Information': ['OFP Pay Mode', 'Payment Notes'],
  'Document Information': ['PV Design', 'Meter Pic', 'Site Legend', 'Signed Contract'],
  'Sale Submission Information': ['Sales Rep', 'Sales Date']
};
const previewIds = Array.from({length:25}, (_, i) => `preview-${String(i + 1).padStart(2, '0')}`);
const previews = new Map(previewIds.map(id => [id, { events: [] }]));
const state = { preview: true, search: '', scrollLeft: 0, scrollTop: 0, profile: 'Client Information' };
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stamp = value => new Intl.DateTimeFormat('en-AU', {dateStyle:'medium',timeStyle:'short',timeZone:'Australia/Sydney'}).format(new Date(value));
function latest(id) { return previews.get(id)?.events.at(-1); }
function values(id, field) { const event=latest(id); return field==='What Happened' && event ? escape(event.text) : field==='Last Update' && event ? stamp(event.at) : '—'; }
export function mountSales(panel, route) {
  document.querySelector('.journey').hidden = true;
  document.querySelector('#next-section').hidden = true;
  document.querySelector('main').classList.add('sales-page');
  if(route?.startsWith('preview-') && previews.has(route)) renderOrder(panel,route);
  else renderRegister(panel);
}
function renderRegister(panel) {
  document.querySelector('#page-description').textContent='Current and previous orders. Open an order to see its full details.';
  panel.innerHTML=`<div class="sales-toolbar"><div><h2>Sales Orders</h2><p>0 live orders · <span id="layout-count">Layout preview</span></p></div><div class="sales-tools"><label class="sales-search">Find a Preview<input id="order-search" type="search" placeholder="Search preview number…" value="${escape(state.search)}"></label><button class="sales-button" id="preview-toggle" type="button">${state.preview?'Show Empty Register':'Show Layout Preview'}</button></div></div><div class="sales-preview-banner">Layout preview only. Blank rows are not customer orders. Open a preview to inspect the full order layout.</div><div class="sales-scroll-top" tabindex="0" role="region" aria-label="Horizontal register scrollbar"><div></div></div><div class="sales-table-scroll" tabindex="0" role="region" aria-label="Sales order register — 20 rows high, scroll for more"><table class="sales-table"><caption class="visually-hidden">Sales order layout. No live customer data. Twenty rows visible before vertical scrolling.</caption><thead><tr>${registerFields.map(field=>`<th scope="col">${field}${field==='What Happened'?'<small>Latest update notes</small>':''}</th>`).join('')}</tr></thead><tbody></tbody></table></div><div class="sales-register-footer"><span id="register-result" aria-live="polite"></span><span>20 rows down · Scroll across for all selected columns</span></div>`;
  const tableScroll=panel.querySelector('.sales-table-scroll');
  const topScroll=panel.querySelector('.sales-scroll-top');
  const syncSize=()=>topScroll.firstElementChild.style.width=`${panel.querySelector('table').scrollWidth}px`;
  const observer=new ResizeObserver(syncSize); observer.observe(tableScroll);
  // Detach the observer when this register is replaced.
  panel._salesCleanup?.(); panel._salesCleanup=()=>observer.disconnect();
  tableScroll.addEventListener('scroll',()=>{topScroll.scrollLeft=tableScroll.scrollLeft;state.scrollLeft=tableScroll.scrollLeft;state.scrollTop=tableScroll.scrollTop;});
  topScroll.addEventListener('scroll',()=>{tableScroll.scrollLeft=topScroll.scrollLeft;});
  function rows(){
    const ids=state.preview?previewIds.filter(id=>id.includes(state.search.toLowerCase().trim())):[];
    const body=panel.querySelector('tbody');
    body.innerHTML=ids.map(id=>`<tr><td><a href="#sales-management/${id}" class="order-open">Open ${id.replace('preview-','Preview ')} <span aria-hidden="true">↗</span></a><div class="contact-controls"><button type="button" data-contact="${id}" aria-label="Phone for ${id}">Phone</button><button type="button" data-contact="${id}" aria-label="Email for ${id}">Email</button></div></td>${registerFields.slice(1).map(field=>`<td><span class="register-value" title="${escape(field==='What Happened'?(latest(id)?.text||'No update'):field)}">${values(id,field)}</span></td>`).join('')}</tr>`).join('');
    if(!ids.length) body.innerHTML=`<tr class="register-empty"><td colspan="${registerFields.length}">${state.preview?'No previews match this search.':'No approved sales orders connected yet.'}</td></tr>`;
    const count=body.querySelectorAll('tr').length;
    for(let i=count;i<20;i++)body.insertAdjacentHTML('beforeend',`<tr class="blank-order-row" aria-hidden="true">${registerFields.map(()=>'<td></td>').join('')}</tr>`);
    panel.querySelector('#register-result').textContent=state.preview?`${ids.length} layout previews · No live orders`:'0 live orders';
    panel.querySelector('#layout-count').textContent=state.preview?'Layout preview':'Awaiting Sales CRM connection';
    panel.querySelector('.sales-preview-banner').hidden=!state.preview;
    panel.querySelector('#order-search').disabled=!state.preview;
    syncSize();
  }
  rows(); tableScroll.scrollLeft=state.scrollLeft; tableScroll.scrollTop=state.scrollTop;
  panel.querySelector('#order-search').addEventListener('input',event=>{state.search=event.target.value;state.scrollTop=0;rows();tableScroll.scrollTop=0;});
  panel.querySelector('#preview-toggle').addEventListener('click',()=>{state.preview=!state.preview;state.search='';state.scrollTop=0;renderRegister(panel);});
  panel.querySelector('tbody').addEventListener('click',event=>{const contact=event.target.closest('[data-contact]');if(contact)showContacts(panel,contact.dataset.contact);});
}
function showContacts(panel,id) {
  const old=panel.querySelector('dialog'); old?.remove();
  const dialog=document.createElement('dialog');dialog.className='contact-dialog';
  dialog.innerHTML=`<form method="dialog"><div class="contact-dialog-heading"><h2>Client Details</h2><button class="sales-button" value="close" aria-label="Close client details">Close</button></div><p>${escape(id)} · No client data connected</p><dl><dt>Contact 1</dt><dd>Not connected</dd><dt>Email 1</dt><dd>Not connected</dd></dl></form>`;
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
    profilePanel.innerHTML=`<h2>${state.profile}</h2><div class="order-field-grid">${profileSections[state.profile].map(field=>`<div class="order-field"><span>${field}</span><strong>—</strong></div>`).join('')}</div><p class="preview-note">Read-only order layout. Fields will populate from the matching approved order; blank values are not zero or confirmed.</p>`;
  }
  profile();
  const tabs=panel.querySelector('.order-sections');
  tabs.addEventListener('click',event=>{const button=event.target.closest('[data-profile]');if(button){state.profile=button.dataset.profile;profile();}});
  tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const buttons=[...tabs.querySelectorAll('button')];let i=buttons.indexOf(document.activeElement);if(i<0)return;event.preventDefault();i=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;state.profile=buttons[i].dataset.profile;profile();buttons[i].focus();});
  panel.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>showContacts(panel,id)));
  function history(){panel.querySelector('#preview-update-history').innerHTML=[...previews.get(id).events].reverse().map(event=>`<article class="preview-event"><time>${stamp(event.at)} · Preview Update</time><p>${escape(event.text)}</p></article>`).join('')||'<p class="preview-note">No updates in this preview.</p>';}
  history();
  panel.querySelector('#preview-note-form').addEventListener('submit',event=>{event.preventDefault();const text=new FormData(event.currentTarget).get('note').trim();if(!text)return;previews.get(id).events.push({text,at:new Date().toISOString()});event.currentTarget.reset();history();});
}
