const KuronekoApp = (function () {
    'use strict';

    let currentLanguage = 'es';
    let isInitialized = !1;

    const DOM = {
        loadingScreen: document.getElementById('loadingScreen'),
        languageSelector: document.getElementById('languageSelector'),
        headerAuth: document.getElementById('headerAuth'),
        headerUser: document.getElementById('headerUser'),
        headerLogout: document.getElementById('headerLogout')
    };

    function setupLanguageSelector() {
        const savedLanguage = localStorage.getItem('kuroneko-language');
        const browserLanguage = Utils.detectBrowserLanguage();
        currentLanguage = savedLanguage || browserLanguage;

        if (DOM.languageSelector) {
            DOM.languageSelector.value = currentLanguage;
            DOM.languageSelector.addEventListener('change', function (e) {
                currentLanguage = e.target.value;
                localStorage.setItem('kuroneko-language', currentLanguage);
                Utils.updateTexts(currentLanguage);

                // Notificar a los módulos del cambio de idioma
                if (typeof Gallery !== 'undefined' && Gallery.onLanguageChange) {
                    Gallery.onLanguageChange();
                }

                if (typeof Shop !== 'undefined' && Shop.refresh) {
                    Shop.refresh();
                }

                if (typeof Messages !== 'undefined' && Messages.onLanguageChange) {
                    Messages.onLanguageChange();
                }
            });
        }
        Utils.updateTexts(currentLanguage);
    }

    function setupUserInterface() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser && DOM.headerAuth && DOM.headerUser) {
            try {
                const user = JSON.parse(savedUser);
                DOM.headerUser.textContent = user.username;
                DOM.headerAuth.style.display = 'flex';

                if (DOM.headerLogout) {
                    DOM.headerLogout.addEventListener('click', handleUserLogout);
                }
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('currentUser');
            }
        }
    }

    function handleUserLogout() {
        Utils.showNotification('Cerrando sesión...', 'info');

        if (typeof Messages !== 'undefined' && Messages.stopAutoRefresh) {
            Messages.stopAutoRefresh();
        }

        if (typeof Messages !== 'undefined' && Messages.handleLogout) {
            Messages.handleLogout();
        }

        localStorage.removeItem('currentUser');

        if (DOM.headerAuth) {
            DOM.headerAuth.style.display = 'none';
        }

        const currentSection = Navigation.getCurrentSection();
        if (currentSection === 'messages') {
            const authSection = document.getElementById('authSection');
            const messagesSection = document.getElementById('messagesSection');
            if (authSection) {
                authSection.style.display = 'block';
                authSection.style.opacity = '1';
            }
            if (messagesSection) {
                messagesSection.style.display = 'none';
            }
        }

        Utils.showNotification('Sesión cerrada exitosamente', 'success');
    }

    function handleUserLogin(user) {
        if (DOM.headerAuth && DOM.headerUser) {
            DOM.headerUser.textContent = user.username;
            DOM.headerAuth.style.display = 'flex';
        }

        if (DOM.headerLogout) {
            DOM.headerLogout.removeEventListener('click', handleUserLogout);
            DOM.headerLogout.addEventListener('click', handleUserLogout);
        }

        const currentSection = Navigation.getCurrentSection();
        if (currentSection === 'messages') {
            const authSection = document.getElementById('authSection');
            const messagesSection = document.getElementById('messagesSection');
            if (authSection) authSection.style.display = 'none';
            if (messagesSection) {
                messagesSection.style.display = 'block';
                messagesSection.style.opacity = '1';
            }

            if (typeof Messages !== 'undefined' && Messages.onUserLogin) {
                Messages.onUserLogin();
            }
        }
    }

    function setupMessagesIntegration() {
        window.startProductConversation = function (productId, productTitle) {
            if (typeof Messages !== 'undefined' && Messages.startNewMessage) {
                Messages.startNewMessage(productId, productTitle);
            } else {
                Utils.showNotification('El sistema de mensajes no está disponible', 'error');
                console.error('Messages module not available');
            }
        };

        document.addEventListener('sectionChanged', function (e) {
            if (e.detail.section === 'messages') {
                const savedUser = localStorage.getItem('currentUser');
                const authSection = document.getElementById('authSection');
                const messagesSection = document.getElementById('messagesSection');

                if (savedUser) {
                    if (authSection) authSection.style.display = 'none';
                    if (messagesSection) {
                        messagesSection.style.display = 'block';
                        messagesSection.style.opacity = '1';
                    }

                    if (typeof Messages !== 'undefined' && Messages.onSectionActivated) {
                        Messages.onSectionActivated();
                    }
                } else {
                    if (authSection) {
                        authSection.style.display = 'block';
                        authSection.style.opacity = '1';
                    }
                    if (messagesSection) messagesSection.style.display = 'none';

                    if (typeof Messages !== 'undefined' && Messages.onSectionDeactivated) {
                        Messages.onSectionDeactivated();
                    }
                }
            } else {
                if (typeof Messages !== 'undefined' && Messages.onSectionDeactivated) {
                    Messages.onSectionDeactivated();
                }
            }
        });

        document.addEventListener('userLoggedIn', function (e) {
            handleUserLogin(e.detail.user);
        });

        document.addEventListener('userRegistered', function () {
            Utils.showNotification('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
        });
    }

    async function initializeModules() {
        try {
            if (typeof Utils !== 'undefined' && Utils.simulateLoading) {
                await Utils.simulateLoading();
            }

            if (typeof AgeVerification !== 'undefined' && AgeVerification.init) {
                await AgeVerification.init();
            }

            if (typeof Modal !== 'undefined' && Modal.init) {
                await Modal.init();
            }


            await Promise.all([
                typeof Gallery !== 'undefined' && Gallery.init ? Gallery.init() : Promise.resolve(),
                typeof Shop !== 'undefined' && Shop.init ? Shop.init() : Promise.resolve()
            ]);

            if (typeof Navigation !== 'undefined' && Navigation.init) {
                Navigation.init();
            }

            if (typeof Messages !== 'undefined' && Messages.init) {
                Messages.init();
                setupMessagesIntegration();
            } else {
                console.warn('Módulo de mensajes no disponible');
            }

            setupUserInterface();

            if (DOM.loadingScreen) {
                DOM.loadingScreen.classList.add('loading--hidden');
            }

            isInitialized = !0;
            document.dispatchEvent(new CustomEvent('appInitialized'));

        } catch (error) {
            console.error('Error initializing app:', error);
            if (DOM.loadingScreen) {
                DOM.loadingScreen.classList.add('loading--hidden');
            }
            if (typeof Utils !== 'undefined' && Utils.showNotification) {
                Utils.showNotification('Error al inicializar la aplicación', 'error');
            }
        }
    }

    async function init() {
        if (isInitialized) return;

        try {
            setupLanguageSelector();
            await initializeModules();

            if (typeof Utils !== 'undefined' && Utils.handleSmoothScrolling) {
                Utils.handleSmoothScrolling();
            }
        } catch (error) {
            console.error('Error in app initialization:', error);
            if (typeof Utils !== 'undefined' && Utils.showNotification) {
                Utils.showNotification('Error crítico en la aplicación', 'error');
            }
        }
    }

    function checkUserSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                handleUserLogin(user);
            } catch (error) {
                console.error('Error checking user session:', error);
                localStorage.removeItem('currentUser');
            }
        }
    }

    return {
        init: init,

        addImages: function (images) {
            if (typeof Gallery !== 'undefined' && Gallery.addImages) {
                Gallery.addImages(images);
            }
        },

        setLanguage: function (lang) {
            if (typeof Utils !== 'undefined' && Utils.translations && Utils.translations[lang]) {
                currentLanguage = lang;
                if (DOM.languageSelector) {
                    DOM.languageSelector.value = lang;
                }
                localStorage.setItem('kuroneko-language', lang);

                if (Utils.updateTexts) {
                    Utils.updateTexts(lang);
                }


                if (typeof Gallery !== 'undefined' && Gallery.refresh) {
                    Gallery.refresh();
                }

                if (typeof Shop !== 'undefined' && Shop.refresh) {
                    Shop.refresh();
                }

                if (typeof Messages !== 'undefined' && Messages.isUserLoggedIn && Messages.isUserLoggedIn() && Messages.onLanguageChange) {
                    Messages.onLanguageChange();
                }
            }
        },

        getCurrentLanguage: function () {
            return currentLanguage;
        },

        getStats: function () {
            const stats = {
                ageVerified: typeof AgeVerification !== 'undefined' && AgeVerification.isVerified ? AgeVerification.isVerified() : !1,
                currentLanguage: currentLanguage,
                userLoggedIn: !!localStorage.getItem('currentUser')
            };


            if (typeof Gallery !== 'undefined' && Gallery.getStats) {
                Object.assign(stats, Gallery.getStats());
            }

            if (typeof Shop !== 'undefined' && Shop.getStats) {
                Object.assign(stats, Shop.getStats());
            }

            if (typeof Messages !== 'undefined') {
                const user = Messages.getCurrentUser ? Messages.getCurrentUser() : null;
                stats.messagesUser = user ? user.username : null;
                stats.isVendedor = user ? user.isVendedor : !1;
                stats.messagesStatus = Messages.getStatus ? Messages.getStatus() : null;
            }

            return stats;
        },

        isInitialized: function () {
            return isInitialized;
        },

        checkUserSession: checkUserSession,

        logoutUser: handleUserLogout
    };
})();

document.addEventListener('DOMContentLoaded', function () {
    KuronekoApp.init();
});

document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        if (typeof Messages !== 'undefined' && Messages.onPageHidden) {
            Messages.onPageHidden();
        }
    } else {
        if (KuronekoApp.isInitialized && KuronekoApp.isInitialized()) {
            const currentSection = typeof Navigation !== 'undefined' && Navigation.getCurrentSection ? Navigation.getCurrentSection() : '';

            KuronekoApp.checkUserSession();


            if (currentSection === 'shop' && typeof Shop !== 'undefined' && Shop.refresh) {
                Shop.refresh();
            } else if (currentSection === 'gallery' && typeof Gallery !== 'undefined' && Gallery.refresh) {
                Gallery.refresh();
            }

            if (typeof Messages !== 'undefined' && Messages.onPageVisible) {
                Messages.onPageVisible();
            }
        }
    }
});

window.addEventListener('load', function () {
    if (KuronekoApp.checkUserSession) {
        KuronekoApp.checkUserSession();
    }
});

window.addEventListener('error', function (e) {
    console.error('Unhandled error:', e.error);
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
});