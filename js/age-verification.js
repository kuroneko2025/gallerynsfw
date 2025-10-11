const AgeVerification = (function() {
    'use strict';
    
    let isAgeVerified = false;
    const DOM = {
        ageVerification: document.getElementById('ageVerification'),
        confirmAge: document.getElementById('confirmAge'),
        denyAge: document.getElementById('denyAge')
    };

    function handleConfirmAge() {
        isAgeVerified = true;
        DOM.ageVerification.classList.add('age-verification--hidden');
        localStorage.setItem('age-verified', 'true');
        return isAgeVerified;
    }

    function handleDenyAge() {
        const currentLanguage = document.getElementById('languageSelector')?.value || 'es';
        const message = Utils.translations[currentLanguage]?.['access-denied'] || 'Acceso denegado. Debes ser mayor de 18 años para acceder a este contenido.';
        alert(message);
        window.location.href = 'https://www.google.com';
    }

    function checkPreviousVerification() {
        const previouslyVerified = localStorage.getItem('age-verified');
        if (previouslyVerified === 'true') {
            isAgeVerified = true;
            DOM.ageVerification.classList.add('age-verification--hidden');
        }
    }

    return {
        init: function() {
            checkPreviousVerification();
            
            if (DOM.confirmAge) {
                DOM.confirmAge.addEventListener('click', handleConfirmAge);
            }
            
            if (DOM.denyAge) {
                DOM.denyAge.addEventListener('click', handleDenyAge);
            }
        },
        isVerified: function() {
            return isAgeVerified;
        },
        reset: function() {
            isAgeVerified = false;
            localStorage.removeItem('age-verified');
            DOM.ageVerification.classList.remove('age-verification--hidden');
        }
    };
})();