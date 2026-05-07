import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const defaultState = { name: "", email: "", password: "" };

export default function AuthModal({ mode, onClose }) {
  const { login, register, loading } = useAuth();
  const [form, setForm] = useState(defaultState);
  const [error, setError] = useState("");

  const isOpen = mode === "login" || mode === "register";

  useEffect(() => {
    if (isOpen) {
      setForm(defaultState);
      setError("");
    }
  }, [isOpen, mode]);

  if (!isOpen) {
    return null;
  }

  const isRegister = mode === "register";

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to authenticate.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/30 bg-white p-6 shadow-soft dark:bg-slate-800 dark:border-slate-700 dark:shadow-none">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {isRegister && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-200 transition focus:ring dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:ring-brand-900/20"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-200 transition focus:ring dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:ring-brand-900/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-200 transition focus:ring dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:ring-brand-900/20"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Register"
                : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

