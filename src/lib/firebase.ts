
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

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

let app: FirebaseApp;
let authModuleInstance: Auth; // Renamed to avoid conflict with local 'auth' variables
let firestoreModuleInstance: Firestore; // Renamed

// Ensure Firebase app is initialized (primarily for client-side)
if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    console.log("[firebase.ts] Initializing new Firebase app (client-side)...");
    app = initializeApp(firebaseConfig);
    console.log(`[firebase.ts] New Firebase app initialized. Project ID: ${app.options.projectId}`);
  } else {
    console.log("[firebase.ts] Getting existing Firebase app (client-side)...");
    app = getApp();
    console.log(`[firebase.ts] Existing Firebase app retrieved. Project ID: ${app.options.projectId}`);
  }
} else {
  // Handle server-side/build time initialization if necessary
  // This ensures 'app' is defined if this module is imported on the server during build
  if (getApps().length === 0) {
    console.log("[firebase.ts] Initializing Firebase app (server-side/build context)...");
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
}

// Initialize services once app is guaranteed to be initialized
authModuleInstance = getAuth(app);
firestoreModuleInstance = getFirestore(app);

console.log("[firebase.ts] Firebase services (auth, firestore) module instances initialized/retrieved.");

export function getDb(): Firestore {
  if (!firestoreModuleInstance) {
    console.warn("[firebase.ts] Firestore module instance not available at getDb call, re-initializing from app.");
    firestoreModuleInstance = getFirestore(app);
  }
  return firestoreModuleInstance;
}

export function getAuthInstance(): Auth {
  if (!authModuleInstance) {
    console.warn("[firebase.ts] Auth module instance not available at getAuthInstance call, re-initializing from app.");
    authModuleInstance = getAuth(app);
  }
  return authModuleInstance;
}

// Exporting the initialized instances directly for convenience
// 'firebaseAuth' is an alias for authModuleInstance to avoid common variable name 'auth' conflicts
// 'db' is an alias for firestoreModuleInstance
export { app, authModuleInstance as firebaseAuth, firestoreModuleInstance as db };
