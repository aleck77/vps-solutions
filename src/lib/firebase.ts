
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// Temporarily remove other imports like getAuth, getStorage, getAnalytics to simplify

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let firestore: Firestore;

try {
  if (!firebaseConfig.projectId) {
    console.error("CRITICAL_ERROR_FIREBASE_INIT: Firebase projectId is missing in firebaseConfig. Check .env and NEXT_PUBLIC_FIREBASE_PROJECT_ID.");
    // Assign dummy objects to prevent further errors down the line if possible, though this app won't work
    app = {} as FirebaseApp;
    firestore = {} as Firestore;
  } else {
    console.log("[firebase.ts] Initializing Firebase app...");
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    console.log(`[firebase.ts] Firebase app initialized. Project ID: ${app.options.projectId}`);
    
    firestore = getFirestore(app);
    if (firestore && typeof firestore.settings === 'function') { // A basic check for a valid Firestore instance
      console.log("[firebase.ts] Firestore instance appears VALID.");
    } else {
      console.error("CRITICAL_ERROR_FIREBASE_INIT: Firestore instance appears INVALID after getFirestore(app).");
      firestore = {} as Firestore; // Assign dummy to prevent hard crash if possible
    }
  }
} catch (error) {
  console.error("CRITICAL_ERROR_FIREBASE_INIT: Error during Firebase initialization in firebase.ts:", error);
  app = {} as FirebaseApp;
  firestore = {} as Firestore;
}

// Export only app and firestore for now for debugging.
// We will add back auth, storage, analytics later.
export { app, firestore };
