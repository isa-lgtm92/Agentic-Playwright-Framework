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
2. **Application integration (next):** Replace the demo app with the target
   application; add environment-specific configuration, secure authentication,
   domain fixtures/page objects, and representative test data.
3. **Approved coverage expansion:** Populate plans from accepted requirements,
   resolve ambiguities, record human approval, and generate tests only from
   approved scenarios.
4. **Enterprise hardening:** Add browser/OS coverage, CI sharding and artifact
   retention policy, secret-safe authentication state, API contracts, flake
   tracking, and accessibility manual-review workflows based on project needs.
5. **Operational agent workflow:** Integrate Jira, define human approval and
   review handoffs, and prove any orchestration or healing runtime with
   monitored end-to-end runs before claiming it works.

Phases 2-5 are roadmap items, not completed capabilities. The custom agents are
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
| `npm run report` | Open the HTML report after a test run |

Reports and failure artifacts are written to `playwright-report/` and
`test-results/`; both are ignored by Git.

## Test plans and approvals

Store a reviewable Markdown and structured JSON plan under `test-plans/`.
Keep scenario IDs stable and include them in automated test titles, alongside
requirement references where available. New plans must use `status: draft`.
Document a responsible approver and approval date before changing status to
`approved`. The test generator must refuse draft plans. See
[test-plans/README.md](./test-plans/README.md) and the unapproved
[demo plan](./test-plans/demo-app.plan.md).

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
Playwright MCP server is configured but has not been started or verified by this
workspace session.
