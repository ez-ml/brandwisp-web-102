"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type Role = "admin" | "owner" | "member" | null;

interface AuthContextType {
  user: User | null;
  role: Role;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  logout: () => {},
});

// Check if we're in development mode without proper Firebase config
// Force development mode for testing
const isDevelopmentMode = true; // process.env.NODE_ENV === 'development' && 
  // (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your-api-key-here');

// Helper function to create a proper mock user object with all required methods
const createMockUserFromData = (userData: any): User => {
  return {
    ...userData,
    getIdToken: async () => 'test-token',
    reload: async () => {},
    delete: async () => {},
    toJSON: () => ({}),
    // Ensure all required User properties are present
    emailVerified: userData.emailVerified || false,
    isAnonymous: userData.isAnonymous || false,
    metadata: userData.metadata || {},
    providerData: userData.providerData || [],
    refreshToken: userData.refreshToken || '',
    tenantId: userData.tenantId || null,
  } as User;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext useEffect triggered, isDevelopmentMode:', isDevelopmentMode);
    
    if (isDevelopmentMode || !auth) {
      console.log('In development mode, checking localStorage for mock user');
      // In development mode or when Firebase is disabled, check localStorage for mock user
      try {
        const mockUser = localStorage.getItem('mockUser');
        console.log('mockUser from localStorage:', mockUser);
        if (mockUser) {
          try {
            const parsedUser = JSON.parse(mockUser);
            console.log('Parsed mock user:', parsedUser);
            
            // Create a proper mock user object with all methods
            const reconstructedUser = createMockUserFromData(parsedUser);
            
            setUser(reconstructedUser);
            setRole('member'); // Default role for mock users
            console.log('Set mock user and role');
          } catch (e) {
            console.error('Error parsing mock user:', e);
            // Clear invalid mock user data
            localStorage.removeItem('mockUser');
          }
        } else {
          console.log('No mock user found in localStorage');
        }
      } catch (e) {
        console.error('Error accessing localStorage:', e);
      }
      setLoading(false);
      console.log('Set loading to false');
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser && db) {
          try {
            const docRef = doc(db, "users", firebaseUser.uid);
            const userSnap = await getDoc(docRef);
            setRole((userSnap.data()?.role as Role) || "member");
          } catch (error) {
            console.error('Error fetching user role:', error);
            setRole('member');
          }
        } else {
          setRole(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up Firebase auth listener:', error);
      setLoading(false);
    }
  }, []);

  const logout = () => {
    if (isDevelopmentMode || !auth) {
      // In development mode, clear localStorage
      try {
        localStorage.removeItem('mockUser');
        setUser(null);
        setRole(null);
      } catch (error) {
        console.error('Error clearing mock user:', error);
      }
    } else {
      signOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
