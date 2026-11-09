# Grid & Meter first build

Reference: Google Drive Excel file `1nHqRp0jJarl93zh3h6Prrkk0YT5jbhzW`, read only on 9 November 2026. Its customer records and protected file links are not imported, committed or published.

Observed source labels: `Grid Status`, `Sales Prospect Details`, `Grid Applied Date`, `Approval Number`, `Approval Date`, `Meter Applied`, `Meter Date + Time`, `Meter Ins Date`, `Files` / `Grid + Meter File`, `Email`, `Creation Log`, `Year`, `link to Client Projectline`, `Grid Provider`.

The front register uses existing Sales CRM Client Name, Contact 1, Email 1, Location, NMI, Sale ID, Sales Date and Last Update. Status is a display projection of Grid Status, Meter Applied and Payment Done; these source fields remain distinct. Creation Date is a separate timestamp, not a silent rename of the actor/time Creation Log. Install Date, Payment Done and Payment Proof Received supply the new workflow requirements. Turnaround columns are derived and never replace source dates.

Two views: application register, then a linked order with Grid Approval first, Net Meter Application second and Payment Done third. Provider and status filters combine with text search and outstanding-deadline filtering. There are 25 fictional sample orders linked to the same sample Sale IDs. These are not actual applications or lender/payment evidence.

First-build timing assumptions supplied for review: 10 Sydney calendar days from Sales Date to Approval Date; 48 elapsed hours from confirmed payment proof to meter application; unresolved meter applications escalate at 72 hours. Install Date to meter submission is a separate elapsed measure. Completed applications retain their actual lateness; missing dates do not become zero. No payment proof means no invented payment deadline. Meter Not Required suppresses its SLA alerts.

Notifications are visible in-app on open and while reviewing. External delivery, scheduling, recipients, production authentication and live source synchronisation remain unconnected. The register and detail changes are saved to a browser-local sample store. Attachment blobs use IndexedDB; sample documents download as explicitly fictional text. Production files/audit will need shared backend storage and permissions.
