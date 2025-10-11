const Messages = (function () {
    'use strict';

    let currentConversation = null;
    let currentUser = null;
    let isInitialized = false;
    let isPolling = false;
    let pollingInterval = null;
    let lastUpdateTime = null;
    let messageBatchSize = 20;
    let currentMessageOffset = 0;
    let hasMoreMessages = true;

    const BASE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_qyx41EtXTclnOi7xpFZtJTx36jO8iJwu8Qk5GJnwu4_Pg2BG2O9CxDbhqkeAqrEe/exec';
    const VENDOR_USERNAME = "vendedor";
    const POLLING_INTERVAL = 30000; // 30 segundos - solo cuando está activo
    const BATCH_LOAD_DELAY = 500; // Delay entre carga de lotes

    function getScriptUrl(action = null, params = {}) {
        let url = BASE_SCRIPT_URL;
        const urlParams = new URLSearchParams();

        if (action) {
            urlParams.append('action', action);
        }

        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                urlParams.append(key, params[key]);
            }
        });

        if (urlParams.toString()) {
            url += '?' + urlParams.toString();
        }

        return url;
    }

    const DOM = {
        loading: document.getElementById('messagesLoading'),
        empty: document.getElementById('messagesEmpty'),
        chat: document.getElementById('messagesChat'),
        messagesList: document.getElementById('messagesList'),
        messagesContent: document.getElementById('messagesContent'),
        messageInput: document.getElementById('messageInput'),
        sendMessageBtn: document.getElementById('sendMessageBtn'),
        newMessageBtn: document.getElementById('newMessageBtn'),
        chatWith: document.getElementById('chatWith'),
        loginSection: document.getElementById('loginSection'),
        registerSection: document.getElementById('registerSection'),
        messagesSection: document.getElementById('messagesSection'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        showRegister: document.getElementById('showRegister'),
        showLogin: document.getElementById('showLogin'),
        logoutBtn: document.getElementById('logoutBtn'),
        usernameDisplay: document.getElementById('usernameDisplay'),
        headerAuth: document.getElementById('headerAuth'),
        headerUser: document.getElementById('headerUser'),
        conversationsLoading: document.getElementById('conversationsLoading'),
        authSection: document.getElementById('authSection'),
        loadMoreMessages: document.getElementById('loadMoreMessages')
    };

    // ========== SISTEMA DE EVENTOS ==========
    const EventSystem = {
        listeners: {},
        
        on: function(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },
        
        off: function(event, callback) {
            if (this.listeners[event]) {
                this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
            }
        },
        
        emit: function(event, data) {
            if (this.listeners[event]) {
                this.listeners[event].forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error in event listener for ${event}:`, error);
                    }
                });
            }
        }
    };

    // ========== CONTROL DE POLLING ==========
    function startPolling() {
        if (isPolling || !currentUser) return;
        
        isPolling = true;
        pollingInterval = setInterval(async () => {
            if (document.hidden) return; // No actualizar si la pestaña no está activa
            
            await checkForNewMessages();
        }, POLLING_INTERVAL);
        
        EventSystem.emit('pollingStarted');
    }

    function stopPolling() {
        isPolling = false;
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        EventSystem.emit('pollingStopped');
    }

    function pausePolling() {
        if (isPolling) {
            stopPolling();
            setTimeout(startPolling, POLLING_INTERVAL * 2); // Reanudar después del doble de tiempo
        }
    }

    // ========== CARGA POR LOTES ==========
    async function loadMessagesBatch(conversationId, offset = 0, limit = messageBatchSize) {
        if (!currentUser) return [];
        
        try {
            const messagesUrl = getScriptUrl('get_messages', {
                username: currentUser.username,
                conversationId: conversationId
            });

            const response = await fetch(messagesUrl);
            const result = await response.text();
            const parsed = parseResponse(result);

            if (parsed.success) {
                const allMessages = Array.isArray(parsed.data) ? parsed.data : [];
                
                // Ordenar por fecha (más recientes primero para paginación)
                allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // Aplicar paginación
                const startIndex = offset;
                const endIndex = startIndex + limit;
                const batchMessages = allMessages.slice(startIndex, endIndex);
                
                // Verificar si hay más mensajes
                hasMoreMessages = endIndex < allMessages.length;
                currentMessageOffset = endIndex;
                
                // Re-ordenar por fecha ascendente para mostrar
                batchMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
                
                return batchMessages;
            }
            return [];
        } catch (error) {
            console.error('Error loading message batch:', error);
            return [];
        }
    }

    function showLoadMoreButton(show) {
        if (!DOM.loadMoreMessages) return;
        
        if (show && hasMoreMessages) {
            DOM.loadMoreMessages.style.display = 'block';
            DOM.loadMoreMessages.innerHTML = `
                <button class="load-more-btn" id="loadMoreBtn">
                    <div class="button-loading" style="display: none;">
                        <div class="button-spinner"></div>
                    </div>
                    <span>Cargar mensajes anteriores</span>
                </button>
            `;
            
            // Agregar event listener al botón
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', loadMoreMessagesHandler);
            }
        } else {
            DOM.loadMoreMessages.style.display = 'none';
        }
    }

    async function loadMoreMessagesHandler() {
        if (!currentConversation) return;
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;
        
        try {
            // Mostrar loading
            loadMoreBtn.disabled = true;
            loadMoreBtn.querySelector('.button-loading').style.display = 'inline-block';
            loadMoreBtn.querySelector('span').textContent = 'Cargando...';
            
            // Cargar siguiente lote
            const newMessages = await loadMessagesBatch(currentConversation.id, currentMessageOffset, messageBatchSize);
            
            if (newMessages.length > 0) {
                // Insertar mensajes al inicio manteniendo el scroll
                const firstMessage = DOM.messagesContent?.firstChild;
                const scrollPosition = DOM.messagesContent?.scrollTop;
                const contentHeight = DOM.messagesContent?.scrollHeight;
                
                newMessages.forEach(message => {
                    const messageElement = createMessageElement(message);
                    if (DOM.messagesContent && messageElement) {
                        DOM.messagesContent.insertBefore(messageElement, DOM.messagesContent.firstChild);
                    }
                });
                
                // Mantener posición de scroll
                if (DOM.messagesContent && contentHeight && scrollPosition) {
                    const newContentHeight = DOM.messagesContent.scrollHeight;
                    DOM.messagesContent.scrollTop = scrollPosition + (newContentHeight - contentHeight);
                }
                
                EventSystem.emit('messagesLoaded', { 
                    messages: newMessages, 
                    type: 'batch',
                    conversationId: currentConversation.id 
                });
            }
            
        } catch (error) {
            console.error('Error loading more messages:', error);
            showError('Error al cargar más mensajes');
        } finally {
            // Restaurar botón
            if (loadMoreBtn) {
                loadMoreBtn.disabled = false;
                loadMoreBtn.querySelector('.button-loading').style.display = 'none';
                loadMoreBtn.querySelector('span').textContent = 'Cargar mensajes anteriores';
            }
            
            // Actualizar visibilidad del botón
            showLoadMoreButton(hasMoreMessages);
        }
    }

    // ========== VERIFICACIÓN DE NUEVOS MENSAJES ==========
    async function checkForNewMessages() {
        if (!currentUser || !currentConversation) return;
        
        try {
            const messagesUrl = getScriptUrl('get_messages', {
                username: currentUser.username,
                conversationId: currentConversation.id
            });

            const response = await fetch(messagesUrl);
            const result = await response.text();
            const parsed = parseResponse(result);

            if (parsed.success) {
                const allMessages = Array.isArray(parsed.data) ? parsed.data : [];
                const currentMessages = Array.from(DOM.messagesContent?.children || [])
                    .map(el => el.dataset.messageId)
                    .filter(id => id);
                
                // Encontrar nuevos mensajes
                const newMessages = allMessages.filter(msg => 
                    !currentMessages.includes(msg.id.toString())
                );
                
                if (newMessages.length > 0) {
                    // Agregar nuevos mensajes
                    newMessages.forEach(message => {
                        const messageElement = createMessageElement(message);
                        if (DOM.messagesContent && messageElement) {
                            DOM.messagesContent.appendChild(messageElement);
                        }
                    });
                    
                    // Auto-scroll si está cerca del final
                    autoScrollToNewMessages();
                    
                    EventSystem.emit('newMessages', { 
                        messages: newMessages, 
                        conversationId: currentConversation.id 
                    });
                }
                
                lastUpdateTime = Date.now();
            }
        } catch (error) {
            console.error('Error checking for new messages:', error);
        }
    }

    function autoScrollToNewMessages() {
        if (!DOM.messagesContent) return;
        
        const isNearBottom = DOM.messagesContent.scrollHeight - DOM.messagesContent.clientHeight - DOM.messagesContent.scrollTop <= 100;
        
        if (isNearBottom) {
            setTimeout(() => {
                DOM.messagesContent.scrollTop = DOM.messagesContent.scrollHeight;
            }, 100);
        }
    }

    function showError(message) {
        showNotification(message, 'error');
    }

    function showNotification(message, type = 'info') {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    function parseResponse(text) {
        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            return { success: false, error: 'Invalid JSON response' };
        }
    }

    function showSection(section) {
        if (DOM.authSection) {
            DOM.authSection.style.display = (section === 'login' || section === 'register') ? 'block' : 'none';
        }

        if (DOM.loginSection) DOM.loginSection.style.display = section === 'login' ? 'block' : 'none';
        if (DOM.registerSection) DOM.registerSection.style.display = section === 'register' ? 'block' : 'none';
        if (DOM.messagesSection) DOM.messagesSection.style.display = section === 'messages' ? 'block' : 'none';
    }

    function showMessagesSection() {
        if (DOM.authSection) DOM.authSection.style.display = 'none';
        showSection('messages');
        if (DOM.usernameDisplay && currentUser) {
            DOM.usernameDisplay.textContent = currentUser.username;
        }
        loadUserMessages();
    }

    function showChat() {
        if (DOM.empty) DOM.empty.style.display = 'none';
        if (DOM.chat) DOM.chat.style.display = 'block';
    }

    function showNoMessages() {
        if (DOM.empty) DOM.empty.style.display = 'block';
        if (DOM.chat) DOM.chat.style.display = 'none';
    }

    function showConversationsOnly() {
        if (DOM.empty) DOM.empty.style.display = 'none';
        if (DOM.chat) DOM.chat.style.display = 'none';
        if (DOM.messagesContent) {
            DOM.messagesContent.innerHTML = '<div class="messages__empty"><p>Select a conversation to start chatting</p></div>';
        }
        currentConversation = null;
        if (DOM.chatWith) DOM.chatWith.textContent = 'Select a conversation';
    }

    function updateChatHeader(contact) {
        if (DOM.chatWith) {
            DOM.chatWith.textContent = contact;
        }
    }

    function checkExistingSession() {
        const savedUser = localStorage.getItem('currentUser');

        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                showMessagesSection();
                updateHeaderUserInfo();
                document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user: currentUser } }));
            } catch (error) {
                localStorage.removeItem('currentUser');
            }
        }
    }

    function updateHeaderUserInfo() {
        if (DOM.headerAuth && DOM.headerUser && currentUser) {
            DOM.headerUser.textContent = currentUser.username;
            DOM.headerAuth.style.display = 'flex';
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(DOM.loginForm);
        const username = formData.get('username')?.trim();
        const password = formData.get('password')?.trim();

        if (!username || !password) {
            showError('Please complete all fields');
            return;
        }

        try {
            showAuthLoading(true);
            const loginUrl = getScriptUrl('login');

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username, password })
            });

            const result = await response.text();
            const parsed = parseResponse(result);

            if (parsed.success) {
                currentUser = parsed.data;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showMessagesSection();
                showNotification('Login successful', 'success');
                document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user: currentUser } }));
            } else {
                showError(parsed.error);
            }
        } catch (error) {
            showError('Connection error');
        } finally {
            showAuthLoading(false);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(DOM.registerForm);
        const username = formData.get('reg_username')?.trim();
        const password = formData.get('reg_password');
        const confirmPassword = formData.get('reg_confirm_password');

        if (!username || !password || !confirmPassword) {
            showError('Please complete all fields');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        if (username.length < 3) {
            showError('Username must be at least 3 characters');
            return;
        }

        try {
            showAuthLoading(true);
            const registerUrl = getScriptUrl('register');

            const response = await fetch(registerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username, password, confirmPassword })
            });

            const result = await response.text();
            const parsed = parseResponse(result);

            if (parsed.success) {
                showNotification('Registration successful. You can now sign in.', 'success');
                showSection('login');
                DOM.registerForm.reset();
                document.dispatchEvent(new CustomEvent('userRegistered'));
            } else {
                showError(parsed.error);
            }
        } catch (error) {
            showError('Connection error');
        } finally {
            showAuthLoading(false);
        }
    }

    function handleLogout() {
        // Detener polling
        stopPolling();
        
        currentUser = null;
        currentConversation = null;
        localStorage.removeItem('currentUser');
        currentMessageOffset = 0;
        hasMoreMessages = true;

        if (DOM.headerAuth) DOM.headerAuth.style.display = 'none';
        if (DOM.authSection) DOM.authSection.style.display = 'block';

        showSection('login');

        if (DOM.loginForm) DOM.loginForm.reset();
        if (DOM.messagesContent) DOM.messagesContent.innerHTML = '';
        if (DOM.messagesList) DOM.messagesList.innerHTML = '';
        showLoadMoreButton(false);

        EventSystem.emit('userLoggedOut');
        
        showNotification('Session closed', 'info');
    }

    function generateConversationId() {
        return `user_${currentUser.username}_${Date.now()}`;
    }

    function createNewConversation(productId = '', productTitle = '') {
        const contactUsername = currentUser.isVendor ? 'User' : VENDOR_USERNAME;

        // Usar un conversationId único por usuario-vendedor
        const conversationId = `conv_${currentUser.username}_${VENDOR_USERNAME}`;

        currentConversation = {
            id: conversationId,
            productId: productId,
            productTitle: productTitle,
            contact: contactUsername
        };

        showChat();
        updateChatHeader(contactUsername);

        if (DOM.messagesContent) {
            DOM.messagesContent.innerHTML = '<div class="messages__empty"><p>Start a new conversation</p></div>';
        }

        setTimeout(() => {
            if (DOM.messageInput) DOM.messageInput.focus();
        }, 100);
    }

    function createMessageElement(message) {
        if (!message.message) return null;

        const messageDiv = document.createElement('div');
        const isCurrentUser = message.sender === currentUser.username;

        messageDiv.className = `message message--${isCurrentUser ? 'sent' : 'received'}`;
        messageDiv.dataset.messageId = message.id;

        const time = new Date(message.date).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message__content">${message.message}</div>
            <div class="message__time">${time}</div>
        `;

        return messageDiv;
    }

    async function sendMessage() {
        if (!currentUser || !DOM.messageInput) {
            showError('User not logged in or message input not available');
            return;
        }

        const message = DOM.messageInput.value.trim();
        if (!message) {
            showError('Message cannot be empty');
            return;
        }

        if (!currentConversation) {
            createNewConversation();
        }

        try {
            showMessageSendingLoading(true);
            pausePolling(); // Pausar polling temporalmente

            const saveUrl = getScriptUrl('save_message');
            const response = await fetch(saveUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    username: currentUser.username,
                    message: message,
                    conversationId: currentConversation.id,
                    productId: currentConversation.productId || '',
                    sender: currentUser.username
                })
            });

            const result = await response.text();
            const parsed = parseResponse(result);

            if (parsed.success) {
                DOM.messageInput.value = '';
                
                // En lugar de recargar toda la conversación, podríamos agregar el mensaje localmente
                // y luego verificar con el servidor en el próximo polling
                await checkForNewMessages(); // Verificar inmediatamente
                
                EventSystem.emit('messageSent', { 
                    conversationId: currentConversation.id,
                    message: message 
                });
            } else {
                showError(parsed.error);
            }
        } catch (error) {
            showError('Error sending message');
        } finally {
            showMessageSendingLoading(false);
        }
    }

    async function loadConversationMessages(conversationId) {
        if (!currentUser || !conversationId) {
            showError('User not logged in or conversation ID missing');
            return;
        }

        try {
            showMessagesLoading(true);
            showLoadMoreButton(false);

            // Reiniciar paginación
            currentMessageOffset = 0;
            hasMoreMessages = true;

            // Cargar primer lote
            const messages = await loadMessagesBatch(conversationId, 0, messageBatchSize);
            
            if (DOM.messagesContent) {
                DOM.messagesContent.innerHTML = '';
                
                if (messages.length > 0) {
                    messages.forEach(message => {
                        const messageElement = createMessageElement(message);
                        if (messageElement) {
                            DOM.messagesContent.appendChild(messageElement);
                        }
                    });
                    
                    // Auto-scroll al final
                    setTimeout(() => {
                        if (DOM.messagesContent) {
                            DOM.messagesContent.scrollTop = DOM.messagesContent.scrollHeight;
                        }
                    }, 100);
                    
                    showChat();
                } else {
                    DOM.messagesContent.innerHTML = '<div class="messages__empty"><p>No messages yet. Send the first one!</p></div>';
                }
            }

            // Mostrar botón para cargar más si es necesario
            showLoadMoreButton(hasMoreMessages);
            
            // Iniciar polling para esta conversación
            startPolling();
            
            EventSystem.emit('conversationLoaded', { 
                conversationId: conversationId, 
                messageCount: messages.length 
            });

        } catch (error) {
            showError('Connection error while loading messages');
        } finally {
            showMessagesLoading(false);
        }
    }

    async function loadUserMessages() {
        if (!currentUser) {
            showError('User not logged in');
            return;
        }

        try {
            showMainLoading(true);
            showConversationsLoading(true);

            const messagesUrl = getScriptUrl('get_messages', {
                username: currentUser.username
            });

            const response = await fetch(messagesUrl);
            const result = await response.text();
            const parsed = parseResponse(result);

            if (parsed.success) {
                const allMessages = Array.isArray(parsed.data) ? parsed.data : [];
                updateConversationsList(allMessages);
                showConversationsOnly();
            } else {
                showError(`Error loading messages: ${parsed.error}`);
                showNoMessages();
            }
        } catch (error) {
            showError('Connection error while loading messages');
            showNoMessages();
        } finally {
            showMainLoading(false);
            showConversationsLoading(false);
        }
    }

    function displayUserMessages(messages) {
        if (!DOM.messagesContent) return;

        DOM.messagesContent.innerHTML = '';

        if (messages && messages.length > 0) {
            messages.sort((a, b) => new Date(a.date) - new Date(b.date));

            messages.forEach(msg => {
                if (msg.message) {
                    const messageElement = createMessageElement(msg);
                    if (messageElement) {
                        DOM.messagesContent.appendChild(messageElement);
                    }
                }
            });

            showChat();
        } else {
            DOM.messagesContent.innerHTML = '<div class="messages__empty"><p>No messages yet. Send the first one!</p></div>';
        }
    }

    function updateConversationsList(messages) {
        if (!DOM.messagesList) return;

        DOM.messagesList.innerHTML = '';

        if (messages && messages.length > 0) {
            const conversationsMap = {};

            messages.forEach(msg => {
                if (!msg.conversationId) return;

                if (!conversationsMap[msg.conversationId] || new Date(msg.date) > new Date(conversationsMap[msg.conversationId].lastDate)) {
                    let contactUser = '';
                    if (currentUser.username === VENDOR_USERNAME) {
                        contactUser = (msg.sender === VENDOR_USERNAME) ? msg.receiver : msg.sender;
                    } else {
                        contactUser = VENDOR_USERNAME;
                    }

                    conversationsMap[msg.conversationId] = {
                        id: msg.conversationId,
                        contact: contactUser,
                        lastMessage: msg.message,
                        lastDate: msg.date,
                        productId: msg.productId
                    };
                }
            });

            const conversations = Object.values(conversationsMap);
            conversations.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));

            conversations.forEach(conversation => {
                const conversationDiv = document.createElement('div');
                const isActive = currentConversation && currentConversation.id === conversation.id;

                conversationDiv.className = `messages__conversation ${isActive ? 'messages__conversation--active' : ''}`;

                const lastMessage = conversation.lastMessage.length > 50
                    ? conversation.lastMessage.substring(0, 50) + '...'
                    : conversation.lastMessage;

                const time = new Date(conversation.lastDate).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit'
                });

                conversationDiv.innerHTML = `
                    <div class="conversation__header">
                        <div class="conversation__title">${conversation.contact}</div>
                        <div class="conversation__time">${time}</div>
                    </div>
                    <div class="conversation__last-message">${lastMessage}</div>
                `;

                conversationDiv.addEventListener('click', () => {
                    loadConversation(conversation.id);
                });

                DOM.messagesList.appendChild(conversationDiv);
            });
        } else {
            DOM.messagesList.innerHTML = '<div class="messages__empty"><p>No conversations yet</p><p>Start a new conversation to begin chatting</p></div>';
        }
    }

    function loadConversation(conversationId) {
        // Detener polling anterior
        stopPolling();
        
        currentConversation = {
            id: conversationId,
            contact: 'Loading...'
        };

        showChat();
        updateChatHeader('Loading...');
        
        EventSystem.emit('conversationChanged', { conversationId: conversationId });
        
        loadConversationMessages(conversationId);
    }

    function showMainLoading(show) {
        if (DOM.loading) {
            DOM.loading.style.display = show ? 'flex' : 'none';
        }
    }

    function showConversationsLoading(show) {
        if (DOM.conversationsLoading) {
            DOM.conversationsLoading.style.display = show ? 'block' : 'none';
        }
        if (DOM.messagesList && !show) {
            DOM.messagesList.style.display = 'block';
        }
    }

    function showMessagesLoading(show) {
        if (!DOM.messagesContent) return;

        if (show) {
            DOM.messagesContent.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading messages...</div>
                </div>
            `;
        } else {
            if (DOM.messagesContent.querySelector('.loading-container')) {
                DOM.messagesContent.innerHTML = '';
            }
        }
    }

    function showMessageSendingLoading(show) {
        if (DOM.sendMessageBtn) {
            if (show) {
                DOM.sendMessageBtn.disabled = true;
                DOM.sendMessageBtn.innerHTML = '<div class="button-loading"><div class="button-spinner"></div>Sending...</div>';
                if (DOM.messageInput) DOM.messageInput.disabled = true;
            } else {
                DOM.sendMessageBtn.disabled = false;
                DOM.sendMessageBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                if (DOM.messageInput) DOM.messageInput.disabled = false;
            }
        }
    }

    function showAuthLoading(show) {
        const submitButtons = document.querySelectorAll('.auth-form__submit');
        submitButtons.forEach(btn => {
            btn.disabled = show;
            if (show) {
                btn.innerHTML = '<div class="button-loading"><div class="button-spinner"></div>Loading...</div>';
            } else {
                const isLogin = btn.closest('#loginForm');
                btn.textContent = isLogin ? 'Sign In' : 'Create Account';
            }
        });
    }

    function initAuthSystem() {
        if (DOM.loginForm) {
            DOM.loginForm.addEventListener('submit', handleLogin);
        }
        if (DOM.registerForm) {
            DOM.registerForm.addEventListener('submit', handleRegister);
        }
        if (DOM.showRegister) {
            DOM.showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                showSection('register');
            });
        }
        if (DOM.showLogin) {
            DOM.showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                showSection('login');
            });
        }
        if (DOM.logoutBtn) {
            DOM.logoutBtn.addEventListener('click', handleLogout);
        }

        checkExistingSession();
    }

    function init() {
        if (isInitialized) return;

        showMainLoading(false);
        initAuthSystem();

        if (DOM.sendMessageBtn) {
            DOM.sendMessageBtn.addEventListener('click', sendMessage);
        }

        if (DOM.messageInput) {
            DOM.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        if (DOM.newMessageBtn) {
            DOM.newMessageBtn.addEventListener('click', () => {
                if (!currentUser) {
                    showNotification('You must be signed in to create conversations', 'error');
                    return;
                }
                createNewConversation();
            });
        }

        // Event listeners para control de visibilidad
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopPolling();
            } else if (currentUser && currentConversation) {
                startPolling();
            }
        });

        // Escuchar eventos personalizados para actualizaciones
        EventSystem.on('refreshMessages', () => {
            if (currentConversation) {
                loadConversationMessages(currentConversation.id);
            } else {
                loadUserMessages();
            }
        });

        EventSystem.on('forceRefresh', () => {
            stopPolling();
            if (currentConversation) {
                loadConversationMessages(currentConversation.id);
            }
            startPolling();
        });

        isInitialized = true;
        
        EventSystem.emit('messagesInitialized');
    }

    // ========== MÉTODOS DE INTEGRACIÓN CON APP ==========
    function onLanguageChange() {
        console.log('Language changed in Messages');
        // Actualizar textos si es necesario
        if (this.isUserLoggedIn() && currentConversation) {
            this.refresh();
        }
    }

    function onUserLogin() {
        console.log('User login handled by Messages');
        this.loadUserMessages();
        if (currentConversation) {
            this.startAutoRefresh();
        }
    }

    function onSectionActivated() {
        console.log('Messages section activated');
        if (this.isUserLoggedIn() && currentConversation) {
            this.startAutoRefresh();
        }
    }

    function onSectionDeactivated() {
        console.log('Messages section deactivated');
        this.stopAutoRefresh();
    }

    function onPageHidden() {
        console.log('Page hidden, stopping polling');
        this.stopAutoRefresh();
    }

    function onPageVisible() {
        console.log('Page visible, resuming polling if needed');
        if (this.isUserLoggedIn() && currentConversation) {
            // Verificar si estamos en la sección de mensajes
            const currentSection = typeof Navigation !== 'undefined' && Navigation.getCurrentSection ? 
                Navigation.getCurrentSection() : '';
            if (currentSection === 'messages') {
                this.startAutoRefresh();
            }
        }
    }

    // ========== API PÚBLICA MEJORADA ==========
    return {
        init: init,
        startNewMessage: function (productId, productTitle) {
            if (!currentUser) {
                showNotification('You must be signed in to send messages', 'error');
                if (typeof Navigation !== 'undefined' && Navigation.switchToSection) {
                    Navigation.switchToSection('messages');
                }
                return;
            }

            if (typeof Navigation !== 'undefined' && Navigation.switchToSection) {
                Navigation.switchToSection('messages');
            } else {
                showSection('messages');
            }

            setTimeout(() => {
                createNewConversation(productId, productTitle);
            }, 100);
        },
        handleLogout: handleLogout,
        loadUserMessages: loadUserMessages,
        isUserLoggedIn: function () {
            return !!currentUser;
        },
        getCurrentUser: function () {
            return currentUser;
        },
        // Nueva API para control de actualizaciones
        refresh: function() {
            EventSystem.emit('refreshMessages');
        },
        forceRefresh: function() {
            EventSystem.emit('forceRefresh');
        },
        stopAutoRefresh: function() {
            stopPolling();
        },
        startAutoRefresh: function() {
            if (currentUser && currentConversation) {
                startPolling();
            }
        },
        // Sistema de eventos
        on: function(event, callback) {
            EventSystem.on(event, callback);
        },
        off: function(event, callback) {
            EventSystem.off(event, callback);
        },
        // Información del estado
        getStatus: function() {
            return {
                isPolling: isPolling,
                hasMoreMessages: hasMoreMessages,
                currentOffset: currentMessageOffset,
                currentConversation: currentConversation?.id,
                lastUpdate: lastUpdateTime
            };
        },
        // Métodos de integración con App
        onLanguageChange: onLanguageChange,
        onUserLogin: onUserLogin,
        onSectionActivated: onSectionActivated,
        onSectionDeactivated: onSectionDeactivated,
        onPageHidden: onPageHidden,
        onPageVisible: onPageVisible
    };
})();