import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import MergePanel from "./MergePanel";
import CreatePanel from "./CreatePanel";
import AuthModal from "./AuthModal";
import { updateProfile, updatePassword, getRecentFiles, downloadRecentFile } from "../services/api";

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${active
        ? "bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-400"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      }`}
  >
    <Icon className={`size-[18px] ${active ? "text-indigo-600" : "text-slate-400"}`} />
    {label}
  </button>
);

const ToolCard = ({ icon: Icon, title, description, buttonText, buttonColor, onClick }) => (
  <div className="flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-soft transition-all hover:shadow-lg dark:bg-slate-800 dark:shadow-none dark:border dark:border-slate-700">
    <div className={`mb-3 flex size-12 items-center justify-center rounded-xl ${buttonColor.replace("bg-", "bg-opacity-10 ")}`}>
      <Icon className={`size-6 ${buttonColor.replace("bg-", "text-")}`} />
    </div>
    <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
    <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-[11px] font-bold text-white transition-all hover:opacity-90 ${buttonColor}`}
    >
      {buttonText}
      <ArrowRightIcon className="size-3" />
    </button>
  </div>
);

// --- Icons ---
const DashboardIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const MergeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
  </svg>
);
const ConvertIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const FileIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const CreateIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const HistoryIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const MoonIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);
const SunIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const MoreIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);
const CrownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);
const LogOutIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const UserCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ShieldIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeSlashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.024 10.024 0 014.504-4.657m15.893 1.583A10.046 10.046 0 0121.542 12c-1.274 4.057-5.064 7-9.542 7-1.447 0-2.813-.306-4.043-.857M9.88 9.88l4.24 4.24M3 3l18 18" />
  </svg>
);

const CloudIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const KeyIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-9 5a3 3 0 11-6 0 3 3 0 016 0zm6.3-2.7a16 16 0 011.7-2l2.3-2.3a2.224 2.224 0 013.2 0 2.224 2.224 0 010 3.2L23 9.3a16 16 0 01-2 1.7M14 14l-1.5-1.5" />
  </svg>
);

export default function Dashboard() {
  const { user, logout, isAuthenticated, token, updateUser, sessionExpired, dismissSessionExpired } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash;
    if (hash === "#merge") return "merge";
    if (hash === "#convert-pdf") return "convert";
    if (hash === "#remove-pages") return "remove";
    if (hash === "#create-pdf") return "create";
    return "dashboard";
  });
  const [authMode, setAuthMode] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings State
  const [newName, setNewName] = useState(user?.name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: success, error

  useEffect(() => {
    if (user?.name) setNewName(user.name);
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!newName.trim()) return;
    setIsUpdatingProfile(true);
    setMessage({ text: "", type: "" });
    try {
      const data = await updateProfile({ name: newName }, token);
      updateUser(data);
      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsUpdatingProfile(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords do not match.");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await updatePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      }, token);
      alert("Password updated successfully!");
      setIsPasswordModalOpen(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      alert(error.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#merge") setActiveTab("merge");
      else if (hash === "#convert-pdf") setActiveTab("convert");
      else if (hash === "#remove-pages") setActiveTab("remove");
      else if (hash === "#create-pdf") setActiveTab("create");
      else if (!hash || hash === "#dashboard") setActiveTab("dashboard");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const [recentFiles, setRecentFiles] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const fetchRecentFiles = async () => {
    if (!isAuthenticated || !token) {
      setRecentFiles([]);
      return;
    }
    setLoadingRecent(true);
    try {
      const data = await getRecentFiles(token);
      setRecentFiles(data);
    } catch (err) {
      console.error("Error loading recent files:", err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentFiles();
  }, [isAuthenticated, token]);

  const handleDownloadRecentFile = async (id, fileName) => {
    try {
      const { blob, fileName: serverFileName } = await downloadRecentFile(id, token);
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = serverFileName || fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Failed to download file from history: " + err.message);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const handleToolClick = (tab) => {
    setActiveTab(tab);
    if (tab === "merge") window.location.hash = "#merge";
    if (tab === "convert") window.location.hash = "#convert-pdf";
    if (tab === "remove") window.location.hash = "#remove-pages";
    if (tab === "create") window.location.hash = "#create-pdf";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-900 dark:text-white">
      <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitchMode={(m) => setAuthMode(m)} />

      {/* Session Expired Modal */}
      {sessionExpired && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-slate-800 dark:border dark:border-slate-700">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
              <svg className="size-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Session Expired</h3>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Your session has expired for security. Please log in again to continue.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { dismissSessionExpired(); logout(); }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                Sign Out
              </button>
              <button
                onClick={() => { dismissSessionExpired(); setAuthMode("login"); }}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 dark:shadow-none"
              >
                Log In Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-full w-72 transform border-r border-slate-200 bg-white p-5 shadow-sm transition-transform duration-300 dark:bg-slate-800 dark:border-slate-700 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-indigo-200 shadow-lg">
              PF
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">PDF Tools</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-700"
          >
            <XMarkIcon className="size-6" />
          </button>
        </div>

        <nav className="space-y-1">
          <SidebarItem icon={DashboardIcon} label="Dashboard" active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} />
          <SidebarItem icon={CreateIcon} label="Create PDF" active={activeTab === "create"} onClick={() => { handleToolClick("create"); setIsSidebarOpen(false); }} />
          <SidebarItem icon={MergeIcon} label="Merge PDF" active={activeTab === "merge"} onClick={() => { handleToolClick("merge"); setIsSidebarOpen(false); }} />
          <SidebarItem icon={ConvertIcon} label="Convert" active={activeTab === "convert"} onClick={() => { handleToolClick("convert"); setIsSidebarOpen(false); }} />
          <SidebarItem icon={TrashIcon} label="Remove Page" active={activeTab === "remove"} onClick={() => { handleToolClick("remove"); setIsSidebarOpen(false); }} />
          <div className="my-6 border-t border-slate-100 dark:border-slate-700" />
          <SidebarItem icon={HistoryIcon} label="Recent Files" active={activeTab === "recent"} onClick={() => { setActiveTab("recent"); setIsSidebarOpen(false); }} />
          <SidebarItem icon={SettingsIcon} label="Settings" active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }} />
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10">
        {/* Mobile Top Bar */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
          >
            <MenuIcon className="size-6" />
          </button>
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-indigo-200 shadow-lg">
            PF
          </div>
        </div>

        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {activeTab !== "dashboard" && (
              <button
                onClick={() => { setActiveTab("dashboard"); window.location.hash = "#dashboard"; }}
                className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeTab === "merge" ? "Merge PDF" :
                  activeTab === "convert" ? "Convert PDF" :
                    activeTab === "remove" ? "Remove Page" :
                      activeTab === "create" ? "Create PDF" :
                        activeTab === "recent" ? "Recent Files" :
                          activeTab === "settings" ? "Settings" : "Dashboard"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back! Your all-in-one PDF solution.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              {isDarkMode ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthMode("login")}
                  className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-50 dark:bg-slate-800 dark:border-slate-600 dark:text-indigo-400 dark:hover:bg-slate-700"
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-700 shadow-md shadow-indigo-100"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </header>

        {activeTab === "dashboard" ? (
          <>
            {/* Hero Section */}
            <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-500 p-6 sm:p-10 text-white shadow-xl shadow-indigo-100">
              <div className="relative z-10 max-w-lg">
                <span className="mb-2 inline-block text-[10px] font-bold uppercase tracking-wider opacity-80 sm:mb-3 sm:text-xs">Easy. Fast. Secure.</span>
                <h2 className="mb-3 text-2xl font-extrabold leading-tight sm:text-4xl">All-in-One PDF Tools</h2>
                <p className="mb-6 text-sm leading-relaxed opacity-90 sm:text-base">Merge, convert, and organize your PDF files with ease. Fast, secure, and works in your browser.</p>
              </div>

              <div className="absolute -bottom-8 -right-8 size-64 rotate-12 opacity-10">
                <FileIcon className="size-full" />
              </div>
              <div className="absolute right-20 top-1/2 -translate-y-1/2">
                <div className="relative size-32 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <FileIcon className="size-16 text-white" />
                  <div className="absolute -right-2 -top-2 rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-indigo-600 shadow-sm">PDF</div>
                </div>
              </div>
            </section>

            {/* Tool Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <ToolCard
                icon={CreateIcon}
                title="Create PDF"
                description="Write or paste text to generate a PDF."
                buttonText="Get Started"
                buttonColor="bg-amber-500"
                onClick={() => handleToolClick("create")}
              />
              <ToolCard
                icon={MergeIcon}
                title="Merge PDF"
                description="Combine multiple PDF files into a single document."
                buttonText="Get Started"
                buttonColor="bg-indigo-600"
                onClick={() => handleToolClick("merge")}
              />
              <ToolCard
                icon={ConvertIcon}
                title="Convert"
                description="Convert PDF to Word, Excel, PPT, and more."
                buttonText="Get Started"
                buttonColor="bg-emerald-500"
                onClick={() => handleToolClick("convert")}
              />
              <ToolCard
                icon={TrashIcon}
                title="Remove Page"
                description="Remove unwanted pages from your PDF."
                buttonText="Get Started"
                buttonColor="bg-rose-500"
                onClick={() => handleToolClick("remove")}
              />
            </div>

            {/* Recent Files */}
            <section className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-800 dark:shadow-none dark:border dark:border-slate-700">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Files</h2>
                <button onClick={() => setActiveTab("recent")} className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
              </div>

              <div className="space-y-1">
                {!isAuthenticated ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Please login to view your recent files.</p>
                ) : loadingRecent ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Loading recent files...</p>
                ) : recentFiles.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No recent files found. Create or merge a PDF to get started!</p>
                ) : (
                  recentFiles.slice(0, 3).map((file, i) => (
                    <div key={file._id || i} className="flex items-center justify-between rounded-xl px-3 py-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                      <div className="flex items-center gap-4">
                        <div className={`flex size-11 items-center justify-center rounded-xl ${file.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                          <FileIcon className="size-6" />
                        </div>
                        <div className="max-w-[200px] sm:max-w-xs md:max-w-md">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={file.name}>{file.name}</h4>
                          <p className="text-[12px] text-slate-400 dark:text-slate-500">{formatBytes(file.size)} • {formatRelativeTime(file.createdAt)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownloadRecentFile(file._id, file.name)}
                        className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700"
                        title="Download file"
                      >
                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        ) : activeTab === "recent" ? (
          <div className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-800 dark:shadow-none dark:border dark:border-slate-700">
            <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">All Recent Files</h2>
            <div className="space-y-2">
              {!isAuthenticated ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">Please login to view your file history.</p>
              ) : loadingRecent ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">Loading recent files...</p>
              ) : recentFiles.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">No file history found. Your merged and converted files will appear here!</p>
              ) : (
                recentFiles.map((file, i) => (
                  <div key={file._id || i} className="flex items-center justify-between rounded-2xl border border-slate-50 px-6 py-4 transition-all hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className={`flex size-12 items-center justify-center rounded-xl ${file.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                        <FileIcon className="size-6" />
                      </div>
                      <div className="max-w-[200px] sm:max-w-md">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate" title={file.name}>{file.name}</h4>
                        <p className="text-sm text-slate-400 dark:text-slate-500">{formatBytes(file.size)} • {formatRelativeTime(file.createdAt)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadRecentFile(file._id, file.name)}
                      className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                      Download
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === "settings" ? (
          <div className="max-w-5xl space-y-8 animate-fade-up">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              
              {/* Left Column: Profile Card & Quick Info */}
              <div className="space-y-6 lg:col-span-1">
                {/* Profile Overview Card */}
                <div className="relative overflow-hidden rounded-[32px] bg-white p-6 shadow-soft transition-all hover:shadow-lg dark:bg-slate-800 dark:border dark:border-slate-700">
                  {/* Decorative background circle */}
                  <div className="absolute -right-16 -top-16 size-40 rounded-full bg-indigo-500/10 blur-xl dark:bg-indigo-400/5" />
                  
                  <div className="flex flex-col items-center text-center">
                    {/* Premium Avatar */}
                    <div className="relative mb-4">
                      <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white font-extrabold text-3xl shadow-xl shadow-indigo-200 dark:shadow-none border-4 border-white dark:border-slate-800">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span className="absolute bottom-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-full">
                      {user?.name || "Premium User"}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 truncate max-w-full">
                      {user?.email || "user@example.com"}
                    </p>
                    
                    {/* Status Badge */}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                      <CrownIcon className="size-3.5" />
                      Pro Account
                    </span>
                  </div>
                  
                  {/* Mini Stats divider */}
                  <div className="my-6 border-t border-slate-100 dark:border-slate-700" />
                  
                  {/* Simple storage indicator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
                        <CloudIcon className="size-4 text-indigo-500" />
                        Storage Used
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">12.4 MB of 100 MB</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: '12.4%' }} />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Your cloud space for processed PDF files.</p>
                  </div>
                </div>
                
                {/* Visual Settings Navigation Helper */}
                <div className="hidden lg:block rounded-[24px] bg-white p-4 shadow-soft dark:bg-slate-800 dark:border dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 px-2">Settings Quick Jump</span>
                  <div className="space-y-1">
                    <a href="#profile-settings" className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <UserCircleIcon className="size-4" />
                      Profile Settings
                    </a>
                    <a href="#security-settings" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50">
                      <ShieldIcon className="size-4" />
                      Security Options
                    </a>
                    <a href="#session-settings" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50">
                      <LogOutIcon className="size-4" />
                      Account Session
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Right Column: Profile Form Settings (Takes 2 grid cols) */}
              <div id="profile-settings" className="lg:col-span-2 space-y-6">
                <div className="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-800 dark:border dark:border-slate-700 relative overflow-hidden">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                      <UserCircleIcon className="size-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Details</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Update your general account details and display configurations.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    {/* Display Name Input */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Display Name</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <UserCircleIcon className="size-5" />
                        </span>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3 text-sm font-medium transition-all focus:border-indigo-500 focus:bg-white focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                          placeholder="Your Name"
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">This name will be displayed in your profile and communications.</p>
                    </div>
                    
                    {/* Email Address Input (Disabled) */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <MailIcon className="size-5" />
                        </span>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          disabled
                          className="w-full rounded-xl border border-slate-200 bg-slate-100 pl-11 pr-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-500"
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">Email cannot be changed as it is linked to your account.</p>
                    </div>
                    
                    {/* UI Preferences Toggles */}
                    <div className="pt-2">
                      <span className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-300">Application Preferences</span>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-800">
                          <div className="pr-4">
                            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Email notifications</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">Receive alert when processed PDFs are ready.</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-800">
                          <div className="pr-4">
                            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Auto-clear history</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">Automatically remove PDFs from history after 7 days.</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Section */}
                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        {message.text && (
                          <div className={`rounded-xl p-3 flex items-center gap-2 text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                            {message.type === 'success' ? (
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
                              </svg>
                            ) : (
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0" />
                              </svg>
                            )}
                            {message.text}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile || newName === user?.name || !newName.trim()}
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none dark:shadow-none"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving Profile...
                          </>
                        ) : (
                          <>
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Row Cards: Security & Logout */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Account Security Card */}
              <div id="security-settings" className="group rounded-[32px] bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800 dark:border dark:border-slate-700">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50">
                      <ShieldIcon className="size-5.5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security Settings</h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Manage security details & authentication</p>
                    </div>
                  </div>
                </div>
                <p className="mb-8 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Ensure your account remains safe and protected by updating your account credentials or configuring two-factor security parameters.
                </p>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <KeyIcon className="size-4" />
                  Update Password
                </button>
              </div>

              {/* Danger Zone Card */}
              <div id="session-settings" className="group rounded-[32px] bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800 dark:border dark:border-slate-700">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:group-hover:bg-rose-900/50">
                      <LogOutIcon className="size-5.5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Session</h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Manage your active sign-in status</p>
                    </div>
                  </div>
                </div>
                <p className="mb-8 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Ready to sign out? Make sure you have completed and downloaded all active PDF tasks. Your work session will be saved locally.
                </p>
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50/50 py-3 text-sm font-bold text-rose-600 border border-rose-100/30 hover:border-rose-200 transition-all hover:bg-rose-600 hover:text-white dark:bg-rose-950/20 dark:border-rose-900/20 dark:hover:bg-rose-600"
                >
                  <LogOutIcon className="size-4" />
                  Logout from Account
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === "create" ? (
          <div className="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-800 dark:shadow-none dark:border dark:border-slate-700">
            <CreatePanel hideTabs={true} onProcessSuccess={fetchRecentFiles} />
          </div>
        ) : (
          <div className="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-800 dark:shadow-none dark:border dark:border-slate-700">
            <MergePanel
              initialMode={activeTab === "remove" ? "remove-pages" : activeTab}
              hideTabs={true}
              onProcessSuccess={fetchRecentFiles}
            />
          </div>
        )}
      </main>

      {/* Password Update Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl dark:bg-slate-800 dark:border dark:border-slate-700">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Update Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    required
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    required
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    required
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
                  </button>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 dark:shadow-none"
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
