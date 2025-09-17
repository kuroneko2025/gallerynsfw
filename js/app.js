const KuronekoApp = (function() {
    'use strict';
    let currentLanguage = 'es';
    const DOM = {
        loadingScreen: document.getElementById('loadingScreen'),
        languageSelector: document.getElementById('languageSelector')
    };

    function setupLanguageSelector() {
        const savedLanguage = localStorage.getItem('kuroneko-language');
        const browserLanguage = Utils.detectBrowserLanguage();
        currentLanguage = savedLanguage || browserLanguage;
        DOM.languageSelector.value = currentLanguage;
        Utils.updateTexts(currentLanguage);
        DOM.languageSelector.addEventListener('change', function(e) {
            currentLanguage = e.target.value;
            localStorage.setItem('kuroneko-language', currentLanguage);
            Utils.updateTexts(currentLanguage);
            Gallery.refresh()
        })
    }
    async function init() {
        try {
            setupLanguageSelector();
            await Utils.simulateLoading();
            DOM.loadingScreen.classList.add('loading--hidden');
            AgeVerification.init();
            Modal.init();
            Gallery.init();
            Utils.handleSmoothScrolling();
            console.log('くろねこ App initialized successfully')
        } catch (error) {
            console.error('Error initializing app:', error)
        }
    }
    return {
        init: init,
        addImages: Gallery.addImages,
        setLanguage: function(lang) {
            if (Utils.translations[lang]) {
                currentLanguage = lang;
                DOM.languageSelector.value = lang;
                localStorage.setItem('kuroneko-language', lang);
                Utils.updateTexts(lang);
                Gallery.refresh()
            }
        },
        getCurrentLanguage: function() {
            return currentLanguage
        },
        getStats: function() {
            return {
                ...Gallery.getStats(),
                ageVerified: AgeVerification.isVerified(),
                currentLanguage: currentLanguage
            }
        }
    }
})();
document.addEventListener('DOMContentLoaded', function() {
    KuronekoApp.init();
    Navigation.init();
    Contact.init()
});
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page is hidden')
    } else {
        console.log('Page is visible')
    }
})