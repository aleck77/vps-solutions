
'use server';

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestoreSDK, FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { seedDatabase } from '@/lib/seed';

// --- Begin Firebase Admin SDK Initialization ---
let adminApp: App;

if (!getApps().length) {
  try {
    console.log('[AdminActions] Attempting to initialize Firebase Admin SDK with default credentials...');
    // Removed storageBucket property as it's not needed without Storage actions
    adminApp = initializeApp();
    console.log('[AdminActions] Firebase Admin SDK initialized successfully using default credentials.');
  } catch (e: any) {
    console.warn(`[AdminActions] Default Admin SDK initialization failed: ${e.message}. This is expected if not in a Firebase-managed environment or GOOGLE_APPLICATION_CREDENTIALS is not set. Operations requiring admin privileges will fail.`);
  }
} else {
  console.log('[AdminActions] Getting existing Firebase Admin SDK app instance...');
  adminApp = getApps()[0];
  if (adminApp) {
    console.log('[AdminActions] Existing Firebase Admin SDK app instance retrieved.');
  } else {
     console.warn('[AdminActions] getApps() returned an array, but the first element was null/undefined. This is unexpected.');
  }
}
// --- End Firebase Admin SDK Initialization ---

async function ensureAdminAppInitialized(): Promise<App> {
    if (adminApp) {
        return adminApp;
    }

    if (getApps().length) {
        adminApp = getApps()[0];
        if (adminApp) return adminApp;
    }
    
    try {
        console.log('[AdminActions] Re-initializing adminApp...');
        adminApp = initializeApp();
        return adminApp;
    } catch (e: any) {
        console.error('[AdminActions] CRITICAL: Failed to initialize adminApp.', e);
        throw new Error('Firebase Admin SDK is not initialized and could not be re-initialized.');
    }
}


export async function getAdminFirestore() {
  const app = await ensureAdminAppInitialized();
  return getAdminFirestoreSDK(app);
}

export { AdminFieldValue };

export async function seedDatabaseAction(): Promise<{ success: boolean; message: string; details?: string[] }> {
  console.log('[AdminActions] Attempting to seed database (called from seedDatabaseAction)...');
  try {
    const result = await seedDatabase();
    console.log('[AdminActions] Database seeding process completed from seedDatabase function call.');
    return { 
        success: true, 
        message: result.status, 
        details: result.details 
    };
  } catch (error: any) {
    console.error('[AdminActions] Error in seedDatabaseAction calling seedDatabase:', error);
    return { success: false, message: error.message || 'Failed to seed database.' };
  }
}

export async function setUserAdminClaimAction(uid: string): Promise<{ success: boolean; message: string }> {
  const app = await ensureAdminAppInitialized();
  if (!uid) {
    return { success: false, message: 'UID is required to set admin claim.' };
  }
  try {
    console.log(`[AdminActions] Attempting to set admin claim for UID: ${uid}`);
    await getAdminAuth(app).setCustomUserClaims(uid, { admin: true });
    console.log(`[AdminActions] Successfully set admin claim for UID: ${uid}`);
    return { success: true, message: `Admin claim set for ${uid}. Please log out and log back in for changes to take effect.` };
  } catch (error: any) {
    console.error(`[AdminActions] Error setting admin claim for UID ${uid}:`, error);
    return { success: false, message: error.message || `Failed to set admin claim for ${uid}.` };
  }
}
