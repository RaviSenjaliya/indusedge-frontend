import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Factory,
  Clock,
  Search,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";
import { db } from "../services/db";
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

  const searchRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Projects", path: "/projects" },
    { name: "Inquiry", path: "/inquiry" },
  ];

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
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 md:p-2 rounded-lg">
                <Factory className="h-5 w-5 text-white" />
              </div>
              <span className="text-base md:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 tracking-tighter truncate max-w-[150px] sm:max-w-none">
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
                className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-12 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
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
                      className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg group text-left"
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
                      className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg group text-left"
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

          </nav>

          <div className="flex items-center md:hidden space-x-2">
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
                className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-12 pr-4 py-3 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none"
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
            <div className="pt-6 border-t border-slate-100 flex items-center px-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Available Now
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const FOOTER_ADDRESS = [
  "Plot 422, Industrial Zone G,",
  "Vadodara, Gujarat 390010, India",
];

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(
    "Palak Aluminium, Plot 422, Industrial Zone G, Vadodara, Gujarat 390010, India"
  );

const FOOTER_LINKS = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Projects", path: "/projects" },
  { name: "Categories", path: "/categories" },
  { name: "Inquiry Hub", path: "/inquiry" },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14 text-center md:text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="flex items-center justify-center md:justify-start space-x-2.5 mb-5">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
                <Factory className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-black text-white uppercase tracking-tight">
                PALAK ALUMINIUM
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed max-w-xs mx-auto md:mx-0 text-slate-400">
              Premium aluminium products supplier since 2010. Quality you can
              trust.
            </p>
            <div className="mt-6 inline-flex items-center space-x-2.5 bg-slate-800/60 border border-slate-800 px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Available Now
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-5">
              Navigation
            </h3>
            <ul className="space-y-3.5 text-xs font-bold uppercase tracking-widest">
              {FOOTER_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-5">
              Contact
            </h3>
            <ul className="space-y-4 text-xs font-bold">
              <li>
                <a
                  href="tel:+919999999999"
                  className="flex items-center justify-center md:justify-start space-x-3 hover:text-blue-400 transition-colors"
                >
                  <span className="bg-slate-800/80 p-2 rounded-lg shrink-0">
                    <Phone className="h-3.5 w-3.5 text-blue-400" />
                  </span>
                  <span>+91 99999 99999</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@palakaluminium.com"
                  className="flex items-center justify-center md:justify-start space-x-3 hover:text-blue-400 transition-colors"
                >
                  <span className="bg-slate-800/80 p-2 rounded-lg shrink-0">
                    <Mail className="h-3.5 w-3.5 text-blue-400" />
                  </span>
                  <span>info@palakaluminium.com</span>
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <span className="bg-slate-800/80 p-2 rounded-lg shrink-0">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                </span>
                <span className="text-slate-400">
                  Mon – Sat · 9:00 AM – 7:00 PM
                </span>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div className="lg:col-span-3">
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-5">
              Visit Us
            </h3>
            <div className="flex items-start justify-center md:justify-start space-x-3">
              <span className="bg-slate-800/80 p-2 rounded-lg shrink-0 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
              </span>
              <address className="not-italic text-xs font-bold leading-relaxed text-slate-300">
                {FOOTER_ADDRESS.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <span>Get Directions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <p>© {new Date().getFullYear()} Palak Aluminium. All Rights Reserved.</p>
          <p className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-blue-500" />
            <span>Vadodara · Gujarat · India</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
