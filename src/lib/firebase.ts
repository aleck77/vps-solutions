
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Log the projectId at the module load to ensure env var is available
console.log("[firebase.ts] LOG: firebaseConfig.projectId at module load:", firebaseConfig.projectId);

let appInstance: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp {
  if (appInstance) {
    // console.log("[firebase.ts] LOG: Returning existing app instance.");
    return appInstance;
  }

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
  return appInstance;
}

// Initialize app on module load to ensure it's ready
try {
  appInstance = getFirebaseApp();
} catch (error) {
  console.error("[firebase.ts] CRITICAL_ERROR: Failed to initialize Firebase app at module level:", error);
  // To prevent hard crashes downstream, we could assign a dummy, but functions using it will fail.
  // It's better to let the error propagate or handle it gracefully in consuming functions.
}

// Function to get Firestore instance
function getDb(): Firestore {
  const currentApp = getFirebaseApp(); // Ensures app is initialized
  if (!currentApp || !currentApp.options.projectId) { // Extra safety check
      const errorMsg = "[firebase.ts] CRITICAL_ERROR: getDb() called but Firebase app is not properly initialized or projectId is missing.";
      console.error(errorMsg);
      throw new Error(errorMsg);
  }
  // console.log("[firebase.ts] LOG: getDb() called. App projectId for getFirestore():", currentApp.options.projectId);
  return getFirestore(currentApp);
}

// For modules that might still expect a direct import of 'firestore' and 'app'
// These are initialized once when the module loads.
const app = appInstance; // Export the app instance initialized at module load
const firestore = appInstance ? getFirestore(appInstance) : {} as Firestore; // Provide a best-effort firestore instance

export { app, firestore, getDb };
