import React, { useEffect, useState } from "react";
import { db } from "../../services/db";
import {
  Package,
  Mail,
  Layers,
  TrendingUp,
  Plus,
  Settings,
  ChevronRight,
  Activity,
  Wifi,
  WifiOff,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Product, Category, Inquiry } from "../../types";

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageCount, setImageCount] = useState(0);
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [p, i, c, imgs, health] = await Promise.all([
          db.getProducts(),
          db.getInquiries(),
          db.getCategories(),
          db.getImages(),
          db.checkHealth(),
        ]);
        const sortedInquiries = [...i].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setProducts(p);
        setInquiries(sortedInquiries);
        setCategories(c);
        setImageCount(imgs.length);
        setIsApiOnline(health);
      } catch (error) {
        console.error("Dashboard data load error:", error);
        setIsApiOnline(false);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 md:space-y-6">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-slate-900 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px]">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Live Products",
      value: products.filter((p) => p.isActive).length,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Sections",
      value: categories.filter((c) => c.isActive).length,
      icon: Layers,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "New Inquiries",
      value: inquiries.filter((i) => i.status === "NEW").length,
      icon: Mail,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Total Uploads",
      value: imageCount,
      icon: Upload,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            System Overview
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Palak Aluminium Admin Panel
          </p>
        </div>
        <div
          className={`flex items-center space-x-3 px-5 py-2 md:px-6 md:py-2.5 rounded-full border shadow-sm transition-all ${
            isApiOnline
              ? "bg-white border-green-100"
              : "bg-red-50 border-red-100 animate-pulse"
          }`}
        >
          {isApiOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
              isApiOnline ? "text-green-600" : "text-red-600"
            }`}
          >
            {isApiOnline ? "Database: Connected" : "API Offline"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div
              className={`${s.bg} w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8 group-hover:scale-110 transition-transform`}
            >
              <s.icon className={`h-5 w-5 md:h-7 md:w-7 ${s.color}`} />
            </div>
            <div className="text-2xl md:text-4xl font-black text-slate-900 mb-1 md:mb-2">
              {s.value}
            </div>
            <div className="text-slate-400 font-bold text-[8px] md:text-[10px] uppercase tracking-widest">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Inquiries */}
        <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[400px] flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-6 md:mb-10">
            <h3 className="text-lg md:text-xl font-black text-slate-900">
              Recent Inquiries
            </h3>
            <Link
              to="/admin/inquiries"
              className="text-[9px] md:text-[10px] font-black uppercase text-blue-600 hover:underline flex items-center whitespace-nowrap"
            >
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          {inquiries.length > 0 ? (
            <div className="space-y-4">
              {inquiries
                .filter((i) => i.status === "NEW")
                .slice(0, 5)
                .map((inq) => (
                  <Link
                    to="/admin/inquiries"
                    key={inq.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 md:p-6 bg-slate-50/50 hover:bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 transition-colors group space-y-4 sm:space-y-0 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4 md:space-x-5 w-full sm:w-auto">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 font-black border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        {inq.customerName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate text-sm md:text-base">
                          {inq.customerName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {inq.company || "Private Buyer"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-4 md:space-x-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right min-w-0">
                        <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400">
                          Requesting
                        </div>
                        <div className="text-[11px] md:text-xs font-bold text-slate-700 truncate max-w-[120px] md:max-w-[150px]">
                          {inq.productName || "General Quote"}
                        </div>
                      </div>
                      <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black border tracking-tighter shrink-0 bg-orange-100 text-orange-600 border-orange-200">
                        NEW
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center p-8 md:p-12">
              <div>
                <Mail className="h-10 w-10 md:h-12 md:w-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-sm">
                  No records found in the lead queue.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-600/20 rounded-full blur-3xl -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
            <h3 className="text-xl font-black mb-6 md:mb-8 relative z-10">
              Quick Actions
            </h3>
            <div className="space-y-3 md:space-y-4 relative z-10">
              <Link
                to="/admin/products"
                className="flex items-center justify-between w-full p-4 md:p-5 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl transition-all group"
              >
                <span className="font-bold text-sm flex items-center">
                  <Plus className="h-4 w-4 mr-3" /> New Product
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
              <Link
                to="/admin/sections"
                className="flex items-center justify-between w-full p-4 md:p-5 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl transition-all group"
              >
                <span className="font-bold text-sm flex items-center">
                  <Layers className="h-4 w-4 mr-3" /> Add Section
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
              <Link
                to="/admin/media"
                className="flex items-center justify-between w-full p-4 md:p-5 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl transition-all group"
              >
                <span className="font-bold text-sm flex items-center">
                  <Upload className="h-4 w-4 mr-3" /> Add Images
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm transition-colors">
            <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2">
              Catalog Sync
            </h3>
            <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed mb-6">
              Your product catalog has {products.length} products across{" "}
              {categories.length} categories.
            </p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-blue-600 transition-all duration-1000`}
                style={{
                  width: `${Math.min(100, (products.length / 20) * 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Products
              </span>
              <span className="text-[9px] md:text-[10px] font-black text-blue-600">
                {products.length} Items
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
