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
import { app } from './firebase';

const auth = getAuth(app);
const db = getFirestore(app);

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

// Create/update user profile in Firestore
async function updateUserProfile(user: User, additionalData = {}) {
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
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Password Reset
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign Out
export async function signOut() {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get Current User Profile
export async function getCurrentUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as UserProfile : null;
}

// Update User Profile
export async function updateUserData(data: Partial<UserProfile>) {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  await updateUserProfile(user, data);
  return { success: true };
} 