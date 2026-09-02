import { LanguageCode } from './language.model';

export type LegalDocumentType = 'privacy' | 'terms';

export interface LegalSection {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
}

export interface LegalDocument {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly updatedLabel: string;
  readonly lastUpdated: string;
  readonly contactLabel: string;
  readonly backLabel: string;
  readonly navLabel: string;
  readonly privacyLink: string;
  readonly termsLink: string;
  readonly sections: readonly LegalSection[];
}

export interface LegalLinkLabels {
  readonly ariaLabel: string;
  readonly privacy: string;
  readonly terms: string;
}

const CONTACT_HANDLE = '@er_mao13619';
const LAST_UPDATED_ISO = '2026-09-02';

export const LEGAL_LINK_LABELS: Record<LanguageCode, LegalLinkLabels> = {
  ja: {
    ariaLabel: '法的文書',
    privacy: 'プライバシーポリシー',
    terms: '利用規約'
  },
  es: {
    ariaLabel: 'Documentos legales',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Servicio'
  },
  en: {
    ariaLabel: 'Legal documents',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service'
  },
  'zh-CN': {
    ariaLabel: '法律文件',
    privacy: '隐私政策',
    terms: '服务条款'
  },
  'zh-TW': {
    ariaLabel: '法律文件',
    privacy: '隱私政策',
    terms: '服務條款'
  }
};

export const LEGAL_DOCUMENTS: Record<LegalDocumentType, Record<LanguageCode, LegalDocument>> = {
  privacy: {
    ja: {
      eyebrow: 'kuroNekoEngine',
      title: 'プライバシーポリシー',
      lead: '本ポリシーは、kuroNekoEngine がどのような情報を取り扱い、どのような目的で利用するかを説明するものです。適用される法令および規制に従い、個人データを適切に取り扱うよう努めます。該当する場合には、GDPR/RGPD、APPI、CCPA/CPRA、PDPA その他の適用法令も考慮しますが、すべての法域に対する完全または絶対的な適合を表明するものではありません。',
      updatedLabel: '最終更新日',
      lastUpdated: '2026年9月2日',
      contactLabel: `連絡先: X ${CONTACT_HANDLE}`,
      backLabel: 'リンク一覧へ戻る',
      navLabel: '法的文書の切り替え',
      privacyLink: 'プライバシーポリシー',
      termsLink: '利用規約',
      sections: [
        {
          id: 'controller',
          title: '1. 管理者および連絡先',
          paragraphs: [
            '本サービスの運営者は クロネコ工房 です。現在の連絡先は X の @er_mao13619 です。プライバシーに関する問い合わせ、訂正、削除、その他の要望は、この連絡先から送信できます。'
          ]
        },
        {
          id: 'scope',
          title: '2. 適用範囲',
          paragraphs: [
            '本ポリシーは、kuroNekoEngine の公開 Linktree、VIP アクセス申請、アクセス状況確認、限定ギャラリー、VIP ボード、管理機能に関連して、本サービスが直接取り扱う情報に適用されます。',
            'PayPal、Fanbox、X、Pixiv などの外部サービスは、それぞれ独自の利用規約およびプライバシーポリシーに従って情報を取り扱います。'
          ]
        },
        {
          id: 'collected',
          title: '3. 収集または処理する情報',
          paragraphs: [
            '利用する機能に応じて、kuroNekoEngine は次の情報を処理する場合があります。'
          ],
          bullets: [
            '表示名または別名',
            'アクセス元または支援方法として選択された Fanbox / PayPal',
            '利用者が手動で入力した確認用情報',
            '任意の連絡先',
            'requestCode、userCode、accessKey',
            'アクセスの開始日、終了日、状態',
            'VIP ボードに送信された要望、提案、メッセージ'
          ]
        },
        {
          id: 'not-collected',
          title: '4. 現在収集しない情報',
          paragraphs: [
            'kuroNekoEngine は、現在、本人確認書類番号、パスポート番号、住所、必須の電話番号、GPS 位置情報、生体情報、広告用プロファイルを意図的に要求していません。',
            'また、本サービスは PayPal または Fanbox の認証情報、クレジットカード番号、銀行口座、支払い checkout 中に入力される金融情報を受け取りません。'
          ]
        },
        {
          id: 'purposes',
          title: '5. 利用目的',
          paragraphs: [
            '情報は、VIP アクセス申請の確認、アクセスキーの発行または管理、限定機能の提供、不正利用の防止、問い合わせ対応、サービス改善、管理上必要な記録保持のために利用されます。'
          ]
        },
        {
          id: 'storage',
          title: '6. 保存および保管期間',
          paragraphs: [
            'VIP 申請、アクセスキー、ギャラリー設定、Linktree 設定、VIP 要望などの一部情報は Google Sheets に保存されます。情報は、運営、監査、トラブル対応、権利行使への対応に必要な期間保持され、その後、合理的に不要になった場合に削除または無効化されることがあります。'
          ]
        },
        {
          id: 'browser-storage',
          title: '7. localStorage / sessionStorage',
          paragraphs: [
            '本サービスは、言語設定などの利便性のために localStorage を使用します。sessionStorage は、+18 確認、VIP セッション、管理セッションなど、一時的なブラウザ内状態の保持に使用されます。',
            'これらは従来型のトラッキング Cookie ではありませんが、同じ端末を利用する第三者に見える可能性があります。共有端末では利用後にログアウトし、ブラウザデータを削除してください。'
          ]
        },
        {
          id: 'cookies',
          title: '8. Cookie と広告トラッキング',
          paragraphs: [
            '現時点で、kuroNekoEngine は独自 Cookie、Google Analytics、Google Tag Manager、Meta Pixel、広告目的のフィンガープリントを使用していません。この状態に基づき、不要な Cookie バナーは実装していません。将来この方針が変わる場合、本ポリシーを更新します。'
          ]
        },
        {
          id: 'third-parties',
          title: '9. PayPal / Fanbox および外部サービス',
          paragraphs: [
            'PayPal と Fanbox は外部サービスです。支援または支払いはそれぞれのプラットフォーム上で行われ、kuroNekoEngine はカード番号、銀行口座、PayPal/Fanbox のパスワードを処理しません。',
            'クロネコ工房 は、必要に応じて外部サービス上で支援状況を手動確認し、その後 kuroNekoEngine で VIP アクセスを手動で発行、延長、停止する場合があります。'
          ]
        },
        {
          id: 'transfers',
          title: '10. 国際的な提供先',
          paragraphs: [
            '利用者は国際的にアクセスできます。Google、PayPal、Fanbox、X、Pixiv などのサービスを利用する場合、情報が他の国または地域、または国外で処理される可能性があります。各外部サービスによる処理は、それぞれの規約、ポリシーおよび処理体制に従います。'
          ]
        },
        {
          id: 'security',
          title: '11. セキュリティ',
          paragraphs: [
            'kuroNekoEngine は、アクセスキー、管理操作、入力値、スプレッドシート保存に関して合理的な保護措置を講じます。ただし、インターネット上の送信または保存について絶対的な安全性を保証することはできません。'
          ]
        },
        {
          id: 'rights',
          title: '12. 利用者の権利',
          paragraphs: [
            '適用される法律に従い、利用者は自身に関する情報へのアクセス、訂正、削除、処理制限、異議申立てを求めることができる場合があります。本人確認およびサービス運営上必要な範囲で対応します。'
          ]
        },
        {
          id: 'privacy-contact',
          title: '13. プライバシーに関する問い合わせ',
          paragraphs: [
            'プライバシーに関する要望を送る際は、対象となる requestCode または userCode を添えて、X @er_mao13619 まで連絡してください。アクセスキーそのものを公開の場で送信しないでください。'
          ]
        },
        {
          id: 'changes',
          title: '14. 変更',
          paragraphs: [
            'kuroNekoEngine は現在 Beta 版として提供されています。本ポリシーは、現時点のサービス機能および情報取扱いの実務を反映するものであり、技術的に不変の文書ではありません。サービス機能の発展、情報取扱いの変更、外部サービスの追加または削除、適用される法令・規制上の要件の変更、または明確性・正確性の向上が必要な場合に更新されることがあります。',
            'ただし、Beta 版であることは、適用される義務を免れる理由ではありません。本ポリシーの各版が有効である間は、kuroNekoEngine の現在の動作を適切に説明する必要があります。利用者は本ページを定期的に確認できます。重要な変更がある場合には、状況に応じて合理的な方法で通知します。'
          ]
        },
        {
          id: 'effective-date',
          title: '15. 施行日',
          paragraphs: [
            `本ポリシーの施行日および最終更新日は ${LAST_UPDATED_ISO} です。`
          ]
        }
      ]
    },
    es: {
      eyebrow: 'kuroNekoEngine',
      title: 'Política de Privacidad',
      lead: 'Esta política explica qué información trata kuroNekoEngine y con qué finalidad. Procuramos tratar adecuadamente los datos personales conforme a las leyes y regulaciones aplicables. Cuando corresponda, también se consideran GDPR/RGPD, APPI, CCPA/CPRA, PDPA y otras normas aplicables, sin declarar cumplimiento absoluto con todas las jurisdicciones.',
      updatedLabel: 'Última actualización',
      lastUpdated: '2 de septiembre de 2026',
      contactLabel: `Contacto: X ${CONTACT_HANDLE}`,
      backLabel: 'Volver al Linktree',
      navLabel: 'Cambiar documento legal',
      privacyLink: 'Política de Privacidad',
      termsLink: 'Términos de Servicio',
      sections: [
        {
          id: 'controller',
          title: '1. Responsable y contacto',
          paragraphs: [
            'El responsable del servicio es クロネコ工房. El contacto actual para consultas de privacidad es X @er_mao13619. Las solicitudes de acceso, corrección, eliminación u otras consultas relacionadas con datos pueden enviarse por ese canal.'
          ]
        },
        {
          id: 'scope',
          title: '2. Alcance',
          paragraphs: [
            'Esta política se aplica a la información procesada directamente por kuroNekoEngine en el Linktree público, solicitudes VIP, consulta de estado, galería exclusiva, VIP board y funciones de administración.',
            'Los servicios externos como PayPal, Fanbox, X y Pixiv procesan información conforme a sus propias políticas y términos.'
          ]
        },
        {
          id: 'collected',
          title: '3. Información que recopilamos o procesamos',
          paragraphs: [
            'Según la función utilizada, kuroNekoEngine puede procesar la siguiente información.'
          ],
          bullets: [
            'alias o displayName',
            'origen o método de acceso seleccionado, como Fanbox o PayPal',
            'información de verificación proporcionada manualmente por el usuario',
            'contacto opcional',
            'requestCode, userCode y accessKey',
            'fechas y estado del acceso VIP',
            'solicitudes, sugerencias o mensajes enviados desde el VIP board'
          ]
        },
        {
          id: 'not-collected',
          title: '4. Información que actualmente no recopilamos',
          paragraphs: [
            'kuroNekoEngine no solicita deliberadamente DNI, pasaporte, domicilio, teléfono obligatorio, ubicación GPS, biometría ni perfiles tradicionales de visitante.',
            'Tampoco recibe credenciales de PayPal/Fanbox, números de tarjeta, cuentas bancarias ni información financiera completa introducida durante un checkout externo.'
          ]
        },
        {
          id: 'purposes',
          title: '5. Finalidades',
          paragraphs: [
            'La información se utiliza para revisar solicitudes VIP, emitir o administrar claves de acceso, prestar funciones exclusivas, prevenir abuso, responder consultas, mejorar el servicio y conservar registros administrativos razonables.'
          ]
        },
        {
          id: 'storage',
          title: '6. Almacenamiento y conservación',
          paragraphs: [
            'Algunas solicitudes VIP, claves, configuraciones de Linktree, configuraciones de galería y sugerencias VIP se almacenan en Google Sheets. La información se conserva mientras sea necesaria para operar el servicio, resolver incidencias, atender solicitudes o cumplir obligaciones aplicables, y luego puede eliminarse, anonimizarse o deshabilitarse cuando resulte razonable.'
          ]
        },
        {
          id: 'browser-storage',
          title: '7. localStorage y sessionStorage',
          paragraphs: [
            'El sitio usa localStorage para preferencias como idioma. Usa sessionStorage para estados temporales como confirmación +18, sesión VIP y sesión de administración.',
            'Estos mecanismos no son cookies publicitarias, pero pueden quedar visibles para otras personas que usen el mismo navegador. En dispositivos compartidos se recomienda cerrar sesión y limpiar datos del navegador.'
          ]
        },
        {
          id: 'cookies',
          title: '8. Cookies y tracking publicitario',
          paragraphs: [
            'Actualmente no se detectan cookies propias, Google Analytics, Google Tag Manager, Meta Pixel, fingerprinting ni trackers publicitarios en kuroNekoEngine. Por ese motivo no se implementa un banner de cookies no esenciales. Si esto cambia, la política será actualizada.'
          ]
        },
        {
          id: 'third-parties',
          title: '9. PayPal, Fanbox y terceros',
          paragraphs: [
            'PayPal y Fanbox son plataformas externas. El pago o apoyo ocurre dentro de esas plataformas y kuroNekoEngine no procesa números de tarjeta, cuentas bancarias, contraseñas de PayPal ni credenciales de Fanbox.',
            'クロネコ工房 puede verificar manualmente en esas plataformas si corresponde habilitar acceso y luego generar, extender o revocar manualmente una clave VIP dentro de kuroNekoEngine.'
          ]
        },
        {
          id: 'transfers',
          title: '10. Transferencias y proveedores internacionales',
          paragraphs: [
            'El servicio puede ser usado por una audiencia internacional. Al utilizar proveedores como Google, PayPal, Fanbox, X o Pixiv, cierta información puede procesarse en otros países o regiones. Cada proveedor externo opera bajo sus propias reglas, políticas y ubicaciones de procesamiento.'
          ]
        },
        {
          id: 'security',
          title: '11. Seguridad',
          paragraphs: [
            'kuroNekoEngine aplica medidas razonables para proteger claves de acceso, acciones administrativas, validación de entradas y almacenamiento en hojas de cálculo. Ningún sistema conectado a Internet puede garantizar seguridad absoluta.'
          ]
        },
        {
          id: 'rights',
          title: '12. Derechos',
          paragraphs: [
            'Según la ley aplicable, puedes solicitar acceso, corrección, eliminación, limitación u oposición respecto de información vinculada a ti. La respuesta puede requerir datos suficientes para identificar la solicitud sin exponer claves sensibles.'
          ]
        },
        {
          id: 'privacy-contact',
          title: '13. Solicitudes de privacidad',
          paragraphs: [
            'Para ejercer derechos o realizar consultas, contacta por X @er_mao13619 e incluye, cuando sea necesario, el requestCode o userCode relacionado. No publiques tu accessKey en mensajes visibles públicamente.'
          ]
        },
        {
          id: 'changes',
          title: '14. Cambios de la política',
          paragraphs: [
            'kuroNekoEngine se encuentra actualmente en versión Beta. Esta política refleja las funcionalidades y prácticas actuales de tratamiento de información del servicio, pero no constituye un documento técnicamente inmutable. Puede actualizarse cuando evolucionen las funcionalidades, cambien las prácticas de tratamiento de información, se incorporen o eliminen servicios externos, cambien requisitos legales o regulatorios aplicables, o sea necesario mejorar su claridad o precisión.',
            'La condición Beta no funciona como exención de responsabilidad ni como justificación para incumplir obligaciones aplicables. Mientras una versión de esta política esté vigente, debe describir correctamente el funcionamiento actual de kuroNekoEngine. Se recomienda revisar periódicamente este documento; cuando corresponda, los cambios importantes serán comunicados de manera razonable.'
          ]
        },
        {
          id: 'effective-date',
          title: '15. Vigencia',
          paragraphs: [
            `Esta política entra en vigor y fue actualizada por última vez el ${LAST_UPDATED_ISO}.`
          ]
        }
      ]
    },
    en: {
      eyebrow: 'kuroNekoEngine',
      title: 'Privacy Policy',
      lead: 'This policy explains what information kuroNekoEngine processes and for what purposes. We seek to handle personal data appropriately in accordance with applicable laws and regulations. Where relevant, GDPR/RGPD, APPI, CCPA/CPRA, PDPA, and other applicable rules may also be considered, without claiming absolute compliance with every jurisdiction.',
      updatedLabel: 'Last updated',
      lastUpdated: 'September 2, 2026',
      contactLabel: `Contact: X ${CONTACT_HANDLE}`,
      backLabel: 'Back to Linktree',
      navLabel: 'Switch legal document',
      privacyLink: 'Privacy Policy',
      termsLink: 'Terms of Service',
      sections: [
        {
          id: 'controller',
          title: '1. Controller and Contact',
          paragraphs: [
            'The service is operated by クロネコ工房. The current privacy contact is X @er_mao13619. Requests for access, correction, deletion, or other privacy matters may be sent through that channel.'
          ]
        },
        {
          id: 'scope',
          title: '2. Scope',
          paragraphs: [
            'This policy applies to information processed directly by kuroNekoEngine through the public Linktree, VIP access requests, request status checks, exclusive gallery, VIP board, and administration features.',
            'External services such as PayPal, Fanbox, X, and Pixiv process information under their own terms and privacy policies.'
          ]
        },
        {
          id: 'collected',
          title: '3. Information We Collect or Process',
          paragraphs: [
            'Depending on the feature used, kuroNekoEngine may process the following information.'
          ],
          bullets: [
            'alias or displayName',
            'selected access source or support method, such as Fanbox or PayPal',
            'verification information manually provided by the user',
            'optional contact information',
            'requestCode, userCode, and accessKey',
            'VIP access dates and status',
            'requests, suggestions, or messages submitted through the VIP board'
          ]
        },
        {
          id: 'not-collected',
          title: '4. Information We Do Not Currently Collect',
          paragraphs: [
            'kuroNekoEngine does not deliberately request government ID numbers, passport numbers, home address, mandatory phone number, GPS location, biometric data, or a traditional visitor profile.',
            'It also does not receive PayPal/Fanbox credentials, card numbers, bank accounts, or full financial information entered during an external checkout.'
          ]
        },
        {
          id: 'purposes',
          title: '5. Purposes',
          paragraphs: [
            'Information is used to review VIP requests, issue or manage access keys, provide exclusive features, prevent abuse, respond to inquiries, improve the service, and keep reasonable administrative records.'
          ]
        },
        {
          id: 'storage',
          title: '6. Storage and Retention',
          paragraphs: [
            'Some VIP requests, keys, Linktree settings, gallery settings, and VIP suggestions are stored in Google Sheets. Information is retained while needed to operate the service, resolve issues, respond to requests, or meet applicable obligations, and may later be deleted, anonymized, or disabled when reasonable.'
          ]
        },
        {
          id: 'browser-storage',
          title: '7. localStorage and sessionStorage',
          paragraphs: [
            'The site uses localStorage for preferences such as language. sessionStorage is used for temporary browser state such as +18 confirmation, VIP session, and admin session.',
            'These mechanisms are not advertising cookies, but they may be visible to other people using the same browser. On shared devices, log out and clear browser data after use.'
          ]
        },
        {
          id: 'cookies',
          title: '8. Cookies and Advertising Tracking',
          paragraphs: [
            'kuroNekoEngine currently does not use first-party cookies, Google Analytics, Google Tag Manager, Meta Pixel, fingerprinting, or advertising trackers. Based on this, no non-essential cookie banner is implemented. If this changes, this policy will be updated.'
          ]
        },
        {
          id: 'third-parties',
          title: '9. PayPal, Fanbox, and Third Parties',
          paragraphs: [
            'PayPal and Fanbox are external platforms. Payments or support happen on those platforms, and kuroNekoEngine does not process card numbers, bank accounts, PayPal passwords, or Fanbox credentials.',
            'クロネコ工房 may manually verify support status on those platforms and then manually generate, extend, or revoke a VIP key inside kuroNekoEngine.'
          ]
        },
        {
          id: 'transfers',
          title: '10. International Providers and Transfers',
          paragraphs: [
            'The service may be used by an international audience. When providers such as Google, PayPal, Fanbox, X, or Pixiv are used, certain information may be processed in other countries or regions. Each external provider operates under its own rules, policies, and processing locations.'
          ]
        },
        {
          id: 'security',
          title: '11. Security',
          paragraphs: [
            'kuroNekoEngine applies reasonable safeguards for access keys, administrative actions, input validation, and spreadsheet storage. No internet-connected system can guarantee absolute security.'
          ]
        },
        {
          id: 'rights',
          title: '12. Rights',
          paragraphs: [
            'Depending on applicable law, you may request access, correction, deletion, restriction, or objection regarding information linked to you. A response may require enough information to identify the request without exposing sensitive keys.'
          ]
        },
        {
          id: 'privacy-contact',
          title: '13. Privacy Requests',
          paragraphs: [
            'To exercise rights or ask privacy questions, contact X @er_mao13619 and include the related requestCode or userCode when needed. Do not post your accessKey in publicly visible messages.'
          ]
        },
        {
          id: 'changes',
          title: '14. Changes to This Policy',
          paragraphs: [
            'kuroNekoEngine is currently in Beta. This policy reflects the current features and information-handling practices of the service, but it is not a technically immutable document. It may be updated when features evolve, information-handling practices change, external services are added or removed, applicable legal or regulatory requirements change, or clarity or accuracy needs to be improved.',
            'Beta status is not a waiver of responsibility or a justification for failing to meet applicable obligations. While a version of this policy is in effect, it must accurately describe the current operation of kuroNekoEngine. Users may review this document periodically; where appropriate, important changes will be communicated in a reasonable manner.'
          ]
        },
        {
          id: 'effective-date',
          title: '15. Effective Date',
          paragraphs: [
            `This policy is effective and was last updated on ${LAST_UPDATED_ISO}.`
          ]
        }
      ]
    },
    'zh-CN': {
      eyebrow: 'kuroNekoEngine',
      title: '隐私政策',
      lead: '本政策说明 kuroNekoEngine 会处理哪些信息以及处理目的。我们会尽力依据适用的法律法规妥善处理个人数据。在适用时，也会考虑 GDPR/RGPD、APPI、CCPA/CPRA、PDPA 及其他适用规范，但不声明对所有司法辖区作出绝对或全面合规承诺。',
      updatedLabel: '最后更新',
      lastUpdated: '2026年9月2日',
      contactLabel: `联系方式：X ${CONTACT_HANDLE}`,
      backLabel: '返回 Linktree',
      navLabel: '切换法律文件',
      privacyLink: '隐私政策',
      termsLink: '服务条款',
      sections: [
        {
          id: 'controller',
          title: '1. 负责人和联系方式',
          paragraphs: [
            '本服务由 クロネコ工房 运营。目前的隐私联系渠道为 X @er_mao13619。关于访问、更正、删除或其他隐私事项的请求，可以通过该渠道提出。'
          ]
        },
        {
          id: 'scope',
          title: '2. 适用范围',
          paragraphs: [
            '本政策适用于 kuroNekoEngine 在公开 Linktree、VIP 访问申请、申请状态查询、限定图库、VIP 留言板和管理功能中直接处理的信息。',
            'PayPal、Fanbox、X、Pixiv 等外部服务会依据其自身条款和隐私政策处理信息。'
          ]
        },
        {
          id: 'collected',
          title: '3. 我们收集或处理的信息',
          paragraphs: [
            '根据使用的功能，kuroNekoEngine 可能处理以下信息。'
          ],
          bullets: [
            '别名或 displayName',
            '选择的访问来源或支持方式，例如 Fanbox 或 PayPal',
            '用户手动提供的验证信息',
            '可选联系方式',
            'requestCode、userCode 和 accessKey',
            'VIP 访问日期和状态',
            '通过 VIP 留言板提交的请求、建议或消息'
          ]
        },
        {
          id: 'not-collected',
          title: '4. 目前不收集的信息',
          paragraphs: [
            'kuroNekoEngine 目前不会主动要求身份证件号码、护照号码、住址、必填电话号码、GPS 位置、生物识别信息或传统访客档案。',
            '本服务也不会接收 PayPal/Fanbox 登录凭据、银行卡号、银行账户或在外部 checkout 中输入的完整金融信息。'
          ]
        },
        {
          id: 'purposes',
          title: '5. 处理目的',
          paragraphs: [
            '信息用于审核 VIP 申请、生成或管理访问密钥、提供限定功能、防止滥用、回复咨询、改进服务以及保存合理的管理记录。'
          ]
        },
        {
          id: 'storage',
          title: '6. 存储与保留',
          paragraphs: [
            '部分 VIP 申请、密钥、Linktree 设置、图库设置和 VIP 建议会存储在 Google Sheets 中。信息会在服务运营、问题处理、回应请求或履行适用义务所需期间保留，之后可在合理情况下删除、匿名化或停用。'
          ]
        },
        {
          id: 'browser-storage',
          title: '7. localStorage 与 sessionStorage',
          paragraphs: [
            '网站使用 localStorage 保存语言等偏好设置。sessionStorage 用于 +18 确认、VIP 会话和管理员会话等临时浏览器状态。',
            '这些机制不是广告 cookie，但同一浏览器的其他使用者可能看到相关状态。在共用设备上，请在使用后退出并清除浏览器数据。'
          ]
        },
        {
          id: 'cookies',
          title: '8. Cookie 与广告追踪',
          paragraphs: [
            '目前 kuroNekoEngine 不使用第一方 cookie、Google Analytics、Google Tag Manager、Meta Pixel、fingerprinting 或广告追踪器。因此未实现非必要 cookie 横幅。如未来发生变化，本政策将更新。'
          ]
        },
        {
          id: 'third-parties',
          title: '9. PayPal、Fanbox 和第三方',
          paragraphs: [
            'PayPal 和 Fanbox 是外部平台。付款或支持行为发生在这些平台上，kuroNekoEngine 不处理银行卡号、银行账户、PayPal 密码或 Fanbox 登录凭据。',
            'クロネコ工房 可在这些平台上手动核实支持状态，然后在 kuroNekoEngine 内手动生成、延长或撤销 VIP 密钥。'
          ]
        },
        {
          id: 'transfers',
          title: '10. 国际服务商与跨境处理',
          paragraphs: [
            '本服务面向国际受众。使用 Google、PayPal、Fanbox、X 或 Pixiv 等服务商时，某些信息可能在其他国家或地区处理。各外部服务商按照其自身规则、政策和处理地点运营。'
          ]
        },
        {
          id: 'security',
          title: '11. 安全',
          paragraphs: [
            'kuroNekoEngine 对访问密钥、管理操作、输入验证和表格存储采取合理保护措施。但任何联网系统都无法保证绝对安全。'
          ]
        },
        {
          id: 'rights',
          title: '12. 权利',
          paragraphs: [
            '根据适用法律，你可能有权请求访问、更正、删除、限制处理或反对处理与你相关的信息。处理请求时，可能需要足以识别相关记录的信息，但不应公开敏感密钥。'
          ]
        },
        {
          id: 'privacy-contact',
          title: '13. 隐私请求',
          paragraphs: [
            '如需行使权利或咨询隐私问题，请联系 X @er_mao13619，并在必要时提供相关 requestCode 或 userCode。请勿在公开可见的信息中发布 accessKey。'
          ]
        },
        {
          id: 'changes',
          title: '14. 政策变更',
          paragraphs: [
            'kuroNekoEngine 目前处于 Beta 版本。本政策反映服务当前的功能以及信息处理实践，但并不是技术上不可变更的文件。当服务功能发展、信息处理实践发生变化、外部服务被加入或移除、适用的法律或监管要求发生变化，或需要提升清晰度与准确性时，本政策可能会更新。',
            'Beta 状态并不构成责任豁免，也不能作为不履行适用义务的理由。在某一版本的本政策有效期间，其内容应当准确描述 kuroNekoEngine 的当前运行方式。建议用户定期查看本文件；在适当情况下，重要变更将以合理方式通知。'
          ]
        },
        {
          id: 'effective-date',
          title: '15. 生效日期',
          paragraphs: [
            `本政策自 ${LAST_UPDATED_ISO} 起生效并于该日最后更新。`
          ]
        }
      ]
    },
    'zh-TW': {
      eyebrow: 'kuroNekoEngine',
      title: '隱私政策',
      lead: '本政策說明 kuroNekoEngine 會處理哪些資訊以及處理目的。我們會盡力依據適用的法律與規範妥善處理個人資料。於適用時，也會考量 GDPR/RGPD、APPI、CCPA/CPRA、PDPA 與其他適用規範，但不聲明對所有司法管轄區作出絕對或全面合規承諾。',
      updatedLabel: '最後更新',
      lastUpdated: '2026年9月2日',
      contactLabel: `聯絡方式：X ${CONTACT_HANDLE}`,
      backLabel: '返回 Linktree',
      navLabel: '切換法律文件',
      privacyLink: '隱私政策',
      termsLink: '服務條款',
      sections: [
        {
          id: 'controller',
          title: '1. 負責人與聯絡方式',
          paragraphs: [
            '本服務由 クロネコ工房 營運。目前的隱私聯絡管道為 X @er_mao13619。關於查詢、更正、刪除或其他隱私事項的請求，可透過該管道提出。'
          ]
        },
        {
          id: 'scope',
          title: '2. 適用範圍',
          paragraphs: [
            '本政策適用於 kuroNekoEngine 在公開 Linktree、VIP 存取申請、申請狀態查詢、限定圖庫、VIP 留言板與管理功能中直接處理的資訊。',
            'PayPal、Fanbox、X、Pixiv 等外部服務會依其自身條款與隱私政策處理資訊。'
          ]
        },
        {
          id: 'collected',
          title: '3. 我們蒐集或處理的資訊',
          paragraphs: [
            '依使用功能不同，kuroNekoEngine 可能處理下列資訊。'
          ],
          bullets: [
            '別名或 displayName',
            '選擇的存取來源或支持方式，例如 Fanbox 或 PayPal',
            '使用者手動提供的驗證資訊',
            '選填聯絡方式',
            'requestCode、userCode 與 accessKey',
            'VIP 存取日期與狀態',
            '透過 VIP 留言板提交的請求、建議或訊息'
          ]
        },
        {
          id: 'not-collected',
          title: '4. 目前不蒐集的資訊',
          paragraphs: [
            'kuroNekoEngine 目前不會主動要求身分證件號碼、護照號碼、住址、必填電話號碼、GPS 位置、生物識別資料或傳統訪客檔案。',
            '本服務也不會接收 PayPal/Fanbox 登入憑證、信用卡號、銀行帳戶或在外部 checkout 中輸入的完整金融資訊。'
          ]
        },
        {
          id: 'purposes',
          title: '5. 處理目的',
          paragraphs: [
            '資訊會用於審核 VIP 申請、產生或管理存取金鑰、提供限定功能、防止濫用、回覆詢問、改善服務，以及保存合理的管理紀錄。'
          ]
        },
        {
          id: 'storage',
          title: '6. 儲存與保留',
          paragraphs: [
            '部分 VIP 申請、金鑰、Linktree 設定、圖庫設定與 VIP 建議會儲存在 Google Sheets。資訊會在服務營運、問題處理、回應請求或履行適用義務所需期間保留，之後可在合理情況下刪除、匿名化或停用。'
          ]
        },
        {
          id: 'browser-storage',
          title: '7. localStorage 與 sessionStorage',
          paragraphs: [
            '網站使用 localStorage 保存語言等偏好設定。sessionStorage 用於 +18 確認、VIP session 與管理員 session 等暫時性的瀏覽器狀態。',
            '這些機制不是廣告 cookie，但同一瀏覽器的其他使用者可能看到相關狀態。在共用裝置上，請於使用後登出並清除瀏覽器資料。'
          ]
        },
        {
          id: 'cookies',
          title: '8. Cookie 與廣告追蹤',
          paragraphs: [
            '目前 kuroNekoEngine 不使用第一方 cookie、Google Analytics、Google Tag Manager、Meta Pixel、fingerprinting 或廣告追蹤器。因此未實作非必要 cookie 橫幅。若未來情況改變，本政策將會更新。'
          ]
        },
        {
          id: 'third-parties',
          title: '9. PayPal、Fanbox 與第三方',
          paragraphs: [
            'PayPal 與 Fanbox 是外部平台。付款或支持行為發生在這些平台上，kuroNekoEngine 不處理信用卡號、銀行帳戶、PayPal 密碼或 Fanbox 登入憑證。',
            'クロネコ工房 可在這些平台上手動確認支持狀態，之後在 kuroNekoEngine 內手動產生、延長或撤銷 VIP 金鑰。'
          ]
        },
        {
          id: 'transfers',
          title: '10. 國際服務商與跨境處理',
          paragraphs: [
            '本服務面向國際受眾。使用 Google、PayPal、Fanbox、X 或 Pixiv 等服務商時，某些資訊可能在其他國家或地區處理。各外部服務商依其自身規則、政策與處理地點營運。'
          ]
        },
        {
          id: 'security',
          title: '11. 安全',
          paragraphs: [
            'kuroNekoEngine 對存取金鑰、管理操作、輸入驗證與試算表儲存採取合理保護措施。但任何連網系統都無法保證絕對安全。'
          ]
        },
        {
          id: 'rights',
          title: '12. 權利',
          paragraphs: [
            '依適用法律，你可能有權要求查詢、更正、刪除、限制處理或反對處理與你相關的資訊。處理請求時，可能需要足以識別相關紀錄的資訊，但不應公開敏感金鑰。'
          ]
        },
        {
          id: 'privacy-contact',
          title: '13. 隱私請求',
          paragraphs: [
            '如需行使權利或詢問隱私問題，請聯絡 X @er_mao13619，並於必要時提供相關 requestCode 或 userCode。請勿在公開可見的訊息中發布 accessKey。'
          ]
        },
        {
          id: 'changes',
          title: '14. 政策變更',
          paragraphs: [
            'kuroNekoEngine 目前處於 Beta 版本。本政策反映服務目前的功能與資訊處理實務，但並非技術上不可變更的文件。當服務功能演進、資訊處理實務改變、外部服務被加入或移除、適用法律或監管要求變更，或需要提升清晰度與準確性時，本政策可能會更新。',
            'Beta 狀態並不構成責任豁免，也不能作為不履行適用義務的理由。在某一版本的本政策有效期間，其內容應正確描述 kuroNekoEngine 目前的運作方式。建議使用者定期查看本文件；於適當情況下，重要變更將以合理方式通知。'
          ]
        },
        {
          id: 'effective-date',
          title: '15. 生效日期',
          paragraphs: [
            `本政策自 ${LAST_UPDATED_ISO} 起生效並於該日最後更新。`
          ]
        }
      ]
    }
  },
  terms: {
    ja: {
      eyebrow: 'kuroNekoEngine',
      title: '利用規約',
      lead: '本規約は、kuroNekoEngine の利用条件を定めるものです。本サービスは、アニメ・マンガ調のデジタルイラストと関連する支援、VIP アクセス、限定コンテンツを扱うクリエイティブサービスです。',
      updatedLabel: '最終更新日',
      lastUpdated: '2026年9月2日',
      contactLabel: `連絡先: X ${CONTACT_HANDLE}`,
      backLabel: 'リンク一覧へ戻る',
      navLabel: '法的文書の切り替え',
      privacyLink: 'プライバシーポリシー',
      termsLink: '利用規約',
      sections: [
        {
          id: 'acceptance',
          title: '1. 規約への同意',
          paragraphs: [
            'kuroNekoEngine を利用することにより、利用者は本規約に従うことに同意したものとみなされます。同意できない場合は、本サービスを利用しないでください。'
          ]
        },
        {
          id: 'service',
          title: '2. サービスの性質',
          paragraphs: [
            '本サービスは、クロネコ工房 によるデジタルイラスト、キャラクター、ギャラリー、支援案内、VIP 機能を提供または案内します。内容には、アニメ・漫画調の表現、オリジナルキャラクター、AI により生成または支援された作品、少年キャラクター表現（いわゆる「ショタ」系を含む）、ボーイッシュなキャラクター表現、アンドロジナスまたはジェンダー表現がスタイライズされたキャラクター表現、その他アニメ・漫画由来の表現が含まれる場合があります。これらの分類は説明および透明性のためのものであり、それ自体が性的内容を意味するものではありません。',
            '作品の架空性、視覚スタイル、または芸術的カテゴリは、それだけで適法性または許容性を決定するものではありません。特定の内容は、該当する国または地域の適用法令により異なる制限を受ける場合があります。'
          ]
        },
        {
          id: 'adult',
          title: '3. 一般コンテンツと +18 エリア',
          paragraphs: [
            '+18 と表示されたエリアまたは外部リンクは、利用者の法域で適法に閲覧できる年齢に達している人のみを対象とします。年齢ゲートは自己申告による確認であり、公的書類による本人確認ではありません。',
            '+18 確認はプライバシー処理への同意とは別のものです。'
          ]
        },
        {
          id: 'vip',
          title: '4. VIP アクセスとキー',
          paragraphs: [
            'VIP アクセスは手動確認に基づいて発行、延長、停止、または取り消される場合があります。userCode と accessKey は個人利用のためのものであり、共有、転売、公開は禁止されます。',
            'アクセスには有効期限または状態があり、不正利用、誤用、運営上の必要により合理的に停止される場合があります。'
          ]
        },
        {
          id: 'payments',
          title: '5. PayPal / Fanbox と外部サービス',
          paragraphs: [
            'PayPal と Fanbox は外部サービスです。支払い、支援、返金、アカウント管理は各プラットフォームの規約に従います。kuroNekoEngine は外部 checkout の金融情報や認証情報を管理しません。'
          ]
        },
        {
          id: 'intellectual-property',
          title: '6. 知的財産',
          paragraphs: [
            '本サービスで公開されるイラスト、キャラクター、ロゴ、文章、UI 要素その他のコンテンツは、対応する権利が適用法令により認められる範囲で、クロネコ工房 または各権利者に帰属します。公開されていること自体は、複製、再配布、再販売、商用利用、大量抽出、または AI モデル・システムの学習を目的としたデータセットへの組み込みを一般的に許可するものではありません。',
            '明示的な許可がある場合、または適用法令が別段の権利・例外を定める場合を除き、コンテンツの無断再配布、キャラクター・ロゴ・作品を自分のものとして販売・サブライセンス・商用利用すること、無断の大量取得や乱用的スクレイピング、未許可の AI 学習用データセットへの利用は禁止されます。',
            '本規約は、利用者がクロネコ工房 のキャラクターを題材にした非商用の表現やファンアートを制作すること自体を、単にそのキャラクターを使用したという理由だけで禁止するものではありません。ただし、原作者または権利者であると偽ること、クロネコ工房、そのメンバー、公式代理人であると偽ること、その他許可範囲や適用法令に反する利用は認められません。'
          ]
        },
        {
          id: 'prohibited',
          title: '7. 禁止行為',
          paragraphs: [
            '利用者は、詐欺、不正アクセス、アクセス制限の回避、キーの共有、無断再配布、乱用的スクレイピング、サービスの運営妨害、なりすまし、アクセス取得またはサービスへの損害を目的とする意図的な虚偽情報の送信、その他適用法令に反する行為を行ってはなりません。',
            'kuroNekoEngine を、児童の性的搾取または虐待に関連する素材の要求、宣伝、助長、保存、配布、または実在する人物に対する搾取、虐待その他の違法行為を助長する目的で利用することは、厳格に禁止されます。',
            '架空のキャラクター、アニメ・漫画調の表現、AI により生成または支援されたコンテンツ、または特定の芸術的カテゴリが含まれることは、それだけで許容性または違法性を決定するものではありません。すべてのコンテンツおよび本サービスの利用は、本規約および法域により異なる場合のある適用法令に従います。'
          ]
        },
        {
          id: 'suspension',
          title: '8. 停止および取消し',
          paragraphs: [
            '本規約違反、不正利用の疑い、法的リスク、運営上の必要がある場合、クロネコ工房 は合理的な範囲でアクセスを停止、制限、または取り消すことができます。'
          ]
        },
        {
          id: 'availability',
          title: '9. 可用性と変更',
          paragraphs: [
            '本サービスは、メンテナンス、外部サービス、通信環境、開発状況により中断または変更される場合があります。機能、デザイン、コンテンツ、VIP 条件は予告なく更新されることがあります。'
          ]
        },
        {
          id: 'liability',
          title: '10. 責任の制限',
          paragraphs: [
            '法律で認められる範囲において、kuroNekoEngine および クロネコ工房 は、サービス利用または利用不能から生じる間接的、偶発的、特別、派生的な損害について責任を負いません。強行法規に基づく権利は制限されません。'
          ]
        },
        {
          id: 'privacy',
          title: '11. プライバシー',
          paragraphs: [
            '情報の取り扱いについては、別途プライバシーポリシーを参照してください。+18 確認、VIP 申請、外部支援サービスの利用は、それぞれ異なる目的および法的性質を持ちます。'
          ]
        },
        {
          id: 'jurisdiction',
          title: '12. 準拠法および管轄',
          paragraphs: [
            '本規約は、適用される法令および規制に従って解釈されます。本規約のいかなる内容も、利用者の居住地の適用法令に基づき利用者に認められる強行的な権利を排除するものではありません。'
          ]
        },
        {
          id: 'changes',
          title: '13. 規約の変更',
          paragraphs: [
            'kuroNekoEngine は現在 Beta 版として提供されています。本規約は、現時点のサービス内容および運用実務を反映するものであり、技術的に不変の文書ではありません。サービス機能の発展、情報取扱いの変更、外部サービスの追加または削除、適用される法令・規制上の要件の変更、または明確性・正確性の向上が必要な場合に更新されることがあります。',
            'ただし、Beta 版であることは、適用される義務を免れる理由ではありません。本規約の各版が有効である間は、kuroNekoEngine の現在の運用を適切に説明する必要があります。利用者は本ページを定期的に確認できます。重要な変更がある場合には、状況に応じて合理的な方法で通知します。'
          ]
        },
        {
          id: 'effective-date',
          title: '14. 施行日',
          paragraphs: [
            `本規約の施行日および最終更新日は ${LAST_UPDATED_ISO} です。`
          ]
        }
      ]
    },
    es: {
      eyebrow: 'kuroNekoEngine',
      title: 'Términos de Servicio',
      lead: 'Estos términos regulan el uso de kuroNekoEngine, un servicio creativo vinculado a ilustración digital estilo anime/manga, enlaces públicos, acceso VIP y contenido exclusivo administrado por クロネコ工房.',
      updatedLabel: 'Última actualización',
      lastUpdated: '2 de septiembre de 2026',
      contactLabel: `Contacto: X ${CONTACT_HANDLE}`,
      backLabel: 'Volver al Linktree',
      navLabel: 'Cambiar documento legal',
      privacyLink: 'Política de Privacidad',
      termsLink: 'Términos de Servicio',
      sections: [
        {
          id: 'acceptance',
          title: '1. Aceptación',
          paragraphs: [
            'Al acceder o utilizar kuroNekoEngine aceptas estos términos. Si no estás de acuerdo, no utilices el servicio.'
          ]
        },
        {
          id: 'service',
          title: '2. Naturaleza del servicio',
          paragraphs: [
            'kuroNekoEngine presenta ilustración digital, personajes, galerías, información de apoyo y funciones VIP de クロネコ工房. El contenido puede incluir obras de estilo anime/manga, personajes originales y obras generadas o asistidas mediante IA. Entre sus categorías creativas pueden aparecer personajes masculinos ficticios de apariencia juvenil, incluidos estilos conocidos en japonés como shota-kei, personajes femeninos de estética boyish o tomboy cuando corresponda, personajes andróginos o con expresión de género estilizada y otros estilos propios de la ilustración anime/manga. Estas categorías son descriptivas y de transparencia, y no implican por sí mismas contenido sexual.',
            'La naturaleza ficticia, el estilo visual o la categoría artística de una obra no determinan por sí solos su legalidad o admisibilidad. Determinados contenidos pueden estar sujetos a restricciones diferentes conforme a la legislación aplicable del país o región correspondiente.'
          ]
        },
        {
          id: 'adult',
          title: '3. Contenido general y áreas +18',
          paragraphs: [
            'Las áreas o enlaces marcados como +18 están destinados únicamente a personas con edad legal suficiente para acceder a ese tipo de contenido según su jurisdicción. El age gate funciona como una confirmación declarativa de edad, no como verificación documental.',
            'La confirmación +18 no equivale a consentimiento de privacidad.'
          ]
        },
        {
          id: 'vip',
          title: '4. Acceso VIP y claves',
          paragraphs: [
            'El acceso VIP puede generarse, extenderse, suspenderse o revocarse manualmente después de una revisión razonable. El userCode y la accessKey son de uso personal y no deben compartirse, revenderse ni publicarse.',
            'El acceso puede tener vencimiento o estado de activación. El abuso, fraude, redistribución no autorizada o evasión de controles puede provocar suspensión o revocación.'
          ]
        },
        {
          id: 'payments',
          title: '5. PayPal, Fanbox y servicios externos',
          paragraphs: [
            'PayPal y Fanbox son servicios externos. Pagos, apoyos, reembolsos y administración de cuentas se rigen por las reglas de cada plataforma. kuroNekoEngine no administra datos financieros ni credenciales ingresadas durante checkout externo.'
          ]
        },
        {
          id: 'intellectual-property',
          title: '6. Propiedad intelectual',
          paragraphs: [
            'Las ilustraciones, personajes, logotipos, textos, elementos de interfaz y demás contenidos disponibles en kuroNekoEngine corresponden a クロネコ工房 o a sus respectivos titulares, en la medida en que los derechos correspondientes sean reconocidos por la legislación aplicable. Su disponibilidad pública no implica una autorización general para copiarlos, redistribuirlos, revenderlos, explotarlos comercialmente, extraerlos masivamente o incorporarlos a conjuntos de datos destinados al entrenamiento de modelos o sistemas de IA.',
            'Salvo autorización expresa o cuando la legislación aplicable disponga lo contrario, no está permitido redistribuir contenido obtenido del servicio sin autorización, vender, sublicenciar o explotar comercialmente personajes, logotipos u obras de クロネコ工房 como si fueran propios, realizar extracción masiva o scraping abusivo, ni utilizar contenido protegido de クロネコ工房 en conjuntos de datos destinados al entrenamiento de sistemas de IA cuando ese uso no haya sido autorizado.',
            'Estos Términos no prohíben que un usuario dibuje, genere o cree una representación no comercial o fanart de un personaje de クロネコ工房 únicamente por utilizar ese personaje. Lo que no está autorizado es atribuirse falsamente la creación original o titularidad del personaje, presentarse falsamente como クロネコ工房, como uno de sus miembros o como representante oficial, o usar ese contenido fuera de los permisos correspondientes y de lo permitido por la legislación aplicable.'
          ]
        },
        {
          id: 'prohibited',
          title: '7. Conductas prohibidas',
          paragraphs: [
            'Se prohíbe fraude, acceso no autorizado, evasión de controles de acceso, redistribución no autorizada, scraping abusivo, interferencia con el funcionamiento del servicio, suplantación de identidad, información deliberadamente falsa utilizada para obtener acceso o perjudicar el servicio y cualquier otro uso contrario a la legislación aplicable.',
            'Queda terminantemente prohibido utilizar kuroNekoEngine para solicitar, promover, facilitar, almacenar o distribuir material de explotación o abuso sexual infantil, así como para facilitar explotación, abuso u otras conductas ilícitas contra personas reales.',
            'La presencia de personajes ficticios, estilos anime/manga, contenido generado o asistido mediante IA o determinadas categorías artísticas no determina por sí sola su admisibilidad o ilicitud. Todo contenido y uso del servicio permanece sujeto a estos Términos y a la legislación aplicable, que puede variar entre jurisdicciones.'
          ]
        },
        {
          id: 'suspension',
          title: '8. Suspensión o revocación',
          paragraphs: [
            'クロネコ工房 puede suspender, limitar o revocar accesos de forma razonable ante incumplimientos, sospechas de abuso, riesgos legales, problemas técnicos o necesidades operativas.'
          ]
        },
        {
          id: 'availability',
          title: '9. Disponibilidad y cambios',
          paragraphs: [
            'El servicio puede cambiar, interrumpirse o permanecer no disponible por mantenimiento, servicios externos, fallas técnicas o decisiones de desarrollo. Funciones, diseño, contenido y condiciones VIP pueden actualizarse.'
          ]
        },
        {
          id: 'liability',
          title: '10. Limitación de responsabilidad',
          paragraphs: [
            'En la medida permitida por la ley, kuroNekoEngine y クロネコ工房 no serán responsables por daños indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad de uso del servicio. Nada limita derechos obligatorios que no puedan excluirse legalmente.'
          ]
        },
        {
          id: 'privacy',
          title: '11. Privacidad',
          paragraphs: [
            'El tratamiento de información se describe en la Política de Privacidad. La confirmación +18, la solicitud VIP y el uso de plataformas externas tienen finalidades y bases distintas; no deben mezclarse como un único consentimiento.'
          ]
        },
        {
          id: 'jurisdiction',
          title: '12. Jurisdicción',
          paragraphs: [
            'Estos Términos se interpretarán de acuerdo con las leyes y regulaciones aplicables. Nada de estos Términos excluye derechos obligatorios que correspondan al usuario conforme a la legislación aplicable de su lugar de residencia.'
          ]
        },
        {
          id: 'changes',
          title: '13. Modificaciones',
          paragraphs: [
            'kuroNekoEngine se encuentra actualmente en versión Beta. Estos Términos reflejan el funcionamiento y las prácticas actuales del servicio, pero no constituyen documentos técnicamente inmutables. Pueden actualizarse cuando evolucionen las funcionalidades, cambien las prácticas de tratamiento de información, se incorporen o eliminen servicios externos, cambien requisitos legales o regulatorios aplicables, o sea necesario mejorar su claridad o precisión.',
            'La condición Beta no funciona como exención de responsabilidad ni como justificación para incumplir obligaciones aplicables. Mientras una versión de estos Términos esté vigente, debe describir correctamente el funcionamiento actual de kuroNekoEngine. Se recomienda revisarlos periódicamente; cuando corresponda, los cambios importantes serán comunicados de manera razonable.'
          ]
        },
        {
          id: 'effective-date',
          title: '14. Vigencia',
          paragraphs: [
            `Estos términos entran en vigor y fueron actualizados por última vez el ${LAST_UPDATED_ISO}.`
          ]
        }
      ]
    },
    en: {
      eyebrow: 'kuroNekoEngine',
      title: 'Terms of Service',
      lead: 'These terms govern the use of kuroNekoEngine, a creative service connected to anime/manga-style digital illustration, public links, VIP access, and exclusive content managed by クロネコ工房.',
      updatedLabel: 'Last updated',
      lastUpdated: 'September 2, 2026',
      contactLabel: `Contact: X ${CONTACT_HANDLE}`,
      backLabel: 'Back to Linktree',
      navLabel: 'Switch legal document',
      privacyLink: 'Privacy Policy',
      termsLink: 'Terms of Service',
      sections: [
        {
          id: 'acceptance',
          title: '1. Acceptance',
          paragraphs: [
            'By accessing or using kuroNekoEngine, you accept these terms. If you do not agree, do not use the service.'
          ]
        },
        {
          id: 'service',
          title: '2. Nature of the Service',
          paragraphs: [
            'kuroNekoEngine presents digital illustration, characters, galleries, support information, and VIP features from クロネコ工房. Content may include anime/manga-style works, original characters, and AI-generated or AI-assisted works. Creative categories may include fictional youthful male characters, including styles known in Japanese as shota-kei, female characters with a boyish or tomboy aesthetic where applicable, androgynous characters or stylized gender expression, and other styles associated with anime/manga illustration. These categories are descriptive and for transparency; they do not by themselves mean sexual content.',
            'The fictional nature, visual style, or artistic category of a work does not by itself determine its legality or admissibility. Certain content may be subject to different restrictions under the applicable laws of the relevant country or region.'
          ]
        },
        {
          id: 'adult',
          title: '3. General Content and +18 Areas',
          paragraphs: [
            'Areas or links marked +18 are intended only for people who have the legal age required to access that type of content in their jurisdiction. The age gate is a self-declared age confirmation, not documentary verification.',
            '+18 confirmation is not privacy consent.'
          ]
        },
        {
          id: 'vip',
          title: '4. VIP Access and Keys',
          paragraphs: [
            'VIP access may be manually generated, extended, suspended, or revoked after reasonable review. userCode and accessKey are for personal use and must not be shared, resold, or published.',
            'Access may expire or depend on its activation status. Abuse, fraud, unauthorized redistribution, or attempts to bypass controls may result in suspension or revocation.'
          ]
        },
        {
          id: 'payments',
          title: '5. PayPal, Fanbox, and External Services',
          paragraphs: [
            'PayPal and Fanbox are external services. Payments, support, refunds, and account management are governed by each platform. kuroNekoEngine does not manage financial data or credentials entered during external checkout.'
          ]
        },
        {
          id: 'intellectual-property',
          title: '6. Intellectual Property',
          paragraphs: [
            'Illustrations, characters, logos, text, interface elements, and other content available through kuroNekoEngine belong to クロネコ工房 or their respective rights holders to the extent the corresponding rights are recognized by applicable law. Public availability does not, by itself, grant general authorization to copy, redistribute, resell, commercially exploit, bulk extract, or include protected content in datasets intended to train AI models or systems.',
            'Unless expressly authorized or unless applicable law provides otherwise, users may not redistribute content obtained from the service without authorization, sell, sublicense, or commercially exploit クロネコ工房 characters, logos, or works as their own, perform bulk extraction or abusive scraping, or use protected クロネコ工房 content in datasets intended to train AI systems when that use has not been authorized.',
            'These Terms do not prohibit a user from drawing, generating, or creating a non-commercial representation or fanart of a クロネコ工房 character solely because that character is used. What is not authorized is falsely claiming original creation or ownership of the character, falsely presenting oneself as クロネコ工房, one of its members, or an official representative, or using that content outside the relevant permissions and what applicable law allows.'
          ]
        },
        {
          id: 'prohibited',
          title: '7. Prohibited Conduct',
          paragraphs: [
            'Fraud, unauthorized access, bypassing access controls, unauthorized redistribution, abusive scraping, interference with service operation, impersonation, deliberately false information used to obtain access or harm the service, and any other use contrary to applicable law are prohibited.',
            'It is strictly prohibited to use kuroNekoEngine to request, promote, facilitate, store, or distribute child sexual exploitation or abuse material, or to facilitate exploitation, abuse, or other unlawful conduct against real persons.',
            'The presence of fictional characters, anime/manga styles, AI-generated or AI-assisted content, or particular artistic categories does not by itself determine admissibility or illegality. All content and use of the service remain subject to these Terms and to applicable law, which may vary between jurisdictions.'
          ]
        },
        {
          id: 'suspension',
          title: '8. Suspension or Revocation',
          paragraphs: [
            'クロネコ工房 may reasonably suspend, limit, or revoke access in response to violations, suspected abuse, legal risk, technical issues, or operational needs.'
          ]
        },
        {
          id: 'availability',
          title: '9. Availability and Changes',
          paragraphs: [
            'The service may change, pause, or become unavailable because of maintenance, external services, technical issues, or development decisions. Features, design, content, and VIP conditions may be updated.'
          ]
        },
        {
          id: 'liability',
          title: '10. Limitation of Liability',
          paragraphs: [
            'To the extent permitted by law, kuroNekoEngine and クロネコ工房 are not liable for indirect, incidental, special, or consequential damages arising from use of, or inability to use, the service. Nothing limits mandatory rights that cannot legally be excluded.'
          ]
        },
        {
          id: 'privacy',
          title: '11. Privacy',
          paragraphs: [
            'Information processing is described in the Privacy Policy. +18 confirmation, VIP requests, and external platform use serve different purposes and should not be treated as a single consent.'
          ]
        },
        {
          id: 'jurisdiction',
          title: '12. Jurisdiction',
          paragraphs: [
            'These Terms will be interpreted in accordance with applicable laws and regulations. Nothing in these Terms excludes mandatory rights that users may have under the applicable laws of their place of residence.'
          ]
        },
        {
          id: 'changes',
          title: '13. Changes',
          paragraphs: [
            'kuroNekoEngine is currently in Beta. These Terms reflect the current operation and practices of the service, but they are not technically immutable documents. They may be updated when features evolve, information-handling practices change, external services are added or removed, applicable legal or regulatory requirements change, or clarity or accuracy needs to be improved.',
            'Beta status is not a waiver of responsibility or a justification for failing to meet applicable obligations. While a version of these Terms is in effect, it must accurately describe the current operation of kuroNekoEngine. Users may review them periodically; where appropriate, important changes will be communicated in a reasonable manner.'
          ]
        },
        {
          id: 'effective-date',
          title: '14. Effective Date',
          paragraphs: [
            `These terms are effective and were last updated on ${LAST_UPDATED_ISO}.`
          ]
        }
      ]
    },
    'zh-CN': {
      eyebrow: 'kuroNekoEngine',
      title: '服务条款',
      lead: '本条款适用于 kuroNekoEngine 的使用。kuroNekoEngine 是由 クロネコ工房 管理的创作服务，内容涉及动漫/漫画风格数字插画、公开链接、VIP 访问和限定内容。',
      updatedLabel: '最后更新',
      lastUpdated: '2026年9月2日',
      contactLabel: `联系方式：X ${CONTACT_HANDLE}`,
      backLabel: '返回 Linktree',
      navLabel: '切换法律文件',
      privacyLink: '隐私政策',
      termsLink: '服务条款',
      sections: [
        {
          id: 'acceptance',
          title: '1. 接受条款',
          paragraphs: [
            '访问或使用 kuroNekoEngine 即表示你接受本条款。如果不同意，请不要使用本服务。'
          ]
        },
        {
          id: 'service',
          title: '2. 服务性质',
          paragraphs: [
            'kuroNekoEngine 展示 クロネコ工房 的数字插画、角色、图库、支持信息和 VIP 功能。内容可能包括动漫/漫画风格作品、原创角色以及由 AI 生成或辅助创作的作品。创作类别可能包括外观较为年少的虚构男性角色表现（包括日语中所谓「ショタ」系风格）、boyish 或 tomboy 风格的女性角色表现（在适用时）、中性或性别表达风格化的角色表现，以及其他动漫/漫画插画常见风格。这些类别仅用于描述和提高透明度，并不当然表示性内容。',
            '作品的虚构性质、视觉风格或艺术类别本身，并不单独决定其合法性或可接受性。某些内容可能会根据相关国家或地区的适用法律受到不同限制。'
          ]
        },
        {
          id: 'adult',
          title: '3. 一般内容与 +18 区域',
          paragraphs: [
            '标记为 +18 的区域或外部链接仅面向在其所在地法律下达到足够年龄的人。年龄门槛是用户自行确认年龄，并非证件核验。',
            '+18 确认不等同于隐私同意。'
          ]
        },
        {
          id: 'vip',
          title: '4. VIP 访问和密钥',
          paragraphs: [
            'VIP 访问可在合理审核后手动生成、延长、暂停或撤销。userCode 和 accessKey 仅供个人使用，不得分享、转售或公开。',
            '访问可能存在到期日或状态限制。滥用、欺诈、未经授权再分发或绕过控制的行为可能导致暂停或撤销。'
          ]
        },
        {
          id: 'payments',
          title: '5. PayPal、Fanbox 与外部服务',
          paragraphs: [
            'PayPal 和 Fanbox 是外部服务。付款、支持、退款和账户管理受各平台规则约束。kuroNekoEngine 不管理外部 checkout 中输入的金融数据或登录凭据。'
          ]
        },
        {
          id: 'intellectual-property',
          title: '6. 知识产权',
          paragraphs: [
            'kuroNekoEngine 中提供的插画、角色、标识、文字、界面元素及其他内容，在相应权利受适用法律承认的范围内，归 クロネコ工房 或各自权利人所有。内容公开可见本身并不构成复制、再分发、转售、商业利用、大量抓取，或将受保护内容纳入用于训练 AI 模型或系统的数据集的一般授权。',
            '除非获得明确授权，或适用法律另有规定，用户不得未经授权再分发从服务取得的内容，不得将 クロネコ工房 的角色、标识或作品作为自己的内容进行销售、再授权或商业利用，不得进行大量提取或滥用性抓取，也不得在未经授权的情况下将 クロネコ工房 的受保护内容用于训练 AI 系统的数据集。',
            '本条款并不因用户使用 クロネコ工房 的角色而单纯禁止其绘制、生成或创作该角色的非商业表现形式或同人作品。未被授权的是虚假声称自己为该角色的原始创作者或权利人，虚假冒充 クロネコ工房、其成员或官方代表，或超出相应许可及适用法律允许范围使用相关内容。'
          ]
        },
        {
          id: 'prohibited',
          title: '7. 禁止行为',
          paragraphs: [
            '禁止欺诈、未经授权访问、绕过访问控制、未经授权再分发、滥用性抓取、干扰服务运行、冒充身份、为获取访问权限或损害服务而故意提供虚假信息，以及任何其他违反适用法律的用途。',
            '严禁使用 kuroNekoEngine 请求、宣传、便利、存储或分发儿童性剥削或虐待材料，或便利针对真实人物的剥削、虐待或其他违法行为。',
            '虚构角色、动漫/漫画风格、由 AI 生成或辅助创作的内容，或特定艺术类别的存在，并不单独决定其可接受性或违法性。所有内容和服务使用均受本条款以及可能因司法辖区不同而变化的适用法律约束。'
          ]
        },
        {
          id: 'suspension',
          title: '8. 暂停或撤销',
          paragraphs: [
            'クロネコ工房 可因违反条款、疑似滥用、法律风险、技术问题或运营需要，在合理范围内暂停、限制或撤销访问。'
          ]
        },
        {
          id: 'availability',
          title: '9. 可用性和变更',
          paragraphs: [
            '服务可能因维护、外部服务、技术问题或开发决策而变更、暂停或不可用。功能、设计、内容和 VIP 条件可能更新。'
          ]
        },
        {
          id: 'liability',
          title: '10. 责任限制',
          paragraphs: [
            '在法律允许范围内，kuroNekoEngine 和 クロネコ工房 不对因使用或无法使用服务而产生的间接、附带、特殊或后果性损害承担责任。本条不限制法律上不得排除的强制性权利。'
          ]
        },
        {
          id: 'privacy',
          title: '11. 隐私',
          paragraphs: [
            '信息处理详见《隐私政策》。+18 确认、VIP 申请和使用外部平台具有不同目的，不应视为同一个同意。'
          ]
        },
        {
          id: 'jurisdiction',
          title: '12. 管辖',
          paragraphs: [
            '本条款将依据适用的法律法规进行解释。本条款中的任何内容均不排除用户依据其居住地适用法律可能享有的强制性权利。'
          ]
        },
        {
          id: 'changes',
          title: '13. 修改',
          paragraphs: [
            'kuroNekoEngine 目前处于 Beta 版本。本条款反映服务当前的运行方式与实践，但并不是技术上不可变更的文件。当服务功能发展、信息处理实践发生变化、外部服务被加入或移除、适用的法律或监管要求发生变化，或需要提升清晰度与准确性时，本条款可能会更新。',
            'Beta 状态并不构成责任豁免，也不能作为不履行适用义务的理由。在某一版本的本条款有效期间，其内容应当准确描述 kuroNekoEngine 的当前运行方式。建议用户定期查看本条款；在适当情况下，重要变更将以合理方式通知。'
          ]
        },
        {
          id: 'effective-date',
          title: '14. 生效日期',
          paragraphs: [
            `本条款自 ${LAST_UPDATED_ISO} 起生效并于该日最后更新。`
          ]
        }
      ]
    },
    'zh-TW': {
      eyebrow: 'kuroNekoEngine',
      title: '服務條款',
      lead: '本條款適用於 kuroNekoEngine 的使用。kuroNekoEngine 是由 クロネコ工房 管理的創作服務，內容涉及動漫/漫畫風格數位插畫、公開連結、VIP 存取與限定內容。',
      updatedLabel: '最後更新',
      lastUpdated: '2026年9月2日',
      contactLabel: `聯絡方式：X ${CONTACT_HANDLE}`,
      backLabel: '返回 Linktree',
      navLabel: '切換法律文件',
      privacyLink: '隱私政策',
      termsLink: '服務條款',
      sections: [
        {
          id: 'acceptance',
          title: '1. 接受條款',
          paragraphs: [
            '存取或使用 kuroNekoEngine 即表示你接受本條款。若不同意，請不要使用本服務。'
          ]
        },
        {
          id: 'service',
          title: '2. 服務性質',
          paragraphs: [
            'kuroNekoEngine 展示 クロネコ工房 的數位插畫、角色、圖庫、支持資訊與 VIP 功能。內容可能包括動漫/漫畫風格作品、原創角色以及由 AI 生成或輔助創作的作品。創作類別可能包括外觀較為年少的虛構男性角色表現（包括日語中所謂「ショタ」系風格）、boyish 或 tomboy 風格的女性角色表現（於適用時）、中性或性別表達風格化的角色表現，以及其他動漫/漫畫插畫常見風格。這些類別僅用於描述與提高透明度，並不當然表示性內容。',
            '作品的虛構性質、視覺風格或藝術類別本身，並不單獨決定其合法性或可接受性。某些內容可能會依據相關國家或地區的適用法律受到不同限制。'
          ]
        },
        {
          id: 'adult',
          title: '3. 一般內容與 +18 區域',
          paragraphs: [
            '標示為 +18 的區域或外部連結僅面向在其所在地法律下達到足夠年齡的人。年齡門檻是使用者自行確認年齡，並非證件核驗。',
            '+18 確認不等同於隱私同意。'
          ]
        },
        {
          id: 'vip',
          title: '4. VIP 存取與金鑰',
          paragraphs: [
            'VIP 存取可在合理審核後手動產生、延長、暫停或撤銷。userCode 與 accessKey 僅供個人使用，不得分享、轉售或公開。',
            '存取可能有到期日或狀態限制。濫用、詐欺、未經授權再散布或繞過控制的行為可能導致暫停或撤銷。'
          ]
        },
        {
          id: 'payments',
          title: '5. PayPal、Fanbox 與外部服務',
          paragraphs: [
            'PayPal 與 Fanbox 是外部服務。付款、支持、退款與帳號管理受各平台規則約束。kuroNekoEngine 不管理外部 checkout 中輸入的金融資料或登入憑證。'
          ]
        },
        {
          id: 'intellectual-property',
          title: '6. 智慧財產權',
          paragraphs: [
            'kuroNekoEngine 中提供的插畫、角色、標誌、文字、介面元素與其他內容，在相應權利受適用法律承認的範圍內，歸 クロネコ工房 或各自權利人所有。內容公開可見本身並不構成複製、再散布、轉售、商業利用、大量擷取，或將受保護內容納入用於訓練 AI 模型或系統之資料集的一般授權。',
            '除非取得明確授權，或適用法律另有規定，使用者不得未經授權再散布從服務取得的內容，不得將 クロネコ工房 的角色、標誌或作品作為自己的內容進行銷售、再授權或商業利用，不得進行大量擷取或濫用性擷取，也不得在未經授權的情況下將 クロネコ工房 的受保護內容用於訓練 AI 系統的資料集。',
            '本條款並不因使用者使用 クロネコ工房 的角色而單純禁止其繪製、生成或創作該角色的非商業表現形式或同人作品。未被授權的是虛假聲稱自己為該角色的原始創作者或權利人，虛假冒充 クロネコ工房、其成員或官方代表，或超出相應許可及適用法律允許範圍使用相關內容。'
          ]
        },
        {
          id: 'prohibited',
          title: '7. 禁止行為',
          paragraphs: [
            '禁止詐欺、未經授權存取、繞過存取控制、未經授權再散布、濫用性擷取、干擾服務運作、冒充身分、為取得存取權限或損害服務而故意提供虛假資訊，以及任何其他違反適用法律的用途。',
            '嚴禁使用 kuroNekoEngine 請求、宣傳、便利、儲存或散布兒童性剝削或虐待資料，或便利針對真實人物的剝削、虐待或其他違法行為。',
            '虛構角色、動漫/漫畫風格、由 AI 生成或輔助創作的內容，或特定藝術類別的存在，並不單獨決定其可接受性或違法性。所有內容與服務使用均受本條款以及可能因司法管轄區不同而變化的適用法律約束。'
          ]
        },
        {
          id: 'suspension',
          title: '8. 暫停或撤銷',
          paragraphs: [
            'クロネコ工房 可因違反條款、疑似濫用、法律風險、技術問題或營運需要，在合理範圍內暫停、限制或撤銷存取。'
          ]
        },
        {
          id: 'availability',
          title: '9. 可用性與變更',
          paragraphs: [
            '服務可能因維護、外部服務、技術問題或開發決策而變更、暫停或不可用。功能、設計、內容與 VIP 條件可能更新。'
          ]
        },
        {
          id: 'liability',
          title: '10. 責任限制',
          paragraphs: [
            '在法律允許範圍內，kuroNekoEngine 與 クロネコ工房 不對因使用或無法使用服務而產生的間接、附帶、特殊或後果性損害負責。本條不限制法律上不得排除的強制性權利。'
          ]
        },
        {
          id: 'privacy',
          title: '11. 隱私',
          paragraphs: [
            '資訊處理詳見《隱私政策》。+18 確認、VIP 申請與使用外部平台具有不同目的，不應視為同一項同意。'
          ]
        },
        {
          id: 'jurisdiction',
          title: '12. 管轄',
          paragraphs: [
            '本條款將依據適用的法律與規範進行解釋。本條款中的任何內容均不排除使用者依其居住地適用法律可能享有的強制性權利。'
          ]
        },
        {
          id: 'changes',
          title: '13. 修改',
          paragraphs: [
            'kuroNekoEngine 目前處於 Beta 版本。本條款反映服務目前的運作方式與實務，但並非技術上不可變更的文件。當服務功能演進、資訊處理實務改變、外部服務被加入或移除、適用法律或監管要求變更，或需要提升清晰度與準確性時，本條款可能會更新。',
            'Beta 狀態並不構成責任豁免，也不能作為不履行適用義務的理由。在某一版本的本條款有效期間，其內容應正確描述 kuroNekoEngine 目前的運作方式。建議使用者定期查看本條款；於適當情況下，重要變更將以合理方式通知。'
          ]
        },
        {
          id: 'effective-date',
          title: '14. 生效日期',
          paragraphs: [
            `本條款自 ${LAST_UPDATED_ISO} 起生效並於該日最後更新。`
          ]
        }
      ]
    }
  }
};

export function getLegalDocument(type: LegalDocumentType, language: LanguageCode): LegalDocument {
  return LEGAL_DOCUMENTS[type][language] ?? LEGAL_DOCUMENTS[type].en;
}

export function getLegalLinkLabels(language: LanguageCode): LegalLinkLabels {
  return LEGAL_LINK_LABELS[language] ?? LEGAL_LINK_LABELS.en;
}
