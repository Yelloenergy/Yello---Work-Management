# Job Crossover Check — local review

The operational handover check replaces standalone STC, Inventory and Offload workspaces. It does not repeat sales approval. Signed orders appear in a compact searchable register with six verification indicators, Product Changes Yes/No, responsible Admin, processing time and release state. Twenty records per page; long registers scroll.

Open a Sale ID for Order Details, Grid, STC, Inventory, Extras and Activity Log. All reuse the existing client record and active approved contract version. Existing Sales field labels remain unchanged. New data is workflow evidence under `crossover`, not replacement Sales fields.

## Evidence and ownership

- Order Details reuses Roof Type, Height, Phase Type, Site Instructions / Rep Advice, Site Visit Notes, signed products and extras. Assign a responsible Admin. A separate product-change check reconciles approved versions and blocks pending changes.
- Grid reads `gridReview` from the same shared local API used by Grid Management. It displays Grid Status, Grid Provider, NMI, Grid Applied Date, Approval Number, Approval Date, updater and sale-to-approval timing. Full application editing stays in Grid Management. Existing grid attachment contents still live in browser IndexedDB; only metadata and field values are shared locally.
- STC evidence records platform (initially Bridgeselect), creator, responsible person, reference, completion time and optional agreed due time. It confirms Admin's external work; it never submits an STC application.
- Inventory evidence records responsible person, reference, completion time, optional agreed due time, provisional status and per-signed-line quantity/matching/packing confirmations. Ordered is visible but does not pass readiness. Reserved or Prepared are the explicitly provisional review criteria, pending final Inventory source mapping. A boolean matching confirmation is an Admin attestation in this review, not an automated SKU validation or live stock check. Missing source quantities block verification and require a controlled source correction.
- Extras reuse the active signed order's extras list. Every item requires organisation, owner, reference and completion time. A genuinely empty signed list can be verified as not applicable. The owner's wider extras catalogue is pending.
- Review decisions record server identity and time. Due times are optional because STC, Inventory and Extras targets have not been agreed. Missing targets display as not agreed; never assume on time. Grid retains its agreed Sydney calendar-day target.

New workflow metadata includes ownership, evidence references, completion/due timestamps, verification stamps, packed quantities, a packing-slip snapshot, release and queued interaction records. These concepts have no equivalent in the inspected Sales profile and are kept separate from its canonical fields. No new client or Sale ID is generated here.

## Release and printing

The shared server validates all six checks. Unsigned contracts, pending changes, missing evidence, ordered-only Inventory, unmatched lines or incomplete Extras block release. Each verification refers to the source evidence and contract version checked. Relevant edits invalidate checks; the API withdraws a stale release and cancels its unsent interaction. Activity notes alone do not invalidate checks.

The last successful check automatically records release and one readiness interaction per distinct release snapshot. Repeating a check does not duplicate the interaction. Interaction status is **Queued — delivery not connected**. No message is sent. Future delivery must revalidate readiness and use an idempotent outbox worker.

Preparing a full-job packing slip requires Prepared Inventory, exact approved quantities, matched products and confirmed packed quantities for every line. The saved slip keeps order version, specifications, quantities, preparer and time. Browser printing hides other UI. A changed Inventory/order stamp marks the slip superseded and disables its Print control. Printer completion is not asserted; history says prepared.

## Limits and validation

This is a local sample backend with a server-configured review identity, not production authentication or a live Sales CRM/Admin/Inventory integration. Backend checks protect the review release; production allocation and booking actions must also enforce current readiness when those workflows are connected. Those actions are not implemented in this shell. There is no automated ordering, SKU lookup, stock allocation, notification delivery or external platform submission.

The shared local store is ignored by Git and contains only fictional review data. Existing signed snapshots remain unchanged. A few legacy fixtures contain unverified racking quantities and deliberately cannot pass Inventory matching until corrected through the source change workflow.

`node scripts/check-crossover.mjs` verifies the six-check gate, Inventory mismatch and ordered-only blockers, packing quantities, immutable original contracts, version/source invalidation, rep restrictions and interaction deduplication. Existing API, grid and management checks continue to apply.
