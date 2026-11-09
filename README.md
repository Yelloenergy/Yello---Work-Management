# Yello Work Management CRM

Local, navigable shell for the post-approval job journey. Prepared on 2 November 2026.

Updated 9 November 2026 with Grid & Meter review workflows and a Management Sales Record backed by a shared local sample API.

## Run

Node.js 22 or later; no package installation is required.

```sh
node scripts/serve.mjs
```

Open http://127.0.0.1:3114. Set `PORT` to select another port.

## Sections

Central shared workspaces: **Dashboards**, **Reports**, **Activity Logs**. These span the CRM and are not additional job stages. Their detailed contents and data connections are pending.

1. Sales Management — sales already approved by the Sales Manager and AI.
2. Grid Management — Apply Grid Application / Apply Net Meter.
3. Job Crossover Check — confirm Grid approval, Admin's STC completion in Bridgeselect and Inventory readiness; all three require checks and approval before release to Projects.
4. Job Management — allocate released jobs to installation teams; Book Jobs with Client / Book Job with Electricians and Roofing Team, including technicians.
5. Project Completion — Partial Completion / Full Completion.
6. Payment Management — STC Payment / OFP Payments.
7. Close Job — final handover and documents.

Standalone STC and Inventory sections are removed. Old STC, Inventory and Offload links redirect to Job Crossover Check. It has a signed-order register with Year/Status tabs and name/location/phone search; eight detail tabs; seven evidence checks including pricing; packing slips; and a backend Submission gate. All-green enables Submit; only a subsequent Yes confirmation releases the job into Job Management and queues draft Email/SMS. See `docs/JOB-CROSSOVER.md`. External delivery, Inventory source integration and production booking remain unconnected.

Navigation, deep links, keyboard-accessible tabs and a mobile menu are functional. Empty states deliberately contain no invented records or totals. The journey indicates the selected workspace; it does not imply completed stages or enforce workflow gates.

## Grid & Meter review

Open `/#grid-management` for the searchable provider/status register. Open a client for Grid Approval, Net Meter Application and Payment Done. Details and attachment metadata now persist to the shared local client API; uploaded file contents remain in browser IndexedDB. Alerts refresh while the page is open. The 10-day grid target uses Sydney calendar days; the meter target uses 48 elapsed hours after confirmed payment proof, with escalation at 72 hours. These are the first-build assumptions awaiting the owner's combined review.

## Management Sales Record

Open `/#sales-management`. The eight record pages are Client Details, Project Details, Grid Details, Documents, Products, Price, Outcome and Activity Log. The register supports name/phone/address/suburb search, status and won-year filters and 20 records per page. Clients are seeded from sample leads and cannot be created from this page.

The server stores shared sample clients, immutable signed originals, approved versions, decision events and document bytes under ignored `output/client-review/`. Both `/api/clients` and the scoped read-only `/api/rep-clients` projection read those same records. Direct product/price writes, out-of-scope rep reads, stale revisions and edits to existing activity entries are rejected. A document is Uploaded only after its bytes and metadata save successfully.

The server's review context is configured with `WORK_CRM_REVIEW_ROLE`, `WORK_CRM_REVIEW_REP` and `WORK_CRM_REVIEW_ACTOR`; browser payloads cannot choose a role. This adapter is **not production authentication**. Production sign-in, the real Sales CRM shared database, live stock and external provider submissions/notifications remain unconnected. Never put real client data into the public repository or use review-role configuration as a production login system.

## Visual system

Deep Plum `#291D38`, Petrol `#102F36`, Teal `#087B83`, light neutral content surfaces, Bahnschrift with Segoe UI and Arial fallbacks. Typography and component geometry follow the Sales CRM reference recorded in AGENTS.md.

## Scope

This is a dependency-free HTML/CSS/JavaScript review application with a local Node API, not the final production framework or live Sales CRM integration. The shared backend, review-role policy, controlled sample approval versions and file evidence are implemented for review. Production identity, external applications, live inventory, Purchase Order generation, bookings and payment processing remain unconnected. `public/sales.js` is the superseded early layout; the active Management register uses `public/management.js` and the shared API.

## Checks

```sh
node --check public/app.js
node --check scripts/serve.mjs
node scripts/check-shell.mjs
node scripts/check-grid.mjs
node scripts/check-management.mjs
node scripts/check-crossover.mjs
node scripts/check-client-api.mjs
```
