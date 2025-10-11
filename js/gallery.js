const Gallery = (function() {
    'use strict';
    
    let currentImageIndex = 0;
    const imagesPerLoad = 6;
    const batchSize = 3; // Imágenes a cargar simultáneamente
    let imageDatabase = [];
    let isLoading = false;
    
    const DOM = {
        galleryGrid: document.getElementById('galleryGrid'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        loadingIndicator: document.getElementById('galleryLoading')
    };

    // Observer para lazy loading
    let imageObserver;

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

    // Función para parsear los datos del AppScript
    function parseImageDataFromAppScript(data) {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        const images = [];
        
        lines.forEach(line => {
            const parts = line.split('|');
            if (parts.length >= 4) {
                // Estructura esperada: ID|Título|Descripción|URL_Imagen|URL_Imagen (duplicado)
                const image = {
                    id: parts[0]?.trim() || '',
                    title: parts[1]?.trim() || 'Sin título',
                    description: parts[2]?.trim() || 'Sin descripción',
                    thumbnail: parts[3]?.trim() || '',
                    fullSize: parts[3]?.trim() || '' // Usamos la misma URL para thumbnail y fullSize
                };
                
                // Solo agregar si tiene URL de imagen
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
        
        // Usar lazy loading nativo con fallback
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
            Modal.show(imageData.fullSize, imageData.title);
        });

        // Si no hay soporte nativo para lazy loading, usar Intersection Observer
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
                        DOM.galleryGrid.appendChild(imageElement);
                    });
                    resolve();
                }, i * 50); // Pequeño retraso entre lotes para mejor UX
            });
            
            batchPromises.push(batchPromise);
        }
        
        await Promise.all(batchPromises);
        return endIndex;
    }

    async function loadImages(startIndex = 0, count = imagesPerLoad) {
        if (isLoading || !Array.isArray(imageDatabase) || imageDatabase.length === 0) {
            if (DOM.loadMoreBtn) {
                DOM.loadMoreBtn.style.display = 'none';
            }
            return;
        }

        isLoading = true;
        
        try {
            const endIndex = await loadImagesBatch(startIndex, count);
            currentImageIndex = endIndex;

            // Actualizar estado del botón
            if (DOM.loadMoreBtn) {
                if (currentImageIndex < imageDatabase.length) {
                    DOM.loadMoreBtn.style.display = 'block';
                    DOM.loadMoreBtn.disabled = false;
                    DOM.loadMoreBtn.textContent = Utils.translations[KuronekoApp.getCurrentLanguage()]?.['load-more'] || 'Cargar más';
                } else {
                    DOM.loadMoreBtn.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error loading images:', error);
            if (DOM.loadMoreBtn) {
                DOM.loadMoreBtn.style.display = 'none';
            }
        } finally {
            isLoading = false;
        }
    }

    function showLoading() {
        if (DOM.loadingIndicator) {
            DOM.loadingIndicator.style.display = 'block';
        }
        if (DOM.galleryGrid) {
            DOM.galleryGrid.innerHTML = '';
        }
        if (DOM.loadMoreBtn) {
            DOM.loadMoreBtn.style.display = 'none';
        }
    }

    function hideLoading() {
        if (DOM.loadingIndicator) {
            DOM.loadingIndicator.style.display = 'none';
        }
    }

    function handleLoadMore() {
        if (!isLoading) {
            loadImages(currentImageIndex, imagesPerLoad);
        }
    }

    return {
        init: async function() {
            try {
                showLoading();
                initIntersectionObserver();
                
                const scriptUrl = 'https://script.google.com/macros/s/AKfycbz_qyx41EtXTclnOi7xpFZtJTx36jO8iJwu8Qk5GJnwu4_Pg2BG2O9CxDbhqkeAqrEe/exec?hoja=Hoja%201';
                
                // Obtener datos del AppScript
                const response = await fetch(scriptUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const rawData = await response.text();
                console.log('Datos recibidos del AppScript:', rawData);
                
                // Parsear los datos al formato esperado
                imageDatabase = parseImageDataFromAppScript(rawData);
                console.log('Imágenes procesadas:', imageDatabase);
                
                hideLoading();
                
                if (imageDatabase.length === 0) {
                    console.warn('No se encontraron imágenes en los datos');
                    // Usar datos de respaldo si no hay imágenes
                    imageDatabase = Utils.getFallbackImageData();
                }
                
                await this.loadImages(0, imagesPerLoad);
                
                if (DOM.loadMoreBtn) {
                    DOM.loadMoreBtn.addEventListener('click', handleLoadMore);
                }
            } catch (error) {
                console.error('Error initializing gallery:', error);
                hideLoading();
                // Usar datos de respaldo en caso de error
                imageDatabase = Utils.getFallbackImageData();
                await this.loadImages(0, imagesPerLoad);
            }
        },
        
        loadImages: loadImages,
        
        addImages: function(newImages) {
            if (Array.isArray(newImages)) {
                imageDatabase.push(...newImages);
            }
        },
        
        refresh: async function() {
            if (DOM.galleryGrid) {
                DOM.galleryGrid.innerHTML = '';
            }
            currentImageIndex = 0;
            await loadImages(0, imagesPerLoad);
        },
        
        getStats: function() {
            return {
                totalImages: imageDatabase.length,
                loadedImages: currentImageIndex,
                isLoading: isLoading
            };
        },
        
        // Nuevo método para buscar imágenes
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
            
            // Cargar imágenes filtradas
            const tempDatabase = imageDatabase;
            imageDatabase = filteredImages;
            loadImages(0, imagesPerLoad).then(() => {
                imageDatabase = tempDatabase;
            });
        },
        
        // Método para debug
        debugData: function() {
            return {
                rawCount: imageDatabase.length,
                sample: imageDatabase.slice(0, 3)
            };
        }
    };
})();