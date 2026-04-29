import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { loginUser } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";

type LoginFormData = {
  email: string;
  password: string;
};

/* ── Role-based redirect map ── */
const getRoleRedirect = (role: string): string => {
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

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const { setUser } = useAuth();

  /* ── If already logged in, redirect immediately ── */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    })();

    if (token && user?.role) {
      navigate(getRoleRedirect(user.role), { replace: true });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setErrorMessage("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    if (!formData.password.trim()) {
      setErrorMessage("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      /* ── Persist token + user returned by the backend ── */
      const { accessToken, user } = response?.data ?? {};
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        // Update AuthContext immediately so app routing reacts to login
        setUser(user as any);
      }

      setSuccessMessage(response?.data?.message || "Login successful");

      /* ── Redirect based on role ── */
      const redirect = getRoleRedirect(user?.role ?? "");
      setTimeout(() => navigate(redirect, { replace: true }), 800);
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-30 -top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-25 top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl sm:h-104 sm:w-104" />
        <div className="absolute -bottom-30 left-[20%] h-72 w-72 rounded-full bg-violet-500/20 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.25),rgba(2,6,23,0.96))]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* ── Left Side ── */}
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                <ShieldCheck className="h-4 w-4" />
                Secure candidate and recruiter access
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-wide">HireHub</h1>
                  <p className="text-sm text-slate-400">Modern Job Portal Platform</p>
                </div>
              </div>

              <h2 className="mt-8 text-5xl font-extrabold leading-tight tracking-tight text-white">
                Welcome back to your
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  {" "}hiring journey
                </span>
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-300">
                Log in to manage your profile, explore opportunities, track
                applications, and connect with companies through a modern hiring
                experience.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  {
                    color: "bg-cyan-400",
                    title: "Track your applications",
                    desc: "View application progress, shortlisted roles, and hiring updates in one place.",
                  },
                  {
                    color: "bg-emerald-400",
                    title: "Access recruiter workflows",
                    desc: "Post jobs, manage applicants, and review hiring activity with a clean dashboard.",
                  },
                  {
                    color: "bg-violet-400",
                    title: "Faster and secure access",
                    desc: "Built for modern authentication flow with token-based access and refresh handling.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Side / Form ── */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-6 sm:p-8">

                {/* Mobile Logo */}
                <div className="mb-6 flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">HireHub</h1>
                    <p className="text-xs text-slate-400">Modern Job Portal Platform</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Welcome Back
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-white">
                    Sign in to your account
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Enter your credentials to continue your hiring journey.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-white/[0.07]">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Password
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-white/[0.07]">
                      <Lock className="h-5 w-5 text-slate-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-slate-400 transition hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember / Forgot */}
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-400">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-cyan-500 focus:ring-cyan-500"
                      />
                      Remember me
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Signing in..." : "Login"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;