import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { db } from "../../services/db";
import { useTheme } from "../../contexts/ThemeContext";
import {
  LayoutDashboard,
  Layers,
  Package,
  Briefcase,
  Mail,
  LogOut,
  Factory,
  ExternalLink,
  Menu,
  X,
  Image as ImageIcon,
  Search,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  User,
} from "lucide-react";
import { ToastProvider, ConfirmProvider, useConfirm, cn } from "../../components/ui";
import { CommandPalette } from "../../components/admin/CommandPalette";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Sections", path: "/admin/sections", icon: Layers },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Projects", path: "/admin/projects", icon: Briefcase },
  { label: "Inquiries", path: "/admin/inquiries", icon: Mail },
  { label: "Media Assets", path: "/admin/media", icon: ImageIcon },
];

const isPathActive = (pathname: string, path: string) =>
  pathname === path || (path === "/admin/dashboard" && pathname === "/admin");

/** Inner shell — lives inside Toast/Confirm providers so hooks are available. */
const AdminShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirm = useConfirm();
  const { theme, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Auth gate
  useEffect(() => {
    if (!db.isLoggedIn()) navigate("/admin/login");
  }, [navigate]);

  // Close overlays when the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // ⌘K / Ctrl+K opens the palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close the user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Sign out of CMS?",
      message: "You will need to authenticate again to manage the catalog.",
      tone: "warning",
      confirmLabel: "Sign Out",
    });
    if (ok) {
      db.logout();
      navigate("/admin/login");
    }
  };

  const activeNav = NAV_ITEMS.find((i) => isPathActive(location.pathname, i.path));

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center space-x-3 p-5 pb-6">
        <div className="rounded-lg bg-blue-600 p-2 shadow-lg shadow-blue-600/30">
          <Factory className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="block text-lg font-black leading-none tracking-tight text-white">
            PALAK<span className="text-blue-500">CMS</span>
          </span>
          <span className="mt-1 block text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">
            Control Panel
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="custom-scrollbar flex-grow space-y-1.5 overflow-y-auto px-4 py-2">
        <p className="mb-3 px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
          Management
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isPathActive(location.pathname, item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 font-bold transition-all",
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
              )}
            >
              <span className="flex items-center space-x-3">
                <item.icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </span>
              {active && <ChevronRight className="h-4 w-4 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Secondary actions */}
      <div className="space-y-3 border-t border-slate-800 p-4">
        <Link
          to="/"
          className="flex items-center space-x-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 transition-all hover:bg-slate-800/80 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Public Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-950/40"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900 lg:flex dark:bg-slate-950">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300 lg:hidden",
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <aside
          className={cn(
            "absolute bottom-0 left-0 top-0 flex w-72 max-w-[85vw] transform flex-col bg-slate-900 transition-transform duration-300 ease-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            className="absolute right-4 top-6 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent />
        </aside>
      </div>

      {/* Main column */}
      <div className="flex flex-grow flex-col overflow-hidden">
        {/* Top bar */}
        {/* `relative z-30` is required: the `backdrop-blur` below makes this
            header its own stacking context. Without an explicit positive
            z-index the whole header (and the z-40 user-menu dropdown inside it)
            paints *beneath* the later-in-DOM <main>, so page content bleeds
            over any open header popover. z-30 keeps it above <main> while
            staying under the mobile drawer (z-50) and portaled overlays. */}
        <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-lg md:px-5 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex min-w-0 items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center space-x-2 text-sm"
            >
              <span className="hidden text-[10px] font-black uppercase tracking-widest text-slate-400 sm:block dark:text-slate-500">
                CMS
              </span>
              <ChevronRight className="hidden h-3.5 w-3.5 text-slate-300 sm:block dark:text-slate-600" />
              <span className="truncate font-black tracking-tight text-slate-900 dark:text-white">
                {activeNav?.label ?? "Dashboard"}
              </span>
            </nav>
          </div>

          <div className="flex items-center space-x-1.5 md:space-x-3">
            {/* Search / palette trigger */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center space-x-2.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-400 transition-all hover:border-blue-400 hover:text-blue-600 md:px-3 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-500"
              aria-label="Open quick search"
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-xs font-bold md:block">
                Quick search…
              </span>
              <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-400 md:block dark:border-slate-600 dark:bg-slate-900 dark:text-slate-500">
                Ctrl K
              </kbd>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="flex items-center space-x-2 rounded-xl p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white dark:bg-blue-600">
                  A
                </span>
                <ChevronDown
                  className={cn(
                    "hidden h-4 w-4 text-slate-400 transition-transform md:block",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="animate-in fade-in zoom-in-95 absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10 duration-200 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/40"
                >
                  <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
                    <p className="flex items-center text-sm font-black text-slate-900 dark:text-white">
                      <User className="mr-2 h-4 w-4 text-blue-600" />
                      Administrator
                    </p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Palak Aluminium
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/"
                      role="menuitem"
                      className="flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/60"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Public Site</span>
                    </Link>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="custom-scrollbar flex-grow overflow-y-auto bg-slate-50 p-4 transition-colors md:p-5 lg:p-6 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
};

export const AdminLayout: React.FC = () => (
  <ToastProvider>
    <ConfirmProvider>
      <AdminShell />
    </ConfirmProvider>
  </ToastProvider>
);
