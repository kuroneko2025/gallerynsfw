const Shop = (function() {
    'use strict';
    
    let products = [];
    let isInitialized = false;
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbz_qyx41EtXTclnOi7xpFZtJTx36jO8iJwu8Qk5GJnwu4_Pg2BG2O9CxDbhqkeAqrEe/exec?hoja=Hoja%202';
    
    const DOM = {
        shopGrid: document.getElementById('shopGrid'),
        shopLoading: document.getElementById('shopLoading'),
        shopEmpty: document.getElementById('shopEmpty')
    };

    async function fetchProducts() {
        try {
            const cacheKey = 'shop-products-cache';
            const cacheTime = 'shop-products-cache-time';
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;
            
            // Verificar cache
            const cachedData = localStorage.getItem(cacheKey);
            const cacheTimestamp = localStorage.getItem(cacheTime);
            
            if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < oneHour) {
                return JSON.parse(cachedData);
            }
            
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
            console.log('Datos recibidos de Hoja 2:', textData);
            
            const productsData = parseProductsData(textData);
            
            // Guardar en cache
            localStorage.setItem(cacheKey, JSON.stringify(productsData));
            localStorage.setItem(cacheTime, now.toString());
            
            return productsData;
            
        } catch (error) {
            console.error('Error fetching products:', error);
            return getFallbackProducts();
        }
    }

    function parseProductsData(textData) {
        const products = [];
        const lines = textData.split('\n').filter(line => line.trim() !== '');
        
        console.log(`Procesando ${lines.length} líneas de datos`);
        
        for (const line of lines) {
            const parts = line.split('|');
            console.log('Partes de la línea:', parts);
            
            // Estructura esperada: ID|Título|Descripción|Precio|URL_Imagen|URL_Imagen (duplicado)
            if (parts.length >= 6) {
                const product = {
                    id: parseInt(parts[0]) || Date.now() + Math.random(),
                    title: parts[1]?.trim() || 'Producto sin título',
                    description: parts[2]?.trim() || 'Descripción no disponible',
                    price: parts[3]?.trim() || '$0',
                    image: parts[4]?.trim() || '../assets/img/img1.png',
                    original: parts[5]?.trim() || '../assets/img/img1.png'
                };
                
                // Validar que tenga al menos título e imagen
                if (product.title && product.image) {
                    products.push(product);
                    console.log('Producto agregado:', product);
                }
            } else if (parts.length >= 1 && parts[0].trim() !== '') {
                console.warn('Línea con formato incompleto:', parts);
            }
        }
        
        console.log(`Total de productos procesados: ${products.length}`);
        return products;
    }

    function getFallbackProducts() {
        return [{
            id: 1,
            title: "Producto de Ejemplo",
            description: "Este es un producto de ejemplo para cuando no hay datos disponibles",
            price: "$99.99",
            image: "../assets/img/img1.png",
            original: "../assets/img/img1.png"
        }];
    }

    function showLoading() {
        if (DOM.shopLoading) {
            DOM.shopLoading.style.display = 'flex';
        }
        if (DOM.shopGrid) {
            DOM.shopGrid.innerHTML = '';
        }
        if (DOM.shopEmpty) {
            DOM.shopEmpty.style.display = 'none';
        }
    }

    function hideLoading() {
        if (DOM.shopLoading) {
            DOM.shopLoading.style.display = 'none';
        }
    }

    function showEmptyState() {
        if (DOM.shopEmpty) {
            DOM.shopEmpty.style.display = 'block';
        }
        if (DOM.shopGrid) {
            DOM.shopGrid.innerHTML = '';
        }
    }

    function hideEmptyState() {
        if (DOM.shopEmpty) {
            DOM.shopEmpty.style.display = 'none';
        }
    }

    function createProductElement(product) {
        const productDiv = document.createElement('div');
        productDiv.className = 'shop__item fade-in';

        const safeTitle = Utils.escapeHtml(product.title);
        const safeDescription = Utils.escapeHtml(product.description);

        productDiv.innerHTML = `
            <img class="shop__image" src="${product.image}" alt="${safeTitle}" loading="lazy" 
                 onerror="this.src='../assets/img/img1.png'">
            <div class="shop__info">
                <h3 class="shop__item-title">${safeTitle}</h3>
                <p class="shop__item-desc">${safeDescription}</p>
                <div class="shop__item-price">${product.price}</div>
                <div class="shop__actions">
                    <button class="shop__button shop__button--primary" data-action="view" data-product-id="${product.id}">
                        ${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['view-details'] || 'Ver Detalles'}
                    </button>
                    <button class="shop__button shop__button--secondary" data-action="contact" data-product-id="${product.id}" data-product-title="${safeTitle}">
                        ${Utils.translations[KuronekoApp.getCurrentLanguage()]?.['contact'] || 'Contactar'}
                    </button>
                </div>
            </div>
        `;

        return productDiv;
    }

    function setupProductEvents() {
        if (!DOM.shopGrid) return;
        
        DOM.shopGrid.addEventListener('click', function(e) {
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            
            const action = button.dataset.action;
            const productId = button.dataset.productId;
            const productTitle = button.dataset.productTitle;
            
            if (action === 'view') {
                const product = products.find(p => p.id == productId);
                if (product) {
                    Shop.viewProduct(product.image, product.title);
                }
            } else if (action === 'contact') {
                if (typeof Messages !== 'undefined') {
                    Messages.startNewMessage(productId, productTitle);
                } else {
                    Utils.showNotification('Sistema de mensajes no disponible', 'error');
                }
            }
        });
    }

    function renderProducts(productsList) {
        if (!DOM.shopGrid) return;
        
        DOM.shopGrid.innerHTML = '';
        
        if (productsList.length > 0) {
            console.log(`Renderizando ${productsList.length} productos`);
            productsList.forEach(product => {
                const productElement = createProductElement(product);
                DOM.shopGrid.appendChild(productElement);
            });
            hideEmptyState();
        } else {
            console.log('No hay productos para mostrar');
            showEmptyState();
        }
        
        setupProductEvents();
    }

    return {
        init: async function() {
            if (isInitialized && products.length > 0) {
                renderProducts(products);
                return;
            }
            
            showLoading();
            try {
                products = await fetchProducts();
                console.log('Productos cargados:', products);
                renderProducts(products);
                isInitialized = true;
            } catch (error) {
                console.error('Error initializing shop:', error);
                products = getFallbackProducts();
                renderProducts(products);
            }
            hideLoading();
        },
        
        refresh: async function() {
            // Limpiar cache
            localStorage.removeItem('shop-products-cache');
            localStorage.removeItem('shop-products-cache-time');
            
            showLoading();
            try {
                products = await fetchProducts();
                renderProducts(products);
            } catch (error) {
                console.error('Error refreshing shop:', error);
                renderProducts(products); // Mantener productos actuales en caso de error
            }
            hideLoading();
        },
        
        viewProduct: function(imageUrl, title) {
            if (typeof Modal !== 'undefined') {
                Modal.show(imageUrl, title);
            }
        },
        
        getProducts: function() {
            return products;
        },
        
        getStats: function() {
            return {
                totalProducts: products.length,
                isInitialized: isInitialized
            };
        },
        
        searchProducts: function(query) {
            if (!query.trim()) {
                this.init();
                return;
            }
            
            const filteredProducts = products.filter(product => 
                product.title.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                product.price.toLowerCase().includes(query.toLowerCase())
            );
            
            renderProducts(filteredProducts);
        },
        
        // Método para debug
        debugData: function() {
            return {
                rawCount: products.length,
                sample: products.slice(0, 3),
                cacheStatus: {
                    hasCache: !!localStorage.getItem('shop-products-cache'),
                    cacheTime: localStorage.getItem('shop-products-cache-time')
                }
            };
        }
    };
})();