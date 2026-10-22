import { test as base, expect } from '@playwright/test';
import { DemoHomePage } from '../pages/demo-home.page.js';

type FrameworkFixtures = {
  demoHome: DemoHomePage;
};

export const test = base.extend<FrameworkFixtures>({
  demoHome: async ({ page }, use) => {
    await use(new DemoHomePage(page));
  },
});

export { expect };
