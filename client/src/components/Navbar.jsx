import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [authMode, setAuthMode] = useState(null);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/60 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#" className="flex items-center gap-2">
            <span className="rounded-xl bg-brand-600 px-2 py-1 text-sm font-bold text-white">
              MM
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              MergeMate
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <a href="#merge" className="transition hover:text-brand-700">
              Merge PDFs
            </a>
            <a href="#convert-pdf" className="transition hover:text-brand-700">
              Convert PDF
            </a>
            <a href="#features" className="transition hover:text-brand-700">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800 sm:inline-block">
                  {user?.name || "User"}
                </span>
                <button
                  onClick={logout}
                  className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAuthMode("login")}
                  className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />
    </>
  );
}
