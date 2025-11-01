const Messages = (function() {
    'use strict';
    
    let currentConversation = null;
    let currentUser = null;
    let isInitialized = !1;
    let isPolling = !1;
    let pollingInterval = null;
    let lastUpdateTime = null;
    let messageBatchSize = 20;
    let currentMessageOffset = 0;
    let hasMoreMessages = !0;
    
    const BASE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_qyx41EtXTclnOi7xpFZtJTx36jO8iJwu8Qk5GJnwu4_Pg2BG2O9CxDbhqkeAqrEe/exec';
    const VENDOR_USERNAME = "vendedor";
    const POLLING_INTERVAL = 30000;
    const BATCH_LOAD_DELAY = 500;

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

    function getCurrentLanguage() {
        return typeof KuronekoApp !== 'undefined' ? KuronekoApp.getCurrentLanguage() : 'es';
    }

    function getTranslation(key) {
        const lang = getCurrentLanguage();
        return (Utils.translations[lang] && Utils.translations[lang][key]) || key;
    }

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

    function updateMessagesTexts() {
        // Actualizar títulos principales
        const title = document.querySelector('.messages__title');
        if (title) {
            title.textContent = getTranslation('messages-title');
        }
        
        const subtitle = document.querySelector('.messages__subtitle');
        if (subtitle) {
            subtitle.textContent = getTranslation('messages-subtitle');
        }
        
        // Actualizar botón de nuevo mensaje
        if (DOM.newMessageBtn) {
            DOM.newMessageBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                ${getTranslation('messages-new')}
            `;
        }
        
        // Actualizar inputs y botones
        if (DOM.messageInput) {
            DOM.messageInput.placeholder = getTranslation('messages-placeholder');
        }
        
        if (DOM.sendMessageBtn) {
            DOM.sendMessageBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            DOM.sendMessageBtn.title = getTranslation('messages-send');
        }
        
        // Actualizar textos de bienvenida
        const welcomeElements = document.querySelectorAll('.messages__welcome');
        welcomeElements.forEach(el => {
            if (el.textContent.includes('Bienvenido') || el.textContent.includes('Welcome') || el.textContent.includes('ようこそ') || el.textContent.includes('欢迎')) {
                el.textContent = getTranslation('messages-welcome');
            }
        });
        
        // Actualizar formularios de autenticación
        updateAuthTexts();
        
        // Actualizar estados vacíos
        updateEmptyStates();
        
        // Actualizar botón de logout
        if (DOM.logoutBtn) {
            DOM.logoutBtn.textContent = getTranslation('logout');
        }
    }

    function updateAuthTexts() {
        // Login form
        if (DOM.loginSection) {
            const loginTitle = DOM.loginSection.querySelector('.auth-form__title');
            if (loginTitle) {
                loginTitle.textContent = getTranslation('login-title');
            }
            
            const loginLabels = DOM.loginSection.querySelectorAll('.auth-form__label');
            loginLabels.forEach(label => {
                const forAttr = label.getAttribute('for');
                if (forAttr === 'username') {
                    label.textContent = getTranslation('login-username');
                } else if (forAttr === 'password') {
                    label.textContent = getTranslation('login-password');
                }
            });
            
            const loginInputs = DOM.loginSection.querySelectorAll('.auth-form__input');
            loginInputs.forEach(input => {
                const name = input.getAttribute('name');
                if (name === 'username') {
                    input.placeholder = getTranslation('login-username-placeholder');
                } else if (name === 'password') {
                    input.placeholder = getTranslation('login-password-placeholder');
                }
            });
            
            const loginSubmit = DOM.loginSection.querySelector('.auth-form__submit');
            if (loginSubmit) {
                loginSubmit.textContent = getTranslation('login-submit');
            }
            
            const loginSwitch = DOM.loginSection.querySelector('.auth-form__switch');
            if (loginSwitch) {
                const span = loginSwitch.querySelector('span');
                const link = loginSwitch.querySelector('a');
                if (span) span.textContent = getTranslation('login-no-account');
                if (link) link.textContent = getTranslation('login-register-link');
            }
        }
        
        // Register form
        if (DOM.registerSection) {
            const registerTitle = DOM.registerSection.querySelector('.auth-form__title');
            if (registerTitle) {
                registerTitle.textContent = getTranslation('register-title');
            }
            
            const registerLabels = DOM.registerSection.querySelectorAll('.auth-form__label');
            registerLabels.forEach(label => {
                const forAttr = label.getAttribute('for');
                if (forAttr === 'reg_username') {
                    label.textContent = getTranslation('register-username');
                } else if (forAttr === 'reg_password') {
                    label.textContent = getTranslation('register-password');
                } else if (forAttr === 'reg_confirm_password') {
                    label.textContent = getTranslation('register-confirm-password');
                }
            });
            
            const registerInputs = DOM.registerSection.querySelectorAll('.auth-form__input');
            registerInputs.forEach(input => {
                const name = input.getAttribute('name');
                if (name === 'reg_username') {
                    input.placeholder = getTranslation('register-username-placeholder');
                } else if (name === 'reg_password') {
                    input.placeholder = getTranslation('register-password-placeholder');
                } else if (name === 'reg_confirm_password') {
                    input.placeholder = getTranslation('register-confirm-password-placeholder');
                }
            });
            
            const registerSubmit = DOM.registerSection.querySelector('.auth-form__submit');
            if (registerSubmit) {
                registerSubmit.textContent = getTranslation('register-submit');
            }
            
            const registerSwitch = DOM.registerSection.querySelector('.auth-form__switch');
            if (registerSwitch) {
                const span = registerSwitch.querySelector('span');
                const link = registerSwitch.querySelector('a');
                if (span) span.textContent = getTranslation('register-have-account');
                if (link) link.textContent = getTranslation('register-login-link');
            }
        }
    }

    function updateEmptyStates() {
        // Estado vacío principal
        if (DOM.empty) {
            DOM.empty.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin-bottom: 1rem; opacity: 0.5;">
                        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" 
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3>${getTranslation('messages-empty-title')}</h3>
                    <p>${getTranslation('messages-empty-text')}</p>
                </div>
            `;
        }
        
        // Textos de carga
        if (DOM.loading) {
            const loadingText = DOM.loading.querySelector('.messages-loading__text');
            if (loadingText) {
                loadingText.textContent = getTranslation('loading-messages');
            }
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
                    <span>${getTranslation('load-more-messages')}</span>
                </button>
            `;
            
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', loadMoreMessagesHandler);
            }
        } else {
            DOM.loadMoreMessages.style.display = 'none';
        }
    }

    function startPolling() {
        if (isPolling || !currentUser) return;
        isPolling = !0;
        pollingInterval = setInterval(async () => {
            if (document.hidden) return;
            await checkForNewMessages();
        }, POLLING_INTERVAL);
        EventSystem.emit('pollingStarted');
    }

    function stopPolling() {
        isPolling = !1;
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        EventSystem.emit('pollingStopped');
    }

    function pausePolling() {
        if (isPolling) {
            stopPolling();
            setTimeout(startPolling, POLLING_INTERVAL * 2);
        }
    }

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
                allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                const startIndex = offset;
                const endIndex = startIndex + limit;
                const batchMessages = allMessages.slice(startIndex, endIndex);
                
                hasMoreMessages = endIndex < allMessages.length;
                currentMessageOffset = endIndex;
                batchMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
                
                return batchMessages;
            }
            return [];
        } catch (error) {
            console.error('Error loading message batch:', error);
            return [];
        }
    }

    async function loadMoreMessagesHandler() {
        if (!currentConversation) return;
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;
        
        try {
            loadMoreBtn.disabled = !0;
            loadMoreBtn.querySelector('.button-loading').style.display = 'inline-block';
            loadMoreBtn.querySelector('span').textContent = getTranslation('loading');
            
            const newMessages = await loadMessagesBatch(currentConversation.id, currentMessageOffset, messageBatchSize);
            
            if (newMessages.length > 0) {
                const firstMessage = DOM.messagesContent?.firstChild;
                const scrollPosition = DOM.messagesContent?.scrollTop;
                const contentHeight = DOM.messagesContent?.scrollHeight;
                
                newMessages.forEach(message => {
                    const messageElement = createMessageElement(message);
                    if (DOM.messagesContent && messageElement) {
                        DOM.messagesContent.insertBefore(messageElement, DOM.messagesContent.firstChild);
                    }
                });
                
                if (DOM.messagesContent && contentHeight && scrollPosition) {
                    const newContentHeight = DOM.messagesContent.scrollHeight;
                    DOM.messagesContent.scrollTop = scrollPosition + (newContentHeight - contentHeight);
                }
            }
        } catch (error) {
            console.error('Error loading more messages:', error);
            showError(getTranslation('error-loading-messages'));
        } finally {
            if (loadMoreBtn) {
                loadMoreBtn.disabled = !1;
                loadMoreBtn.querySelector('.button-loading').style.display = 'none';
                loadMoreBtn.querySelector('span').textContent = getTranslation('load-more-messages');
            }
            showLoadMoreButton(hasMoreMessages);
        }
    }

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
                
                const newMessages = allMessages.filter(msg => !currentMessages.includes(msg.id.toString()));
                
                if (newMessages.length > 0) {
                    newMessages.forEach(message => {
                        const messageElement = createMessageElement(message);
                        if (DOM.messagesContent && messageElement) {
                            DOM.messagesContent.appendChild(messageElement);
                        }
                    });
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
            return { success: !1, error: 'Invalid JSON response' };
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
            DOM.messagesContent.innerHTML = '<div class="messages__empty"><p>' + getTranslation('messages-empty-text') + '</p></div>';
        }
        currentConversation = null;
        if (DOM.chatWith) DOM.chatWith.textContent = getTranslation('select-conversation');
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
                console.error('Error parsing saved user:', error);
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
            showError(getTranslation('validation-required'));
            return;
        }
        
        try {
            showAuthLoading(!0);
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
                showNotification(getTranslation('login-success'), 'success');
                document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user: currentUser } }));
            } else {
                showError(parsed.error || getTranslation('login-error'));
            }
        } catch (error) {
            showError(getTranslation('error-connection'));
        } finally {
            showAuthLoading(!1);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(DOM.registerForm);
        const username = formData.get('reg_username')?.trim();
        const password = formData.get('reg_password');
        const confirmPassword = formData.get('reg_confirm_password');
        
        if (!username || !password || !confirmPassword) {
            showError(getTranslation('validation-required'));
            return;
        }
        
        if (password !== confirmPassword) {
            showError(getTranslation('validation-passwords-match'));
            return;
        }
        
        if (password.length < 6) {
            showError(getTranslation('validation-password-length'));
            return;
        }
        
        if (username.length < 3) {
            showError(getTranslation('validation-username-length'));
            return;
        }
        
        try {
            showAuthLoading(!0);
            const registerUrl = getScriptUrl('register');
            const response = await fetch(registerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username, password, confirmPassword })
            });
            
            const result = await response.text();
            const parsed = parseResponse(result);
            
            if (parsed.success) {
                showNotification(getTranslation('register-success'), 'success');
                showSection('login');
                DOM.registerForm.reset();
                document.dispatchEvent(new CustomEvent('userRegistered'));
            } else {
                showError(parsed.error || getTranslation('register-error'));
            }
        } catch (error) {
            showError(getTranslation('error-connection'));
        } finally {
            showAuthLoading(!1);
        }
    }

    function handleLogout() {
        stopPolling();
        currentUser = null;
        currentConversation = null;
        localStorage.removeItem('currentUser');
        currentMessageOffset = 0;
        hasMoreMessages = !0;
        
        if (DOM.headerAuth) DOM.headerAuth.style.display = 'none';
        if (DOM.authSection) DOM.authSection.style.display = 'block';
        showSection('login');
        if (DOM.loginForm) DOM.loginForm.reset();
        if (DOM.messagesContent) DOM.messagesContent.innerHTML = '';
        if (DOM.messagesList) DOM.messagesList.innerHTML = '';
        showLoadMoreButton(!1);
        
        EventSystem.emit('userLoggedOut');
        showNotification(getTranslation('logout-success'), 'info');
    }

    function createNewConversation(productId = '', productTitle = '') {
        const contactUsername = currentUser.isVendor ? 'User' : VENDOR_USERNAME;
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
            DOM.messagesContent.innerHTML = '<div class="messages__empty"><p>' + getTranslation('start-conversation') + '</p></div>';
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
        
        const time = new Date(message.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageDiv.innerHTML = `
            <div class="message__content">${Utils.escapeHtml(message.message)}</div>
            <div class="message__time">${time}</div>
        `;
        
        return messageDiv;
    }

    async function sendMessage() {
        if (!currentUser || !DOM.messageInput) {
            showError(getTranslation('login-required'));
            return;
        }
        
        const message = DOM.messageInput.value.trim();
        if (!message) {
            showError(getTranslation('message-empty'));
            return;
        }
        
        if (!currentConversation) {
            createNewConversation();
        }
        
        try {
            showMessageSendingLoading(!0);
            pausePolling();
            
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
                await checkForNewMessages();
                EventSystem.emit('messageSent', {
                    conversationId: currentConversation.id,
                    message: message
                });
            } else {
                showError(parsed.error || getTranslation('message-send-error'));
            }
        } catch (error) {
            showError(getTranslation('error-connection'));
        } finally {
            showMessageSendingLoading(!1);
        }
    }

    async function loadConversationMessages(conversationId) {
        if (!currentUser || !conversationId) {
            showError(getTranslation('login-required'));
            return;
        }
        
        try {
            showMessagesLoading(!0);
            showLoadMoreButton(!1);
            currentMessageOffset = 0;
            hasMoreMessages = !0;
            
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
                    
                    setTimeout(() => {
                        if (DOM.messagesContent) {
                            DOM.messagesContent.scrollTop = DOM.messagesContent.scrollHeight;
                        }
                    }, 100);
                    
                    showChat();
                } else {
                    DOM.messagesContent.innerHTML = '<div class="messages__empty"><p>' + getTranslation('no-messages') + '</p></div>';
                }
            }
            
            showLoadMoreButton(hasMoreMessages);
            startPolling();
            EventSystem.emit('conversationLoaded', {
                conversationId: conversationId,
                messageCount: messages.length
            });
        } catch (error) {
            console.error('Error loading conversation messages:', error);
            showError(getTranslation('error-loading-messages'));
        } finally {
            showMessagesLoading(!1);
        }
    }

    async function loadUserMessages() {
        if (!currentUser) {
            showError(getTranslation('login-required'));
            return;
        }
        
        try {
            showMainLoading(!0);
            showConversationsLoading(!0);
            
            const messagesUrl = getScriptUrl('get_messages', { username: currentUser.username });
            const response = await fetch(messagesUrl);
            const result = await response.text();
            const parsed = parseResponse(result);
            
            if (parsed.success) {
                const allMessages = Array.isArray(parsed.data) ? parsed.data : [];
                updateConversationsList(allMessages);
                showConversationsOnly();
            } else {
                showError(parsed.error || getTranslation('error-loading-messages'));
                showNoMessages();
            }
        } catch (error) {
            showError(getTranslation('error-connection'));
            showNoMessages();
        } finally {
            showMainLoading(!1);
            showConversationsLoading(!1);
        }
    }

    function updateConversationsList(messages) {
        if (!DOM.messagesList) return;
        DOM.messagesList.innerHTML = '';
        
        if (messages && messages.length > 0) {
            const conversationsMap = {};
            
            messages.forEach(msg => {
                if (!msg.conversationId) return;
                
                const canAccessMessage = (msg.sender === currentUser.username || msg.receiver === currentUser.username);
                if (!canAccessMessage) return;
                
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
                
                const lastMessage = conversation.lastMessage.length > 50 ? 
                    conversation.lastMessage.substring(0, 50) + '...' : conversation.lastMessage;
                const time = new Date(conversation.lastDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                conversationDiv.innerHTML = `
                    <div class="conversation__header">
                        <div class="conversation__title">${conversation.contact}</div>
                        <div class="conversation__time">${time}</div>
                    </div>
                    <div class="conversation__last-message">${Utils.escapeHtml(lastMessage)}</div>
                `;
                
                conversationDiv.addEventListener('click', () => {
                    loadConversation(conversation.id);
                });
                
                DOM.messagesList.appendChild(conversationDiv);
            });
        } else {
            DOM.messagesList.innerHTML = `
                <div class="messages__empty">
                    <p>${getTranslation('no-conversations')}</p>
                    <p>${getTranslation('start-first-conversation')}</p>
                </div>
            `;
        }
    }

    function loadConversation(conversationId) {
        stopPolling();
        currentConversation = { id: conversationId, contact: getTranslation('loading') + '...' };
        showChat();
        updateChatHeader(getTranslation('loading') + '...');
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
                    <div class="loading-text">${getTranslation('loading-messages')}</div>
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
                DOM.sendMessageBtn.disabled = !0;
                DOM.sendMessageBtn.innerHTML = '<div class="button-loading"><div class="button-spinner"></div>' + getTranslation('sending') + '</div>';
                if (DOM.messageInput) DOM.messageInput.disabled = !0;
            } else {
                DOM.sendMessageBtn.disabled = !1;
                DOM.sendMessageBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
                if (DOM.messageInput) DOM.messageInput.disabled = !1;
            }
        }
    }

    function showAuthLoading(show) {
        const submitButtons = document.querySelectorAll('.auth-form__submit');
        submitButtons.forEach(btn => {
            btn.disabled = show;
            if (show) {
                btn.innerHTML = '<div class="button-loading"><div class="button-spinner"></div>' + getTranslation('loading') + '</div>';
            } else {
                const isLogin = btn.closest('#loginForm');
                btn.textContent = isLogin ? getTranslation('login-submit') : getTranslation('register-submit');
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
        
        showMainLoading(!1);
        initAuthSystem();
        updateMessagesTexts();
        
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
                    showNotification(getTranslation('login-required'), 'error');
                    return;
                }
                createNewConversation();
            });
        }
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopPolling();
            } else if (currentUser && currentConversation) {
                startPolling();
            }
        });
        
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
        
        isInitialized = !0;
        EventSystem.emit('messagesInitialized');
    }

    return {
        init: init,
        
        startNewMessage: function(productId, productTitle) {
            if (!currentUser) {
                showNotification(getTranslation('login-required'), 'error');
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
        
        isUserLoggedIn: function() {
            return !!currentUser;
        },
        
        getCurrentUser: function() {
            return currentUser;
        },
        
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
        
        onLanguageChange: function() {
            updateMessagesTexts();
            if (this.isUserLoggedIn() && currentConversation) {
                this.refresh();
            }
        },
        
        onUserLogin: function() {
            this.loadUserMessages();
            if (currentConversation) {
                this.startAutoRefresh();
            }
        },
        
        onSectionActivated: function() {
            if (this.isUserLoggedIn() && currentConversation) {
                this.startAutoRefresh();
            }
        },
        
        onSectionDeactivated: function() {
            this.stopAutoRefresh();
        },
        
        onPageHidden: function() {
            this.stopAutoRefresh();
        },
        
        onPageVisible: function() {
            if (this.isUserLoggedIn() && currentConversation) {
                const currentSection = typeof Navigation !== 'undefined' && Navigation.getCurrentSection ? Navigation.getCurrentSection() : '';
                if (currentSection === 'messages') {
                    this.startAutoRefresh();
                }
            }
        },
        
        on: function(event, callback) {
            EventSystem.on(event, callback);
        },
        
        off: function(event, callback) {
            EventSystem.off(event, callback);
        },
        
        getStatus: function() {
            return {
                isPolling: isPolling,
                hasMoreMessages: hasMoreMessages,
                currentOffset: currentMessageOffset,
                currentConversation: currentConversation?.id,
                lastUpdate: lastUpdateTime
            };
        }
    };
})();