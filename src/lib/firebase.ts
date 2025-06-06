// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

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
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | undefined;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  if (isSupported()) {
    analytics = getAnalytics(app);
  }
} else if (getApps().length > 0) {
  app = getApp();
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  if (typeof window !== 'undefined' && isSupported()) {
    analytics = getAnalytics(app);
  }
} else {
  // Fallback for server-side rendering or environments where Firebase might not be fully initialized.
  // This helps prevent errors during build or server-side operations if Firebase isn't strictly needed there.
  // You might need a more robust solution if you intend to use Firebase Admin SDK for SSR.
  class MockAuth {}
  class MockFirestore {}
  class MockStorage {}
  
  app = {} as FirebaseApp; // Provide a minimal mock or handle appropriately
  auth = new MockAuth() as Auth;
  firestore = new MockFirestore() as Firestore;
  storage = new MockStorage() as FirebaseStorage;
}


export { app, auth, firestore, storage, analytics };
