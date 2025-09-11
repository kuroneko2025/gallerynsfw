// Age Verification Module
const AgeVerification = (function() {
    'use strict';

    // Private variables
    let isAgeVerified = false;

    // DOM Elements
    const DOM = {
        ageVerification: document.getElementById('ageVerification'),
        confirmAge: document.getElementById('confirmAge'),
        denyAge: document.getElementById('denyAge')
    };

    // Private methods
    function handleConfirmAge() {
        isAgeVerified = true;
        DOM.ageVerification.classList.add('age-verification--hidden');
        return isAgeVerified;
    }

    function handleDenyAge() {
        const currentLanguage = document.getElementById('languageSelector').value;
        alert(Utils.translations[currentLanguage]['access-denied']);
        window.location.href = 'https://www.google.com';
    }

    // Public methods
    return {
        init: function() {
            DOM.confirmAge.addEventListener('click', handleConfirmAge);
            DOM.denyAge.addEventListener('click', handleDenyAge);
        },

        isVerified: function() {
            return isAgeVerified;
        }
    };
})();