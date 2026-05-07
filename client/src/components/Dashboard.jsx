import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import MergePanel from "./MergePanel";
import AuthModal from "./AuthModal";

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
      active
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

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authMode, setAuthMode] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const recentFiles = [
    { name: "Project_Proposal.pdf", size: "2.4 MB", time: "2 minutes ago", type: "pdf" },
    { name: "Report_2024.pdf", size: "1.8 MB", time: "1 hour ago", type: "pdf" },
    { name: "Document.docx", size: "245 KB", time: "3 hours ago", type: "word" },
  ];

  const handleToolClick = (tab) => {
    setActiveTab(tab);
    if (tab === "merge") window.location.hash = "#merge";
    if (tab === "convert") window.location.hash = "#convert-pdf";
    if (tab === "remove") window.location.hash = "#remove-pages";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-900 dark:text-white">
      <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />
      
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
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeTab === "merge" ? "Merge PDF" : 
               activeTab === "convert" ? "Convert PDF" : 
               activeTab === "remove" ? "Remove Page" : 
               activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back! Your all-in-one PDF solution.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              {isDarkMode ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
            </button>
            {isAuthenticated ? (
              <div className="group relative">
                <button className="flex size-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </button>
                <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-xl group-hover:block dark:bg-slate-800 dark:border-slate-700">
                   <button onClick={logout} className="w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50">Logout</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setAuthMode("login")}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-700"
              >
                Login
              </button>
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
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
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
                <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
              </div>

              <div className="space-y-1">
                {recentFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl px-3 py-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                    <div className="flex items-center gap-4">
                      <div className={`flex size-11 items-center justify-center rounded-xl ${file.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                        <FileIcon className="size-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</h4>
                        <p className="text-[12px] text-slate-400 dark:text-slate-500">{file.size} • {file.time}</p>
                      </div>
                    </div>
                    <button className="rounded-lg p-2 text-slate-300 transition-all hover:bg-white hover:text-slate-600 dark:hover:bg-slate-600">
                      <MoreIcon className="size-5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : activeTab === "recent" ? (
          <div className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-800 dark:shadow-none dark:border dark:border-slate-700">
            <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">All Recent Files</h2>
            <div className="space-y-2">
              {recentFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-50 px-6 py-4 transition-all hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className={`flex size-12 items-center justify-center rounded-xl ${file.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                      <FileIcon className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{file.name}</h4>
                      <p className="text-sm text-slate-400 dark:text-slate-500">{file.size} • {file.time}</p>
                    </div>
                  </div>
                  <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">Download</button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "settings" ? (
          <div className="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-800 dark:shadow-none dark:border dark:border-slate-700">
            <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
            <div className="max-w-md space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Display Name</label>
                <input type="text" defaultValue={user?.name} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input type="email" defaultValue={user?.email} disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500" />
              </div>
              <button className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700">
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-800 dark:shadow-none dark:border dark:border-slate-700">
            <MergePanel 
              initialMode={activeTab === "remove" ? "remove-pages" : activeTab} 
              hideTabs={true} 
            />
          </div>
        )}
      </main>
    </div>
  );
}
