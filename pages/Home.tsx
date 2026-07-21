import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../services/db";
import { Category, Product, Project } from "../types";
import { Skel, Img, PublicState } from "../components/public";
import {
  ArrowRight,
  Activity,
  Box,
  Layers,
  Fingerprint,
  Circle,
  Cylinder,
  Minus,
  PackageSearch,
  ShieldCheck,
  Truck,
  Award,
  Headset,
  Briefcase,
  MapPin,
  Calendar,
} from "lucide-react";

const STRENGTHS = [
  {
    icon: ShieldCheck,
    title: "Certified Quality",
    description:
      "Every batch is tested and certified to meet strict industry standards for purity and durability.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Reliable logistics network ensuring on-time delivery across regions, big or small orders.",
  },
  {
    icon: Award,
    title: "15+ Years Experience",
    description:
      "Decades of expertise in aluminium sourcing, processing, and supply for diverse industries.",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    description:
      "A responsive team ready to help you find the right grade, size, and specification.",
  },
];

const IconMap: Record<string, any> = {
  Layers,
  Box,
  Cylinder,
  Minus,
  Circle,
  Activity,
};

const HERO_STATS = [
  { value: "15+", label: "Years Experience" },
  { value: "500+", label: "Projects Delivered" },
  { value: "1000+", label: "Happy Clients" },
  { value: "5", label: "Product Lines" },
];

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<
    (Category & { productCount: number })[]
  >([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allProducts, allCategories, allProjects] = await Promise.all([
          db.getProducts(),
          db.getCategories(),
          db.getProjects(),
        ]);

        // Prefer spotlight projects on the home page; fall back to the most
        // recent active ones if none are marked as spotlight.
        const activeProjects = allProjects.filter((p) => p.isActive);
        const spotlight = activeProjects.filter((p) => p.isFeatured);
        setProjects(spotlight.length > 0 ? spotlight : activeProjects);

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
      <div className="bg-slate-50 min-h-screen">
        {/* Hero silhouette */}
        <Skel className="h-[440px] md:h-[520px] w-full rounded-none" />

        {/* Section silhouette */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-8 space-y-3">
            <Skel className="h-3 w-40 rounded-full" />
            <Skel className="h-7 w-64 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-3"
              >
                <Skel className="h-36 w-full rounded-xl" />
                <div className="p-3 space-y-2.5">
                  <Skel className="h-4 w-3/4 rounded-lg" />
                  <Skel className="h-3 w-full rounded-full" />
                  <Skel className="h-3 w-5/6 rounded-full" />
                  <div className="flex items-center justify-between pt-3">
                    <Skel className="h-3 w-24 rounded-full" />
                    <Skel className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 bg-slate-50">
      {/* Hero Section */}
      <section className="relative flex items-center overflow-hidden bg-slate-950 py-20 md:py-28">
        <div className="absolute inset-0 z-0 scale-105">
          <Img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover brightness-[0.22]"
            alt="Aluminium Products Background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/85 to-slate-950/40"></div>
        </div>

        {/* Decorative gradient glows */}
        <div className="absolute -top-32 -left-24 w-[30rem] h-[30rem] bg-blue-600/25 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute -bottom-40 right-0 w-[32rem] h-[32rem] bg-indigo-600/15 rounded-full blur-[140px]"></div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-xl border border-white/20">
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
            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tighter leading-[0.9]">
              Premium{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">
                Aluminium
              </span>
              <br />
              for Every Build.
            </h1>
            <p className="text-base md:text-xl text-slate-300/90 mb-8 leading-relaxed font-medium max-w-2xl">
              Your trusted partner for high-quality aluminium sheets, profiles,
              pipes, rods &amp; coils — engineered for industry and delivered on
              time.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center bg-blue-600 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5"
              >
                Browse Products{" "}
                <ArrowRight className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/inquiry"
                className="inline-flex items-center justify-center bg-white/5 text-white border border-white/20 backdrop-blur-lg px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-white/10 transition-all hover:-translate-y-0.5"
              >
                Request Quote
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-12 md:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl max-w-3xl">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/[0.02] px-5 py-5 text-center sm:text-left"
              >
                <div className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                  {stat.value}
                </div>
                <div className="mt-1 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-blue-400/90">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Spotlight */}
      {featuredProducts.length > 0 && (
        <section className="relative overflow-hidden bg-white py-16 md:py-24">
          {/* Single subtle decorative glow */}
          <div
            className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-blue-600/[0.07] rounded-full blur-[120px]"
            aria-hidden="true"
          ></div>

          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-10 md:mb-14">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="font-mono text-[10px] font-black tracking-[0.4em] text-blue-600">
                  /01
                </span>
                <span className="h-px w-8 bg-blue-600/40"></span>
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">
                  Featured Products
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-slate-900">
                Featured <span className="text-slate-300">Aluminium</span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium text-sm md:text-base leading-relaxed">
                Hand-picked, in-demand stock — precision-grade sheets, profiles and
                extrusions, certified and ready to ship.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/[0.08] hover:border-blue-100 transition-all duration-300"
                >
                  {/* Hairline accent that lights up on hover */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="w-full sm:w-[45%] relative overflow-hidden bg-slate-100">
                      <Img
                        src={p.images[0]}
                        className="w-full h-full min-h-[180px] object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                        alt={p.name}
                      />
                      {/* Scrim + sheen sweep */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out"></div>

                      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="text-[8px] font-mono font-black text-white uppercase tracking-widest">
                          UNIT_{p.id}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg shadow-slate-950/10">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-900">
                          In Stock
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-[55%] p-5 md:p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-3">
                          <Fingerprint className="h-4 w-4 text-blue-600" />
                          <span className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 font-mono">
                            {p.categoryId}
                          </span>
                        </div>

                        <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter mb-2 group-hover:text-blue-600 transition-colors leading-none">
                          {p.name}
                        </h3>

                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 font-medium mb-4">
                          {p.shortDescription}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(p.specs || {})
                            .slice(0, 3)
                            .map(([key, val]) => (
                              <div
                                key={key}
                                className="flex items-baseline gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 group-hover:border-blue-200/80 group-hover:bg-blue-50/40 transition-colors duration-300"
                              >
                                <span className="text-[7px] font-mono font-black text-slate-400 uppercase tracking-widest">
                                  {key}
                                </span>
                                <span className="text-[9px] font-black text-slate-900 uppercase tracking-tight">
                                  {String(val)}
                                </span>
                              </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 group-hover:border-blue-100 transition-colors">
                          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover:text-blue-600 transition-colors">
                            View Details
                          </span>
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10 group-hover:bg-blue-600 group-hover:shadow-blue-600/30 transition-all duration-300">
                            <ArrowRight className="h-4 w-4 group-hover:-rotate-45 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-10 md:mt-14">
              <span
                className="hidden sm:block h-px w-16 bg-gradient-to-r from-transparent to-slate-200"
                aria-hidden="true"
              ></span>
              <Link
                to="/products"
                className="group inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-blue-600/20 active:scale-95"
              >
                <span>View All Products</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <span
                className="hidden sm:block h-px w-16 bg-gradient-to-l from-transparent to-slate-200"
                aria-hidden="true"
              ></span>
            </div>
          </div>
        </section>
      )}

      {/* Categories Segment */}
      <section className="relative py-16 md:py-24 bg-slate-50 overflow-hidden">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)",
            backgroundSize: "26px 26px",
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="font-mono text-[10px] font-black tracking-[0.4em] text-blue-600">
                /02
              </span>
              <span className="h-px w-8 bg-blue-600/40"></span>
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">
                Product Categories
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-slate-900">
              Our <span className="text-slate-300">Products</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium text-sm md:text-base leading-relaxed">
              Explore our comprehensive range of aluminium products for all
              your industrial and commercial needs.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const IconComponent = IconMap[cat.icon] || Activity;
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col"
                  >
                    <div className="h-40 relative overflow-hidden shrink-0">
                      <Img
                        src={cat.image}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={cat.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <div className="bg-white/10 backdrop-blur-xl p-2.5 rounded-xl border border-white/20 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:shadow-lg group-hover:shadow-blue-600/40 transition-all duration-300">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          <span className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-900">
                            {cat.productCount} Units
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="text-base font-black text-slate-900 mb-1.5 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-slate-500 text-xs leading-relaxed mb-4 font-medium flex-grow line-clamp-2">
                        {cat.description}
                      </p>

                      <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 group-hover:border-blue-100 transition-colors duration-300">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.25em] group-hover:text-blue-600 transition-colors">
                          View Products
                        </span>
                        <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-all duration-300">
                          <ArrowRight className="h-4 w-4 group-hover:-rotate-45 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Custom Orders promo */}
              <div className="group relative bg-slate-950 rounded-2xl p-6 text-white flex flex-col justify-center items-center text-center overflow-hidden border border-slate-800 shadow-2xl">
                <div className="absolute -top-16 -right-16 w-44 h-44 bg-blue-600/25 rounded-full blur-[80px] group-hover:bg-blue-600/40 transition-colors duration-500"></div>
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                  }}
                ></div>
                <div className="relative z-10 flex flex-col items-center w-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-600/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                    <Box className="h-7 w-7 text-white" />
                  </div>
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">
                    Bespoke Sourcing
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-2">
                    Custom Orders
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-5 font-medium">
                    Need a specific aluminium grade or size? We can source
                    custom specifications to meet your exact requirements.
                  </p>
                  <Link
                    to="/inquiry"
                    className="group/cta w-full inline-flex items-center justify-center gap-2 bg-white text-slate-900 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
                  >
                    <span>Contact Us</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover/cta:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <PublicState
              icon={PackageSearch}
              title="No Categories Yet"
              message="No product categories found. Please check back later."
              action={
                <Link
                  to="/inquiry"
                  className="inline-flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          )}
        </div>
      </section>

      {/* Our Strength Segment */}
      <section className="relative overflow-hidden bg-slate-950 py-16 md:py-24">
        {/* Decorative gradient glows (echoing the hero) */}
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-blue-600/15 rounded-full blur-[130px]"></div>
        <div className="absolute -bottom-40 -right-24 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[140px]"></div>

        {/* Subtle grid pattern (same 56px rhythm as the hero) */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="font-mono text-[10px] font-black tracking-[0.4em] text-blue-400">
                /03
              </span>
              <span className="h-px w-8 bg-blue-400/40"></span>
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-white">
              Our <span className="text-slate-600">Strength</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-medium text-sm md:text-base leading-relaxed">
              We combine premium material, proven expertise, and reliable
              service to power your projects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {STRENGTHS.map((s, i) => {
              const IconComponent = s.icon;
              return (
                <div
                  key={s.title}
                  className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-7 hover:bg-white/10 hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-300">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-[10px] font-black tracking-[0.3em] text-slate-600 group-hover:text-blue-400/80 transition-colors">
                      {`0${i + 1}`}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium flex-grow">
                    {s.description}
                  </p>

                  <div className="mt-6 h-px w-full bg-white/10 overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-blue-500 to-indigo-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Projects Segment */}
      {projects.length > 0 && (
        <section className="relative overflow-hidden bg-white py-16 md:py-24">
          {/* Single subtle decorative glow */}
          <div className="pointer-events-none absolute -bottom-40 -right-32 w-[26rem] h-[26rem] bg-blue-600/[0.06] rounded-full blur-[120px]"></div>

          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-10 md:mb-14">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="font-mono text-[10px] font-black tracking-[0.4em] text-blue-600">
                  /04
                </span>
                <span className="h-px w-8 bg-blue-600/40"></span>
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">
                  Our Work
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-slate-900">
                Latest <span className="text-slate-300">Projects</span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium text-sm md:text-base leading-relaxed">
                A glimpse of the aluminium projects we've delivered for clients
                across industries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.slice(0, 3).map((proj, idx) => (
                <Link
                  key={proj.id}
                  to={`/projects/${proj.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col"
                >
                  <div className="h-48 md:h-52 relative overflow-hidden shrink-0 bg-slate-100">
                    <Img
                      src={proj.images?.[0] || (proj as any).image}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={proj.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-slate-950/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/15">
                      <Briefcase className="h-3 w-3 text-blue-400" />
                      <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">
                        {proj.category}
                      </span>
                    </div>

                    {/* Year badge */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">
                        {proj.year}
                      </span>
                    </div>

                    {/* Mono index — echoes the /04 motif */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="font-mono text-[9px] font-black tracking-[0.3em] text-white/60 group-hover:text-blue-400 transition-colors">
                        P.0{idx + 1}
                      </span>
                      <span className="h-px w-6 bg-white/25 group-hover:w-10 group-hover:bg-blue-400/60 transition-all duration-300"></span>
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-3 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                      {proj.title}
                    </h3>

                    {/* Location row */}
                    <div className="flex items-center space-x-2.5 mb-5">
                      <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                        <MapPin className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 truncate">
                        {proj.location}
                      </span>
                    </div>

                    {/* View-Details affordance — unified card-footer spec */}
                    <div className="mt-auto flex items-center justify-between pt-3.5 border-t border-slate-100 group-hover:border-blue-100 transition-colors">
                      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover:text-blue-600 transition-colors">
                        View Project
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:-rotate-45 transition-all duration-300">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 md:mt-14 flex items-center justify-center gap-4">
              <span className="hidden sm:block h-px w-16 bg-gradient-to-r from-transparent to-slate-200"></span>
              <Link
                to="/projects"
                className="group inline-flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-blue-600/25 hover:-translate-y-0.5 active:scale-95"
              >
                <span>Show More Projects</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="hidden sm:block h-px w-16 bg-gradient-to-l from-transparent to-slate-200"></span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
