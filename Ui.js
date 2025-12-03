// ==================== UI MANAGEMENT ====================
const UI = {
    // Loading Spinner
    showLoading: function() {
        document.getElementById('loadingSpinner').style.display = 'flex';
    },
    
    hideLoading: function() {
        document.getElementById('loadingSpinner').style.display = 'none';
    },
    
    // Alert Messages
    showAlert: function(message, type = 'success') {
        const alert = document.getElementById('alertMessage');
        const messageText = document.getElementById('alertMessageText');
        
        alert.style.display = 'block';
        alert.querySelector('.alert').className = `alert alert-${type} alert-dismissible fade show`;
        messageText.textContent = message;
        
        setTimeout(this.hideAlert, 5000);
    },
    
    hideAlert: function() {
        document.getElementById('alertMessage').style.display = 'none';
    },
    
    // Auth Tabs
    switchAuthTab: function(tab) {
        document.getElementById('loginTab').classList.remove('active');
        document.getElementById('registerTab').classList.remove('active');
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.remove('active');
        
        if (tab === 'login') {
            document.getElementById('loginTab').classList.add('active');
            document.getElementById('loginForm').classList.add('active');
        } else {
            document.getElementById('registerTab').classList.add('active');
            document.getElementById('registerForm').classList.add('active');
        }
    },
    
    // Dashboard Management
    showDashboard: function() {
        document.getElementById('authPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    },
    
    hideDashboard: function() {
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('authPage').style.display = 'flex';
    },
    
    updateUserInfo: function(user) {
        document.getElementById('userName').textContent = user.displayName;
        document.getElementById('userBalance').textContent = Utils.formatRupiah(user.balance);
        document.getElementById('currentBalance').textContent = Utils.formatRupiah(user.balance);
    },
    
    // Categories Management
    loadCategories: function() {
        const categoryTabs = document.getElementById('categoryTabs');
        categoryTabs.innerHTML = '';
        
        const categories = ServiceData.getAllCategories();
        
        categories.forEach(categoryId => {
            const category = ServiceData.getCategoryInfo(categoryId);
            const tab = document.createElement('div');
            tab.className = `category-tab ${categoryId === Config.selectedCategory ? 'active' : ''}`;
            tab.innerHTML = `
                <i class="${category.icon} me-2"></i>${category.name}
            `;
            tab.onclick = () => this.selectCategory(categoryId);
            categoryTabs.appendChild(tab);
        });
    },
    
    selectCategory: function(categoryId) {
        Config.selectedCategory = categoryId;
        Config.selectedSubcategory = ServiceData.getSubcategories(categoryId)[0];
        
        // Update UI
        document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.category-tab').forEach(tab => {
            if (tab.innerHTML.includes(ServiceData.getCategoryInfo(categoryId).icon)) {
                tab.classList.add('active');
            }
        });
        
        // Show subcategories
        document.getElementById('subcategorySection').style.display = 'block';
        this.loadSubcategories(categoryId);
        
        // Load services
        this.loadServicesForCategory(categoryId, Config.selectedSubcategory);
    },
    
    loadSubcategories: function(categoryId) {
        const subcategoryTabs = document.getElementById('subcategoryTabs');
        subcategoryTabs.innerHTML = '';
        
        const subcategories = ServiceData.getSubcategories(categoryId);
        
        subcategories.forEach(subId => {
            const tab = document.createElement('div');
            tab.className = `subcategory-tab ${subId === Config.selectedSubcategory ? 'active' : ''}`;
            tab.textContent = subId.charAt(0).toUpperCase() + subId.slice(1);
            tab.onclick = () => this.selectSubcategory(subId);
            subcategoryTabs.appendChild(tab);
        });
    },
    
    selectSubcategory: function(subcategoryId) {
        Config.selectedSubcategory = subcategoryId;
        
        // Update UI
        document.querySelectorAll('.subcategory-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.subcategory-tab').forEach(tab => {
            if (tab.textContent.toLowerCase() === subcategoryId) {
                tab.classList.add('active');
            }
        });
        
        // Load services
        this.loadServicesForCategory(Config.selectedCategory, subcategoryId);
    },
    
    loadServicesForCategory: function(categoryId, subcategoryId) {
        const servicesGrid = document.getElementById('servicesGrid');
        servicesGrid.innerHTML = '';
        
        const services = ServiceData.getServices(categoryId, subcategoryId);
        
        if (services.length === 0) {
            servicesGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                    <p>Layanan belum tersedia untuk kategori ini</p>
                </div>
            `;
            return;
        }
        
        services.forEach(service => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-4';
            col.innerHTML = `
                <div class="service-card" onclick="UI.selectService('${service.id}')">
                    <div class="service-icon">
                        <i class="${ServiceData.getCategoryInfo(categoryId).icon}"></i>
                    </div>
                    <div class="service-name">${service.name}</div>
                    <div class="service-price">${Utils.formatRupiah(service.price)}</div>
                    <div class="service-minmax">Min: ${service.min} • Max: ${service.max}</div>
                    <div class="text-muted small mb-2">${service.per}</div>
                    <div class="text-muted small mb-2">Provider: ${service.provider}</div>
                    <button class="order-btn">Order Sekarang</button>
                </div>
            `;
            servicesGrid.appendChild(col);
        });
    },
    
    selectService: function(serviceId) {
        Config.selectedService = ServiceData.findServiceById(serviceId);
        
        if (!Config.selectedService) return;
        
        // Set up order modal
        document.getElementById('orderServiceName').textContent = Config.selectedService.name;
        document.getElementById('orderUnitPrice').textContent = `${Utils.formatRupiah(Config.selectedService.price)} / ${Config.selectedService.per.split(' ')[1]}`;
        document.getElementById('orderMinMax').textContent = `Min: ${Config.selectedService.min}, Max: ${Config.selectedService.max}`;
        document.getElementById('orderQuantity').value = Config.selectedService.min;
        document.getElementById('orderQuantity').min = Config.selectedService.min;
        document.getElementById('orderQuantity').max = Config.selectedService.max;
        
        // Calculate initial total
        this.calculateOrderTotal();
        
        // Show modal
        document.getElementById('orderModal').style.display = 'flex';
        
        // Generate QR code
        Payment.generateQRCode();
        
        // Start timer
        this.startQRTimer();
    },
    
    calculateOrderTotal: function() {
        if (!Config.selectedService) return;
        
        const quantity = parseInt(document.getElementById('orderQuantity').value) || Config.selectedService.min;
        const total = Utils.calculateTotal(Config.selectedService, quantity);
        
        document.getElementById('orderTotalPrice').textContent = Utils.formatRupiah(total);
    },
    
    // Order Modal
    closeOrderModal: function() {
        document.getElementById('orderModal').style.display = 'none';
        if (Config.qrTimer) {
            clearInterval(Config.qrTimer);
            Config.qrTimer = null;
        }
    },
    
    startQRTimer: function() {
        const timerElement = 'qrTimer';
        Config.qrTimeLeft = Config.QR_TIMEOUT;
        
        if (Config.qrTimer) clearInterval(Config.qrTimer);
        
        Config.qrTimer = setInterval(() => {
            Config.qrTimeLeft--;
            
            const minutes = Math.floor(Config.qrTimeLeft / 60);
            const seconds = Config.qrTimeLeft % 60;
            
            document.getElementById(timerElement).textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (Config.qrTimeLeft <= 0) {
                clearInterval(Config.qrTimer);
                this.showAlert('QR Code telah kedaluwarsa! Silakan refresh halaman.', 'warning');
                this.closeOrderModal();
            }
        }, 1000);
    },
    
    // Order History
    loadRecentOrders: async function() {
        const recentOrders = document.getElementById('recentOrders');
        
        try {
            const orders = await Auth.getRecentOrders(5);
            
            if (orders.length === 0) {
                recentOrders.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-history fa-2x mb-3 text-muted"></i>
                        <p class="text-muted">Belum ada riwayat pesanan</p>
                    </div>
                `;
                return;
            }
            
            let html = '';
            orders.forEach(order => {
                const statusClass = order.status === 'completed' ? 'status-success' : 
                                  order.status === 'processing' ? 'status-pending' : 'status-failed';
                const statusText = order.status === 'completed' ? 'Selesai' : 
                                 order.status === 'processing' ? 'Diproses' : 
                                 order.status === 'pending' ? 'Pending' : 'Gagal';
                
                const date = order.createdAt ? 
                    new Date(order.createdAt.seconds * 1000).toLocaleDateString('id-ID') : 
                    'Tanggal tidak tersedia';
                
                html += `
                    <div class="history-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6>${order.service}</h6>
                                <small class="text-muted">${order.target} × ${order.quantity}</small>
                                <div class="mt-1">
                                    <small class="badge bg-info">${order.provider || 'Undctrl'}</small>
                                </div>
                            </div>
                            <span class="history-status ${statusClass}">
                                ${statusText}
                            </span>
                        </div>
                        <div class="d-flex justify-content-between mt-3">
                            <small>${date}</small>
                            <small class="fw-bold">${Utils.formatRupiah(order.price)}</small>
                        </div>
                    </div>
                `;
            });
            
            recentOrders.innerHTML = html;
        } catch (error) {
            console.error('Error loading orders:', error);
            recentOrders.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3 text-danger"></i>
                    <p class="text-danger">Error memuat riwayat pesanan</p>
                </div>
            `;
        }
    },
    
    // Form Validation
    clearFormErrors: function() {
        document.getElementById('loginUsernameError').textContent = '';
        document.getElementById('loginPasswordError').textContent = '';
        document.getElementById('registerUsernameError').textContent = '';
        document.getElementById('registerPasswordError').textContent = '';
        document.getElementById('registerConfirmPasswordError').textContent = '';
    }
};

// Export untuk module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
        }
