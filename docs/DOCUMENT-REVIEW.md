# One-page Job Crossover document review

Built from the owner's 11–12 November 2026 instructions. Every crossover client route now opens one review workspace, rather than separate internal pages. The approved front register layout is unchanged.

## Layout and evidence

The left side opens an attached source document. TXT files use a sandboxed frame, images use a read-only image preview, and PDFs render to page images with Previous/Next controls. Open File remains available. The right side contains the checklist, recorded values, checkboxes, source selectors, page/section references, findings and issue attribution. On mobile the layout becomes one column.

Existing workflow labels and values are reused: Preferred Name, Legal Name, Location, Contact 1/2, Email 1/2, Suburb, Postcode, Site Type, System Type, Phase Type, Roof Type, Height, Building Type, Strata Managed, NMI, Site Instructions / Rep Advice, product specifications/quantities, signed pricing, finance and signed Extras. Commercial client fields are conditional. No replacement Sales aliases or independent client/Sale identifiers are created.

The checklist separately verifies signed status, Signed Contract Date, source sale submission history, and file completeness/readability/type/current version. Identification supports identity; Electricity Bill supports supply information. A licence address is not automatically assumed to equal the installation address.

Checked requires an attached source of the appropriate label and a page/section reference. Missing recorded values cannot be marked Checked. Not Applicable is restricted to optional items and requires a reason. Needs Fix requires an explanation and cause. No OCR, signature authentication or automated document truth comparison is claimed: Admin verifies the content.

`Signed Contract Date` was confirmed in Sales CRM Client Profile (the signed-contract source block in `app/app/client-profile/page.tsx`). The local payload did not populate it. The date-entry action records a genuinely missing canonical field from an attached signed source and binds that document to the current order version. It preserves an existing timestamp rather than truncating it, rejects conflicting values, validates Sydney calendar dates and keeps sale submission/crossover submission dates separate. Once bound, contract checks must use that same current signed document. Original signed snapshots are not retroactively overwritten.

## Coaching score

Starting a review captures an immutable version-specific snapshot and checklist. This is the version present at review start; historical first-submission accuracy is not inferred for older sample records.

The provisional rubric is `equal-weight-v1`:

- Every Checked item earns one point.
- An issue attributed to Rep Submission earns zero points and remains in the denominator.
- Later Change, Review Correction and Not Applicable are excluded.
- Unclear issue attribution prevents a score from being finalised.
- Score = checked / (checked + rep-submission issues) × 100, rounded. No applicable rated items means Not rateable, not a fabricated 100.

Coverage is shown separately. An issue found later in the same assessment cannot be erased by toggling it Checked. Finalisation requires every item assessed and all issues classified, and freezes the score and breakdown. Unresolved issues may be scored, but they do not pass readiness. The first finalised assessment remains the headline score; correction rounds preserve earlier findings/scores. Incomplete older rounds remain unscored history. No rep ranking, compensation or employment decision logic is implemented.

Management has full review history. The assigned rep's shared projection exposes only the saved score and issue labels, without Admin free-text notes or document-review internals. Future reporting can group the first score per Sale ID and rep; do not average correction rounds as new sales.

## Corrections and reissue

After finalising the baseline assessment, Create Revision proposes a correction to an existing field/product/price/extra/Signed Contract Date. Source field labels are preserved. Original values, reason, actor, time and base order version are stored. Duplicate pending proposals for one field are rejected. Withdraw Proposal records the reason without deleting history.

Applying a correction requires a new attached Signed Contract, verified client acceptance with a reference, and its Signed Contract Date. All pending review corrections for that same source version are explicitly approved as a batch into one new version. Stale versions/profile changes are rejected. Original contracts and assessment snapshots remain unchanged. The new version needs a fresh review and readiness checks.

This creates structured revision proposals and links an externally prepared replacement signed document; it does not rewrite or forge a signed PDF, generate a complete legal contract template or submit signatures. Prepare Rep / Client Sharing is an explicit action. Rep recipient mapping is pending, so rep sharing is Draft — recipient required. Optional client sharing is Queued — delivery not connected. No external message is sent.

## Operational controls and gates

Grid, STC, Inventory/packing, Extras, Submission/reminders and shared Activity Log remain available in an Operational Section selector on the same page. Order, Product, Pricing, Extras and Inventory approvals require a current finalised document assessment with no unresolved issues in the applicable group. Backend enforcement prevents bypassing the checklist through earlier endpoints. New signed records and existing local signed fixtures require this review; prior sample handovers are withdrawn if they no longer meet the gate. The front layout is unchanged, but source-dependent green states correctly reopen.

Final handover still requires seven current approvals, Submit and Yes confirmation. Source/version changes invalidate readiness and cancel unsent notifications. The existing 24-hour unsubmitted reminder remains intact. Production identity, external STC/Inventory/Sales ingestion, e-signing and Email/SMS delivery are not connected.

## Runtime and checks

PDF previews use local Poppler `pdfinfo` and `pdftoppm`; the bundled Codex runtime is detected automatically. Other installations can set PDFINFO_BIN and PDFTOPPM_BIN or install Poppler on PATH. Rendering uses argument arrays, no shell, a 15-second timeout, bounded pages and 1500-pixel page images. The authenticated record/document lookup is shared with normal downloads; source bytes and preview images remain in ignored `output/client-review/`. If a PDF is unreadable, protected or the renderer is unavailable, Open File remains the fallback. Preview caches never become repository artifacts.

`check-order-review.mjs` covers evidence, attribution, score/snapshot immutability, grouped revisions, acceptance/replacement evidence, current-version gating, dates and roles. Shared API tests exercise an entire documentary assessment before all seven approvals, then existing YES/NO handover and restart-safe reminders. Browser checks covered source/TXT and PDF preview, missing-evidence rejection, saved issues, same-page operational updates and a 390px layout.
