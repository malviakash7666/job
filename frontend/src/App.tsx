import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./auth/LoginPage";
import SignupPage from "./auth/SignupPage";
import JobPostDashboardPage from "./pages/dashbord/JobPostDashboardPage";
import RecruiterApplicantsPage from "./pages/RecruiterApplicantsPage";
import JobSeekerDashboardPage from "./pages/dashbord/JobSeekerDashboardPage";
import ProtectedRoute from "./routes/Protected.routes";
import { useAuth } from "./hooks/useAuth";

const getRoleRedirect = (role: string | undefined) => {
  if (!role) return "/";
  switch (role) {
    case "job_poster":
    case "admin":
      return "/dashboard/jobs";
    case "job_seeker":
      return "/dashboard";
    default:
      return "/";
  }
};

const App = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          loading ? (
            <div />
          ) : user ? (
            <Navigate to={getRoleRedirect((user as any)?.role)} replace />
          ) : (
            <HomePage />
          )
        }
      />

      <Route
        path="/login"
        element={
          loading ? (
            <div />
          ) : user ? (
            <Navigate to={getRoleRedirect((user as any)?.role)} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/signup"
        element={
          loading ? (
            <div />
          ) : user ? (
            <Navigate to={getRoleRedirect((user as any)?.role)} replace />
          ) : (
            <SignupPage />
          )
        }
      />

      {/* Job Poster Dashboard */}
      <Route
        path="/dashboard/jobs"
        element={
          <ProtectedRoute allowedRoles={["job_poster", "admin"]}>
            <JobPostDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/jobs/:jobId"
        element={
          <ProtectedRoute allowedRoles={["job_poster", "admin"]}>
            <RecruiterApplicantsPage />
          </ProtectedRoute>
        }
      />

      {/* Job Seeker Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["job_seeker"]}>
            <JobSeekerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;