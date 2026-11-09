import {mountCrossover as mountJobCrossover} from './crossover.js';
import { mountGrid,mountGridActivity } from './grid.js';
import { mountManagement } from './management.js';

export const sections = [
  { id: 'sales-management', title: 'Sales Management', short: 'Sales', icon: 'sales', description: 'Your starting point for sales approved by the Sales Manager and AI.', label: 'APPROVED SALES', headline: 'Ready for the Next Step.', detail: 'Sales arrive here after approval. Your team can then move them through the work management journey.', area: 'Approved Sales', empty: 'No Approved Sales Yet', emptyDetail: 'Approved sales will appear here when the Sales CRM handover is connected.', noteTitle: 'Sales Already Approved', note: 'Sales checking and approval stay with the Sales Manager and AI. There is no second sales approval in this workspace.' },
  { id: 'grid-management', title: 'Grid Management', short: 'Grid', icon: 'grid', description: 'Keep grid applications and net meter applications in one place.', tabs: [
    { id: 'apply-grid-application', title: 'Apply Grid Application', label: 'GRID APPLICATION', headline: 'Prepare the Grid Connection.', detail: 'A dedicated workspace for the job’s grid application.', area: 'Grid Applications', empty: 'No Grid Applications Yet', emptyDetail: 'Application details will be added when the job data and required fields are agreed.', noteTitle: 'Application Workspace', note: 'The application fields, network requirements and submission process will be defined in the next stage.' },
    { id: 'apply-net-meter', title: 'Apply Net Meter', label: 'NET METER APPLICATION', headline: 'Organise the Net Meter.', detail: 'Keep the net meter application alongside the job’s grid information.', area: 'Net Meter Applications', empty: 'No Net Meter Applications Yet', emptyDetail: 'Job-linked net meter applications will appear here.', noteTitle: 'Net Meter Workspace', note: 'The required application details and process will be agreed before this section is connected.' }
  ] },
  { id: 'job-crossover-check', title: 'Job Crossover Check', short: 'Crossover', icon: 'offload', description: 'Confirm Grid, STC and Inventory readiness before releasing a job to Projects.', label: 'CHECK, APPROVE & RELEASE', headline: 'Three Checks. One Handover.', detail: 'Grid approval, Admin’s STC completion and Inventory readiness must all be checked and approved before allocation or installation booking.', area: 'Jobs Awaiting Crossover Check', empty: 'No Jobs Connected Yet', emptyDetail: 'Job-linked completion evidence and approvals will appear here when the source workflows are connected.', noteTitle: 'Release to Projects', note: 'Only an approved crossover releases a job for allocation. Projects then aligns the job with electricians, technicians and the roofing team before organising installation.' },
  { id: 'job-management', title: 'Job Management', short: 'Booking', icon: 'calendar', description: 'Allocate approved jobs to electricians, technicians and roofing teams, then organise installation bookings.', tabs: [
    { id: 'book-jobs-with-client', title: 'Book Jobs with Client', label: 'CLIENT BOOKING', headline: 'Find the Right Date.', detail: 'A dedicated place to organise the installation booking with the client.', area: 'Client Bookings', empty: 'No Client Bookings Yet', emptyDetail: 'Only jobs released by Job Crossover Check can be allocated or booked with the client.', noteTitle: 'Client Booking Workspace', note: 'Booking details and client confirmation steps will be agreed before scheduling is connected.' },
    { id: 'book-job-with-teams', title: 'Book Job with Electricians and Roofing Team', label: 'INSTALLATION TEAM BOOKING', headline: 'Bring the Team Together.', detail: 'Align the approved job with electricians, technicians and the roofing team.', area: 'Electrician & Roofing Team Bookings', empty: 'No Team Bookings Yet', emptyDetail: 'Electrician and roofing team bookings will be organised together in this tab.', noteTitle: 'One Team Booking Workspace', note: 'Crossover approval is required before team allocation or booking. Team availability and assignment details will be agreed with Projects.' }
  ] },
  { id: 'project-completion', title: 'Project Completion', short: 'Completion', icon: 'completion', description: 'Track partial completion and full completion separately.', tabs: [
    { id: 'partial-completion', title: 'Partial Completion', label: 'PARTIAL COMPLETION', headline: 'Keep the Remaining Work Clear.', detail: 'A dedicated workspace for jobs that are partially complete.', area: 'Partially Completed Projects', empty: 'No Partially Completed Projects', emptyDetail: 'Partial completion details will appear here once the completion process is defined.', noteTitle: 'Partial Completion Workspace', note: 'The evidence and remaining-work requirements for partial completion are still to be agreed.' },
    { id: 'full-completion', title: 'Full Completion', label: 'FULL COMPLETION', headline: 'Record the Finished Installation.', detail: 'Bring the job’s full completion information together.', area: 'Fully Completed Projects', empty: 'No Fully Completed Projects', emptyDetail: 'Full completion records will appear here when connected to the job workflow.', noteTitle: 'Full Completion Workspace', note: 'The completion documents, evidence and required checks will be agreed before jobs can be marked fully complete.' }
  ] },
  { id: 'payment-management', title: 'Payment Management', short: 'Payments', icon: 'payment', description: 'Keep STC Payment and OFP Payments in their own workspaces.', tabs: [
    { id: 'stc-payment', title: 'STC Payment', label: 'STC PAYMENT', headline: 'Keep STC Payments in View.', detail: 'A dedicated place for the job’s STC payment information.', area: 'STC Payments', empty: 'No STC Payment Records', emptyDetail: 'Payment records will appear once the payment source and tracking requirements are agreed.', noteTitle: 'STC Payment Workspace', note: 'Payment fields, reconciliation and status rules are pending. No payments are processed by this shell.' },
    { id: 'ofp-payments', title: 'OFP Payments', label: 'OFP PAYMENTS', headline: 'Keep OFP Payments Together.', detail: 'A separate workspace for the job’s OFP payment information.', area: 'OFP Payments', empty: 'No OFP Payment Records', emptyDetail: 'OFP payment records will appear here once the required process is defined.', noteTitle: 'OFP Payment Workspace', note: 'The OFP fields, payment source and tracking requirements will be agreed before this section is connected.' }
  ] },
  { id: 'close-job', title: 'Close Job', short: 'Close Job', icon: 'close', description: 'Bring the final handover and documents together to close the job.', label: 'FINAL HANDOVER', headline: 'Finish with Everything in Place.', detail: 'One place for the final handover and the documents needed to close the job.', area: 'Jobs Ready to Close', empty: 'No Jobs Ready to Close', emptyDetail: 'Jobs will appear here for final handover and document completion.', noteTitle: 'Final Handover & Documents', note: 'The required handover documents and close-job conditions will be agreed before the closing process is enabled.' }
];

export const centralSections = [
  { id: 'dashboards', title: 'Dashboards', icon: 'dashboard', description: 'A central view across the Work Management CRM.', label: 'WORKSPACE OVERVIEW', headline: 'See the Work as a Whole.', detail: 'Bring the progress of jobs, bookings, completion and payments into one view.', area: 'Work Management Dashboards', empty: 'Your Dashboards Start Here', emptyDetail: 'Dashboard measures and views will be agreed as each module is defined. No live figures are connected yet.', noteTitle: 'Across the Whole CRM', note: 'This is the central dashboard workspace. The job stages remain separate from these shared views.' },
  { id: 'reports', title: 'Reports', icon: 'reports', description: 'One reporting workspace across all Work Management sections.', label: 'CENTRAL REPORTING', headline: 'Turn Progress into a Clear Picture.', detail: 'Bring the agreed operational reports together in one place.', area: 'Work Management Reports', empty: 'No Reports Configured Yet', emptyDetail: 'Report contents, filters and export requirements will be agreed as the workflow takes shape.', noteTitle: 'One Place for Reports', note: 'Reports will draw on the agreed CRM records. No figures or report results are generated by this shell.' },
  { id: 'activity-logs', title: 'Activity Logs', icon: 'activity', description: 'A central activity history across the Work Management CRM.', label: 'CENTRAL ACTIVITY HISTORY', headline: 'Keep the Story of Every Job.', detail: 'Bring job activity, updates and handovers together in one central log.', area: 'CRM Activity Logs', empty: 'No Activity Recorded Yet', emptyDetail: 'Activity will appear here when the job workflows are connected. Clicking around this shell does not create business activity records.', noteTitle: 'Central, with Job Context', note: 'The central log is intended to link activity back to its job and originating section. Event details, visibility and recording rules will be agreed before implementation.' }
];

const paths = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="18" width="7" height="3" rx="1"/>',
  reports: '<path d="M5 3h10l4 4v14H5zM14 3v5h5M8 17v-4M12 17v-6M16 17v-3"/>',
  activity: '<path d="M4 5h16M4 12h16M4 19h16"/><circle cx="8" cy="5" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="19" r="2" fill="currentColor"/>',
  sales: '<path d="M4 20V9l8-5 8 5v11H4Z"/><path d="M9 20v-7h6v7M8 9h.01M16 9h.01"/>',
  grid: '<path d="m12 3-5 7h3l-3 11M12 3l5 7h-3l3 11M5 14h14M8 7h8"/>',
  document: '<path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v5h5M8 12h8M8 16h6"/>',
  inventory: '<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5M12 13v9M7 5.8l9 5"/>',
  offload: '<path d="M4 4h10v16H4zM8 8h3M8 12h3M8 16h3M15 12h7m-3-3 3 3-3 3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18m-13 4 3 3 5-5"/>',
  completion: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 3h6v4H9zM8 14l3 3 5-6"/>',
  payment: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7 15h4M16 15h1"/>',
  close: '<path d="M4 8h16v13H4zM3 3h18v5H3zM9 13l2 2 4-4"/>'
};
function icon(name, className = '') { return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`; }
function routeFromHash() {
  let [sectionId, tabId] = location.hash.slice(1).split('/');
  if (['stc-management','inventory-management','offload-job'].includes(sectionId)) { location.replace('#job-crossover-check'); sectionId='job-crossover-check'; }
  const section = [...centralSections, ...sections].find(item => item.id === sectionId) || sections[0];
  const tab = section.tabs?.find(item => item.id === tabId) || section.tabs?.[0];
  return { section, tab };
}
function render() {
  document.querySelector('main').classList.remove('sales-page','grid-page','management-page','crossover-page');
  document.querySelector('#module-panel')._gridCleanup?.();
  document.querySelector('#module-panel')._gridCleanup=null;
  document.querySelector('#module-panel')._gridAbort?.abort();
  document.querySelector('#module-panel')._salesCleanup?.();
  document.querySelector('#module-panel')._salesCleanup=null;
  const { section, tab } = routeFromHash();
  const index = sections.indexOf(section);
  const isCentral = index < 0;
  const number = isCentral ? '↗' : String(index + 1).padStart(2, '0');
  const content = tab || section;
  document.title = `${section.title} | Work Management`;
  const navItem = (item, number) => `<a href="#${item.id}" class="nav-item${item === section ? ' active' : ''}"${item === section ? ' aria-current="page"' : ''}>${icon(item.icon)}<span>${item.title}</span>${number ? `<small>${number}</small>` : ''}</a>`;
  document.querySelector('#workspace-navigation').innerHTML = `<span class="nav-group-label">CENTRAL</span>${centralSections.map(item => navItem(item, '')).join('')}<span class="nav-group-label">JOB WORKFLOW</span>${sections.map((item, i) => navItem(item, String(i + 1).padStart(2, '0'))).join('')}`;
  document.querySelector('#page-eyebrow').textContent = isCentral ? 'CENTRAL / WORK MANAGEMENT' : `${number} / WORK MANAGEMENT`;
  document.querySelector('#page-title').textContent = section.title;
  document.querySelector('#page-description').textContent = section.description;
  document.querySelector('#breadcrumb-current').textContent = section.title;
  document.querySelector('#section-number').textContent = number;
  document.querySelector('#journey-position').textContent = `Stage ${index + 1} of ${sections.length}`;
  document.querySelector('.journey').hidden = isCentral;
  document.querySelector('#journey-steps').innerHTML = sections.map((item, i) => `<a href="#${item.id}" class="journey-step${item === section ? ' current' : ''}"${item === section ? ' aria-current="step"' : ''} aria-label="${i + 1}. ${item.title}"><span>${String(i + 1).padStart(2, '0')}</span><strong>${item.short}</strong></a>`).join('');
  const tabList = document.querySelector('#module-tabs');
  tabList.hidden = !section.tabs;
  tabList.innerHTML = (section.tabs || []).map(item => `<button id="tab-${item.id}" class="module-tab" type="button" role="tab" aria-selected="${item === tab}" aria-controls="module-panel" tabindex="${item === tab ? '0' : '-1'}" data-route="${section.id}/${item.id}">${item.title}</button>`).join('');
  const panel = document.querySelector('#module-panel');
  if (tab) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', `tab-${tab.id}`); } else { panel.removeAttribute('role'); panel.removeAttribute('aria-labelledby'); }
  panel.innerHTML = `<div class="module-banner"><div><span class="banner-label">${content.label}</span><h2>${content.headline}</h2><p>${content.detail}</p></div><div class="banner-icon">${icon(section.icon)}</div></div><div class="section-title"><h2>${content.area}</h2><span class="not-connected">Awaiting Setup</span></div><div class="empty-state"><div class="empty-icon">${icon(section.icon)}</div><h3>${content.empty}</h3><p>${content.emptyDetail}</p></div><aside class="context-note"><span class="note-mark" aria-hidden="true">i</span><div><h3>${content.noteTitle}</h3><p>${content.note}</p></div></aside>`;
  const next = isCentral ? null : sections[index + 1];
  const nextLink = document.querySelector('#next-section');
  nextLink.hidden = !next;
  if (next) { nextLink.href = `#${next.id}`; nextLink.innerHTML = `${next.title} <span aria-hidden="true">→</span>`; }
  // Invalidate any pending management response when navigation changes.
  delete panel.dataset.managementMount;
  delete panel.dataset.gridMount;
  delete panel.dataset.crossoverMount;
  if(section.id==='job-crossover-check') mountJobCrossover(panel,location.hash.slice(1));
  if(section.id==='job-management') panel.insertAdjacentHTML('afterbegin','<p class="crossover-lock" role="status">Crossover approval required · Only released jobs are eligible for allocation. Team assignment and booking are not connected yet.</p>');
  if(section.id==='sales-management') mountManagement(panel,location.hash.slice(1));
  if(section.id==='grid-management') mountGrid(panel,location.hash.slice(1));
  if(section.id==='activity-logs') mountGridActivity(panel);
}

if (typeof document !== 'undefined') {
  render();
  window.addEventListener('hashchange', render);
  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('#main').focus();
  });
  const tabs = document.querySelector('#module-tabs');
  tabs.addEventListener('click', event => { const button = event.target.closest('[data-route]'); if (button) location.hash = button.dataset.route; });
  tabs.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const buttons = [...tabs.querySelectorAll('button')];
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    location.hash = buttons[next].dataset.route;
    // Hash changes rerender the tablist; restore focus after that render.
    setTimeout(() => tabs.querySelector('[aria-selected="true"]')?.focus(), 0);
  });
  document.querySelector('#menu-toggle').addEventListener('click', event => {
    const button = event.currentTarget;
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    document.querySelector('.sidebar').classList.toggle('menu-open', expanded);
  });
}
