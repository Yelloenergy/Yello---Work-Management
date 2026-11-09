import assert from 'node:assert/strict';
import { sections, centralSections } from '../public/app.js';

assert.deepEqual(sections.map(section => section.title), ['Sales Management', 'Grid Management', 'Job Crossover Check', 'Job Management', 'Project Completion', 'Payment Management', 'Close Job']);
assert.deepEqual(sections.filter(section => section.tabs).map(section => [section.title, section.tabs.map(tab => tab.title)]), [
  ['Grid Management', ['Apply Grid Application', 'Apply Net Meter']],
  ['Job Management', ['Book Jobs with Client', 'Book Job with Electricians and Roofing Team']],
  ['Project Completion', ['Partial Completion', 'Full Completion']],
  ['Payment Management', ['STC Payment', 'OFP Payments']]
]);
assert.equal(new Set(sections.map(section => section.id)).size, sections.length);
assert.deepEqual(centralSections.map(section => section.title), ['Dashboards', 'Reports', 'Activity Logs']);
assert.equal(new Set([...centralSections, ...sections].map(section => section.id)).size, 10);
for (const section of [...centralSections, ...sections]) for (const view of section.tabs || [section]) {
  for (const key of ['label', 'headline', 'detail', 'area', 'empty', 'emptyDetail', 'noteTitle', 'note']) assert.equal(typeof view[key], 'string', `${section.id}: missing ${key}`);
}
console.log('Shell structure verified: 7 job stages, 3 central sections, 8 tabs, complete empty states.');
