
'use server';

import { initializeApp, getApps, App, Credential } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestoreSDK } from 'firebase-admin/firestore'; // Import Admin Firestore
import { seedDatabase } from '@/lib/seed';

// --- Begin Firebase Admin SDK Initialization ---
let adminApp: App;

if (!getApps().length) {
  try {
    console.log('[AdminActions] Attempting to initialize Firebase Admin SDK with default credentials...');
    // In a Firebase-hosted environment (like Cloud Functions, App Engine, or Firebase Hosting with server-side rendering),
    // default credentials should work if the service account has appropriate permissions.
    // For local development, ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
    // and points to your service account key JSON file.
    adminApp = initializeApp();
    console.log('[AdminActions] Firebase Admin SDK initialized successfully using default credentials.');
  } catch (e: any) {
    console.warn(`[AdminActions] Default Admin SDK initialization failed: ${e.message}. This is expected if not in a Firebase-managed environment or GOOGLE_APPLICATION_CREDENTIALS is not set. Operations requiring admin privileges will fail.`);
    // adminApp will remain undefined, and subsequent checks for it will handle this.
  }
} else {
  console.log('[AdminActions] Getting existing Firebase Admin SDK app instance...');
  adminApp = getApps()[0]; // Get the default app if already initialized
  if (adminApp) {
    console.log('[AdminActions] Existing Firebase Admin SDK app instance retrieved.');
  } else {
     console.warn('[AdminActions] getApps() returned an array, but the first element was null/undefined. This is unexpected.');
  }
}
// --- End Firebase Admin SDK Initialization ---

export async function getAdminFirestore() { // MADE ASYNC
  if (!adminApp) {
    // Attempt to re-initialize if adminApp is somehow not set (e.g. hot reload issue)
    // This is a fallback, ideally it's initialized above.
    if (getApps().length) {
        adminApp = getApps()[0];
    } else {
        try {
            adminApp = initializeApp();
            console.log('[AdminActions] Re-initialized adminApp in getAdminFirestore.');
        } catch (e: any) {
            console.error('[AdminActions] CRITICAL: Failed to initialize adminApp in getAdminFirestore.', e);
            throw new Error('Firebase Admin SDK is not initialized. Cannot get Admin Firestore.');
        }
    }
  }
  if (!adminApp) { // Still not initialized after re-attempt
    throw new Error('Firebase Admin SDK is not initialized. Cannot get Admin Firestore.');
  }
  return getAdminFirestoreSDK(adminApp);
}


export async function seedDatabaseAction(): Promise<{ success: boolean; message: string }> {
  console.log('[AdminActions] Attempting to seed database (called from seedDatabaseAction)...');
  try {
    // seedDatabase itself needs to use admin context if it's writing data restricted by rules
    await seedDatabase(); // We'll update seedDatabase to use admin context
    console.log('[AdminActions] Database seeding process completed from seedDatabase function call.');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error: any) {
    console.error('[AdminActions] Error in seedDatabaseAction calling seedDatabase:', error);
    return { success: false, message: error.message || 'Failed to seed database.' };
  }
}

export async function setUserAdminClaimAction(uid: string): Promise<{ success: boolean; message: string }> {
  if (!adminApp) {
    const errorMessage = 'Firebase Admin SDK is not initialized. Cannot set custom claims. Ensure your server environment is configured correctly (e.g., GOOGLE_APPLICATION_CREDENTIALS).';
    console.error(`[AdminActions] setUserAdminClaimAction: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  if (!uid) {
    return { success: false, message: 'UID is required to set admin claim.' };
  }
  try {
    console.log(`[AdminActions] Attempting to set admin claim for UID: ${uid}`);
    await getAdminAuth(adminApp).setCustomUserClaims(uid, { admin: true });
    console.log(`[AdminActions] Successfully set admin claim for UID: ${uid}`);
    return { success: true, message: `Admin claim set for ${uid}. Please log out and log back in for changes to take effect.` };
  } catch (error: any) {
    console.error(`[AdminActions] Error setting admin claim for UID ${uid}:`, error);
    return { success: false, message: error.message || `Failed to set admin claim for ${uid}.` };
  }
}
    
