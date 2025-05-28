import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Check if we're in development mode without proper Firebase config
// Force development mode for testing
const isDevelopmentMode = true; // process.env.NODE_ENV === 'development' && 
  // (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your-api-key-here');

// Debug logging
console.log('Development mode check:', {
  NODE_ENV: process.env.NODE_ENV,
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  isDevelopmentMode
});

// Provider instances
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const shopifyProvider = new OAuthProvider('shopify.com');

// User profile interface
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  storeConnections?: {
    shopify?: string;
    amazon?: string;
    etsy?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mock user for development
const createMockUser = (email: string, displayName?: string): any => ({
  uid: 'dev-user-' + Date.now(),
  email,
  displayName: displayName || email.split('@')[0],
  photoURL: null,
  getIdToken: async () => 'test-token',
  reload: async () => {},
  delete: async () => {},
  toJSON: () => ({})
});

// Create/update user profile in Firestore
async function updateUserProfile(user: User, additionalData = {}) {
  if (isDevelopmentMode) {
    console.log('Development mode: Skipping Firestore user profile update');
    return;
  }

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const userData: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date(),
    updatedAt: new Date(),
    ...additionalData
  };

  await setDoc(userRef, userData, { merge: true });
  return userData;
}

// Sign in with Google
export async function signInWithGoogle() {
  if (isDevelopmentMode) {
    console.log('Development mode: Mock Google sign-in');
    return { 
      success: true, 
      user: createMockUser('user@gmail.com', 'Test User')
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    await updateUserProfile(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign in with Facebook
export async function signInWithFacebook() {
  if (isDevelopmentMode) {
    console.log('Development mode: Mock Facebook sign-in');
    return { 
      success: true, 
      user: createMockUser('user@facebook.com', 'Facebook User')
    };
  }

  try {
    const result = await signInWithPopup(auth, facebookProvider);
    await updateUserProfile(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign in with Shopify
export async function signInWithShopify() {
  if (isDevelopmentMode) {
    console.log('Development mode: Mock Shopify sign-in');
    return { 
      success: true, 
      user: createMockUser('user@shopify.com', 'Shopify User')
    };
  }

  try {
    const result = await signInWithPopup(auth, shopifyProvider);
    await updateUserProfile(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Email/Password Sign Up
export async function signUpWithEmail(email: string, password: string, displayName: string) {
  if (isDevelopmentMode) {
    console.log('Development mode: Mock email sign-up');
    return { 
      success: true, 
      user: createMockUser(email, displayName)
    };
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await updateUserProfile(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Email/Password Sign In
export async function signInWithEmail(email: string, password: string) {
  if (isDevelopmentMode) {
    console.log('Development mode: Mock email sign-in');
    // Simple validation for demo
    if (email && password.length >= 6) {
      return { 
        success: true, 
        user: createMockUser(email)
      };
    } else {
      return { 
        success: false, 
        error: 'Invalid email or password (minimum 6 characters)' 
      };
    }
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Password Reset
export async function resetPassword(email: string) {
  if (isDevelopmentMode) {
    console.log('Development mode: Mock password reset');
    return { success: true };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign Out
export async function signOut() {
  if (isDevelopmentMode) {
    console.log('Development mode: Mock sign out');
    // In development, we'll need to manually clear the auth state
    // This would be handled by the useAuth hook
    return { success: true };
  }

  try {
    await auth.signOut();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get Current User Profile
export async function getCurrentUserProfile() {
  if (isDevelopmentMode) {
    console.log('Development mode: Mock user profile');
    return null;
  }

  const user = auth.currentUser;
  if (!user) return null;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as UserProfile : null;
}

// Update User Profile
export async function updateUserData(data: Partial<UserProfile>) {
  if (isDevelopmentMode) {
    console.log('Development mode: Mock user data update');
    return { success: true };
  }

  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  await updateUserProfile(user, data);
  return { success: true };
} 