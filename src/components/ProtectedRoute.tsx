import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, isHydrated, hydrate } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isHydrated) {
        await hydrate();
      }

      // After hydration check again
      const currentStoredSession = localStorage.getItem("hirelink_session");
      if (!currentStoredSession && !currentUser && isHydrated) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [currentUser, isHydrated, hydrate, navigate]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-muted-foreground">
          Verifying session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
