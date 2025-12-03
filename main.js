// ==================== MAIN APPLICATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Auth Listener
    Auth.initAuthListener();
    
    // Initialize Event Listeners
    initEventListeners();
    
    // Initial UI Setup
    document.getElementById('userBalance').textContent = Utils.formatRupiah(0);
    document.getElementById('currentBalance').textContent = Utils.formatRupiah(0);
});

function initEventListeners() {
    // Auth tab buttons
    document.getElementById('loginTab').addEventListener('click', () => UI.switchAuthTab('login'));
    document.getElementById('registerTab').addEventListener('click', () => UI.switchAuthTab('register'));
    
    // Login button
    document.getElementById('loginButton').addEventListener('click', Auth.login);
    
    // Register button
    document.getElementById('registerButton').addEventListener('click', Auth.register);
    
    // Allow Enter key to submit forms
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') Auth.login();
    });
    
    document.getElementById('registerConfirmPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') Auth.register();
    });
    
    // Order quantity input
    document.getElementById('orderQuantity').addEventListener('input', () => UI.calculateOrderTotal());
    
    // Global functions untuk akses dari HTML
    window.closeOrderModal = () => UI.closeOrderModal();
}

// Global access untuk fungsi yang dipanggil dari HTML
window.Auth = Auth;
window.UI = UI;
window.Payment = Payment;
window.Config = Config;
window.Utils = Utils;
window.ServiceData = ServiceData;
