import type { Locator, Page } from '@playwright/test';

export class SauceDemoPage {
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginAlert: Locator;
  readonly inventoryHeading: Locator;
  readonly inventoryItems: Locator;
  readonly backpackAddButton: Locator;
  readonly backpackRemoveButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly cartList: Locator;
  readonly cartItemQuantity: Locator;
  readonly backpackCartTitle: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;

  constructor(private readonly page: Page) {
    this.loginForm = page.getByRole('form', { name: 'Login' });
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.loginAlert = page.getByRole('alert');
    this.inventoryHeading = page.getByText('Products', { exact: true });
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.backpackAddButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.backpackRemoveButton = page.getByRole('button', { name: 'Remove' });
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartList = page.locator('[data-test="cart-list"]');
    this.cartItemQuantity = page.locator('[data-test="item-quantity"]');
    this.backpackCartTitle = page.locator('[data-test="item-4-title-link"]');
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.postalCodeInput = page.getByRole('textbox', { name: 'Zip/Postal Code' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async signIn(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async addBackpackToCart(): Promise<void> {
    await this.backpackAddButton.click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async beginCheckout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Checkout' }).click();
  }

  async enterCheckoutInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }
}
