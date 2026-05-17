import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('search dialog opens', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the search button.
  await page.getByRole('button', { name: /^Search/ }).click();

  // Expect the search dialog placeholder to be visible.
  await expect(page.getByPlaceholder('Search docs')).toBeVisible();
});

test('Mobile View: "Node.js" dropdown shows available languages', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('https://playwright.dev/');

  // Open the mobile navigation and expand the Node.js language menu.
  await page.getByRole('button', { name: 'Toggle navigation bar' }).click();

  const nodeJsMenu = page
    .locator('li')
    .filter({ has: page.getByRole('button', { name: 'Node.js', exact: true }) })
    .first();

  await nodeJsMenu.getByRole('button', { name: /expand the dropdown/i }).click();

  // Expect the language options inside the Node.js dropdown.
  await expect(nodeJsMenu.getByRole('link', { name: 'Python', exact: true })).toBeVisible();
  await expect(nodeJsMenu.getByRole('link', { name: 'Java', exact: true })).toBeVisible();
  await expect(nodeJsMenu.getByRole('link', { name: '.NET', exact: true })).toBeVisible();
});

test('Full Screen View: "Node.js" dropdown shows available languages', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('https://playwright.dev/');

  // Expand the desktop Node.js language menu.
  const nodeJsButton = page.locator('a.navbar__link', { hasText: 'Node.js' });
  await nodeJsButton.click();

  // Expect the language options inside the Node.js dropdown.
  await expect(page.locator('a[href="/python/"]')).toBeVisible();
  await expect(page.locator('a[href="/java/"]')).toBeVisible();
  await expect(page.locator('a[href="/dotnet/"]')).toBeVisible();
});