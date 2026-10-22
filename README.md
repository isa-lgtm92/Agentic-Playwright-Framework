# Playwright TypeScript automation foundation

This repository bootstraps an enterprise-oriented Playwright framework using
TypeScript and `@playwright/test`. It includes UI, API, and axe accessibility
examples; reusable fixtures; a page object; test-plan traceability; HTML reports;
failure screenshots/traces/videos; GitHub Actions CI; and five Copilot custom
agents under `.github/agents/`.

## Phased implementation plan

1. **Bootstrap (implemented here):** TypeScript/Playwright configuration,
   local demonstration app, UI/API/accessibility smoke examples, test-plan
   storage, agent definitions, validation script, and CI workflow.
2. **Planner and Generator workflow (implemented here):** Validate structured
   requirement-linked plans; render Markdown from JSON; require explicit human
   approval; verify approved-plan integrity hashes; inspect the application;
   generate traceable tests from supported scenario templates.
3. **Application integration (next):** Replace the demo app with the target
   application; add environment-specific configuration, secure authentication,
   domain fixtures/page objects, and representative test data.
4. **Enterprise hardening:** Add browser/OS coverage, CI sharding and artifact
   retention policy, secret-safe authentication state, API contracts, flake
   tracking, and accessibility manual-review workflows based on project needs.
5. **Operational agent workflow:** Integrate Jira, define human approval and
   review handoffs, and prove any orchestration or healing runtime with
   monitored end-to-end runs before claiming it works.

Phases 3-5 are roadmap items, not completed capabilities. The custom agents are
instructions for Copilot; they do not by themselves implement orchestration,
autonomous healing, Jira connectivity, or execution of Playwright MCP actions.

## Requirements

- Node.js 20 or newer (CI currently uses Node 22).
- npm.
- Playwright Chromium browser for UI and accessibility runs.

## Getting started

```powershell
npm ci
npx playwright install chromium
npm run check
```

The Playwright web server starts a local demo app on `127.0.0.1:4173`.
Set `BASE_URL` to point tests at another running application; when set, the
config does not start the demo server. Environment variables may be loaded from
`.env` using the included dotenv support.

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm test` | Run UI, API, and accessibility tests |
| `npm run test:ui` | Run UI tests |
| `npm run test:api` | Run API tests |
| `npm run test:a11y` | Run axe accessibility checks |
| `npm run typecheck` | Type-check TypeScript |
| `npm run validate:agents` | Validate the five agent files and YAML frontmatter |
| `npm run plan:validate -- test-plans/demo-app.plan.json` | Validate a plan and Markdown pair |
| `npm run plan:render -- test-plans/demo-app.plan.json` | Render Markdown from a draft JSON plan |
| `npm run plan:approve -- test-plans/demo-app.plan.json --approver "Reviewer Name" --confirm PLAN-DEMO-001` | Explicitly approve the reviewed plan |
| `npm run tests:generate -- test-plans/demo-app.plan.json --inspection test-plans/inspections/demo-app.json` | Generate tests from an approved plan and inspection evidence |
| `npm run test:plans` | Run approval, integrity, and generator unit tests |
| `npm run test:saucedemo` | Run SauceDemo tests with the named `saucedemo` environment (tests are added only after plan approval) |
| `npm run test:allure` | Run the five selected SauceDemo tests in Chromium and write fresh Allure results |
| `npm run allure:generate` | Generate the Allure HTML report from `allure-results/` |
| `npm run allure:open` | Open the generated report in a browser |
| `npm run allure:serve` | Generate and serve a temporary report from the latest Allure results |
| `npm run plan:validate -- test-plans/saucedemo-test-plan.json` | Validate the SauceDemo draft and rendered Markdown |
| `npm run plan:approve -- test-plans/saucedemo-test-plan.json --approver "Reviewer Name" --confirm PLAN-SAUCEDEMO-001` | Approve the reviewed SauceDemo plan after human review |
| `npm run tests:generate -- test-plans/saucedemo-test-plan.json --inspection test-plans/inspections/saucedemo.json` | Generate SauceDemo tests after approval |
| `npm run report` | Open the HTML report after a test run |

Playwright HTML reports and failure artifacts are written to
`playwright-report/` and `test-results/`. Allure writes raw results to
`allure-results/` and generated HTML to `allure-report/`. All four generated
artifact directories are ignored by Git.

## Allure reporting

Install the project dependencies with `npm ci`, install Playwright Chromium with
`npx playwright install chromium`, and ensure Java 17 or newer is available on
`PATH` for the Allure CLI. The CI workflow installs Temurin Java 17.

Run and generate the five selected SauceDemo scenarios and their Allure
results:

```powershell
npm run test:allure
npm run allure:generate
```

Open the generated report with `npm run allure:open`, or use
`npm run allure:serve` to generate and serve a temporary report. The focused
test command clears stale raw results first. Allure runs alongside (and does
not replace) Playwright's HTML reporter. Each test includes feature, story,
severity, approved test-case ID, description, and named steps. Browser,
target environment, and application origin appear in Allure environment
metadata; credentials are not included. Playwright failure screenshots,
videos, traces, and error details are attached to Allure results when produced.

## Test plans and approvals

Store a structured JSON plan and its rendered Markdown review copy under
`test-plans/`. Every test case must include a stable ID, requirement ID,
description, priority, preconditions, steps, expected results, and test type.
The planner agent keeps new plans in `draft` and renders Markdown with
`npm run plan:render`. A human reviews the Markdown and explicitly approves by
supplying an approver name and exact plan ID to `npm run plan:approve`. The
approval command records a manifest containing SHA-256 hashes of both plan
files. The generator rejects unapproved, modified, or unsynchronized plans.

Before generating tests, inspect the actual application with Playwright MCP and
save evidence containing observed roles/names and API results. The generator
checks evidence against the locators and expected API response, then writes
`tests/generated/<planId>.spec.ts`. It uses explicit templates only; an
unsupported automation kind fails instead of silently omitting a scenario. See
[test-plans/README.md](./test-plans/README.md), the [demo plan](./test-plans/demo-app.plan.md),
and its [inspection evidence](./test-plans/inspections/demo-app.json).

## SauceDemo Phase A/B

The named Playwright environment is selected with `PLAYWRIGHT_ENV=saucedemo`
and targets `https://www.saucedemo.com/`; the default `demo` environment
continues to run the local demonstration app. `npm run test:saucedemo` sets the
named environment without changing existing local test commands. SauceDemo
public demo credentials are supplied at test time and are not stored in source.

The Planner agent created provisional requirements and a test plan at
[requirements/saucedemo-requirements.md](./requirements/saucedemo-requirements.md),
[test-plans/saucedemo-test-plan.md](./test-plans/saucedemo-test-plan.md), and
[test-plans/saucedemo-test-plan.json](./test-plans/saucedemo-test-plan.json).
All 20 original scenario IDs are preserved; two separately verified checkout
field cases were added. The [inspection evidence](./test-plans/inspections/saucedemo.json) records
observed accessible names, `data-test` hooks, and validation alerts. Exploration
used the integrated browser because Playwright MCP tools were not available in
that session; no axe scan was performed. The 22-scenario plan is approved with
an integrity manifest. Five selected cases are automated in
`tests/saucedemo/saucedemo.spec.ts`; the remaining 17 scenarios are not
generated. Use `npm run test:allure` to execute the proof-of-concept suite.

## Framework conventions

- Prefer role, label, and stable test-id locators over CSS/XPath selectors.
- Use Playwright's auto-waiting and web-first assertions; do not add fixed sleeps.
- Keep tests isolated and data independent so they can run in parallel.
- Use fixtures for reusable setup and page objects for cohesive user actions.
- Keep credentials out of source control; configure secrets in CI/environment.
- Treat axe results as automated evidence, not proof of full WCAG conformance.
- Preserve plan IDs and meaningful assertions when diagnosing test failures.

## Copilot custom agents

The workspace agents are:

- **Playwright Test Planner:** creates draft plans; requests human approval.
- **Playwright Test Generator:** generates from explicitly approved plans.
- **Playwright Code Reviewer:** read-only review of test code.
- **Accessibility Reviewer:** automated axe and manual accessibility review.
- **Playwright Test Healer:** diagnoses failures; persistent repair requires approval.

The supported workspace format is `.github/agents/*.agent.md` with YAML
frontmatter. `npm run validate:agents` checks the exact five filenames,
frontmatter syntax, required metadata, and Markdown bodies. Agent availability in
a particular Copilot client still depends on that client's support and workspace
trust/configuration. The portable Copilot workspace MCP configuration in
`.mcp.json` declares the pinned Playwright MCP server; the client may
prompt before starting it, and browser/MCP startup must be verified in that
client before relying on live inspection.

The intended human-gated handoff is **Planner (draft) → requirement owner
approval → Generator → Code Reviewer and/or Accessibility Reviewer → Healer
diagnosis → explicit repair approval → rerun and review**. Agent instructions
and allowed-agent metadata support this workflow; they do not constitute a
demonstrated autonomous orchestration service.

## Scope and limitations

This bootstrap uses a local demonstration app and one Chromium project. It is
not yet a production framework integration: target application setup, secure
authentication, real acceptance coverage, cross-browser strategy, Jira
integration, and runtime agent orchestration/healing remain unimplemented. The
demo was inspected using the available integrated browser snapshot because the
configured Playwright MCP tools were not exposed in this session. The generator
agent requires MCP inspection and stops when its tools are unavailable; the
checked-in demo evidence records the actual fallback source and limitation.
