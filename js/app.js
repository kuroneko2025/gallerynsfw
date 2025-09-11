// Main Application Module
const KuronekoApp = (function () {
    'use strict';

    // Private variables
    let currentLanguage = 'es';

    // DOM Elements
    const DOM = {
        loadingScreen: document.getElementById('loadingScreen'),
        languageSelector: document.getElementById('languageSelector')
    };

    // Private methods
    function setupLanguageSelector() {
        // Set initial language based on browser or saved preference
        const savedLanguage = localStorage.getItem('kuroneko-language');
        const browserLanguage = Utils.detectBrowserLanguage();

        currentLanguage = savedLanguage || browserLanguage;
        DOM.languageSelector.value = currentLanguage;

        // Update texts with current language
        Utils.updateTexts(currentLanguage);

        // Add event listener for language change
        DOM.languageSelector.addEventListener('change', function (e) {
            currentLanguage = e.target.value;
            localStorage.setItem('kuroneko-language', currentLanguage);

            // Update all texts
            Utils.updateTexts(currentLanguage);

            // Refresh gallery to update image descriptions
            Gallery.refresh();
        });
    }

    // Initialize the application
    async function init() {
        try {
            // Setup language system
            setupLanguageSelector();

            // Initialize loading screen
            await Utils.simulateLoading();
            DOM.loadingScreen.classList.add('loading--hidden');

            // Setup age verification
            AgeVerification.init();

            // Setup modal
            Modal.init();

            // Setup gallery
            Gallery.init();

            // Setup smooth scrolling
            Utils.handleSmoothScrolling();

            console.log('くろねこ App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    // Public API
    return {
        init: init,
        addImages: Gallery.addImages,
        setLanguage: function (lang) {
            if (Utils.translations[lang]) {
                currentLanguage = lang;
                DOM.languageSelector.value = lang;
                localStorage.setItem('kuroneko-language', lang);
                Utils.updateTexts(lang);
                Gallery.refresh();
            }
        },
        getCurrentLanguage: function () {
            return currentLanguage;
        },
        getStats: function () {
            return {
                ...Gallery.getStats(),
                ageVerified: AgeVerification.isVerified(),
                currentLanguage: currentLanguage
            };
        }
    };
})();

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    KuronekoApp.init();
});

// Handle page visibility change
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        console.log('Page is hidden');
    } else {
        console.log('Page is visible');
    }
});