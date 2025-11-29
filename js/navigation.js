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
            console.error('Elementos del menú móvil no encontrados');
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

        console.log('🔀 Cambiando a sección:', sectionId, 'desde:', currentSection);

        // Actualizar navegación
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

        // Ocultar todas las secciones de manera más efectiva
        DOM.sections.forEach(section => {
            section.classList.remove('section--active', 'home--active');
            // Forzar el ocultamiento completo
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            section.style.position = 'absolute';
            section.style.left = '-9999px';
            section.style.minHeight = '0';
            section.style.height = '0';
            section.style.overflow = 'hidden';
        });

        // Mostrar sección objetivo
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            console.log('🎯 Mostrando sección:', sectionId);

            // Restaurar estilos para la sección activa
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

                // ========== CORRECCIÓN CLAVE: FORZAR VISIBILIDAD DEL HOME ==========
                setTimeout(() => {
                    targetSection.style.opacity = '1';
                    targetSection.style.visibility = 'visible';
                    targetSection.style.transform = 'translateY(0) scale(1)';

                    // Forzar reflow y animación
                    targetSection.offsetHeight; // Trigger reflow

                    console.log('✅ Home completamente activado y visible');

                    // Disparar evento específico para el Home
                    document.dispatchEvent(new CustomEvent('homeActivated'));

                }, 50);

            } else {
                targetSection.classList.add('section--active');
                targetSection.style.display = 'block';
            }

            currentSection = sectionId;
            window.history.pushState(null, null, `#${sectionId}`);
            loadSectionContent(sectionId);
        }

        closeMobileMenu();
        if (typeof SideNavigation !== 'undefined') {
            SideNavigation.close();
        }

        // Scroll suave al top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Disparar evento de cambio de sección
        document.dispatchEvent(new CustomEvent('sectionChanged', {
            detail: {
                section: sectionId,
                previousSection: currentSection
            }
        }));

        console.log('✅ Sección cambiada exitosamente a:', sectionId);
    }

    function loadSectionContent(sectionId) {
        console.log('Cargando contenido para sección:', sectionId);

        switch (sectionId) {
            case 'home':
                // El home se inicializa automáticamente a través de app.js
                console.log('Inicializando Home...');
                // Forzar redimensionamiento si es necesario
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 100);
                break;

            case 'messages':
                if (typeof Messages !== 'undefined') {
                    console.log('Inicializando Messages...');
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
                    console.log('Inicializando Gallery...');
                    setTimeout(() => {
                        if (Gallery.refresh) {
                            Gallery.refresh();
                        } else if (Gallery.init) {
                            Gallery.init();
                        }
                    }, 100);
                }
                break;

            default:
                console.log('Sección no reconocida:', sectionId);
        }
    }

    function handleNavigation() {
        // Navegación principal
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                if (section) {
                    console.log('Navegación click - Sección:', section);
                    switchSection(section)
                }
            })
        });

        // Navegación side nav
        DOM.sideNavLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                if (section) {
                    console.log('Side nav click - Sección:', section);
                    switchSection(section)
                }
            })
        });

        // Manejar cambios de hash en la URL
        window.addEventListener('hashchange', function () {
            const hash = window.location.hash.substring(1);
            console.log('Hash change detectado:', hash);
            if (hash && document.getElementById(hash)) {
                switchSection(hash)
            }
        });

        // Manejar navegación con botones de atrás/adelante
        window.addEventListener('popstate', function () {
            const hash = window.location.hash.substring(1);
            console.log('Popstate detectado:', hash);
            if (hash && document.getElementById(hash)) {
                switchSection(hash)
            } else {
                // Si no hay hash, ir al home
                switchSection('home');
            }
        });

        // Manejar navegación desde botones internos
        document.addEventListener('click', function (e) {
            const button = e.target.closest('[data-section]');
            if (button && button.hasAttribute('data-section')) {
                e.preventDefault();
                const section = button.getAttribute('data-section');
                if (section) {
                    console.log('Botón interno click - Sección:', section);
                    switchSection(section);
                }
            }
        });
    }

    function initCurrentSection() {
        const initialHash = window.location.hash.substring(1);
        if (initialHash && document.getElementById(initialHash)) {
            console.log('Inicializando con hash:', initialHash);
            switchSection(initialHash);
        } else {
            console.log('Inicializando con sección por defecto: home');
            switchSection('home');

            // Asegurar que la URL refleje la sección actual
            if (!window.location.hash) {
                window.history.replaceState(null, null, '#home');
            }
        }
    }

    function handlePageLoad() {
        // Esperar a que el DOM esté completamente cargado
        setTimeout(() => {
            console.log('Página cargada, inicializando navegación...');
            initCurrentSection();

            // Forzar una verificación adicional después de la carga completa
            setTimeout(() => {
                const activeSection = document.querySelector('.section--active, .home--active');
                if (!activeSection) {
                    console.warn('No se detectó sección activa, forzando home...');
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
        console.log('Refrescando sección actual:', currentSection);
        if (currentSection) {
            loadSectionContent(currentSection);
        }
    }

    return {
        init: function () {
            if (isInitialized) {
                console.log('Navegación ya inicializada');
                return;
            }

            console.log('Inicializando sistema de navegación...');

            handleNavigation();
            setupMobileMenu();

            // Inicializar después de que todo esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', handlePageLoad);
            } else {
                handlePageLoad();
            }

            isInitialized = !0;
            console.log('Sistema de navegación inicializado correctamente');
        },

        getCurrentSection: function () {
            return currentSection;
        },

        switchToSection: function (sectionId) {
            console.log('SwitchToSection llamado:', sectionId);
            if (!sectionId) {
                console.error('Sección no especificada');
                return;
            }

            if (!document.getElementById(sectionId)) {
                console.error('Sección no encontrada:', sectionId);
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
        },

        // Método para debug
        debugInfo: function () {
            return {
                currentSection: currentSection,
                isInitialized: isInitialized,
                mobileMenuOpen: this.isMobileMenuOpen(),
                sections: Array.from(DOM.sections).map(section => ({
                    id: section.id,
                    isActive: section.classList.contains('section--active') || section.classList.contains('home--active'),
                    isVisible: section.style.display !== 'none' && section.style.visibility !== 'hidden'
                }))
            };
        }
    };
})();

// Inicialización automática cuando el DOM esté listo
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

// Exportar para uso global si es necesario
if (typeof window !== 'undefined') {
    window.Navigation = Navigation;
}