import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Search, Plus, MapPin, IndianRupee, Filter, Eye, Pencil, Trash2, 
  PauseCircle, PlayCircle, CheckCircle2, X, Loader2, LogOut, Info, Users, 
  LayoutDashboard, MoreVertical, Building2, TrendingUp
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  getAllJobPosts, getMyJobPosts, getSingleJobPost,
  
  type JobPost, type JobStatus,
} from "../service/jobPost.service";
import updateApplicationStatus from "../service/jobPost.service";
import {
  getApplicationsByJob,
  type JobApplication,
} from "../service/jobApplication.service";
import ApplicationsTab from "../components/ApplicationsTab";

/* ================= TYPES ================= */
type DrawerMode = "create" | "edit" | "view";
type ViewTab = "details" | "applications";

const JobPostDashboardPage: React.FC = () => {
  const { logout, user } = useAuth();
  const isAdmin = (user as any)?.role === "admin";

  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | JobStatus>("All");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [viewingJob, setViewingJob] = useState<JobPost | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>("details");

  const [applications, setApplications] = useState<JobApplication[] | null>(null);
  const [loadingApps, setLoadingApps] = useState(false);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = isAdmin ? await getAllJobPosts() : await getMyJobPosts();
      setJobs(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      console.error("Failed to sync data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const stats = useMemo(() => ({
    total: jobs.length,
    open: jobs.filter(j => j.status === "Open").length,
    paused: jobs.filter(j => j.status === "Paused").length,
  }), [jobs]);

  const filteredJobs = useMemo(() => jobs.filter(j => 
    (!search || j.title.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "All" || j.status === statusFilter)
  ), [jobs, search, statusFilter]);

  const handleOpenView = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await getSingleJobPost(id);
      setViewingJob(res.data || res);
      setDrawerMode("view");
      setActiveTab("details");
      setDrawerOpen(true);
      setLoadingApps(true);
      const appRes = await getApplicationsByJob(id);
      setApplications((appRes as any).data || appRes);
    } finally {
      setActionLoadingId(null);
      setLoadingApps(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans selection:bg-indigo-100">
      {/* Navbar Decoration */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />

      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2.5 text-indigo-600 font-bold uppercase tracking-[0.2em] text-xs">
              <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              Recruitment Suite
            </div>
            <h1 className="mt-3 text-5xl font-black tracking-tight text-slate-900 lg:text-6xl">
              Hiring <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Portal.</span>
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => { setDrawerMode("create"); setDrawerOpen(true); }}
              className="group flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-200 transition-all hover:bg-indigo-600 hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              Post New Role
            </button>
            <button onClick={() => logout()} className="group rounded-2xl border border-slate-200 bg-white p-4 text-slate-400 transition-all hover:border-rose-200 hover:text-rose-600">
              <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </button>
          </motion.div>
        </header>

        {/* Stats Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { label: "Total Listings", val: stats.total, icon: Briefcase, color: "indigo" },
            { label: "Active Roles", val: stats.open, icon: TrendingUp, color: "emerald" },
            { label: "Paused", val: stats.paused, icon: PauseCircle, color: "amber" },
          ].map((s, idx) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative group overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 transition-all hover:border-transparent hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)]"
            >
              <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-${s.color}-50 opacity-0 transition-all group-hover:opacity-100 group-hover:scale-150`} />
              <div className="relative z-10">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-${s.color}-50 text-${s.color}-600 transition-transform group-hover:rotate-6`}>
                  <s.icon className="h-7 w-7" />
                </div>
                <p className="mt-8 text-xs font-black text-slate-400 uppercase tracking-[0.15em]">{s.label}</p>
                <h3 className="mt-2 text-5xl font-black text-slate-900">{s.val}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table/List View */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[40px] border border-slate-200 bg-white shadow-sm"
        >
          {/* Table Toolbar */}
          <div className="flex flex-col gap-6 border-b border-slate-50 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, department, or keywords..."
                className="h-14 w-full rounded-2xl bg-slate-50/50 pl-14 pr-6 text-sm font-medium outline-none transition focus:bg-white focus:ring-4 focus:ring-indigo-500/5 border border-transparent focus:border-indigo-100"
              />
            </div>
            
            <div className="flex items-center gap-3 self-end lg:self-auto">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <Filter className="h-4 w-4 text-indigo-500" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer min-w-[100px]"
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="Paused">Paused</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Configuration</th>
                  <th className="px-6 py-4">Hiring Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600/20" /></td></tr>
                ) : filteredJobs.map((job, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    key={job.id} 
                    className="group bg-white transition-all hover:bg-slate-50/80"
                  >
                    <td className="rounded-l-3xl px-6 py-6 border-y border-l border-slate-50 group-hover:border-indigo-100">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                          {job.title.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                          <div className="mt-1 flex items-center gap-3 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                            <span className="flex items-center gap-1 text-emerald-600 font-bold">₹{job.salaryMin?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-y border-slate-50 group-hover:border-indigo-100">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex w-fit items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-500">
                          {job.jobType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-y border-slate-50 group-hover:border-indigo-100">
                      <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 ring-1 ring-inset ${
                        job.status === "Open" 
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200" 
                          : "bg-slate-50 text-slate-600 ring-slate-200"
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${job.status === "Open" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        <span className="text-xs font-bold">{job.status}</span>
                      </div>
                    </td>
                    <td className="rounded-r-3xl px-6 py-6 border-y border-r border-slate-50 group-hover:border-indigo-100 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenView(job.id)}
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-900 hover:text-white"
                        >
                          {actionLoadingId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Drawer Components */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm" 
            />
            
            <motion.aside 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-[70] h-full w-full max-w-2xl bg-white shadow-[-20px_0_80px_rgba(0,0,0,0.1)] flex flex-col"
            >
              {drawerMode === "view" && viewingJob && (
                <>
                  <header className="relative border-b border-slate-100 px-10 pt-12 pb-8">
                    <button 
                      onClick={() => setDrawerOpen(false)} 
                      className="absolute right-6 top-6 rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                        <Building2 className="h-7 w-7" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{viewingJob.title}</h2>
                        <p className="mt-2 text-lg font-bold text-indigo-600">{viewingJob.companyName}</p>
                      </div>
                    </div>
                    
                    <div className="mt-10 flex gap-1 rounded-2xl bg-slate-100 p-1.5">
                      {(["details", "applications"] as ViewTab[]).map((tab) => (
                        <button 
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-black uppercase tracking-wider transition-all ${
                            activeTab === tab 
                              ? "bg-white text-slate-900 shadow-xl shadow-slate-200" 
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {tab === "details" ? <Info className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          {tab}
                        </button>
                      ))}
                    </div>
                  </header>

                  <div className="flex-1 overflow-y-auto px-10 py-10 no-scrollbar">
                    {activeTab === "details" ? (
                      <div className="space-y-12 pb-10">
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Location</span>
                            <p className="flex items-center gap-2.5 font-bold text-slate-800 text-lg">
                              <MapPin className="h-5 w-5 text-indigo-500" /> {viewingJob.location}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Salary</span>
                            <p className="flex items-center gap-2.5 font-bold text-slate-800 text-lg">
                              <IndianRupee className="h-5 w-5 text-emerald-500" /> {viewingJob.salaryMin} - {viewingJob.salaryMax}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Description</span>
                          <div className="rounded-[32px] bg-slate-50 p-8">
                            <p className="text-base leading-[1.8] text-slate-600 whitespace-pre-line font-medium">
                              {viewingJob.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ApplicationsTab
                        jobId={viewingJob.id}
                        applications={applications}
                        loadingApps={loadingApps}
                        updatingId={null}
                        onStatusUpdate={async (id, status) => {
                          await updateApplicationStatus(id, { status });
                          setApplications(prev => prev?.map(a => a.id === id ? { ...a, status } : a) || null);
                        }}
                      />
                    )}
                  </div>
                </>
              )}
              
              {/* Form Mode Placeholders */}
              {(drawerMode === "create" || drawerMode === "edit") && (
                <div className="p-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configure Post</h2>
                    <button onClick={() => setDrawerOpen(false)} className="p-2 bg-slate-50 rounded-full"><X /></button>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-20 w-20 bg-indigo-50 rounded-3xl flex items-center justify-center">
                      <Plus className="h-10 w-10 text-indigo-600" />
                    </div>
                    <p className="max-w-xs text-slate-500 font-medium">
                      The job creation form is ready for your input fields. Styled with the same modern input aesthetic as the search bar.
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-8 border-t border-slate-100 flex gap-4">
                    <button className="flex-1 rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white">Publish Role</button>
                    <button onClick={() => setDrawerOpen(false)} className="flex-1 rounded-2xl bg-slate-100 py-4 text-sm font-bold text-slate-600">Cancel</button>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobPostDashboardPage;