import { test, expect, type Page } from '@playwright/test';

const baseUrl = 'https://www.saucedemo.com/';
const validPassword = 'secret_sauce';

async function login(page: Page, username: string, password = validPassword) {
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();
}

async function expectLoginError(page: Page, message: string) {
  await expect(page.locator('[data-test="error"]')).toContainText(message);
}

test.describe('SauceDemo login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('login form is visible', async ({ page }) => {
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('standard user can log in', async ({ page }) => {
    await login(page, 'standard_user');

    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  });

  test('invalid credentials show an error', async ({ page }) => {
    await login(page, 'invalid_user', 'wrong_password');

    await expectLoginError(page, 'Username and password do not match any user in this service');
  });

  test('username is required when the form is empty', async ({ page }) => {
    await page.locator('[data-test="login-button"]').click();

    await expectLoginError(page, 'Username is required');
  });

  test('password is required when username is entered', async ({ page }) => {
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="login-button"]').click();

    await expectLoginError(page, 'Password is required');
  });

  test('locked out user sees a lockout error', async ({ page }) => {
    await login(page, 'locked_out_user');

    await expectLoginError(page, 'Sorry, this user has been locked out.');
  });

  test('usernames are case-sensitive', async ({ page }) => {
    await login(page, 'STANDARD_USER');

    await expectLoginError(page, 'Username and password do not match any user in this service');
  });

  test('leading and trailing spaces are rejected', async ({ page }) => {
    await login(page, ' standard_user ');

    await expectLoginError(page, 'Username and password do not match any user in this service');
  });

  test('special characters are rejected as credentials', async ({ page }) => {
    await login(page, 'user!@#$%^&*()', 'pass!@#$%^&*()');

    await expectLoginError(page, 'Username and password do not match any user in this service');
  });

  test('sql-like input is rejected', async ({ page }) => {
    await login(page, "' OR '1'='1", "' OR '1'='1");

    await expectLoginError(page, 'Username and password do not match any user in this service');
  });

  for (const username of ['problem_user', 'performance_glitch_user', 'error_user', 'visual_user']) {
    test(`${username} can reach the inventory page`, async ({ page }) => {
      await login(page, username);

      await expect(page).toHaveURL(/inventory\.html$/);
      await expect(page.locator('[data-test="inventory-container"]')).toBeVisible();
    });
  }

  test('user can log out after signing in', async ({ page }) => {
    await login(page, 'standard_user');

    await page.locator('#react-burger-menu-btn').click();
    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
    await page.locator('#logout_sidebar_link').click();

    await expect(page).toHaveURL(baseUrl);
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});