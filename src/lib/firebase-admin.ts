import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Validate required environment variables
const requiredEnvVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required Firebase Admin environment variables: ${missingEnvVars.join(', ')}`
  );
}

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
};

export function getFirebaseAdmin() {
  try {
    if (getApps().length > 0) {
      return getApps()[0];
    }

    return initializeApp({
      credential: cert(firebaseAdminConfig),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin. Please check your configuration.');
  }
} 