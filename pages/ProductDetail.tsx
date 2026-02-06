import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../services/db";
import { InquiryForm } from "../components/InquiryForm";
import {
  ArrowLeft,
  Shield,
  Clock,
  FileText,
  Info,
  ZoomIn,
  MessageCircle,
} from "lucide-react";
import { Product } from "../types";

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImg, setActiveImg] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(true);

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
    return <div className="p-20 text-center">Loading product data...</div>;
  if (!product)
    return <div className="p-20 text-center font-bold">Product not found.</div>;

  return (
    <div className="bg-slate-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center text-slate-500 font-medium hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-md relative group border border-slate-200">
              <img
                src={activeImg}
                className="w-full aspect-square object-cover"
                alt={product.name}
              />
              <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-5 w-5 text-slate-700" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === img
                      ? "border-blue-600"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt={`Thumb ${i}`}
                  />
                </button>
              ))}
            </div>

            {/* Summary Block */}
            <div className="bg-blue-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
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
          <div className="space-y-10">
            <div>
              <span className="text-blue-600 font-bold uppercase tracking-widest text-[10px] bg-blue-50 px-3 py-1 rounded-full">
                {product.categoryId}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mt-6 mb-6 leading-tight uppercase tracking-tighter">
                {product.name}
              </h1>
              <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-base md:text-lg font-bold mb-6 flex items-center border-b pb-4 border-slate-100 uppercase tracking-widest text-[10px]">
                <Info className="h-5 w-5 mr-2 text-blue-600" /> Specifications
              </h3>
              <div className="space-y-4">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0"
                  >
                    <span className="text-slate-500 font-medium">{k}</span>
                    <span className="text-slate-900 font-bold bg-slate-50 px-3 py-1 rounded-lg">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="mb-8 relative z-10">
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
    </div>
  );
};
