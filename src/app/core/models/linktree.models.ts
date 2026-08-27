import { LanguageCode } from '../i18n/language.model';

export type LocalizedText = Record<LanguageCode, string>;

export type LinktreeItemStatus = 'active' | 'disabled';
export type AdminLinktreeItemStatus = LinktreeItemStatus | 'deleted';
export type LinktreeItemSection = 'general' | 'adult' | 'payment' | 'custom';
export type LinktreeItemBehavior = 'external_link' | 'payment' | 'system';
export type LinktreePaymentStatus = 'enabled' | 'disabled';

export interface LinktreePaypalConfig {
  readonly enabled: boolean;
  readonly url: string;
  readonly currency: string;
  readonly suggestedAmounts: readonly number[];
  readonly allowCustomAmount: boolean;
}

export interface LinktreeSettings {
  readonly paymentStatus: LinktreePaymentStatus;
  readonly paymentNoticeTitle: LocalizedText;
  readonly paymentNoticeMessage: LocalizedText;
  readonly paypal: LinktreePaypalConfig;
  readonly expiringSoonDays: number;
}

export interface LinktreePublicItem {
  readonly id: string;
  readonly type: string;
  readonly provider: string;
  readonly section: LinktreeItemSection;
  readonly label: LocalizedText;
  readonly subtitle: LocalizedText;
  readonly url: string;
  readonly status: LinktreeItemStatus;
  readonly sortOrder: number;
  readonly requiresAdultWarning: boolean;
  readonly behavior: LinktreeItemBehavior;
  readonly metadata: string;
}

export interface AdminLinktreeItem extends Omit<LinktreePublicItem, 'status'> {
  readonly status: AdminLinktreeItemStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface LinktreePublicConfig {
  readonly settings: LinktreeSettings;
  readonly items: readonly LinktreePublicItem[];
}

export interface AdminLinktreeConfig {
  readonly settings: LinktreeSettings;
  readonly items: readonly AdminLinktreeItem[];
}

export interface LinktreeSettingsPayload {
  readonly paymentsStatus: LinktreePaymentStatus;
  readonly paymentNoticeTitleJa: string;
  readonly paymentNoticeTitleEs: string;
  readonly paymentNoticeTitleEn: string;
  readonly paymentNoticeTitleZhCN: string;
  readonly paymentNoticeTitleZhTW: string;
  readonly paymentNoticeMessageJa: string;
  readonly paymentNoticeMessageEs: string;
  readonly paymentNoticeMessageEn: string;
  readonly paymentNoticeMessageZhCN: string;
  readonly paymentNoticeMessageZhTW: string;
  readonly paypalEnabled: boolean;
  readonly paypalUrl: string;
  readonly paypalCurrency: string;
  readonly paypalSuggestedAmounts: string;
  readonly paypalAllowCustomAmount: boolean;
  readonly expiringSoonDays: number;
}

export interface LinktreeItemPayload {
  readonly id?: string;
  readonly type: string;
  readonly provider: string;
  readonly section: LinktreeItemSection;
  readonly labelJa: string;
  readonly labelEs: string;
  readonly labelEn: string;
  readonly labelZhCN: string;
  readonly labelZhTW: string;
  readonly subtitleJa: string;
  readonly subtitleEs: string;
  readonly subtitleEn: string;
  readonly subtitleZhCN: string;
  readonly subtitleZhTW: string;
  readonly url: string;
  readonly status: LinktreeItemStatus;
  readonly sortOrder: number;
  readonly requiresAdultWarning: boolean;
  readonly behavior: LinktreeItemBehavior;
  readonly metadata: string;
}
