import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, Mail, FileText, 
  ExternalLink, ChevronRight, Loader2, Calendar,
  CheckCircle2, XCircle, Clock, Star, ArrowUpRight
} from "lucide-react";
import type { 
  JobApplication, JobApplicationStatus 
} from "../service/jobApplication.service";

/* ================= CONSTANTS & HELPERS ================= */
const APPLICATION_STATUSES: JobApplicationStatus[] = [
  "Applied", "Reviewed", "Shortlisted", "Rejected", "Hired",
];

const STATUS_CONFIG: Record<JobApplicationStatus, { color: string; icon: any }> = {
  Applied: { color: "blue", icon: Clock },
  Reviewed: { color: "purple", icon: Search },
  Shortlisted: { color: "amber", icon: Star },
  Rejected: { color: "rose", icon: XCircle },
  Hired: { color: "emerald", icon: CheckCircle2 },
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

/* ================= COMPONENT ================= */
interface ApplicationsTabProps {
  jobId: string;
  applications: JobApplication[] | null;
  loadingApps: boolean;
  updatingId: string | null;
  onStatusUpdate: (id: string, status: JobApplicationStatus) => Promise<void>;
}

const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  applications,
  loadingApps,
  updatingId,
  onStatusUpdate,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | JobApplicationStatus>("All");

  const filtered = useMemo(() => {
    if (!applications) return [];
    return applications.filter((app) => {
      const matchSearch = !search || 
        [app.fullName, app.email, app.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "All" || app.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applications, search, statusFilter]);

  if (loadingApps) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse rounded-full" />
        </div>
        <p className="mt-6 text-sm font-semibold text-slate-400 uppercase tracking-widest">Processing Data</p>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center border-2 border-dashed border-slate-100 rounded-3xl">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 mb-6">
          <Users className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Waiting for talent</h3>
        <p className="mt-2 max-w-xs text-slate-500 text-sm">Once candidates start applying for this position, you'll see them listed here with their profiles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="h-13 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <button
            onClick={() => setStatusFilter("All")}
            className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              statusFilter === "All" 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            All Applicants
          </button>
          {APPLICATION_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-bold transition-all border ${
                statusFilter === s 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                  : "bg-white border-transparent text-slate-500 hover:border-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Applications */}
      <motion.div layout className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((app) => {
            const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.Applied;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  {/* Profile Section */}
                  <div className="flex flex-1 gap-5">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                      {app.fullName?.[0] || app.email?.[0]}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {app.fullName || "Anonymous Applicant"}
                        </h4>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset bg-${config.color}-50 text-${config.color}-700 ring-${config.color}-200`}>
                          <StatusIcon className="h-3 w-3" />
                          {app.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {app.email}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(app.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Update */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                    {app.resumeUrl && (
                      <a 
                        href={app.resumeUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-600 hover:scale-105 active:scale-95"
                      >
                        <FileText className="h-4 w-4" />
                        Review Resume
                        <ArrowUpRight className="h-4 w-4 opacity-50" />
                      </a>
                    )}
                    
                    <div className="relative min-w-[160px]">
                      <select
                        value={app.status}
                        disabled={updatingId === app.id}
                        onChange={(e) => onStatusUpdate(app.id, e.target.value as JobApplicationStatus)}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-500/10 cursor-pointer disabled:opacity-50"
                      >
                        {APPLICATION_STATUSES.map((s) => (
                          <option key={s} value={s}>Move to {s}</option>
                        ))}
                      </select>
                      {updatingId === app.id ? (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-indigo-600" />
                      ) : (
                        <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 rotate-90" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ApplicationsTab;