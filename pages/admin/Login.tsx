import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/db";
import { Lock, Factory, AlertCircle, Eye, EyeOff } from "lucide-react";

export const Login: React.FC = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await db.login(user, pass);
    if (success) {
      navigate("/admin/dashboard");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-10 text-center text-white">
          <Factory className="h-12 w-12 mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-wider">
            CMS ACCESS
          </h1>
          <p className="text-blue-200 text-sm mt-2">
            Manage your aluminium product catalog
          </p>
        </div>
        <form onSubmit={handleLogin} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm font-medium border border-red-100">
              <AlertCircle className="h-4 w-4 mr-2" /> Invalid credentials
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Username
            </label>
            <input
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <input
                required
                type={showPass ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showPass ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center hover:bg-black transition-all"
          >
            <Lock className="h-4 w-4 mr-2" /> Authenticate
          </button>
          <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-black">
            Demo Creds: admin / password123
          </p>
        </form>
      </div>
    </div>
  );
};
