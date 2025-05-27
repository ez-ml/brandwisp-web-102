"use client";

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
