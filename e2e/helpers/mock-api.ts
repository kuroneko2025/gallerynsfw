import { Page, Route } from '@playwright/test';

type ApiPayload = Record<string, unknown>;
type MockApiResponseFactory = (action: string, payload: ApiPayload, url: URL) => ApiPayload | undefined;

const apiPattern = 'https://script.google.com/**';

export async function mockKuronekoApi(page: Page, responseOverride?: MockApiResponseFactory): Promise<void> {
  await page.route(apiPattern, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const payload = await readPayload(route);
    const action = readAction(url, payload);
    const response = responseOverride?.(action, payload, url) ?? responseFor(action, url, payload);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

async function readPayload(route: Route): Promise<ApiPayload> {
  if (route.request().method() !== 'POST') return {};

  try {
    const parsed = JSON.parse(route.request().postData() ?? '{}') as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readAction(url: URL, payload: ApiPayload): string {
  if (typeof payload['action'] === 'string') return payload['action'];
  if (url.searchParams.has('counter')) return `counter:${url.searchParams.get('counter') ?? ''}`;
  if (url.searchParams.has('action')) return url.searchParams.get('action') ?? '';

  return 'unknown';
}

function responseFor(action: string, _url: URL, payload: ApiPayload): ApiPayload {
  switch (action) {
    case 'counter:get':
    case 'counter:increment':
      return { success: true, count: 123 };

    case 'get_linktree_config':
      return {
        success: true,
        settings: {
          paymentStatus: 'disabled',
          paymentNoticeTitle: {
            ja: 'お支払い方法について',
            es: 'Medios de pago pausados',
            en: 'Payment methods paused',
            'zh-CN': '支付方式暂停',
            'zh-TW': '支付方式暫停'
          },
          paymentNoticeMessage: {
            ja: '現在、お支払い方法は追って通知があるまでご利用いただけません。',
            es: 'Actualmente los medios de pago no estarán disponibles hasta nuevo aviso.',
            en: 'Payment methods are currently unavailable until further notice.',
            'zh-CN': '目前支付方式暂不可用，恢复时间另行通知。',
            'zh-TW': '目前支付方式暫不可用，恢復時間另行通知。'
          },
          paypal: {
            enabled: false,
            url: 'https://paypal.me/devusui',
            currency: 'USD',
            suggestedAmounts: [5, 10, 15],
            allowCustomAmount: true
          },
          expiringSoonDays: 7
        },
        items: [
          {
            id: 'mika-x',
            type: 'social',
            provider: 'x',
            section: 'general',
            label: { ja: 'Mika Kuroneko', es: 'Mika Kuroneko', en: 'Mika Kuroneko', 'zh-CN': 'Mika Kuroneko', 'zh-TW': 'Mika Kuroneko' },
            subtitle: { ja: 'X / Twitter', es: 'X / Twitter', en: 'X / Twitter', 'zh-CN': 'X / Twitter', 'zh-TW': 'X / Twitter' },
            url: 'https://x.com/mika_kuroneko',
            status: 'active',
            sortOrder: 10,
            requiresAdultWarning: false,
            behavior: 'external_link',
            metadata: '{}'
          },
          {
            id: 'shin-x',
            type: 'social',
            provider: 'x',
            section: 'adult',
            label: { ja: 'Shinai Kuroneko', es: 'Shinai Kuroneko', en: 'Shinai Kuroneko', 'zh-CN': 'Shinai Kuroneko', 'zh-TW': 'Shinai Kuroneko' },
            subtitle: { ja: '+18 / X', es: '+18 / X', en: '+18 / X', 'zh-CN': '+18 / X', 'zh-TW': '+18 / X' },
            url: 'https://x.com/shinai_kuroneko',
            status: 'active',
            sortOrder: 20,
            requiresAdultWarning: true,
            behavior: 'external_link',
            metadata: '{}'
          },
          {
            id: 'nyx-x',
            type: 'social',
            provider: 'x',
            section: 'adult',
            label: { ja: 'Nyx Kuroneko', es: 'Nyx Kuroneko', en: 'Nyx Kuroneko', 'zh-CN': 'Nyx Kuroneko', 'zh-TW': 'Nyx Kuroneko' },
            subtitle: { ja: '+18 / X', es: '+18 / X', en: '+18 / X', 'zh-CN': '+18 / X', 'zh-TW': '+18 / X' },
            url: 'https://x.com/nyx_kuroneko',
            status: 'active',
            sortOrder: 30,
            requiresAdultWarning: true,
            behavior: 'external_link',
            metadata: '{}'
          },
          {
            id: 'pixiv',
            type: 'gallery',
            provider: 'pixiv',
            section: 'adult',
            label: { ja: 'Pixiv', es: 'Pixiv', en: 'Pixiv', 'zh-CN': 'Pixiv', 'zh-TW': 'Pixiv' },
            subtitle: { ja: 'Illustration gallery', es: 'Galería de ilustraciones', en: 'Illustration gallery', 'zh-CN': '插画画廊', 'zh-TW': '插畫畫廊' },
            url: 'https://www.pixiv.net/users/112346386',
            status: 'active',
            sortOrder: 40,
            requiresAdultWarning: true,
            behavior: 'external_link',
            metadata: '{}'
          }
        ]
      };

    case 'validate_access_key':
      return { success: false, message: 'Invalid user code or access key' };

    case 'request_access':
      return {
        success: true,
        message: 'Access request created',
        requestCode: 'REQ-TEST-000001',
        status: 'pending'
      };

    case 'check_request_status':
      return {
        success: false,
        message: `Request not found: ${String(payload['requestCode'] ?? '')}`
      };

    case 'admin_get_access_requests':
    case 'admin_get_access_keys':
    case 'admin_get_gallery_items':
    case 'admin_get_linktree_config':
    case 'admin_update_linktree_settings':
    case 'admin_add_linktree_item':
    case 'admin_update_linktree_item':
    case 'admin_set_linktree_item_status':
    case 'admin_delete_linktree_item':
      return { success: false, message: 'Invalid admin credentials' };

    case 'get_exclusive_gallery':
    case 'get_vip_illustration_requests':
    case 'save_vip_illustration_request':
      return { success: false, message: 'Invalid access' };

    case 'health':
      return {
        success: true,
        message: 'Kuroneko Gallery System API is running',
        version: '2.0'
      };

    default:
      return { success: true };
  }
}

function isRecord(value: unknown): value is ApiPayload {
  return typeof value === 'object' && value !== null;
}
