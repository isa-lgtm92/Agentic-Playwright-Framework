import 'allure-playwright/autoconfig';
import { expect, test } from '../../src/fixtures/test.js';
import {
  description,
  feature,
  severity,
  story,
  testCaseId,
} from 'allure-js-commons';

const standardUser = 'standard_user';
const demoPassword = 'secret_sauce';

async function addAllureMetadata(metadata: {
  feature: string;
  story: string;
  severity: 'normal' | 'critical';
  testCaseId: string;
  description: string;
}): Promise<void> {
  await Promise.all([
    feature(metadata.feature),
    story(metadata.story),
    severity(metadata.severity),
    testCaseId(metadata.testCaseId),
    description(metadata.description),
  ]);
}

test(
  '[SD-LOGIN-001][REQ-SD-001] valid standard user login',
  { tag: ['@smoke', '@regression'] },
  async ({ page, sauceDemo }) => {
    await addAllureMetadata({
      feature: 'Authentication',
      story: 'Valid Login',
      severity: 'normal',
      testCaseId: 'SD-LOGIN-001',
      description: 'Sign in with the approved standard_user credentials and verify the inventory page.',
    });

    await test.step('Open login page and verify the observed login controls', async () => {
      await sauceDemo.open();

      await expect(sauceDemo.loginForm).toBeVisible();
      await expect(page.getByText('standard_user')).toBeVisible();
      await expect(page.getByText('locked_out_user')).toBeVisible();
      await expect(page.getByText('secret_sauce')).toBeVisible();
      await expect(sauceDemo.usernameInput).toBeVisible();
      await expect(sauceDemo.passwordInput).toBeVisible();
      await expect(sauceDemo.loginButton).toBeVisible();
    });

    await test.step('Sign in and verify the inventory', async () => {
      await sauceDemo.signIn(standardUser, demoPassword);

      await expect(page).toHaveURL(/\/inventory\.html$/);
      await expect(sauceDemo.inventoryHeading).toBeVisible();
      await expect(sauceDemo.inventoryItems).toHaveCount(6);
    });
  },
);

test(
  '[SD-LOGIN-002][REQ-SD-003] invalid credentials show the observed alert',
  { tag: '@regression' },
  async ({ sauceDemo }) => {
    await addAllureMetadata({
      feature: 'Authentication',
      story: 'Invalid Login',
      severity: 'normal',
      testCaseId: 'SD-LOGIN-002',
      description: 'Reject invalid credentials and display the approved mismatch alert.',
    });

    await test.step('Submit invalid credentials', async () => {
      await sauceDemo.open();
      await sauceDemo.signIn('invalid_user', 'wrong_password');
    });

    await test.step('Verify the observed invalid-credentials alert', async () => {
      await expect(sauceDemo.loginAlert).toHaveText(
        'Epic sadface: Username and password do not match any user in this service.',
      );
    });
  },
);

test(
  '[SD-LOGIN-003][REQ-SD-004] locked-out user sees the observed alert',
  { tag: '@regression' },
  async ({ sauceDemo }) => {
    await addAllureMetadata({
      feature: 'Authentication',
      story: 'Locked-Out User',
      severity: 'normal',
      testCaseId: 'SD-LOGIN-003',
      description: 'Reject the locked-out public demo account and display its observed alert.',
    });

    await test.step('Submit locked-out account credentials', async () => {
      await sauceDemo.open();
      await sauceDemo.signIn('locked_out_user', demoPassword);
    });

    await test.step('Verify the locked-out alert', async () => {
      await expect(sauceDemo.loginAlert).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    });
  },
);

test(
  '[SD-CART-001][REQ-SD-007] add Backpack and verify badge and cart contents',
  { tag: ['@smoke', '@regression'] },
  async ({ page, sauceDemo }) => {
    await addAllureMetadata({
      feature: 'Shopping Cart',
      story: 'Add Product to Cart',
      severity: 'critical',
      testCaseId: 'SD-CART-001',
      description: 'Add the Backpack and verify its inventory action, cart badge, and cart contents.',
    });

    await test.step('Sign in and add the Backpack', async () => {
      await sauceDemo.open();
      await sauceDemo.signIn(standardUser, demoPassword);

      await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
      await sauceDemo.addBackpackToCart();
      await expect(sauceDemo.backpackRemoveButton).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cart, 1 items' })).toBeVisible();
      await expect(sauceDemo.cartBadge).toHaveText('1');
    });

    await test.step('Verify the Backpack in the cart', async () => {
      await sauceDemo.openCart();

      await expect(page.getByText('Your Cart', { exact: true })).toBeVisible();
      await expect(sauceDemo.backpackCartTitle).toHaveText('Sauce Labs Backpack');
      await expect(sauceDemo.cartItemQuantity).toHaveText('1');
      await expect(sauceDemo.cartList.getByText('$29.99', { exact: true })).toBeVisible();
    });
  },
);

test(
  '[SD-CHECKOUT-004][REQ-SD-011] complete Backpack checkout and verify confirmation',
  { tag: ['@smoke', '@regression'] },
  async ({ page, sauceDemo }) => {
    await addAllureMetadata({
      feature: 'Checkout',
      story: 'Complete Checkout',
      severity: 'critical',
      testCaseId: 'SD-CHECKOUT-004',
      description: 'Complete checkout for the Backpack and verify the observed order confirmation.',
    });

    await test.step('Sign in and prepare an independent Backpack order', async () => {
      await sauceDemo.open();
      await sauceDemo.signIn(standardUser, demoPassword);
      await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();

      await sauceDemo.addBackpackToCart();
      await sauceDemo.openCart();
      await expect(sauceDemo.backpackCartTitle).toHaveText('Sauce Labs Backpack');
      await expect(sauceDemo.cartItemQuantity).toHaveText('1');
    });

    await test.step('Enter checkout information and review the order', async () => {
      await sauceDemo.beginCheckout();

      await expect(page.getByText('Checkout: Your Information', { exact: true })).toBeVisible();
      await sauceDemo.enterCheckoutInformation('Ada', 'Lovelace', '12345');
      await expect(page.getByText('Checkout: Overview', { exact: true })).toBeVisible();
      await expect(page.getByText('Item total: $29.99', { exact: true })).toBeVisible();
      await expect(page.getByText('Tax: $2.40', { exact: true })).toBeVisible();
      await expect(page.getByText('Total: $32.39', { exact: true })).toBeVisible();
    });

    await test.step('Finish checkout and verify the order confirmation', async () => {
      await sauceDemo.finishButton.click();

      await expect(page).toHaveURL(/\/checkout-complete\.html$/);
      await expect(page.getByText('Checkout: Complete!', { exact: true })).toBeVisible();
      await expect(page.getByText('Thank you for your order!', { exact: true })).toBeVisible();
      await expect(
        page.getByText('Your order has been dispatched, and will arrive just as fast as the pony can get there!', {
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Back Home' })).toBeVisible();
    });
  },
);
