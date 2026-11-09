# Mandatory shared CRM display rules

Approved 10 November 2026. Every current and future Work Management page must use `public/crm-standards.js`; do not introduce page-specific date or year ordering.

## Years

Offer years through at least 2030 even when they contain no orders. Among year choices show the current Australia/Sydney year first, completed years newest to oldest next, then future years ascending. Keep All as a separate optional leading filter. Preserve all observed historical years.

Examples:

- In 2026 with records from 2024: 2026, 2025, 2024, 2027, 2028, 2029, 2030.
- From 1 January 2027: 2027, 2026, 2025, 2024, 2028, 2029, 2030.

The shared current-year calculation uses Sydney, including December/January timezone boundaries. Open Sales and Crossover year controls monitor rollover and update within 30 seconds, or on focus. They preserve the user's selected historical filter and avoid rebuilding inside-page forms. After 2030 the current year continues to be available automatically.

## Dates and timestamps

Display timestamps as `23 October 2026 9:30AM`: full month, no comma, uppercase AM/PM with no preceding space. All timestamp displays use Australia/Sydney, including daylight saving. Registers, inside pages, approvals, activity, submission and packing slips share the formatter. True date-only values display `23 October 2026`; do not invent a time. Missing dates stay unrecorded.

Store instants as ISO UTC or explicitly zoned timestamps, not formatted prose. Decision times remain server-assigned. Preserve canonical date field names, meanings and original signed values. Date/time entry uses the existing native browser controls and Sydney conversion helper.

## Crossover squares

Use a solid 22px bright green square, #24E36F, for a current approved inside-page check. Pending and stale checks use neutral squares. Keep readable text and hover details so colour is not the sole signal. No manual front-register toggle exists. The source evidence, contract version, approvals and server validation determine the indicator. Changes invalidate affected checks. Seven green squares do not themselves release a job; confirmed Submission is still required.

## Inside-page templates

Templates exist for Order Details, Grid, STC, Inventory, Pricing, Extras, Submission and Activity Log. They share the client, Sale ID and current approved order. STC and Inventory source integrations and the full extras catalogue remain pending. Do not describe template fields or sample attestations as a live external integration.

Run `node scripts/check-crm-standards.mjs` for rollover, ordering through 2030, long date format, Sydney daylight saving and date-only validation. Crossover tests cover indicator derivation and invalidation from saved evidence.
