const Gallery = (function() {
    'use strict';
    
    let currentImageIndex = 0;
    const imagesPerLoad = 6;
    const batchSize = 3;
    let imageDatabase = [];
    let isLoading = !1;
    let currentPage = 1;
    const imagesPerPage = 12;
    let totalPages = 1;
    let imageObserver = null;
    
    const DOM = {
        galleryGrid: document.getElementById('galleryGrid'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        loadingIndicator: document.getElementById('galleryLoading'),
        paginationContainer: null,
        pageInfo: null
    };

    function getCurrentLanguage() {
        return typeof KuronekoApp !== 'undefined' ? KuronekoApp.getCurrentLanguage() : 'es';
    }

    function getTranslation(key) {
        const lang = getCurrentLanguage();
        return (Utils.translations[lang] && Utils.translations[lang][key]) || key;
    }

    function initIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
        }
    }

    function parseImageDataFromAppScript(data) {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        const images = [];
        
        lines.forEach(line => {
            const parts = line.split('|');
            if (parts.length >= 4) {
                const image = {
                    id: parts[0]?.trim() || Date.now() + Math.random(),
                    title: parts[1]?.trim() || getTranslation('no-title'),
                    description: parts[2]?.trim() || getTranslation('no-description'),
                    thumbnail: parts[3]?.trim() || '',
                    fullSize: parts[3]?.trim() || ''
                };
                if (image.thumbnail) {
                    images.push(image);
                }
            }
        });
        return images;
    }

    function createImageElement(imageData) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery__item fade-in';
        const useLazyLoading = 'loading' in HTMLImageElement.prototype;
        
        galleryItem.innerHTML = `
            <img class="gallery__image ${useLazyLoading ? '' : 'lazy'}" 
                 ${useLazyLoading ? 'loading="lazy"' : 'data-src="' + imageData.thumbnail + '"'} 
                 src="${useLazyLoading ? imageData.thumbnail : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDMwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjMWExYTFhIi8+CjxwYXRoIGQ9Ik0xMjAgODBDMTIwIDcyLjE2MzQgMTI2LjE2MyA2NiAxMzQgNjZDMTQxLjgzNyA2NiAxNDggNzIuMTYzNCAxNDggODBDMTQ4IDg3LjgzNjYgMTQxLjgzNyA5NCAxMzQgOTRDMTI2LjE2MyA5NCAxMjAgODcuODM2NiAxMjAgODBaIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0xMDAgMTQwSDE2OFYxNTBIMTAwVjE0MFoiIGZpbGw9IiMzMzMiLz4KPC9zdmc+'}" 
                 alt="${Utils.escapeHtml(imageData.title)}">
            <div class="gallery__info">
                <h3 class="gallery__item-title">${Utils.escapeHtml(imageData.title)}</h3>
                <p class="gallery__item-desc">${Utils.escapeHtml(imageData.description)}</p>
            </div>
        `;
        
        galleryItem.addEventListener('click', function() {
            if (typeof Modal !== 'undefined' && Modal.show) {
                Modal.show(imageData.fullSize, imageData.title);
            }
        });
        
        if (!useLazyLoading && imageObserver) {
            const img = galleryItem.querySelector('.gallery__image');
            imageObserver.observe(img);
        }
        
        return galleryItem;
    }

    async function loadImagesBatch(startIndex, count) {
        const endIndex = Math.min(startIndex + count, imageDatabase.length);
        const imagesToLoad = imageDatabase.slice(startIndex, endIndex);
        const batchPromises = [];
        
        for (let i = 0; i < imagesToLoad.length; i += batchSize) {
            const batch = imagesToLoad.slice(i, i + batchSize);
            const batchPromise = new Promise(resolve => {
                setTimeout(() => {
                    batch.forEach((imageData, index) => {
                        const imageElement = createImageElement(imageData);
                        if (DOM.galleryGrid) {
                            DOM.galleryGrid.appendChild(imageElement);
                        }
                    });
                    resolve();
                }, i * 50);
            });
            batchPromises.push(batchPromise);
        }
        
        await Promise.all(batchPromises);
        return endIndex;
    }

    async function loadPage(pageNumber) {
        if (isLoading || pageNumber < 1 || pageNumber > totalPages) return;
        
        currentPage = pageNumber;
        const startIndex = (currentPage - 1) * imagesPerPage;
        const endIndex = Math.min(startIndex + imagesPerPage, imageDatabase.length);
        
        if (DOM.galleryGrid) {
            DOM.galleryGrid.innerHTML = '';
        }
        
        isLoading = !0;
        
        try {
            await loadImagesBatch(startIndex, imagesPerPage);
            currentImageIndex = endIndex;
            updatePaginationInfo();
            updatePaginationControls();
        } catch (error) {
            console.error('Error loading page:', error);
        } finally {
            isLoading = !1;
        }
    }

    function createPaginationControls() {
        if (!DOM.galleryGrid || !DOM.galleryGrid.parentNode) return;
        
        // Limpiar contenedor existente
        if (DOM.paginationContainer && DOM.paginationContainer.parentNode) {
            DOM.paginationContainer.parentNode.removeChild(DOM.paginationContainer);
        }
        
        DOM.paginationContainer = document.createElement('div');
        DOM.paginationContainer.className = 'gallery__pagination';
        DOM.galleryGrid.parentNode.insertBefore(DOM.paginationContainer, DOM.galleryGrid.nextSibling);
        
        DOM.pageInfo = document.createElement('div');
        DOM.pageInfo.className = 'gallery__page-info';
        DOM.paginationContainer.appendChild(DOM.pageInfo);
        
        const paginationControls = document.createElement('div');
        paginationControls.className = 'gallery__pagination-controls';
        
        const prevButton = document.createElement('button');
        prevButton.className = 'button button--ripple gallery__pagination-btn';
        prevButton.innerHTML = `&laquo; ${getTranslation('previous')}`;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                loadPage(currentPage - 1);
            }
        });
        
        const nextButton = document.createElement('button');
        nextButton.className = 'button button--ripple gallery__pagination-btn';
        nextButton.innerHTML = `${getTranslation('next')} &raquo;`;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                loadPage(currentPage + 1);
            }
        });
        
        paginationControls.appendChild(prevButton);
        paginationControls.appendChild(nextButton);
        DOM.paginationContainer.appendChild(paginationControls);
        
        updatePaginationInfo();
        updatePaginationControls();
    }

    function updatePaginationInfo() {
        if (DOM.pageInfo && imageDatabase.length > 0) {
            const startImage = (currentPage - 1) * imagesPerPage + 1;
            const endImage = Math.min(currentPage * imagesPerPage, imageDatabase.length);
            const pageText = getTranslation('page-info')
                .replace('{current}', currentPage)
                .replace('{total}', totalPages)
                .replace('{start}', startImage)
                .replace('{end}', endImage)
                .replace('{totalImages}', imageDatabase.length);
            
            DOM.pageInfo.textContent = pageText;
        } else if (DOM.pageInfo) {
            DOM.pageInfo.textContent = getTranslation('no-images');
        }
    }

    function updatePaginationControls() {
        if (!DOM.paginationContainer) return;
        
        const buttons = DOM.paginationContainer.querySelectorAll('.gallery__pagination-btn');
        const prevButton = buttons[0];
        const nextButton = buttons[1];
        
        if (prevButton) {
            prevButton.disabled = currentPage === 1;
            prevButton.style.opacity = currentPage === 1 ? '0.5' : '1';
        }
        
        if (nextButton) {
            nextButton.disabled = currentPage === totalPages;
            nextButton.style.opacity = currentPage === totalPages ? '0.5' : '1';
        }
    }

    function showLoading() {
        if (DOM.loadingIndicator) {
            DOM.loadingIndicator.style.display = 'block';
            const loadingText = DOM.loadingIndicator.querySelector('.gallery-loading__text');
            if (loadingText) {
                loadingText.textContent = getTranslation('loading-images');
            }
        }
        if (DOM.galleryGrid) {
            DOM.galleryGrid.innerHTML = '';
        }
        if (DOM.loadMoreBtn) {
            DOM.loadMoreBtn.style.display = 'none';
        }
        if (DOM.paginationContainer) {
            DOM.paginationContainer.innerHTML = '';
        }
    }

    function hideLoading() {
        if (DOM.loadingIndicator) {
            DOM.loadingIndicator.style.display = 'none';
        }
    }

    function updateGalleryTexts() {
        const title = document.querySelector('.gallery__title');
        if (title) {
            title.textContent = getTranslation('gallery-title');
        }
        
        if (DOM.loadMoreBtn) {
            DOM.loadMoreBtn.textContent = getTranslation('load-more');
        }
        
        if (DOM.loadingIndicator) {
            const loadingText = DOM.loadingIndicator.querySelector('.gallery-loading__text');
            if (loadingText) {
                loadingText.textContent = getTranslation('loading-images');
            }
        }
        
        updatePaginationInfo();
        updatePaginationControls();
    }

    async function initializeGallery() {
        try {
            showLoading();
            initIntersectionObserver();
            
            const scriptUrl = 'https://script.google.com/macros/s/AKfycbz_qyx41EtXTclnOi7xpFZtJTx36jO8iJwu8Qk5GJnwu4_Pg2BG2O9CxDbhqkeAqrEe/exec?hoja=Hoja%201';
            const response = await fetch(scriptUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rawData = await response.text();
            imageDatabase = parseImageDataFromAppScript(rawData);
            totalPages = Math.ceil(imageDatabase.length / imagesPerPage);
            
            hideLoading();
            
            if (imageDatabase.length === 0) {
                console.warn('No images found in data');
                imageDatabase = Utils.getFallbackImageData();
                totalPages = Math.ceil(imageDatabase.length / imagesPerPage);
            }
            
            createPaginationControls();
            updateGalleryTexts();
            
            await loadPage(1);
            
        } catch (error) {
            console.error('Error initializing gallery:', error);
            hideLoading();
            imageDatabase = Utils.getFallbackImageData();
            totalPages = Math.ceil(imageDatabase.length / imagesPerPage);
            createPaginationControls();
            updateGalleryTexts();
            await loadPage(1);
        }
    }

    return {
        init: async function() {
            await initializeGallery();
        },
        
        loadPage: loadPage,
        
        addImages: function(newImages) {
            if (Array.isArray(newImages)) {
                imageDatabase.push(...newImages);
                totalPages = Math.ceil(imageDatabase.length / imagesPerPage);
                updatePaginationInfo();
                updatePaginationControls();
            }
        },
        
        refresh: async function() {
            if (DOM.galleryGrid) {
                DOM.galleryGrid.innerHTML = '';
            }
            currentImageIndex = 0;
            currentPage = 1;
            updateGalleryTexts();
            await loadPage(1);
        },
        
        onLanguageChange: function() {
            updateGalleryTexts();
        },
        
        getStats: function() {
            return {
                totalImages: imageDatabase.length,
                loadedImages: currentImageIndex,
                currentPage: currentPage,
                totalPages: totalPages,
                isLoading: isLoading
            };
        },
        
        searchImages: function(query) {
            if (!query.trim()) {
                this.refresh();
                return;
            }
            
            const filteredImages = imageDatabase.filter(image => 
                image.title.toLowerCase().includes(query.toLowerCase()) || 
                image.description.toLowerCase().includes(query.toLowerCase())
            );
            
            if (DOM.galleryGrid) {
                DOM.galleryGrid.innerHTML = '';
            }
            
            currentImageIndex = 0;
            currentPage = 1;
            const tempDatabase = imageDatabase;
            imageDatabase = filteredImages;
            totalPages = Math.ceil(imageDatabase.length / imagesPerPage);
            updatePaginationInfo();
            
            loadPage(1).then(() => {
                imageDatabase = tempDatabase;
                totalPages = Math.ceil(imageDatabase.length / imagesPerPage);
            });
        }
    };
})();