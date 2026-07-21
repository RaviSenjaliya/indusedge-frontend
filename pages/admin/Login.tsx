import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/db";
import {
  Lock,
  Factory,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
} from "lucide-react";
import { Button, Input, FieldLabel } from "../../components/ui";

export const Login: React.FC = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await db.login(user, pass);
      if (success) {
        navigate("/admin/dashboard");
      } else {
        setError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 dark:border-slate-800 dark:bg-slate-900">
        {/* Dark header panel — mirrors the GlowPanel look, squared to the card */}
        <div className="relative overflow-hidden bg-slate-900 p-5 text-center text-white dark:border-b dark:border-slate-800">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="relative z-10">
            <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider">
              CMS Access
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage your aluminium product catalog
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-300">
              <ShieldCheck className="h-3 w-3" />
              Authorized Personnel Only
            </span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 p-5 md:p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600 animate-in fade-in duration-300 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Invalid credentials. Please try again.
            </div>
          )}

          <Input
            label="Username"
            icon={User}
            required
            autoComplete="username"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
              if (error) setError(false);
            }}
            placeholder="Enter username"
          />

          <div className="space-y-2.5">
            <FieldLabel htmlFor="login-password" required>
              Password
            </FieldLabel>
            <div className="relative">
              <Input
                id="login-password"
                icon={Lock}
                required
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="••••••••"
                className="!pr-12 md:!pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 dark:hover:text-slate-200"
              >
                {showPass ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="dark"
            size="lg"
            fullWidth
            leftIcon={Lock}
            loading={isLoading}
          >
            Authenticate
          </Button>
        </form>
      </div>
    </div>
  );
};
