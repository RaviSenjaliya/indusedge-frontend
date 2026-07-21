import React, { useState } from "react";
import { InquiryFormData } from "../types";
import {
  CheckCircle,
  Loader2,
  User,
  Phone,
  MessageSquare,
  Send,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Building2,
} from "lucide-react";
import { db } from "../services/db";
import { SearchableSelect } from "./ui";

interface Props {
  productName?: string;
  productId?: string;
}

// Indian states & union territories for the required State field.
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const InquiryForm: React.FC<Props> = ({ productName, productId }) => {
  const [formData, setFormData] = useState<InquiryFormData>({
    name: "",
    phone: "",
    state: "",
    city: "",
    message: productName ? `Request for Quotation: ${productName}.` : "",
    productId,
    productName,
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await db.addInquiry(formData);
      setStatus("success");

      setFormData({ name: "", phone: "", state: "", city: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("idle");
      alert("Error submitting inquiry. Please try again later.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Only allow numeric characters
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white p-6 rounded-2xl text-center animate-in zoom-in duration-500 border border-slate-100 transition-colors">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="h-6 w-6 text-green-500" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">
          Inquiry Logged
        </h3>
        <p className="text-slate-500 mb-6 font-medium max-w-sm mx-auto leading-relaxed">
          Your technical requirements have been synchronized with our Vadodara
          hub.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="inline-flex items-center space-x-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
        >
          <span>Submit another specification</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Context Badge for Specific Products */}
      {productName && (
        <div className="bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Unit:
            </span>
            <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
              {productName}
            </span>
          </div>
          <span className="text-[9px] font-black uppercase text-blue-400">
            ID: {productId}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name *"
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
          />
        </div>

        <div className="relative group">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            required
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number *"
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchableSelect
            required
            name="state"
            options={INDIAN_STATES}
            value={formData.state}
            onChange={(state) => setFormData((prev) => ({ ...prev, state }))}
            placeholder="Select State *"
            searchPlaceholder="Search state…"
            icon={MapPin}
          />

          <div className="relative group">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              required
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City *"
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
        </div>

        <div className="relative group">
          <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <textarea
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Requirements (Optional)"
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-slate-900 placeholder:text-slate-400 min-h-[110px]"
          />
        </div>
      </div>

      <div className="pt-4 flex flex-col items-center gap-4">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 px-8 rounded-xl flex items-center justify-center space-x-3 transition-all shadow-xl hover:shadow-blue-600/20 active:scale-95 disabled:opacity-50"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs uppercase tracking-[0.2em]">
                Processing...
              </span>
            </>
          ) : (
            <>
              <span className="text-xs uppercase tracking-[0.2em]">
                Send Inquiry
              </span>
              <Send className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="flex items-center space-x-3 text-slate-400">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">
            Verified Technical Transmission
          </span>
        </div>
      </div>
    </form>
  );
};
