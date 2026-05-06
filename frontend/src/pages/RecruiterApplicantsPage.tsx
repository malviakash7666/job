import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Briefcase,
  MapPin,
  Building2,
  CalendarDays,
  Users,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  RefreshCw,
  Search,
  ChevronRight,
  Eye,
  Filter,
  ChevronDown,
  UserCheck,
  Clock,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  getApplicationsByJob,
} from "../service/jobApplication.service";
import type {
  JobApplication,
  JobApplicationStatus,
} from "../service/jobApplication.service";

/* ================= TYPES ================= */

type JobStatus = "Open" | "Closed" | "Draft";

interface RecruiterJob {
  id: string;
  title: string;
  description?: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  skills?: string[];
  requirements?: string;
  responsibilities?: string;
  deadline?: string;
  status?: JobStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MyJobsResponse {
  success: boolean;
  message?: string;
  total?: number;
  currentPage?: number;
  totalPages?: number;
  data: RecruiterJob[];
}

/* ================= API ================= */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const jobsAPI = axios.create({
  baseURL: `${BACKEND_URL}/api/v1/jobs`,
  withCredentials: true,
});

jobsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getMyJobs = async (): Promise<MyJobsResponse> => {
  const res = await jobsAPI.get<MyJobsResponse>("/my/jobs");
  return res.data;
};

/* ================= HELPERS ================= */

const formatDate = (date?: string) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// const formatSalary = (min?: number | null, max?: number | null) => {
//   if (!min && !max) return "Not disclosed";
//   if (min && max)
//     return `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
//   if (min) return `From ₹${min.toLocaleString("en-IN")}`;
//   return `Up to ₹${max?.toLocaleString("en-IN")}`;
// };

const ALL_STATUSES: JobApplicationStatus[] = [
  "Applied",
  "Reviewed",
  "Shortlisted",
  "Rejected",
  "Hired",
];

const STATUS_CONFIG: Record<
  JobApplicationStatus,
  { label: string; bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
  Applied: {
    label: "Applied",
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-400",
    icon: <Clock className="h-3 w-3" />,
  },
  Reviewed: {
    label: "Reviewed",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    icon: <Eye className="h-3 w-3" />,
  },
  Shortlisted: {
    label: "Shortlisted",
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-400",
    icon: <UserCheck className="h-3 w-3" />,
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-400",
    icon: <XCircle className="h-3 w-3" />,
  },
  Hired: {
    label: "Hired",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
};

const getJobStatusClasses = (status?: JobStatus) => {
  switch (status) {
    case "Open":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "Closed":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "Draft":
      return "bg-slate-50 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-50 text-slate-600 ring-slate-200";
  }
};

/* ================= STATUS BADGE ================= */

const StatusBadge: React.FC<{ status: JobApplicationStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-400",
    icon: <AlertCircle className="h-3 w-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

/* ================= STATUS DROPDOWN ================= */

interface StatusDropdownProps {
  applicationId: string;
  currentStatus: JobApplicationStatus;
  onStatusChange: (id: string, newStatus: JobApplicationStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  applicationId,
  currentStatus,
  onStatusChange,
}) => {
  const [open, setOpen] = useState(false);
  const config = STATUS_CONFIG[currentStatus];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 ${config?.bg} ${config?.text} border-transparent`}
      >
        {config?.icon}
        {currentStatus}
        <ChevronDown className="h-3 w-3 opacity-70" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1.5 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            {ALL_STATUSES.map((status) => {
              const s = STATUS_CONFIG[status];
              return (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(applicationId, status);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium transition hover:bg-slate-50 ${
                    status === currentStatus ? "bg-slate-50 font-semibold" : ""
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  <span className={s.text}>{s.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

/* ================= APPLICANT CARD ================= */

interface ApplicantCardProps {
  application: JobApplication;
  onStatusChange: (id: string, newStatus: JobApplicationStatus) => void;
  onView: (application: JobApplication) => void;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  application,
  onStatusChange,
  onView,
}) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white">
              {application.fullName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {application.fullName}
              </h3>
              <p className="text-xs text-slate-500">
                ID: {application.applicantId}
              </p>
            </div>

            <StatusBadge status={application.status} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 text-sm text-slate-600 sm:grid-cols-2">
            <a
              href={`mailto:${application.email}`}
              className="inline-flex items-center gap-2 truncate hover:text-slate-900"
            >
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{application.email}</span>
            </a>

            <div className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              <span>{application.phone || "—"}</span>
            </div>

            <div className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Applied {formatDate(application.createdAt)}</span>
            </div>

            <div className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
              {application.resumeUrl ? (
                <span className="text-slate-700">
                  {(application as any).resumeOriginalName ?? "Resume.pdf"}
                </span>
              ) : (
                <span className="italic text-slate-400">No resume uploaded</span>
              )}
            </div>
          </div>

          {application.coverLetter && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cover Letter
              </p>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                {application.coverLetter}
              </p>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-end sm:gap-3">
          {/* Status changer */}
          <StatusDropdown
            applicationId={application.id}
            currentStatus={application.status}
            onStatusChange={onStatusChange}
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onView(application)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </button>

            {application.resumeUrl ? (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Resume
              </a>
            ) : (
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-400"
              >
                <FileText className="h-3.5 w-3.5" />
                Resume
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= APPLICANT DETAIL MODAL ================= */

interface ApplicantDetailModalProps {
  application: JobApplication | null;
  onClose: () => void;
}

const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({
  application,
  onClose,
}) => {
  if (!application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {application.fullName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                {application.fullName}
              </h3>
              <StatusBadge status={application.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Email</p>
              <p className="mt-0.5 font-medium text-slate-900 truncate">
                {application.email}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Phone</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {application.phone || "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Applied On</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {formatDate(application.createdAt)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Applicant ID</p>
              <p className="mt-0.5 truncate font-medium text-slate-900">
                {application.applicantId}
              </p>
            </div>
          </div>

          {application.coverLetter && (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cover Letter
              </p>
              <p className="text-sm leading-6 text-slate-600">
                {application.coverLetter}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {application.resumeUrl ? (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                <ExternalLink className="h-4 w-4" />
                View Resume
              </a>
            ) : (
              <div className="flex-1 rounded-2xl border border-dashed border-slate-300 px-4 py-2.5 text-center text-sm text-slate-400">
                No resume uploaded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */

const RecruiterApplicantsPage: React.FC = () => {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState<boolean>(true);
  const [jobsError, setJobsError] = useState<string>("");

  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const { jobId: routeJobId } = useParams<{ jobId?: string }>();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false);
  const [applicationsError, setApplicationsError] = useState<string>("");

  const [jobSearch, setJobSearch] = useState<string>("");
  const [applicantSearch, setApplicantSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<JobApplicationStatus | "All">("All");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  const [viewingApplication, setViewingApplication] =
    useState<JobApplication | null>(null);

  /* ---- Fetch jobs ---- */
  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      setJobsError("");
      const response = await getMyJobs();
      const jobList = Array.isArray(response?.data) ? response.data : [];
      setJobs(jobList);
      if (routeJobId) {
        setSelectedJobId(routeJobId);
      } else if (jobList.length > 0) {
        setSelectedJobId((prev) => prev || jobList[0].id);
      }
    } catch (error: any) {
      setJobsError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load recruiter jobs."
      );
    } finally {
      setJobsLoading(false);
    }
  };

  /* ---- Fetch applications ---- */
  const fetchApplications = async (jobId: string) => {
    try {
      setApplicationsLoading(true);
      setApplicationsError("");
      const response = await getApplicationsByJob(jobId);
      const list = Array.isArray(response?.data) ? response.data : [];
      setApplications(list);
    } catch (error: any) {
      setApplications([]);
      setApplicationsError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load applicants for this job."
      );
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplications(selectedJobId);
      setStatusFilter("All");
      setApplicantSearch("");
    } else {
      setApplications([]);
    }
  }, [selectedJobId]);

  /* ---- Handle inline status change ---- */
  const handleStatusChange = (id: string, newStatus: JobApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    // TODO: call API to persist status change
  };

  /* ---- Derived data ---- */
  const filteredJobs = useMemo(() => {
    const s = jobSearch.trim().toLowerCase();
    if (!s) return jobs;
    return jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(s) ||
        j.companyName?.toLowerCase().includes(s) ||
        j.location?.toLowerCase().includes(s) ||
        j.jobType?.toLowerCase().includes(s) ||
        j.experienceLevel?.toLowerCase().includes(s)
    );
  }, [jobs, jobSearch]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId),
    [jobs, selectedJobId]
  );

  const filteredApplications = useMemo(() => {
    const s = applicantSearch.trim().toLowerCase();
    return applications.filter((a) => {
      const matchesSearch =
        !s ||
        a.fullName?.toLowerCase().includes(s) ||
        a.email?.toLowerCase().includes(s) ||
        a.phone?.toLowerCase().includes(s) ||
        a.status?.toLowerCase().includes(s);
      const matchesStatus =
        statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, applicantSearch, statusFilter]);

  const stats = useMemo(() => ({
    total: applications.length,
    applied: applications.filter((a) => a.status === "Applied").length,
    reviewed: applications.filter((a) => a.status === "Reviewed").length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
    hired: applications.filter((a) => a.status === "Hired").length,
  }), [applications]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Applicant detail modal */}
      <ApplicantDetailModal
        application={viewingApplication}
        onClose={() => setViewingApplication(null)}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ===== Header ===== */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Applicants Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View all applicants job-wise and manage recruitment in one place.
              </p>
            </div>
            <button
              onClick={fetchJobs}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {/* Top stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total Jobs", value: jobs.length },
              { label: "Open Jobs", value: jobs.filter((j) => j.status === "Open").length },
              { label: "Closed Jobs", value: jobs.filter((j) => j.status === "Closed").length },
              { label: "Selected Job Applicants", value: stats.total },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Main Grid ===== */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* ===== Left: Jobs List ===== */}
          <div className="xl:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      My Jobs
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select a job to view applicants
                    </p>
                  </div>
                  <span className="rounded-2xl bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                    {filteredJobs.length}
                  </span>
                </div>

                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Search jobs..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div className="max-h-[700px] overflow-y-auto p-4">
                {jobsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-2xl border border-slate-100 p-4"
                      >
                        <div className="h-4 w-1/2 rounded bg-slate-200" />
                        <div className="mt-3 h-3 w-2/3 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-1/3 rounded bg-slate-200" />
                      </div>
                    ))}
                  </div>
                ) : jobsError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {jobsError}
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                    <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      No jobs found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try a different keyword or create a new job post.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredJobs.map((job) => {
                      const isActive = selectedJobId === job.id;
                      return (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => setSelectedJobId(job.id)}
                          className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                            isActive
                              ? "border-slate-900 bg-slate-900 shadow-md"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3
                                className={`truncate text-sm font-semibold ${
                                  isActive ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {job.title || "Untitled Job"}
                              </h3>

                              <div
                                className={`mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs ${
                                  isActive ? "text-slate-300" : "text-slate-500"
                                }`}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {job.companyName || "N/A"}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {job.location || "N/A"}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${
                                    isActive
                                      ? "bg-white/10 text-white ring-white/20"
                                      : getJobStatusClasses(job.status)
                                  }`}
                                >
                                  {job.status || "N/A"}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                                    isActive
                                      ? "bg-white/10 text-white"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {job.jobType || "N/A"}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                                    isActive
                                      ? "bg-white/10 text-white"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {job.experienceLevel || "N/A"}
                                </span>
                              </div>

                              <div
                                className={`mt-3 flex items-center justify-between text-xs ${
                                  isActive ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {formatDate(job.deadline)}
                                </span>
                                <span className="inline-flex items-center gap-0.5">
                                  View
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== Right: Applicants Panel ===== */}
          <div className="xl:col-span-8">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              {!selectedJob ? (
                <div className="p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    Select a job
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Choose a job from the left panel to view all applicants.
                  </p>
                </div>
              ) : (
                <>
                  {/* Job header */}
                  <div className="border-b border-slate-200 p-5 sm:p-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedJob.title || "Untitled Job"}
                        </h2>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${getJobStatusClasses(
                            selectedJob.status
                          )}`}
                        >
                          {selectedJob.status || "N/A"}
                        </span>
                        <span className="text-sm text-slate-500">
                          • {stats.total} Application{stats.total !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          {selectedJob.companyName || "N/A"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {selectedJob.location || "N/A"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          {selectedJob.jobType || "N/A"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-slate-400" />
                          Deadline: {formatDate(selectedJob.deadline)}
                        </span>
                      </div>
                    </div>

                    {/* Application status pills */}
                    <div className="mt-5 flex flex-wrap gap-3">
                      {[
                        { label: "Total", value: stats.total, color: "bg-slate-100 text-slate-700" },
                        { label: "Applied", value: stats.applied, color: "bg-sky-50 text-sky-700" },
                        { label: "Reviewed", value: stats.reviewed, color: "bg-amber-50 text-amber-700" },
                        { label: "Shortlisted", value: stats.shortlisted, color: "bg-violet-50 text-violet-700" },
                        { label: "Rejected", value: stats.rejected, color: "bg-red-50 text-red-700" },
                        { label: "Hired", value: stats.hired, color: "bg-emerald-50 text-emerald-700" },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className={`rounded-xl px-3 py-2 text-center ${s.color}`}
                        >
                          <p className="text-lg font-bold leading-none">
                            {s.value}
                          </p>
                          <p className="mt-1 text-xs opacity-80">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Search + filter row */}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={applicantSearch}
                          onChange={(e) => setApplicantSearch(e.target.value)}
                          placeholder="Search candidate..."
                          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        />
                      </div>

                      {/* Status filter */}
                      <div className="relative">
                        <button
                          onClick={() => setStatusFilterOpen((p) => !p)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Filter className="h-4 w-4" />
                          {statusFilter === "All" ? "All Status" : statusFilter}
                          <ChevronDown className="h-4 w-4 opacity-60" />
                        </button>

                        {statusFilterOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setStatusFilterOpen(false)}
                            />
                            <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                              {(["All", ...ALL_STATUSES] as const).map(
                                (status) => (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      setStatusFilter(status as any);
                                      setStatusFilterOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition hover:bg-slate-50 ${
                                      statusFilter === status
                                        ? "bg-slate-50 font-semibold text-slate-900"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {status !== "All" && (
                                      <span
                                        className={`h-2 w-2 rounded-full ${STATUS_CONFIG[status as JobApplicationStatus]?.dot}`}
                                      />
                                    )}
                                    {status === "All" && (
                                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                                    )}
                                    {status}
                                  </button>
                                )
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Applicants list */}
                  <div className="p-5 sm:p-6">
                    {applicationsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="animate-pulse rounded-2xl border border-slate-100 p-5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-slate-200" />
                              <div>
                                <div className="h-4 w-32 rounded bg-slate-200" />
                                <div className="mt-2 h-3 w-20 rounded bg-slate-200" />
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <div className="h-3 rounded bg-slate-200" />
                              <div className="h-3 rounded bg-slate-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : applicationsError ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {applicationsError}
                      </div>
                    ) : filteredApplications.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                        <Users className="mx-auto h-10 w-10 text-slate-300" />
                        <h3 className="mt-3 text-base font-semibold text-slate-900">
                          No applicants found
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {applications.length === 0
                            ? "No one has applied for this job yet."
                            : "Try changing your search or filter."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredApplications.map((application) => (
                          <ApplicantCard
                            key={application.id}
                            application={application}
                            onStatusChange={handleStatusChange}
                            onView={(a) => setViewingApplication(a)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterApplicantsPage;
