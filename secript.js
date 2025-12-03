// ==================== FIREBASE CONFIGURATION ====================
const firebaseConfig = {
    apiKey: "AIzaSyCTZk59Gj7dJsJND6pmG0Qu8wg_2rXGMxI",
    authDomain: "kerja-2ca09.firebaseapp.com",
    databaseURL: "https://kerja-2ca09-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kerja-2ca09",
    storageBucket: "kerja-2ca09.firebasestorage.app",
    messagingSenderId: "700464186714",
    appId: "1:700464186714:web:9b176760036c0f14895f63",
    measurementId: "G-0EZMWPCFHC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==================== KONFIGURASI APLIKASI ====================
const Config = {
    UNDCTRL_API_KEY: "bb4bad2cd4a0323418e294b40a7d1e56",
    UNDCTRL_API_URL: "https://api.undctrl.com/order",
    MIDTRANS_CLIENT_KEY: "SB-Mid-client-Your-Client-Key",
    MIDTRANS_SERVER_KEY: "SB-Mid-server-Your-Server-Key",
    INITIAL_BALANCE: 100000,
    QR_TIMEOUT: 900,
    PROFIT_RULES: { low: 800, highMin: 1000, highMax: 3000 }
};

// ==================== UTILITY FUNCTIONS ====================
function formatRupiah(amount) {
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function showAlert(message, type = 'success') {
    const alert = document.getElementById('alertMessage');
    const messageText = document.getElementById('alertMessageText');
    
    alert.style.display = 'block';
    alert.querySelector('.alert').className = `alert alert-${type} alert-dismissible fade show`;
    messageText.textContent = message;
    
    setTimeout(hideAlert, 5000);
}

function hideAlert() {
    document.getElementById('alertMessage').style.display = 'none';
}

// ==================== DATA LAYANAN ====================
const serviceData = {
    categories: {
        instagram: {
            name: "Instagram",
            icon: "fab fa-instagram",
            color: "#E1306C",
            subcategories: ['followers', 'likes', 'views', 'comments', 'story', 'reels']
        },
        tiktok: {
            name: "TikTok",
            icon: "fab fa-tiktok",
            color: "#000000",
            subcategories: ['followers', 'likes', 'views', 'comments', 'shares']
        },
        facebook: {
            name: "Facebook",
            icon: "fab fa-facebook",
            color: "#1877F2",
            subcategories: ['likes', 'followers', 'post', 'comments', 'shares']
        },
        youtube: {
            name: "YouTube",
            icon: "fab fa-youtube",
            color: "#FF0000",
            subcategories: ['subscribers', 'likes', 'views', 'comments', 'hours']
        },
        twitter: {
            name: "Twitter",
            icon: "fab fa-twitter",
            color: "#1DA1F2",
            subcategories: ['followers', 'likes', 'retweets', 'comments']
        }
    },
    
    services: {
        'instagram-followers': [
            { id: "ig-followers-1", name: "Followers Indonesia Aktif", price: 900, min: 100, max: 5000, per: "100 followers", profit: 800, provider: "IG1" },
            { id: "ig-followers-2", name: "Followers Worldwide", price: 750, min: 100, max: 10000, per: "100 followers", profit: 800, provider: "IG2" },
            { id: "ig-followers-3", name: "Followers Real Indonesia", price: 1200, min: 100, max: 3000, per: "100 followers", profit: 1200, provider: "IG3" }
        ],
        'instagram-likes': [
            { id: "ig-likes-1", name: "Likes Instagram Post", price: 700, min: 50, max: 10000, per: "100 likes", profit: 800, provider: "IG4" },
            { id: "ig-likes-2", name: "Likes Reels HD", price: 800, min: 100, max: 50000, per: "100 likes", profit: 800, provider: "IG5" }
        ],
        'tiktok-followers': [
            { id: "tt-followers-1", name: "Followers TikTok Indonesia", price: 950, min: 100, max: 10000, per: "100 followers", profit: 800, provider: "TT1" },
            { id: "tt-followers-2", name: "Followers TikTok Real", price: 1200, min: 100, max: 5000, per: "100 followers", profit: 1200, provider: "TT2" }
        ],
        'youtube-subscribers': [
            { id: "yt-subs-1", name: "Subscribers Indonesia", price: 2500, min: 100, max: 5000, per: "100 subscribers", profit: 2500, provider: "YT1" },
            { id: "yt-subs-2", name: "Subscribers Worldwide", price: 2200, min: 100, max: 10000, per: "100 subscribers", profit: 2200, provider: "YT2" }
        ]
    }
};

// ==================== STATE MANAGEMENT ====================
let currentUser = null;
let currentBalance = 0;
let selectedCategory = 'instagram';
let selectedSubcategory = 'followers';
let selectedService = null;
let qrTimer = null;
let qrTimeLeft = 900;

// ==================== AUTH FUNCTIONS ====================
async function isUsernameUnique(username) {
    try {
        const snapshot = await db.collection('users')
            .where('username', '==', username.toLowerCase())
            .get();
        return snapshot.empty;
    } catch (error) {
        console.error('Error checking username:', error);
        return false;
    }
}

async function register() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const phone = document.getElementById('registerPhone').value.trim();
    
    // Reset errors
    document.getElementById('registerUsernameError').textContent = '';
    document.getElementById('registerPasswordError').textContent = '';
    document.getElementById('registerConfirmPasswordError').textContent = '';
    
    let valid = true;
    
    if (!username) {
        document.getElementById('registerUsernameError').textContent = 'Username wajib diisi';
        valid = false;
    } else if (username.length < 3) {
        document.getElementById('registerUsernameError').textContent = 'Username minimal 3 karakter';
        valid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        document.getElementById('registerUsernameError').textContent = 'Username hanya boleh huruf, angka, dan underscore';
        valid = false;
    }
    
    if (password.length < 6) {
        document.getElementById('registerPasswordError').textContent = 'Password minimal 6 karakter';
        valid = false;
    }
    
    if (password !== confirmPassword) {
        document.getElementById('registerConfirmPasswordError').textContent = 'Password tidak sama';
        valid = false;
    }
    
    if (!valid) return;
    
    showLoading();
    
    try {
        const usernameUnique = await isUsernameUnique(username);
        if (!usernameUnique) throw new Error('Username sudah digunakan');
        
        const email = `${username.toLowerCase()}@rapzshop.com`;
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            username: username.toLowerCase(),
            displayName: username,
            email: email,
            phone: phone || '',
            balance: Config.INITIAL_BALANCE,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showAlert('Pendaftaran berhasil! Silakan login.', 'success');
        switchAuthTab('login');
        
        document.getElementById('registerUsername').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerConfirmPassword').value = '';
        document.getElementById('registerPhone').value = '';
        
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 'auth/email-already-in-use') {
            document.getElementById('registerUsernameError').textContent = 'Username sudah digunakan';
        } else if (error.code === 'auth/weak-password') {
            document.getElementById('registerPasswordError').textContent = 'Password terlalu lemah';
        } else {
            showAlert(error.message, 'danger');
        }
    } finally {
        hideLoading();
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    document.getElementById('loginUsernameError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';
    
    if (!username) {
        document.getElementById('loginUsernameError').textContent = 'Username wajib diisi';
        return;
    }
    
    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Password wajib diisi';
        return;
    }
    
    showLoading();
    
    try {
        const email = `${username.toLowerCase()}@rapzshop.com`;
        await auth.signInWithEmailAndPassword(email, password);
        
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            showAlert('Username atau password salah', 'danger');
        } else if (error.code === 'auth/too-many-requests') {
            showAlert('Terlalu banyak percobaan gagal. Coba lagi nanti', 'danger');
        } else {
            showAlert(error.message, 'danger');
        }
    } finally {
        hideLoading();
    }
}

async function logout() {
    showLoading();
    try {
        await auth.signOut();
        showAlert('Anda telah logout', 'info');
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('Error saat logout', 'danger');
    } finally {
        hideLoading();
    }
}

async function getUserData(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) return { id: doc.id, ...doc.data() };
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

async function updateUserBalance(uid, newBalance) {
    try {
        await db.collection('users').doc(uid).update({
            balance: newBalance,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating balance:', error);
        return false;
    }
}

async function saveOrder(orderData) {
    try {
        const orderRef = await db.collection('orders').add({
            ...orderData,
            userId: currentUser.id,
            status: 'processing',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return orderRef.id;
    } catch (error) {
        console.error('Error saving order:', error);
        return null;
    }
}

async function getRecentOrders(limit = 5) {
    try {
        const snapshot = await db.collection('orders')
            .where('userId', '==', currentUser.id)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting orders:', error);
        return [];
    }
}

// ==================== UI FUNCTIONS ====================
function switchAuthTab(tab) {
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
}

function loadCategories() {
    const categoryTabs = document.getElementById('categoryTabs');
    categoryTabs.innerHTML = '';
    
    Object.keys(serviceData.categories).forEach(categoryId => {
        const category = serviceData.categories[categoryId];
        const tab = document.createElement('div');
        tab.className = `category-tab ${categoryId === selectedCategory ? 'active' : ''}`;
        tab.innerHTML = `<i class="${category.icon} me-2"></i>${category.name}`;
        tab.onclick = () => selectCategory(categoryId);
        categoryTabs.appendChild(tab);
    });
}

function selectCategory(categoryId) {
    selectedCategory = categoryId;
    selectedSubcategory = serviceData.categories[categoryId].subcategories[0];
    
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.innerHTML.includes(serviceData.categories[categoryId].icon)) {
            tab.classList.add('active');
        }
    });
    
    document.getElementById('subcategorySection').style.display = 'block';
    loadSubcategories(categoryId);
    loadServicesForCategory(categoryId, selectedSubcategory);
}

function loadSubcategories(categoryId) {
    const subcategoryTabs = document.getElementById('subcategoryTabs');
    subcategoryTabs.innerHTML = '';
    
    const category = serviceData.categories[categoryId];
    category.subcategories.forEach(subId => {
        const tab = document.createElement('div');
        tab.className = `subcategory-tab ${subId === selectedSubcategory ? 'active' : ''}`;
        tab.textContent = subId.charAt(0).toUpperCase() + subId.slice(1);
        tab.onclick = () => selectSubcategory(subId);
        subcategoryTabs.appendChild(tab);
    });
}

function selectSubcategory(subcategoryId) {
    selectedSubcategory = subcategoryId;
    
    document.querySelectorAll('.subcategory-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.subcategory-tab').forEach(tab => {
        if (tab.textContent.toLowerCase() === subcategoryId) {
            tab.classList.add('active');
        }
    });
    
    loadServicesForCategory(selectedCategory, subcategoryId);
}

function loadServicesForCategory(categoryId, subcategoryId) {
    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = '';
    
    const serviceKey = `${categoryId}-${subcategoryId}`;
    const servicesList = serviceData.services[serviceKey] || [];
    
    if (servicesList.length === 0) {
        servicesGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                <p>Layanan belum tersedia untuk kategori ini</p>
            </div>
        `;
        return;
    }
    
    servicesList.forEach(service => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
            <div class="service-card" onclick="selectService('${service.id}', '${categoryId}', '${subcategoryId}')">
                <div class="service-icon">
                    <i class="${serviceData.categories[categoryId].icon}"></i>
                </div>
                <div class="service-name">${service.name}</div>
                <div class="service-price">${formatRupiah(service.price)}</div>
                <div class="service-minmax">Min: ${service.min} • Max: ${service.max}</div>
                <div class="text-muted small mb-2">${service.per}</div>
                <div class="text-muted small mb-2">Provider: ${service.provider}</div>
                <button class="order-btn">Order Sekarang</button>
            </div>
        `;
        servicesGrid.appendChild(col);
    });
}

function selectService(serviceId, categoryId, subcategoryId) {
    const serviceKey = `${categoryId}-${subcategoryId}`;
    selectedService = serviceData.services[serviceKey].find(s => s.id === serviceId);
    
    if (!selectedService) return;
    
    document.getElementById('orderServiceName').textContent = selectedService.name;
    document.getElementById('orderUnitPrice').textContent = `${formatRupiah(selectedService.price)} / ${selectedService.per.split(' ')[1]}`;
    document.getElementById('orderMinMax').textContent = `Min: ${selectedService.min}, Max: ${selectedService.max}`;
    document.getElementById('orderQuantity').value = selectedService.min;
    document.getElementById('orderQuantity').min = selectedService.min;
    document.getElementById('orderQuantity').max = selectedService.max;
    
    calculateOrderTotal();
    document.getElementById('orderModal').style.display = 'flex';
    
    generateQRCode();
    startQRTimer();
}

function calculateOrderTotal() {
    if (!selectedService) return;
    
    const quantity = parseInt(document.getElementById('orderQuantity').value) || selectedService.min;
    const per = parseInt(selectedService.per.split(' ')[0]);
    const total = Math.ceil(quantity / per) * selectedService.price;
    
    document.getElementById('orderTotalPrice').textContent = formatRupiah(total);
}

function generateQRCode() {
    const container = document.getElementById('qrCode');
    container.innerHTML = '';
    
    if (!selectedService || !currentUser) return;
    
    const orderId = 'RAPZ-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const quantity = parseInt(document.getElementById('orderQuantity').value) || selectedService.min;
    const per = parseInt(selectedService.per.split(' ')[0]);
    const total = Math.ceil(quantity / per) * selectedService.price;
    
    const qrData = `midtrans:${orderId}:${total}:${Date.now()}:${selectedService.provider}`;
    
    QRCode.toCanvas(container, qrData, {
        width: 200,
        height: 200,
        color: { dark: '#000000', light: '#ffffff' }
    });
}

function startQRTimer() {
    const timerElement = 'qrTimer';
    qrTimeLeft = 900;
    
    if (qrTimer) clearInterval(qrTimer);
    
    qrTimer = setInterval(() => {
        qrTimeLeft--;
        
        const minutes = Math.floor(qrTimeLeft / 60);
        const seconds = qrTimeLeft % 60;
        
        document.getElementById(timerElement).textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (qrTimeLeft <= 0) {
            clearInterval(qrTimer);
            showAlert('QR Code telah kedaluwarsa! Silakan refresh halaman.', 'warning');
            closeOrderModal();
        }
    }, 1000);
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    if (qrTimer) {
        clearInterval(qrTimer);
        qrTimer = null;
    }
}

async function processPayment() {
    const target = document.getElementById('orderTarget').value.trim();
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    
    if (!target) {
        showAlert('Harap masukkan target/username!', 'warning');
        return;
    }
    
    if (!selectedService || !currentUser) return;
    
    const per = parseInt(selectedService.per.split(' ')[0]);
    const total = Math.ceil(quantity / per) * selectedService.price;
    
    if (currentBalance < total) {
        showAlert('Saldo tidak cukup! Silakan hubungi admin untuk top up.', 'danger');
        closeOrderModal();
        return;
    }
    
    showLoading();
    
    try {
        const newBalance = currentBalance - total;
        const bal    // Global functions untuk akses dari HTML
    window.closeOrderModal = () => UI.closeOrderModal();
}

// Global access untuk fungsi yang dipanggil dari HTML
window.Auth = Auth;
window.UI = UI;
window.Payment = Payment;
window.Config = Config;
window.Utils = Utils;
window.ServiceData = ServiceData;
