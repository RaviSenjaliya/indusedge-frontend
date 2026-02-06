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
import { ManageNotifications } from "./pages/admin/ManageNotifications";
import { ImageUpload } from "./pages/admin/ImageUpload";
import {
  MapPin,
  Navigation,
  ArrowUpRight,
  MessageSquare,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

const Preloader: React.FC<{ status: string }> = ({ status }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 z-[9999] flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 overflow-hidden">
        <div className="w-1/2 h-full bg-blue-600 animate-[loading_1.5s_infinite_linear]"></div>
      </div>

      <div className="bg-blue-600 p-4 rounded-3xl mb-8 animate-bounce shadow-2xl shadow-blue-500/20">
        <Factory className="h-12 w-12 text-white" />
      </div>

      <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
        Aluminium <span className="text-blue-500">Service</span>
      </h2>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

const InquiryPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen transition-colors duration-300">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.5em] py-2.5 px-8 rounded-full w-fit mx-auto mb-8 shadow-2xl">
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase mb-6 leading-none">
            Contact Us
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            Visit our facility in Vadodara or submit your aluminium requirements
            for a quick quotation.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        {/* Map Section */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  Our Location
                </h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                  Vadodara, Gujarat, India
                </p>
              </div>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm flex items-center space-x-3 transition-colors w-fit">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                Mon - Sat: 09:00 - 19:00
              </span>
            </div>
          </div>

          <div className="w-full bg-white rounded-3xl md:rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-200 h-[400px] md:h-[650px] relative group transition-colors">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59048.87189196555!2d73.13670189311317!3d22.332688005391696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc8ab91a3ddab%3A0xac39d3b31102f48f!2sGIDC%20Industrial%20Estate%2C%20Makarpura%2C%20Vadodara%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1711111111111!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale contrast-125 opacity-90 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-100 md:group-hover:scale-105"
            />
            <div className="absolute bottom-6 md:bottom-10 right-6 left-6 md:left-auto md:right-10">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=GIDC+Industrial+Estate+Makarpura+Vadodara+Gujarat"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 text-white flex items-center justify-center space-x-4 px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all hover:scale-105 active:scale-95"
              >
                <Navigation className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                <span>Get Directions</span>
                <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 opacity-40" />
              </a>
            </div>
          </div>
        </div>

        {/* Forms & Channels Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 pt-8 pb-24">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group border border-transparent transition-colors">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-blue-600/40 transition-colors"></div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-8 md:mb-10 relative z-10">
                Contact Details
              </h3>
              <div className="space-y-8 relative z-10">
                <div className="flex items-center space-x-5 group/item">
                  <div className="bg-white/10 p-5 rounded-2xl group-hover/item:bg-blue-600 transition-colors">
                    <Phone className="h-6 w-6 text-blue-400 group-hover/item:text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">
                      Phone
                    </div>
                    <div className="text-base md:text-lg font-bold tracking-tight">
                      +91 99999 99999
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-5 group/item">
                  <div className="bg-white/10 p-5 rounded-2xl group-hover/item:bg-blue-600 transition-colors">
                    <Mail className="h-6 w-6 text-blue-400 group-hover/item:text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">
                      Email
                    </div>
                    <div className="text-base md:text-lg font-bold tracking-tight break-all md:break-normal">
                      info@palakaluminium.com
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-12 border-t border-slate-800 flex items-center space-x-4">
                <div className="bg-blue-600/20 p-3 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  Quality Assured Products
                </p>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm transition-colors">
              <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-6">
                Quick Response
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                We respond to all inquiries within 4 hours during business
                hours. Get quotations and product availability within one
                business day.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-8 md:p-20 rounded-[3rem] md:rounded-[4rem] border border-slate-200 shadow-xl relative transition-colors">
              <div className="flex items-center space-x-4 mb-8 md:mb-12">
                <div className="bg-slate-50 p-4 rounded-2xl transition-colors">
                  <MessageSquare className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
                  Product Inquiry
                </h3>
              </div>
              <InquiryForm />
            </div>
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
            <Route path="inquiries" element={<ManageInquiries />} />
            <Route path="notifications" element={<ManageNotifications />} />
            <Route path="media" element={<ImageUpload />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
