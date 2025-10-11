const Navigation = (function () {
    'use strict';

    let currentSection = 'gallery';
    let isInitialized = false;

    const DOM = {
        sections: document.querySelectorAll('section'),
        navLinks: document.querySelectorAll('.header__link[data-section]'),
        sideNavLinks: document.querySelectorAll('.side-nav__menu-link[data-section]'),
        hamburgerButton: document.getElementById('hamburgerButton'),
        headerMenu: document.getElementById('headerMenu'),
        body: document.body
    };

    function createMenuOverlay() {
        // Crear overlay si no existe
        let overlay = document.querySelector('.menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'menu-overlay';
            document.body.appendChild(overlay);

            // Cerrar menú al hacer clic en el overlay
            overlay.addEventListener('click', closeMobileMenu);
        }
        return overlay;
    }

    function setupMobileMenu() {
        if (!DOM.hamburgerButton || !DOM.headerMenu) {
            console.error('Elementos del menú móvil no encontrados');
            return;
        }

        const overlay = createMenuOverlay();

        DOM.hamburgerButton.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('header__hamburger--active');
            DOM.headerMenu.classList.toggle('header__menu--active');
            overlay.classList.toggle('menu-overlay--active');
            DOM.body.classList.toggle('body--menu-open');

            // Prevenir scroll cuando el menú está abierto
            if (DOM.body.classList.contains('body--menu-open')) {
                DOM.body.style.overflow = 'hidden';
            } else {
                DOM.body.style.overflow = '';
            }
        });

        // Cerrar menú al hacer clic en enlaces
        DOM.headerMenu.querySelectorAll('.header__link').forEach(link => {
            link.addEventListener('click', function (e) {
                // Pequeño delay para permitir la animación
                setTimeout(() => {
                    closeMobileMenu();
                }, 300);
            });
        });

        // Cerrar menú al hacer clic fuera (mejorado)
        document.addEventListener('click', (e) => {
            if (DOM.headerMenu.classList.contains('header__menu--active') &&
                !DOM.headerMenu.contains(e.target) &&
                !DOM.hamburgerButton.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.headerMenu.classList.contains('header__menu--active')) {
                closeMobileMenu();
            }
        });

        // Manejar cambios de tamaño de ventana
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768 && DOM.headerMenu.classList.contains('header__menu--active')) {
                closeMobileMenu();
            }
        });
    }

    function closeMobileMenu() {
        if (DOM.hamburgerButton) {
            DOM.hamburgerButton.classList.remove('header__hamburger--active');
        }
        if (DOM.headerMenu) {
            DOM.headerMenu.classList.remove('header__menu--active');
        }

        const overlay = document.querySelector('.menu-overlay');
        if (overlay) {
            overlay.classList.remove('menu-overlay--active');
        }

        DOM.body.classList.remove('body--menu-open');
        DOM.body.style.overflow = '';
    }

    function switchSection(sectionId) {
        if (currentSection === sectionId) return;

        // Actualizar enlaces de navegación principales
        DOM.navLinks.forEach(link => link.classList.remove('header__link--active'));
        const activeLink = document.querySelector(`.header__link[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('header__link--active');

        // Actualizar enlaces del side navigation
        DOM.sideNavLinks.forEach(link => link.classList.remove('side-nav__menu-link--active'));
        const activeSideLink = document.querySelector(`.side-nav__menu-link[data-section="${sectionId}"]`);
        if (activeSideLink) activeSideLink.classList.add('side-nav__menu-link--active');

        // Ocultar todas las secciones
        DOM.sections.forEach(section => section.classList.remove('section--active'));

        // Mostrar sección objetivo
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('section--active');
            currentSection = sectionId;

            // Actualizar URL
            window.history.pushState(null, null, `#${sectionId}`);

            // Cargar contenido específico de la sección
            loadSectionContent(sectionId);
        }

        // Cerrar menú móvil si está abierto
        closeMobileMenu();

        // Cerrar side navigation si está abierto
        if (typeof SideNavigation !== 'undefined') {
            SideNavigation.close();
        }

        // Scroll suave al principio
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('sectionChanged', {
            detail: { section: sectionId }
        }));
    }

    function loadSectionContent(sectionId) {
        switch (sectionId) {
            case 'shop':
                if (typeof Shop !== 'undefined' && Shop.init) {
                    setTimeout(() => Shop.init(), 100);
                }
                break;
            case 'messages':
                if (typeof Messages !== 'undefined' && Messages.init) {
                    setTimeout(() => Messages.init(), 100);
                }
                break;
            case 'gallery':
                if (typeof Gallery !== 'undefined' && Gallery.refresh) {
                    setTimeout(() => Gallery.refresh(), 100);
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
                    switchSection(section);
                }
            });
        });

        // Manejar navegación con hash en URL
        window.addEventListener('hashchange', function () {
            const hash = window.location.hash.substring(1);
            if (hash && document.getElementById(hash)) {
                switchSection(hash);
            }
        });

        // Manejar navegación con botones de atrás/adelante
        window.addEventListener('popstate', function () {
            const hash = window.location.hash.substring(1);
            if (hash && document.getElementById(hash)) {
                switchSection(hash);
            }
        });
    }

    function initCurrentSection() {
        // Verificar hash inicial
        const initialHash = window.location.hash.substring(1);
        if (initialHash && document.getElementById(initialHash)) {
            switchSection(initialHash);
        } else {
            // Por defecto, galería
            switchSection('gallery');
        }
    }

    return {
        init: function () {
            if (isInitialized) return;

            handleNavigation();
            setupMobileMenu();
            initCurrentSection();
            isInitialized = true;

            console.log('Navegación inicializada correctamente');
        },

        getCurrentSection: function () {
            return currentSection;
        },

        switchToSection: function (sectionId) {
            switchSection(sectionId);
        },

        closeMobileMenu: closeMobileMenu,

        // Método para verificar si el menú móvil está activo
        isMobileMenuOpen: function () {
            return DOM.headerMenu && DOM.headerMenu.classList.contains('header__menu--active');
        }
    };
})();