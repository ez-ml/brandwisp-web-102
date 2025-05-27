#!/bin/bash

echo "🔐 Phase 2: Setting up Authentication & Authorization..."

# Create necessary directories
mkdir -p src/context src/hooks src/middleware src/components/Auth

# ---------------------------
# 1. Auth Context (Context API)
# ---------------------------
cat <<EOF > src/context/AuthContext.tsx
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(docRef);
        setRole((userSnap.data()?.role as Role) || "member");
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
EOF

# ---------------------------
# 2. Role Middleware
# ---------------------------
cat <<EOF > src/middleware/withRole.tsx
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const withRole = (Component: any, allowedRoles: string[]) => {
  return function RoleProtectedComponent(props: any) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!user || !allowedRoles.includes(role ?? ""))) {
        router.push("/unauthorized");
      }
    }, [user, role, loading]);

    if (loading || !user) return null;

    return <Component {...props} />;
  };
};
EOF

# ---------------------------
# 3. Basic Login/Register Component
# ---------------------------
cat <<EOF > src/components/Auth/LoginRegister.tsx
"use client";

import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          role: "member",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <input
        className="border p-2 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <input
        className="border p-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button className="bg-purple-600 text-white px-4 py-2 rounded">
        {isLogin ? "Login" : "Register"}
      </button>
      <p className="text-sm underline cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Create account" : "Have an account? Log in"}
      </p>
    </form>
  );
}
EOF

# ---------------------------
# 4. Add to App
# ---------------------------
echo "✅ Done. Remember to:"
echo "- Wrap your app layout in <AuthProvider> from src/context/AuthContext"
echo "- Use <LoginRegister /> component in your /login or /auth page"
echo "- Add Firebase Auth to your Firebase Console (Email/Password sign-in)"
