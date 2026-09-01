import { Component, HostListener, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { APP_LINKS } from '../../../../core/constants/app-links.config';
import { getLegalLinkLabels } from '../../../../core/i18n/legal-translations';
import { LanguageService } from '../../../../core/i18n/language.service';
import { LocalizedText, LinktreePublicItem, LinktreeSettings } from '../../../../core/models/linktree.models';
import { LinktreeConfigService } from '../../../../core/services/linktree-config.service';
import { LanguageSelectorComponent } from '../../../../shared/components/language-selector/language-selector.component';
import { LoadingMessageComponent } from '../../../../shared/components/loading-message/loading-message.component';
import { VipSessionStatusComponent } from '../../../../shared/components/vip-session-status/vip-session-status.component';
import { ModalService } from '../../../../shared/services/modal.service';
import { VisitCounterService } from '../../services/visit-counter.service';

interface AccountLinkViewModel {
  readonly id: string;
  readonly href: string;
  readonly title: string;
  readonly subtitle: string;
  readonly ageRestricted: boolean;
}

@Component({
  selector: 'app-linktree',
  standalone: true,
  imports: [LanguageSelectorComponent, LoadingMessageComponent, VipSessionStatusComponent, RouterLink],
  templateUrl: './linktree.component.html',
  styleUrls: ['./linktree.component.scss']
})
export class LinktreeComponent implements OnInit, OnDestroy {
  private readonly languageService = inject(LanguageService);
  private readonly linktreeConfigService = inject(LinktreeConfigService);
  private readonly visitCounterService = inject(VisitCounterService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);
  private readonly audioSource = environment.assets.bgm;
  private readonly adultWarningAcceptedKey = environment.storage.adultWarningAccepted;
  private audio: HTMLAudioElement | null = null;

  private readonly handleAudioLoaded = (): void => {
    this.audioLoaded.set(true);
    this.isMusicLoading.set(false);
  };

  private readonly handleAudioError = (): void => {
    this.pauseMusic();
    this.audioError.set(true);
    this.isMusicLoading.set(false);
  };

  readonly links = APP_LINKS;
  readonly texts = this.languageService.texts;
  readonly legalLinks = computed(() => getLegalLinkLabels(this.languageService.currentLanguage()));
  readonly projectVersion = environment.app.version;
  readonly linktreeItems = signal<readonly LinktreePublicItem[]>([]);
  readonly linktreeSettings = signal<LinktreeSettings | null>(null);
  readonly isLinktreeConfigLoading = signal(true);
  readonly hasLinktreeConfigError = signal(false);
  readonly customPaypalAmount = signal('');
  readonly customPaypalAmountError = signal('');
  readonly visitCount = signal<number | null>(null);
  readonly isVisitCountLoading = signal(true);
  readonly isPlaying = signal(false);
  readonly audioLoaded = signal(false);
  readonly audioError = signal(false);
  readonly isMusicLoading = signal(false);
  readonly showAdultWarning = signal(false);
  readonly generalAccountLinks = computed<readonly AccountLinkViewModel[]>(() => {
    if (this.linktreeItems().length > 0) {
      return this.linktreeItems()
        .filter(item => item.section === 'general' || item.section === 'custom')
        .map(item => this.toAccountLinkViewModel(item));
    }

    if (!this.hasLinktreeConfigError()) return [];

    const accounts = this.texts().linktree.accounts;

    return [
      {
        id: 'mika',
        href: 'https://x.com/mika_kuroneko',
        title: accounts.mika.title,
        subtitle: this.formatAccountSubtitle(accounts.mika.username, accounts.mika.description),
        ageRestricted: false
      }
    ];
  });
  readonly adultAccountLinks = computed<readonly AccountLinkViewModel[]>(() => {
    if (this.linktreeItems().length > 0) {
      return this.linktreeItems()
        .filter(item => item.section === 'adult')
        .map(item => this.toAccountLinkViewModel(item));
    }

    if (!this.hasLinktreeConfigError()) return [];

    const accounts = this.texts().linktree.accounts;

    return [
      {
        id: 'shin',
        href: 'https://x.com/shinai_kuroneko',
        title: accounts.shin.title,
        subtitle: this.formatAccountSubtitle(accounts.shin.username, accounts.shin.description),
        ageRestricted: true
      },
      {
        id: 'nyx',
        href: 'https://x.com/nyx_kuroneko',
        title: accounts.nyx.title,
        subtitle: this.formatAccountSubtitle(accounts.nyx.username, accounts.nyx.description),
        ageRestricted: true
      },
      {
        id: 'pixiv',
        href: this.links.pixiv,
        title: accounts.pixiv.title,
        subtitle: this.formatAccountSubtitle(accounts.pixiv.username, accounts.pixiv.description),
        ageRestricted: true
      }
    ];
  });
  readonly paymentAccountLinks = computed<readonly AccountLinkViewModel[]>(() => {
    if (!this.arePaymentsEnabled()) return [];

    return this.linktreeItems()
      .filter(item => item.section === 'payment')
      .map(item => this.toAccountLinkViewModel(item));
  });
  readonly shouldShowPaymentLinks = computed(() => this.paymentAccountLinks().length > 0);
  readonly shouldShowPaypalPanel = computed(() => {
    const settings = this.linktreeSettings();

    return settings?.paymentStatus === 'enabled' && settings.paypal.enabled && !!settings.paypal.url;
  });
  readonly paypalSuggestedAmounts = computed(() => this.linktreeSettings()?.paypal.suggestedAmounts ?? []);
  readonly paypalCurrency = computed(() => this.linktreeSettings()?.paypal.currency ?? 'USD');
  readonly paypalAllowsCustomAmount = computed(() => !!this.linktreeSettings()?.paypal.allowCustomAmount);
  readonly paymentNoticeTitle = computed(() =>
    this.localizedText(
      this.linktreeSettings()?.paymentNoticeTitle,
      this.hasLinktreeConfigError() ? this.texts().linktree.paymentNoticeTitle : ''
    )
  );
  readonly paymentNoticeMessage = computed(() =>
    this.localizedText(
      this.linktreeSettings()?.paymentNoticeMessage,
      this.hasLinktreeConfigError() ? this.texts().linktree.paymentNoticeMessage : ''
    )
  );
  readonly shouldShowVisitCounter = computed(() => this.isVisitCountLoading() || this.visitCount() !== null);
  readonly formattedVisitCount = computed(() => {
    const count = this.visitCount();
    if (count === null) return '';

    return new Intl.NumberFormat(this.languageService.currentLanguage()).format(count);
  });
  readonly musicButtonLabel = computed(() => (this.isPlaying() ? this.texts().music.pause : this.texts().music.play));
  readonly musicStatusText = computed(() => {
    if (this.audioError()) return this.texts().music.error;
    if (this.isMusicLoading()) return this.texts().music.loading;

    return this.musicButtonLabel();
  });

  async ngOnInit(): Promise<void> {
    this.prepareAudio();

    await Promise.all([
      this.loadLinktreeConfig(),
      this.loadVisitCount()
    ]);
  }

  ngOnDestroy(): void {
    this.destroyAudio();
  }

  async toggleMusic(): Promise<void> {
    if (this.isPlaying()) {
      this.pauseMusic();
      return;
    }

    await this.playMusic();
  }

  openVipWarning(): void {
    if (sessionStorage.getItem(this.adultWarningAcceptedKey) === 'true') {
      this.navigateToAccess();
      return;
    }

    this.showAdultWarning.set(true);
  }

  acceptAdultWarning(): void {
    sessionStorage.setItem(this.adultWarningAcceptedKey, 'true');
    this.showAdultWarning.set(false);
    this.navigateToAccess();
  }

  closeAdultWarning(): void {
    this.showAdultWarning.set(false);
  }

  async handleExternalLinkClick(event: MouseEvent, link: AccountLinkViewModel): Promise<void> {
    if (!link.ageRestricted) return;

    event.preventDefault();
    const modal = this.texts().linktree.ageRestrictedModal;
    const confirmed = await this.modalService.confirm(
      modal.title,
      modal.message,
      modal.confirm,
      modal.cancel
    );

    if (confirmed) {
      this.openExternalLink(link.href);
    }
  }

  setCustomPaypalAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.customPaypalAmount.set(input.value);
    this.customPaypalAmountError.set('');
  }

  openSuggestedPaypalAmount(amount: number): void {
    const href = this.paypalAmountHref(amount);
    if (!href) return;

    this.openExternalLink(href);
  }

  openCustomPaypalAmount(): void {
    const amount = Number(this.customPaypalAmount().replace(',', '.'));

    if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) {
      this.customPaypalAmountError.set(this.texts().linktree.paypalCustomError);
      return;
    }

    const href = this.paypalAmountHref(Math.round(amount * 100) / 100);
    if (!href) return;

    this.customPaypalAmountError.set('');
    this.openExternalLink(href);
  }

  paypalAmountHref(amount: number): string {
    const paypalUrl = this.linktreeSettings()?.paypal.url.trim();
    if (!paypalUrl) return '';

    const normalizedAmount = amount.toString();
    const separator = paypalUrl.includes('?') ? '&' : '?';

    if (/paypal\.me/i.test(paypalUrl)) {
      return `${paypalUrl.replace(/\/$/, '')}/${encodeURIComponent(normalizedAmount)}`;
    }

    return `${paypalUrl}${separator}amount=${encodeURIComponent(normalizedAmount)}`;
  }

  formatPaypalAmount(amount: number): string {
    return new Intl.NumberFormat(this.languageService.currentLanguage(), {
      style: 'currency',
      currency: this.paypalCurrency(),
      maximumFractionDigits: 2
    }).format(amount);
  }

  @HostListener('document:keydown.escape')
  closeWarningOnEscape(): void {
    if (this.showAdultWarning()) {
      this.closeAdultWarning();
    }
  }

  private navigateToAccess(): void {
    void this.router.navigateByUrl('/access');
  }

  private async loadLinktreeConfig(): Promise<void> {
    this.isLinktreeConfigLoading.set(true);

    try {
      const config = await this.linktreeConfigService.getPublicConfig();
      this.linktreeItems.set([...config.items].sort((a, b) => a.sortOrder - b.sortOrder));
      this.linktreeSettings.set(config.settings);
      this.hasLinktreeConfigError.set(false);
    } catch {
      this.linktreeItems.set([]);
      this.linktreeSettings.set(null);
      this.hasLinktreeConfigError.set(true);
    } finally {
      this.isLinktreeConfigLoading.set(false);
    }
  }

  private async loadVisitCount(): Promise<void> {
    const count = await this.visitCounterService.loadVisitCount();
    this.visitCount.set(count);
    this.isVisitCountLoading.set(false);
  }

  private toAccountLinkViewModel(item: LinktreePublicItem): AccountLinkViewModel {
    return {
      id: item.id,
      href: item.url,
      title: this.localizedText(item.label, item.provider),
      subtitle: this.localizedText(item.subtitle, item.type),
      ageRestricted: item.requiresAdultWarning
    };
  }

  private localizedText(text: LocalizedText | undefined, fallback: string): string {
    if (!text) return fallback;

    const currentLanguage = this.languageService.currentLanguage();

    return text[currentLanguage] || text.es || text.en || text.ja || fallback;
  }

  private arePaymentsEnabled(): boolean {
    return this.linktreeSettings()?.paymentStatus === 'enabled';
  }

  private formatAccountSubtitle(username: string, description: string): string {
    return username ? `${username} · ${description}` : description;
  }

  private openExternalLink(href: string): void {
    const externalWindow = globalThis.open(href, '_blank', 'noopener,noreferrer');
    if (externalWindow) {
      externalWindow.opener = null;
    }
  }

  private prepareAudio(): void {
    if (this.audio !== null) return;

    const audio = new Audio(this.audioSource);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = 'metadata';
    audio.addEventListener('canplaythrough', this.handleAudioLoaded);
    audio.addEventListener('error', this.handleAudioError);
    this.audio = audio;
  }

  private async playMusic(): Promise<void> {
    this.prepareAudio();

    if (this.audio === null) return;

    this.audioError.set(false);
    this.isMusicLoading.set(!this.audioLoaded());

    try {
      await this.audio.play();
      this.isPlaying.set(true);
    } catch {
      this.audioError.set(true);
      this.isPlaying.set(false);
    } finally {
      this.isMusicLoading.set(false);
    }
  }

  private pauseMusic(): void {
    this.audio?.pause();
    this.isPlaying.set(false);
    this.isMusicLoading.set(false);
  }

  private destroyAudio(): void {
    if (this.audio === null) return;

    this.pauseMusic();
    this.audio.removeEventListener('canplaythrough', this.handleAudioLoaded);
    this.audio.removeEventListener('error', this.handleAudioError);
    this.audio.src = '';
    this.audio.load();
    this.audio = null;
  }
}
