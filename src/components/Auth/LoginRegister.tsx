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
