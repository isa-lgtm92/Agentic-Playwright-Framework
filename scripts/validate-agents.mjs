import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';

const directoryPath = fileURLToPath(new URL('../.github/agents/', import.meta.url));
const expectedFiles = [
  'accessibility-reviewer.agent.md',
  'code-reviewer.agent.md',
  'playwright-test-generator.agent.md',
  'playwright-test-healer.agent.md',
  'playwright-test-planner.agent.md',
].sort();
const actualFiles = readdirSync(directoryPath).filter((file) => file.endsWith('.agent.md')).sort();
const errors = [];

if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
  errors.push(`Expected exactly these five agent files: ${expectedFiles.join(', ')}; found: ${actualFiles.join(', ')}`);
}

for (const file of actualFiles) {
  const content = readFileSync(join(directoryPath, file), 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    errors.push(`${file}: missing YAML frontmatter delimiters or Markdown body`);
    continue;
  }

  const document = parseDocument(match[1]);
  const frontmatter = document.toJSON();
  if (document.errors.length > 0) {
    errors.push(`${file}: invalid YAML: ${document.errors.map((error) => error.message).join('; ')}`);
    continue;
  }

  if (typeof frontmatter?.name !== 'string' || frontmatter.name.trim() === '') {
    errors.push(`${file}: frontmatter must define a non-empty name`);
  }
  if (typeof frontmatter?.description !== 'string' || frontmatter.description.trim() === '') {
    errors.push(`${file}: frontmatter must define a non-empty description`);
  }
  if (!Array.isArray(frontmatter?.tools) || frontmatter.tools.some((tool) => typeof tool !== 'string')) {
    errors.push(`${file}: frontmatter tools must be a list of tool names`);
  }
  if (typeof frontmatter?.['user-invocable'] !== 'boolean') {
    errors.push(`${file}: frontmatter must define user-invocable as a boolean`);
  }
  if (match[2].trim() === '') {
    errors.push(`${file}: Markdown instructions are missing`);
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${actualFiles.length} Copilot custom agent files and YAML frontmatter.`);
}
