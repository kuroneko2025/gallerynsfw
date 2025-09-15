// Shop Module
const Shop = (function() {
    'use strict';

    // Private variables
    let products = [];
    const scriptUrl = 'https://script.google.com/macros/s/AKfycby_GmDeWidXU8VjFSJ_3ABiNw6stgn-IJqZUJF0Jzb29XZi_s8He4fzoke2y4T8OcjP/exec?hoja=Hoja%202'; // Reemplazar con tu URL

    // DOM Elements
    const DOM = {
        shopGrid: document.getElementById('shopGrid'),
        shopLoading: document.getElementById('shopLoading'),
        shopEmpty: document.getElementById('shopEmpty')
    };

    // Private methods
    async function fetchProducts() {
        try {
            const response = await fetch(scriptUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain; charset=utf-8'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const textData = await response.text();
            return parseProductsData(textData);
        } catch (error) {
            console.error('Error fetching products:', error);
            return getFallbackProducts();
        }
    }

    function parseProductsData(textData) {
        const products = [];
        const lines = textData.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
            const parts = line.split('|');
            if (parts.length >= 6) { // ID|Title|Description|Price|Image|Original
                products.push({
                    id: parseInt(parts[0]) || Date.now(),
                    title: parts[1] || '...',
                    description: parts[2] || '...',
                    price: parts[3] || '$0',
                    image: parts[4] || '../assets/img/img1.png',
                    original: parts[5] || '../assets/img/img1.png'
                });
            }
        }
        
        return products;
    }

    function getFallbackProducts() {
        return [
            {
                id: 1,
                title: "...",
                description: "...",
                price: "---",
                image: "../assets/img/img1.png",
                original: "../assets/img/img1.png"
            }
        ];
    }

    function showLoading() {
        DOM.shopLoading.style.display = 'flex';
        DOM.shopGrid.innerHTML = '';
        DOM.shopEmpty.style.display = 'none';
    }

    function hideLoading() {
        DOM.shopLoading.style.display = 'none';
    }

    function showEmptyState() {
        DOM.shopEmpty.style.display = 'block';
    }

    function hideEmptyState() {
        DOM.shopEmpty.style.display = 'none';
    }

    function createProductElement(product) {
        const productDiv = document.createElement('div');
        productDiv.className = 'shop__item fade-in';

        // Escapar comillas para evitar problemas en el innerHTML
        const safeTitle = product.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safeDescription = product.description.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        productDiv.innerHTML = `
            <img class="shop__image" src="${product.image}" alt="${safeTitle}" loading="lazy">
            <div class="shop__info">
                <h3 class="shop__item-title">${safeTitle}</h3>
                <p class="shop__item-desc">${safeDescription}</p>
                <div class="shop__item-price">${product.price}</div>
                <div class="shop__actions">
                    <button class="shop__btn shop__btn--primary" onclick="Shop.viewProduct('${product.original}', '${safeTitle}')">
                        ${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['view-details'] || 'Ver Detalles'}
                    </button>
                    <button class="shop__btn shop__btn--secondary" onclick="Contact.open(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        ${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['contact'] || 'Contactar'}
                    </button>
                </div>
            </div>
        `;
        
        return productDiv;
    }

    function renderProducts(productsList) {
        DOM.shopGrid.innerHTML = '';
        
        if (productsList.length > 0) {
            productsList.forEach(product => {
                const productElement = createProductElement(product);
                DOM.shopGrid.appendChild(productElement);
            });
            hideEmptyState();
        } else {
            showEmptyState();
        }
    }

    // Public methods
    return {
        init: async function() {
            showLoading();
            
            try {
                products = await fetchProducts();
                renderProducts(products);
            } catch (error) {
                console.error('Error initializing shop:', error);
                products = getFallbackProducts();
                renderProducts(products);
            }
            
            hideLoading();
        },

        refresh: function() {
            this.init();
        },

        viewProduct: function(imageUrl, title) {
            Modal.show(imageUrl, title);
        },

        getProducts: function() {
            return products;
        },

        setScriptUrl: function(url) {
            scriptUrl = url;
        }
    };
})();