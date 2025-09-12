// Añadir al módulo principal de la aplicación
const Navigation = (function () {
    'use strict';

    // Private variables
    let currentSection = 'gallery';

    // DOM Elements
    const DOM = {
        sections: document.querySelectorAll('section'),
        navLinks: document.querySelectorAll('.header__link[data-section]')
    };

    // Private methods
    function switchSection(sectionId) {
        if (currentSection === sectionId) return;

        // Quitar clase activa de todos los enlaces
        DOM.navLinks.forEach(link => link.classList.remove('active'));

        // Añadir clase activa al enlace actual
        const activeLink = document.querySelector(`.header__link[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Ocultar todas las secciones
        DOM.sections.forEach(section => section.classList.remove('section-active'));

        const targetSection = document.getElementById(sectionId);
        const gallerySection = document.getElementById('gallery');

        if (targetSection) {
            // Si es tienda, moverla arriba de galería
            if (sectionId === 'shop' && gallerySection && targetSection !== gallerySection.previousElementSibling) {
                gallerySection.parentNode.insertBefore(targetSection, gallerySection);
            }

            // Mostrar la sección seleccionada
            targetSection.classList.add('section-active');
            currentSection = sectionId;

            // Cargar contenido dinámico si es tienda
            if (sectionId === 'shop') {
                loadShopContent();
            }
        }
    }

    function loadShopContent() {
        Shop.init();
    }

    // Public methods
    return {
        init: function () {
            // Event listeners para navegación
            DOM.navLinks.forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const section = this.getAttribute('data-section');
                    switchSection(section);

                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            });

            // Iniciar directamente en tienda en vez de galería
            switchSection('gallery');
            loadShopContent();
        },

        getCurrentSection: function () {
            return currentSection;
        },

        switchToSection: function (sectionId) {
            switchSection(sectionId);
        }
    };
})();