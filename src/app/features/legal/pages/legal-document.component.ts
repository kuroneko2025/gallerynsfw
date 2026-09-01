import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LegalDocumentType,
  getLegalDocument
} from '../../../core/i18n/legal-translations';
import { LanguageService } from '../../../core/i18n/language.service';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-legal-document',
  standalone: true,
  imports: [BackButtonComponent, LanguageSelectorComponent, RouterLink],
  templateUrl: './legal-document.component.html',
  styleUrls: ['./legal-document.component.scss']
})
export class LegalDocumentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);

  readonly documentType = computed<LegalDocumentType>(() => {
    const type = this.route.snapshot.data['legalDocument'];
    return type === 'terms' ? 'terms' : 'privacy';
  });

  readonly document = computed(() =>
    getLegalDocument(this.documentType(), this.languageService.currentLanguage())
  );

  readonly isPrivacy = computed(() => this.documentType() === 'privacy');
  readonly isTerms = computed(() => this.documentType() === 'terms');
}
