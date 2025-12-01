const KuronekoApp = (function () {
    'use strict';

    let currentLanguage = 'es';
    let isInitialized = !1;
    let homeManager = null;

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

                if (homeManager && homeManager.onLanguageChange) {
                    homeManager.onLanguageChange(currentLanguage);
                }

                if (typeof Gallery !== 'undefined' && Gallery.onLanguageChange) {
                    Gallery.onLanguageChange();
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

    function setupHomeManager() {
        let homeCurrentLanguage = currentLanguage;

        function showLanguageText(lang) {
            const allTexts = document.querySelectorAll('.home__text');
            allTexts.forEach(text => {
                text.style.display = 'none';
            });

            const targetText = document.querySelector(`.home__text[data-lang="${lang}"]`);
            if (targetText) {
                targetText.style.display = 'block';
            }
        }

        function setupHomeLanguageSelector() {
            const selector = document.getElementById('homeLanguageSelector');
            if (!selector) return;

            selector.value = homeCurrentLanguage;
            showLanguageText(homeCurrentLanguage);

            selector.addEventListener('change', function (e) {
                const newLang = e.target.value;
                homeCurrentLanguage = newLang;
                showLanguageText(newLang);
            });
        }

        function setupHomeNavigation() {
            const navButtons = document.querySelectorAll('.home__navigation .button[data-section]');
            navButtons.forEach(button => {
                button.addEventListener('click', function (e) {
                    e.preventDefault();
                    const section = this.getAttribute('data-section');
                    if (section && typeof Navigation !== 'undefined' && Navigation.switchToSection) {
                        Navigation.switchToSection(section);
                    }
                });
            });
        }

        setupHomeLanguageSelector();
        setupHomeNavigation();

        return {
            onLanguageChange: function (lang) {
                homeCurrentLanguage = lang;
                const selector = document.getElementById('homeLanguageSelector');
                if (selector) {
                    selector.value = lang;
                    showLanguageText(lang);
                }
            },
            getCurrentLanguage: function () {
                return homeCurrentLanguage;
            }
        };
    }

    function getCurrentLanguage() {
        return currentLanguage;
    }

    function checkUserSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                handleUserLogin(user);
            } catch (error) {
                localStorage.removeItem('currentUser');
            }
        }
    }

    async function initializeVisitCounter() {
        try {
            if (typeof VisitCounter !== 'undefined' && VisitCounter.init) {
                await VisitCounter.init();
                
                const count = await VisitCounter.getCount();
                
                document.dispatchEvent(new CustomEvent('visitCounterReady', {
                    detail: { count: count }
                }));
                
                return count;
            } else {
                return 0;
            }
        } catch (error) {
            return 0;
        }
    }

    function updateVisitCounterDisplay(count) {
        const counterElements = document.querySelectorAll('.visit-counter, [data-visit-counter]');
        
        counterElements.forEach(element => {
            if (element.classList.contains('visit-counter') || element.hasAttribute('data-visit-counter')) {
                let current = 0;
                const increment = Math.max(1, Math.ceil(count / 30));
                const duration = 1000;
                const steps = duration / 20;
                let step = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    step++;
                    
                    if (current >= count || step >= steps) {
                        current = count;
                        clearInterval(timer);
                    }
                    
                    element.textContent = current.toLocaleString();
                }, 20);
            }
        });
        
        const homeCounter = document.getElementById('visitCount');
        if (homeCounter) {
            homeCounter.textContent = count.toLocaleString();
        }
    }

    function setupVisitCounterEvents() {
        document.addEventListener('sectionChanged', async function(e) {
            if (e.detail.section === 'home') {
                setTimeout(async () => {
                    if (typeof VisitCounter !== 'undefined' && VisitCounter.getCount) {
                        const count = await VisitCounter.getCount();
                        updateVisitCounterDisplay(count);
                    }
                }, 100);
            }
        });

        document.addEventListener('visitCounterUpdated', function(e) {
            updateVisitCounterDisplay(e.detail.count);
        });
    }

    async function initializeModules() {
        try {
            if (typeof Utils !== 'undefined' && Utils.simulateLoading) {
                await Utils.simulateLoading();
            }

            const initialVisitCount = await initializeVisitCounter();
            
            setupVisitCounterEvents();

            homeManager = setupHomeManager();

            if (typeof AgeVerification !== 'undefined' && AgeVerification.init) {
                await AgeVerification.init();
            }

            if (typeof Gallery !== 'undefined' && Gallery.init) {
                await Gallery.init();
            }

            if (typeof Navigation !== 'undefined' && Navigation.init) {
                Navigation.init();
            }

            if (typeof Messages !== 'undefined' && Messages.init) {
                Messages.init();
                setupMessagesIntegration();
            }

            setupUserInterface();

            updateVisitCounterDisplay(initialVisitCount);

            // ========== CORRECCIÓN: HOME SIEMPRE ACTIVO AL INICIO ==========
            if (DOM.loadingScreen) {
                DOM.loadingScreen.classList.add('loading--hidden');
            }

            setTimeout(() => {
                const currentHash = window.location.hash.substring(1);
                
                // Solo activar home si no hay otro hash específico
                if (!currentHash || currentHash === 'home') {
                    const homeSection = document.getElementById('home');
                    const otherSections = document.querySelectorAll('.section');
                    
                    otherSections.forEach(section => {
                        section.classList.remove('section--active');
                        section.style.display = 'none';
                        section.style.opacity = '0';
                        section.style.visibility = 'hidden';
                    });
                    
                    if (homeSection) {
                        homeSection.classList.add('home--active');
                        homeSection.style.display = 'flex';
                        
                        setTimeout(() => {
                            homeSection.style.opacity = '1';
                            homeSection.style.visibility = 'visible';
                            homeSection.style.transform = 'translateY(0) scale(1)';
                        }, 50);
                        
                        if (!window.location.hash) {
                            window.history.replaceState(null, null, '#home');
                        }
                    }
                }
            }, 300);

            isInitialized = !0;
            document.dispatchEvent(new CustomEvent('appInitialized'));

        } catch (error) {
            const homeSection = document.getElementById('home');
            if (homeSection) {
                homeSection.classList.add('home--active');
                homeSection.style.display = 'flex';
            }
            
            if (typeof Utils !== 'undefined' && Utils.showNotification) {
                Utils.showNotification('Error crítico en la aplicación', 'error');
            }
        }
    }

    async function init() {
        if (isInitialized) {
            return;
        }

        try {
            setupLanguageSelector();
            await initializeModules();

            if (typeof Utils !== 'undefined' && Utils.handleSmoothScrolling) {
                Utils.handleSmoothScrolling();
            }
        } catch (error) {
            if (typeof Utils !== 'undefined' && Utils.showNotification) {
                Utils.showNotification('Error crítico en la aplicación', 'error');
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

                if (homeManager && homeManager.onLanguageChange) {
                    homeManager.onLanguageChange(lang);
                }

                if (typeof Gallery !== 'undefined' && Gallery.refresh) {
                    Gallery.refresh();
                }

                if (typeof Messages !== 'undefined' && Messages.isUserLoggedIn && Messages.isUserLoggedIn() && Messages.onLanguageChange) {
                    Messages.onLanguageChange();
                }
            }
        },
        getCurrentLanguage: getCurrentLanguage,
        getStats: function () {
            const stats = {
                ageVerified: typeof AgeVerification !== 'undefined' && AgeVerification.isVerified ? AgeVerification.isVerified() : !1,
                currentLanguage: currentLanguage,
                userLoggedIn: !!localStorage.getItem('currentUser'),
                isInitialized: isInitialized
            };

            if (typeof VisitCounter !== 'undefined' && VisitCounter.getCount) {
                VisitCounter.getCount().then(count => {
                    stats.visitCount = count;
                }).catch(error => {
                    stats.visitCount = 0;
                });
            } else {
                stats.visitCount = 0;
            }

            if (typeof Gallery !== 'undefined' && Gallery.getStats) {
                Object.assign(stats, Gallery.getStats());
            }

            if (typeof Messages !== 'undefined') {
                const user = Messages.getCurrentUser ? Messages.getCurrentUser() : null;
                stats.messagesUser = user ? user.username : null;
                stats.isVendedor = user ? user.isVendor : !1;
                stats.messagesStatus = Messages.getStatus ? Messages.getStatus() : null;
            }

            return stats;
        },
        isInitialized: function () {
            return isInitialized;
        },
        checkUserSession: checkUserSession,
        logoutUser: handleUserLogout,
        getVisitCount: function() {
            if (typeof VisitCounter !== 'undefined' && VisitCounter.getCount) {
                return VisitCounter.getCount();
            }
            return Promise.resolve(0);
        },
        refreshVisitCounter: function() {
            if (typeof VisitCounter !== 'undefined' && VisitCounter.refresh) {
                return VisitCounter.refresh().then(count => {
                    updateVisitCounterDisplay(count);
                    return count;
                });
            }
            return Promise.resolve(0);
        },
        debugInfo: function() {
            return {
                currentLanguage: currentLanguage,
                isInitialized: isInitialized,
                homeManager: !!homeManager,
                currentSection: typeof Navigation !== 'undefined' ? Navigation.getCurrentSection() : 'unknown',
                modules: {
                    ageVerification: typeof AgeVerification !== 'undefined',
                    gallery: typeof Gallery !== 'undefined',
                    messages: typeof Messages !== 'undefined',
                    navigation: typeof Navigation !== 'undefined',
                    modal: typeof Modal !== 'undefined',
                    visitCounter: typeof VisitCounter !== 'undefined'
                }
            };
        }
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

            if (currentSection === 'gallery' && typeof Gallery !== 'undefined' && Gallery.refresh) {
                Gallery.refresh();
            }

            if (currentSection === 'home') {
                setTimeout(() => {
                    if (typeof KuronekoApp.refreshVisitCounter === 'function') {
                        KuronekoApp.refreshVisitCounter();
                    }
                }, 500);
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
});

window.addEventListener('unhandledrejection', function (e) {
});

if (typeof window !== 'undefined') {
    window.KuronekoApp = KuronekoApp;
}