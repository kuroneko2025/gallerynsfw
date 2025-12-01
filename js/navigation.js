const Navigation = (function () {
    'use strict';
    let currentSection = 'home';
    let isInitialized = !1;
    const DOM = {
        sections: document.querySelectorAll('section'),
        navLinks: document.querySelectorAll('.header__link[data-section]'),
        sideNavLinks: document.querySelectorAll('.side-nav__menu-link[data-section]'),
        hamburgerButton: document.getElementById('hamburgerButton'),
        headerMenu: document.getElementById('headerMenu'),
        body: document.body
    };

    function createMenuOverlay() {
        let overlay = document.querySelector('.menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'menu-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeMobileMenu)
        }
        return overlay
    }

    function setupMobileMenu() {
        if (!DOM.hamburgerButton || !DOM.headerMenu) {
            return
        }
        const overlay = createMenuOverlay();
        DOM.hamburgerButton.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('header__hamburger--active');
            DOM.headerMenu.classList.toggle('header__menu--active');
            overlay.classList.toggle('menu-overlay--active');
            DOM.body.classList.toggle('body--menu-open');
            if (DOM.body.classList.contains('body--menu-open')) {
                DOM.body.style.overflow = 'hidden'
            } else {
                DOM.body.style.overflow = ''
            }
        });
        DOM.headerMenu.querySelectorAll('.header__link').forEach(link => {
            link.addEventListener('click', function (e) {
                setTimeout(() => {
                    closeMobileMenu()
                }, 300)
            })
        });
        document.addEventListener('click', (e) => {
            if (DOM.headerMenu.classList.contains('header__menu--active') && !DOM.headerMenu.contains(e.target) && !DOM.hamburgerButton.contains(e.target)) {
                closeMobileMenu()
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.headerMenu.classList.contains('header__menu--active')) {
                closeMobileMenu()
            }
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768 && DOM.headerMenu.classList.contains('header__menu--active')) {
                closeMobileMenu()
            }
        })
    }

    function closeMobileMenu() {
        if (DOM.hamburgerButton) {
            DOM.hamburgerButton.classList.remove('header__hamburger--active')
        }
        if (DOM.headerMenu) {
            DOM.headerMenu.classList.remove('header__menu--active')
        }
        const overlay = document.querySelector('.menu-overlay');
        if (overlay) {
            overlay.classList.remove('menu-overlay--active')
        }
        DOM.body.classList.remove('body--menu-open');
        DOM.body.style.overflow = ''
    }

    function switchSection(sectionId) {
        if (currentSection === sectionId) return;

        DOM.navLinks.forEach(link => {
            link.classList.remove('header__link--active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('header__link--active');
            }
        });

        DOM.sideNavLinks.forEach(link => {
            link.classList.remove('side-nav__menu-link--active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('side-nav__menu-link--active');
            }
        });

        DOM.sections.forEach(section => {
            section.classList.remove('section--active', 'home--active');
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = '';
            targetSection.style.opacity = '';
            targetSection.style.visibility = '';
            targetSection.style.position = '';
            targetSection.style.left = '';
            targetSection.style.minHeight = '';
            targetSection.style.height = '';
            targetSection.style.overflow = '';

            if (sectionId === 'home') {
                targetSection.classList.add('home--active');
                targetSection.style.display = 'flex';
                
                setTimeout(() => {
                    targetSection.style.opacity = '1';
                    targetSection.style.visibility = 'visible';
                    targetSection.style.transform = 'translateY(0) scale(1)';
                }, 50);

            } else {
                targetSection.classList.add('section--active');
                targetSection.style.display = 'block';
                
                setTimeout(() => {
                    targetSection.style.opacity = '1';
                    targetSection.style.visibility = 'visible';
                }, 50);
            }

            currentSection = sectionId;
            window.history.pushState(null, null, `#${sectionId}`);
            loadSectionContent(sectionId);
        }

        closeMobileMenu();
        if (typeof SideNavigation !== 'undefined') {
            SideNavigation.close();
        }

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        document.dispatchEvent(new CustomEvent('sectionChanged', {
            detail: {
                section: sectionId,
                previousSection: currentSection
            }
        }));
    }

    function loadSectionContent(sectionId) {
        switch (sectionId) {
            case 'home':
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 100);
                break;

            case 'messages':
                if (typeof Messages !== 'undefined') {
                    setTimeout(() => {
                        if (Messages.init && !Messages.isInitialized) {
                            Messages.init();
                        } else if (Messages.refresh) {
                            Messages.refresh();
                        }
                    }, 100);
                }
                break;

            case 'gallery':
                if (typeof Gallery !== 'undefined') {
                    setTimeout(() => {
                        if (Gallery.refresh) {
                            Gallery.refresh();
                        } else if (Gallery.init) {
                            Gallery.init();
                        }
                    }, 100);
                }
                break;
        }
    }

    function handleNavigation() {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                if (section) {
                    switchSection(section)
                }
            })
        });

        DOM.sideNavLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                if (section) {
                    switchSection(section)
                }
            })
        });

        window.addEventListener('hashchange', function () {
            const hash = window.location.hash.substring(1);
            if (hash && document.getElementById(hash)) {
                switchSection(hash)
            }
        });

        window.addEventListener('popstate', function () {
            const hash = window.location.hash.substring(1);
            if (hash && document.getElementById(hash)) {
                switchSection(hash)
            } else {
                switchSection('home');
            }
        });

        document.addEventListener('click', function (e) {
            const button = e.target.closest('[data-section]');
            if (button && button.hasAttribute('data-section')) {
                e.preventDefault();
                const section = button.getAttribute('data-section');
                if (section) {
                    switchSection(section);
                }
            }
        });
    }

    function initCurrentSection() {
        const initialHash = window.location.hash.substring(1);
        
        // ========== CORRECCIÓN: HOME SIEMPRE AL INICIO ==========
        if (!initialHash || initialHash === 'home') {
            const homeSection = document.getElementById('home');
            const otherSections = document.querySelectorAll('.section');
            
            otherSections.forEach(section => {
                section.classList.remove('section--active', 'home--active');
                section.style.display = 'none';
                section.style.opacity = '0';
                section.style.visibility = 'hidden';
            });
            
            if (homeSection) {
                homeSection.classList.add('home--active');
                homeSection.style.display = 'flex';
                homeSection.style.opacity = '1';
                homeSection.style.visibility = 'visible';
                homeSection.style.transform = 'none';
                
                if (!window.location.hash) {
                    window.history.replaceState(null, null, '#home');
                }
            }
            
            currentSection = 'home';
        } else if (initialHash && document.getElementById(initialHash)) {
            switchSection(initialHash);
        }
    }

    function handlePageLoad() {
        setTimeout(() => {
            initCurrentSection();

            setTimeout(() => {
                const activeSection = document.querySelector('.section--active, .home--active');
                if (!activeSection) {
                    switchSection('home');
                }
            }, 500);
        }, 100);
    }

    function getSectionElement(sectionId) {
        return document.getElementById(sectionId);
    }

    function isSectionVisible(sectionId) {
        const section = getSectionElement(sectionId);
        if (!section) return false;

        return section.classList.contains('section--active') ||
            section.classList.contains('home--active');
    }

    function refreshCurrentSection() {
        if (currentSection) {
            loadSectionContent(currentSection);
        }
    }

    return {
        init: function () {
            if (isInitialized) {
                return;
            }

            handleNavigation();
            setupMobileMenu();

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', handlePageLoad);
            } else {
                handlePageLoad();
            }

            isInitialized = !0;
        },

        getCurrentSection: function () {
            return currentSection;
        },

        switchToSection: function (sectionId) {
            if (!sectionId) {
                return;
            }

            if (!document.getElementById(sectionId)) {
                return;
            }

            switchSection(sectionId);
        },

        closeMobileMenu: closeMobileMenu,

        isMobileMenuOpen: function () {
            return DOM.headerMenu && DOM.headerMenu.classList.contains('header__menu--active');
        },

        getSectionElement: getSectionElement,

        isSectionVisible: isSectionVisible,

        refreshCurrentSection: refreshCurrentSection,

        isInitialized: function () {
            return isInitialized;
        }
    };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(() => {
            Navigation.init();
        }, 100);
    });
} else {
    setTimeout(() => {
        Navigation.init();
    }, 100);
}

if (typeof window !== 'undefined') {
    window.Navigation = Navigation;
}