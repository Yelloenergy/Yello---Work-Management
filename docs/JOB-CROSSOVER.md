# Job Crossover Check — local review

## Latest register and reminder update

Status is boxed next to Client / Sale ID, followed by the seven checks, Submission, Sales Date and Date Sent Submission. Sales Date is the existing canonical Sales Order field, not a renamed check timestamp. Date Sent Submission is the current confirmed handover timestamp (`crossover.submission.at`), not Email/SMS delivery time. Check timestamps remain inside. Submit is hidden until all checks pass; a completed submission keeps a disabled Submit label.

All-green, unsubmitted orders start a persisted 24-elapsed-hour readiness window. At its deadline the server queues separate client Email/SMS reminders once for that window, stating the checks are complete and final submission is pending. This message must not claim the order is ready for booking. It is distinct from the booking-ready messages created only after Yes-confirmed Submission. Clicking No does not reset the deadline.

Source changes close the window and cancel unsent reminders. Reapproval starts a fresh window. Confirmed Submission also closes the timer and cancels unsent reminders while preserving normal booking-ready messages. Window history, decisions and queued/cancelled messages remain traceable. A serialized local server worker checks once per minute, on startup and before API requests, with atomic persistence and no duplicate reminders after restart. It requires the server to run; after downtime it catches up at restart. External delivery is unconnected. A future delivery worker must revalidate the current readiness window and absence of Submission before sending.

Tests cover just-before/exactly-at 24 hours, repeat worker runs, restart catch-up, cancellation, fresh windows, and coexistence of pending-submission reminders with confirmed booking-ready messages.

Register visual refinement: check cells show aligned squares without secondary explanations. Header and body columns align; client-name links underline on hover/focus. The main progress bar counts approved checks across the currently filtered orders, and separately reports submitted jobs. Empty results show 0%; a fully checked filtered set shows 100% without bypassing confirmed Submission. Product change details remain inside the record.

The operational handover check replaces standalone STC, Inventory and Offload workspaces. It does not repeat sales approval. Signed orders appear in a compact register with Client / Sale ID followed by Check Order, Check Grid, Check STC, Check Product, Check Inventory, Pricing Checked, Extras Checked, Submission, Date Checked and Status. Responsible Admin appears under the client identity; Product Changes Yes/No remains supporting information. Twenty records per page; long registers scroll.

Open a Sale ID for Order Details, Grid, STC, Inventory, Pricing, Extras, Submission and Activity Log. All reuse the existing client record and active approved contract version. Existing Sales field labels remain unchanged. New data is workflow evidence under `crossover`, not replacement Sales fields.

Search uses Client Name / Preferred Name, Location, Suburb and existing phone fields (Sale ID remains supported). Year tabs derive from the source Sales Date. Workflow status tabs are All, Awaiting, Working On it, Need Help and Approved. Crossover status is separate from Sales Status. Date Checked is the most recent verification time formatted in Sydney time as `23 October 2026 9:30AM`. Visible registers refresh every 30 seconds, preserving filters; live production ingestion is still pending.

## Evidence and ownership

- Order Details reuses Roof Type, Height, Phase Type, Site Instructions / Rep Advice, Site Visit Notes, signed products and extras. Assign a responsible Admin. A separate product-change check reconciles approved versions and blocks pending changes.
- Grid reads `gridReview` from the same shared local API used by Grid Management. It displays Grid Status, Grid Provider, NMI, Grid Applied Date, Approval Number, Approval Date, updater and sale-to-approval timing. Full application editing stays in Grid Management. Existing grid attachment contents still live in browser IndexedDB; only metadata and field values are shared locally.
- STC evidence records platform (initially Bridgeselect), creator, responsible person, reference, completion time and optional agreed due time. It confirms Admin's external work; it never submits an STC application.
- Inventory evidence records responsible person, reference, completion time, optional agreed due time, provisional status and per-signed-line quantity/matching/packing confirmations. Ordered is visible but does not pass readiness. Reserved or Prepared are the explicitly provisional review criteria, pending final Inventory source mapping. A boolean matching confirmation is an Admin attestation in this review, not an automated SKU validation or live stock check. Missing source quantities block verification and require a controlled source correction.
- Extras reuse the active signed order's extras list. Every item requires organisation, owner, reference and completion time. A genuinely empty signed list can be verified as not applicable. The owner's wider extras catalogue is pending.
- Review decisions record server identity and time. Due times are optional because STC, Inventory and Extras targets have not been agreed. Missing targets display as not agreed; never assume on time. Grid retains its agreed Sydney calendar-day target.

New workflow metadata includes ownership, evidence references, completion/due timestamps, verification stamps, packed quantities, a packing-slip snapshot, release and queued interaction records. These concepts have no equivalent in the inspected Sales profile and are kept separate from its canonical fields. No new client or Sale ID is generated here.

## Release and printing

The shared server validates all seven checks, including a separate review of current signed pricing and balances. Unsigned contracts, pending changes, missing evidence, ordered-only Inventory, unmatched lines or incomplete Extras block Submission. Each verification refers to the source evidence and contract version checked. Relevant edits invalidate checks; the API withdraws a stale release and cancels unsent interactions. Activity notes alone do not invalidate checks.

All green means ready to submit, not released. Submit is disabled until all checks pass. The first click prepares a five-minute server confirmation bound to the current source snapshot and actor. A Yes / No dialog asks `Are you sure?`. No cancels without release or messages. Yes revalidates revision, token, actor, expiry and all checks, then records Submission, release and Approved status. Replay is rejected. Only currently valid confirmed submissions appear in the server-filtered `/api/job-management` inbox. Superseded earlier automatic releases are withdrawn on startup; history is retained.

Confirmed Submission queues two interim messages: Email and SMS telling the client the order is ready for booking. Their channel, recipient, wording, actor-linked submission and timestamp are retained. Interaction status is **Queued — delivery not connected**. No message is sent. Future delivery must revalidate readiness and use an idempotent outbox worker. Final templates remain pending.

Preparing a full-job packing slip requires Prepared Inventory, exact approved quantities, matched products and confirmed packed quantities for every line. The saved slip keeps order version, specifications, quantities, preparer and time. Browser printing hides other UI. A changed Inventory/order stamp marks the slip superseded and disables its Print control. Printer completion is not asserted; history says prepared.

## Limits and validation

This is a local sample backend with a server-configured review identity, not production authentication or a live Sales CRM/Admin/Inventory integration. Backend checks protect the review release; production allocation and booking actions must also enforce current readiness when those workflows are connected. Those actions are not implemented in this shell. There is no automated ordering, SKU lookup, stock allocation, notification delivery or external platform submission.

The shared local store is ignored by Git and contains only fictional review data. Existing signed snapshots remain unchanged. A few legacy fixtures contain unverified racking quantities and deliberately cannot pass Inventory matching until corrected through the source change workflow.

`node scripts/check-crossover.mjs` verifies seven-check gating, pricing, YES/NO confirmation, expired/stale/repeated confirmation rejection, Inventory blockers, packing quantities, immutable contracts, source invalidation, role scope and date formatting. API tests also verify that all-green and No stay out of Job Management, Yes produces a job plus two queued channels, and changed source data withdraws the job and cancels messages. Existing grid and management checks continue to apply.
