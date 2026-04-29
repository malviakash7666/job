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

const jobsAPI = axios.create({
  baseURL: "http://localhost:5000/api/v1/jobs",
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

const formatSalary = (min?: number | null, max?: number | null) => {
  if (!min && !max) return "Not disclosed";
  if (min && max) {
    return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")}`;
  }
  if (min) return `From ₹${min.toLocaleString("en-IN")}`;
  return `Up to ₹${max?.toLocaleString("en-IN")}`;
};

const getStatusBadgeClasses = (status: JobApplicationStatus) => {
  switch (status) {
    case "Applied":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "Reviewed":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "Shortlisted":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "Rejected":
      return "bg-red-50 text-red-700 ring-red-200";
    case "Hired":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
};

const getJobStatusClasses = (status?: JobStatus) => {
  switch (status) {
    case "Open":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "Closed":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "Draft":
      return "bg-slate-50 text-slate-700 ring-slate-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
};

/* ================= COMPONENT ================= */

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

  const fetchApplications = async (jobId: string) => {
    try {
      setApplicationsLoading(true);
      setApplicationsError("");

      const response = await getApplicationsByJob(jobId);
      const applicationList = Array.isArray(response?.data) ? response.data : [];

      setApplications(applicationList);
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
    } else {
      setApplications([]);
    }
  }, [selectedJobId]);

  const filteredJobs = useMemo(() => {
    const search = jobSearch.trim().toLowerCase();

    if (!search) return jobs;

    return jobs.filter((job) => {
      return (
        job.title?.toLowerCase().includes(search) ||
        job.companyName?.toLowerCase().includes(search) ||
        job.location?.toLowerCase().includes(search) ||
        job.jobType?.toLowerCase().includes(search) ||
        job.experienceLevel?.toLowerCase().includes(search)
      );
    });
  }, [jobs, jobSearch]);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId),
    [jobs, selectedJobId]
  );

  const filteredApplications = useMemo(() => {
    const search = applicantSearch.trim().toLowerCase();

    if (!search) return applications;

    return applications.filter((application) => {
      return (
        application.fullName?.toLowerCase().includes(search) ||
        application.email?.toLowerCase().includes(search) ||
        application.phone?.toLowerCase().includes(search) ||
        application.status?.toLowerCase().includes(search)
      );
    });
  }, [applications, applicantSearch]);

  const applicationStats = useMemo(() => {
    return {
      total: applications.length,
      applied: applications.filter((a) => a.status === "Applied").length,
      reviewed: applications.filter((a) => a.status === "Reviewed").length,
      shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
      hired: applications.filter((a) => a.status === "Hired").length,
    };
  }, [applications]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Applicants Management
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                View all applicants job-wise and manage recruitment visibility in
                one place.
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

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Jobs</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {jobs.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Open Jobs</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {jobs.filter((job) => job.status === "Open").length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Closed Jobs</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {jobs.filter((job) => job.status === "Closed").length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Selected Job Applicants</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {applicationStats.total}
              </p>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left: Jobs */}
          <div className="xl:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      My Jobs
                    </h2>
                    <p className="text-sm text-slate-500">
                      Select a job to view applicants
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {filteredJobs.length}
                  </div>
                </div>

                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Search jobs..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="max-h-[700px] overflow-y-auto p-4">
                {jobsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse rounded-2xl border border-slate-200 p-4"
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
                    <p className="mt-1 text-sm text-slate-500">
                      Try a different search or create a new job post.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => {
                      const isActive = selectedJobId === job.id;

                      return (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => setSelectedJobId(job.id)}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            isActive
                              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3
                                className={`truncate text-base font-semibold ${
                                  isActive ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {job.title || "Untitled Job"}
                              </h3>

                              <div
                                className={`mt-2 flex flex-wrap items-center gap-3 text-sm ${
                                  isActive ? "text-slate-200" : "text-slate-600"
                                }`}
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <Building2 className="h-4 w-4" />
                                  {job.companyName || "N/A"}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  {job.location || "N/A"}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                    isActive
                                      ? "bg-white/10 text-white ring-white/20"
                                      : getJobStatusClasses(job.status)
                                  }`}
                                >
                                  {job.status || "N/A"}
                                </span>

                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                    isActive
                                      ? "bg-white/10 text-white"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {job.jobType || "N/A"}
                                </span>

                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                    isActive
                                      ? "bg-white/10 text-white"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {job.experienceLevel || "N/A"}
                                </span>
                              </div>

                              <div
                                className={`mt-4 flex items-center justify-between text-xs ${
                                  isActive ? "text-slate-300" : "text-slate-500"
                                }`}
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarDays className="h-4 w-4" />
                                  Deadline: {formatDate(job.deadline)}
                                </span>

                                <span className="inline-flex items-center gap-1">
                                  View Applicants
                                  <ChevronRight className="h-4 w-4" />
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

          {/* Right: Applicants */}
          <div className="xl:col-span-8">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              {!selectedJob ? (
                <div className="p-10 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    Select a job
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Choose any job from the left panel to see all applicants.
                  </p>
                </div>
              ) : (
                <>
                  {/* Selected Job Header */}
                  <div className="border-b border-slate-200 p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-slate-900">
                            {selectedJob.title || "Untitled Job"}
                          </h2>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getJobStatusClasses(
                              selectedJob.status
                            )}`}
                          >
                            {selectedJob.status || "N/A"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="h-4 w-4" />
                            {selectedJob.companyName || "N/A"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {selectedJob.location || "N/A"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4" />
                            {selectedJob.jobType || "N/A"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            Deadline: {formatDate(selectedJob.deadline)}
                          </span>
                        </div>

                        {selectedJob.description ? (
                          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                            {selectedJob.description}
                          </p>
                        ) : null}

                        <div className="mt-4 text-sm font-medium text-slate-700">
                          Salary:{" "}
                          <span className="font-semibold text-slate-900">
                            {formatSalary(
                              selectedJob.salaryMin,
                              selectedJob.salaryMax
                            )}
                          </span>
                        </div>

                        {selectedJob.skills && selectedJob.skills.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {selectedJob.skills.map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {applicationStats.total}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                          <p className="text-xs text-slate-500">Applied</p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {applicationStats.applied}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                          <p className="text-xs text-slate-500">Reviewed</p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {applicationStats.reviewed}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                          <p className="text-xs text-slate-500">Shortlisted</p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {applicationStats.shortlisted}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                          <p className="text-xs text-slate-500">Hired</p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {applicationStats.hired}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-5">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={applicantSearch}
                        onChange={(e) => setApplicantSearch(e.target.value)}
                        placeholder="Search applicants by name, email, phone or status..."
                        className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
                      />
                    </div>
                  </div>

                  {/* Applicants List */}
                  <div className="p-5 sm:p-6">
                    {applicationsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="animate-pulse rounded-2xl border border-slate-200 p-5"
                          >
                            <div className="h-4 w-1/3 rounded bg-slate-200" />
                            <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
                            <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
                          </div>
                        ))}
                      </div>
                    ) : applicationsError ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {applicationsError}
                      </div>
                    ) : filteredApplications.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                        <Users className="mx-auto h-10 w-10 text-slate-300" />
                        <h3 className="mt-3 text-base font-semibold text-slate-900">
                          No applicants found
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {applications.length === 0
                            ? "No one has applied for this job yet."
                            : "Try changing your search keyword."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredApplications.map((application) => (
                          <div
                            key={application.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h3 className="text-lg font-semibold text-slate-900">
                                    {application.fullName}
                                  </h3>
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusBadgeClasses(
                                      application.status
                                    )}`}
                                  >
                                    {application.status}
                                  </span>
                                </div>

                                <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                                  <div className="inline-flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span className="truncate">
                                      {application.email}
                                    </span>
                                  </div>

                                  <div className="inline-flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span>{application.phone || "N/A"}</span>
                                  </div>

                                  <div className="inline-flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                    <span>
                                      Applied on {formatDate(application.createdAt)}
                                    </span>
                                  </div>

                                  <div className="inline-flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    <span>
                                      Applicant ID: {application.applicantId}
                                    </span>
                                  </div>
                                </div>

                                {application.coverLetter ? (
                                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                                    <p className="mb-2 text-sm font-semibold text-slate-900">
                                      Cover Letter
                                    </p>
                                    <p className="text-sm leading-6 text-slate-600">
                                      {application.coverLetter}
                                    </p>
                                  </div>
                                ) : null}
                              </div>

                              <div className="flex shrink-0 flex-col gap-3 lg:w-48">
                                {application.resumeUrl ? (
                                  <a
                                    href={application.resumeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    View Resume
                                  </a>
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-2.5 text-center text-sm text-slate-500">
                                    Resume not uploaded
                                  </div>
                                )}

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                                  <p className="font-semibold text-slate-800">
                                    Current Status
                                  </p>
                                  <p className="mt-1">{application.status}</p>
                                </div>
                              </div>
                            </div>
                          </div>
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