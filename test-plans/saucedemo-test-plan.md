# SauceDemo observed behavior and accessibility test plan

**Plan ID:** PLAN-SAUCEDEMO-001
**Status:** APPROVED
**Approval:** Project Owner (2026-10-22T03:59:12.038Z)

## Requirements

| Requirement ID | Description |
| --- | --- |
| REQ-SD-001 | Provisional observed behavior: supplied public test-account listings and named login controls are available; submitting standard_user without a password displays the observed password-required alert. |
| REQ-SD-002 | Provisional observed behavior: blank login submission displays the observed username-required alert. |
| REQ-SD-003 | Provisional observed behavior: invalid credentials display the observed mismatch alert. |
| REQ-SD-004 | Provisional observed behavior: locked_out_user displays the observed locked-out alert. |
| REQ-SD-005 | Provisional observed behavior: standard_user sees six inventory products and the observed sort choices and orderings. |
| REQ-SD-006 | Provisional observed behavior: inventory detail controls and Backpack detail display the supplied observed content. |
| REQ-SD-007 | Provisional observed behavior: adding/removing Backpack updates its control and cart accessible name. |
| REQ-SD-008 | Provisional observed behavior: cart shows the selected item and the supplied controls. |
| REQ-SD-009 | Provisional observed behavior: checkout information form, individually observed missing First Name, Last Name, and Postal Code alerts, and supplied valid-data route transition. |
| REQ-SD-010 | Provisional observed behavior: checkout overview displays supplied item, payment, shipping, and totals. |
| REQ-SD-011 | Provisional observed behavior: Finish displays the supplied completion copy and empty cart. |
| REQ-SD-012 | Provisional observed behavior: menu/footer names, About URL, and Logout return route are as supplied. |
| REQ-SD-013 | Project test scope: automated axe-core scans cover login, inventory, cart, and checkout; manual keyboard and screen-reader reviews are documented separately. No scan or manual review result is claimed. |

## Planning context

- **Scope:** Use verified SauceDemo observations as provisional acceptance criteria for this demo automation project, not formal product-owner guarantees. Cover login, inventory visibility/sorting, Backpack details, cart, checkout, menu/logout navigation, automated axe-core scans on login/inventory/cart/checkout, and separately documented manual keyboard/screen-reader checks. No accessibility scan or manual conformance result is claimed. API behavior, browser/OS matrix, non-Backpack detail variations, and other unobserved validation outcomes are out of scope.
- **Environment/data:** Named Playwright environment: PLAYWRIGHT_ENV=saucedemo, base URL https://www.saucedemo.com/. Browser build/version is externally managed and not observed. Each Playwright test must use its own default isolated browser context/page, sign in and establish its own preconditions, and must not reuse storageState or cart state from another test. Cart scenarios sign in as standard_user, add only their required item, and verify the expected cart state. When a cart must begin empty, use the observed inventory menu Reset App State action and assert the accessible cart name is Cart, empty before arranging scenario data. Supplied demo credentials are standard_user / secret_sauce and locked_out_user / secret_sauce; checkout sample data is Ada / Lovelace / 12345. Evidence source: integrated browser page and browser interactions; configured Playwright MCP was unavailable and was not used. No axe scan was run.
- **Assumptions:**
  - REQ-SD IDs map to verified observations or the explicit project accessibility scope in requirements/saucedemo-requirements.md. No Jira story or formal SauceDemo acceptance criteria were supplied.
  - Only the supplied public demo credentials and sample checkout data are in scope; do not use real personal or payment information.
  - Unobserved behavior remains excluded or explicitly marked as a non-blocking owner question; no expected result is inferred.
  - All SauceDemo automation entries remain planning-only. No SauceDemo tests have been generated.

### Explicit project decisions
- **DEC-SD-001:** For this demo automation project, the verified browser observations recorded in this plan are provisional acceptance oracles. They are not represented as formal SauceDemo business requirements or guarantees across app releases.
  - Basis: Explicit project-scope decision supplied by the requester.
- **DEC-SD-002:** Plan automated axe-core scans for login, inventory, cart, checkout information, checkout overview, and checkout completion. Record axe violations by rule, impact, target, and route; do not claim zero violations or WCAG conformance before scans are run and an acceptance threshold is approved.
  - Basis: Explicit accessibility scope supplied by the requester.
- **DEC-SD-003:** Document manual keyboard and screen-reader checks separately from axe automation; manual review results must identify the browser and assistive technology actually exercised.
  - Basis: Explicit accessibility scope supplied by the requester.
- **DEC-SD-004:** Use isolated Playwright browser contexts per test with independent login and precondition setup. For cart scenarios, reset through the observed Reset App State menu action, assert Cart, empty, then add only scenario-required products. Do not share authentication storage or depend on another test's cart.
  - Basis: Project test-isolation policy; the Reset App State action was observed to clear a non-empty cart.
- **DEC-SD-005:** Preserve all 20 original scenario IDs and add two separate checkout cases for the newly observed missing Last Name and missing Postal Code errors, bringing the draft to 22 cases.
  - Basis: Browser evidence verified two distinct validation responses that were not represented by the original 20 cases.

### Resolved blockers
- **login-username-only:** Verified in the integrated browser: standard_user with Password left blank displays the alert Epic sadface: Password is required.
  - Evidence/decision: Observed browser interaction on the live login form; recorded in test-plans/inspections/saucedemo.json.
- **checkout-required-fields:** Verified each missing-field validation in the integrated browser: blank First Name displays Error: First Name is required; after supplying Ada, blank Last Name displays Error: Last Name is required; after supplying Lovelace, blank Zip/Postal Code displays Error: Postal Code is required.
  - Evidence/decision: Observed sequential field-isolation checks on checkout information; recorded in test-plans/inspections/saucedemo.json.
- **acceptance-basis:** Requester explicitly accepted observed SauceDemo behavior as provisional acceptance criteria for this demo automation project; this does not claim formal SauceDemo product-owner approval.
  - Evidence/decision: Explicit project decision in the current request.
- **accessibility-scope:** Requester specified axe-core scans for login, inventory, cart, and checkout, with manual keyboard and screen-reader checks documented separately. No scan or manual review has been performed.
  - Evidence/decision: Explicit project decision in the current request.
- **environment-isolation:** Base URL is https://www.saucedemo.com/. The plan requires fresh Playwright contexts, independent test setup, and a verified Reset App State cart reset before cart scenarios.
  - Evidence/decision: Requester-specified target URL and isolation policy; cart reset behavior observed in the integrated browser.

## Test cases

### SD-LOGIN-001 — Sign in with the supplied standard_user credentials and reach the observed inventory page.

- **Requirement:** REQ-SD-001
- **Priority:** P1
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI flow using accessible form controls and observable route/heading/product count.
  - **Rationale:** No SauceDemo generator kind exists; implement only after plan approval and generator support.
- **Preconditions:**
  - The owner-approved SauceDemo site is available.
  - The supplied standard_user / secret_sauce test account is authorized and the browser is signed out.
- **Steps:**
  1. Open the login page.
  2. Verify the public accepted-user listing contains standard_user and locked_out_user and the public password listing says secret_sauce.
  3. Verify the Login form exposes Username and Password textboxes and a Login button.
  4. Enter standard_user and secret_sauce, then activate Login.
- **Expected results:**
  - The user reaches /inventory.html.
  - The page heading is Products and six products are displayed.

### SD-LOGIN-002 — Reject the supplied invalid username/password combination with the observed alert.

- **Requirement:** REQ-SD-003
- **Priority:** P1
- **Type:** ui-negative
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI negative path; assert the exact observed alert.
  - **Rationale:** No SauceDemo generator kind exists; implement only after plan approval and generator support.
- **Preconditions:**
  - The owner-approved SauceDemo site is available and the browser is signed out.
- **Steps:**
  1. Open the login page.
  2. Enter an invalid username and invalid password.
  3. Activate Login.
- **Expected results:**
  - The page displays Epic sadface: Username and password do not match any user in this service.

### SD-LOGIN-003 — Show the observed locked-out alert for locked_out_user.

- **Requirement:** REQ-SD-004
- **Priority:** P1
- **Type:** ui-negative
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI negative path; assert the exact observed alert.
  - **Rationale:** No SauceDemo generator kind exists; implement only after plan approval and generator support.
- **Preconditions:**
  - The owner-approved SauceDemo site is available and the browser is signed out.
- **Steps:**
  1. Open the login page.
  2. Enter locked_out_user and secret_sauce.
  3. Activate Login.
- **Expected results:**
  - The page displays Epic sadface: Sorry, this user has been locked out.

### SD-LOGIN-004 — Submit the login form blank and observe the supplied username-required alert.

- **Requirement:** REQ-SD-002
- **Priority:** P1
- **Type:** ui-negative
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI validation path; assert the exact observed alert.
  - **Rationale:** No SauceDemo generator kind exists; implement only after plan approval and generator support.
- **Preconditions:**
  - The owner-approved SauceDemo site is available and the browser is signed out.
- **Steps:**
  1. Open the login page.
  2. Leave Username and Password empty.
  3. Activate Login.
- **Expected results:**
  - The page displays Epic sadface: Username is required.

### SD-LOGIN-005 — Submitting standard_user without a password displays the observed password-required alert.

- **Requirement:** REQ-SD-001
- **Priority:** P2
- **Type:** ui-boundary
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI boundary validation using the observed alert.
  - **Rationale:** Verified in the integrated browser for standard_user with Password empty.
- **Preconditions:**
  - The browser is signed out on https://www.saucedemo.com/.
- **Steps:**
  1. Enter standard_user while leaving Password empty.
  2. Activate Login.
- **Expected results:**
  - The page displays Epic sadface: Password is required.

### SD-INV-001 — Verify the signed-in inventory exposes six products and product-specific name/detail and add controls.

- **Requirement:** REQ-SD-005
- **Priority:** P1
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI inventory inspection through accessible names and visible product count.
  - **Rationale:** No SauceDemo generator kind exists; implementation requires approved inspection evidence.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce.
- **Steps:**
  1. Open /inventory.html.
  2. Verify the Products heading and six products.
  3. For each displayed product, verify its product-name button is named View details for <name> and a product-specific Add to cart control is present.
- **Expected results:**
  - The inventory heading is Products and six products are visible.
  - Each product exposes the supplied product-name button naming pattern and product-specific Add to cart control.

### SD-INV-002 — Verify Name (A to Z) and Name (Z to A) produce the supplied product orders.

- **Requirement:** REQ-SD-005
- **Priority:** P2
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI sorting assertions against complete observed name sequences.
  - **Rationale:** No SauceDemo generator kind exists.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce and viewing inventory.
- **Steps:**
  1. Select Name (A to Z) from the Sort products combobox.
  2. Record the visible product order.
  3. Select Name (Z to A) and record the visible product order.
- **Expected results:**
  - The combobox is named Sort products and includes Name (A to Z), Name (Z to A), Price (low to high), and Price (high to low).
  - A to Z order is Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings() T-Shirt (Red).
  - Z to A order is the inverse: Test.allTheThings() T-Shirt (Red), Onesie, Fleece Jacket, Bolt T-Shirt, Bike Light, Backpack.

### SD-INV-003 — Verify both price sort directions against the supplied observed product and price sequences.

- **Requirement:** REQ-SD-005
- **Priority:** P2
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI sort assertions against supplied values; avoid asserting unspecified tie behavior in descending direction.
  - **Rationale:** No SauceDemo generator kind exists.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce and viewing inventory.
- **Steps:**
  1. Select Price (low to high) from Sort products.
  2. Record product names and displayed prices in order.
  3. Select Price (high to low) and record product names in order.
- **Expected results:**
  - Low to high is Onesie ($7.99), Bike Light ($9.99), Bolt T-Shirt ($15.99), Test.allTheThings() T-Shirt (Red) ($15.99), Backpack ($29.99), Fleece Jacket ($49.99).
  - High to low names are Fleece Jacket, Backpack, Bolt T-Shirt, Test.allTheThings() T-Shirt (Red), Bike Light, Onesie.
  - The supplied observations establish the equal-price ordering only for low-to-high; high-to-low tie order is not asserted.

### SD-DETAIL-001 — Open Backpack details and verify the supplied detail route, image alternative, price, and controls.

- **Requirement:** REQ-SD-006
- **Priority:** P2
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI detail-page assertions using accessible names, image alternative text, and observed route.
  - **Rationale:** No SauceDemo generator kind exists.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce and viewing inventory.
- **Steps:**
  1. Activate the Backpack product-name button using the observed View details for <name> naming pattern.
  2. Inspect the resulting page.
- **Expected results:**
  - The route is /inventory-item.html?id=4.
  - The page shows image alt Sauce Labs Backpack, price $29.99, Add to cart, and Back to products.

### SD-CART-001 — Add Backpack and verify the observed button and cart-name state changes.

- **Requirement:** REQ-SD-007
- **Priority:** P1
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI state transition assertions against control name and cart accessible name.
  - **Rationale:** No SauceDemo generator kind exists.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce with an empty cart.
- **Steps:**
  1. On inventory, activate Backpack Add to cart.
  2. Inspect the Backpack action and cart button accessible name.
- **Expected results:**
  - The Backpack action changes to Remove.
  - The cart button accessible name is Cart, 1 items.

### SD-CART-002 — Remove Backpack and verify the observed empty-cart state.

- **Requirement:** REQ-SD-007
- **Priority:** P1
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI state transition assertions against control name and cart accessible name.
  - **Rationale:** No SauceDemo generator kind exists.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce with Backpack in the cart.
- **Steps:**
  1. Activate Backpack Remove.
  2. Inspect the product action and cart button accessible name.
- **Expected results:**
  - The Backpack action returns to Add to cart.
  - The cart button accessible name is Cart, empty.

### SD-CART-003 — Verify cart contents and available actions for the added Backpack.

- **Requirement:** REQ-SD-008
- **Priority:** P1
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI cart-content and action assertions.
  - **Rationale:** No SauceDemo generator kind exists.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce with Backpack added.
- **Steps:**
  1. Open Cart.
  2. Inspect the page heading, item row, quantity, and action buttons.
- **Expected results:**
  - The route is /cart.html and heading is Your Cart.
  - The cart shows QTY 1, the Backpack product description, and Remove.
  - Continue Shopping and Checkout buttons are available.

### SD-CHECKOUT-001 — Submit empty checkout information and verify the observed First Name error.

- **Requirement:** REQ-SD-009
- **Priority:** P1
- **Type:** ui-negative
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI required-information negative path; both fields remain empty.
  - **Rationale:** Error: First Name is required was directly observed.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce with Backpack in the cart.
- **Steps:**
  1. Open Cart and activate Checkout.
  2. Verify Checkout: Your Information, First Name, Last Name, Zip/Postal Code, Continue, and Cancel.
  3. Leave all information fields empty and activate Continue.
- **Expected results:**
  - Checkout opens /checkout-step-one.html.
  - The page displays Error: First Name is required.

### SD-CHECKOUT-005 — Submitting checkout with First Name present and Last Name missing displays the observed Last Name error.

- **Requirement:** REQ-SD-009
- **Priority:** P1
- **Type:** ui-negative
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** Isolated UI required-field validation with First Name supplied.
  - **Rationale:** The exact Last Name error was observed in the integrated browser.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce with Backpack in the cart.
  - Checkout information is open and all fields are initially empty.
- **Steps:**
  1. Enter Ada in First Name; leave Last Name and Zip/Postal Code empty.
  2. Activate Continue.
- **Expected results:**
  - The page remains on /checkout-step-one.html.
  - The page displays Error: Last Name is required.

### SD-CHECKOUT-006 — Submitting checkout with first and last names present and postal code missing displays the observed Postal Code error.

- **Requirement:** REQ-SD-009
- **Priority:** P1
- **Type:** ui-negative
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** Isolated UI required-field validation with First Name and Last Name supplied.
  - **Rationale:** The exact Postal Code error was observed in the integrated browser.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce with Backpack in the cart.
  - Checkout information is open and all fields are initially empty.
- **Steps:**
  1. Enter Ada in First Name and Lovelace in Last Name; leave Zip/Postal Code empty.
  2. Activate Continue.
- **Expected results:**
  - The page remains on /checkout-step-one.html.
  - The page displays Error: Postal Code is required.

### SD-CHECKOUT-002 — Submit the supplied checkout information and verify the observed route transition.

- **Requirement:** REQ-SD-009
- **Priority:** P1
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI valid-information flow and route/heading assertion.
  - **Rationale:** No SauceDemo generator kind exists.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce with Backpack in the cart.
- **Steps:**
  1. Open Checkout from the cart.
  2. Enter Ada, Lovelace, and 12345 in First Name, Last Name, and Zip/Postal Code respectively.
  3. Activate Continue.
- **Expected results:**
  - The browser reaches /checkout-step-two.html.
  - The page heading is Checkout: Overview.

### SD-CHECKOUT-003 — Verify the supplied order overview line item, payment, shipping, and totals.

- **Requirement:** REQ-SD-010
- **Priority:** P1
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI overview assertions for observed copy and monetary values.
  - **Rationale:** No SauceDemo generator kind exists.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce with Backpack and supplied checkout information; viewing Checkout: Overview.
- **Steps:**
  1. Inspect the overview item, payment, shipping, totals, and available buttons.
- **Expected results:**
  - The item is $29.99.
  - Payment is SauceCard #31337 and shipping is Free Pony Express Delivery!.
  - Item total is $29.99, Tax is $2.40, and Total is $32.39.
  - Finish and Cancel buttons are present.

### SD-CHECKOUT-004 — Finish the order and verify the observed completion page and empty cart.

- **Requirement:** REQ-SD-011
- **Priority:** P1
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI completion flow assertions and cart-empty state check.
  - **Rationale:** No SauceDemo generator kind exists.
- **Preconditions:**
  - A Backpack order is on Checkout: Overview with the supplied checkout information.
- **Steps:**
  1. Activate Finish.
  2. Inspect completion headings, confirmation copy, cart state, and Back Home button.
- **Expected results:**
  - The route is /checkout-complete.html.
  - The page shows Checkout: Complete! and Thank you for your order!.
  - The copy is Your order has been dispatched, and will arrive just as fast as the pony can get there!.
  - The cart is empty and Back Home is available.

### SD-NAV-001 — Verify the observed menu and footer navigation labels and the About destination.

- **Requirement:** REQ-SD-012
- **Priority:** P2
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI accessible-name and href assertions for supplied observations.
  - **Rationale:** No SauceDemo generator kind exists; menu action destinations other than About/Logout are not asserted.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce and viewing an application page with its menu/footer.
- **Steps:**
  1. Activate Open Menu.
  2. Verify nav buttons All Items, Dynamic Catalog, Logout, Reset App State, and About.
  3. Verify the About link destination is https://saucelabs.com/ without relying on an unobserved destination for other menu controls.
  4. Inspect footer links.
- **Expected results:**
  - The named menu controls are present.
  - About points to https://saucelabs.com/.
  - Footer links X, Facebook, and LinkedIn are present.

### SD-NAV-002 — Log out from the menu and verify return to the login route.

- **Requirement:** REQ-SD-012
- **Priority:** P1
- **Type:** ui-positive
- **Scenario status:** ready-for-owner-review
- **Automation:** planned
  - **Phase:** C
  - **Approach:** UI logout transition and route assertion.
  - **Rationale:** No SauceDemo generator kind exists.
- **Preconditions:**
  - Signed in as standard_user / secret_sauce.
- **Steps:**
  1. Open the menu.
  2. Activate Logout.
- **Expected results:**
  - The browser returns to /.

### SD-A11Y-001 — Run and document automated axe-core scans on login, inventory, cart, and checkout states.

- **Requirement:** REQ-SD-013
- **Priority:** P2
- **Type:** accessibility
- **Scenario status:** proposed-not-run
- **Automation:** planned
  - **Phase:** C
  - **Approach:** Separate axe-core scans on each planned page state; report findings without presuming a zero-violation oracle.
  - **Rationale:** The scan scope is an explicit project decision; no axe scan was run during browser exploration.
- **Preconditions:**
  - The named SauceDemo environment is available.
  - A signed-out login page and signed-in inventory, cart, checkout information, overview, and completion states can be reached using supplied demo data.
- **Steps:**
  1. Run @axe-core/playwright on login, inventory, cart, checkout information, checkout overview, and completion states using WCAG 2.2 AA tags.
  2. Record scan configuration, page/state, violations by rule/impact/target, and triage disposition.
- **Expected results:**
  - Automated findings are recorded by page and rule; no zero-violation outcome or WCAG conformance is claimed before the scans run.
  - No scan has been run yet; observed results and any agreed severity thresholds are documented separately.

### SD-A11Y-002 — Propose manual keyboard, focus, and accessible-name review for login, inventory, cart, and checkout flows.

- **Requirement:** REQ-SD-013
- **Priority:** P2
- **Type:** accessibility
- **Scenario status:** proposed-not-run
- **Automation:** planned
  - **Phase:** C
  - **Approach:** Manual accessibility review, separate from axe automation.
  - **Rationale:** Keyboard/focus/name behavior and conformance were not established by the supplied snapshot.
- **Preconditions:**
  - The browser and screen-reader combination used for manual review is recorded; this plan makes no unsupported coverage claim for untested combinations.
- **Steps:**
  1. Manually operate the in-scope forms, sorting, product details, cart, and checkout controls using keyboard only.
  2. Review focus visibility/order and meaningful accessible names for interactive controls.
  3. Record tested combinations and findings; do not infer conformance from the browser snapshot.
- **Expected results:**
  - Keyboard and screen-reader observations are documented separately from axe results.
  - No conformance claim is made for combinations that were not exercised.

## Open questions

- What additional policy should apply to username/password combinations other than blank submission, username-only, invalid credentials, and the locked-out account already observed?
  - Impact: Not covered by this provisional demo plan; add scenarios only after the behavior is observed or an explicit expected result is supplied.
  - Decision owner: Project owner
- Are the observed ordering of equal-priced products and destinations/actions for All Items, Dynamic Catalog, Reset App State, and footer links contractual?
  - Impact: The plan checks only supplied labels and explicitly observed destinations; deeper interaction assertions require a decision.
  - Decision owner: Product owner
- What accessibility pass/fail threshold and screen-reader/browser matrix should apply to findings?
  - Impact: The draft defines scan and manual-review scope only. Record findings without claiming conformance until the owner sets thresholds and combinations.
  - Decision owner: Accessibility owner

## Approval request

Review the provisional acceptance oracles, explicit accessibility and isolation decisions, observed validation messages, and remaining non-blocking questions. Approval is not recorded: status remains draft and approver/approvedAt are null. Generation remains gated until a human explicitly runs the plan approval command.
