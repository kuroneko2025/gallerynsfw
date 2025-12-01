const VisitCounter = (function() {
    'use strict';
    
    const API_URL = 'https://script.google.com/macros/s/AKfycbz_qyx41EtXTclnOi7xpFZtJTx36jO8iJwu8Qk5GJnwu4_Pg2BG2O9CxDbhqkeAqrEe/exec';
    const STORAGE_KEY = 'kuroneko_visit_data';
    const SESSION_KEY = 'kuroneko_session_active';
    
    async function getCount() {
        try {
            const response = await fetch(API_URL + '?counter=get');
            const text = await response.text();
            return parseInt(text) || 0;
        } catch (error) {
            return getStoredCount();
        }
    }
    
    async function incrementCount() {
        // Evitar incrementar múltiples veces en la misma sesión
        if (sessionStorage.getItem(SESSION_KEY)) {
            return await getCount();
        }
        
        sessionStorage.setItem(SESSION_KEY, 'true');
        
        try {
            const response = await fetch(API_URL + '?counter=increment');
            const text = await response.text();
            const newCount = parseInt(text) || 0;
            
            // Guardar localmente como backup
            localStorage.setItem(STORAGE_KEY, newCount.toString());
            return newCount;
            
        } catch (error) {
            const stored = getStoredCount();
            const newCount = stored + 1;
            localStorage.setItem(STORAGE_KEY, newCount.toString());
            return newCount;
        }
    }
    
    function getStoredCount() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return parseInt(stored) || 0;
    }
    
    function updateDisplay(count) {
        const counterElement = document.getElementById('visitCount');
        if (counterElement) {
            counterElement.textContent = count.toLocaleString();
        }
    }
    
    async function init() {
        const count = await incrementCount();
        updateDisplay(count);
    }
    
    return { init, getCount };
})();