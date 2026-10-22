import type { Locator, Page } from '@playwright/test';

export class DemoHomePage {
  readonly nameInput: Locator;
  readonly greeting: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByRole('textbox', { name: 'Your name' });
    this.greeting = page.getByRole('status');
    this.submitButton = page.getByRole('button', { name: 'Show greeting' });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async greet(name: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.submitButton.click();
  }
}
