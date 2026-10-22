# SauceDemo requirements baseline — provisional

**Status:** Draft input for project-owner review. These are provisional
acceptance criteria for this demo automation project, not formal SauceDemo
product requirements or guarantees across application releases.

## Source, version, and evidence

- **Source:** User-supplied live observations and browser checks against the
  public SauceDemo application.
- **Version:** Browser observations made 2026-10-22 (no application build,
  release identifier, formal Jira story, or acceptance-criteria version was
  provided).
- **Evidence method:** Integrated browser accessibility snapshot and
  interactions. The configured Playwright MCP server was unavailable and was
  not used. No axe scan or manual screen-reader review was run.
- **Role observed:** Unauthenticated visitor / signed-in `standard_user`; the
  locked-out account is also in scope for the observed login response. The
  business meaning and authorization model of these accounts are not formally
  specified.
- **Platforms/surfaces:** Browser UI on the observed SauceDemo site; routes
  include `/`, `/inventory.html`, `/inventory-item.html?id=4`,
  `/cart.html`, `/checkout-step-one.html`, `/checkout-step-two.html`, and
  `/checkout-complete.html`. Browser/OS support matrix and API surface were
  not supplied.

## Provisional behavior entries

All entries below describe supplied observations and are provisional behavior
statements, not owner-approved product requirements. Identifiers are stable
traceability keys for this draft.

| ID | Provisional observed behavior |
| --- | --- |
| REQ-SD-001 | The public accepted-user listing includes `standard_user` and `locked_out_user`; the public password listing says `secret_sauce`. The login form is named `Login`, has `Username` and `Password` textboxes, and a `Login` button. Submitting `standard_user` with the password blank displays `Epic sadface: Password is required`. |
| REQ-SD-002 | Submitting the observed login with no credentials displays `Epic sadface: Username is required`. |
| REQ-SD-003 | An invalid username/password combination displays `Epic sadface: Username and password do not match any user in this service`. |
| REQ-SD-004 | Submitting `locked_out_user` / `secret_sauce` displays `Epic sadface: Sorry, this user has been locked out.` |
| REQ-SD-005 | `standard_user` / `secret_sauce` reaches `/inventory.html`, whose heading is `Products`, and displays six products. The observed `Sort products` combobox offers Name (A to Z), Name (Z to A), Price (low to high), and Price (high to low), with the supplied observed orderings. |
| REQ-SD-006 | Inventory product names are buttons named `View details for <name>` and products have product-specific `Add to cart` controls. Backpack detail opens `/inventory-item.html?id=4`, shows image alt `Sauce Labs Backpack`, `$29.99`, `Add to cart`, and `Back to products`. |
| REQ-SD-007 | Adding Backpack changes its control to `Remove` and the cart button name to `Cart, 1 items`; removing changes it back to `Add to cart` and cart name `Cart, empty`. |
| REQ-SD-008 | `/cart.html` shows heading `Your Cart`, QTY 1, the selected product description, `Remove`, `Continue Shopping`, and `Checkout`. |
| REQ-SD-009 | Checkout begins at `/checkout-step-one.html` with heading `Checkout: Your Information`, First Name, Last Name, Zip/Postal Code fields and Continue/Cancel buttons. Submitting with all fields empty displays `Error: First Name is required`; after supplying First Name only, the observed error is `Error: Last Name is required`; after supplying First and Last Name, the observed error is `Error: Postal Code is required`. Ada / Lovelace / 12345 reaches `/checkout-step-two.html`. |
| REQ-SD-010 | `/checkout-step-two.html` has heading `Checkout: Overview`, item `$29.99`, payment `SauceCard #31337`, shipping `Free Pony Express Delivery!`, Item total `$29.99`, Tax `$2.40`, Total `$32.39`, and Finish/Cancel buttons. |
| REQ-SD-011 | Finish opens `/checkout-complete.html`, which shows `Checkout: Complete!`, `Thank you for your order!`, the supplied dispatch copy, an empty cart, and `Back Home`. |
| REQ-SD-012 | The menu exposes Open Menu and nav buttons All Items, Dynamic Catalog, Logout, Reset App State, and About. About points to `https://saucelabs.com/`; clicking Logout returns to `/`. Footer links X, Facebook, and LinkedIn are present. |
| REQ-SD-013 | Project test scope includes automated axe-core scans on login, inventory, cart, checkout information, checkout overview, and checkout completion. Manual keyboard and screen-reader checks are documented separately. No scan or manual conformance result is claimed. |

## Additional verified validation evidence

The following messages were observed directly during browser interaction and
may be used as provisional test oracles:

| Scenario | Setup | Observed result |
| --- | --- | --- |
| Username only | Enter `standard_user`; leave Password blank; activate Login | Alert: `Epic sadface: Password is required` |
| Missing First Name | Leave First Name, Last Name, and Zip/Postal Code blank; activate Continue | Alert: `Error: First Name is required` |
| Missing Last Name | Enter `Ada` as First Name; leave Last Name and Zip/Postal Code blank; activate Continue | Alert: `Error: Last Name is required` |
| Missing Postal Code | Enter `Ada` and `Lovelace`; leave Zip/Postal Code blank; activate Continue | Alert: `Error: Postal Code is required` |

The exact messages and evidence source are also recorded in
[the browser inspection record](../test-plans/inspections/saucedemo.json).

## Explicit project decisions (not browser observations)

1. For this demo automation project, use the verified observations above as
   **provisional acceptance criteria**. This does not assert that SauceDemo's
   product owner has adopted them as contractual product requirements.
2. The named test environment is `PLAYWRIGHT_ENV=saucedemo` at
   `https://www.saucedemo.com/`. The hosted demo's deployed build identifier
   is not exposed in the evidence and may change independently.
3. Playwright's default `page` fixture creates an isolated browser context for
   each test. Tests must log in and establish their own preconditions; do not
   share storage state, account session, or cart state between tests. Use only
   the supplied public demo credentials and checkout values.
4. Cart tests must establish an empty cart before their own setup. When signed
   in, use the observed **Reset App State** menu action, assert the cart is
   named **Cart, empty**, and then add only the product needed by that scenario.
   The browser inspection observed Reset App State clearing a cart with one item.
5. Run axe-core on login, inventory, cart, checkout information, checkout
   overview, and checkout completion. Record violations by rule, impact, target,
   and route; do not assume zero findings or claim conformance before evidence
   exists. Document keyboard and screen-reader checks as separate manual work,
   including the browser and assistive technology actually used.

## Remaining non-blocking questions and limitations

1. No formal Jira story, product owner, supported browser/OS matrix, or
   application release identifier was provided. The observed behavior remains
   provisional and scoped to this demo suite.
2. Other partial/invalid credential combinations and other checkout invalid
   formats were not tested and are out of scope.
3. Sorting tie policy, other product detail pages, and behavior/destinations for
   menu/footer items beyond the explicitly observed behavior remain unverified.
4. The project scope calls for axe and separate manual checks, but no axe scan,
   keyboard review, or screen-reader review has been performed. No WCAG pass is
   claimed; the accessibility owner may later define a severity threshold and
   supported assistive-technology matrix.
5. No API contract or API test scope was supplied.

These limitations do not block review of the 22-case provisional demo plan;
they must remain visible and must not be converted into invented expectations.

## Observed accessible names and stable hooks

These names and `data-test` attributes were observed in the live browser
session. Prefer role/name locators; use the named `data-test` hooks where an
element has no useful accessible role or name. These observations are not a
promise that SauceDemo will keep the hooks stable across application releases.

| Surface | Observed accessible locator | Observed `data-test` hook |
| --- | --- | --- |
| Login | Form `Login`; textboxes `Username`, `Password`; button `Login` | `username`, `password`, `login-button` |
| Inventory | Combobox `Sort products`; button `Open Menu`; product button `View details for Sauce Labs Backpack` | `product-sort-container`, `open-menu`, `item-4-title-link`, `add-to-cart-sauce-labs-backpack` |
| Inventory product | Product name and price are rendered in the inventory card | `inventory-item`, `inventory-item-name`, `inventory-item-price`, `remove-sauce-labs-backpack` |
| Cart | Heading `Your Cart`; button `Cart, 1 items`; buttons `Remove`, `Continue Shopping`, `Checkout` | `shopping-cart-link`, `shopping-cart-badge`, `cart-contents-container`, `item-4-title-link`, `remove-sauce-labs-backpack`, `continue-shopping`, `checkout` |
| Checkout information | Textboxes `First Name`, `Last Name`, `Zip/Postal Code`; buttons `Continue`, `Cancel` | `firstName`, `lastName`, `postalCode`, `continue`, `cancel` |
| Navigation | Button `Open Menu`; nav items `All Items`, `Dynamic Catalog`, `Logout`, `Reset App State`, link `About` | `inventory-sidebar-link`, `dynamic-catalog-sidebar-link`, `logout-sidebar-link`, `reset-sidebar-link`, `about-sidebar-link` |

The inventory snapshot showed all four sort options: Name (A to Z), Name (Z to
A), Price (low to high), and Price (high to low). Runtime DOM inspection
confirmed several product and checkout `data-test` attributes listed above.
See [the inspection record](../test-plans/inspections/saucedemo.json) for
observed routes, roles, product order, and evidence limitations.
