import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { db } from "../services/db";
import { Category, Product } from "../types";
import { Skel, Img, PublicState } from "../components/public";
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Grid3X3,
  List,
  Inbox,
} from "lucide-react";

export const ProductCatalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allProducts, allCategories] = await Promise.all([
        db.getProducts(),
        db.getCategories(),
      ]);
      const activeCategories = allCategories.filter((c) => c.isActive);
      const activeCategoryIds = new Set(activeCategories.map((c) => c.id));

      setProducts(
        allProducts.filter(
          (p) => p.isActive && activeCategoryIds.has(p.categoryId)
        )
      );
      setCategories(activeCategories);
    } catch (error) {
      console.error("Error loading catalog data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const categoryFilter = searchParams.get("category") || "all";

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearchTerm, categoryFilter, products]);

  const activeCategoryName = useMemo(() => {
    if (categoryFilter === "all") return "All Products";
    return (
      categories.find((c) => c.id === categoryFilter)?.name ||
      "Product Category"
    );
  }, [categoryFilter, categories]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header row skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="space-y-3">
              <Skel className="h-7 w-56" />
              <Skel className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Skel className="h-12 flex-grow md:w-80 rounded-2xl" />
              <Skel className="hidden sm:block h-12 w-24 rounded-lg" />
            </div>
          </div>

          {/* Two-column layout skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Sidebar skeleton */}
            <aside className="lg:col-span-1 space-y-4 md:space-y-5">
              <div className="bg-white p-6 md:p-5 rounded-2xl shadow-sm border border-slate-100">
                <Skel className="h-4 w-24 mb-6" />
                <div className="space-y-3">
                  <Skel className="h-10 w-full rounded-lg" />
                  <Skel className="h-10 w-full rounded-lg" />
                  <Skel className="h-10 w-full rounded-lg" />
                  <Skel className="h-10 w-4/5 rounded-lg" />
                </div>
              </div>
              <Skel className="h-52 w-full rounded-2xl" />
            </aside>

            {/* Product grid skeleton */}
            <main className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                  >
                    <Skel className="h-40 w-full rounded-none" />
                    <div className="p-4 space-y-3">
                      <Skel className="h-4 w-24 rounded-full" />
                      <div className="space-y-2">
                        <Skel className="h-4 w-3/4" />
                        <Skel className="h-3 w-full" />
                        <Skel className="h-3 w-5/6" />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Skel className="h-4 w-24" />
                        <Skel className="h-10 w-28 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase truncate max-w-[280px] sm:max-w-none">
              {activeCategoryName}
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              {filteredProducts.length} aluminium products available
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search aluminium products..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white text-slate-900 placeholder:text-slate-400 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden sm:flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-4 md:space-y-5">
            <div className="bg-white p-6 md:p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-black text-slate-900 mb-6 flex items-center uppercase tracking-widest text-[10px]">
                <SlidersHorizontal className="h-4 w-4 mr-2 text-blue-600" />
                Segments
              </h3>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                <button
                  onClick={() => setSearchParams({ category: "all" })}
                  className={`whitespace-nowrap px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    categoryFilter === "all"
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSearchParams({ category: cat.id })}
                    className={`whitespace-nowrap px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                      categoryFilter === cat.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-2xl relative overflow-hidden border border-transparent">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl -mr-12 -mt-12"></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">
                Custom Orders
              </h3>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed relative z-10">
                Cannot find a specific aluminium grade or size? We can source
                custom specifications to meet your requirements.
              </p>
              <Link
                to="/inquiry"
                className="block w-full text-center bg-white text-slate-900 font-black py-3 rounded-lg text-xs hover:bg-blue-600 hover:text-white transition-all relative z-10"
              >
                Contact Us
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <PublicState
                icon={Inbox}
                title="No Records Found"
                message="No products match your current search parameters or selected category filters."
                action={
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSearchParams({ category: "all" });
                    }}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                  >
                    Reset Filters
                  </button>
                }
              />
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 ${
                      viewMode === "list"
                        ? "flex flex-col sm:flex-row h-auto sm:h-44"
                        : ""
                    }`}
                  >
                    <div
                      className={
                        viewMode === "grid"
                          ? "h-40 relative overflow-hidden bg-slate-100"
                          : "w-full sm:w-52 h-40 sm:h-full relative shrink-0 overflow-hidden bg-slate-100"
                      }
                    >
                      <Img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">
                          Product Preview
                        </span>
                      </div>
                    </div>
                    <div
                      className={`p-4 flex flex-grow min-w-0 ${
                        viewMode === "list"
                          ? "flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                          : "flex-col justify-between"
                      }`}
                    >
                      <div className="min-w-0 flex-grow">
                        <span className="inline-block text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                          {categories.find((c) => c.id === product.categoryId)
                            ?.name || "General"}
                        </span>
                        <h3 className="text-base md:text-lg font-black text-slate-900 mt-2 mb-1.5 group-hover:text-blue-600 transition-colors leading-tight uppercase tracking-tight line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 font-medium">
                          {product.shortDescription}
                        </p>
                      </div>
                      <Link
                        to={`/product/${product.id}`}
                        className={`inline-flex items-center justify-center gap-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-blue-600 transition-all shadow-lg shadow-slate-200/60 shrink-0 ${
                          viewMode === "list"
                            ? "mt-3 sm:mt-0 self-start sm:self-auto"
                            : "mt-4 w-full"
                        }`}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
