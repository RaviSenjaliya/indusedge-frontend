import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Header, Footer } from "./components/Layout";
import { Home } from "./pages/Home";
import { ProductCatalog } from "./pages/ProductCatalog";
import { ProductDetail } from "./pages/ProductDetail";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { InquiryForm } from "./components/InquiryForm";
import { db } from "./services/db";
import { Factory, Loader2 } from "lucide-react";

// Admin Imports
import { AdminLayout } from "./pages/admin/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { Login } from "./pages/admin/Login";
import { ManageSections } from "./pages/admin/ManageSections";
import { ManageProducts } from "./pages/admin/ManageProducts";
import { ManageInquiries } from "./pages/admin/ManageInquiries";
import { ManageProjects } from "./pages/admin/ManageProjects";
import { ImageUpload } from "./pages/admin/ImageUpload";
import {
  MapPin,
  Navigation,
  ArrowUpRight,
  MessageSquare,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
} from "lucide-react";

const Preloader: React.FC<{ status: string }> = ({ status }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 z-[9999] flex flex-col items-center justify-center p-6 text-center">
      {/* Top progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 overflow-hidden">
        <div className="w-1/2 h-full bg-blue-600 animate-[loading_1.5s_infinite_linear]"></div>
      </div>

      {/* Company logo — matches the site header brand */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Pulsing glow ring behind the logo */}
        <div className="absolute h-24 w-24 rounded-full bg-blue-600/20 animate-ping"></div>
        <div className="bg-blue-600 p-4 rounded-2xl shadow-2xl shadow-blue-500/30 animate-[logoPop_1.8s_ease-in-out_infinite]">
          <Factory className="h-9 w-9 text-white" />
        </div>
      </div>

      {/* Company wordmark — same gradient treatment as the header */}
      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-6">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
          PALAK
        </span>
        <span className="text-white">ALUMINIUM</span>
      </h2>

      {/* Status line */}
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">
          {status}
        </span>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes logoPop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

const InquiryPage: React.FC = () => {
  const DIRECTIONS_URL =
    "https://www.google.com/maps/dir/?api=1&destination=GIDC+Industrial+Estate+Makarpura+Vadodara+Gujarat";

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.5em] py-2 px-6 rounded-full w-fit mx-auto mb-5 shadow-xl">
            Get in Touch
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-3 leading-none">
            Request a Quote
          </h1>
          <p className="text-slate-500 mx-auto font-medium text-sm md:text-base leading-relaxed">
            Tell us what you need — our Vadodara team replies with pricing and
            availability within one business day.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Form + contact channels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inquiry form — the primary action */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
                    Send an Inquiry
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Fields marked <span className="text-blue-600 font-bold">*</span> are required
                  </p>
                </div>
              </div>
              <InquiryForm />
            </div>
          </div>

          {/* Contact sidebar */}
          <div className="lg:col-span-5 space-y-5">
            {/* Talk to us directly */}
            <div className="bg-slate-900 rounded-2xl p-5 md:p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-600/20 rounded-full blur-[80px] -mr-14 -mt-14"></div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-5 relative z-10 text-slate-300">
                Talk to us directly
              </h3>
              <div className="space-y-2 relative z-10">
                <a
                  href="tel:+919999999999"
                  className="flex items-center gap-4 rounded-xl p-2 -m-2 group/item transition-colors hover:bg-white/5"
                >
                  <div className="bg-white/10 p-3 rounded-xl group-hover/item:bg-blue-600 transition-colors shrink-0">
                    <Phone className="h-5 w-5 text-blue-400 group-hover/item:text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Call us
                    </div>
                    <div className="text-base font-bold tracking-tight">
                      +91 99999 99999
                    </div>
                  </div>
                </a>
                <a
                  href="mailto:info@palakaluminium.com"
                  className="flex items-center gap-4 rounded-xl p-2 -m-2 group/item transition-colors hover:bg-white/5"
                >
                  <div className="bg-white/10 p-3 rounded-xl group-hover/item:bg-blue-600 transition-colors shrink-0">
                    <Mail className="h-5 w-5 text-blue-400 group-hover/item:text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Email us
                    </div>
                    <div className="text-sm font-bold tracking-tight break-all">
                      info@palakaluminium.com
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Hours + response promise */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2.5 rounded-xl shrink-0">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Business Hours
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Mon – Sat · 09:00 – 19:00
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <div className="bg-blue-50 p-2.5 rounded-xl shrink-0">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Every inquiry gets a reply within{" "}
                  <span className="font-bold text-slate-700">4 business hours</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location / map — supporting info at the bottom */}
        <div className="mt-10 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Visit Our Facility
                </h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                  GIDC, Makarpura, Vadodara
                </p>
              </div>
            </div>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 text-white flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-blue-600 transition-all active:scale-95 w-fit"
            >
              <Navigation className="h-4 w-4 text-blue-400" />
              <span>Get Directions</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-40" />
            </a>
          </div>

          <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 h-[280px] md:h-[360px] relative group">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59048.87189196555!2d73.13670189311317!3d22.332688005391696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc8ab91a3ddab%3A0xac39d3b31102f48f!2sGIDC%20Industrial%20Estate%2C%20Makarpura%2C%20Vadodara%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1711111111111!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Palak Aluminium location"
              className="grayscale contrast-125 opacity-90 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [status, setStatus] = useState("Initializing Connection...");

  useEffect(() => {
    const warmup = async () => {
      let ready = false;
      let attempt = 0;
      while (!ready) {
        attempt++;
        setStatus(
          attempt === 1
            ? "Pinging Backend..."
            : `Attempt ${attempt}: Backend Waking Up...`
        );
        try {
          // fetch here directly to get data for status messages
          const response = await fetch("/api/ping", {
            signal: AbortSignal.timeout(5000),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.database === "connected") {
              ready = true;
              setStatus("System Ready! Loading app...");
            } else {
              setStatus("API Online. Connecting to Database...");
            }
          }
        } catch (e) {
          ready = false;
        }
        if (!ready) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
      setIsBackendReady(true);
    };

    warmup();
  }, []);

  if (!isBackendReady) {
    return <Preloader status={status} />;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/*"
            element={
              <>
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductCatalog />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/inquiry" element={<InquiryPage />} />
                    {/* Legacy redirects */}
                    <Route
                      path="/categories"
                      element={<Navigate to="/" replace />}
                    />
                    <Route
                      path="/about"
                      element={<Navigate to="/inquiry" replace />}
                    />
                    <Route
                      path="/contact"
                      element={<Navigate to="/inquiry" replace />}
                    />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />

          {/* Admin Gate */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sections" element={<ManageSections />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="projects" element={<ManageProjects />} />
            <Route path="inquiries" element={<ManageInquiries />} />
            <Route path="media" element={<ImageUpload />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
