import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const plansRoot = resolve(projectRoot, 'test-plans');
const supportedPriorities = new Set(['P0', 'P1', 'P2', 'P3']);
const supportedTypes = new Set([
  'ui-positive',
  'ui-negative',
  'ui-boundary',
  'ui-edge',
  'api-positive',
  'api-negative',
  'api-boundary',
  'accessibility',
]);
const supportedAutomation = new Set([
  'ui-greeting',
  'ui-required-field',
  'api-json-get',
  'accessibility-axe',
]);

function fail(message) {
  throw new Error(message);
}

function ensurePlanPath(inputPath) {
  if (!inputPath) {
    fail('A test-plans/*.json path is required.');
  }

  const planPath = resolve(projectRoot, inputPath);
  const planRelative = relative(plansRoot, planPath);
  if (planRelative.startsWith('..') || isAbsolute(planRelative) || !planPath.endsWith('.json')) {
    fail('Plan files must be *.json files inside test-plans/.');
  }

  return planPath;
}

function siblingMarkdownPath(planPath) {
  return planPath.replace(/\.json$/, '.md');
}

function approvalPath(plan) {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,79}$/.test(plan.planId)) {
    fail(`Invalid planId "${plan.planId}". Use 2-80 letters, digits, underscores, or hyphens.`);
  }

  return resolve(dirname(plan.planPath), '.approvals', `${plan.planId}.approval.json`);
}

function requireString(value, field, errors) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${field} must be a non-empty string.`);
  }
}

function requireStringArray(value, field, errors) {
  if (!Array.isArray(value) || value.length === 0 || value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    errors.push(`${field} must be a non-empty array of non-empty strings.`);
  }
}

function validateScenarioAutomation(scenario, errors) {
  const automation = scenario.automation;
  const prefix = `Scenario ${scenario.id ?? '<unknown>'} automation`;

  if (!automation || typeof automation !== 'object' || !supportedAutomation.has(automation.kind)) {
    if (
      automation?.kind === 'planned' &&
      typeof automation.phase === 'string' &&
      typeof automation.rationale === 'string' &&
      typeof automation.approach === 'string'
    ) {
      return;
    }
    errors.push(`${prefix} must use one of: ${[...supportedAutomation, 'planned']}.`);
    return;
  }

  switch (automation.kind) {
    case 'ui-greeting':
      requireString(automation.name, `${prefix}.name`, errors);
      requireString(automation.expectedText, `${prefix}.expectedText`, errors);
      if (scenario.type !== 'ui-positive') {
        errors.push(`${prefix} ui-greeting requires type ui-positive.`);
      }
      break;
    case 'ui-required-field':
      requireString(automation.fieldName, `${prefix}.fieldName`, errors);
      if (scenario.type !== 'ui-negative') {
        errors.push(`${prefix} ui-required-field requires type ui-negative.`);
      }
      break;
    case 'api-json-get':
      requireString(automation.path, `${prefix}.path`, errors);
      if (typeof automation.path === 'string' && !automation.path.startsWith('/')) {
        errors.push(`${prefix}.path must be an application-relative path beginning with "/".`);
      }
      if (!Number.isInteger(automation.expectedStatus) || automation.expectedStatus < 100 || automation.expectedStatus > 599) {
        errors.push(`${prefix}.expectedStatus must be a valid HTTP status.`);
      }
      if (automation.expectedBody === undefined) {
        errors.push(`${prefix}.expectedBody is required.`);
      }
      if (!scenario.type.startsWith('api-')) {
        errors.push(`${prefix} api-json-get requires an api-* scenario type.`);
      }
      break;
    case 'accessibility-axe':
      requireString(automation.path, `${prefix}.path`, errors);
      requireStringArray(automation.tags, `${prefix}.tags`, errors);
      if (scenario.type !== 'accessibility') {
        errors.push(`${prefix} accessibility-axe requires type accessibility.`);
      }
      break;
  }
}

export function validatePlan(plan) {
  const errors = [];
  requireString(plan.planId, 'planId', errors);
  requireString(plan.title, 'title', errors);

  if (!['draft', 'approved'].includes(plan.status)) {
    errors.push('status must be "draft" or "approved".');
  }
  if (!Array.isArray(plan.requirements) || plan.requirements.length === 0) {
    errors.push('requirements must contain at least one requirement.');
  }
  if (!Array.isArray(plan.scenarios) || plan.scenarios.length === 0) {
    errors.push('scenarios must contain at least one test case.');
  }
  if (!Array.isArray(plan.openQuestions)) {
    errors.push('openQuestions must be an array.');
  }

  const requirementIds = new Set();
  for (const requirement of plan.requirements ?? []) {
    requireString(requirement.id, 'Requirement id', errors);
    requireString(requirement.description, `Requirement ${requirement.id ?? '<unknown>'} description`, errors);
    if (requirementIds.has(requirement.id)) {
      errors.push(`Duplicate requirement ID "${requirement.id}".`);
    }
    requirementIds.add(requirement.id);
  }

  const scenarioIds = new Set();
  for (const scenario of plan.scenarios ?? []) {
    requireString(scenario.id, 'Scenario id', errors);
    requireString(scenario.requirementId, `Scenario ${scenario.id ?? '<unknown>'} requirementId`, errors);
    requireString(scenario.description, `Scenario ${scenario.id ?? '<unknown>'} description`, errors);
    requireStringArray(scenario.preconditions, `Scenario ${scenario.id ?? '<unknown>'} preconditions`, errors);
    requireStringArray(scenario.steps, `Scenario ${scenario.id ?? '<unknown>'} steps`, errors);
    requireStringArray(scenario.expectedResults, `Scenario ${scenario.id ?? '<unknown>'} expectedResults`, errors);

    if (scenarioIds.has(scenario.id)) {
      errors.push(`Duplicate test case ID "${scenario.id}".`);
    }
    scenarioIds.add(scenario.id);

    if (!requirementIds.has(scenario.requirementId)) {
      errors.push(`Scenario ${scenario.id ?? '<unknown>'} references unknown requirement "${scenario.requirementId}".`);
    }
    if (!supportedPriorities.has(scenario.priority)) {
      errors.push(`Scenario ${scenario.id ?? '<unknown>'} priority must be P0, P1, P2, or P3.`);
    }
    if (!supportedTypes.has(scenario.type)) {
      errors.push(`Scenario ${scenario.id ?? '<unknown>'} has unsupported type "${scenario.type}".`);
    }
    validateScenarioAutomation(scenario, errors);
  }

  for (const question of plan.openQuestions ?? []) {
    if (!question || typeof question !== 'object' || typeof question.blocking !== 'boolean') {
      errors.push('Each open question must have a boolean blocking field.');
    }
  }

  if (!plan.approval || typeof plan.approval !== 'object') {
    errors.push('approval metadata is required.');
  } else if (plan.status === 'draft') {
    if (plan.approval.approver !== null || plan.approval.approvedAt !== null) {
      errors.push('Draft plans must have null approver and approvedAt fields.');
    }
  } else {
    requireString(plan.approval.approver, 'approval.approver', errors);
    requireString(plan.approval.approvedAt, 'approval.approvedAt', errors);
    if (typeof plan.approval.approvedAt === 'string' && Number.isNaN(Date.parse(plan.approval.approvedAt))) {
      errors.push('approval.approvedAt must be a valid date/time.');
    }
  }

  if (errors.length > 0) {
    fail(`Invalid test plan:\n- ${errors.join('\n- ')}`);
  }
}

export function renderMarkdown(plan) {
  const lines = [
    `# ${plan.title}`,
    '',
    `**Plan ID:** ${plan.planId}`,
    `**Status:** ${plan.status.toUpperCase()}`,
    `**Approval:** ${plan.approval.approver ?? 'Not approved'}${plan.approval.approvedAt ? ` (${plan.approval.approvedAt})` : ''}`,
    '',
    '## Requirements',
    '',
    '| Requirement ID | Description |',
    '| --- | --- |',
    ...plan.requirements.map(({ id, description }) => `| ${id} | ${description.replaceAll('|', '\\|')} |`),
    '',
  ];

  if (plan.scope || plan.environment || plan.assumptions || plan.projectDecisions || plan.resolvedBlockers) {
    lines.push('## Planning context', '');
    if (plan.scope) lines.push(`- **Scope:** ${plan.scope}`);
    if (plan.environment) lines.push(`- **Environment/data:** ${plan.environment}`);
    if (plan.assumptions) {
      lines.push('- **Assumptions:**');
      lines.push(...plan.assumptions.map((item) => `  - ${item}`));
    }
    if (Array.isArray(plan.projectDecisions) && plan.projectDecisions.length > 0) {
      lines.push('', '### Explicit project decisions');
      for (const decision of plan.projectDecisions) {
        lines.push(`- **${decision.id}:** ${decision.decision}`, `  - Basis: ${decision.basis}`);
      }
    }
    if (Array.isArray(plan.resolvedBlockers) && plan.resolvedBlockers.length > 0) {
      lines.push('', '### Resolved blockers');
      for (const blocker of plan.resolvedBlockers) {
        lines.push(`- **${blocker.id}:** ${blocker.resolution}`, `  - Evidence/decision: ${blocker.evidence}`);
      }
    }
    lines.push('');
  }

  lines.push(
    '## Test cases',
  );

  for (const scenario of plan.scenarios) {
    lines.push(
      '',
      `### ${scenario.id} — ${scenario.description}`,
      '',
      `- **Requirement:** ${scenario.requirementId}`,
      `- **Priority:** ${scenario.priority}`,
      `- **Type:** ${scenario.type}`,
      ...(scenario.status ? [`- **Scenario status:** ${scenario.status}`] : []),
      `- **Automation:** ${scenario.automation.kind}`,
      ...(scenario.automation.kind === 'planned'
        ? [
            `  - **Phase:** ${scenario.automation.phase}`,
            `  - **Approach:** ${scenario.automation.approach}`,
            `  - **Rationale:** ${scenario.automation.rationale}`,
          ]
        : []),
      '- **Preconditions:**',
      ...scenario.preconditions.map((item) => `  - ${item}`),
      '- **Steps:**',
      ...scenario.steps.map((item, index) => `  ${index + 1}. ${item}`),
      '- **Expected results:**',
      ...scenario.expectedResults.map((item) => `  - ${item}`),
    );
  }

  lines.push('', '## Open questions', '');
  if (plan.openQuestions.length === 0) {
    lines.push('None.');
  } else {
    for (const question of plan.openQuestions) {
      lines.push(
        `- ${question.blocking ? '**Blocking:** ' : ''}${question.question}`,
        ...(question.impact ? [`  - Impact: ${question.impact}`] : []),
        ...(question.owner ? [`  - Decision owner: ${question.owner}`] : []),
      );
    }
  }
  if (plan.approvalRequest) {
    lines.push('', '## Approval request', '', plan.approvalRequest);
  }
  lines.push('');
  return lines.join('\n');
}

async function readPlan(planPath) {
  let plan;
  try {
    plan = JSON.parse(await readFile(planPath, 'utf8'));
  } catch (error) {
    fail(`Cannot read JSON plan "${planPath}": ${error.message}`);
  }

  plan.planPath = planPath;
  validatePlan(plan);
  return plan;
}

async function atomicWrite(filePath, content) {
  await mkdir(dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, content, { flag: 'wx' });
  await rename(temporaryPath, filePath);
}

async function readMarkdown(planPath) {
  const markdownPath = siblingMarkdownPath(planPath);
  try {
    return await readFile(markdownPath, 'utf8');
  } catch (error) {
    fail(`Cannot read paired Markdown plan "${markdownPath}": ${error.message}`);
  }
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export async function validatePlanFiles(planPath, requireApproved = false) {
  const plan = await readPlan(planPath);
  const markdown = await readMarkdown(planPath);

  if (markdown !== renderMarkdown(plan)) {
    fail(`Markdown plan is not synchronized with JSON. Run npm run plan:render -- ${relative(projectRoot, planPath)}.`);
  }
  if (requireApproved || plan.status === 'approved') {
    await verifyApproval(plan, markdown);
  }
  if (requireApproved && plan.status !== 'approved') {
    fail(`Plan ${plan.planId} is not approved (status: ${plan.status}).`);
  }

  return plan;
}

export async function verifyApproval(plan, markdown) {
  if (plan.status !== 'approved') {
    fail(`Plan ${plan.planId} is not approved (status: ${plan.status}).`);
  }

  const manifestPath = approvalPath(plan);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch {
    fail(`Plan ${plan.planId} has no valid approval manifest. Approval must be recorded with the plan approval command.`);
  }

  const json = await readFile(plan.planPath, 'utf8');
  if (
    manifest.planId !== plan.planId ||
    manifest.approver !== plan.approval.approver ||
    manifest.approvedAt !== plan.approval.approvedAt ||
    manifest.jsonSha256 !== sha256(json) ||
    manifest.markdownSha256 !== sha256(markdown)
  ) {
    fail(`Plan ${plan.planId} or its Markdown has changed since approval. Create and approve a new draft.`);
  }

  return manifest;
}

function hasObservedRole(page, role, name) {
  return page.roles.some((observed) => observed.role === role && observed.name === name);
}

export function validateInspection(plan, inspection) {
  if (!inspection || !['playwright-mcp', 'interactive-browser'].includes(inspection.source)) {
    fail('Inspection evidence source must be "playwright-mcp" or "interactive-browser".');
  }
  if (typeof inspection.url !== 'string' || typeof inspection.pages !== 'object' || !Array.isArray(inspection.pages)) {
    fail('Inspection evidence requires a URL and pages array.');
  }

  for (const scenario of plan.scenarios) {
    const automation = scenario.automation;
    if (automation.kind.startsWith('ui-') || automation.kind === 'accessibility-axe') {
      const route = automation.path ?? '/';
      const page = inspection.pages.find((observed) => observed.path === route);
      if (!page || typeof page.title !== 'string' || !Array.isArray(page.roles)) {
        fail(`Inspection evidence is missing page "${route}" required by ${scenario.id}.`);
      }
      if (automation.kind === 'ui-greeting') {
        if (
          !hasObservedRole(page, 'textbox', 'Your name') ||
          !hasObservedRole(page, 'button', 'Show greeting') ||
          !page.roles.some((observed) => observed.role === 'status')
        ) {
          fail(`Inspection evidence does not show the observed greeting form controls required by ${scenario.id}.`);
        }
      }
      if (automation.kind === 'ui-required-field' && !hasObservedRole(page, 'textbox', automation.fieldName)) {
        fail(`Inspection evidence does not show textbox "${automation.fieldName}" required by ${scenario.id}.`);
      }
    }

    if (automation.kind === 'api-json-get') {
      const endpoint = inspection.api?.find((observed) => observed.method === 'GET' && observed.path === automation.path);
      if (
        !endpoint ||
        endpoint.status !== automation.expectedStatus ||
        JSON.stringify(endpoint.body) !== JSON.stringify(automation.expectedBody)
      ) {
        fail(`Inspection evidence does not confirm the expected GET ${automation.path} status and JSON for ${scenario.id}.`);
      }
    }
  }
}

function literal(value) {
  return JSON.stringify(value);
}

export function generateTestSource(plan, inspection) {
  validateInspection(plan, inspection);
  const lines = [
    "import { expect, test } from '../../src/fixtures/test.js';",
    "import AxeBuilder from '@axe-core/playwright';",
    '',
    `test.describe(${literal(`${plan.planId}: ${plan.title}`)}, () => {`,
  ];

  for (const scenario of plan.scenarios) {
    const title = `[${scenario.id}][${scenario.requirementId}] ${scenario.description}`;
    const automation = scenario.automation;
    lines.push('', `  test(${literal(title)}, async ({ page, request, demoHome }) => {`);

    switch (automation.kind) {
      case 'ui-greeting':
        lines.push(
          '    await demoHome.open();',
          `    await demoHome.greet(${literal(automation.name)});`,
          `    await expect(demoHome.greeting).toHaveText(${literal(automation.expectedText)});`,
        );
        break;
      case 'ui-required-field':
        lines.push(
          '    await demoHome.open();',
          '    await demoHome.submitButton.click();',
          `    await expect(page.getByRole('textbox', { name: ${literal(automation.fieldName)} })).toHaveAttribute('required', '');`,
          `    await expect(page.getByRole('textbox', { name: ${literal(automation.fieldName)} }).evaluate((field) => field.matches(':invalid'))).resolves.toBe(true);`,
        );
        break;
      case 'api-json-get':
        lines.push(
          `    const response = await request.get(${literal(automation.path)});`,
          `    expect(response.status()).toBe(${automation.expectedStatus});`,
          '    await expect(response).toBeOK();',
          `    await expect(response.json()).resolves.toEqual(${literal(automation.expectedBody)});`,
        );
        break;
      case 'accessibility-axe':
        lines.push(
          `    await page.goto(${literal(automation.path)});`,
          '    const results = await new AxeBuilder({ page })',
          `      .withTags(${literal(automation.tags)})`,
          '      .analyze();',
          '    expect(results.violations).toEqual([]);',
        );
        break;
      default:
        fail(`No test generator is implemented for "${automation.kind}".`);
    }

    lines.push('  });');
  }

  lines.push('});', '');
  return lines.join('\n');
}

export async function approvePlan(planPath, approver, confirmation) {
  const plan = await readPlan(planPath);
  const markdown = await readMarkdown(planPath);
  if (markdown !== renderMarkdown(plan)) {
    fail(`Reviewable Markdown is out of date. Run npm run plan:render -- ${relative(projectRoot, planPath)} before approval.`);
  }
  if (plan.status !== 'draft') {
    fail(`Plan ${plan.planId} is not a draft and cannot be approved again.`);
  }
  if (confirmation !== plan.planId) {
    fail(`Approval confirmation must exactly match plan ID "${plan.planId}".`);
  }
  if (typeof approver !== 'string' || approver.trim() === '') {
    fail('A non-empty human approver name is required.');
  }
  if (plan.openQuestions.some((question) => question.blocking)) {
    fail(`Plan ${plan.planId} has unresolved blocking questions and cannot be approved.`);
  }

  const manifestPath = approvalPath(plan);
  try {
    await readFile(manifestPath);
    fail(`An approval manifest already exists for ${plan.planId}; use a new plan ID for revisions.`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  plan.status = 'approved';
  plan.approval = { approver: approver.trim(), approvedAt: new Date().toISOString() };
  validatePlan(plan);
  const json = `${JSON.stringify(Object.fromEntries(Object.entries(plan).filter(([key]) => key !== 'planPath')), null, 2)}\n`;
  const updatedMarkdown = renderMarkdown(plan);

  await atomicWrite(planPath, json);
  await atomicWrite(siblingMarkdownPath(planPath), updatedMarkdown);
  const manifest = {
    version: 1,
    planId: plan.planId,
    approver: plan.approval.approver,
    approvedAt: plan.approval.approvedAt,
    jsonSha256: sha256(json),
    markdownSha256: sha256(updatedMarkdown),
  };
  await atomicWrite(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return { plan, manifestPath };
}

function parseOptions(args) {
  const positional = [];
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument.startsWith('--')) {
      const name = argument.slice(2);
      if (name === 'approved') {
        if (options[name] !== undefined) {
          fail(`Option ${argument} must not be repeated.`);
        }
        options[name] = true;
        continue;
      }
      if (options[name] !== undefined || !args[index + 1] || args[index + 1].startsWith('--')) {
        fail(`Option ${argument} requires one value and must not be repeated.`);
      }
      options[name] = args[index + 1];
      index += 1;
    } else {
      positional.push(argument);
    }
  }

  return { positional, options };
}

async function runCli() {
  const [command, ...args] = process.argv.slice(2);
  const { positional, options } = parseOptions(args);
  const planPath = ensurePlanPath(positional[0]);

  if (command === 'validate') {
    const plan = await validatePlanFiles(planPath, options.approved === true);
    console.log(`Valid ${plan.status} plan ${plan.planId}: ${relative(projectRoot, planPath)}`);
    return;
  }

  if (command === 'render') {
    const plan = await readPlan(planPath);
    if (plan.status !== 'draft') {
      fail('Approved plans are immutable. Create a new draft before changing plan content.');
    }
    const markdownPath = siblingMarkdownPath(planPath);
    await atomicWrite(markdownPath, renderMarkdown(plan));
    console.log(`Rendered ${relative(projectRoot, markdownPath)} from ${relative(projectRoot, planPath)}.`);
    return;
  }

  if (command === 'approve') {
    const { plan, manifestPath } = await approvePlan(planPath, options.approver, options.confirm);
    console.log(`Approved ${plan.planId} by ${plan.approval.approver} at ${plan.approval.approvedAt}.`);
    console.log(`Integrity manifest: ${relative(projectRoot, manifestPath)}`);
    return;
  }

  if (command === 'generate') {
    if (!options.inspection) {
      fail('Generation requires --inspection <evidence.json> captured from the actual application.');
    }
    const plan = await validatePlanFiles(planPath, true);
    const inspectionPath = resolve(projectRoot, options.inspection);
    let inspection;
    try {
      inspection = JSON.parse(await readFile(inspectionPath, 'utf8'));
    } catch (error) {
      fail(`Cannot read inspection evidence "${inspectionPath}": ${error.message}`);
    }
    const source = generateTestSource(plan, inspection);
    const outputDirectory = resolve(projectRoot, 'tests/generated');
    const outputPath = resolve(outputDirectory, `${plan.planId}.spec.ts`);
    await mkdir(outputDirectory, { recursive: true });
    try {
      await writeFile(outputPath, source, { flag: 'wx' });
      console.log(`Generated ${relative(projectRoot, outputPath)} from ${plan.planId} using ${inspection.source} evidence.`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
      const existing = await readFile(outputPath, 'utf8');
      if (existing !== source) {
        fail(`Refusing to overwrite existing generated test ${relative(projectRoot, outputPath)}. Review changes manually.`);
      }
      console.log(`Generated test is already current: ${relative(projectRoot, outputPath)}.`);
    }
    return;
  }

  fail('Command must be one of: validate, render, approve, generate.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
