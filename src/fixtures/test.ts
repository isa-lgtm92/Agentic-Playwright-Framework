import { test as base, expect } from '@playwright/test';
import { DemoHomePage } from '../pages/demo-home.page.js';
import { SauceDemoPage } from '../pages/saucedemo.page.js';

type FrameworkFixtures = {
  demoHome: DemoHomePage;
  sauceDemo: SauceDemoPage;
};

export const test = base.extend<FrameworkFixtures>({
  demoHome: async ({ page }, use) => {
    await use(new DemoHomePage(page));
  },
  sauceDemo: async ({ page }, use) => {
    await use(new SauceDemoPage(page));
  },
});

export { expect };
