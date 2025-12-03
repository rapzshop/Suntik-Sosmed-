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

// Export untuk digunakan di file lain
const FirebaseConfig = {
    auth,
    db,
    firebase
};

// Jika menggunakan module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseConfig;
}
