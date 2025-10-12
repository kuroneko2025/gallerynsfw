const Modal=(function(){'use strict';let isImageZoomed=!1;let currentImageSrc='';let currentImageName='';let posX=0,posY=0;let startX=0,startY=0;let isDragging=!1;const DOM={imageModal:document.getElementById('imageModal'),modalImage:document.getElementById('modalImage'),modalClose:document.getElementById('modalClose'),downloadBtn:document.getElementById('downloadBtn'),zoomBtn:document.getElementById('zoomBtn')};function validateDOM(){const requiredElements=['imageModal','modalImage','modalClose','downloadBtn','zoomBtn'];for(const element of requiredElements){if(!DOM[element]){console.error(`Modal: Elemento ${element} no encontrado en el DOM`);return!1}}
return!0}
function startDrag(e){if(!isImageZoomed)return;isDragging=!0;DOM.modalImage.classList.add('modal__image--zoomed--dragging');startX=e.clientX-posX;startY=e.clientY-posY}
function endDrag(){isDragging=!1;DOM.modalImage.classList.remove('modal__image--zoomed--dragging')}
function resetImageZoom(){isImageZoomed=!1;posX=posY=0;if(DOM.modalImage){DOM.modalImage.classList.remove('modal__image--zoomed','modal__image--zoomed--dragging');DOM.modalImage.style.transform=''}
if(DOM.zoomBtn){DOM.zoomBtn.textContent=Utils.translations[KuronekoApp.getCurrentLanguage()]?.zoom||'Zoom'}
disableImagePan()}
function openImage(src,name){currentImageSrc=src;currentImageName=name;resetImageZoom();if(DOM.modalImage){DOM.modalImage.src=src;DOM.modalImage.alt=name||'Imagen ampliada'}
if(DOM.imageModal){DOM.imageModal.style.display='flex';setTimeout(()=>{DOM.imageModal.classList.add('modal--active')},10)}
document.body.style.overflow='hidden'}
function toggleImageZoom(){if(!DOM.imageModal||!DOM.imageModal.classList.contains('modal--active'))return;isImageZoomed=!isImageZoomed;if(isImageZoomed){DOM.modalImage.classList.add('modal__image--zoomed');DOM.modalImage.style.transform=`scale(2) translate(0px, 0px)`;posX=posY=0;if(DOM.zoomBtn){DOM.zoomBtn.textContent=Utils.translations[KuronekoApp.getCurrentLanguage()]?.['zoom-out']||'Reducir'}
enableImagePan()}else{resetImageZoom()}}
function hideModal(){if(DOM.imageModal){DOM.imageModal.classList.remove('modal--active');setTimeout(()=>{if(DOM.imageModal){DOM.imageModal.style.display='none'}
setTimeout(()=>{if(DOM.modalImage){DOM.modalImage.src='';DOM.modalImage.alt='Imagen ampliada'}},100)},300)}
document.body.style.overflow='auto';resetImageZoom()}
function enableImagePan(){document.addEventListener('keydown',handleArrowKeys);if(DOM.modalImage){DOM.modalImage.addEventListener('mousedown',startDrag)}
document.addEventListener('mousemove',onDrag);document.addEventListener('mouseup',endDrag);if(DOM.modalImage){DOM.modalImage.addEventListener('touchstart',startTouch,{passive:!1});DOM.modalImage.addEventListener('touchmove',onTouchMove,{passive:!1});DOM.modalImage.addEventListener('touchend',endTouch)}}
function disableImagePan(){document.removeEventListener('keydown',handleArrowKeys);if(DOM.modalImage){DOM.modalImage.removeEventListener('mousedown',startDrag)}
document.removeEventListener('mousemove',onDrag);document.removeEventListener('mouseup',endDrag);if(DOM.modalImage){DOM.modalImage.removeEventListener('touchstart',startTouch);DOM.modalImage.removeEventListener('touchmove',onTouchMove);DOM.modalImage.removeEventListener('touchend',endTouch)}}
function handleArrowKeys(e){if(!isImageZoomed)return;const step=20;if(e.key==='ArrowUp')posY+=step;if(e.key==='ArrowDown')posY-=step;if(e.key==='ArrowLeft')posX+=step;if(e.key==='ArrowRight')posX-=step;updateTransform()}
function onDrag(e){if(!isDragging||!isImageZoomed)return;posX=e.clientX-startX;posY=e.clientY-startY;updateTransform()}
function startTouch(e){if(e.touches.length===1&&isImageZoomed){startX=e.touches[0].clientX-posX;startY=e.touches[0].clientY-posY}}
function onTouchMove(e){if(e.touches.length===1&&isImageZoomed){e.preventDefault();posX=e.touches[0].clientX-startX;posY=e.touches[0].clientY-startY;updateTransform()}}
function endTouch(){}
function updateTransform(){if(DOM.modalImage){DOM.modalImage.style.transform=`scale(2) translate(${posX}px, ${posY}px)`}}
function downloadImage(){if(!currentImageSrc)return;const img=new Image();img.crossOrigin='anonymous';img.src=currentImageSrc;img.onload=function(){try{const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);canvas.toBlob(function(blob){if(!blob){console.error('No se pudo generar el blob de la imagen');showDownloadOptions();return}
const fileName=`kuroneko-image-${Date.now()}.jpg`;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.style.display='none';a.href=url;a.download=fileName;document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url)},100);showDownloadNotification()},'image/jpeg',0.95)}catch(error){console.error('Error al procesar la imagen:',error);showDownloadOptions()}};img.onerror=function(){console.error('No se pudo cargar la imagen para descarga directa');showDownloadOptions()}}
function showDownloadOptions(){const downloadModal=document.createElement('div');downloadModal.className='download-options-modal';downloadModal.innerHTML=`
            <div class="download-options__content">
                <h3>${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['download-options'] || 'Opciones de descarga'}</h3>
                <p>${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['download-restricted'] || 'No se puede descargar directamente debido a restricciones del servidor.'}</p>
                <div class="download-options__buttons">
                    <button class="button button--secondary" id="openInNewTab">
                        ${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['open-tab'] || 'Abrir en nueva pestaña'}
                    </button>
                    <button class="button" id="copyImageLink">
                        ${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['copy-link'] || 'Copiar enlace'}
                    </button>
                    <button class="button button--danger" id="closeDownloadOptions">
                        ${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['close'] || 'Cerrar'}
                    </button>
                </div>
            </div>
        `;document.body.appendChild(downloadModal);const openInNewTabBtn=document.getElementById('openInNewTab');const copyImageLinkBtn=document.getElementById('copyImageLink');const closeDownloadOptionsBtn=document.getElementById('closeDownloadOptions');if(openInNewTabBtn){openInNewTabBtn.addEventListener('click',function(){window.open(currentImageSrc,'_blank');document.body.removeChild(downloadModal)})}
if(copyImageLinkBtn){copyImageLinkBtn.addEventListener('click',function(){navigator.clipboard.writeText(currentImageSrc).then(()=>{showCopySuccessNotification();document.body.removeChild(downloadModal)}).catch(err=>{console.error('Error copying text: ',err);showCopyErrorNotification()})})}
if(closeDownloadOptionsBtn){closeDownloadOptionsBtn.addEventListener('click',function(){document.body.removeChild(downloadModal)})}
downloadModal.addEventListener('click',function(e){if(e.target===downloadModal){document.body.removeChild(downloadModal)}})}
function showDownloadNotification(){const notification=document.createElement('div');notification.className='download-notification download-notification--success';notification.innerHTML=`
            <span>${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['download-success'] || 'Descarga completada'}</span>
        `;document.body.appendChild(notification);setTimeout(()=>{notification.classList.add('download-notification--show')},10);setTimeout(()=>{notification.classList.remove('download-notification--show');setTimeout(()=>{if(notification.parentNode){document.body.removeChild(notification)}},300)},3000)}
function showCopySuccessNotification(){const notification=document.createElement('div');notification.className='download-notification download-notification--success';notification.innerHTML=`
            <span>${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['copy-success'] || 'Enlace copiado al portapapeles'}</span>
        `;document.body.appendChild(notification);setTimeout(()=>{notification.classList.add('download-notification--show')},10);setTimeout(()=>{notification.classList.remove('download-notification--show');setTimeout(()=>{if(notification.parentNode){document.body.removeChild(notification)}},300)},3000)}
function showCopyErrorNotification(){const notification=document.createElement('div');notification.className='download-notification download-notification--error';notification.innerHTML=`
            <span>${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['copy-error'] || 'Error al copiar el enlace'}</span>
        `;document.body.appendChild(notification);setTimeout(()=>{notification.classList.add('download-notification--show')},10);setTimeout(()=>{notification.classList.remove('download-notification--show');setTimeout(()=>{if(notification.parentNode){document.body.removeChild(notification)}},300)},3000)}
return{init:function(){if(!validateDOM()){console.error('Modal: No se pudo inicializar debido a elementos faltantes en el DOM');return}
DOM.imageModal.style.display='none';DOM.modalClose.addEventListener('click',hideModal);DOM.modalImage.addEventListener('click',toggleImageZoom);DOM.downloadBtn.addEventListener('click',downloadImage);DOM.zoomBtn.addEventListener('click',toggleImageZoom);DOM.imageModal.addEventListener('click',function(e){if(e.target===DOM.imageModal){hideModal()}});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&DOM.imageModal.classList.contains('modal--active')){hideModal()}});},show:function(imageSrc,imageTitle=''){if(!validateDOM()){console.error('Modal: No se puede mostrar - elementos del DOM no disponibles');return}
currentImageSrc=imageSrc;currentImageName=imageTitle;openImage(imageSrc,imageTitle)},isActive:function(){return DOM.imageModal&&DOM.imageModal.classList.contains('modal--active')},forceClose:function(){if(DOM.imageModal){DOM.imageModal.classList.remove('modal--active');DOM.imageModal.style.display='none'}
document.body.style.overflow='auto';resetImageZoom();if(DOM.modalImage){DOM.modalImage.src='';DOM.modalImage.alt='Imagen ampliada'}}}})()