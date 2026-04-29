import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  Plus,
  MapPin,
  Filter,
  Eye,
  Pencil,
  PauseCircle,
  Loader2,
  LogOut,
  Users,
  Building2,
  TrendingUp,
  X,
  Clock3,
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  CalendarCheck,
  BarChart2,
  Settings,
  Bell,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getAllJobPosts,
  getMyJobPosts,
  getSingleJobPost,
  createJobPost,
  updateJobPost,
  type JobPost,
  type JobStatus,
  type JobType,
  type ExperienceLevel,
  type CreateJobPostPayload,
  type UpdateJobPostPayload,
} from "../../service/jobPost.service";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type ModalMode = "create" | "edit";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const drawerTransition: any = { type: "spring", damping: 28, stiffness: 260 };
const modalTransition: any = { type: "spring", damping: 32, stiffness: 280 };

const formatSalary = (min?: number | null, max?: number | null) => {
  if (!min && !max) return "Not disclosed";
  if (min && max)
    return `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
  if (min) return `From ₹${min.toLocaleString("en-IN")}`;
  return `Up to ₹${max?.toLocaleString("en-IN")}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClasses = (status?: JobStatus) => {
  switch (status) {
    case "Open":    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "Paused":  return "bg-amber-100 text-amber-700 border border-amber-200";
    case "Closed":  return "bg-red-100 text-red-600 border border-red-200";
    default:        return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

/* ─────────────────────────────────────────
   JOB FORM STATE (create / edit)
───────────────────────────────────────── */
interface JobFormState {
  title: string;
  description: string;
  companyName: string;
  location: string;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin: string;
  salaryMax: string;
  skills: string;
  requirements: string;
  responsibilities: string;
  deadline: string;
  status: JobStatus;
}

const defaultJobForm: JobFormState = {
  title: "", description: "", companyName: "", location: "",
  jobType: "Full-Time", experienceLevel: "Fresher",
  salaryMin: "", salaryMax: "", skills: "", requirements: "",
  responsibilities: "", deadline: "", status: "Open",
};

const jobFromPost = (job: JobPost): JobFormState => ({
  title: job.title || "",
  description: job.description || "",
  companyName: job.companyName || "",
  location: job.location || "",
  jobType: job.jobType || "Full-Time",
  experienceLevel: job.experienceLevel || "Fresher",
  salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
  salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
  skills: (job.skills || []).join(", "),
  requirements: job.requirements || "",
  responsibilities: job.responsibilities || "",
  deadline: job.deadline ? job.deadline.substring(0, 10) : "",
  status: job.status || "Open",
});

/* ─────────────────────────────────────────
   REUSABLE FIELD WRAPPER
───────────────────────────────────────── */
const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
      {label}{required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const inputCls =
  "h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";
const textareaCls =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none";
const selectCls =
  "h-10 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

/* ─────────────────────────────────────────
   SIDEBAR NAV ITEM
───────────────────────────────────────── */
const NavItem: React.FC<{ icon: React.ElementType; label: string; active?: boolean }> = ({
  icon: Icon, label, active,
}) => (
  <button
    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
      active ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
    }`}
  >
    <Icon className="h-4.5 w-4.5 shrink-0" />
    {label}
  </button>
);

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
const StatCard: React.FC<{
  label: string; value: number; icon: React.ElementType; accent: string; delay: number;
}> = ({ label, value, icon: Icon, accent, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
  >
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const JobPostDashboardPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = (user as any)?.role === "admin";

  /* ── Job list state ── */
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | JobStatus>("All");

  /* ── View drawer ── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState<JobPost | null>(null);

  /* ── Create / Edit job modal ── */
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<ModalMode>("create");
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [jobForm, setJobForm] = useState<JobFormState>(defaultJobForm);
  const [jobFormErrors, setJobFormErrors] = useState<Partial<Record<keyof JobFormState, string>>>({});
  const [jobFormSubmitting, setJobFormSubmitting] = useState(false);
  const [jobFormError, setJobFormError] = useState<string | null>(null);

  /* ── Misc ── */
  const [applicantsLoadingRowId, setApplicantsLoadingRowId] = useState<string | null>(null);

  /* ─────── Data ─────── */
  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = isAdmin ? await getAllJobPosts() : await getMyJobPosts();
      setJobs(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to sync jobs", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const stats = useMemo(() => ({
    total: jobs.length,
    open: jobs.filter((j) => j.status === "Open").length,
    paused: jobs.filter((j) => j.status === "Paused").length,
    closed: jobs.filter((j) => j.status === "Closed").length,
  }), [jobs]);

  const filteredJobs = useMemo(() => jobs.filter((j) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      [j.title, j.companyName, j.location, j.jobType, j.experienceLevel]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    const matchesStatus = statusFilter === "All" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [jobs, search, statusFilter]);

  /* ─────── Job form helpers ─────── */
  const setJobField = <K extends keyof JobFormState>(key: K, value: JobFormState[K]) => {
    setJobForm((prev) => ({ ...prev, [key]: value }));
    if (jobFormErrors[key]) setJobFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateJobForm = (): boolean => {
    const errors: Partial<Record<keyof JobFormState, string>> = {};
    if (!jobForm.title.trim()) errors.title = "Title is required";
    if (!jobForm.description.trim()) errors.description = "Description is required";
    if (!jobForm.companyName.trim()) errors.companyName = "Company name is required";
    if (!jobForm.location.trim()) errors.location = "Location is required";
    if (jobForm.salaryMin && isNaN(Number(jobForm.salaryMin))) errors.salaryMin = "Must be a number";
    if (jobForm.salaryMax && isNaN(Number(jobForm.salaryMax))) errors.salaryMax = "Must be a number";
    setJobFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildJobPayload = (): CreateJobPostPayload => ({
    title: jobForm.title.trim(),
    description: jobForm.description.trim(),
    companyName: jobForm.companyName.trim(),
    location: jobForm.location.trim(),
    jobType: jobForm.jobType,
    experienceLevel: jobForm.experienceLevel,
    salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : null,
    salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : null,
    skills: jobForm.skills ? jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
    requirements: jobForm.requirements.trim() || undefined,
    responsibilities: jobForm.responsibilities.trim() || undefined,
    deadline: jobForm.deadline || undefined,
    status: jobForm.status,
  });

  const handleJobFormSubmit = async () => {
    if (!validateJobForm()) return;
    setJobFormSubmitting(true);
    setJobFormError(null);
    try {
      const payload = buildJobPayload();
      if (formModalMode === "create") {
        await createJobPost(payload);
      } else if (editingJob) {
        await updateJobPost(editingJob.id, payload as UpdateJobPostPayload);
      }
      await loadJobs();
      closeJobFormModal();
    } catch (err: any) {
      setJobFormError(err?.response?.data?.message || err?.message || "Something went wrong.");
    } finally {
      setJobFormSubmitting(false);
    }
  };

  /* ─────── Modal / drawer open-close ─────── */
  const resetDrawer = () => { setDrawerOpen(false); setTimeout(() => setViewingJob(null), 300); };

  const handleOpenView = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await getSingleJobPost(id);
      setViewingJob(res?.data || res);
      setDrawerOpen(true);
    } catch (error) {
      console.error("Failed to open job view", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCreateModal = () => {
    setFormModalMode("create");
    setEditingJob(null);
    setJobForm(defaultJobForm);
    setJobFormErrors({});
    setJobFormError(null);
    setFormModalOpen(true);
  };

  const openEditModal = (job: JobPost) => {
    setFormModalMode("edit");
    setEditingJob(job);
    setJobForm(jobFromPost(job));
    setJobFormErrors({});
    setJobFormError(null);
    setFormModalOpen(true);
  };

  const closeJobFormModal = () => {
    setFormModalOpen(false);
    setTimeout(() => { setEditingJob(null); setJobFormError(null); }, 260);
  };

  const handleOpenApplicantsPage = (job: JobPost) => {
    setApplicantsLoadingRowId(job.id);
    navigate(`/dashboard/jobs/${job.id}`);
  };

  /* ─────── RENDER ─────── */
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-900">

      {/* ══ SIDEBAR ══ */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-5">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-black tracking-tight text-gray-900">Job Portal</span>
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={ClipboardList} label="Job Postings" />
          <NavItem icon={UserCheck} label="Candidates" />
          <NavItem icon={CalendarCheck} label="Interviews" />
          <NavItem icon={BarChart2} label="Reports" />
          <NavItem icon={Settings} label="Settings" />
        </nav>
        <div className="mt-auto pt-4">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h1 className="text-base font-black text-gray-900">Recruiter Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search…"
                className="h-9 w-56 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-black">
                {(user as any)?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              {(user as any)?.name || "User"}
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900">Job Applications</h2>
              <p className="mt-0.5 text-sm text-gray-500">Manage your open roles and review candidates.</p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Post New Role
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard label="Total Roles" value={stats.total} icon={Briefcase} accent="bg-blue-50 text-blue-600" delay={0.04} />
            <StatCard label="Open" value={stats.open} icon={TrendingUp} accent="bg-emerald-50 text-emerald-600" delay={0.08} />
            <StatCard label="Paused" value={stats.paused} icon={PauseCircle} accent="bg-amber-50 text-amber-600" delay={0.12} />
            <StatCard label="Closed" value={stats.closed} icon={Clock3} accent="bg-red-50 text-red-500" delay={0.16} />
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Job Listings</p>
                <p className="text-xs text-gray-400">{filteredJobs.length} role{filteredJobs.length !== 1 ? "s" : ""} found</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by job title…"
                    className="h-9 w-52 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="relative flex items-center">
                  <Filter className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="h-9 appearance-none rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-6 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="All">All Status</option>
                    <option value="Open">Open</option>
                    <option value="Paused">Paused</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["#", "Candidate / Role", "Applied For", "Details", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-xs font-black uppercase tracking-wider text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="inline-flex flex-col items-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                          <p className="text-sm font-semibold text-gray-400">Loading jobs…</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="inline-flex flex-col items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-bold text-gray-700">No roles found</p>
                          <p className="text-xs text-gray-400">
                            Try adjusting your filters, or{" "}
                            <button onClick={openCreateModal} className="font-semibold text-blue-600 underline underline-offset-2">
                              post a new role
                            </button>.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job, idx) => (
                      <motion.tr
                        key={job.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.025 }}
                        className="group bg-white transition-colors hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-4 text-sm font-semibold text-gray-400">{idx + 1}.</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">
                              {job.title?.charAt(0)?.toUpperCase() || "J"}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{job.title}</p>
                              <p className="text-xs text-gray-400">{job.companyName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-700">{job.jobType}</p>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-700">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                          <p className="text-xs text-gray-400">Deadline: {formatDate(job.deadline)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(job.status)}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                            {job.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {/* View profile */}
                            <button
                              onClick={() => handleOpenView(job.id)}
                              title="View job details"
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                              {actionLoadingId === job.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                              View
                            </button>

                            {/* Applicants page */}
                            <button
                              onClick={() => handleOpenApplicantsPage(job)}
                              title="View applicants"
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-bold text-blue-600 transition hover:border-blue-300 hover:bg-blue-100"
                            >
                              {applicantsLoadingRowId === job.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Users className="h-3 w-3" />
                              )}
                              <span className="hidden lg:inline">Applicants</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(job)}
                              title="Edit role"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DRAWER — View Job Details
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {drawerOpen && viewingJob && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={resetDrawer}
              className="fixed inset-0 z-[60] bg-gray-900/30 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={drawerTransition}
              className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-2xl flex-col border-l border-gray-200 bg-white shadow-2xl"
            >
              <div className="border-b border-gray-100 px-6 pb-5 pt-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-black text-gray-900">{viewingJob.title}</h2>
                      <p className="mt-0.5 text-sm font-semibold text-blue-600">{viewingJob.companyName}</p>
                    </div>
                  </div>
                  <button
                    onClick={resetDrawer}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Location", value: viewingJob.location, isStatus: false },
                    { label: "Salary", value: formatSalary(viewingJob.salaryMin, viewingJob.salaryMax), isStatus: false },
                    { label: "Status", value: viewingJob.status, isStatus: true },
                  ].map(({ label, value, isStatus }) => (
                    <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                      {isStatus ? (
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${getStatusClasses(viewingJob.status)}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                            {value}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1.5 text-sm font-semibold text-gray-800">{value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-4 pb-8">
                  <section className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Job Overview</h3>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {[
                        { label: "Job type", value: viewingJob.jobType },
                        { label: "Experience level", value: viewingJob.experienceLevel },
                        { label: "Deadline", value: formatDate(viewingJob.deadline) },
                        { label: "Company", value: viewingJob.companyName },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                          <p className="mt-1.5 text-sm font-semibold text-gray-800">{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-xl border border-gray-100 bg-white p-5">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Description</h3>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                      {viewingJob.description || "No description available."}
                    </p>
                  </section>
                  {viewingJob.requirements && (
                    <section className="rounded-xl border border-gray-100 bg-white p-5">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Requirements</h3>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">{viewingJob.requirements}</p>
                    </section>
                  )}
                  {viewingJob.responsibilities && (
                    <section className="rounded-xl border border-gray-100 bg-white p-5">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Responsibilities</h3>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">{viewingJob.responsibilities}</p>
                    </section>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          MODAL — Create / Edit Role
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {formModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeJobFormModal}
              className="fixed inset-0 z-[80] bg-gray-900/40 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 lg:p-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                transition={modalTransition}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
              >
                <div className="h-1 w-full bg-blue-600" />
                <div className="border-b border-gray-100 px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                        {formModalMode === "create" ? <Plus className="h-5 w-5" /> : <Pencil className="h-5 w-5" />}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-gray-900">
                          {formModalMode === "create" ? "Post a New Role" : `Edit: ${editingJob?.title || "Role"}`}
                        </h2>
                        <p className="text-sm text-gray-400">
                          {formModalMode === "create"
                            ? "Fill in the details to publish a new job listing."
                            : "Update the role details and save your changes."}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeJobFormModal}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Job Title" required>
                        <input type="text" value={jobForm.title} onChange={(e) => setJobField("title", e.target.value)}
                          placeholder="e.g. Senior Frontend Engineer"
                          className={`${inputCls} ${jobFormErrors.title ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                        />
                        {jobFormErrors.title && <p className="mt-1 text-xs text-red-500">{jobFormErrors.title}</p>}
                      </Field>
                    </div>
                    <Field label="Company Name" required>
                      <input type="text" value={jobForm.companyName} onChange={(e) => setJobField("companyName", e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className={`${inputCls} ${jobFormErrors.companyName ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                      />
                      {jobFormErrors.companyName && <p className="mt-1 text-xs text-red-500">{jobFormErrors.companyName}</p>}
                    </Field>
                    <Field label="Location" required>
                      <input type="text" value={jobForm.location} onChange={(e) => setJobField("location", e.target.value)}
                        placeholder="e.g. Mumbai, Remote"
                        className={`${inputCls} ${jobFormErrors.location ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                      />
                      {jobFormErrors.location && <p className="mt-1 text-xs text-red-500">{jobFormErrors.location}</p>}
                    </Field>
                    <Field label="Job Type">
                      <select value={jobForm.jobType} onChange={(e) => setJobField("jobType", e.target.value as JobType)} className={selectCls}>
                        {(["Full-Time", "Part-Time", "Internship", "Contract", "Remote"] as JobType[]).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Experience Level">
                      <select value={jobForm.experienceLevel} onChange={(e) => setJobField("experienceLevel", e.target.value as ExperienceLevel)} className={selectCls}>
                        {(["Fresher", "Junior", "Mid", "Senior"] as ExperienceLevel[]).map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Salary Min (₹)" hint="Leave blank to hide">
                      <input type="number" value={jobForm.salaryMin} onChange={(e) => setJobField("salaryMin", e.target.value)}
                        placeholder="e.g. 500000"
                        className={`${inputCls} ${jobFormErrors.salaryMin ? "border-red-300" : ""}`}
                      />
                      {jobFormErrors.salaryMin && <p className="mt-1 text-xs text-red-500">{jobFormErrors.salaryMin}</p>}
                    </Field>
                    <Field label="Salary Max (₹)" hint="Leave blank to hide">
                      <input type="number" value={jobForm.salaryMax} onChange={(e) => setJobField("salaryMax", e.target.value)}
                        placeholder="e.g. 900000"
                        className={`${inputCls} ${jobFormErrors.salaryMax ? "border-red-300" : ""}`}
                      />
                      {jobFormErrors.salaryMax && <p className="mt-1 text-xs text-red-500">{jobFormErrors.salaryMax}</p>}
                    </Field>
                    <Field label="Application Deadline">
                      <input type="date" value={jobForm.deadline} onChange={(e) => setJobField("deadline", e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Status">
                      <select value={jobForm.status} onChange={(e) => setJobField("status", e.target.value as JobStatus)} className={selectCls}>
                        {(["Open", "Paused", "Closed"] as JobStatus[]).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Skills" hint="Comma-separated, e.g. React, TypeScript, Node.js">
                        <input type="text" value={jobForm.skills} onChange={(e) => setJobField("skills", e.target.value)}
                          placeholder="React, TypeScript, Node.js" className={inputCls}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Description" required>
                        <textarea rows={4} value={jobForm.description} onChange={(e) => setJobField("description", e.target.value)}
                          placeholder="Describe the role, team, and impact…"
                          className={`${textareaCls} ${jobFormErrors.description ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                        />
                        {jobFormErrors.description && <p className="mt-1 text-xs text-red-500">{jobFormErrors.description}</p>}
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Requirements" hint="Optional – one per line">
                        <textarea rows={3} value={jobForm.requirements} onChange={(e) => setJobField("requirements", e.target.value)}
                          placeholder={"3+ years of React experience\nStrong TypeScript skills"} className={textareaCls}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Responsibilities" hint="Optional – one per line">
                        <textarea rows={3} value={jobForm.responsibilities} onChange={(e) => setJobField("responsibilities", e.target.value)}
                          placeholder={"Build and maintain frontend features\nCollaborate with design team"} className={textareaCls}
                        />
                      </Field>
                    </div>
                  </div>
                  {jobFormError && (
                    <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <p className="text-sm font-semibold text-red-600">{jobFormError}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
                  <button onClick={handleJobFormSubmit} disabled={jobFormSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {jobFormSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {formModalMode === "create" ? "Publish Role" : "Save Changes"}
                  </button>
                  <button onClick={closeJobFormModal} disabled={jobFormSubmitting}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-100 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobPostDashboardPage;