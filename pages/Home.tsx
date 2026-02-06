import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../services/db";
import { Category, Product } from "../types";
import {
  ArrowRight,
  Activity,
  Cpu,
  Box,
  AlertCircle,
  Layers,
  Settings,
  Zap,
  Wrench,
  Sparkles,
  Factory,
  ChevronRight,
  Binary,
  Fingerprint,
  Circle,
  Cylinder,
  Minus,
} from "lucide-react";

const IconMap: Record<string, any> = {
  Layers,
  Box,
  Cylinder,
  Minus,
  Circle,
  Activity,
};

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<
    (Category & { productCount: number })[]
  >([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allProducts, allCategories] = await Promise.all([
          db.getProducts(),
          db.getCategories(),
        ]);

        const enrichedCategories = allCategories
          .filter((c) => c.isActive)
          .map((cat) => ({
            ...cat,
            productCount: allProducts.filter(
              (p) => p.categoryId === cat.id && p.isActive
            ).length,
          }));

        const activeCategoryIds = new Set(
          allCategories.filter((c) => c.isActive).map((c) => c.id)
        );

        setCategories(enrichedCategories);
        setFeaturedProducts(
          allProducts.filter(
            (p) =>
              p.isActive && p.isFeatured && activeCategoryIds.has(p.categoryId)
          )
        );
      } catch (err) {
        console.error("Home Page Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
            Loading Palak Aluminium
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 bg-slate-50 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover brightness-[0.2]"
            alt="Aluminium Products Background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-3 mb-8 bg-white/10 w-fit px-5 py-2.5 rounded-full backdrop-blur-xl border border-white/20">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                  Quality Assured
                </span>
              </div>
              <div className="h-4 w-px bg-white/20 mx-2"></div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                Premium Supplier
              </span>
            </div>
            <h1 className="text-4xl md:text-8xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-[0.9]">
              Premium{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">
                Aluminium.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 md:mb-12 leading-relaxed font-medium max-w-2xl">
              Your trusted partner for high-quality aluminium sheets, profiles,
              pipes, rods & coils.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30"
              >
                Browse Products{" "}
                <ArrowRight className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                to="/inquiry"
                className="inline-flex items-center justify-center bg-white/5 text-white border border-white/20 backdrop-blur-lg px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Innovation Spotlight */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-16 gap-6 border-b border-slate-200 pb-12">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 text-blue-600 mb-2">
                <Binary className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-[0.6em] font-mono">
                  Featured Products
                </span>
              </div>
              <h2 className="text-3xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">
                Featured <span className="text-slate-300">Aluminium</span>
              </h2>
            </div>
            <div className="flex items-center space-x-8">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Wide Range
                </span>
                <span className="text-xl font-black text-slate-900 uppercase">
                  All Grades Available
                </span>
              </div>
              <Link
                to="/products"
                className="group flex items-center space-x-4 bg-slate-900 text-white px-8 py-4 rounded-2xl transition-all hover:shadow-2xl"
              >
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                  View All Products
                </span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredProducts.map((p, idx) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="group relative flex flex-col bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-slate-100"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="w-full sm:w-[45%] relative overflow-hidden bg-slate-100">
                    <img
                      src={p.images[0]}
                      className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                      alt={p.name}
                    />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>

                    <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="text-[8px] font-mono font-black text-white uppercase tracking-widest">
                        UNIT_{p.id}
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[8px] font-black uppercase tracking-tighter text-slate-900">
                        In Stock
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-[55%] p-8 flex flex-col justify-between relative">
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <Fingerprint className="h-4 w-4 text-blue-600" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 font-mono">
                          {p.categoryId}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 group-hover:text-blue-600 transition-colors leading-none">
                        {p.name}
                      </h3>

                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 font-medium mb-8">
                        {p.shortDescription}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(p.specs || {})
                          .slice(0, 2)
                          .map(([key, val]) => (
                            <div
                              key={key}
                              className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100"
                            >
                              <span className="text-[7px] font-black text-slate-400 uppercase mr-2">
                                {key}:
                              </span>
                              <span className="text-[8px] font-bold text-slate-900">
                                {String(val)}
                              </span>
                            </div>
                          ))}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">
                          View Details
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center transform group-hover:rotate-45 transition-all">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories Segment */}
      <section className="py-20 md:py-32 bg-slate-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl shadow-blue-500/20">
              <Layers className="h-3 w-3" />
              <span>Product Categories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-6">
              Our Products
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
              Explore our comprehensive range of aluminium products for all your
              industrial and commercial needs.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => {
                const IconComponent = IconMap[cat.icon] || Activity;
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.id}`}
                    className="group bg-white rounded-[3rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col"
                  >
                    <div className="h-64 relative overflow-hidden shrink-0">
                      <img
                        src={cat.image}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        alt={cat.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                          {cat.productCount} Units
                        </div>
                      </div>
                    </div>

                    <div className="p-8 md:p-10 flex-grow flex flex-col">
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium flex-grow">
                        {cat.description}
                      </p>

                      <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                          View Products
                        </span>
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group border border-slate-800 transition-colors shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <Box className="h-16 w-16 text-blue-500 mb-8 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
                  Custom Orders
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-10">
                  Need a specific aluminium grade or size? We can source custom
                  specifications to meet your exact requirements.
                </p>
                <Link
                  to="/inquiry"
                  className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">
                No product categories found. Please check back later.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
