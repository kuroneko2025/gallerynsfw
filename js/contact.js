// Contact Module
const Contact = (function () {
    'use strict';

    let currentProduct = null;

    const DOM = {
        contactModal: document.getElementById('contactModal'),
        contactForm: document.getElementById('contactForm'),
        contactModalClose: document.getElementById('contactModalClose'),
        contactCancel: document.getElementById('contactCancel'),
        contactSubmit: document.getElementById('contactSubmit'),
        contactProductTitle: document.getElementById('contactProductTitle'),
        contactProductId: document.getElementById('contactProductId'),
        contactProductName: document.getElementById('contactProductName')
    };

    function showModal(product) {
        if (!product || !product.title || !product.id) {
            console.error('Producto inválido para el formulario de contacto');
            return;
        }

        currentProduct = product;

        DOM.contactProductTitle.textContent = product.title;
        DOM.contactProductId.value = product.id;
        DOM.contactProductName.value = product.title;

        DOM.contactModal.classList.add('modal--active');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        DOM.contactModal.classList.remove('modal--active');
        document.body.style.overflow = 'auto';
        DOM.contactForm.reset();
        currentProduct = null;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (DOM.contactSubmit.classList.contains('btn--loading')) return; // evitar doble envío

        // Activar estado loading
        DOM.contactSubmit.classList.add('btn--loading');

        const formData = new FormData(DOM.contactForm);
        const formDataObj = Object.fromEntries(formData.entries());

        try {
            await sendEmail(formDataObj);
            showNotification('success');
            hideModal();
        } catch (error) {
            console.error('Error enviando el mensaje:', error);
            showNotification('error');
        } finally {
            // Desactivar estado loading
            DOM.contactSubmit.classList.remove('btn--loading');
        }
    }


    async function sendEmail(formData) {
        // Aquí podrías alternar entre EmailJS o Google Apps Script
        return sendViaGoogleAppsScript(formData);
    }

    async function sendViaGoogleAppsScript(formData) {
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbyPEBhS2XhAEt7XBhnzoFFyIEEtyAwh4XLRqjrejy-Fmk1Y3v0Ek5i8HL8Ar4-QfoL3/exec';

        // Usamos URLSearchParams para enviar como texto plano tipo formulario
        const params = new URLSearchParams();
        params.append('subject', `Contacto sobre: ${formData.productName}`);
        params.append('name', formData.name);
        params.append('email', formData.email);
        params.append('message', formData.message);
        params.append('product', formData.productName);
        params.append('productId', formData.productId);

        const response = await fetch(scriptUrl, {
            method: 'POST',
            body: params
        });

        if (!response.ok) throw new Error('Error en la solicitud');

        return response.json();
    }


    function showNotification(type) {
        // Eliminar notificaciones previas
        document.querySelectorAll('.download-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `download-notification download-notification--${type}`;
        notification.innerHTML = `
            <span>${Utils.translations[KuronekoApp.getCurrentLanguage()]?.[`contact-${type}`] ||
            (type === 'success'
                ? 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.'
                : 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.')
            }</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('download-notification--show'), 10);
        setTimeout(() => {
            notification.classList.remove('download-notification--show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    return {
        init: function () {
            if (!DOM.contactForm) {
                console.error('Formulario de contacto no encontrado');
                return;
            }

            DOM.contactForm.addEventListener('submit', handleSubmit);
            DOM.contactModalClose?.addEventListener('click', hideModal);
            DOM.contactCancel?.addEventListener('click', hideModal);

            DOM.contactModal.addEventListener('click', e => {
                if (e.target === DOM.contactModal) hideModal();
            });

            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && DOM.contactModal.classList.contains('modal--active')) {
                    hideModal();
                }
            });
        },

        open: showModal,
        close: hideModal
    };
})();
