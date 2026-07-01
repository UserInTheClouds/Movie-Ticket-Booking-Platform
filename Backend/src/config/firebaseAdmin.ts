import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the service account key you will download
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized successfully.');
  } else {
    console.warn('⚠️ WARNING: serviceAccountKey.json not found in src/config. Firebase Admin is NOT initialized.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

export { admin };
