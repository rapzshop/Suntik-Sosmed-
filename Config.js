// ==================== KONFIGURASI APLIKASI ====================
const Config = {
    // API Keys
    UNDCTRL_API_KEY: "bb4bad2cd4a0323418e294b40a7d1e56",
    UNDCTRL_API_URL: "https://api.undctrl.com/order",
    
    // Midtrans Configuration
    MIDTRANS_CLIENT_KEY: "SB-Mid-client-Your-Client-Key", // Ganti dengan client key Midtrans
    MIDTRANS_SERVER_KEY: "SB-Mid-server-Your-Server-Key", // Untuk backend
    
    // Application Settings
    INITIAL_BALANCE: 100000,
    QR_TIMEOUT: 900, // 15 minutes in seconds
    PROFIT_RULES: {
        low: 800,      // Profit untuk harga 100-900
        highMin: 1000, // Minimal profit untuk harga 1000+
        highMax: 3000  // Maksimal profit untuk harga 1000+
    },
    
    // State Variables
    currentUser: null,
    currentBalance: 0,
    selectedCategory: 'instagram',
    selectedSubcategory: 'followers',
    selectedService: null,
    qrTimer: null,
    qrTimeLeft: 900
};

// Utility Functions
const Utils = {
    formatRupiah: function(amount) {
        return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },
    
    calculateProfit: function(basePrice) {
        if (basePrice >= 100 && basePrice <= 900) {
            return Config.PROFIT_RULES.low;
        } else if (basePrice >= 1000) {
            const profit = Math.min(
                Config.PROFIT_RULES.highMax,
                Math.max(
                    Config.PROFIT_RULES.highMin,
                    Math.floor(basePrice * 0.15)
                )
            );
            return profit;
        }
        return 500; // Default untuk harga di bawah 100
    },
    
    calculateTotal: function(service, quantity) {
        const per = parseInt(service.per.split(' ')[0]);
        return Math.ceil(quantity / per) * service.price;
    },
    
    generateOrderId: function() {
        return 'RAPZ-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    },
    
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validatePhone: function(phone) {
        const re = /^[0-9+\-\s()]{10,15}$/;
        return re.test(phone);
    }
};

// Export untuk module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Config, Utils };
}
