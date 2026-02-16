// Firebase Configuration & Initialization
// IMPORTANT: Replace the dummy values below with your actual config from Firebase Console

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Keep user signed in across tabs and reloads (default; explicit for clarity)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function (err) {
    console.warn("Firebase: Persistence set failed", err);
});

// Expose globally
window.CK_FirebaseApp = app;
window.CK_Auth = auth;
window.CK_Db = db;

console.log("Firebase: SDK Initialized and ready.");
