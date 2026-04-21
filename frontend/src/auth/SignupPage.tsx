import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { registerUser } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";

type RegisterFormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "job_poster" | "job_seeker";
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

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "job_seeker",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setErrorMessage("Full name is required");
      return false;
    }
    if (formData.fullName.trim().length < 2) {
      setErrorMessage("Full name must be at least 2 characters");
      return false;
    }
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
    if (!formData.confirmPassword.trim()) {
      setErrorMessage("Confirm password is required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return false;
    }
    if (!formData.role) {
      setErrorMessage("Please select a role");
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

      const payload = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      const response = await registerUser(payload);

      /* ── If backend returns token + user on register, persist them ── */
      const { accessToken, user } = response?.data ?? {};
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user as any);
      }

      setSuccessMessage(
        response?.data?.message || "Account created successfully! Redirecting..."
      );

      /* ── Redirect based on the role they signed up with ── */
      const redirect = getRoleRedirect(formData.role);
      setTimeout(() => navigate(redirect, { replace: true }), 1200);
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Registration failed. Please try again.";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background Decorative Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-30 -top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-25 top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl sm:h-104 sm:w-104" />
        <div className="absolute -bottom-30 left-[20%] h-72 w-72 rounded-full bg-violet-500/20 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.25),rgba(2,6,23,0.96))]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* ── Left Side Content ── */}
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                <ShieldCheck className="h-4 w-4" />
                <span>Create your account and get started</span>
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
                Start your{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  professional journey
                </span>
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-300">
                Join as a job seeker to discover opportunities or as a job poster
                to find the best talent — all from one modern platform.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  {
                    color: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
                    title: "Job Seeker — Find your next role",
                    desc: "Browse open positions, apply with one click, and track all your applications in one place.",
                  },
                  {
                    color: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]",
                    title: "Job Poster — Hire with confidence",
                    desc: "Post jobs, manage applicants, pause or close listings, and control your hiring pipeline.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`} />
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
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-6 sm:p-8">

                {/* Mobile Logo */}
                <div className="mb-6 flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">HireHub</h1>
                    <p className="text-xs text-slate-400">Modern Job Portal</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Create Account
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-white">Register</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Join as a job seeker or job poster and begin your journey.
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

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">

                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="mb-1.5 ml-1 block text-xs font-medium text-slate-400">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-white/[0.07]">
                      <User className="h-5 w-5 text-slate-400" />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="mb-1.5 ml-1 block text-xs font-medium text-slate-400">
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

                  {/* Role — uses actual DB enum values */}
                  <div>
                    <label htmlFor="role" className="mb-1.5 ml-1 block text-xs font-medium text-slate-400">
                      I want to
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-white/[0.07]">
                      <UserPlus className="h-5 w-5 text-slate-400" />
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-white outline-none"
                      >
                        <option value="job_seeker" className="bg-slate-900">
                          Find a job (Job Seeker)
                        </option>
                        <option value="job_poster" className="bg-slate-900">
                          Hire talent (Job Poster)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="mb-1.5 ml-1 block text-xs font-medium text-slate-400">
                      Password
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-white/[0.07]">
                      <Lock className="h-5 w-5 text-slate-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-slate-400 transition hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 ml-1 block text-xs font-medium text-slate-400">
                      Confirm Password
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-white/[0.07]">
                      <Lock className="h-5 w-5 text-slate-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="text-slate-400 transition hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                  >
                    Login
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

export default SignupPage;