# Yello Work Management CRM

Local, navigable shell for the post-approval job journey. Prepared on 2 November 2026.

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
3. STC Management — copy-ready details for external STC forms; fields pending.
4. Inventory Management — prefilled materials and Purchase Order preparation; format and source pending.
5. Offload Job — final operational checks before the projects handoff.
6. Job Management — Book Jobs with Client / Book Job with Electricians and Roofing Team.
7. Project Completion — Partial Completion / Full Completion.
8. Payment Management — STC Payment / OFP Payments.
9. Close Job — final handover and documents.

Navigation, deep links, keyboard-accessible tabs and a mobile menu are functional. Empty states deliberately contain no invented records or totals. The journey indicates the selected workspace; it does not imply completed stages or enforce workflow gates.

## Sales Management review flow

The front register is 20 rows high with vertical scrolling, a frozen client column, sticky headings and synchronised top/bottom horizontal scrollbars. Twenty-five explicitly labelled blank layout slots let you test scrolling and opening an order without fabricated customer records. Switch to the empty register with **Show Empty Register**.

Open a layout slot for the Client Profile section layout and separate post-submission notes. Return to the register without losing the preview search or scroll position. Phone/Email controls show that no contact data is connected. Preview notes stay only in the current tab's memory and disappear on reload; these are not business events or a durable audit trail.

See `docs/SALES-FIELD-MAPPING.md` for observed source labels and remaining integration work. The full order layout is a review subset, not the complete production Client Profile payload.

## Visual system

Deep Plum `#291D38`, Petrol `#102F36`, Teal `#087B83`, light neutral content surfaces, Bahnschrift with Segoe UI and Arial fallbacks. Typography and component geometry follow the Sales CRM reference recorded in AGENTS.md.

## Scope

This is a dependency-free HTML/CSS/JavaScript shell, not a choice of final production framework. No live data, authentication, role enforcement, approvals, AI checks, external applications, inventory, Purchase Order generation, bookings or payments are connected. Detailed fields, sources, permissions and workflow requirements will be agreed module by module.

## Checks

```sh
node --check public/app.js
node --check scripts/serve.mjs
node scripts/check-shell.mjs
```
