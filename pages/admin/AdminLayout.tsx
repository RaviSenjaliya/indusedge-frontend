import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { db } from "../../services/db";
import {
  LayoutDashboard,
  Layers,
  Package,
  Mail,
  LogOut,
  Factory,
  ExternalLink,
  Bell,
  Menu,
  X,
  Image as ImageIcon,
} from "lucide-react";

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!db.isLoggedIn()) navigate("/admin/login");
  }, [navigate]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Sections", path: "/admin/sections", icon: Layers },
    { label: "Products", path: "/admin/products", icon: Package },
    { label: "Inquiries", path: "/admin/inquiries", icon: Mail },
    { label: "Notifications", path: "/admin/notifications", icon: Bell },
    { label: "Media Assets", path: "/admin/media", icon: ImageIcon },
  ];

  const handleLogout = () => {
    db.logout();
    navigate("/admin/login");
  };

  const SidebarContent = () => (
    <>
      <div className="p-8 flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Factory className="h-6 w-6 text-white" />
        </div>
        <span className="text-white font-black text-xl tracking-tight">
          PALAK<span className="text-blue-500">CMS</span>
        </span>
      </div>

      <nav className="flex-grow px-6 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold ${
              location.pathname === item.path
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800 space-y-4">
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-semibold transition-all"
        >
          <ExternalLink className="h-5 w-5" />
          <span>Public Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-950/30 transition-all font-semibold"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 bg-slate-900 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <aside
          className={`absolute left-0 top-0 bottom-0 w-56 bg-slate-900 flex flex-col transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent />
        </aside>
      </div>

      {/* Main Container */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-2">
            <Factory className="h-5 w-5 text-blue-600" />
            <span className="font-black text-slate-900 tracking-tight">
              PALAK<span className="text-blue-600">CMS</span>
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-grow overflow-y-auto p-4 md:p-8 lg:p-12 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
