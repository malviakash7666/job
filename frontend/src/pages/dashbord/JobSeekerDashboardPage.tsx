import { useEffect, useState, useCallback, useRef } from "react";
import { getPublicJobPosts, type JobPost, type GetJobsParams } from "../../service/jobPost.service";
import { applyForJob, type ApplyForJobPayload } from "../../service/jobApplication.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Search,
  MapPin,
  Briefcase,
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  CalendarCheck,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  X,
  CheckCircle2,
  Filter,
  Heart,
  MessageSquare,
  Gift,
  ChevronRight,
  Upload,
  FileText,
  Trash2,
  Link,
} from "lucide-react";

/* ─── Sidebar Nav Item ────────────────────────────────────────────────────── */
const NavItem = ({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) => (
  <button
    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
      active
        ? "bg-blue-600 text-white shadow-sm"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
    }`}
  >
    <Icon className="h-4 w-4 shrink-0" />
    {label}
  </button>
);

/* ─── Resume Upload Component ─────────────────────────────────────────────── */
type ResumeMode = "file" | "url";

interface ResumeUploaderProps {
  resumeUrl: string;
  onResumeUrlChange: (url: string) => void;
  resumeFile: File | null;
  onResumeFileChange: (file: File | null) => void;
  mode: ResumeMode;
  onModeChange: (mode: ResumeMode) => void;
}

const ResumeUploader = ({
  resumeUrl,
  onResumeUrlChange,
  resumeFile,
  onResumeFileChange,
  mode,
  onModeChange,
}: ResumeUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      alert("Only PDF or Word (.doc / .docx) files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be smaller than 5 MB.");
      return;
    }
    onResumeFileChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
        Resume
      </label>

      {/* Mode toggle */}
      <div className="mb-3 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => {
            onModeChange("file");
            onResumeUrlChange("");
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-bold transition-all ${
            mode === "file"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Upload className="h-3 w-3" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => {
            onModeChange("url");
            onResumeFileChange(null);
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-bold transition-all ${
            mode === "url"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Link className="h-3 w-3" />
          Paste URL
        </button>
      </div>

      {mode === "file" ? (
        resumeFile ? (
          /* ── File selected preview ── */
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <FileText className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-gray-800">{resumeFile.name}</p>
              <p className="text-xs text-gray-400">{formatSize(resumeFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                onResumeFileChange(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* ── Drop zone ── */
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 transition-all ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Upload className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700">
                Drop your resume here or{" "}
                <span className="text-blue-600 underline underline-offset-2">browse</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">PDF, DOC, DOCX · Max 5 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>
        )
      ) : (
        /* ── URL input ── */
        <input
          type="url"
          value={resumeUrl}
          onChange={(e) => onResumeUrlChange(e.target.value)}
          placeholder="https://drive.google.com/file/..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      )}
    </div>
  );
};

/* ─── Apply Modal ─────────────────────────────────────────────────────────── */
interface ApplyModalProps {
  job: JobPost;
  onClose: () => void;
  onSuccess: (jobId: string) => void;
}

const ApplyModal = ({ job, onClose, onSuccess }: ApplyModalProps) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
  });

  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeMode, setResumeMode] = useState<ResumeMode>("file");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /**
   * Convert a File to a base64 data-URL string so it can be sent as
   * `resumeUrl` in the existing ApplyForJobPayload.
   *
   * ⚠️  If your backend has a dedicated file-upload endpoint, replace this
   *     with an actual multipart/form-data upload and use the returned URL.
   */
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    setError(null);
    if (!form.fullName.trim() || !form.email.trim()) {
      setError("Full name and email are required.");
      return;
    }

    let resolvedResumeUrl: string | undefined;

    if (resumeMode === "file" && resumeFile) {
      try {
        resolvedResumeUrl = await fileToBase64(resumeFile);
      } catch {
        setError("Failed to process resume file. Please try again.");
        return;
      }
    } else if (resumeMode === "url" && resumeUrl.trim()) {
      resolvedResumeUrl = resumeUrl.trim();
    }

    const payload: ApplyForJobPayload = {
      jobId: job.id,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      ...(form.phone && { phone: form.phone.trim() }),
      ...(resolvedResumeUrl && { resumeUrl: resolvedResumeUrl }),
      ...(form.coverLetter && { coverLetter: form.coverLetter.trim() }),
    };

    try {
      setLoading(true);
      await applyForJob(payload);
      onSuccess(job.id);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="h-1 w-full bg-blue-600" />
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6 pb-4">
          <div>
            <h2 className="text-base font-black text-gray-900">{job.title}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{job.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Basic fields */}
            {[
              { label: "Full name *", name: "fullName", type: "text", placeholder: "Your full name" },
              { label: "Email *", name: "email", type: "email", placeholder: "you@email.com" },
              { label: "Phone", name: "phone", type: "tel", placeholder: "+91 9876543210" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                  {label}
                </label>
                <input
                  name={name}
                  type={type}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ))}

            {/* Resume uploader */}
            <ResumeUploader
              resumeUrl={resumeUrl}
              onResumeUrlChange={setResumeUrl}
              resumeFile={resumeFile}
              onResumeFileChange={setResumeFile}
              mode={resumeMode}
              onModeChange={setResumeMode}
            />

            {/* Cover letter */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                Cover letter
              </label>
              <textarea
                name="coverLetter"
                value={form.coverLetter}
                onChange={handleChange}
                placeholder="Brief note about yourself..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Job Card ────────────────────────────────────────────────────────────── */
interface JobCardProps {
  job: JobPost;
  applied: boolean;
  onApply: (job: JobPost) => void;
}

const typeColors: Record<string, string> = {
  "Full-Time": "bg-blue-50 text-blue-700 border border-blue-100",
  "Part-Time": "bg-amber-50 text-amber-700 border border-amber-100",
  Internship: "bg-teal-50 text-teal-700 border border-teal-100",
  Contract: "bg-purple-50 text-purple-700 border border-purple-100",
  Remote: "bg-green-50 text-green-700 border border-green-100",
};

const expColors: Record<string, string> = {
  Fresher: "bg-green-50 text-green-700 border border-green-100",
  Junior: "bg-teal-50 text-teal-700 border border-teal-100",
  Mid: "bg-blue-50 text-blue-700 border border-blue-100",
  Senior: "bg-purple-50 text-purple-700 border border-purple-100",
};

const TITLE_INITIALS = (title: string) =>
  title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

const CARD_ACCENT = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
  "bg-emerald-100 text-emerald-700",
];

let cardIndex = 0;
const getCardColor = () => CARD_ACCENT[cardIndex++ % CARD_ACCENT.length];

const JobCard = ({ job, applied, onApply }: JobCardProps) => {
  const [accentClass] = useState(getCardColor);

  const salaryLabel =
    job.salaryMin && job.salaryMax
      ? `₹${job.salaryMin.toLocaleString()} – ₹${job.salaryMax.toLocaleString()}`
      : job.salaryMin
      ? `From ₹${job.salaryMin.toLocaleString()}`
      : null;

  const deadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${accentClass}`}
        >
          {TITLE_INITIALS(job.title) || "J"}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black text-gray-900">{job.title}</h2>
          <p className="truncate text-xs font-semibold text-gray-400">{job.companyName}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          {job.location}
        </span>
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${typeColors[job.jobType] ?? "bg-gray-100 text-gray-600"}`}>
          {job.jobType}
        </span>
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${expColors[job.experienceLevel] ?? "bg-gray-100 text-gray-600"}`}>
          {job.experienceLevel}
        </span>
        {salaryLabel && (
          <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {salaryLabel}
          </span>
        )}
      </div>
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-xs text-slate-500"
            >
              {s}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>
          )}
        </div>
      )}
      {deadline && (
        <p className="text-xs text-gray-400">Deadline: {deadline}</p>
      )}
      <div className="mt-auto pt-1">
        {applied ? (
          <div className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-sm font-bold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Applied
          </div>
        ) : (
          <button
            onClick={() => onApply(job)}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
interface StatCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  count: number;
  label: string;
}

const StatCard = ({ icon: Icon, iconBg, iconColor, count, label }: StatCardProps) => (
  <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-xl font-black text-gray-900 leading-none">{count}</p>
      <p className="mt-0.5 text-xs text-gray-400 font-medium">{label}</p>
    </div>
  </div>
);

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const JOB_TYPES = ["Full-Time", "Part-Time", "Internship", "Contract", "Remote"] as const;
const EXP_LEVELS = ["Fresher", "Junior", "Mid", "Senior"] as const;

type DashboardView = "home" | "jobs";

const JobSeekerDashboardPage = () => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<DashboardView>("home");

  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  const [appliedIds, setAppliedIds] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem("appliedJobIds") || "[]"))
  );

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: GetJobsParams = {
        ...(search && { search }),
        ...(jobType && { jobType: jobType as any }),
        ...(experienceLevel && { experienceLevel: experienceLevel as any }),
        page: 1,
        limit: 50,
      };
      const data = await getPublicJobPosts(params);
      const list: JobPost[] = Array.isArray(data) ? data : data.data ?? data.jobs ?? [];
      setJobs(list);
    } catch {
      setError("Failed to load jobs. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [search, jobType, experienceLevel]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const userName = (user as any)?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

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
          <button
            onClick={() => setView("home")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
              view === "home"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </button>
          <button
            onClick={() => setView("jobs")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
              view === "jobs"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            <ClipboardList className="h-4 w-4 shrink-0" />
            Job Postings
          </button>
          <NavItem icon={UserCheck} label="Candidates" />
          <NavItem icon={CalendarCheck} label="Interviews" />
          <NavItem icon={BarChart2} label="Reports" />
          <NavItem icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto pt-4">
          <button
            onClick={async () => {
              try { await logout(); } finally { navigate("/login"); }
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h1 className="text-base font-black text-gray-900">
            {view === "home" ? "Dashboard" : "Job Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            {view === "jobs" && (
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs…"
                  className="h-9 w-56 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-xs font-black text-blue-700">
                {userInitial}
              </div>
              {userName}
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ══ HOME / DASHBOARD VIEW ══ */}
          {view === "home" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-900">
                  Welcome back, {userName} 👋
                </h2>
                <p className="mt-0.5 text-sm text-gray-400">Here's what's happening with your job search</p>
              </div>

              <div className="mb-8 flex flex-wrap gap-3">
                <StatCard
                  icon={Briefcase}
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                  count={appliedIds.size}
                  label="Applied Jobs"
                />
                <StatCard
                  icon={Heart}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  count={0}
                  label="Shortlisted"
                />
                <StatCard
                  icon={MessageSquare}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  count={0}
                  label="Interviews"
                />
                <StatCard
                  icon={Gift}
                  iconBg="bg-orange-100"
                  iconColor="text-orange-500"
                  count={0}
                  label="Offers"
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-black text-gray-900">My Applications</h3>
                  <button
                    onClick={() => setView("jobs")}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                  >
                    View All
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-gray-50">
                  {(() => {
                    const appliedJobs = jobs.filter((j) => appliedIds.has(j.id));
                    if (loading) {
                      return (
                        <div className="flex items-center justify-center py-10">
                          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                        </div>
                      );
                    }
                    if (appliedJobs.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <p className="text-sm font-bold text-gray-600">No applications yet</p>
                          <p className="mt-0.5 text-xs text-gray-400">Apply to jobs to see them here</p>
                          <button
                            onClick={() => setView("jobs")}
                            className="mt-3 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                          >
                            Browse Jobs
                          </button>
                        </div>
                      );
                    }
                    return appliedJobs.map((job) => {
                      const initials = job.title.split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("");
                      const appliedDate = new Date(job.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                      return (
                        <div
                          key={job.id}
                          className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-black text-blue-700">
                            {initials || "J"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900">{job.title}</p>
                            <p className="text-xs text-gray-400">{job.companyName}</p>
                          </div>
                          <p className="hidden text-xs text-gray-400 sm:block shrink-0">
                            Applied on {appliedDate}
                          </p>
                          <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            Applied
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ══ JOB LISTINGS VIEW ══ */}
          {view === "jobs" && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-black text-gray-900">Find Jobs</h2>
                <p className="mt-0.5 text-sm text-gray-500">Browse and apply for roles that match your skills.</p>
              </div>

              <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <div className="relative sm:hidden">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title, company, or location…"
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="relative hidden flex-1 sm:block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title, company, or location…"
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="relative flex items-center">
                  <Filter className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="h-10 appearance-none rounded-lg border border-gray-200 bg-white pl-8 pr-6 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All job types</option>
                    {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="relative flex items-center">
                  <Filter className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="h-10 appearance-none rounded-lg border border-gray-200 bg-white pl-8 pr-6 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All levels</option>
                    {EXP_LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {!loading && !error && (
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {jobs.length > 0
                    ? `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`
                    : "No jobs match your filters"}
                </p>
              )}

              {loading && (
                <div className="flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                    <p className="text-sm font-semibold text-gray-400">Loading jobs…</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-sm text-red-500">{error}</p>
                  <button
                    onClick={fetchJobs}
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && jobs.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      applied={appliedIds.has(job.id)}
                      onApply={() => navigate(`/job/${job.id}`)}
                    />
                  ))}
                </div>
              )}

              {!loading && !error && jobs.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-24 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">No jobs found</p>
                  <p className="mt-1 text-xs text-gray-400">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboardPage;