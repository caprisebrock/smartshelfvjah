import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "./useUser";

export function useProtectedRoute() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // ✅ Wait until loading is done before redirect
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  return { user, loading };
} 