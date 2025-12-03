// ==================== AUTHENTICATION MANAGEMENT ====================
const Auth = {
    // Check if username is unique
    isUsernameUnique: async function(username) {
        try {
            const snapshot = await db.collection('users')
                .where('username', '==', username.toLowerCase())
                .get();
            return snapshot.empty;
        } catch (error) {
            console.error('Error checking username:', error);
            return false;
        }
    },
    
    // Register new user
    register: async function() {
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const phone = document.getElementById('registerPhone').value.trim();
        
        // Reset errors
        UI.clearFormErrors();
        
        let valid = true;
        
        // Validate username
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
        
        // Validate password
        if (password.length < 6) {
            document.getElementById('registerPasswordError').textContent = 'Password minimal 6 karakter';
            valid = false;
        }
        
        // Validate confirm password
        if (password !== confirmPassword) {
            document.getElementById('registerConfirmPasswordError').textContent = 'Password tidak sama';
            valid = false;
        }
        
        if (!valid) return;
        
        UI.showLoading();
        
        try {
            const usernameUnique = await this.isUsernameUnique(username);
            if (!usernameUnique) {
                throw new Error('Username sudah digunakan');
            }
            
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
            
            UI.showAlert('Pendaftaran berhasil! Silakan login.', 'success');
            UI.switchAuthTab('login');
            
            // Clear form
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
                UI.showAlert(error.message, 'danger');
            }
        } finally {
            UI.hideLoading();
        }
    },
    
    // Login user
    login: async function() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        UI.clearFormErrors();
        
        if (!username) {
            document.getElementById('loginUsernameError').textContent = 'Username wajib diisi';
            return;
        }
        
        if (!password) {
            document.getElementById('loginPasswordError').textContent = 'Password wajib diisi';
            return;
        }
        
        UI.showLoading();
        
        try {
            const email = `${username.toLowerCase()}@rapzshop.com`;
            await auth.signInWithEmailAndPassword(email, password);
            
            // Clear form
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
            
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                UI.showAlert('Username atau password salah', 'danger');
            } else if (error.code === 'auth/too-many-requests') {
                UI.showAlert('Terlalu banyak percobaan gagal. Coba lagi nanti', 'danger');
            } else {
                UI.showAlert(error.message, 'danger');
            }
        } finally {
            UI.hideLoading();
        }
    },
    
    // Logout user
    logout: async function() {
        UI.showLoading();
        try {
            await auth.signOut();
            UI.showAlert('Anda telah logout', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            UI.showAlert('Error saat logout', 'danger');
        } finally {
            UI.hideLoading();
        }
    },
    
    // Get user data from Firestore
    getUserData: async function(uid) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },
    
    // Update user balance
    updateUserBalance: async function(uid, newBalance) {
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
    },
    
    // Save order to Firestore
    saveOrder: async function(orderData) {
        try {
            const orderRef = await db.collection('orders').add({
                ...orderData,
                userId: Config.currentUser.id,
                status: 'processing',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return orderRef.id;
        } catch (error) {
            console.error('Error saving order:', error);
            return null;
        }
    },
    
    // Get user's recent orders
    getRecentOrders: async function(limit = 5) {
        try {
            const snapshot = await db.collection('orders')
                .where('userId', '==', Config.currentUser.id)
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
    },
    
    // Auth State Listener
    initAuthListener: function() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // User is signed in
                try {
                    Config.currentUser = await this.getUserData(user.uid);
                    if (Config.currentUser) {
                        Config.currentBalance = Config.currentUser.balance || Config.INITIAL_BALANCE;
                        
                        // Update UI
                        UI.showDashboard();
                        UI.updateUserInfo(Config.currentUser);
                        
                        // Load data
                        UI.loadCategories();
                        UI.loadServicesForCategory(Config.selectedCategory, Config.selectedSubcategory);
                        UI.loadRecentOrders();
                        
                        UI.showAlert(`Selamat datang, ${Config.currentUser.displayName}!`, 'success');
                    } else {
                        // User document doesn't exist
                        UI.showAlert('Data pengguna tidak ditemukan', 'danger');
                        await auth.signOut();
                    }
                } catch (error) {
                    console.error('Auth state change error:', error);
                    UI.showAlert('Error memuat data pengguna', 'danger');
                }
            } else {
                // User is signed out
                Config.currentUser = null;
                UI.hideDashboard();
                UI.switchAuthTab('login');
            }
        });
    }
};

// Export untuk module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
