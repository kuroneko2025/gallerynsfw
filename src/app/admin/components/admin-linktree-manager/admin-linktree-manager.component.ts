import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/i18n/language.service';
import {
  AdminLinktreeItemStatus,
  LinktreeItemBehavior,
  LinktreeItemSection,
  LinktreeItemStatus,
  LinktreePaymentStatus,
  LinktreeSettings
} from '../../../core/models/linktree.models';
import { LinktreeConfigService } from '../../../core/services/linktree-config.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalService } from '../../../shared/services/modal.service';
import {
  AdminCredentials,
  AdminLinktreeItem,
  AdminLinktreeItemPayload,
  AdminLinktreeSettingsPayload
} from '../../models/admin.types';
import { AdminService } from '../../services/admin.service';

type LinktreeItemFilter = 'all' | LinktreeItemStatus;

interface LinktreeSettingsForm {
  paymentsStatus: LinktreePaymentStatus;
  paymentNoticeTitleJa: string;
  paymentNoticeTitleEs: string;
  paymentNoticeTitleEn: string;
  paymentNoticeTitleZhCN: string;
  paymentNoticeTitleZhTW: string;
  paymentNoticeMessageJa: string;
  paymentNoticeMessageEs: string;
  paymentNoticeMessageEn: string;
  paymentNoticeMessageZhCN: string;
  paymentNoticeMessageZhTW: string;
  paypalEnabled: boolean;
  paypalUrl: string;
  paypalCurrency: string;
  paypalSuggestedAmounts: string;
  paypalAllowCustomAmount: boolean;
  expiringSoonDays: number;
}

interface LinktreeItemForm {
  id: string;
  type: string;
  provider: string;
  section: LinktreeItemSection;
  labelJa: string;
  labelEs: string;
  labelEn: string;
  labelZhCN: string;
  labelZhTW: string;
  subtitleJa: string;
  subtitleEs: string;
  subtitleEn: string;
  subtitleZhCN: string;
  subtitleZhTW: string;
  url: string;
  status: LinktreeItemStatus;
  sortOrder: number;
  requiresAdultWarning: boolean;
  behavior: LinktreeItemBehavior;
  metadata: string;
}

@Component({
  selector: 'app-admin-linktree-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './admin-linktree-manager.component.html',
  styleUrls: [
    '../admin-gallery-manager/admin-gallery-manager.component.scss',
    './admin-linktree-manager.component.scss'
  ]
})
export class AdminLinktreeManagerComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly languageService = inject(LanguageService);
  private readonly linktreeConfigService = inject(LinktreeConfigService);
  private readonly modalService = inject(ModalService);

  readonly texts = this.languageService.texts;
  readonly filters: readonly LinktreeItemFilter[] = ['all', 'active', 'disabled'];
  readonly sections: readonly LinktreeItemSection[] = ['general', 'adult', 'payment', 'custom'];
  readonly behaviors: readonly LinktreeItemBehavior[] = ['external_link', 'payment', 'system'];
  readonly statuses: readonly LinktreeItemStatus[] = ['active', 'disabled'];

  credentials: AdminCredentials | null = null;
  items: AdminLinktreeItem[] = [];
  settingsForm: LinktreeSettingsForm = this.createSettingsForm();
  itemForm: LinktreeItemForm = this.createItemForm();
  activeFilter: LinktreeItemFilter = 'all';
  searchTerm = '';
  editingItemId: string | null = null;
  isFetching = false;
  isSavingSettings = false;
  isSavingItem = false;
  processingItemId: string | null = null;
  errorMessage = '';
  lastUpdatedAt: Date | null = null;

  async ngOnInit(): Promise<void> {
    this.credentials = this.adminService.getStoredCredentials();
    if (!this.credentials) {
      this.errorMessage = this.texts().admin.linktree.loadError;
      this.markViewForUpdate();
      return;
    }

    await this.loadConfig();
  }

  filteredItems(): AdminLinktreeItem[] {
    const search = this.normalizeSearch(this.searchTerm);

    return this.items.filter(item => {
      const matchesStatus = this.activeFilter === 'all' || item.status === this.activeFilter;
      const matchesSearch = !search || this.itemSearchText(item).includes(search);

      return matchesStatus && matchesSearch;
    });
  }

  itemCount(filter: LinktreeItemFilter): number {
    if (filter === 'all') return this.items.length;
    return this.items.filter(item => item.status === filter).length;
  }

  filterLabel(filter: LinktreeItemFilter): string {
    if (filter === 'all') return this.texts().admin.linktree.filterAll;
    return filter === 'active' ? this.texts().admin.linktree.active : this.texts().admin.linktree.disabled;
  }

  sectionLabel(section: LinktreeItemSection): string {
    const linktree = this.texts().admin.linktree;

    switch (section) {
      case 'general':
        return linktree.general;
      case 'adult':
        return linktree.adult;
      case 'payment':
        return linktree.paymentSection;
      case 'custom':
        return linktree.custom;
    }
  }

  behaviorLabel(behavior: LinktreeItemBehavior): string {
    const linktree = this.texts().admin.linktree;

    switch (behavior) {
      case 'payment':
        return linktree.payment;
      case 'system':
        return linktree.system;
      case 'external_link':
        return linktree.externalLink;
    }
  }

  statusLabel(status: AdminLinktreeItemStatus): string {
    return status === 'active' ? this.texts().admin.linktree.active : this.texts().admin.linktree.disabled;
  }

  setActiveFilter(filter: LinktreeItemFilter): void {
    this.activeFilter = filter;
    this.markViewForUpdate();
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
    this.markViewForUpdate();
  }

  async refreshConfig(): Promise<void> {
    await this.loadConfig(true);
  }

  async saveSettings(): Promise<void> {
    if (!this.credentials) return;

    const payload = this.prepareSettingsPayload();
    if (!payload) {
      this.errorMessage = this.texts().admin.linktree.inputError;
      this.markViewForUpdate();
      return;
    }

    this.isSavingSettings = true;
    this.errorMessage = '';
    this.markViewForUpdate();

    try {
      const config = await this.adminService.adminUpdateLinktreeSettings(this.credentials, payload);
      this.linktreeConfigService.clearCachedPublicConfig();
      this.applySettings(config.settings);
      this.items = this.sortItems(config.items.filter(item => item.status !== 'deleted'));
      this.modalService.showSuccess(this.texts().modal.success, this.texts().admin.linktree.saveSuccess, 1500);
    } catch {
      this.modalService.showError(this.texts().modal.error, this.texts().admin.linktree.loadError);
    } finally {
      this.isSavingSettings = false;
      this.markViewForUpdate();
    }
  }

  async saveItem(): Promise<void> {
    if (!this.credentials) return;

    const payload = this.prepareItemPayload();
    if (!payload) {
      this.errorMessage = this.texts().admin.linktree.inputError;
      this.markViewForUpdate();
      return;
    }

    this.isSavingItem = true;
    this.errorMessage = '';
    this.markViewForUpdate();

    try {
      if (this.editingItemId) {
        await this.adminService.adminUpdateLinktreeItem(this.credentials, this.editingItemId, payload);
      } else {
        await this.adminService.adminAddLinktreeItem(this.credentials, payload);
      }

      this.linktreeConfigService.clearCachedPublicConfig();
      this.cancelEdit();
      await this.loadConfig();
      this.modalService.showSuccess(this.texts().modal.success, this.texts().admin.linktree.itemSaveSuccess, 1500);
    } catch {
      this.modalService.showError(this.texts().modal.error, this.texts().admin.linktree.loadError);
    } finally {
      this.isSavingItem = false;
      this.markViewForUpdate();
    }
  }

  editItem(item: AdminLinktreeItem): void {
    this.editingItemId = item.id;
    this.itemForm = this.createItemForm(item);
    this.errorMessage = '';
    this.markViewForUpdate();
  }

  cancelEdit(): void {
    this.editingItemId = null;
    this.itemForm = this.createItemForm();
    this.markViewForUpdate();
  }

  async toggleItemStatus(item: AdminLinktreeItem): Promise<void> {
    if (!this.credentials) return;

    const status: LinktreeItemStatus = item.status === 'active' ? 'disabled' : 'active';
    const successMessage = status === 'active'
      ? this.texts().admin.linktree.itemEnableSuccess
      : this.texts().admin.linktree.itemDisableSuccess;

    await this.runItemAction(item.id, async () => {
      if (!this.credentials) return;
      await this.adminService.adminSetLinktreeItemStatus(this.credentials, item.id, status);
      this.linktreeConfigService.clearCachedPublicConfig();
      await this.loadConfig();
      this.modalService.showSuccess(this.texts().modal.success, successMessage, 1500);
    });
  }

  async deleteItem(item: AdminLinktreeItem): Promise<void> {
    if (!this.credentials) return;
    if (!(await this.confirmSensitiveAction())) return;

    await this.runItemAction(item.id, async () => {
      if (!this.credentials) return;
      await this.adminService.adminDeleteLinktreeItem(this.credentials, item.id);
      this.linktreeConfigService.clearCachedPublicConfig();
      await this.loadConfig();
      this.modalService.showSuccess(this.texts().modal.success, this.texts().admin.linktree.itemDeleteSuccess, 1500);
    });
  }

  isSettingsFormInvalid(): boolean {
    return this.prepareSettingsPayload() === null;
  }

  isItemFormInvalid(): boolean {
    return this.prepareItemPayload() === null;
  }

  isProcessing(id: string): boolean {
    return this.processingItemId === id;
  }

  lastUpdatedLabel(): string {
    if (!this.lastUpdatedAt) return '';
    return `${this.texts().refresh.lastUpdated}: ${this.formatTime(this.lastUpdatedAt)}`;
  }

  trackItem(_: number, item: AdminLinktreeItem): string {
    return item.id;
  }

  private async loadConfig(showSuccessMessage = false): Promise<void> {
    if (!this.credentials) return;

    this.isFetching = true;
    this.errorMessage = '';
    this.markViewForUpdate();

    try {
      const config = await this.adminService.adminGetLinktreeConfig(this.credentials);
      this.applySettings(config.settings);
      this.items = this.sortItems(config.items.filter(item => item.status !== 'deleted'));
      this.lastUpdatedAt = new Date();

      if (showSuccessMessage) {
        this.modalService.showSuccess(this.texts().modal.success, this.texts().refresh.success, 1500);
      }
    } catch {
      this.errorMessage = this.texts().admin.linktree.loadError;
      if (showSuccessMessage) {
        this.modalService.showError(this.texts().modal.error, this.errorMessage);
      }
    } finally {
      this.isFetching = false;
      this.markViewForUpdate();
    }
  }

  private applySettings(settings: LinktreeSettings): void {
    this.settingsForm = this.createSettingsForm(settings);
  }

  private prepareSettingsPayload(): AdminLinktreeSettingsPayload | null {
    const amounts = this.parseAmountList(this.settingsForm.paypalSuggestedAmounts);
    const paypalUrl = this.settingsForm.paypalUrl.trim();
    const hasNoticeTitle = [
      this.settingsForm.paymentNoticeTitleJa,
      this.settingsForm.paymentNoticeTitleEs,
      this.settingsForm.paymentNoticeTitleEn,
      this.settingsForm.paymentNoticeTitleZhCN,
      this.settingsForm.paymentNoticeTitleZhTW
    ].some(value => value.trim());
    const hasNoticeMessage = [
      this.settingsForm.paymentNoticeMessageJa,
      this.settingsForm.paymentNoticeMessageEs,
      this.settingsForm.paymentNoticeMessageEn,
      this.settingsForm.paymentNoticeMessageZhCN,
      this.settingsForm.paymentNoticeMessageZhTW
    ].some(value => value.trim());

    if (!hasNoticeTitle || !hasNoticeMessage) return null;
    if (this.settingsForm.paypalEnabled && !this.isUrlLike(paypalUrl)) return null;
    if (amounts.length === 0) return null;

    return {
      paymentsStatus: this.settingsForm.paymentsStatus,
      paymentNoticeTitleJa: this.settingsForm.paymentNoticeTitleJa.trim(),
      paymentNoticeTitleEs: this.settingsForm.paymentNoticeTitleEs.trim(),
      paymentNoticeTitleEn: this.settingsForm.paymentNoticeTitleEn.trim(),
      paymentNoticeTitleZhCN: this.settingsForm.paymentNoticeTitleZhCN.trim(),
      paymentNoticeTitleZhTW: this.settingsForm.paymentNoticeTitleZhTW.trim(),
      paymentNoticeMessageJa: this.settingsForm.paymentNoticeMessageJa.trim(),
      paymentNoticeMessageEs: this.settingsForm.paymentNoticeMessageEs.trim(),
      paymentNoticeMessageEn: this.settingsForm.paymentNoticeMessageEn.trim(),
      paymentNoticeMessageZhCN: this.settingsForm.paymentNoticeMessageZhCN.trim(),
      paymentNoticeMessageZhTW: this.settingsForm.paymentNoticeMessageZhTW.trim(),
      paypalEnabled: this.settingsForm.paypalEnabled,
      paypalUrl,
      paypalCurrency: this.settingsForm.paypalCurrency.trim().toUpperCase() || 'USD',
      paypalSuggestedAmounts: amounts.join(','),
      paypalAllowCustomAmount: this.settingsForm.paypalAllowCustomAmount,
      expiringSoonDays: Math.max(1, Math.floor(Number(this.settingsForm.expiringSoonDays) || 7))
    };
  }

  private prepareItemPayload(): AdminLinktreeItemPayload | null {
    const labelValues = [
      this.itemForm.labelJa,
      this.itemForm.labelEs,
      this.itemForm.labelEn,
      this.itemForm.labelZhCN,
      this.itemForm.labelZhTW
    ];
    const url = this.itemForm.url.trim();
    const metadata = this.itemForm.metadata.trim() || '{}';

    if (!labelValues.some(value => value.trim())) return null;
    if (this.itemForm.behavior !== 'system' && !this.isUrlLike(url)) return null;
    if (!this.isValidJson(metadata)) return null;

    const payload: AdminLinktreeItemPayload = {
      type: this.itemForm.type.trim() || 'custom',
      provider: this.itemForm.provider.trim() || 'custom',
      section: this.itemForm.section,
      labelJa: this.itemForm.labelJa.trim(),
      labelEs: this.itemForm.labelEs.trim(),
      labelEn: this.itemForm.labelEn.trim(),
      labelZhCN: this.itemForm.labelZhCN.trim(),
      labelZhTW: this.itemForm.labelZhTW.trim(),
      subtitleJa: this.itemForm.subtitleJa.trim(),
      subtitleEs: this.itemForm.subtitleEs.trim(),
      subtitleEn: this.itemForm.subtitleEn.trim(),
      subtitleZhCN: this.itemForm.subtitleZhCN.trim(),
      subtitleZhTW: this.itemForm.subtitleZhTW.trim(),
      url,
      status: this.itemForm.status,
      sortOrder: Math.max(0, Math.floor(Number(this.itemForm.sortOrder) || 100)),
      requiresAdultWarning: this.itemForm.requiresAdultWarning,
      behavior: this.itemForm.behavior,
      metadata
    };

    const id = this.itemForm.id.trim();
    return id && !this.editingItemId ? { ...payload, id } : payload;
  }

  private createSettingsForm(settings?: LinktreeSettings): LinktreeSettingsForm {
    return {
      paymentsStatus: settings?.paymentStatus ?? 'disabled',
      paymentNoticeTitleJa: settings?.paymentNoticeTitle.ja ?? 'お支払い方法について',
      paymentNoticeTitleEs: settings?.paymentNoticeTitle.es ?? 'Medios de pago',
      paymentNoticeTitleEn: settings?.paymentNoticeTitle.en ?? 'Payment methods',
      paymentNoticeTitleZhCN: settings?.paymentNoticeTitle['zh-CN'] ?? '付款方式',
      paymentNoticeTitleZhTW: settings?.paymentNoticeTitle['zh-TW'] ?? '付款方式',
      paymentNoticeMessageJa:
        settings?.paymentNoticeMessage.ja ?? '現在、お支払い方法は追って通知があるまで利用できません。',
      paymentNoticeMessageEs:
        settings?.paymentNoticeMessage.es ?? 'Actualmente los medios de pago no estarán disponibles hasta nuevo aviso.',
      paymentNoticeMessageEn:
        settings?.paymentNoticeMessage.en ?? 'Payment methods are currently unavailable until further notice.',
      paymentNoticeMessageZhCN:
        settings?.paymentNoticeMessage['zh-CN'] ?? '目前付款方式暂不可用，恢复时间将另行通知。',
      paymentNoticeMessageZhTW:
        settings?.paymentNoticeMessage['zh-TW'] ?? '目前付款方式暫不可用，恢復時間將另行通知。',
      paypalEnabled: settings?.paypal.enabled ?? false,
      paypalUrl: settings?.paypal.url ?? 'https://paypal.me/devusui',
      paypalCurrency: settings?.paypal.currency ?? 'USD',
      paypalSuggestedAmounts: (settings?.paypal.suggestedAmounts ?? [5, 10, 15, 25, 50]).join(', '),
      paypalAllowCustomAmount: settings?.paypal.allowCustomAmount ?? true,
      expiringSoonDays: settings?.expiringSoonDays ?? 7
    };
  }

  private createItemForm(item?: AdminLinktreeItem): LinktreeItemForm {
    return {
      id: item?.id ?? '',
      type: item?.type ?? 'social',
      provider: item?.provider ?? 'custom',
      section: item?.section ?? 'general',
      labelJa: item?.label.ja ?? '',
      labelEs: item?.label.es ?? '',
      labelEn: item?.label.en ?? '',
      labelZhCN: item?.label['zh-CN'] ?? '',
      labelZhTW: item?.label['zh-TW'] ?? '',
      subtitleJa: item?.subtitle.ja ?? '',
      subtitleEs: item?.subtitle.es ?? '',
      subtitleEn: item?.subtitle.en ?? '',
      subtitleZhCN: item?.subtitle['zh-CN'] ?? '',
      subtitleZhTW: item?.subtitle['zh-TW'] ?? '',
      url: item?.url ?? '',
      status: item?.status === 'disabled' ? 'disabled' : 'active',
      sortOrder: item?.sortOrder ?? this.nextSortOrder(),
      requiresAdultWarning: item?.requiresAdultWarning ?? false,
      behavior: item?.behavior ?? 'external_link',
      metadata: item?.metadata || '{}'
    };
  }

  private nextSortOrder(): number {
    if (this.items.length === 0) return 10;
    return Math.max(...this.items.map(item => item.sortOrder)) + 10;
  }

  private async runItemAction(id: string, callback: () => Promise<void>): Promise<void> {
    this.processingItemId = id;
    this.errorMessage = '';
    this.markViewForUpdate();

    try {
      await callback();
    } catch {
      this.modalService.showError(this.texts().modal.error, this.texts().admin.linktree.loadError);
    } finally {
      this.processingItemId = null;
      this.markViewForUpdate();
    }
  }

  private parseAmountList(value: string): number[] {
    const uniqueAmounts = new Set<number>();

    value.split(',').forEach(part => {
      const amount = Number(part.trim().replace(',', '.'));
      if (Number.isFinite(amount) && amount > 0 && amount <= 10000) {
        uniqueAmounts.add(Math.round(amount * 100) / 100);
      }
    });

    return Array.from(uniqueAmounts);
  }

  private sortItems(items: readonly AdminLinktreeItem[]): AdminLinktreeItem[] {
    return [...items].sort((a, b) => {
      if (a.sortOrder === b.sortOrder) return a.label.es.localeCompare(b.label.es);
      return a.sortOrder - b.sortOrder;
    });
  }

  private itemSearchText(item: AdminLinktreeItem): string {
    return this.normalizeSearch([
      item.id,
      item.type,
      item.provider,
      item.section,
      item.url,
      item.status,
      item.label.es,
      item.label.en,
      item.label.ja
    ].join(' '));
  }

  private normalizeSearch(value: string): string {
    return value.trim().toLowerCase();
  }

  private isUrlLike(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private isValidJson(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  private confirmSensitiveAction(): Promise<boolean> {
    return this.modalService.confirm(
      this.texts().modal.confirm,
      this.texts().admin.requestActions.confirmAction,
      this.texts().modal.ok,
      this.texts().modal.cancel
    );
  }

  private markViewForUpdate(): void {
    this.changeDetectorRef.markForCheck();
  }

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
