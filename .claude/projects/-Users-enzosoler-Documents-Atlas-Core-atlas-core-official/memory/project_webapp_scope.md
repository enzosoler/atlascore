---
name: Webapp scope for signed-in users
description: What signed-in web users can do — billing, account management, data export, download app. NOT daily product usage.
type: project
---

Signed-in web users can only access:
- Pay / subscribe / upgrade (V3Paywall) 
- View and manage subscription (invoices, cancel, change plan)
- View account info (email, plan status)
- Export data (CSV + JSON)
- Download the app (store links)

They CANNOT access daily product surfaces (today, train, eat, body, coach, etc.)

**Why:** Mobile is the product. Web is conversion + billing + account management only. Per CLAUDE.md §12-15.

**How to apply:** Any new web-accessible screen must be billing/account/export related. Product surfaces redirect to /download-app via the platform gate.
