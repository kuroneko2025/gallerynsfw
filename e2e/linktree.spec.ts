import { expect, type Route, test } from '@playwright/test';
import { waitForAppReady } from './helpers/app-ready';
import { mockKuronekoApi } from './helpers/mock-api';

test.beforeEach(async ({ page }) => {
  await mockKuronekoApi(page);
});

test('loads the public LinkTree with primary actions', async ({ page }) => {
  await page.goto('/');
  await waitForAppReady(page);

  await expect(page.locator('.linktree__title')).toBeVisible();
  await expect(page.getByRole('link', { name: /Pixiv/ })).toBeVisible();
  await expect(page.locator('a[href*="x.com"]')).toHaveCount(3);
  await expect(page.locator('.linktree__payment-notice')).toBeVisible();
  await expect(page.locator('.linktree__payment-notice')).toContainText(/お支払い方法|Medios de pago|Payment methods|支付方式/);
  await expect(page.locator('a[href*="fanbox"], a[href*="paypal"]')).toHaveCount(0);
  await expect(page.locator('.linktree__button--system')).toBeVisible();
  await expect(page.locator('.linktree__counter')).toBeVisible();
  await expect(page.locator('.linktree__music')).toBeVisible();
});

test('keeps backend-managed Linktree content hidden while config is loading', async ({ page }) => {
  await page.unroute('https://script.google.com/**');

  let resolveConfig!: () => void;
  const pendingConfig = new Promise<void>(resolve => {
    resolveConfig = resolve;
  });

  await page.route('https://script.google.com/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const payload = readPayload(request.method(), request.postData());
    const action = readAction(url, payload);

    if (action === 'get_linktree_config') {
      await pendingConfig;
      await fulfillJson(route, {
        success: true,
        settings: {
          paymentStatus: 'disabled',
          paymentNoticeTitle: {
            ja: 'Payment methods paused',
            es: 'Medios de pago pausados',
            en: 'Payment methods paused',
            'zh-CN': 'Payment methods paused',
            'zh-TW': 'Payment methods paused'
          },
          paymentNoticeMessage: {
            ja: 'Payment methods are currently unavailable until further notice.',
            es: 'Actualmente los medios de pago no estaran disponibles hasta nuevo aviso.',
            en: 'Payment methods are currently unavailable until further notice.',
            'zh-CN': 'Payment methods are currently unavailable until further notice.',
            'zh-TW': 'Payment methods are currently unavailable until further notice.'
          },
          paypal: {
            enabled: false,
            url: '',
            currency: 'USD',
            suggestedAmounts: [],
            allowCustomAmount: false
          },
          expiringSoonDays: 7
        },
        items: [
          {
            id: 'backend-social',
            type: 'social',
            provider: 'x',
            section: 'general',
            label: {
              ja: 'Backend Social',
              es: 'Backend Social',
              en: 'Backend Social',
              'zh-CN': 'Backend Social',
              'zh-TW': 'Backend Social'
            },
            subtitle: {
              ja: 'Loaded from admin panel',
              es: 'Cargado desde administracion',
              en: 'Loaded from admin panel',
              'zh-CN': 'Loaded from admin panel',
              'zh-TW': 'Loaded from admin panel'
            },
            url: 'https://x.com/backend_social',
            status: 'active',
            sortOrder: 10,
            requiresAdultWarning: false,
            behavior: 'external_link',
            metadata: '{}'
          }
        ]
      });
      return;
    }

    await fulfillJson(route, action.startsWith('counter:') ? { success: true, count: 123 } : { success: true });
  });

  await page.goto('/');
  await waitForAppReady(page);

  await expect(page.locator('.linktree__config-loading')).toBeVisible();
  await expect(page.locator('.linktree__button')).toHaveCount(0);

  resolveConfig();

  await expect(page.locator('.linktree__config-loading')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Backend Social/ })).toBeVisible();
  await expect(page.locator('.linktree__button')).toHaveCount(2);
});

test('VIP session card opens gallery and sidebar logout clears the session', async ({ page }) => {
  await mockKuronekoApi(page, action => {
    if (action === 'get_exclusive_gallery') {
      return { success: true, items: [] };
    }

    return undefined;
  });
  await page.goto('/');
  await page.evaluate(() => {
    sessionStorage.setItem('kuronekoVipSession', JSON.stringify({
      userCode: 'KNK-5018-DZ24',
      accessKey: 'KURO-TEST-KEY-DZ24',
      displayName: 'Test VIP',
      source: 'fanbox',
      status: 'active',
      startDate: '2026-01-01',
      endDate: '2026-12-31'
    }));
  });
  await page.reload();
  await waitForAppReady(page);

  await expect(page.locator('.vip-session')).toBeVisible();
  await expect(page.locator('.vip-session')).toContainText('KNK-****-DZ24');
  await page.locator('.vip-session').click();
  await expect(page).toHaveURL(/\/gallery$/);

  await page.locator('.sidebar-toggle').click();
  await page.locator('.sidebar__logout').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();

  await expect(page).toHaveURL(/\/$/);
  const storedSession = await page.evaluate(() => sessionStorage.getItem('kuronekoVipSession'));
  expect(storedSession).toBeNull();
  await expect(page.locator('.vip-session')).toHaveCount(0);
});

function readPayload(method: string, postData: string | null): Record<string, unknown> {
  if (method !== 'POST') return {};

  try {
    const parsed = JSON.parse(postData ?? '{}') as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readAction(url: URL, payload: Record<string, unknown>): string {
  if (typeof payload['action'] === 'string') return payload['action'];
  if (url.searchParams.has('counter')) return `counter:${url.searchParams.get('counter') ?? ''}`;
  if (url.searchParams.has('action')) return url.searchParams.get('action') ?? '';

  return 'unknown';
}

async function fulfillJson(route: Route, body: Record<string, unknown>): Promise<void> {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body)
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
