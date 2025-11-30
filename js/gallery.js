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
    let currentModalImageIndex = 0;
    let isSlideshowActive = false;
    let currentImageSrc = '';
    let currentImageName = '';
    
    // Variables para el zoom y pan (tomadas del Modal)
    let isImageZoomed = !1;
    let posX = 0, posY = 0;
    let startX = 0, startY = 0;
    let isDragging = !1;
    
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

    // ===== FUNCIONES DE ZOOM Y PAN (DEL MODAL) =====
    
    function startDrag(e) {
        if (!isImageZoomed) return;
        isDragging = !0;
        const imgElement = document.querySelector('.slideshow-image');
        if (imgElement) {
            imgElement.classList.add('slideshow-image--dragging');
        }
        startX = e.clientX - posX;
        startY = e.clientY - posY;
    }

    function endDrag() {
        isDragging = !1;
        const imgElement = document.querySelector('.slideshow-image');
        if (imgElement) {
            imgElement.classList.remove('slideshow-image--dragging');
        }
    }

    function resetImageZoom() {
        isImageZoomed = !1;
        posX = posY = 0;
        const imgElement = document.querySelector('.slideshow-image');
        const zoomBtn = document.querySelector('.slideshow-zoom');
        
        if (imgElement) {
            imgElement.classList.remove('slideshow-image--zoomed', 'slideshow-image--dragging');
            imgElement.style.transform = '';
            imgElement.style.cursor = 'zoom-in';
        }
        
        if (zoomBtn) {
            zoomBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                ${getTranslation('zoom')}
            `;
            zoomBtn.dataset.zoomed = 'false';
        }
        
        disableImagePan();
    }

    function toggleImageZoom() {
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (slideshowContainer && slideshowContainer.classList.contains('fullscreen-mode')) {
            showNotification(getTranslation('zoom-disabled-fullscreen'), 'info');
            return;
        }
        
        isImageZoomed = !isImageZoomed;
        const imgElement = document.querySelector('.slideshow-image');
        const zoomBtn = document.querySelector('.slideshow-zoom');
        
        if (isImageZoomed) {
            // Aplicar zoom
            if (imgElement) {
                imgElement.classList.add('slideshow-image--zoomed');
                imgElement.style.transform = `scale(2) translate(0px, 0px)`;
                imgElement.style.cursor = 'grab';
            }
            posX = posY = 0;
            
            if (zoomBtn) {
                zoomBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    ${getTranslation('zoom-out')}
                `;
                zoomBtn.dataset.zoomed = 'true';
            }
            
            enableImagePan();
        } else {
            resetImageZoom();
        }
    }

    function enableImagePan() {
        const imgElement = document.querySelector('.slideshow-image');
        if (!imgElement) return;
        
        document.addEventListener('keydown', handleArrowKeys);
        imgElement.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);
        
        // Soporte táctil
        imgElement.addEventListener('touchstart', startTouch, { passive: !1 });
        imgElement.addEventListener('touchmove', onTouchMove, { passive: !1 });
        imgElement.addEventListener('touchend', endTouch);
        
        // Evento de doble click para zoom
        imgElement.addEventListener('dblclick', handleDoubleClick);
        
        // Evento de rueda del mouse para zoom
        imgElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    function disableImagePan() {
        const imgElement = document.querySelector('.slideshow-image');
        if (!imgElement) return;
        
        document.removeEventListener('keydown', handleArrowKeys);
        imgElement.removeEventListener('mousedown', startDrag);
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);
        
        imgElement.removeEventListener('touchstart', startTouch);
        imgElement.removeEventListener('touchmove', onTouchMove);
        imgElement.removeEventListener('touchend', endTouch);
        
        imgElement.removeEventListener('dblclick', handleDoubleClick);
        imgElement.removeEventListener('wheel', handleWheel);
    }

    function handleArrowKeys(e) {
        if (!isImageZoomed) return;
        const step = 20;
        
        if (e.key === 'ArrowUp') posY += step;
        if (e.key === 'ArrowDown') posY -= step;
        if (e.key === 'ArrowLeft') posX += step;
        if (e.key === 'ArrowRight') posX -= step;
        
        updateTransform();
    }

    function onDrag(e) {
        if (!isDragging || !isImageZoomed) return;
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        updateTransform();
    }

    function startTouch(e) {
        if (e.touches.length === 1 && isImageZoomed) {
            startX = e.touches[0].clientX - posX;
            startY = e.touches[0].clientY - posY;
        }
    }

    function onTouchMove(e) {
        if (e.touches.length === 1 && isImageZoomed) {
            e.preventDefault();
            posX = e.touches[0].clientX - startX;
            posY = e.touches[0].clientY - startY;
            updateTransform();
        }
    }

    function endTouch() {
        // Puedes añadir lógica adicional si es necesario
    }

    function handleDoubleClick(e) {
        e.preventDefault();
        toggleImageZoom();
    }

    function handleWheel(e) {
        if (!isImageZoomed) return;
        
        e.preventDefault();
        const imgElement = document.querySelector('.slideshow-image');
        if (!imgElement) return;
        
        // Zoom con rueda del mouse
        const rect = imgElement.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleChange = e.deltaY > 0 ? 0.9 : 1.1; // Reducir o aumentar zoom
        const currentScale = isImageZoomed ? 2 : 1;
        const newScale = Math.max(1, Math.min(5, currentScale * scaleChange)); // Límites de zoom
        
        if (newScale > 1) {
            isImageZoomed = true;
            const zoomBtn = document.querySelector('.slideshow-zoom');
            if (zoomBtn) {
                zoomBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    ${getTranslation('zoom-out')}
                `;
                zoomBtn.dataset.zoomed = 'true';
            }
            
            // Ajustar posición para mantener el punto bajo el cursor
            posX = mouseX - (mouseX - posX) * scaleChange;
            posY = mouseY - (mouseY - posY) * scaleChange;
            
            imgElement.style.transform = `scale(${newScale}) translate(${posX}px, ${posY}px)`;
            imgElement.style.cursor = 'grab';
            imgElement.classList.add('slideshow-image--zoomed');
            
            enableImagePan();
        } else {
            resetImageZoom();
        }
    }

    function updateTransform() {
        const imgElement = document.querySelector('.slideshow-image');
        if (imgElement && isImageZoomed) {
            const currentScale = 2; // Mantener escala fija o podrías hacerla dinámica
            imgElement.style.transform = `scale(${currentScale}) translate(${posX}px, ${posY}px)`;
        }
    }

    // ===== FUNCIONES DE DESCARGA (MISMAS QUE MODAL) =====

    function downloadImage() {
        if (!currentImageSrc) return;
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = currentImageSrc;
        
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(function(blob) {
                    if (!blob) {
                        console.error('No se pudo generar el blob de la imagen');
                        showDownloadOptions();
                        return;
                    }
                    
                    const fileName = currentImageName 
                        ? currentImageName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg'
                        : `kuroneko-image-${Date.now()}.jpg`;
                    
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 100);
                    
                    showDownloadNotification();
                }, 'image/jpeg', 0.95);
                
            } catch (error) {
                console.error('Error al procesar la imagen:', error);
                showDownloadOptions();
            }
        };
        
        img.onerror = function() {
            console.error('No se pudo cargar la imagen para descarga directa');
            showDownloadOptions();
        };
    }

    function showDownloadOptions() {
        const downloadModal = document.createElement('div');
        downloadModal.className = 'download-options-modal';
        downloadModal.innerHTML = `
            <div class="download-options__content">
                <h3>${getTranslation('download-options')}</h3>
                <p>${getTranslation('download-restricted')}</p>
                <div class="download-options__buttons">
                    <button class="button button--secondary" id="openInNewTab">
                        ${getTranslation('open-tab')}
                    </button>
                    <button class="button" id="copyImageLink">
                        ${getTranslation('copy-link')}
                    </button>
                    <button class="button button--danger" id="closeDownloadOptions">
                        ${getTranslation('close')}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(downloadModal);
        
        const openInNewTabBtn = document.getElementById('openInNewTab');
        const copyImageLinkBtn = document.getElementById('copyImageLink');
        const closeDownloadOptionsBtn = document.getElementById('closeDownloadOptions');
        
        if (openInNewTabBtn) {
            openInNewTabBtn.addEventListener('click', function() {
                window.open(currentImageSrc, '_blank');
                document.body.removeChild(downloadModal);
            });
        }
        
        if (copyImageLinkBtn) {
            copyImageLinkBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(currentImageSrc).then(() => {
                    showCopySuccessNotification();
                    document.body.removeChild(downloadModal);
                }).catch(err => {
                    console.error('Error copying text: ', err);
                    showCopyErrorNotification();
                });
            });
        }
        
        if (closeDownloadOptionsBtn) {
            closeDownloadOptionsBtn.addEventListener('click', function() {
                document.body.removeChild(downloadModal);
            });
        }
        
        downloadModal.addEventListener('click', function(e) {
            if (e.target === downloadModal) {
                document.body.removeChild(downloadModal);
            }
        });
    }

    // Notificaciones (misma lógica que Modal)
    function showDownloadNotification() {
        const notification = document.createElement('div');
        notification.className = 'download-notification download-notification--success';
        notification.innerHTML = `
            <span>${getTranslation('download-success')}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('download-notification--show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('download-notification--show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function showCopySuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'download-notification download-notification--success';
        notification.innerHTML = `
            <span>${getTranslation('copy-success')}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('download-notification--show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('download-notification--show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function showCopyErrorNotification() {
        const notification = document.createElement('div');
        notification.className = 'download-notification download-notification--error';
        notification.innerHTML = `
            <span>${getTranslation('copy-error')}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('download-notification--show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('download-notification--show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Función para mostrar notificaciones básicas
    function showNotification(message, type = 'info') {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
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

    function createImageElement(imageData, index) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery__item fade-in';
        galleryItem.dataset.index = index;
        const useLazyLoading = 'loading' in HTMLImageElement.prototype;
        
        galleryItem.innerHTML = `
            <img class="gallery__image ${useLazyLoading ? '' : 'lazy'}" 
                 ${useLazyLoading ? 'loading="lazy"' : 'data-src="' + imageData.thumbnail + '"'} 
                 src="${useLazyLoading ? imageData.thumbnail : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDMwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjMWExYTFhIi8+CjxwYXRoIGQ9Ik0xMjAgODBDMTIwIDcyLjE2MzQgMTI2LjE2MyA2NiAxMzQgNjZDMTQxLjgzNyA2NiAxNDggNzIuMTYzNCAxNDggODBDMTQ4IDg3LjgzNjYgMTQxLjgzcyA5NCAxMzQgOTRDMTI2LjE2MyA5NCAxMjAgODcuODM2NiAxMjAgODBaIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0xMDAgMTQwSDE2OFYxNTBIMTAwVjE0MFoiIGZpbGw9IiMzMzMiLz4KPC9zdmc+'}" 
                 alt="${escapeHtml(imageData.title)}">
            <div class="gallery__info">
                <h3 class="gallery__item-title">${escapeHtml(imageData.title)}</h3>
                <p class="gallery__item-desc">${escapeHtml(imageData.description)}</p>
            </div>
        `;
        
        galleryItem.addEventListener('click', function() {
            const globalIndex = parseInt(this.dataset.index);
            openSlideshow(globalIndex);
        });
        
        if (!useLazyLoading && imageObserver) {
            const img = galleryItem.querySelector('.gallery__image');
            imageObserver.observe(img);
        }
        
        return galleryItem;
    }

    // Función escapeHtml de fallback
    function escapeHtml(text) {
        if (typeof Utils !== 'undefined' && Utils.escapeHtml) {
            return Utils.escapeHtml(text);
        }
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function openSlideshow(startIndex) {
        currentModalImageIndex = startIndex;
        isSlideshowActive = true;
        
        const currentImage = imageDatabase[currentModalImageIndex];
        currentImageSrc = currentImage.fullSize;
        currentImageName = currentImage.title;
        
        // Crear modal de slideshow
        const slideshowModal = document.createElement('div');
        slideshowModal.className = 'slideshow-modal';
        slideshowModal.innerHTML = `
            <div class="slideshow-container">
                <div class="slideshow-header">
                    <div class="slideshow-counter">
                        <span class="slideshow-current">${currentModalImageIndex + 1}</span>
                        /
                        <span class="slideshow-total">${imageDatabase.length}</span>
                    </div>
                    <button class="slideshow-close">&times;</button>
                </div>
                
                <div class="slideshow-content">
                    <button class="slideshow-nav slideshow-prev" aria-label="${getTranslation('previous')}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                    </button>
                    
                    <div class="slideshow-image-wrapper">
                        <div class="slideshow-image-container">
                            <img class="slideshow-image" src="" alt="" loading="eager" style="cursor: zoom-in;">
                            <div class="slideshow-loading">${getTranslation('loading-text')}</div>
                        </div>
                    </div>
                    
                    <button class="slideshow-nav slideshow-next" aria-label="${getTranslation('next')}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="slideshow-footer">
                    <div class="slideshow-info">
                        <h3 class="slideshow-title">${escapeHtml(currentImage.title)}</h3>
                        <p class="slideshow-description">${escapeHtml(currentImage.description)}</p>
                    </div>
                    
                    <div class="slideshow-controls">
                        <button class="button button--primary slideshow-download" title="${getTranslation('download')}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                            ${getTranslation('download')}
                        </button>
                        <button class="button button--secondary slideshow-zoom" title="${getTranslation('zoom')}" data-zoomed="false">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            ${getTranslation('zoom')}
                        </button>
                        <button class="slideshow-fullscreen-btn" title="${getTranslation('enter-fullscreen')}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                            </svg>
                            ${getTranslation('fullscreen')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(slideshowModal);
        
        // Cargar imagen inicial
        loadSlideshowImage(currentModalImageIndex);
        
        // Event listeners
        const closeBtn = slideshowModal.querySelector('.slideshow-close');
        const prevBtn = slideshowModal.querySelector('.slideshow-prev');
        const nextBtn = slideshowModal.querySelector('.slideshow-next');
        const downloadBtn = slideshowModal.querySelector('.slideshow-download');
        const zoomBtn = slideshowModal.querySelector('.slideshow-zoom');
        const fullscreenBtn = slideshowModal.querySelector('.slideshow-fullscreen-btn');
        const imgElement = slideshowModal.querySelector('.slideshow-image');
        
        closeBtn.addEventListener('click', closeSlideshow);
        prevBtn.addEventListener('click', showPreviousImage);
        nextBtn.addEventListener('click', showNextImage);
        downloadBtn.addEventListener('click', downloadCurrentImage);
        zoomBtn.addEventListener('click', toggleImageZoom); // Usar toggleImageZoom en lugar de toggleZoom
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        
        // Evento de click en la imagen para zoom
        if (imgElement) {
            imgElement.addEventListener('click', function(e) {
                // Solo hacer zoom si no se está arrastrando
                if (!isDragging) {
                    toggleImageZoom();
                }
            });
        }
        
        // Eventos de teclado
        document.addEventListener('keydown', handleSlideshowKeyboard);
        
        // Cerrar al hacer click fuera
        slideshowModal.addEventListener('click', function(e) {
            if (e.target === slideshowModal) {
                closeSlideshow();
            }
        });
        
        // Resetear zoom al cambiar de imagen
        resetImageZoom();
    }

    function closeSlideshow() {
        const slideshowModal = document.querySelector('.slideshow-modal');
        if (slideshowModal) {
            slideshowModal.remove();
        }
        isSlideshowActive = false;
        document.removeEventListener('keydown', handleSlideshowKeyboard);
        disableImagePan();
        currentImageSrc = '';
        currentImageName = '';
        resetImageZoom();
    }

    function handleSlideshowKeyboard(e) {
        if (!isSlideshowActive) return;
        
        switch(e.key) {
            case 'Escape':
                closeSlideshow();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
            case ' ':
                e.preventDefault();
                showNextImage();
                break;
            case 'z':
            case 'Z':
                e.preventDefault();
                toggleImageZoom();
                break;
        }
    }

    function loadSlideshowImage(index) {
        const image = imageDatabase[index];
        const imgElement = document.querySelector('.slideshow-image');
        const loadingElement = document.querySelector('.slideshow-loading');
        const titleElement = document.querySelector('.slideshow-title');
        const descElement = document.querySelector('.slideshow-description');
        const counterElement = document.querySelector('.slideshow-current');
        
        if (!imgElement || !image) return;
        
        // Actualizar imagen actual
        currentImageSrc = image.fullSize;
        currentImageName = image.title;
        
        // Mostrar loading
        imgElement.style.display = 'none';
        if (loadingElement) loadingElement.style.display = 'block';
        
        // Actualizar información
        if (titleElement) titleElement.textContent = image.title;
        if (descElement) descElement.textContent = image.description;
        if (counterElement) counterElement.textContent = index + 1;
        
        // Cargar imagen
        const tempImg = new Image();
        tempImg.onload = function() {
            imgElement.src = image.fullSize;
            imgElement.alt = image.title;
            imgElement.style.display = 'block';
            if (loadingElement) loadingElement.style.display = 'none';
            
            // Resetear zoom al cargar nueva imagen
            resetImageZoom();
        };
        tempImg.onerror = function() {
            if (loadingElement) loadingElement.textContent = 'Error cargando imagen';
        };
        tempImg.src = image.fullSize;
    }

    function showPreviousImage() {
        if (currentModalImageIndex > 0) {
            currentModalImageIndex--;
            loadSlideshowImage(currentModalImageIndex);
        }
    }

    function showNextImage() {
        if (currentModalImageIndex < imageDatabase.length - 1) {
            currentModalImageIndex++;
            loadSlideshowImage(currentModalImageIndex);
        }
    }

    function downloadCurrentImage() {
        if (!currentImageSrc) {
            showNotification(getTranslation('download-error'), 'error');
            return;
        }
        
        downloadImage();
    }

    function toggleFullscreen() {
        const slideshowContainer = document.querySelector('.slideshow-container');
        const fullscreenBtn = document.querySelector('.slideshow-fullscreen-btn');
        
        if (!slideshowContainer || !fullscreenBtn) return;
        
        const isFullscreen = slideshowContainer.classList.contains('fullscreen-mode');
        
        if (isFullscreen) {
            // Salir de pantalla completa
            slideshowContainer.classList.remove('fullscreen-mode');
            fullscreenBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
                ${getTranslation('fullscreen')}
            `;
            fullscreenBtn.title = getTranslation('enter-fullscreen');
        } else {
            // Entrar en pantalla completa
            slideshowContainer.classList.add('fullscreen-mode');
            fullscreenBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
                ${getTranslation('exit-fullscreen')}
            `;
            fullscreenBtn.title = getTranslation('exit-fullscreen');
            
            // Resetear zoom en fullscreen
            resetImageZoom();
        }
    }

    // ... (resto de las funciones de la galería se mantienen igual)

    async function loadImagesBatch(startIndex, count) {
        const endIndex = Math.min(startIndex + count, imageDatabase.length);
        const imagesToLoad = imageDatabase.slice(startIndex, endIndex);
        const batchPromises = [];
        
        for (let i = 0; i < imagesToLoad.length; i += batchSize) {
            const batch = imagesToLoad.slice(i, i + batchSize);
            const batchPromise = new Promise(resolve => {
                setTimeout(() => {
                    batch.forEach((imageData, index) => {
                        const globalIndex = startIndex + i + index;
                        const imageElement = createImageElement(imageData, globalIndex);
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
            DOM.pageInfo.textContent = 'No hay imágenes';
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
                imageDatabase = (typeof Utils !== 'undefined' && Utils.getFallbackImageData) 
                    ? Utils.getFallbackImageData() 
                    : [];
                totalPages = Math.ceil(imageDatabase.length / imagesPerPage);
            }
            
            createPaginationControls();
            updateGalleryTexts();
            
            await loadPage(1);
            
        } catch (error) {
            console.error('Error initializing gallery:', error);
            hideLoading();
            imageDatabase = (typeof Utils !== 'undefined' && Utils.getFallbackImageData) 
                ? Utils.getFallbackImageData() 
                : [];
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
        },
        
        // Nuevos métodos para el slideshow
        openSlideshow: openSlideshow,
        closeSlideshow: closeSlideshow,
        isSlideshowActive: function() { return isSlideshowActive; }
    };
})();