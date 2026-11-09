# Work Management CRM

## Current scope

- On 2 November 2026 the owner asked to review the existing Sales CRM visual structure as the reference for Work Management. Further project instructions will follow.
- Approved Work Management palette: Deep Plum #291D38 for navigation and headings; Petrol #102F36 for feature panels; Teal #087B83 for primary actions and selected controls; light neutral content surfaces. Do not use violet as a competing action colour.
- Use the Sales typography, hierarchy, spacing and component conventions as the working reference.
- The owner has authorised a local navigable shell and a new GitHub repository. Build the shell first; detailed fields, workflow gates, permissions and integrations will follow.

## Approved shell structure

### Superseding crossover decision — 9 November 2026

- Remove standalone STC Management and Inventory Management from Work CRM. Replace Offload Job with **Job Crossover Check**, after Grid Management and before Job Management. Earlier module descriptions below are historical where they conflict with this decision.
- Admin completes STC work in Bridgeselect. Work CRM confirms completion, time, platform and creator, then records the checker, approval decision, approver and time. Do not rebuild the external STC workflow here.
- Inventory remains owned by its source system. Show its ordered/reserved/prepared information and confirm readiness; exact qualifying Inventory statuses and source mappings remain to be agreed. Do not treat Ordered alone as installation-ready.
- Grid, STC and Inventory must all be completed, checked and approved for the same job/current approved version before release to Projects. Missing evidence or pending/rejected approval blocks allocation and installation booking. Relevant changes must invalidate affected readiness and require rechecking.
- After release, Projects aligns jobs with electricians and technicians (and the existing roofing team) for installation allocation and booking. Keep the existing team booking tab together.
- The shell now shows three source-check cards and locked release/booking empty states. No source completion or approval is fabricated. Production gates must be enforced by the shared backend when allocation/booking workflows are built; disabled controls alone are insufficient.

Keep the following order and labels. Item 2 in the owner's list was a rule, not a separate module.

1. Sales Management: incoming sales have already been checked and approved by the Sales Manager and AI. Do not add another sales-check or sales-approval step here.
2. Grid Management: Apply Grid Application; Apply Net Meter.
3. STC Management: agreed fields will provide accurate text to copy and paste into STC forms on external websites. Fields are pending; do not invent compliance values or submit externally.
4. Inventory Management: prefilled data and Purchase Order generation are intended; source data, PO fields and generation rules are pending.
5. Offload Job: final checks before handing the job to projects to book and organise installation. Detailed checks remain pending.
6. Job Management: Book Jobs with Client; Book Job with Electricians and Roofing Team. Keep electricians and roofing together in the second tab.
7. Project Completion: Partial Completion; Full Completion.
8. Payment Management: STC Payment; OFP Payments. Preserve OFP wording without guessing its meaning.
9. Close Job: final handover and documents; detailed requirements pending.

- Use honest empty states and no fabricated client records, approvals, inventory or payment totals.
- Shell navigation and tabs may work locally. Do not imply live Sales CRM, network, STC, inventory, booking, payment or AI integrations.
- Further modules can be added later at the owner's direction.
- The owner also approved central Dashboards, Reports and Activity Logs. Show these as shared workspaces, separate from the numbered nine-stage job journey. Detailed metrics, reporting and activity-event rules remain pending.

## Sales Management — agreed order views

- The owner approved exactly two order views: a compact front register with basic information, and a full order view opened from the register. Do not add an expanded wide-table view.
- Reuse the Sales CRM Client Profile's approved field names and structure for the full order view, populated from the same approved Sales Order and its associated client/site information. Verify the actual source structure before implementation; do not recreate it from memory.
- Preserve the source order identity and approved version. Do not substitute a client's latest profile values for historical signed-order values or merge multiple orders belonging to the same client.
- The owner requested the front register in this order: Name; System Type; Site Type; Sales Rep; PV Size; Battery Size if given; Phase; Roof Site Notes; Last Notes; Sales Date; last Update. Preserve this requested information and order while verifying the exact source labels before implementation.
- Also provide the compact phone/email-style controls used in Sales CRM. Do not introduce duplicate contact data or invent communication events when controls are used.
- Source inspection of Sales CRM Client Profile found `Client Name`, `System Type`, `Site Type`, `System Size`, `Battery Size`, `Phase Type`, `Roof Type`, `Site Visit Notes` / `Remote Visit Notes`, `Contact 1` and `Email 1`. These are observed source labels, not permission to rename them. The master workbook still needs verification.
- Exact mappings for Sales Rep, Last Notes, Sales Date and last Update remain to be verified. Do not equate Sales Date with Signed Contract Date or last Update with Last Activity without agreement on their meanings.
- The owner clarified that site installation notes and the latest notes about changes after submission are two separate kinds of information. Keep both distinct; retain the original approved order and the history of subsequent updates. The earlier clarification question about `Roof Site Notes` is resolved by this distinction; do not infer an extra Roof Type column from that phrase.
- The owner subsequently authorised creating a genuinely missing field without a separate naming approval: their spoken column names describe the intended information, not replacement labels. First check Sales CRM for an equivalent by meaning and reuse its exact canonical name. Only create a new field when no equivalent exists, record why it is new and how it maps into the order workflow, and avoid duplicate fields. This supersedes earlier requirements to seek approval for each missing field within the agreed Sales Management scope.
- This decision approves the view approach. Live data integration, field selection and implementation details remain pending.
- The owner authorised building the register/full-order flow with a 20-row-high scroll area. The implemented review has 25 explicitly labelled blank layout slots for scroll/open testing and an empty-register toggle; none are business records. Keep preview notes memory-only and separate from live activity.
- The owner subsequently requested prefilled sample data, thinner Sales CRM-style rows, Phone/Email/SMS/WhatsApp shortcuts, Client Name search and an order number retaining the existing sequence. Replace the blank slots with 25 clearly labelled fictional sample orders for this authorised review; never treat them as live orders. Rows are now 34px high within the same 20-row scroll area.
- Verified Sales CRM identity rule: use `Sale ID` with prefix `YEG` and the same fixed six-digit sequence shared by `Client ID` (`CID`) and `Deal ID` (`DEAL`). Do not create a separate Order Number field or independent production sequence. Sample YEG/CID/DEAL identifiers are illustrative only; production numbers must come from Sales CRM/server.
- Search matches Client Name or Sale ID. Contact shortcuts expose the four channels but only show sample contact information while fictional fixtures are loaded; never initiate communication to invented contacts.
- Field decisions and remaining source verification are documented in `docs/SALES-FIELD-MAPPING.md`. The current full-order layout is a review subset; do not describe it as a complete live Client Profile integration.

## Next approved builds — 9 November 2026

- Complete Grid & Meter first, using `docs/GRID-MANAGEMENT.md`. The owner asked to build first and review corrections together. Current timing assumptions are 10 Sydney calendar days, meter submission within 48h of confirmed payment proof, escalation at 72h.
- Then implement the Management Sales Record specification in `docs/MANAGEMENT-SALES-RECORD.md`, preserving its exact page order, shared identity, document evidence, signed locks, controlled changes and read-only activity history. Keep the approved Work Management skin.

## Inventory Control — rules of engagement

- The owner requests brainstorming a complete Inventory system first. Do not implement Inventory workflows or add fields before the discussion and approval.
- Strictly preserve Sales CRM column and field names exactly, including spelling, case and meaning. Do not introduce renamed aliases, replacement labels, duplicated names for the same data, or silently corrected names in Work Management.
- Read and verify the current Sales CRM source fields before proposing Inventory fields. The Sales CRM instructions identify `Yello Sales CRM-Final/SALES CRM - Building/Sales CRM V1 - Master File.xlsm`, especially `Final Draft`, as the canonical field/column reference. Its current contents have not yet been reviewed for this Inventory discussion.
- If a field is needed and no approved Sales CRM equivalent exists, the owner permits a genuinely new field after checking the source. Record the gap and new field explicitly; never guess a source label or invent a second name for an existing field. This does not authorise unrequested Inventory workflows or expansion beyond the agreed scope.
- The Sales Order is the intended source for prefilling most Inventory locations. Data flow and field mapping are critical requirements. No live integration is implemented yet.
- Keep each transferred value traceable to its exact Sales CRM field, source record and approved order version. Reuse existing source identifiers; do not match orders by customer name alone or re-key shared data.
- Sales CRM already records that the signed-contract Product Information is the order payload. Preserve its exact products, specifications, model numbers, quantities and repeated product lines. Do not replace a signed order snapshot with current catalogue values.
- Verify controlled product/SKU mappings before stock allocation or purchasing. Missing, conflicting or ambiguous identifiers must prevent automated purchasing decisions and be flagged for resolution.
- Preserve the Sales CRM's controlled corrections process for submitted orders. Do not silently overwrite order changes in Inventory; reconcile the approved version and retain history.
- Inventory movements, allocations, receipts, dispatch and purchasing rules remain to be brainstormed and approved; do not claim they are already connected or enforced.

## Sales CRM design reference

Source workspace: `C:/Users/vick/.codex/.chatgpt-projects/g-p-6aae4bf856c48191a530aec21a13ddfb`.
Reviewed `AGENTS.md` (Product and UX rules), `app/app/formatting-standard/page.tsx`, and `app/components/crm-sidebar-nav.tsx`.

- Approved font direction: Bahnschrift-led, with practical system-font fallbacks; consistent headings, body, labels, inputs, dropdowns and figures.
- Formatting standard (desktop / mobile, in px): display 52 / 38, page heading 36 / 30, section heading 24 / 22, card heading 18 / 18, menu and body 14 / 14, field label 11 / 11.
- Weights: headings 700; card headings and labels 650; menu/body 500–600.
- Headings must be at least as large and visually strong as the content they introduce.
- Controls and primary buttons: 48 px high; control corners 10 px; card corners 16 px.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px. Inside controls 8–16 px, inside cards 16–24 px, between major sections 32–64 px.
- Responsive standard: desktop 12 columns, maximum content width 1440 px, 24 px gaps; tablet 6 columns; mobile single column, 16 px edges and full-width controls.
- Navigation pattern: left sidebar, grouped collapsible sections, clear active state, pinned role views; consistent content areas with headings, cards, forms and tables. Work Management navigation contents are pending.
- Sales foundations: deep midnight/carbon and navy blue; gold for primary decisions and next actions; restrained semantic colours for outcomes and blockers.
- Sales exact semantic tokens: Blood Red #AA1624, Navy Green #10786A, Burnt Orange #E86C20, Yello Gold #FFD05A. These are reference values, not the new Work Management palette.
- Keep one foundation family and one primary decision colour; use status colours only for their assigned meaning.
- Use clear, direct language, short title-case headings and calls to action, and sentence case for supporting copy. Keep implementation and source-workbook details out of product flows.
- Validate contrast, hierarchy, clipping and responsive layouts.
- Some older Sales CSS differs from the recorded standard. Use the saved design rules and formatting standard as the reference rather than copying older declarations indiscriminately.
