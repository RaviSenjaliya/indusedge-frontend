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
  AlertCircle,
} from "lucide-react";
import { db, ApiError, AuthError } from "../services/db";
import {
  validateInquiryForm,
  hasErrors,
  API_TO_INQUIRY_FIELD,
  FieldErrors,
} from "../services/validation";
import { SearchableSelect } from "./ui";

interface Props {
  productName?: string;
  productId?: string;
}

const INPUT_BASE =
  "w-full pl-11 pr-4 py-3.5 border rounded-xl outline-none focus:ring-4 transition-all text-slate-900 placeholder:text-slate-400";
const INPUT_OK =
  "bg-slate-50 border-slate-200 focus:ring-blue-500/10 focus:border-blue-600";
const INPUT_ERROR =
  "bg-red-50 border-red-300 focus:ring-red-500/10 focus:border-red-500";

const inputClass = (invalid?: boolean, weight = "font-bold placeholder:font-medium") =>
  `${INPUT_BASE} ${weight} ${invalid ? INPUT_ERROR : INPUT_OK}`;

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-[11px] font-bold text-red-600"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
      <span>{message}</span>
    </p>
  ) : null;

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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate locally first so obvious mistakes never cost a round trip.
    const localErrors = validateInquiryForm(formData);
    if (hasErrors(localErrors)) {
      setErrors(localErrors);
      setFormError("Please correct the highlighted fields.");
      return;
    }

    setErrors({});
    setFormError("");
    setStatus("loading");

    try {
      await db.addInquiry(formData);
      setStatus("success");
      setFormData({ name: "", phone: "", state: "", city: "", message: "" });
    } catch (err) {
      setStatus("idle");

      // The API reports per-field problems; map them onto the inputs.
      if (err instanceof ApiError) {
        const mapped: FieldErrors = {};
        for (const [apiField, message] of Object.entries(err.fields)) {
          mapped[API_TO_INQUIRY_FIELD[apiField] || apiField] = message;
        }
        setErrors(mapped);
        setFormError(
          hasErrors(mapped) ? "Please correct the highlighted fields." : err.message
        );
        return;
      }

      if (err instanceof AuthError) {
        setFormError(err.message);
        return;
      }

      console.error(err);
      setFormError("Could not submit your inquiry. Please try again.");
    }
  };

  /** Clears a field's error as soon as the user edits it. */
  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    clearFieldError(name);

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
    // noValidate: our own messages are shown instead of the browser's generic
    // tooltips, and they match what the API would say.
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="text-xs font-bold">{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
              placeholder="Your Name *"
              className={inputClass(!!errors.name)}
            />
          </div>
          <FieldError message={errors.name} />
        </div>

        <div>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              required
              type="tel"
              inputMode="numeric"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              aria-invalid={!!errors.phone}
              placeholder="Phone Number *"
              className={inputClass(!!errors.phone)}
            />
          </div>
          <FieldError message={errors.phone} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <SearchableSelect
              required
              name="state"
              options={INDIAN_STATES}
              value={formData.state}
              onChange={(state) => {
                clearFieldError("state");
                setFormData((prev) => ({ ...prev, state }));
              }}
              placeholder="Select State *"
              searchPlaceholder="Search state…"
              icon={MapPin}
            />
            <FieldError message={errors.state} />
          </div>

          <div>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
                aria-invalid={!!errors.city}
                placeholder="City *"
                className={inputClass(!!errors.city)}
              />
            </div>
            <FieldError message={errors.city} />
          </div>
        </div>

        <div>
          <div className="relative group">
            <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              aria-invalid={!!errors.message}
              maxLength={2000}
              placeholder="Requirements (Optional)"
              className={`${inputClass(!!errors.message, "font-medium")} min-h-[110px]`}
            />
          </div>
          <FieldError message={errors.message} />
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
