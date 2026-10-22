import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import {
  approvePlan,
  generateTestSource,
  renderMarkdown,
  validatePlan,
  validatePlanFiles,
} from './test-plan.mjs';

function createPlan(status = 'draft') {
  return {
    planId: 'PLAN-TEST-001',
    title: 'Plan workflow unit test',
    status,
    approval: {
      approver: status === 'draft' ? null : 'Test Reviewer',
      approvedAt: status === 'draft' ? null : '2026-01-01T00:00:00.000Z',
    },
    requirements: [{ id: 'REQ-001', description: 'The test fixture works.' }],
    openQuestions: [],
    scenarios: [
      {
        id: 'TC-001',
        requirementId: 'REQ-001',
        description: 'The greeting appears for a visitor.',
        priority: 'P2',
        type: 'ui-positive',
        preconditions: ['The demo app is running.'],
        steps: ['Open the page.', 'Submit Ada.'],
        expectedResults: ['Hello, Ada! is shown.'],
        automation: { kind: 'ui-greeting', name: 'Ada', expectedText: 'Hello, Ada!' },
      },
    ],
  };
}

function createInspection() {
  return {
    source: 'playwright-mcp',
    url: 'http://127.0.0.1:4173',
    pages: [
      {
        path: '/',
        title: 'Playwright AI demo',
        roles: [
          { role: 'textbox', name: 'Your name' },
          { role: 'button', name: 'Show greeting' },
          { role: 'status' },
        ],
      },
    ],
  };
}

async function createTempPlan(t, plan = createPlan()) {
  const directory = await mkdtemp(join(tmpdir(), 'playwright-plan-test-'));
  t.after(async () => rm(directory, { recursive: true, force: true }));
  const planPath = join(directory, 'test-plans', 'sample.plan.json');
  await mkdir(dirname(planPath), { recursive: true });
  await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`);
  await writeFile(planPath.replace(/\.plan\.json$/, '.plan.md'), renderMarkdown(plan));
  return planPath;
}

test('unapproved plans are rejected by the generator approval gate', async (t) => {
  const planPath = await createTempPlan(t);
  await assert.rejects(validatePlanFiles(planPath, true), /not approved \(status: draft\)/);
});

test('plan approval requires exact human confirmation and authorizes unchanged files', async (t) => {
  const planPath = await createTempPlan(t);
  await assert.rejects(approvePlan(planPath, 'Test Reviewer', 'WRONG-ID'), /must exactly match plan ID/);

  const { plan } = await approvePlan(planPath, 'Test Reviewer', 'PLAN-TEST-001');
  assert.equal(plan.status, 'approved');
  assert.equal(plan.approval.approver, 'Test Reviewer');
  await validatePlanFiles(planPath, true);
});

test('plan approval refuses unresolved blocking questions', async (t) => {
  const plan = createPlan();
  plan.openQuestions = [{ question: 'Resolve this first.', impact: 'Approval is blocked.', owner: 'Reviewer', blocking: true }];
  const planPath = await createTempPlan(t, plan);
  await assert.rejects(
    approvePlan(planPath, 'Test Reviewer', 'PLAN-TEST-001'),
    /has unresolved blocking questions/,
  );
});

test('approved plans are rejected after JSON or Markdown edits', async (t) => {
  const planPath = await createTempPlan(t);
  await approvePlan(planPath, 'Test Reviewer', 'PLAN-TEST-001');
  const modifiedPlan = JSON.parse(await readFile(planPath, 'utf8'));
  modifiedPlan.title = 'Modified after approval';
  await writeFile(planPath, `${JSON.stringify(modifiedPlan, null, 2)}\n`);
  await writeFile(planPath.replace(/\.plan\.json$/, '.plan.md'), renderMarkdown(modifiedPlan));
  await assert.rejects(validatePlanFiles(planPath, true), /changed since approval/);
});

test('approved plans are rejected when only their human-readable copy is modified', async (t) => {
  const planPath = await createTempPlan(t);
  await approvePlan(planPath, 'Test Reviewer', 'PLAN-TEST-001');
  const markdownPath = planPath.replace(/\.plan\.json$/, '.plan.md');
  await writeFile(markdownPath, `${await readFile(markdownPath, 'utf8')}\nEdited after approval.\n`);
  await assert.rejects(validatePlanFiles(planPath, true), /not synchronized with JSON/);
});

test('rendering and generation preserve case and requirement traceability', () => {
  const plan = createPlan();
  validatePlan(plan);
  const markdown = renderMarkdown(plan);
  const source = generateTestSource(plan, createInspection());

  assert.match(markdown, /TC-001/);
  assert.match(markdown, /REQ-001/);
  assert.match(source, /\[TC-001\]\[REQ-001\]/);
  assert.match(source, /demoHome\.greet/);
  assert.match(source, /toHaveText\("Hello, Ada!"\)/);
});

test('rendering documents project decisions and resolved evidence', () => {
  const plan = createPlan();
  plan.projectDecisions = [{ id: 'DEC-001', decision: 'Use isolated contexts.', basis: 'Project policy.' }];
  plan.resolvedBlockers = [{ id: 'OBS-001', resolution: 'Verified in browser.', evidence: 'Inspection record.' }];
  const markdown = renderMarkdown(plan);

  assert.match(markdown, /Explicit project decisions/);
  assert.match(markdown, /Verified in browser/);
});

test('generator rejects inspection that does not expose the planned accessible control', () => {
  const inspection = createInspection();
  inspection.pages[0].roles = [{ role: 'button', name: 'Submit' }];
  assert.throws(() => generateTestSource(createPlan(), inspection), /does not show the observed greeting form controls/);
});

test('plan validation rejects duplicate IDs and unknown requirement links', () => {
  const plan = createPlan();
  plan.scenarios[0].requirementId = 'REQ-MISSING';
  plan.scenarios.push({ ...plan.scenarios[0] });
  assert.throws(() => validatePlan(plan), /Duplicate test case ID|references unknown requirement/);
});
