# Demo application greeting and health checks

**Plan ID:** PLAN-DEMO-001
**Status:** DRAFT
**Approval:** Not approved

## Requirements

| Requirement ID | Description |
| --- | --- |
| REQ-DEMO-001 | A visitor can submit a name and receive a personalized greeting. |
| REQ-DEMO-002 | The greeting form prevents submission when the required name is empty. |
| REQ-DEMO-003 | The health endpoint returns a successful JSON status. |
| REQ-DEMO-004 | The home page provides accessible controls and has no automated WCAG 2.2 AA violations. |

## Test cases

### TP-DEMO-001 — A visitor receives a personalized greeting after submitting a name.

- **Requirement:** REQ-DEMO-001
- **Priority:** P2
- **Type:** ui-positive
- **Automation:** ui-greeting
- **Preconditions:**
  - The demo application is available at the configured base URL.
- **Steps:**
  1. Open the home page.
  2. Enter Ada in the Your name field.
  3. Select Show greeting.
- **Expected results:**
  - The status message reads Hello, Ada!.

### TP-DEMO-002 — The required name field blocks submitting an empty greeting form.

- **Requirement:** REQ-DEMO-002
- **Priority:** P2
- **Type:** ui-negative
- **Automation:** ui-required-field
- **Preconditions:**
  - The demo application is available at the configured base URL.
- **Steps:**
  1. Open the home page.
  2. Submit the form without entering a name.
- **Expected results:**
  - The name field is required and remains invalid when empty.

### TP-DEMO-003 — The health endpoint returns HTTP 200 and a healthy JSON response.

- **Requirement:** REQ-DEMO-003
- **Priority:** P2
- **Type:** api-positive
- **Automation:** api-json-get
- **Preconditions:**
  - The demo application is available at the configured base URL.
- **Steps:**
  1. Send GET /api/health.
- **Expected results:**
  - The response status is 200.
  - The response JSON is {"status":"ok"}.

### TP-DEMO-004 — The home page exposes accessible controls and has no automated WCAG 2.2 AA violations.

- **Requirement:** REQ-DEMO-004
- **Priority:** P2
- **Type:** accessibility
- **Automation:** accessibility-axe
- **Preconditions:**
  - The demo application is available at the configured base URL.
- **Steps:**
  1. Open the home page.
  2. Scan the rendered page using axe WCAG 2.2 AA tags.
- **Expected results:**
  - The automated axe scan reports no violations.

## Open questions

None.
