import { useEffect, useState, useCallback } from "react";
import { getPublicJobPosts, type JobPost, type GetJobsParams } from "../service/jobPost.service";
import { applyForJob, type ApplyForJobPayload } from "../service/jobApplication.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
    resumeUrl: "",
    coverLetter: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError(null);

    if (!form.fullName.trim() || !form.email.trim()) {
      setError("Full name and email are required.");
      return;
    }

    const payload: ApplyForJobPayload = {
      jobId: job.id,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      ...(form.phone && { phone: form.phone.trim() }),
      ...(form.resumeUrl && { resumeUrl: form.resumeUrl.trim() }),
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{job.companyName}</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {[
            { label: "Full name *", name: "fullName", type: "text", placeholder: "Your full name" },
            { label: "Email *", name: "email", type: "email", placeholder: "you@email.com" },
            { label: "Phone", name: "phone", type: "tel", placeholder: "+91 9876543210" },
            { label: "Resume URL", name: "resumeUrl", type: "url", placeholder: "https://drive.google.com/..." },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm text-gray-600 mb-1">{label}</label>
              <input
                name={name}
                type={type}
                value={form[name as keyof typeof form]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Cover letter</label>
            <textarea
              name="coverLetter"
              value={form.coverLetter}
              onChange={handleChange}
              placeholder="Brief note about yourself..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Submitting..." : "Submit application"}
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
  "Full-Time": "bg-blue-50 text-blue-700",
  "Part-Time": "bg-amber-50 text-amber-700",
  Internship: "bg-teal-50 text-teal-700",
  Contract: "bg-purple-50 text-purple-700",
  Remote: "bg-green-50 text-green-700",
};

const expColors: Record<string, string> = {
  Fresher: "bg-green-50 text-green-700",
  Junior: "bg-teal-50 text-teal-700",
  Mid: "bg-blue-50 text-blue-700",
  Senior: "bg-purple-50 text-purple-700",
};

const JobCard = ({ job, applied, onApply }: JobCardProps) => {
  const salaryLabel =
    job.salaryMin && job.salaryMax
      ? `₹${job.salaryMin.toLocaleString()} – ₹${job.salaryMax.toLocaleString()}`
      : job.salaryMin
      ? `From ₹${job.salaryMin.toLocaleString()}`
      : null;

  const deadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 flex flex-col gap-3">
      {/* Title & Company */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 leading-tight">{job.title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{job.companyName}</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs bg-gray-100 text-gray-600 rounded-md px-2 py-0.5">
          📍 {job.location}
        </span>
        <span className={`text-xs rounded-md px-2 py-0.5 ${typeColors[job.jobType] ?? "bg-gray-100 text-gray-600"}`}>
          {job.jobType}
        </span>
        <span className={`text-xs rounded-md px-2 py-0.5 ${expColors[job.experienceLevel] ?? "bg-gray-100 text-gray-600"}`}>
          {job.experienceLevel}
        </span>
        {salaryLabel && (
          <span className="text-xs bg-emerald-50 text-emerald-700 rounded-md px-2 py-0.5">
            {salaryLabel}
          </span>
        )}
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.skills.slice(0, 4).map((s) => (
            <span key={s} className="text-xs bg-slate-50 text-slate-500 border border-slate-100 rounded px-2 py-0.5">
              {s}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Deadline */}
      {deadline && (
        <p className="text-xs text-gray-400">Deadline: {deadline}</p>
      )}

      {/* CTA */}
      <div className="mt-auto pt-1">
        {applied ? (
          <div className="w-full text-center text-sm text-emerald-600 bg-emerald-50 rounded-lg py-2 font-medium">
            ✓ Applied
          </div>
        ) : (
          <button
            onClick={() => onApply(job)}
            className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Apply now
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */

const JOB_TYPES = ["Full-Time", "Part-Time", "Internship", "Contract", "Remote"] as const;
const EXP_LEVELS = ["Fresher", "Junior", "Mid", "Senior"] as const;

const JobSeekerDashboardPage = () => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  // Applied job IDs (persisted in localStorage)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem("appliedJobIds") || "[]"))
  );

  // Apply modal state
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  /* Fetch jobs */
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
      // Handle both array and paginated responses
      const list: JobPost[] = Array.isArray(data) ? data : data.data ?? data.jobs ?? [];
      setJobs(list);
    } catch (err: any) {
      setError("Failed to load jobs. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [search, jobType, experienceLevel]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /* Mark a job as applied locally */
  const handleApplySuccess = (jobId: string) => {
    setAppliedIds((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      localStorage.setItem("appliedJobIds", JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Apply Modal */}
      {selectedJob && (
        <ApplyModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSuccess={handleApplySuccess}
        />
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Job dashboard</h1>
            <p className="text-gray-500 mt-1">Find and apply for jobs that match your skills</p>
          </div>
          <div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await logout();
                } finally {
                  navigate('/login');
                }
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, company, or location..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />

          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All job types</option>
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>

          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All levels</option>
            {EXP_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Results Count */}
        {!loading && !error && (
          <p className="text-sm text-gray-400 mb-4">
            {jobs.length > 0
              ? `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`
              : "No jobs match your filters"}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            Loading jobs...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={fetchJobs}
              className="text-sm text-blue-600 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Job Grid */}
        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applied={appliedIds.has(job.id)}
                onApply={setSelectedJob}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <p className="text-base">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerDashboardPage;