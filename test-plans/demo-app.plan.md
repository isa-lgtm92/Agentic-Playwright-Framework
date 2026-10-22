# Demo application test plan

**Status:** Draft example; not approved for production automation.
**Scope:** Bootstrap-only UI, API, and accessibility smoke scenarios.
**Approval:** None. These scenarios demonstrate ID traceability, not product coverage.

| ID | Priority | Type | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TP-DEMO-001 | P2 | UI positive | Demo app is available | Open home; enter `Ada`; submit | A polite status message reads `Hello, Ada!` |
| TP-DEMO-002 | P2 | UI negative/boundary | Demo app is available | Open home; submit without a name | Required input blocks submission |
| TP-DEMO-003 | P2 | API positive | Demo app is available | GET `/api/health` | HTTP 200 with `{"status":"ok"}` |
| TP-DEMO-004 | P2 | Accessibility | Demo app is available | Scan home using axe WCAG 2.2 AA tags | No automated violations are reported |

This example has no linked business requirements and must not be mistaken for an
approved enterprise acceptance suite.
