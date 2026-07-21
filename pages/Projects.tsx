import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../services/db";
import { Project } from "../types";
import { Img, Skel, PublicState } from "../components/public";
import { Briefcase, MapPin, Calendar, ArrowRight } from "lucide-react";

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const all = await db.getProjects();
        setProjects(all.filter((p) => p.isActive));
      } catch (err) {
        console.error("Projects Page Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 animate-in fade-in duration-700">
      {/* Hero Branding */}
      <div className="bg-slate-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-4 rotate-12 -translate-y-24">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="h-32 border border-white/20 rounded-2xl"
              ></div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl shadow-blue-500/20">
            <Briefcase className="h-3 w-3" />
            <span>Our Portfolio</span>
          </div>
          <h1 className="text-4xl md:text-4xl font-black text-white uppercase tracking-tighter mb-6">
            Our Projects
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            A look at the work we've delivered — from industrial cladding to
            precision-engineered profiles across Gujarat.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <Skel className="h-56 w-full rounded-none" />
                <div className="p-6 space-y-3">
                  <Skel className="h-5 w-3/4 rounded-lg" />
                  <Skel className="h-3 w-1/3 rounded-full" />
                  <Skel className="h-3 w-full rounded-full" />
                  <Skel className="h-3 w-5/6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <PublicState
            icon={Briefcase}
            title="No Projects Yet"
            message="We're currently updating our portfolio. Please check back soon."
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
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              to={`/projects/${proj.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col"
            >
              <div className="h-56 relative overflow-hidden shrink-0">
                <Img
                  src={proj.images?.[0] || (proj as any).image}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  alt={proj.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/20">
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">
                    {proj.category}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg shadow-xl">
                  <Calendar className="h-3 w-3 text-blue-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">
                    {proj.year}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                  {proj.title}
                </h3>
                <div className="flex items-center space-x-2 mb-4 text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {proj.location}
                  </span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed font-medium flex-grow line-clamp-3">
                  {proj.description}
                </p>

                <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-50">
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">
                    View Details
                  </span>
                  <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}

        {/* CTA */}
        <div className="mt-10 bg-slate-900 rounded-2xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-2">
              Have a project in mind?
            </h3>
            <p className="text-slate-400 font-medium text-sm max-w-xl">
              Tell us your requirements and our team will help you source the
              right aluminium for the job.
            </p>
          </div>
          <Link
            to="/inquiry"
            className="relative z-10 group inline-flex items-center space-x-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl whitespace-nowrap"
          >
            <span>Request a Quote</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
