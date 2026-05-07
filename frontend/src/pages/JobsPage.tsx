import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  SlidersHorizontal,
  X,
  // Building2,
  // Loader2,
  AlertCircle,
} from "lucide-react";
import { getPublicJobPosts } from "../service/jobPost.service";
import type { JobPost, JobType, ExperienceLevel } from "../service/jobPost.service";

/* ================= TYPES ================= */

type SortOption = "Most Recent" | "Oldest" | "Salary High" | "Salary Low";

interface Filters {
  keyword: string;
  location: string;
  jobTypes: JobType[];
  experienceLevels: ExperienceLevel[];
  salaryMin: string;
  salaryMax: string;
}

/* ================= CONSTANTS ================= */

const JOB_TYPES: { value: JobType; label: string; count?: number }[] = [
  { value: "Full-Time", label: "Full Time" },
  { value: "Part-Time", label: "Part Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
  { value: "Remote", label: "Remote" },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "Fresher", label: "Fresher" },
  { value: "Junior", label: "1-3 Years" },
  { value: "Mid", label: "3-5 Years" },
  { value: "Senior", label: "5+ Years" },
];

const SORT_OPTIONS: SortOption[] = [
  "Most Recent",
  "Oldest",
  "Salary High",
  "Salary Low",
];

/* ================= HELPERS ================= */

const formatSalary = (min?: number | null, max?: number | null): string => {
  const fmt = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  };
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return "Not disclosed";
};

const timeAgo = (date?: string): string => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

/* ================= COMPANY LOGO ================= */

const companyColors = [
  { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" },
  { bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-200" },
  { bg: "bg-rose-100", text: "text-rose-700", ring: "ring-rose-200" },
  { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" },
  { bg: "bg-teal-100", text: "text-teal-700", ring: "ring-teal-200" },
  { bg: "bg-indigo-100", text: "text-indigo-700", ring: "ring-indigo-200" },
];

const CompanyLogo: React.FC<{ name: string; size?: "sm" | "md" }> = ({
  name,
  size = "md",
}) => {
  const idx = (name?.charCodeAt(0) ?? 0) % companyColors.length;
  const color = companyColors[idx];
  const dim = size === "md" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";
  return (
    <div
      className={`${dim} shrink-0 flex items-center justify-center rounded-xl font-bold ring-1 ${color.bg} ${color.text} ${color.ring}`}
    >
      {name?.slice(0, 2).toUpperCase() ?? "JB"}
    </div>
  );
};

/* ================= JOB CARD ================= */

interface JobCardProps {
  job: JobPost;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onClick: (job: JobPost) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, saved, onToggleSave, onClick }) => {
  return (
    <div
      onClick={() => onClick(job)}
      className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
    >
      <CompanyLogo name={job.companyName} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
              {job.title}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">{job.companyName}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job.id);
            }}
            className={`shrink-0 rounded-lg p-1.5 transition-colors ${
              saved
                ? "text-indigo-600 hover:text-indigo-800"
                : "text-slate-300 hover:text-slate-500"
            }`}
          >
            {saved ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
            {job.jobType}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {job.experienceLevel}
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          {job.createdAt && (
            <span className="flex items-center gap-1.5 ml-auto text-slate-400">
              {timeAgo(job.createdAt)}
            </span>
          )}
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= JOB DETAIL MODAL ================= */

interface JobDetailModalProps {
  job: JobPost | null;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  saved,
  onToggleSave,
  onClose,
}) => {
  if (!job) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <CompanyLogo name={job.companyName} />
            <div>
              <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
              <p className="text-sm text-slate-500">{job.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(job.id)}
              className={`rounded-lg border p-2 transition ${
                saved
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 text-slate-400 hover:border-slate-300"
              }`}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: <Briefcase className="h-3.5 w-3.5" />, label: job.jobType },
              { icon: <MapPin className="h-3.5 w-3.5" />, label: job.location },
              { icon: <Clock className="h-3.5 w-3.5" />, label: job.experienceLevel },
              { icon: <DollarSign className="h-3.5 w-3.5" />, label: formatSalary(job.salaryMin, job.salaryMax) },
            ].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
              >
                {item.icon}
                {item.label}
              </span>
            ))}
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">About the Role</h3>
              <p className="text-sm leading-6 text-slate-600 whitespace-pre-line">{job.description}</p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Requirements</h3>
              <p className="text-sm leading-6 text-slate-600 whitespace-pre-line">{job.requirements}</p>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Responsibilities</h3>
              <p className="text-sm leading-6 text-slate-600 whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= CHECKBOX FILTER ================= */

const FilterCheckbox: React.FC<{
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}> = ({ label, count, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between py-1.5 group">
    <div className="flex items-center gap-2.5">
      <div
        onClick={onChange}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
          checked
            ? "border-indigo-600 bg-indigo-600"
            : "border-slate-300 bg-white group-hover:border-indigo-400"
        }`}
      >
        {checked && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 8">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </div>
    {count !== undefined && (
      <span className="text-xs text-slate-400">({count.toLocaleString()})</span>
    )}
  </label>
);

/* ================= MAIN COMPONENT ================= */

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<Filters>({
    keyword: "",
    location: "",
    jobTypes: [],
    experienceLevels: [],
    salaryMin: "",
    salaryMax: "",
  });

  const [pendingFilters, setPendingFilters] = useState<Filters>({ ...filters });
  const [sortBy, setSortBy] = useState<SortOption>("Most Recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const LIMIT = 10;

  /* ---- Fetch ---- */
  const fetchJobs = useCallback(async (f: Filters, sort: SortOption, p: number) => {
    try {
      setLoading(true);
      setError("");
      const sortMap: Record<SortOption, { sortBy: string; sortOrder: "ASC" | "DESC" }> = {
        "Most Recent": { sortBy: "createdAt", sortOrder: "DESC" },
        Oldest: { sortBy: "createdAt", sortOrder: "ASC" },
        "Salary High": { sortBy: "salaryMax", sortOrder: "DESC" },
        "Salary Low": { sortBy: "salaryMin", sortOrder: "ASC" },
      };
      const res = await getPublicJobPosts({
        search: f.keyword || undefined,
        location: f.location || undefined,
        jobType: f.jobTypes.length === 1 ? f.jobTypes[0] : undefined,
        experienceLevel: f.experienceLevels.length === 1 ? f.experienceLevels[0] : undefined,
        ...sortMap[sort],
        page: p,
        limit: LIMIT,
      });
      const list: JobPost[] = Array.isArray(res?.data) ? res.data : [];
      setJobs(list);
      setTotal(res?.total ?? list.length);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(filters, sortBy, page);
  }, [filters, sortBy, page]);

  /* ---- Handlers ---- */
  const applyFilters = () => {
    setFilters({ ...pendingFilters });
    setPage(1);
    setMobileFiltersOpen(false);
  };

  const clearAllFilters = () => {
    const empty: Filters = {
      keyword: "",
      location: "",
      jobTypes: [],
      experienceLevels: [],
      salaryMin: "",
      salaryMax: "",
    };
    setPendingFilters(empty);
    setFilters(empty);
    setPage(1);
  };

  const toggleJobType = (val: JobType) =>
    setPendingFilters((f) => ({
      ...f,
      jobTypes: f.jobTypes.includes(val)
        ? f.jobTypes.filter((t) => t !== val)
        : [...f.jobTypes, val],
    }));

  const toggleExperience = (val: ExperienceLevel) =>
    setPendingFilters((f) => ({
      ...f,
      experienceLevels: f.experienceLevels.includes(val)
        ? f.experienceLevels.filter((e) => e !== val)
        : [...f.experienceLevels, val],
    }));

  const toggleSave = (id: string) =>
    setSavedJobs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const totalPages = Math.ceil(total / LIMIT);

  /* ---- Sidebar ---- */
  const FilterSidebar = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Filters</h2>
        <button
          onClick={clearAllFilters}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
        >
          Clear All
        </button>
      </div>

      {/* Keyword */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">Keyword</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={pendingFilters.keyword}
            onChange={(e) =>
              setPendingFilters((f) => ({ ...f, keyword: e.target.value }))
            }
            placeholder="Search keywords..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">Location</p>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={pendingFilters.location}
            onChange={(e) =>
              setPendingFilters((f) => ({ ...f, location: e.target.value }))
            }
            placeholder="Select location"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
          />
        </div>
      </div>

      {/* Job Type */}
      <div>
        <p className="mb-1 text-sm font-semibold text-slate-700">Job Type</p>
        {JOB_TYPES.map((jt) => (
          <FilterCheckbox
            key={jt.value}
            label={jt.label}
            checked={pendingFilters.jobTypes.includes(jt.value)}
            onChange={() => toggleJobType(jt.value)}
          />
        ))}
      </div>

      {/* Experience Level */}
      <div>
        <p className="mb-1 text-sm font-semibold text-slate-700">Experience Level</p>
        {EXPERIENCE_LEVELS.map((el) => (
          <FilterCheckbox
            key={el.value}
            label={el.label}
            checked={pendingFilters.experienceLevels.includes(el.value)}
            onChange={() => toggleExperience(el.value)}
          />
        ))}
      </div>

      {/* Salary Range */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">Salary Range</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={pendingFilters.salaryMin}
            onChange={(e) =>
              setPendingFilters((f) => ({ ...f, salaryMin: e.target.value }))
            }
            placeholder="Min Salary"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
          />
          <span className="shrink-0 text-xs text-slate-400">to</span>
          <input
            type="number"
            value={pendingFilters.salaryMax}
            onChange={(e) =>
              setPendingFilters((f) => ({ ...f, salaryMax: e.target.value }))
            }
            placeholder="Max Salary"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
          />
        </div>
      </div>

      {/* Apply */}
      <button
        onClick={applyFilters}
        className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        saved={selectedJob ? savedJobs.has(selectedJob.id) : false}
        onToggleSave={toggleSave}
        onClose={() => setSelectedJob(null)}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-7">

          {/* ===== Sidebar (Desktop) ===== */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <FilterSidebar />
            </div>
          </aside>

          {/* ===== Mobile Filters Drawer ===== */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-40 flex lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="relative ml-auto h-full w-80 overflow-y-auto bg-white p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          {/* ===== Main Content ===== */}
          <div className="min-w-0 flex-1">

            {/* Top bar */}
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                {loading ? (
                  <p className="text-sm text-slate-500">Loading jobs...</p>
                ) : (
                  <p className="text-sm font-medium text-slate-700">
                    <span className="font-bold text-slate-900">
                      {total.toLocaleString()}
                    </span>{" "}
                    {total === 1 ? "job" : "jobs"} found
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen((p) => !p)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Sort by: <span className="text-slate-900 font-semibold">{sortBy}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                  {sortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setSortOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSortBy(opt);
                              setSortOpen(false);
                              setPage(1);
                            }}
                            className={`flex w-full items-center px-4 py-2.5 text-sm transition hover:bg-slate-50 ${
                              sortBy === opt
                                ? "font-semibold text-indigo-700 bg-indigo-50"
                                : "text-slate-600"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {(filters.jobTypes.length > 0 || filters.experienceLevels.length > 0 || filters.keyword || filters.location) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {filters.keyword && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    "{filters.keyword}"
                    <button onClick={() => { setFilters(f => ({ ...f, keyword: "" })); setPendingFilters(f => ({ ...f, keyword: "" })); }}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    📍 {filters.location}
                    <button onClick={() => { setFilters(f => ({ ...f, location: "" })); setPendingFilters(f => ({ ...f, location: "" })); }}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.jobTypes.map((jt) => (
                  <span key={jt} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    {jt}
                    <button onClick={() => { setFilters(f => ({ ...f, jobTypes: f.jobTypes.filter(t => t !== jt) })); setPendingFilters(f => ({ ...f, jobTypes: f.jobTypes.filter(t => t !== jt) })); }}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.experienceLevels.map((el) => (
                  <span key={el} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    {el}
                    <button onClick={() => { setFilters(f => ({ ...f, experienceLevels: f.experienceLevels.filter(e => e !== el) })); setPendingFilters(f => ({ ...f, experienceLevels: f.experienceLevels.filter(e => e !== el) })); }}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Jobs List */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse gap-4 rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-1/3 rounded bg-slate-200" />
                      <div className="h-3 w-1/4 rounded bg-slate-200" />
                      <div className="flex gap-3">
                        <div className="h-3 w-16 rounded bg-slate-200" />
                        <div className="h-3 w-20 rounded bg-slate-200" />
                        <div className="h-3 w-14 rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-slate-200" />
                <h3 className="mt-4 text-base font-semibold text-slate-700">No jobs found</h3>
                <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search terms.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    saved={savedJobs.has(job.id)}
                    onToggleSave={toggleSave}
                    onClick={setSelectedJob}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-9 w-9 rounded-xl border text-sm font-medium transition ${
                        page === pageNum
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;