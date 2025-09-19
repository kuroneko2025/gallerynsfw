const Modal = (function () {
    'use strict';
    let isImageZoomed = !1;
    let currentImageSrc = '';
    let currentImageName = '';
    let posX = 0, posY = 0;
    let startX = 0, startY = 0;
    let isDragging = false;

    const DOM = {
        imageModal: document.getElementById('imageModal'),
        modalImage: document.getElementById('modalImage'),
        modalClose: document.getElementById('modalClose'),
        downloadBtn: document.getElementById('downloadBtn'),
        zoomBtn: document.getElementById('zoomBtn')
    };

    function startDrag(e) {
        isDragging = true;
        DOM.modalImage.classList.add('dragging');
        startX = e.clientX - posX;
        startY = e.clientY - posY;
    }

    function endDrag() {
        isDragging = false;
        DOM.modalImage.classList.remove('dragging');
    }

    function toggleImageZoom() {
        isImageZoomed = !isImageZoomed;

        if (isImageZoomed) {
            DOM.modalImage.classList.add('modal__image--zoomed');
            DOM.modalImage.style.transform = `scale(2) translate(0px, 0px)`; // zoom inicial
            posX = posY = 0;

            DOM.zoomBtn.textContent = Utils.translations[KuronekoApp.getCurrentLanguage()]['zoom-out'] || 'Reducir';

            enableImagePan();
        } else {
            DOM.modalImage.classList.remove('modal__image--zoomed');
            DOM.modalImage.style.transform = '';
            DOM.zoomBtn.textContent = Utils.translations[KuronekoApp.getCurrentLanguage()].zoom || 'Zoom';

            disableImagePan();
        }
    }

    function enableImagePan() {
        // Teclado (flechas)
        document.addEventListener('keydown', handleArrowKeys);

        // Mouse drag
        DOM.modalImage.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);

        // Touch
        DOM.modalImage.addEventListener('touchstart', startTouch, { passive: false });
        DOM.modalImage.addEventListener('touchmove', onTouchMove, { passive: false });
        DOM.modalImage.addEventListener('touchend', endTouch);
    }

    function disableImagePan() {
        document.removeEventListener('keydown', handleArrowKeys);
        DOM.modalImage.removeEventListener('mousedown', startDrag);
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);
        DOM.modalImage.removeEventListener('touchstart', startTouch);
        DOM.modalImage.removeEventListener('touchmove', onTouchMove);
        DOM.modalImage.removeEventListener('touchend', endTouch);
    }

    function handleArrowKeys(e) {
        const step = 20; // píxeles por pulsación
        if (e.key === 'ArrowUp') posY += step;
        if (e.key === 'ArrowDown') posY -= step;
        if (e.key === 'ArrowLeft') posX += step;
        if (e.key === 'ArrowRight') posX -= step;
        updateTransform();
    }

    function onDrag(e) {
        if (!isDragging) return;
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        updateTransform();
    }

    function startTouch(e) {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX - posX;
            startY = e.touches[0].clientY - posY;
        }
    }

    function onTouchMove(e) {
        if (e.touches.length === 1) {
            e.preventDefault(); // evita scroll de la página
            posX = e.touches[0].clientX - startX;
            posY = e.touches[0].clientY - startY;
            updateTransform();
        }
    }

    function endTouch() {
        // nada especial por ahora
    }

    function updateTransform() {
        DOM.modalImage.style.transform = `scale(2) translate(${posX}px, ${posY}px)`;
    }


    function hideModal() {
        DOM.imageModal.classList.remove('modal--active');
        document.body.style.overflow = 'auto';
        isImageZoomed = !1;
        DOM.modalImage.classList.remove('modal__image--zoomed');
        DOM.zoomBtn.textContent = Utils.translations[KuronekoApp.getCurrentLanguage()].zoom || 'Zoom'
    }

    function downloadImage() {
        if (!currentImageSrc) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = currentImageSrc;
        img.onload = function () {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(function (blob) {
                    if (!blob) {
                        console.error('No se pudo generar el blob de la imagen');
                        showDownloadOptions();
                        return
                    }
                    const fileName = `kuroneko-image-${Date.now()}.jpg`;
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url)
                    }, 100);
                    showDownloadNotification()
                }, 'image/jpeg', 0.95)
            } catch (error) {
                console.error('Error al procesar la imagen:', error);
                showDownloadOptions()
            }
        };
        img.onerror = function () {
            console.error('No se pudo cargar la imagen para descarga directa');
            showDownloadOptions()
        }
    }

    function showDownloadOptions() {
        const downloadModal = document.createElement('div');
        downloadModal.className = 'download-options-modal';
        downloadModal.innerHTML = `
            <div class="download-options__content">
                <h3>${Utils.translations[KuronekoApp.getCurrentLanguage()]['download-options'] || 'Opciones de descarga'}</h3>
                <p>${Utils.translations[KuronekoApp.getCurrentLanguage()]['download-restricted'] || 'No se puede descargar directamente debido a restricciones del servidor.'}</p>
                <div class="download-options__buttons">
                    <button class="btn btn--secondary" id="openInNewTab">
                        ${Utils.translations[KuronekoApp.getCurrentLanguage()]['open-tab'] || 'Abrir en nueva pestaña'}
                    </button>
                    <button class="btn" id="copyImageLink">
                        ${Utils.translations[KuronekoApp.getCurrentLanguage()]['copy-link'] || 'Copiar enlace'}
                    </button>
                    <button class="btn btn--danger" id="closeDownloadOptions">
                        ${Utils.translations[KuronekoApp.getCurrentLanguage()]['close'] || 'Cerrar'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(downloadModal);
        document.getElementById('openInNewTab').addEventListener('click', function () {
            window.open(currentImageSrc, '_blank');
            document.body.removeChild(downloadModal)
        });
        document.getElementById('copyImageLink').addEventListener('click', function () {
            navigator.clipboard.writeText(currentImageSrc).then(() => {
                showCopySuccessNotification();
                document.body.removeChild(downloadModal)
            }).catch(err => {
                console.error('Error copying text: ', err);
                showCopyErrorNotification()
            })
        });
        document.getElementById('closeDownloadOptions').addEventListener('click', function () {
            document.body.removeChild(downloadModal)
        });
        downloadModal.addEventListener('click', function (e) {
            if (e.target === downloadModal) {
                document.body.removeChild(downloadModal)
            }
        })
    }

    function showDownloadNotification() {
        const notification = document.createElement('div');
        notification.className = 'download-notification download-notification--success';
        notification.innerHTML = `
            <span>${Utils.translations[KuronekoApp.getCurrentLanguage()]['download-success'] || 'Descarga completada'}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('download-notification--show')
        }, 10);
        setTimeout(() => {
            notification.classList.remove('download-notification--show');
            setTimeout(() => {
                document.body.removeChild(notification)
            }, 300)
        }, 3000)
    }

    function showCopySuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'download-notification download-notification--success';
        notification.innerHTML = `
            <span>${Utils.translations[KuronekoApp.getCurrentLanguage()]['copy-success'] || 'Enlace copiado al portapapeles'}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('download-notification--show')
        }, 10);
        setTimeout(() => {
            notification.classList.remove('download-notification--show');
            setTimeout(() => {
                document.body.removeChild(notification)
            }, 300)
        }, 3000)
    }

    function showCopyErrorNotification() {
        const notification = document.createElement('div');
        notification.className = 'download-notification download-notification--error';
        notification.innerHTML = `
            <span>${Utils.translations[KuronekoApp.getCurrentLanguage()]['copy-error'] || 'Error al copiar el enlace'}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('download-notification--show')
        }, 10);
        setTimeout(() => {
            notification.classList.remove('download-notification--show');
            setTimeout(() => {
                document.body.removeChild(notification)
            }, 300)
        }, 3000)
    }
    return {
        init: function () {
            DOM.modalClose.addEventListener('click', hideModal);
            DOM.modalImage.addEventListener('click', toggleImageZoom);
            DOM.downloadBtn.addEventListener('click', downloadImage);
            DOM.zoomBtn.addEventListener('click', toggleImageZoom);
            DOM.imageModal.addEventListener('click', function (e) {
                if (e.target === DOM.imageModal) {
                    hideModal()
                }
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    hideModal()
                }
            })
        },
        show: function (imageSrc, imageTitle = '') {
            currentImageSrc = imageSrc;
            currentImageName = imageTitle;
            DOM.modalImage.src = imageSrc;
            DOM.modalImage.alt = imageTitle;
            DOM.imageModal.classList.add('modal--active');
            document.body.style.overflow = 'hidden';
            isImageZoomed = !1;
            DOM.modalImage.classList.remove('modal__image--zoomed');
            DOM.zoomBtn.textContent = Utils.translations[KuronekoApp.getCurrentLanguage()].zoom || 'Zoom'
        }
    }
})()