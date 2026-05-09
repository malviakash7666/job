// ============================================================
// CompanyProfilePage.tsx
// ============================================================
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, LogOut, LayoutDashboard, ClipboardList, UserCheck, Plus,
  Building2, Settings, Bell, ChevronDown, Menu, Camera, MapPin,
  Globe, Link2, AtSign, Mail, Phone, Save, Loader2, CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

/* ─── NAV ITEM ─── */
const NavItem: React.FC<{ icon: React.ElementType; label: string; active?: boolean; onClick?: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${active ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}>
    <Icon className="h-4 w-4 shrink-0" />{label}
  </button>
);

const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; icon?: React.ReactNode }> = ({ label, value, onChange, placeholder, type = "text", icon }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
    <div className="relative">
      {icon && <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`h-10 w-full rounded-xl border border-gray-200 bg-gray-50 ${icon ? "pl-9" : "px-4"} pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100`}
      />
    </div>
  </div>
);

export const CompanyProfilePage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const userInitial = (user as any)?.name?.charAt(0)?.toUpperCase() || "U";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    companyName: (user as any)?.companyName || "",
    tagline: "",
    description: "",
    website: "",
    location: "",
    email: (user as any)?.email || "",
    phone: "",
    linkedin: "",
    twitter: "",
    industry: "",
    size: "",
    founded: "",
  });

  const set = (key: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulated save
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", action: () => navigate("/dashboard/jobs") },
    { icon: ClipboardList, label: "My Jobs", action: () => navigate("/dashboard/my-jobs") },
    { icon: UserCheck, label: "Applicants", action: () => navigate("/dashboard/applications") },
    { icon: Plus, label: "Post a Job", action: () => navigate("/dashboard/jobs") },
    { icon: Building2, label: "Company Profile", action: () => {}, active: true },
    { icon: Settings, label: "Settings", action: () => navigate("/dashboard/settings") },
  ];

  const SidebarContent = () => (
    <>
      <div className="mb-7 flex items-center gap-2 px-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600"><Briefcase className="h-3.5 w-3.5 text-white" /></div>
        <Link to="/" className="text-sm font-black tracking-tight text-gray-900">JobPortal</Link>
      </div>
      <nav className="flex flex-col gap-0.5">
        {navItems.map(item => <NavItem key={item.label} icon={item.icon} label={item.label} active={(item as any).active} onClick={() => { item.action(); setSidebarOpen(false); }} />)}
      </nav>
      <div className="mt-auto pt-4">
        <button onClick={() => logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-400 transition hover:bg-red-50 hover:text-red-500"><LogOut className="h-4 w-4" />Logout</button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-900">
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-gray-100 bg-white px-3 py-5 lg:hidden"><SidebarContent /></motion.aside>
          </>
        )}
      </AnimatePresence>
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-gray-100 bg-white px-3 py-5"><SidebarContent /></aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-gray-100 bg-white px-4 sm:px-5">
          <button onClick={() => setSidebarOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 lg:hidden"><Menu className="h-4 w-4" /></button>
          <div className="flex-1" />
          <button className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" /></button>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-700">{userInitial}</div>
            <span className="hidden sm:inline">{(user as any)?.name || "User"}</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">Company Profile</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage your company information visible to job seekers</p>
            </div>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 w-fit">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : saved ? <><CheckCircle2 className="h-4 w-4" />Saved!</> : <><Save className="h-4 w-4" />Save Changes</>}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Logo + quick info */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white">
                      {form.companyName?.slice(0, 2).toUpperCase() || "CO"}
                    </div>
                    <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-800 text-white shadow transition hover:bg-gray-700">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-lg font-black text-gray-900">{form.companyName || "Your Company"}</p>
                  <p className="text-sm text-gray-400 mt-1">{form.tagline || "Add a tagline…"}</p>
                  <div className="mt-4 w-full space-y-2 text-left">
                    {[
                      { icon: <MapPin className="h-3.5 w-3.5" />, value: form.location, label: "Location" },
                      { icon: <Globe className="h-3.5 w-3.5" />, value: form.website, label: "Website" },
                      { icon: <Building2 className="h-3.5 w-3.5" />, value: form.industry, label: "Industry" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-gray-400 shrink-0">{item.icon}</span>
                        <span>{item.value || <span className="text-gray-300">Not set</span>}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Basic Info */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-black text-gray-900">Basic Information</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="Company Name" value={form.companyName} onChange={set("companyName")} placeholder="e.g. Acme Corp" />
                  <InputField label="Tagline" value={form.tagline} onChange={set("tagline")} placeholder="e.g. Building the future of work" />
                  <InputField label="Industry" value={form.industry} onChange={set("industry")} placeholder="e.g. Technology" />
                  <InputField label="Company Size" value={form.size} onChange={set("size")} placeholder="e.g. 50–100 employees" />
                  <InputField label="Founded" value={form.founded} onChange={set("founded")} placeholder="e.g. 2018" />
                  <InputField label="Location" value={form.location} onChange={set("location")} placeholder="e.g. San Francisco, CA" icon={<MapPin className="h-3.5 w-3.5" />} />
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">About the Company</label>
                  <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your company, culture, mission, and what makes you unique…" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none" />
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-black text-gray-900">Contact & Social</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="Email" value={form.email} onChange={set("email")} placeholder="hr@company.com" type="email" icon={<Mail className="h-3.5 w-3.5" />} />
                  <InputField label="Phone" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" icon={<Phone className="h-3.5 w-3.5" />} />
                  <InputField label="Website" value={form.website} onChange={set("website")} placeholder="https://company.com" icon={<Globe className="h-3.5 w-3.5" />} />
                  <InputField label="LinkedIn" value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/company/…" icon={<Link2 className="h-3.5 w-3.5" />} />
                  <InputField label="Twitter / X" value={form.twitter} onChange={set("twitter")} placeholder="@company" icon={<AtSign className="h-3.5 w-3.5" />} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
