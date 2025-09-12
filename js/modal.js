// Modal Module
const Modal = (function () {
    'use strict';

    // Private variables
    let isImageZoomed = false;
    let currentImageSrc = '';
    let currentImageName = '';

    // DOM Elements
    const DOM = {
        imageModal: document.getElementById('imageModal'),
        modalImage: document.getElementById('modalImage'),
        modalClose: document.getElementById('modalClose'),
        downloadBtn: document.getElementById('downloadBtn'),
        zoomBtn: document.getElementById('zoomBtn')
    };

    // Private methods
    function toggleImageZoom() {
        isImageZoomed = !isImageZoomed;
        if (isImageZoomed) {
            DOM.modalImage.classList.add('modal__image--zoomed');
            DOM.zoomBtn.textContent = Utils.translations[KuronekoApp.getCurrentLanguage()]['zoom-out'] || 'Reducir';
        } else {
            DOM.modalImage.classList.remove('modal__image--zoomed');
            DOM.zoomBtn.textContent = Utils.translations[KuronekoApp.getCurrentLanguage()]['zoom'] || 'Zoom';
        }
    }

    function hideModal() {
        DOM.imageModal.classList.remove('modal--active');
        document.body.style.overflow = 'auto';
        isImageZoomed = false;
        DOM.modalImage.classList.remove('modal__image--zoomed');
        DOM.zoomBtn.textContent = Utils.translations[KuronekoApp.getCurrentLanguage()]['zoom'] || 'Zoom';
    }

    function downloadImage() {
        if (!currentImageSrc) return;

        const img = new Image();
        img.crossOrigin = 'anonymous'; // Intentar evitar problemas CORS si el servidor lo permite
        img.src = currentImageSrc;

        img.onload = function () {
            try {
                // Crear canvas temporal
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Convertir a Blob y descargar
                canvas.toBlob(function (blob) {
                    if (!blob) {
                        console.error('No se pudo generar el blob de la imagen');
                        showDownloadOptions();
                        return;
                    }

                    const fileName = `kuroneko-image-${Date.now()}.jpg`;
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();

                    // Limpieza
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 100);

                    showDownloadNotification();
                }, 'image/jpeg', 0.95); // Calidad 95%
            } catch (error) {
                console.error('Error al procesar la imagen:', error);
                showDownloadOptions();
            }
        };

        img.onerror = function () {
            console.error('No se pudo cargar la imagen para descarga directa');
            showDownloadOptions();
        };
    }


    function showDownloadOptions() {
        // Crear modal de opciones de descarga
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

        // Event listeners para los botones
        document.getElementById('openInNewTab').addEventListener('click', function () {
            window.open(currentImageSrc, '_blank');
            document.body.removeChild(downloadModal);
        });

        document.getElementById('copyImageLink').addEventListener('click', function () {
            navigator.clipboard.writeText(currentImageSrc).then(() => {
                showCopySuccessNotification();
                document.body.removeChild(downloadModal);
            }).catch(err => {
                console.error('Error copying text: ', err);
                showCopyErrorNotification();
            });
        });

        document.getElementById('closeDownloadOptions').addEventListener('click', function () {
            document.body.removeChild(downloadModal);
        });

        // Cerrar al hacer clic fuera del contenido
        downloadModal.addEventListener('click', function (e) {
            if (e.target === downloadModal) {
                document.body.removeChild(downloadModal);
            }
        });
    }

    function showDownloadNotification() {
        // Crear notificación de descarga exitosa
        const notification = document.createElement('div');
        notification.className = 'download-notification download-notification--success';
        notification.innerHTML = `
            <span>${Utils.translations[KuronekoApp.getCurrentLanguage()]['download-success'] || 'Descarga completada'}</span>
        `;

        document.body.appendChild(notification);

        // Mostrar y luego eliminar la notificación
        setTimeout(() => {
            notification.classList.add('download-notification--show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('download-notification--show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    function showCopySuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'download-notification download-notification--success';
        notification.innerHTML = `
            <span>${Utils.translations[KuronekoApp.getCurrentLanguage()]['copy-success'] || 'Enlace copiado al portapapeles'}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('download-notification--show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('download-notification--show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    function showCopyErrorNotification() {
        const notification = document.createElement('div');
        notification.className = 'download-notification download-notification--error';
        notification.innerHTML = `
            <span>${Utils.translations[KuronekoApp.getCurrentLanguage()]['copy-error'] || 'Error al copiar el enlace'}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('download-notification--show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('download-notification--show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Public methods
    return {
        init: function () {
            // Modal events
            DOM.modalClose.addEventListener('click', hideModal);
            DOM.modalImage.addEventListener('click', toggleImageZoom);
            DOM.downloadBtn.addEventListener('click', downloadImage);
            DOM.zoomBtn.addEventListener('click', toggleImageZoom);

            DOM.imageModal.addEventListener('click', function (e) {
                if (e.target === DOM.imageModal) {
                    hideModal();
                }
            });

            // Keyboard events
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    hideModal();
                }
            });
        },

        show: function (imageSrc, imageTitle = '') {
            currentImageSrc = imageSrc;
            currentImageName = imageTitle;
            DOM.modalImage.src = imageSrc;
            DOM.modalImage.alt = imageTitle;
            DOM.imageModal.classList.add('modal--active');
            document.body.style.overflow = 'hidden';
            isImageZoomed = false;
            DOM.modalImage.classList.remove('modal__image--zoomed');

            // Actualizar texto del botón de zoom
            DOM.zoomBtn.textContent = Utils.translations[KuronekoApp.getCurrentLanguage()]['zoom'] || 'Zoom';
        }
    };
})();