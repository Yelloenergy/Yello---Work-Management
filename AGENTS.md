# Work Management CRM

## Current scope

- On 2 November 2026 the owner asked to review the existing Sales CRM visual structure as the reference for Work Management. Further project instructions will follow.
- Approved Work Management palette: Deep Plum #291D38 for navigation and headings; Petrol #102F36 for feature panels; Teal #087B83 for primary actions and selected controls; light neutral content surfaces. Do not use violet as a competing action colour.
- Use the Sales typography, hierarchy, spacing and component conventions as the working reference.
- The owner has authorised a local navigable shell and a new GitHub repository. Build the shell first; detailed fields, workflow gates, permissions and integrations will follow.

## Approved shell structure

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

## Sales CRM reference reviewed

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
