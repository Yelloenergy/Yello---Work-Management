# Sales Management field mapping

This documents the early order-register review. The active Management Sales Record now follows `MANAGEMENT-SALES-RECORD.md`, with Preferred Name and the eight approved record pages. Historical mappings below are retained for reference, not as competing field definitions.

The register and order layout use observed Sales CRM source labels. Source inspected: the Sales CRM `app/app/client-profile/page.tsx` and `app/app/rep-leads/page.tsx`. The master workbook and production order payload still require reconciliation before importing live records.

| Requested information | Visible label | Mapping decision |
|---|---|---|
| Name | Client Name | Existing register/checklist label; preserve each source order identity separately. |
| Order number | Sale ID | Existing Sales CRM `YEG-` prefix with the shared six-digit sequence. Reuse the same numeric suffix as Client ID and Deal ID; never allocate an independent order sequence. |
| System Type | System Type | Signed-contract product information. |
| Site Type | Site Type | Associated client/site information from the approved order version. |
| Sales Rep | Sales Rep | New order-level field pending source-payload verification; no equivalent order field found in inspected Client Profile. Do not infer from the signed-in user. |
| PV Size | System Size | Existing panel-system label; do not substitute inverter capacity. |
| Battery Size if given | Battery Size | Existing product field; absence is not zero capacity. |
| Phase | Phase Type | Site phase; not `Inverer Phase Type`. Preserve the latter's source spelling in Product Information. |
| Site installation notes | Site Visit Notes | Reuse existing site notes field; keep Remote Visit Notes separately in the full profile. Do not replace these with later activity text. |
| Last updated notes | What Happened | Existing activity text, projected from the latest applicable post-submission order update. No duplicate notes column/storage field. |
| Sales Date | Sales Date | New explicit order-level field pending source-payload verification; do not infer it from Signed Contract Date. |
| Last update | Last Update | Existing timestamp label; in the live workflow this must refer to the latest applicable order update, not page access or contact-link clicks. |

Full-order layout follows Client Information, Site Information, Grid Information, Product Information, Price Information, Document Information and Sale Submission Information. The present layout is a subset for review, not a complete production schema. Repeated product lines, conditional fields, prices, signed documents and complete source payload rendering require the actual approved order data contract.

The owner requested populated fictional examples after the initial blank layout. The register now contains 25 labelled fictional sample orders in a 20-row-high area, with 34px rows. These are never imported or treated as approved records. Masked phone numbers and example.com email addresses do not identify real clients. Phone, Email, SMS and WhatsApp shortcuts show sample contact details without initiating communications. Search matches Client Name and Sale ID. Full-order samples preserve the matching field values and the shared YEG/CID/DEAL suffix. Preview activity remains memory-only, scoped to the sample order, and is not a durable audit store.
