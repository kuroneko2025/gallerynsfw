// Gallery Module
const Gallery = (function() {
    'use strict';

    // Private variables
    let currentImageIndex = 0;
    const imagesPerLoad = 6;

    // Image data array - Replace with actual content
    const imageDatabase = [
        {
            id: 1,
            title: "NekoCute",
            description: "Huge dildo",
            thumbnail: "https://lh3.googleusercontent.com/rd-d/ALs6j_H4anQIHw3fRTdgx7cY9K6KwLG5sdS_jkLC0b_sQw-lV3re4_2x7zXx2HYIWjMeLCxOKXRan6p-zfiYbyCTabm0Md8Yrvp__HYuIM03MFrhGYdTeZb-NXiaLs2D2g2kwOiA2PIJy_nNO7KsmK-NPjNrwEwnfXFzpixNp_7tvsI0dvhsyWX2Dea1u99f_KQ5ZI4ODkOBsc-F-CsJKDkB3-f49RmxV6Efsst7nI76UcZ697K5XckoDjSLr9oBmsEXDAifnVB48l3tQWxTj43MmICCdhNFwRyO7KzxAv8pu4tnN3_TOtO3UvuFu-Vr72B909Ys7X3FcO3bMV7UypofU5l4MAqX3EmgBgUKJf5YIhxK_m41WbXVe8D-0lo_1Jwmyo9v4p3Et6WBBcdAlqKKN-uJOL9x4hz9XpzDEHeUIK9P_KkQXxtegcEC_-c46O5eAmY0Tvq7VrQ_cbtwHerg4Ch8bj7KQR_t5hQ68FTKIOrKyVA_zkbqBddTAKxr6AyLUisgdDHFy4dEMuOBmJhNDyVXDXKAOfgNbT9_V2kDCoRZIbJ9VHjwX6VpjSdneqJ4XpX40HK__4mS5YI4CeQbbF7AxlvlIWxu8as0jBvCfKyHktxoS6hu8VyA1s7BhpJilTHd-tQhic22vMq39q8PKNmPz42LeFRQNiWPQ_PK7ix4mXnthyL-MUSJEBagpJ2HFxfB85YlQTH3HaK3W-DWglmyGDFJKo-p_2ECIxWcqDsthoGQ4L2lO-_qWbQ7KZYsJ-7_Elc5m4XUpEaFQ_oCIdEMLsGwqHW5C5nV6PqpEBLYr795WIysNu7ARpx0khAwkNQxGvwNQhORuLA01mXp71SzVvFEQDyahHZxP5nzMhmlKeXonXRjp-mnoMiynftUtECotTOH7JtwNkWcFAKbwdyZo9txMGxv8D_b8CtiXR3Z_rwHyYBDMo33enPdtcsZ5k3NGqxXYyRwJqi7efYE_GDkCy-RfD4rs4r2Uniqe3AEzkVjNHZ92rxg5sWkVXvsh3Muxyv9ee62q-elV0fVglLZ9FarN_V8Y1TffSzu4EhxjnSzFacTYNBYOscYQwFFVkTXMTKT=w1910-h922?auditContext=forDisplay",
            fullSize: "https://lh3.googleusercontent.com/rd-d/ALs6j_H4anQIHw3fRTdgx7cY9K6KwLG5sdS_jkLC0b_sQw-lV3re4_2x7zXx2HYIWjMeLCxOKXRan6p-zfiYbyCTabm0Md8Yrvp__HYuIM03MFrhGYdTeZb-NXiaLs2D2g2kwOiA2PIJy_nNO7KsmK-NPjNrwEwnfXFzpixNp_7tvsI0dvhsyWX2Dea1u99f_KQ5ZI4ODkOBsc-F-CsJKDkB3-f49RmxV6Efsst7nI76UcZ697K5XckoDjSLr9oBmsEXDAifnVB48l3tQWxTj43MmICCdhNFwRyO7KzxAv8pu4tnN3_TOtO3UvuFu-Vr72B909Ys7X3FcO3bMV7UypofU5l4MAqX3EmgBgUKJf5YIhxK_m41WbXVe8D-0lo_1Jwmyo9v4p3Et6WBBcdAlqKKN-uJOL9x4hz9XpzDEHeUIK9P_KkQXxtegcEC_-c46O5eAmY0Tvq7VrQ_cbtwHerg4Ch8bj7KQR_t5hQ68FTKIOrKyVA_zkbqBddTAKxr6AyLUisgdDHFy4dEMuOBmJhNDyVXDXKAOfgNbT9_V2kDCoRZIbJ9VHjwX6VpjSdneqJ4XpX40HK__4mS5YI4CeQbbF7AxlvlIWxu8as0jBvCfKyHktxoS6hu8VyA1s7BhpJilTHd-tQhic22vMq39q8PKNmPz42LeFRQNiWPQ_PK7ix4mXnthyL-MUSJEBagpJ2HFxfB85YlQTH3HaK3W-DWglmyGDFJKo-p_2ECIxWcqDsthoGQ4L2lO-_qWbQ7KZYsJ-7_Elc5m4XUpEaFQ_oCIdEMLsGwqHW5C5nV6PqpEBLYr795WIysNu7ARpx0khAwkNQxGvwNQhORuLA01mXp71SzVvFEQDyahHZxP5nzMhmlKeXonXRjp-mnoMiynftUtECotTOH7JtwNkWcFAKbwdyZo9txMGxv8D_b8CtiXR3Z_rwHyYBDMo33enPdtcsZ5k3NGqxXYyRwJqi7efYE_GDkCy-RfD4rs4r2Uniqe3AEzkVjNHZ92rxg5sWkVXvsh3Muxyv9ee62q-elV0fVglLZ9FarN_V8Y1TffSzu4EhxjnSzFacTYNBYOscYQwFFVkTXMTKT=w1910-h922?auditContext=forDisplay"
        }
    ];

    // DOM Elements
    const DOM = {
        galleryGrid: document.getElementById('galleryGrid'),
        loadMoreBtn: document.getElementById('loadMoreBtn')
    };

    // Private methods
    function createImageElement(imageData) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery__item fade-in';
        
        const currentLanguage = document.getElementById('languageSelector').value;
        const descriptionText = `${Utils.translations[currentLanguage]['image-desc']} ${imageData.id}`;

        galleryItem.innerHTML = `
            <img class="gallery__image" src="${imageData.thumbnail}" alt="${imageData.title}">
            <div class="gallery__info">
                <h3 class="gallery__item-title">${imageData.title}</h3>
                <p class="gallery__item-desc">${imageData.description}</p>
            </div>
        `;

        galleryItem.addEventListener('click', function() {
            Modal.show(imageData.fullSize, imageData.title);
        });

        return galleryItem;
    }

    function loadImages(startIndex = 0, count = imagesPerLoad) {
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

    // Public methods
    return {
        init: function() {
            // Load initial images
            loadImages(0, imagesPerLoad);

            // Load more button event
            DOM.loadMoreBtn.addEventListener('click', function() {
                loadImages(currentImageIndex, imagesPerLoad);
            });
        },

        // Public API for adding images dynamically
        addImages: function(newImages) {
            imageDatabase.push(...newImages);
        },

        // Refresh gallery with new translations
        refresh: function() {
            // Clear existing gallery
            DOM.galleryGrid.innerHTML = '';
            currentImageIndex = 0;
            
            // Reload images with updated translations
            loadImages(0, imagesPerLoad);
            
            // Show load more button if it was hidden
            DOM.loadMoreBtn.style.display = 'block';
        },

        // Get current stats
        getStats: function() {
            return {
                totalImages: imageDatabase.length,
                loadedImages: currentImageIndex
            };
        }
    };
})();