# Management Sales Record — owner build instructions

Requested after Grid Management on 9 November 2026. This supersedes the earlier Sales register-only layout where it conflicts.

Build a compact management client register using Preferred Name, Lead ID and Client ID, contact shortcuts (Call, SMS, Email, WhatsApp, Address), System Type, Status, Creation Date, Last Notes, Last Activity and View Client Details. Search client name/phone/address/suburb. Status filters: All, Active Leads, Active Deals, Won, Nurture, Lost. Won sales have a year filter. Twenty records per page, scrolling, single-line notes with full hover text. No separate client creation: clients originate only from leads.

Record page order: Client Details; Project Details; Grid Details; Documents; Products; Price; Outcome; Activity Log.

- Client Details: Site Type, Preferred Name, Legal Name, contacts/emails, Location, Suburb, Postcode, optional Bill Amount; commercial Company Name, Business Name, Industry, Position, ABN. Filing/search uses Preferred Name. Contract uses verified Legal Name.
- Project Details: System Type, Connection Type, Building Type (multiple residential choices), Strata Managed (not applicable for Torrens Title), Phase Type, Roof Type, Height, Site Visit, Remote Site Visit.
- Grid Details: NMI (optional here, validate when present, recognise prefixes), Retailer Name, Grid Provider, Meter Number, Pole Number, Lot/DP Number.
- Documents: Electricity Bill, Meter Pic, Site Legend, PV Design, Battery Location, Build Plan, Interval Data, other approved labels including SLD and VRC. A file must actually exist for Uploaded. Include Site Instructions / Rep Advice.
- Products: signed products only, in order Panels, Battery, Inverter 1, Inverter 2, Racking, Cabinet Storage/EV Charger if sold. Signed snapshot is immutable under catalogue edits. Show product-change approval links.
- Price: signed Total Price, STC Value, Discount Applied, Deposit, OFP Balance; Extras, Extra Balance, Final OFP Balance = OFP Balance + Extra Balance. Signed OFP Pay Mode and Payment Notes, finance details if selected.
- Outcome: Rep Name, outcome/status, update date, contract status, submission path/history. Sale Submission checks remain in Sale Submission.
- Activity Log: one read-only client history, newest first, covering notes and confirmed Lead Management, Deals, Approvals and Sales Submission actions. Entries cannot be edited.

One shared client/sale source for rep and management; management changes must not silently overwrite signed products/prices. Products and Price stay locked until signed contract is recorded, and signed values change only through traceable approved versions. Backend record scope and role permissions are required before production use. The review build must explicitly identify sample data and disclose absent production identity/Sales CRM connections.
