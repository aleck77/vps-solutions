
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

let appModuleInstance: FirebaseApp | null = null;
let authModuleInstance: Auth | null = null;
let firestoreModuleInstance: Firestore | null = null;

function getAppInstance(): FirebaseApp {
  if (appModuleInstance) {
    return appModuleInstance;
  }

  // Check for essential config before initializing
  if (!firebaseConfig.projectId) {
    console.error("[firebase.ts] CRITICAL: Firebase projectId is missing. Cannot initialize Firebase. Ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set.");
    throw new Error("Firebase projectId is missing. Cannot initialize Firebase.");
  }

  if (getApps().length > 0) {
    console.log("[firebase.ts] Getting existing Firebase app...");
    appModuleInstance = getApp();
  } else {
    console.log("[firebase.ts] Initializing new Firebase app...");
    appModuleInstance = initializeApp(firebaseConfig);
    console.log(`[firebase.ts] New Firebase app initialized. Project ID: ${appModuleInstance.options.projectId}`);
  }
  return appModuleInstance;
}


export function getDb(): Firestore {
  if (!firestoreModuleInstance) {
    const currentApp = getAppInstance();
    // Defensive check, though getAppInstance should throw if projectId is missing before this point
    if (!currentApp.options.projectId) {
        console.error("[firebase.ts] CRITICAL: Firebase projectId is missing in getDb after app initialization. This should not happen.");
        throw new Error("Firebase projectId is missing in getDb. Cannot get Firestore instance.");
    }
    console.log("[firebase.ts] Initializing Firestore module instance...");
    firestoreModuleInstance = getFirestore(currentApp);
  }
  return firestoreModuleInstance;
}

export function getAuthInstance(): Auth {
  if (!authModuleInstance) {
    const currentApp = getAppInstance();
     // Defensive check
    if (!currentApp.options.projectId) {
        console.error("[firebase.ts] CRITICAL: Firebase projectId is missing in getAuthInstance after app initialization. This should not happen.");
        throw new Error("Firebase projectId is missing in getAuthInstance. Cannot get Auth instance.");
    }
    console.log("[firebase.ts] Initializing Auth module instance...");
    authModuleInstance = getAuth(currentApp);
  }
  return authModuleInstance;
}

// Exporting a way to get the app instance if needed directly
export { getAppInstance as getFirebaseApp };

// Removed Object.defineProperty exports as they are not statically analyzable by ES module bundlers.
// Consumers should now import and call getDb(), getAuthInstance(), or getFirebaseApp() directly.
