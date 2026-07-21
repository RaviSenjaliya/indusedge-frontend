import React, { useEffect, useState } from "react";
import { db } from "../../services/db";
import {
  Package,
  Mail,
  Layers,
  Plus,
  ChevronRight,
  Wifi,
  WifiOff,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Product, Category, Inquiry } from "../../types";
import {
  PageHeader,
  Badge,
  Card,
  GlowPanel,
  StatCard,
  EmptyState,
  Skeleton,
  SkeletonStat,
} from "../../components/ui";

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

  const recentInquiries = inquiries
    .filter((i) => i.status === "NEW")
    .slice(0, 5);

  const catalogProgress = Math.min(100, (products.length / 20) * 100);

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-500 pb-8">
      <PageHeader
        title="System Overview"
        subtitle="Palak Aluminium Admin Panel"
        actions={
          loading ? (
            <Skeleton className="h-8 w-44 rounded-xl" />
          ) : isApiOnline ? (
            <Badge tone="green" dot icon={Wifi}>
              Database Connected
            </Badge>
          ) : (
            <Badge tone="red" icon={WifiOff}>
              API Offline
            </Badge>
          )
        }
      />

      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 md:gap-5">
            <Skeleton className="min-h-[300px] rounded-2xl lg:col-span-8" />
            <div className="space-y-4 md:space-y-5 lg:col-span-4">
              <Skeleton className="h-60 rounded-2xl" />
              <Skeleton className="h-44 rounded-2xl" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
            <StatCard
              label="Live Products"
              value={products.filter((p) => p.isActive).length}
              icon={Package}
              tone="blue"
            />
            <StatCard
              label="Active Sections"
              value={categories.filter((c) => c.isActive).length}
              icon={Layers}
              tone="indigo"
            />
            <StatCard
              label="New Inquiries"
              value={inquiries.filter((i) => i.status === "NEW").length}
              icon={Mail}
              tone="amber"
            />
            <StatCard
              label="Total Uploads"
              value={imageCount}
              icon={Upload}
              tone="green"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 md:gap-5">
            {/* Recent Inquiries */}
            <Card className="flex min-h-[300px] flex-col lg:col-span-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 md:text-lg dark:text-white">
                  Recent Inquiries
                </h3>
                <Link
                  to="/admin/inquiries"
                  className="flex items-center whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-blue-600 hover:underline md:text-[10px] dark:text-blue-400"
                >
                  View All <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </div>

              {recentInquiries.length > 0 ? (
                <div className="space-y-2.5">
                  {recentInquiries.map((inq) => (
                    <Link
                      to="/admin/inquiries"
                      key={inq.id}
                      className="group flex cursor-pointer flex-col items-start justify-between space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:space-y-0 md:p-4 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                    >
                      <div className="flex w-full items-center space-x-3 sm:w-auto md:space-x-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white font-black text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white md:h-10 md:w-10 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                          {inq.customerName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {inq.customerName}
                          </div>
                          <div className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                            {(inq as Inquiry & { company?: string }).company ||
                              "Private Buyer"}
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full items-center justify-between space-x-4 sm:w-auto sm:justify-end md:space-x-5">
                        <div className="min-w-0 text-left sm:text-right">
                          <div className="text-[8px] font-black uppercase text-slate-400 md:text-[10px] dark:text-slate-500">
                            Requesting
                          </div>
                          <div className="max-w-[120px] truncate text-[11px] font-bold text-slate-700 md:max-w-[150px] md:text-xs dark:text-slate-300">
                            {inq.productName || "General Quote"}
                          </div>
                        </div>
                        <Badge tone="amber" className="shrink-0">
                          New
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-grow items-center justify-center p-8 md:p-12">
                  <EmptyState
                    icon={Mail}
                    title="No new inquiries"
                    message="New quote requests will appear here."
                  />
                </div>
              )}
            </Card>

            {/* Quick Actions + Catalog Sync */}
            <div className="space-y-4 md:space-y-5 lg:col-span-4">
              <GlowPanel padding="lg">
                <h3 className="mb-4 text-lg font-black">
                  Quick Actions
                </h3>
                <div className="space-y-2.5">
                  <Link
                    to="/admin/products"
                    className="group flex w-full items-center justify-between rounded-lg bg-white/10 p-3 transition-all hover:bg-white/20"
                  >
                    <span className="flex items-center text-sm font-bold">
                      <Plus className="mr-3 h-4 w-4" /> New Product
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                  <Link
                    to="/admin/sections"
                    className="group flex w-full items-center justify-between rounded-lg bg-white/10 p-3 transition-all hover:bg-white/20"
                  >
                    <span className="flex items-center text-sm font-bold">
                      <Layers className="mr-3 h-4 w-4" /> Add Section
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                  <Link
                    to="/admin/media"
                    className="group flex w-full items-center justify-between rounded-lg bg-white/10 p-3 transition-all hover:bg-white/20"
                  >
                    <span className="flex items-center text-sm font-bold">
                      <Upload className="mr-3 h-4 w-4" /> Add Images
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                </div>
              </GlowPanel>

              <Card>
                <h3 className="mb-1.5 text-base font-black text-slate-900 md:text-lg dark:text-white">
                  Catalog Sync
                </h3>
                <p className="mb-4 text-[10px] leading-relaxed text-slate-400 md:text-xs dark:text-slate-500">
                  Your product catalog has {products.length} products across{" "}
                  {categories.length} categories.
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-blue-600 transition-all duration-1000 dark:bg-blue-500"
                    style={{ width: `${catalogProgress}%` }}
                  ></div>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 md:text-[10px] dark:text-slate-500">
                    Products
                  </span>
                  <span className="text-[9px] font-black text-blue-600 md:text-[10px] dark:text-blue-400">
                    {products.length} Items
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
