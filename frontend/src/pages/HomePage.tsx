import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  { label: "Active Jobs", value: "12K+" },
  { label: "Hiring Companies", value: "4.8K+" },
  { label: "Job Seekers", value: "20K+" },
  { label: "Successful Hires", value: "8K+" },
];

const features = [
  {
    icon: Search,
    title: "Smart Job Search",
    description:
      "Search jobs by role, location, skills, and experience with a clean and fast hiring experience.",
  },
  {
    icon: Briefcase,
    title: "Top Career Opportunities",
    description:
      "Explore openings from startups, growing companies, and enterprise teams in one platform.",
  },
  {
    icon: Building2,
    title: "Verified Companies",
    description:
      "Apply with confidence using trusted company profiles, hiring insights, and open positions.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Platform",
    description:
      "Built with a professional candidate and recruiter workflow for a reliable experience.",
  },
];

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Infosys",
  "TCS",
  "Accenture",
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-100px] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute right-[-120px] top-[40px] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute bottom-[-120px] left-[20%] h-72 w-72 rounded-full bg-violet-500/20 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.2),rgba(2,6,23,0.92))]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold tracking-wide sm:text-lg">
                HireHub
              </h1>
              <p className="truncate text-[11px] text-slate-400 sm:text-xs">
                Modern Job Portal Platform
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Features
            </a>
            <a
              href="#companies"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Companies
            </a>
            <a
              href="#stats"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Stats
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:inline-flex"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 sm:px-5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
          {/* Left */}
          <div className="relative z-10">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-300 sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="truncate">
                Smarter hiring. Better opportunities. Faster growth.
              </span>
            </div>

            <h2 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find the right job and
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                {" "}
                grow your career
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base lg:text-lg">
              Discover thousands of jobs, connect with verified companies, and
              apply through a hiring experience designed for modern candidates
              and recruiters.
            </p>

            {/* Search Box */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl">
              <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Job title, keyword, or skill"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                  Search Jobs
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400 sm:text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Verified Companies
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Easy Applications
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Recruiter Dashboard
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="relative z-10 mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-4 sm:p-6">
                {/* Top Mini Bar */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      Featured Opportunity
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                      Frontend Developer
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                    Full Time
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20">
                        <Building2 className="h-5 w-5 text-indigo-300" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-white">
                          NovaTech Solutions
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Nagpur, India
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-800/80 p-3">
                        <p className="text-xs text-slate-400">Salary</p>
                        <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                          ₹6 - ₹10 LPA
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-800/80 p-3">
                        <p className="text-xs text-slate-400">Experience</p>
                        <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                          1 - 3 Years
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 text-xs uppercase tracking-[0.15em] text-slate-400">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["React", "TypeScript", "Tailwind", "Redux"].map(
                          (skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <button className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                      Apply Now
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/15 p-2.5">
                          <Users className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">
                            New Applicants
                          </p>
                          <h4 className="text-lg font-bold text-white">
                            2,540+
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-500/15 p-2.5">
                          <TrendingUp className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Hiring Growth</p>
                          <h4 className="text-lg font-bold text-white">
                            +28.4%
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-5 left-4 right-4 hidden rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur-xl sm:block lg:left-auto lg:right-[-40px] lg:top-1/2 lg:w-56 lg:-translate-y-1/2">
                <p className="text-xs text-slate-400">Top Match Score</p>
                <h4 className="mt-1 text-2xl font-bold text-white">94%</h4>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Your profile strongly matches this role based on skills and
                  experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies */}
      <section
        id="companies"
        className="relative border-y border-white/10 bg-white/[0.03]"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          <p className="text-center text-xs uppercase tracking-[0.35em] text-slate-400 sm:text-sm">
            Trusted by growing teams and global brands
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {companies.map((company) => (
              <div
                key={company}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Why Choose HireHub
          </p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything needed for modern hiring
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
            A professional platform for candidates and recruiters with clean
            workflows, trusted companies, and better visibility.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-indigo-500/20">
                  <Icon className="h-6 w-6 text-cyan-300" />
                </div>

                <h4 className="text-lg font-semibold text-white">
                  {feature.title}
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section
        id="stats"
        className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-10"
      >
        <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.03] p-6 sm:p-8 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-6"
            >
              <h4 className="text-3xl font-extrabold text-white">
                {item.value}
              </h4>
              <p className="mt-2 text-sm text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-violet-500/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Start Your Journey
          </p>

          <h3 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Build your future with the right opportunity
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Create your profile, explore quality openings, and connect with
            companies that are actively hiring.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;