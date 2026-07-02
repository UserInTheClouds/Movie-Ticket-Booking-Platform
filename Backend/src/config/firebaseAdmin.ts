import { initializeApp, cert } from 'firebase-admin/app';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const serviceAccountPath = path.join(dirname, 'serviceAccountKey.json');

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized successfully from environment variable.');
  } else if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized successfully from local file.');
  } else if (process.env.FIREBASE_PROJECT_ID) {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('Firebase Admin Initialized successfully using FIREBASE_PROJECT_ID.');
  } else {
    console.warn('WARNING: FIREBASE_PROJECT_ID env var not set and serviceAccountKey.json not found. Firebase Admin is NOT initialized.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}
