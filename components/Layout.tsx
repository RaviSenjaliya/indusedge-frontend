import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Factory,
  Lock,
  Search,
  Cpu,
  Layers,
  ArrowRight,
  Bell,
  BellOff,
} from "lucide-react";
import { db } from "../services/db";
import { pushService } from "../services/pushService";
import { Product, Category } from "../types";

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    products: Product[];
    categories: Category[];
  }>({ products: [], categories: [] });
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [dataCache, setDataCache] = useState<{
    products: Product[];
    categories: Category[];
  } | null>(null);

  const [notifPermission, setNotifPermission] =
    useState<NotificationPermission>("default");
  const searchRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Inquiry", path: "/inquiry" },
  ];

  useEffect(() => {
    pushService.checkPermission().then(setNotifPermission);
  }, []);

  const handleTogglePush = async () => {
    if (notifPermission === "default") {
      const granted = await pushService.requestPermission();
      setNotifPermission(granted ? "granted" : "denied");
      if (granted) {
        pushService.sendLocalNotification(
          "Notifications Enabled",
          "You will now receive updates from Palak Aluminium."
        );
      }
    } else if (notifPermission === "denied") {
      alert(
        "Please enable notifications in your browser settings to receive updates."
      );
    }
  };

  // 1. Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce for better API reduction
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSearchResults({ products: [], categories: [] });
        return;
      }

      setIsSearching(true);
      try {
        let products = dataCache?.products;
        let categories = dataCache?.categories;

        // Fetch only if not in cache
        if (!products || !categories) {
          const [fetchedProducts, fetchedCategories] = await Promise.all([
            db.getProducts(),
            db.getCategories(),
          ]);
          products = fetchedProducts;
          categories = fetchedCategories;
          setDataCache({ products, categories });
        }

        const term = debouncedSearchQuery.toLowerCase();
        const filteredProducts = products
          .filter(
            (p) =>
              p.isActive &&
              (p.name.toLowerCase().includes(term) ||
                Object.values(p.specs).some((v) =>
                  String(v).toLowerCase().includes(term)
                ))
          )
          .slice(0, 5);
        const filteredCategories = categories
          .filter((c) => c.isActive && c.name.toLowerCase().includes(term))
          .slice(0, 3);

        setSearchResults({
          products: filteredProducts,
          categories: filteredCategories,
        });
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      )
        setShowSearch(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (path: string) => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setShowSearch(false);
    navigate(path);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 md:p-2 rounded-lg">
                <Factory className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <span className="text-lg md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 tracking-tighter truncate max-w-[150px] sm:max-w-none">
                PALAK<span className="text-slate-900">ALUMINIUM</span>
              </span>
            </Link>
          </div>

          {/* Global Search Bar */}
          <div
            className="hidden lg:flex flex-grow max-w-md items-center mx-8 relative"
            ref={searchRef}
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search aluminium products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            {showSearch && searchQuery.length >= 2 && (
              <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
                  {searchResults.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        handleResultClick(`/products?category=${cat.id}`)
                      }
                      className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl group text-left"
                    >
                      <Layers className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold uppercase">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                  {searchResults.products.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleResultClick(`/product/${prod.id}`)}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl group text-left"
                    >
                      <Cpu className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-bold uppercase truncate">
                        {prod.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[11px] font-black uppercase tracking-widest transition-all hover:text-blue-600 ${
                  location.pathname === link.path
                    ? "text-blue-600"
                    : "text-slate-600"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center space-x-2 border-l border-slate-100 pl-6 ml-2">
              <button
                onClick={handleTogglePush}
                className={`p-2.5 rounded-xl transition-all border ${
                  notifPermission === "granted"
                    ? "bg-blue-50 border-blue-100 text-blue-600"
                    : "bg-slate-50 border-slate-100 text-slate-400"
                }`}
                title="Toggle Notifications"
              >
                {notifPermission === "granted" ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </button>
            </div>
          </nav>

          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={handleTogglePush}
              className="p-2.5 bg-slate-100 rounded-lg text-slate-400"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-6 pb-8 space-y-6">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none"
              />
              {showSearch && searchQuery.length >= 2 && (
                <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 shadow-xl rounded-xl z-50 overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                    {searchResults.categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          handleResultClick(`/products?category=${cat.id}`);
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg text-left"
                      >
                        <Layers className="h-4 w-4 text-blue-600" />
                        <span className="text-[10px] font-black uppercase">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                    {searchResults.products.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => {
                          handleResultClick(`/product/${prod.id}`);
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg text-left"
                      >
                        <Cpu className="h-4 w-4 text-slate-400" />
                        <span className="text-[10px] font-black uppercase truncate">
                          {prod.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Links */}
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
                    location.pathname === link.path
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{link.name}</span>
                    <ArrowRight
                      className={`h-4 w-4 ${location.pathname === link.path ? "opacity-100" : "opacity-20"}`}
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* Additional Info */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between px-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Available Now
                </span>
              </div>
              <button
                onClick={handleTogglePush}
                className="text-[9px] font-black uppercase tracking-widest text-blue-600"
              >
                {notifPermission === "granted"
                  ? "Notifications On"
                  : "Enable Alerts"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-6">
              <Factory className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white uppercase tracking-tight">
                PALAK ALUMINIUM
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed max-w-xs mx-auto md:mx-0">
              Premium aluminium products supplier since 2010. Quality you can
              trust.
            </p>
          </div>
          <div>
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              Navigation
            </h3>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li>
                <Link to="/products" className="hover:text-blue-400">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/inquiry" className="hover:text-blue-400">
                  Inquiry Hub
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              Resources
            </h3>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li>
                <Link
                  to="/admin/login"
                  className="flex items-center justify-center md:justify-start hover:text-blue-400"
                >
                  <Lock className="h-3 w-3 mr-2" /> CMS Access
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              Contact
            </h3>
            <ul className="space-y-4 text-xs font-bold">
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <Phone className="h-4 w-4 text-blue-400" />{" "}
                <span>+91 99999 99999</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <Mail className="h-4 w-4 text-blue-400" />{" "}
                <span>info@palakaluminium.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <p>© 2026 Palak Aluminium. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
