import { initializeApp, cert } from 'firebase-admin/app';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const serviceAccountPath = path.join(dirname, 'serviceAccountKey.json');

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized successfully.');
  } else {
    console.warn('WARNING: serviceAccountKey.json not found in src/config. Firebase Admin is NOT initialized.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}
