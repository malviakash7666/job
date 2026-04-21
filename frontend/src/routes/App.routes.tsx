import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../auth/LoginPage";
import SignupPage from "../auth/SignupPage";
import JobPostDashboardPage from "../pages/JobPostDashboardPage";
import JobSeekerDashboardPage from "../pages/JobSeekerDashboardPage";
import ProtectedRoute from "./Protected.routes";

const App = () => {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const getRedirectForRole = (r: any) => {
    if (!r) return "/";
    if (r === "job_poster" || r === "admin") return "/dashboard";
    if (r === "job_seeker") return "/jobseeker";
    return "/";
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* If already logged in → redirect */}
      <Route
        path="/login"
        element={token ? <Navigate to={getRedirectForRole(user?.role)} /> : <LoginPage />}
      />

      <Route
        path="/signup"
        element={token ? <Navigate to={getRedirectForRole(user?.role)} /> : <SignupPage />}
      />

      {/* JOB DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["job_poster", "admin"]}>
            <JobPostDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobseeker"
        element={
          <ProtectedRoute allowedRoles={["job_seeker"]}>
            <JobSeekerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Future writer dashboard */}
      <Route
        path="/writer-dashboard"
        element={
          <ProtectedRoute allowedRoles={["writer"]}>
            <div className="p-10 text-xl font-semibold">Writer Dashboard (Coming Soon)</div>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;