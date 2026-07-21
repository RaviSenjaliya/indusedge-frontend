import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../services/db";
import { Skel, Img, PublicState } from "../components/public";
import { Project } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  Calendar,
  Tag,
  ZoomIn,
  PackageX,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [related, setRelated] = useState<Project[]>([]);
  const [activeImg, setActiveImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [zoomOpen, setZoomOpen] = useState(false);

  const galleryImages = project?.images?.length
    ? project.images
    : (project as any)?.image
    ? [(project as any).image]
    : [];

  // Step through gallery images (wraps around). dir: -1 prev, +1 next.
  const step = (dir: number) => {
    if (galleryImages.length < 2) return;
    const idx = galleryImages.indexOf(activeImg);
    const base = idx === -1 ? 0 : idx;
    const next =
      (base + dir + galleryImages.length) % galleryImages.length;
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
  }, [zoomOpen, activeImg, project]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const all = await db.getProjects();
        const p = all.find((x) => x.id === id);
        if (p && p.isActive) {
          setProject(p);
          setActiveImg(p.images?.[0] || (p as any).image || "");

          // Other active projects — same category first, then fill with the
          // rest. Excludes the current project. Capped at 3.
          const others = all.filter((x) => x.isActive && x.id !== p.id);
          const sameCategory = others.filter(
            (x) => x.category && x.category === p.category
          );
          const restFill = others.filter(
            (x) => !sameCategory.some((s) => s.id === x.id)
          );
          setRelated([...sameCategory, ...restFill].slice(0, 3));
        } else {
          setProject(null);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading)
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skel className="h-4 w-40 rounded-md mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <Skel className="aspect-[4/3] w-full rounded-2xl" />
              <div className="grid grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skel key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skel className="h-6 w-28 rounded-full" />
              <Skel className="h-8 w-4/5 rounded-lg" />
              <div className="space-y-2.5 pt-2">
                <Skel className="h-4 w-full rounded-md" />
                <Skel className="h-4 w-full rounded-md" />
                <Skel className="h-4 w-3/4 rounded-md" />
              </div>
              <Skel className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );

  if (!project)
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <PublicState
            icon={PackageX}
            title="Project Not Found"
            message="We couldn't find the project you're looking for. It may have been removed or is no longer available."
            action={
              <Link
                to="/projects"
                className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
              </Link>
            }
          />
        </div>
      </div>
    );

  const images = galleryImages;

  return (
    <div className="bg-slate-50 min-h-screen pb-24 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/projects"
          className="inline-flex items-center text-slate-500 font-medium hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
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
                className="w-full aspect-[4/3] object-cover"
                alt={project.title}
              />
              <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-5 w-5 text-slate-700" />
              </div>
              {project.category && (
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">
                    {project.category}
                  </span>
                </div>
              )}
            </button>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, i) => (
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
                      alt={`${project.title} view ${i + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-blue-500/20">
                <Briefcase className="h-3 w-3" />
                <span>Project</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-5 mb-5 leading-tight uppercase tracking-tighter">
                {project.title}
              </h1>
              <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-medium whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {project.category && (
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <Tag className="h-5 w-5 text-blue-600 mb-2" />
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Category
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {project.category}
                  </div>
                </div>
              )}
              {project.location && (
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <MapPin className="h-5 w-5 text-blue-600 mb-2" />
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Location
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {project.location}
                  </div>
                </div>
              )}
              {project.year && (
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <Calendar className="h-5 w-5 text-blue-600 mb-2" />
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Year
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {project.year}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-2">
                  Planning something similar?
                </h2>
                <p className="text-slate-400 text-sm font-medium mb-6 max-w-md">
                  Tell us your requirements and our team will help you source the
                  right aluminium for your project.
                </p>
                <Link
                  to="/inquiry"
                  className="group inline-flex items-center space-x-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                >
                  <span>Request a Quote</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* More Projects */}
        {related.length > 0 && (
          <div className="mt-14 md:mt-16 border-t border-slate-200 pt-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center space-x-3 text-blue-600 mb-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] font-mono">
                    Explore More
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  Other <span className="text-slate-300">Projects</span>
                </h2>
              </div>
              <Link
                to="/projects"
                className="group hidden sm:flex items-center space-x-3 bg-slate-900 text-white px-6 py-3.5 rounded-2xl transition-all hover:bg-blue-600"
              >
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                  View All
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/projects/${rp.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="h-44 relative overflow-hidden shrink-0">
                    <Img
                      src={rp.images?.[0] || (rp as any).image}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={rp.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    {rp.category && (
                      <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/20">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">
                          {rp.category}
                        </span>
                      </div>
                    )}
                    {rp.year && (
                      <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg shadow-xl">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">
                          {rp.year}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-base font-black text-slate-900 mb-1.5 uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                      {rp.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">
                        {rp.location}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-image lightbox — shows the active image uncropped */}
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
            alt={project.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-auto max-w-full object-contain rounded-lg animate-in fade-in duration-200"
          />
        </div>
      )}
    </div>
  );
};
