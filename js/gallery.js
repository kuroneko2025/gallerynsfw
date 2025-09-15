// Gallery Module
const Gallery = (function () {
    'use strict';

    // Private variables
    let currentImageIndex = 0;
    const imagesPerLoad = 6;
    let imageDatabase = []; // Ahora se cargará dinámicamente

    // DOM Elements
    const DOM = {
        galleryGrid: document.getElementById('galleryGrid'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        loadingIndicator: document.getElementById('galleryLoading')
    };

    // Private methods
    function createImageElement(imageData) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery__item fade-in';

        galleryItem.innerHTML = `
            <img class="gallery__image" src="${imageData.thumbnail}" alt="${imageData.title}" loading="lazy">
            <div class="gallery__info">
                <h3 class="gallery__item-title">${imageData.title}</h3>
                <p class="gallery__item-desc">${imageData.description}</p>
            </div>
        `;

        galleryItem.addEventListener('click', function () {
            Modal.show(imageData.fullSize, imageData.title);
        });

        return galleryItem;
    }

    function loadImages(startIndex = 0, count = imagesPerLoad) {
        if (imageDatabase.length === 0) return;

        const endIndex = Math.min(startIndex + count, imageDatabase.length);
        const imagesToLoad = imageDatabase.slice(startIndex, endIndex);

        imagesToLoad.forEach((imageData, index) => {
            setTimeout(() => {
                const imageElement = createImageElement(imageData);
                DOM.galleryGrid.appendChild(imageElement);
            }, index * 100);
        });

        currentImageIndex = endIndex;

        // Hide load more button if all images are loaded
        if (currentImageIndex >= imageDatabase.length) {
            DOM.loadMoreBtn.style.display = 'none';
        }
    }

    function showLoading() {
        if (DOM.loadingIndicator) {
            DOM.loadingIndicator.style.display = 'block';
        }
        DOM.galleryGrid.innerHTML = '';
        DOM.loadMoreBtn.style.display = 'none';
    }

    function hideLoading() {
        if (DOM.loadingIndicator) {
            DOM.loadingIndicator.style.display = 'none';
        }
    }

    // Public methods
    return {
        init: async function () {
            try {
                // Mostrar loading
                showLoading();

                // URL de tu Google Apps Script (debes reemplazarla con la tuya)
                const scriptUrl = 'https://script.google.com/macros/s/AKfycby_GmDeWidXU8VjFSJ_3ABiNw6stgn-IJqZUJF0Jzb29XZi_s8He4fzoke2y4T8OcjP/exec?hoja=Hoja%201';

                // Cargar datos desde Google Sheets
                imageDatabase = await Utils.fetchImageData(scriptUrl);

                // Ocultar loading
                hideLoading();

                // Load initial images
                this.loadImages(0, imagesPerLoad);

                // Load more button event
                DOM.loadMoreBtn.addEventListener('click', function () {
                    loadImages(currentImageIndex, imagesPerLoad);
                });
            } catch (error) {
                console.error('Error initializing gallery:', error);
                hideLoading();

                // Usar datos de respaldo
                imageDatabase = Utils.getFallbackImageData();
                this.loadImages(0, imagesPerLoad);
            }
        },

        loadImages: loadImages,

        // Public API for adding images dynamically
        addImages: function (newImages) {
            imageDatabase.push(...newImages);
        },

        // Refresh gallery with new translations
        refresh: function () {
            // Clear existing gallery
            DOM.galleryGrid.innerHTML = '';
            currentImageIndex = 0;

            // Reload images with updated translations
            loadImages(0, imagesPerLoad);

            // Show load more button if it was hidden
            DOM.loadMoreBtn.style.display = 'block';
        },

        // Get current stats
        getStats: function () {
            return {
                totalImages: imageDatabase.length,
                loadedImages: currentImageIndex
            };
        }
    };
})();