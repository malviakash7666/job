import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  X,
  FileText,
  Link,
  Upload,
  Trash2,
} from "lucide-react";
import { getSingleJobPost, type JobPost } from "../service/jobPost.service";
import { applyForJob, type ApplyForJobPayload } from "../service/jobApplication.service";

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
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
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
  onSuccess: () => void;
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
      onSuccess();
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
            className="flex-2 rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError("Job ID not found");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getSingleJobPost(jobId);
        setJob(data?.data || data);
        // Check if already applied
        const appliedIds = JSON.parse(localStorage.getItem("appliedJobIds") || "[]");
        setApplied(appliedIds.includes(jobId));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleApplySuccess = () => {
    setApplied(true);
    const appliedIds = JSON.parse(localStorage.getItem("appliedJobIds") || "[]");
    if (!appliedIds.includes(jobId)) {
      appliedIds.push(jobId);
      localStorage.setItem("appliedJobIds", JSON.stringify(appliedIds));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm font-semibold text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-red-500 mb-4">{error || "Job not found"}</p>
          <button
            onClick={() => navigate("/jobseeker")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const salaryLabel =
    job.salaryMin && job.salaryMax
      ? `₹${job.salaryMin.toLocaleString()} – ₹${job.salaryMax.toLocaleString()}`
      : job.salaryMin
      ? `From ₹${job.salaryMin.toLocaleString()}`
      : null;

  const deadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <button
            onClick={() => navigate("/jobseeker")}
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Jobs
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">{job.title}</h1>
              <p className="mt-1 text-lg text-gray-600">{job.companyName}</p>
            </div>
            {applied ? (
              <div className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600 whitespace-nowrap">
                <CheckCircle2 className="h-4 w-4" />
                Applied
              </div>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 whitespace-nowrap"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Left: Job Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-400 font-semibold mb-1">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="font-bold text-gray-900">{job.location}</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-400 font-semibold mb-1">Type</p>
                <p className="font-bold text-gray-900">{job.jobType}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-400 font-semibold mb-1">Level</p>
                <p className="font-bold text-gray-900">{job.experienceLevel}</p>
              </div>
              {salaryLabel && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-600 font-semibold mb-1">Salary</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <p className="font-bold text-emerald-700 text-sm">{salaryLabel}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-black text-gray-900 mb-3">Description</h2>
                <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                  {job.description}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-black text-gray-900 mb-3">Responsibilities</h2>
                <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                  {job.responsibilities}
                </p>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-black text-gray-900 mb-3">Requirements</h2>
                <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                  {job.requirements}
                </p>
              </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-black text-gray-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* Application Status */}
            {applied && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <p className="font-bold text-emerald-900">Application Submitted</p>
                </div>
                <p className="text-sm text-emerald-700">
                  Thank you for applying! We'll review your application and get back to you soon.
                </p>
              </div>
            )}

            {/* Job Details Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-black text-gray-900 mb-4">Job Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 mt-1 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">Company</p>
                    <p className="font-bold text-gray-900">{job.companyName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 mt-1 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">Experience</p>
                    <p className="font-bold text-gray-900">{job.experienceLevel}</p>
                  </div>
                </div>
                {deadline && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-1 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Deadline</p>
                      <p className="font-bold text-gray-900">{deadline}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button (Mobile) */}
            {!applied && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 md:hidden"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
};

export default JobDetailPage;
