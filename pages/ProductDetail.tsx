import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../services/db";
import { InquiryForm } from "../components/InquiryForm";
import { Skel, Img, PublicState } from "../components/public";
import {
  ArrowLeft,
  Shield,
  Clock,
  FileText,
  Info,
  ZoomIn,
  MessageCircle,
  PackageX,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Product } from "../types";

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImg, setActiveImg] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [zoomOpen, setZoomOpen] = useState(false);

  const galleryImages = product?.images || [];

  // Step through gallery images (wraps around). dir: -1 prev, +1 next.
  const step = (dir: number) => {
    if (galleryImages.length < 2) return;
    const idx = galleryImages.indexOf(activeImg);
    const base = idx === -1 ? 0 : idx;
    const next = (base + dir + galleryImages.length) % galleryImages.length;
    setActiveImg(galleryImages[next]);
  };

  // Lightbox keyboard controls: Escape closes, arrows navigate.
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomOpen, activeImg, product]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoadingProduct(true);
      try {
        const p = await db.getProductById(id);

        // Check if product exists and its category is active
        if (p) {
          const categories = await db.getCategories();
          const category = categories.find((c) => c.id === p.categoryId);

          if (category && category.isActive) {
            setProduct(p);
            setActiveImg(p.images[0]);
          } else {
            setProduct(null); // Treat as not found if section is inactive
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loadingProduct)
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back-link bar */}
          <Skel className="h-4 w-40 rounded-md mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Gallery skeleton */}
            <div className="space-y-4">
              <Skel className="aspect-square w-full rounded-2xl" />
              <div className="grid grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skel key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
              <Skel className="h-40 w-full rounded-2xl" />
            </div>

            {/* Details skeleton */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Skel className="h-6 w-28 rounded-full" />
                <Skel className="h-8 w-4/5 rounded-lg" />
                <Skel className="h-8 w-2/5 rounded-lg" />
                <div className="space-y-2.5 pt-2">
                  <Skel className="h-4 w-full rounded-md" />
                  <Skel className="h-4 w-full rounded-md" />
                  <Skel className="h-4 w-11/12 rounded-md" />
                  <Skel className="h-4 w-3/4 rounded-md" />
                </div>
              </div>
              <Skel className="h-56 w-full rounded-2xl" />
              <Skel className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <PublicState
            icon={PackageX}
            title="Product Not Found"
            message="We couldn't find the product you're looking for. It may have been removed or is no longer available."
            action={
              <Link
                to="/products"
                className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
              </Link>
            }
          />
        </div>
      </div>
    );

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center text-slate-500 font-medium hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Gallery */}
          <div className="space-y-4 lg:sticky lg:top-20 self-start">
            <button
              type="button"
              onClick={() => activeImg && setZoomOpen(true)}
              aria-label="View full image"
              className="block w-full bg-white rounded-2xl overflow-hidden shadow-md relative group border border-slate-200 cursor-zoom-in"
            >
              <Img
                key={activeImg}
                src={activeImg}
                className="w-full aspect-square object-cover"
                alt={product.name}
              />
              <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-5 w-5 text-slate-700" />
              </div>
            </button>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === img
                      ? "border-blue-600 ring-2 ring-blue-600/30"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <Img
                    src={img}
                    className="w-full h-full object-cover"
                    alt={`Thumb ${i}`}
                  />
                </button>
              ))}
            </div>

            {/* Summary Block */}
            <div className="bg-blue-600 rounded-2xl p-6 md:p-5 text-white relative overflow-hidden shadow-lg">
              <div className="absolute top-[-10px] right-[-10px] opacity-10">
                <Info className="h-24 w-24" />
              </div>
              <h3 className="text-lg font-bold flex items-center mb-4">
                <Info className="h-5 w-5 mr-2" />
                Quick Info
              </h3>
              <p className="text-blue-50 text-xs md:text-sm leading-relaxed whitespace-pre-line font-medium">
                {product.shortDescription}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <span className="text-blue-600 font-bold uppercase tracking-widest text-[10px] bg-blue-50 px-3 py-1 rounded-full">
                {product.categoryId}
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-5 mb-5 leading-tight uppercase tracking-tighter">
                {product.name}
              </h1>
              <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-5 border border-slate-200 shadow-sm">
              <h3 className="text-base md:text-lg font-bold mb-6 flex items-center border-b pb-4 border-slate-100 uppercase tracking-widest text-[10px]">
                <Info className="h-5 w-5 mr-2 text-blue-600" /> Specifications
              </h3>
              <div className="space-y-4">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between items-center gap-4 text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-slate-500 font-medium">{k}</span>
                    <span className="text-slate-900 font-bold bg-slate-50 px-3 py-1 rounded-lg transition-colors">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-2xl relative">
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              </div>
              <div className="mb-6 relative z-10">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                  Request Quote
                </h2>
                <p className="text-slate-400 mt-2 text-xs font-medium">
                  Get pricing and availability for your aluminium requirements.
                </p>
              </div>
              <div className="relative z-10">
                <InquiryForm
                  productName={product.name}
                  productId={product.id}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Shield className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-800">
                  Quality Assured
                </span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-800">
                  Fast Lead-times
                </span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <FileText className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-800">
                  Mill Test Cert
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-image lightbox — shows the active image uncropped, with slider */}
      {zoomOpen && activeImg && (
        <div
          className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setZoomOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setZoomOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/20 md:left-6 md:p-3"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/20 md:right-6 md:p-3"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Position counter */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md">
                {Math.max(0, galleryImages.indexOf(activeImg)) + 1} /{" "}
                {galleryImages.length}
              </div>
            </>
          )}

          <img
            key={activeImg}
            src={activeImg}
            alt={product.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-auto max-w-full object-contain rounded-lg animate-in fade-in duration-200"
          />
        </div>
      )}
    </div>
  );
};
