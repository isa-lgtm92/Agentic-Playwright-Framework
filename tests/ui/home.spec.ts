import { expect, test } from '../../src/fixtures/test.js';

test('[TP-DEMO-001] a visitor can receive a personalized greeting', async ({ demoHome }) => {
  await demoHome.open();
  await demoHome.greet('Ada');

  await expect(demoHome.greeting).toHaveText('Hello, Ada!');
});

test('[TP-DEMO-002] the greeting form requires a name', async ({ demoHome }) => {
  await demoHome.open();
  await demoHome.submitButton.click();

  await expect(demoHome.nameInput).toHaveAttribute('required', '');
  await expect(demoHome.nameInput.evaluate((input) => input.matches(':invalid'))).resolves.toBe(true);
});
