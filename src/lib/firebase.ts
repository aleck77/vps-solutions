
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth'; // Import Firebase Auth

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log("[firebase.ts] LOG: firebaseConfig.projectId at module load:", firebaseConfig.projectId);

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

function initializeFirebase(): void {
  if (!appInstance) {
    if (!firebaseConfig.projectId) {
      const errorMessage = "[firebase.ts] CRITICAL_ERROR: Firebase projectId is UNDEFINED in firebaseConfig. Cannot initialize app. Check .env variables.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (getApps().length === 0) {
      console.log("[firebase.ts] LOG: Initializing new Firebase app...");
      appInstance = initializeApp(firebaseConfig);
      console.log(`[firebase.ts] LOG: New Firebase app initialized. Project ID from app.options: ${appInstance.options.projectId}`);
    } else {
      console.log("[firebase.ts] LOG: Getting existing Firebase app...");
      appInstance = getApp();
      console.log(`[firebase.ts] LOG: Existing Firebase app retrieved. Project ID from app.options: ${appInstance.options.projectId}`);
    }
  }
}

// Initialize app on module load to ensure it's ready
try {
  initializeFirebase();
} catch (error) {
  console.error("[firebase.ts] CRITICAL_ERROR: Failed to initialize Firebase app at module level:", error);
}

// Function to get Firestore instance
export function getDb(): Firestore {
  if (!appInstance) {
    initializeFirebase(); // Ensure app is initialized
  }
  if (!appInstance) { // Double check after attempt
      const errorMsg = "[firebase.ts] CRITICAL_ERROR: getDb() called but Firebase app is not properly initialized.";
      console.error(errorMsg);
      throw new Error(errorMsg);
  }
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(appInstance);
  }
  return firestoreInstance;
}

// Function to get Auth instance
export function getAuthInstance(): Auth {
  if (!appInstance) {
    initializeFirebase(); // Ensure app is initialized
  }
   if (!appInstance) { // Double check after attempt
      const errorMsg = "[firebase.ts] CRITICAL_ERROR: getAuthInstance() called but Firebase app is not properly initialized.";
      console.error(errorMsg);
      throw new Error(errorMsg);
  }
  if (!authInstance) {
    authInstance = getAuth(appInstance);
  }
  return authInstance;
}

// For modules that might still expect a direct import of 'firestore' and 'app'
// These are initialized once when the module loads.
export const app = appInstance; // Export the app instance initialized at module load
export const firestore = firestoreInstance || (appInstance ? getFirestore(appInstance) : {} as Firestore);
export const auth = authInstance || (appInstance ? getAuth(appInstance) : {} as Auth);
