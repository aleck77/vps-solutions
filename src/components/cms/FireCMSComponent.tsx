'use client';

import { FirebaseCMSApp } from 'firecms';
import { useAuth } from '@/lib/authContext';
import 'firecms/styles.css';

import { useMemo } from 'react';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { postCollection } from './collections/postCollection';
import { categoryCollection } from './collections/categoryCollection';
import { pageCollection } from './collections/pageCollection';

export default function FireCMSComponent() {
  const { user, isAdmin } = useAuth();

  const firebaseConfig = useMemo(() => ({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }), []);

  const collections = useMemo(() => {
    return [postCollection, categoryCollection, pageCollection];
  }, []);

  const firestore = useMemo(() => {
    try {
      return getFirestore(getApp());
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }, []);

  if (!user || !isAdmin) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p>You must be an authenticated administrator to view the CMS.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <FirebaseCMSApp
        name="VHost Solutions CMS"
        authentication={({ user }) => {
          console.log("Authenticated user with UID:", user?.uid);
          return true;
        }}
        collections={collections}
        firebaseConfig={firebaseConfig}
        firestore={firestore}
      />
    </div>
  );
}