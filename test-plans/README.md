# Test plans and traceability

Each plan is a same-basename pair: `*.plan.json` is the source of truth and
`*.plan.md` is the rendered, reviewable human copy. Run
`npm run plan:render -- test-plans/<name>.plan.json` after authoring JSON. The
validator rejects missing fields, duplicate test-case IDs, unknown requirement
IDs, unsupported automation kinds, and a Markdown copy that does not exactly
match the JSON.

Every case includes `id`, `requirementId`, `description`, `priority` (`P0`-`P3`),
`preconditions`, `steps`, `expectedResults`, and `type`. Requirement IDs must be
defined in the plan's `requirements` array. IDs remain stable when wording
changes and appear in generated test titles.

New plans must use `status: "draft"` and null approval fields. Review the
rendered Markdown, resolve blocking questions, then obtain a human's explicit
approval using:

```powershell
npm run plan:approve -- test-plans/<name>.plan.json --approver "Reviewer Name" --confirm PLAN-ID
```

The confirmation must exactly match the plan ID. Approval records the reviewer
and timestamp in JSON, re-renders Markdown, and writes an integrity manifest to
`.approvals/<planId>.approval.json`. The manifest hashes both files. Generation
requires approved status, matching approver/timestamp, a valid manifest, and
unchanged JSON and Markdown. Approval is refused while any `openQuestions`
entry has `blocking: true`. Any edit after approval invalidates generation;
create/review a new draft and approve it again instead of editing around the
gate. The manifest is an integrity check, not cryptographic identity or access
control; protect approved files through normal repository review.

## Generate tests

The generator requires inspection evidence captured against the actual
application. Prefer the Playwright MCP server configured in `.mcp.json`; record
the source, URL, page title, observed accessible roles/names, and observed API
response. The generator verifies that UI locators and expected API results in
the plan are present in the inspection evidence. If MCP is unavailable in the
Copilot session, the agent must disclose this and request approval before using
an alternative live browser inspection.

```powershell
npm run plan:validate -- test-plans/<name>.plan.json --approved
npm run tests:generate -- test-plans/<name>.plan.json --inspection test-plans/inspections/<name>.json
npx playwright test tests/generated/<planId>.spec.ts
```

Only explicitly supported `automation.kind` values can be generated. Unknown
or incomplete cases fail generation rather than silently disappearing.
Generated tests reuse existing fixtures and page objects, use accessible
role/label locators, and retain both case and requirement IDs.
