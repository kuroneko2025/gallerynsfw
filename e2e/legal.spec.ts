import { expect, test } from '@playwright/test';
import { waitForAppReady } from './helpers/app-ready';
import { mockKuronekoApi } from './helpers/mock-api';

const languages = [
  { option: '日本語', privacy: 'プライバシーポリシー', terms: '利用規約' },
  { option: 'Español', privacy: 'Política de Privacidad', terms: 'Términos de Servicio' },
  { option: 'English', privacy: 'Privacy Policy', terms: 'Terms of Service' },
  { option: '简体中文', privacy: '隐私政策', terms: '服务条款' },
  { option: '繁體中文', privacy: '隱私政策', terms: '服務條款' }
] as const;

test.beforeEach(async ({ page }) => {
  await mockKuronekoApi(page);
});

test('Linktree exposes discrete legal links', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kuronekoLanguage', 'es'));
  await page.goto('/');
  await waitForAppReady(page);

  await expect(page.locator('.linktree__legal-links')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Política de Privacidad' })).toHaveAttribute('href', '/privacy');
  await expect(page.getByRole('link', { name: 'Términos de Servicio' })).toHaveAttribute('href', '/terms');

  await page.getByRole('link', { name: 'Política de Privacidad' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { name: 'Política de Privacidad', level: 1 })).toBeVisible();
});

test('legal pages reuse one localized structure across five languages', async ({ page }) => {
  await page.goto('/privacy');
  await waitForAppReady(page);

  for (const language of languages) {
    await page.locator('.language-selector select').selectOption({ label: language.option });
    await expect(page.getByRole('heading', { name: language.privacy, level: 1 })).toBeVisible();
    await expect(page.locator('.legal-document__section')).toHaveCount(15);

    await page.getByRole('link', { name: language.terms }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page.getByRole('heading', { name: language.terms, level: 1 })).toBeVisible();
    await expect(page.locator('.legal-document__section')).toHaveCount(14);

    await page.getByRole('link', { name: language.privacy }).click();
    await expect(page).toHaveURL(/\/privacy$/);
  }
});
