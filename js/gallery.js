const Gallery = (function () {
    'use strict';

    const CONFIG = {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbz_qyx41EtXTclnOi7xpFZtJTx36jO8iJwu8Qk5GJnwu4_Pg2BG2O9CxDbhqkeAqrEe/exec?hoja=Hoja%201',
        imagesPerPage: 12,
        batchSize: 4,
        idleTime: 3000,
        zoom: { min: 1, max: 4, step: 0.5 }
    };

    let state = {
        imageDatabase: [],
        isLoading: false,
        currentPage: 1,
        totalPages: 1,
        isSlideshowActive: false,
        currentImageIndex: 0,
        uiTimeout: null,
        isImageZoomed: false,
        zoomScale: 1,
        transform: { x: 0, y: 0, startX: 0, startY: 0, isDragging: false },
        loadedImages: new Map()
    };

    let imageObserver = null;

    const DOM = {
        galleryGrid: document.getElementById('galleryGrid'),
        paginationContainer: null,
        pageInfo: null
    };

    function getCurrentLanguage() {
        return typeof KuronekoApp !== 'undefined' ? KuronekoApp.getCurrentLanguage() : 'es';
    }

    function getTranslation(key) {
        const lang = getCurrentLanguage();
        if (typeof Utils !== 'undefined' && Utils.translations && Utils.translations[lang]) {
            return Utils.translations[lang][key] || key;
        }
        return key;
    }

    function escapeHtml(text) {
        if (!text) return '';
        if (typeof Utils !== 'undefined' && Utils.escapeHtml) {
            return Utils.escapeHtml(text);
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(msg, type) {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification(msg, type);
        }
    }

    function parseImageData(rawData) {
        const lines = rawData.split('\n').filter(line => line.trim() !== '');
        const images = [];
        lines.forEach(line => {
            const parts = line.split('|');
            if (parts.length >= 4) {
                const image = {
                    id: parts[0]?.trim() || Date.now(),
                    title: parts[1]?.trim() || getTranslation('no-title'),
                    description: parts[2]?.trim() || getTranslation('no-description'),
                    thumbnail: parts[3]?.trim() || '',
                    fullSize: parts[4]?.trim() || parts[3]?.trim() || ''
                };
                if (image.thumbnail) images.push(image);
            }
        });
        return images;
    }

    async function initializeData() {
        try {
            const response = await fetch(CONFIG.scriptUrl);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const textData = await response.text();
            state.imageDatabase = parseImageData(textData);

            if (state.imageDatabase.length === 0 && typeof Utils !== 'undefined' && Utils.getFallbackImageData) {
                state.imageDatabase = Utils.getFallbackImageData();
            }

            state.totalPages = Math.ceil(state.imageDatabase.length / CONFIG.imagesPerPage);

            await loadPage(1, false);
            createPaginationControls();

        } catch (error) {
            if (typeof Utils !== 'undefined' && Utils.getFallbackImageData) {
                state.imageDatabase = Utils.getFallbackImageData();
                state.totalPages = 1;
                await loadPage(1, false);
            }
        }
    }

    function initIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const dataSrc = img.dataset.src;
                        
                        if (dataSrc && !state.loadedImages.has(img)) {
                            state.loadedImages.set(img, 'loading');
                            
                            const tempImg = new Image();
                            tempImg.onload = () => {
                                img.src = dataSrc;
                                img.removeAttribute('data-src');
                                
                                setTimeout(() => {
                                    img.classList.add('loaded');
                                    const wrapper = img.closest('.gallery__image-wrapper');
                                    if (wrapper) wrapper.classList.add('loaded');
                                    
                                    const item = img.closest('.gallery__item');
                                    if (item) {
                                        item.style.opacity = '1';
                                        item.style.transform = 'translateY(0)';
                                    }
                                }, 100);
                                
                                state.loadedImages.set(img, 'loaded');
                                imageObserver.unobserve(img);
                            };
                            
                            tempImg.onerror = () => {
                                state.loadedImages.delete(img);
                            };
                            
                            tempImg.src = dataSrc;
                        }
                    }
                });
            }, { 
                rootMargin: '50px',
                threshold: 0.1 
            });
        }
    }

    function createImageCard(imageData, index) {
        const item = document.createElement('div');
        item.className = 'gallery__item';
        item.dataset.index = index;
        
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        item.innerHTML = `
            <div class="gallery__image-wrapper">
                <div class="gallery-loader-spinner"></div>
                <img class="gallery__image" 
                     data-src="${imageData.thumbnail}" 
                     src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                     alt="${escapeHtml(imageData.title)}">
            </div>
            <div class="gallery__info">
                <h3 class="gallery__item-title">${escapeHtml(imageData.title)}</h3>
                <p class="gallery__item-desc" style="display:none">${escapeHtml(imageData.description)}</p>
            </div>
        `;

        item.addEventListener('click', () => openSlideshow(index));

        if (imageObserver) {
            imageObserver.observe(item.querySelector('.gallery__image'));
        }

        return item;
    }

    async function loadPage(pageNumber, shouldScroll = false) {
        if (pageNumber < 1 || pageNumber > state.totalPages || state.isLoading) return;
        
        state.currentPage = pageNumber;
        state.isLoading = true;

        if (imageObserver) {
            imageObserver.disconnect();
        }
        state.loadedImages.clear();

        if (DOM.galleryGrid) DOM.galleryGrid.innerHTML = '';

        const start = (pageNumber - 1) * CONFIG.imagesPerPage;
        const end = Math.min(start + CONFIG.imagesPerPage, state.imageDatabase.length);
        const imagesToLoad = state.imageDatabase.slice(start, end);

        for (let i = 0; i < imagesToLoad.length; i += CONFIG.batchSize) {
            const batch = imagesToLoad.slice(i, i + CONFIG.batchSize);
            
            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    batch.forEach((data, batchIndex) => {
                        const globalIndex = start + i + batchIndex;
                        const card = createImageCard(data, globalIndex);
                        if (DOM.galleryGrid) DOM.galleryGrid.appendChild(card);
                    });
                    resolve();
                });
            });
            
            if (i + CONFIG.batchSize < imagesToLoad.length) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        if (imageObserver && DOM.galleryGrid) {
            const images = DOM.galleryGrid.querySelectorAll('.gallery__image[data-src]');
            images.forEach(img => {
                if (!state.loadedImages.has(img)) {
                    imageObserver.observe(img);
                }
            });
        }

        updatePaginationUI();
        state.isLoading = false;

        if (shouldScroll) {
            const gallerySection = document.getElementById('gallery');
            if (gallerySection && gallerySection.offsetParent !== null) {
                gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    function createPaginationControls() {
        if (DOM.paginationContainer && DOM.paginationContainer.parentNode) {
            DOM.paginationContainer.parentNode.removeChild(DOM.paginationContainer);
        }

        const container = document.createElement('div');
        container.className = 'gallery__pagination';

        DOM.pageInfo = document.createElement('div');
        DOM.pageInfo.className = 'gallery__page-info';

        const controls = document.createElement('div');
        controls.className = 'gallery__pagination-controls';

        const btnPrev = document.createElement('button');
        btnPrev.className = 'button gallery__pagination-btn';
        btnPrev.id = 'prevPageBtn';
        btnPrev.innerHTML = `&laquo; ${getTranslation('previous')}`;
        btnPrev.onclick = () => { if (state.currentPage > 1) loadPage(state.currentPage - 1, true); };

        const btnNext = document.createElement('button');
        btnNext.className = 'button gallery__pagination-btn';
        btnNext.id = 'nextPageBtn';
        btnNext.innerHTML = `${getTranslation('next')} &raquo;`;
        btnNext.onclick = () => { if (state.currentPage < state.totalPages) loadPage(state.currentPage + 1, true); };

        controls.appendChild(btnPrev);
        controls.appendChild(btnNext);
        container.appendChild(DOM.pageInfo);
        container.appendChild(controls);
        DOM.paginationContainer = container;

        if (DOM.galleryGrid && DOM.galleryGrid.parentNode) {
            DOM.galleryGrid.parentNode.insertBefore(container, DOM.galleryGrid.nextSibling);
        }
        updatePaginationUI();
    }

    function updatePaginationUI() {
        if (!DOM.pageInfo) return;
        const btnPrev = document.getElementById('prevPageBtn');
        const btnNext = document.getElementById('nextPageBtn');
        const totalImages = state.imageDatabase.length;

        let start = (state.currentPage - 1) * CONFIG.imagesPerPage + 1;
        let end = Math.min(state.currentPage * CONFIG.imagesPerPage, totalImages);
        if (totalImages === 0) { start = 0; end = 0; }

        let text = getTranslation('page-info');
        text = text.replace('{current}', state.currentPage)
            .replace('{total}', state.totalPages)
            .replace('{start}', start)
            .replace('{end}', end)
            .replace('{totalImages}', totalImages);
        
        DOM.pageInfo.textContent = text;

        if (btnPrev) {
            btnPrev.disabled = state.currentPage === 1;
            btnPrev.style.opacity = state.currentPage === 1 ? '0.5' : '1';
            btnPrev.style.cursor = state.currentPage === 1 ? 'not-allowed' : 'pointer';
        }
        if (btnNext) {
            btnNext.disabled = state.currentPage === state.totalPages || totalImages === 0;
            btnNext.style.opacity = (state.currentPage === state.totalPages || totalImages === 0) ? '0.5' : '1';
            btnNext.style.cursor = (state.currentPage === state.totalPages || totalImages === 0) ? 'not-allowed' : 'pointer';
        }
    }

    function resetIdleTimer() {
        const container = document.querySelector('.slideshow-container');
        if (!container) return;
        container.classList.remove('ui-hidden');
        container.style.cursor = 'default';
        if (state.uiTimeout) clearTimeout(state.uiTimeout);
        state.uiTimeout = setTimeout(() => {
            if (state.isSlideshowActive && !state.isImageZoomed) {
                container.classList.add('ui-hidden');
                container.style.cursor = 'none';
            }
        }, CONFIG.idleTime);
    }

    function openSlideshow(index) {
        state.currentImageIndex = index;
        state.isSlideshowActive = true;
        const currentData = state.imageDatabase[index];
        if (!currentData) return;

        const modal = document.createElement('div');
        modal.className = 'slideshow-modal';
        modal.innerHTML = `
            <div class="slideshow-container">
                <div class="slideshow-image-wrapper">
                    <div class="slideshow-image-container">
                        <img class="slideshow-image" src="" alt="" draggable="false" style="opacity: 0;">
                        <div class="slideshow-loading" style="display: block;">${getTranslation('loading-text')}</div>
                    </div>
                </div>
                <div class="slideshow-header">
                    <div class="slideshow-counter">
                        <span class="current"></span> / <span class="total">${state.imageDatabase.length}</span>
                    </div>
                    <button class="slideshow-close" aria-label="${getTranslation('close')}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <button class="slideshow-nav slideshow-prev" aria-label="${getTranslation('previous')}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button class="slideshow-nav slideshow-next" aria-label="${getTranslation('next')}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <div class="slideshow-footer">
                    <div class="slideshow-info">
                        <h3 class="slideshow-title"></h3>
                        <p class="slideshow-description"></p>
                    </div>
                    <div class="slideshow-controls">
                        <button class="button button--small slideshow-download">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            ${getTranslation('download')}
                        </button>
                        <button class="button button--small button--secondary slideshow-zoom-toggle">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                            ${getTranslation('zoom')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => modal.classList.add('active'));
        bindSlideshowEvents(modal);
        loadSlideshowImage(index);
        resetIdleTimer();
    }

    function bindSlideshowEvents(modal) {
        const container = modal.querySelector('.slideshow-container');
        container.addEventListener('mousemove', resetIdleTimer);
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('slideshow-image-wrapper') || e.target.classList.contains('slideshow-image-container')) {
                container.classList.toggle('ui-hidden');
            }
        });
        modal.querySelector('.slideshow-close').onclick = closeSlideshow;
        modal.querySelector('.slideshow-prev').onclick = (e) => { e.stopPropagation(); prevImage(); };
        modal.querySelector('.slideshow-next').onclick = (e) => { e.stopPropagation(); nextImage(); };
        modal.querySelector('.slideshow-download').onclick = (e) => { e.stopPropagation(); downloadImage(); };
        modal.querySelector('.slideshow-zoom-toggle').onclick = (e) => { e.stopPropagation(); toggleZoom(); };
        document.addEventListener('keydown', handleKeyboard);
        const img = modal.querySelector('.slideshow-image');
        setupImageInteractions(img);
    }

    function closeSlideshow() {
        const modal = document.querySelector('.slideshow-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyboard);
        if (state.uiTimeout) clearTimeout(state.uiTimeout);
        state.isSlideshowActive = false;
        resetZoomState();
    }

    function loadSlideshowImage(index) {
        const data = state.imageDatabase[index];
        if (!data) return;
        resetZoomState();
        const titleEl = document.querySelector('.slideshow-title');
        const descEl = document.querySelector('.slideshow-description');
        const countEl = document.querySelector('.slideshow-counter .current');
        const imgEl = document.querySelector('.slideshow-image');
        const loader = document.querySelector('.slideshow-loading');
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.description;
        if (countEl) countEl.textContent = index + 1;
        if (imgEl && loader) {
            imgEl.style.opacity = '0';
            loader.style.display = 'block';
            const tempImg = new Image();
            tempImg.onload = () => {
                imgEl.src = tempImg.src;
                imgEl.style.opacity = '1';
                loader.style.display = 'none';
            };
            tempImg.onerror = () => { loader.textContent = 'Error loading image'; };
            tempImg.src = data.fullSize;
        }
    }

    function nextImage() { if (state.currentImageIndex < state.imageDatabase.length - 1) loadSlideshowImage(++state.currentImageIndex); }
    function prevImage() { if (state.currentImageIndex > 0) loadSlideshowImage(--state.currentImageIndex); }

    function handleKeyboard(e) {
        if (!state.isSlideshowActive) return;
        if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
        switch (e.key) {
            case 'ArrowRight': nextImage(); break;
            case 'ArrowLeft': prevImage(); break;
            case 'Escape': closeSlideshow(); break;
            case ' ': toggleZoom(); break;
        }
        resetIdleTimer();
    }

    function resetZoomState() {
        state.isImageZoomed = false;
        state.zoomScale = 1;
        state.transform = { x: 0, y: 0, startX: 0, startY: 0, isDragging: false };
        const img = document.querySelector('.slideshow-image');
        if (img) { img.style.transform = ''; img.classList.remove('zoomed'); }
        const btn = document.querySelector('.slideshow-zoom-toggle');
        if (btn) btn.innerHTML = getTranslation('zoom');
    }

    function toggleZoom() {
        if (state.isImageZoomed) { resetZoomState(); } else {
            state.isImageZoomed = true;
            state.zoomScale = 2;
            const img = document.querySelector('.slideshow-image');
            if (img) { img.classList.add('zoomed'); img.style.transform = `scale(${state.zoomScale}) translate(0px, 0px)`; }
            const btn = document.querySelector('.slideshow-zoom-toggle');
            if (btn) btn.innerHTML = getTranslation('zoom-out');
        }
    }

    function setupImageInteractions(img) {
        if (!img) return;
        img.addEventListener('mousedown', (e) => {
            if (!state.isImageZoomed) return;
            e.preventDefault();
            state.transform.isDragging = true;
            state.transform.startX = e.clientX - state.transform.x;
            state.transform.startY = e.clientY - state.transform.y;
            img.style.cursor = 'grabbing';
        });
        window.addEventListener('mousemove', (e) => {
            if (!state.isSlideshowActive || !state.isImageZoomed || !state.transform.isDragging) return;
            e.preventDefault();
            state.transform.x = e.clientX - state.transform.startX;
            state.transform.y = e.clientY - state.transform.startY;
            img.style.transform = `scale(${state.zoomScale}) translate(${state.transform.x}px, ${state.transform.y}px)`;
        });
        window.addEventListener('mouseup', () => {
            if (state.transform.isDragging) { state.transform.isDragging = false; img.style.cursor = 'grab'; }
        });
        img.addEventListener('click', (e) => {
            if (state.transform.isDragging) return;
            e.stopPropagation();
            toggleZoom();
        });
    }

    function downloadImage() {
        const data = state.imageDatabase[state.currentImageIndex];
        if (!data) return;
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            const link = document.createElement('a');
            link.href = data.fullSize;
            link.download = `kuroneko_gallery_${data.id}.jpg`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification(getTranslation('download-success'), 'success');
        } else {
            window.open(data.fullSize, '_blank');
        }
    }

    return {
        init: async function () {
            initIntersectionObserver();
            await initializeData();
        },
        loadPage: loadPage,
        refresh: async function () {
            state.imageDatabase = [];
            state.currentPage = 1;
            state.loadedImages.clear();
            await initializeData();
        },
        addImages: function (newImages) {
            if (Array.isArray(newImages)) {
                state.imageDatabase.push(...newImages);
                state.totalPages = Math.ceil(state.imageDatabase.length / CONFIG.imagesPerPage);
                updatePaginationUI();
            }
        },
        onLanguageChange: function () {
            updatePaginationUI();
            if (state.isSlideshowActive) {
                loadSlideshowImage(state.currentImageIndex);
            }
        },
        openSlideshow: openSlideshow
    };
})();