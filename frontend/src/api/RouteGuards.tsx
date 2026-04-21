import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();

  // 1. Wait for the initial authentication check to finish
  if (loading) {
    return <div>Loading...</div>; // Replace with your actual loading spinner/skeleton
  }

  // 2. If the user is already logged in, redirect them away from guest pages
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Otherwise, let them see the guest page (Login/Register)
  return <>{children}</>;
}

export function ProtectedRoute({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();

  // 1. Wait for the initial authentication check to finish
  if (loading) {
    return <div>Loading...</div>; // Replace with your actual loading spinner/skeleton
  }

  // 2. If no user is found, kick them back to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Otherwise, render the protected content
  return <>{children}</>;
}