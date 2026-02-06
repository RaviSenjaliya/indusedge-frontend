import React, { useState, useEffect } from "react";
import { db } from "../../services/db";
import { Category, ImageAsset } from "../../types";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Box,
  LayoutGrid,
  Image as ImageIcon,
  X,
} from "lucide-react";

export const ManageSections: React.FC = () => {
  const [sections, setSections] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMediaLib, setShowMediaLib] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<ImageAsset[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      try {
        const data = await db.getCategories();
        setSections(data);
      } catch (err) {
        console.error("Failed to fetch sections:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, []);

  const handleSave = async () => {
    if (!editing?.name || !editing?.image || !editing?.description) {
      alert("All fields are required for product categories.");
      return;
    }

    // Basic URL validation
    try {
      new URL(editing.image || "");
    } catch (_) {
      alert("Please provide a valid asset URL.");
      return;
    }

    const newSec: Category = {
      id: editing.id || "cat_" + Math.random().toString(36).substr(2, 5),
      name: editing.name,
      image: editing.image || "https://picsum.photos/seed/cat/800/600",
      description: editing.description || "",
      isActive: editing.isActive ?? true,
      icon: editing.icon || "Activity",
    };

    await db.saveCategory(newSec);
    const updated = await db.getCategories();
    setSections(updated);
    setEditing(null);
  };

  const toggleStatus = async (id: string) => {
    const s = sections.find((x) => x.id === id);
    if (s) {
      await db.saveCategory({ ...s, isActive: !s.isActive });
      const updated = await db.getCategories();
      setSections(updated);
    }
  };

  const handleOpenMediaLib = async () => {
    setShowMediaLib(true);
    setLoadingMedia(true);
    try {
      const imgs = await db.getImages();
      setMediaAssets(imgs);
      setFilterCategory("ALL");
    } catch (err) {
      console.error("Failed to load images:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleSelectImage = (url: string) => {
    if (editing) {
      setEditing({ ...editing, image: url });
      setShowMediaLib(false);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Product Categories
            </h1>
            <p className="text-slate-500 mt-2">
              Manage your aluminium product categories.
            </p>
          </div>
          <button
            onClick={() =>
              setEditing({
                name: "",
                description: "",
                isActive: true,
                icon: "Activity",
              })
            }
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus className="h-5 w-5 mr-2" /> New Category
          </button>
        </div>

        {loading ? (
          <div className="p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm transition-colors">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
              Loading Categories...
            </p>
          </div>
        ) : sections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sections.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl transition-all"
              >
                <div className="h-40 relative">
                  <img
                    src={s.image}
                    className="w-full h-full object-cover"
                    alt={s.name}
                  />
                  {!s.isActive && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white font-black uppercase tracking-[0.3em] text-[8px] border border-white/20 px-3 py-1.5 rounded-full">
                        Inactive Category
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <LayoutGrid className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {s.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {s.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-8 leading-relaxed font-medium">
                    {s.description ||
                      "No description provided for this category."}
                  </p>

                  <div className="flex justify-between items-center border-t pt-6 border-slate-50 dark:border-slate-800">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditing(s)}
                        className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 rounded-xl transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(s.id)}
                        className={`p-3 rounded-xl transition-colors ${
                          s.isActive
                            ? "bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                            : "bg-blue-600 text-white"
                        }`}
                        title={s.isActive ? "Deactivate" : "Activate"}
                      >
                        {s.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Warning: Delete this category? Products linked to this category may become unassigned."
                          )
                        ) {
                          await db.deleteCategory(s.id);
                          const updated = await db.getCategories();
                          setSections(updated);
                        }
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm transition-colors">
            <Box className="h-16 w-16 text-slate-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              No Records Found
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm font-medium mb-10">
              Your product categories are currently empty. Start by creating
              your first category.
            </p>
            <button
              onClick={() =>
                setEditing({
                  name: "",
                  description: "",
                  isActive: true,
                  icon: "Activity",
                })
              }
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all"
            >
              Create First Category
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in slide-in-from-bottom-8 duration-500 border border-slate-100">
            <div className="p-6 md:p-10 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center transition-colors">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  {editing.id ? "Edit Category" : "New Category"}
                </h2>
                <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mt-1">
                  Category ID: {editing.id || "New"}
                </p>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-2 md:p-3 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto flex-grow custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Category Name
                </label>
                <input
                  required
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="e.g. Aluminium Sheets"
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 text-sm md:text-base"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Cover Image Asset URL
                  </label>
                  <button
                    onClick={handleOpenMediaLib}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ImageIcon className="h-3 w-3 mr-1.5" /> Choose from Library
                  </button>
                </div>
                <input
                  type="url"
                  value={editing.image}
                  onChange={(e) =>
                    setEditing({ ...editing, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-xs text-slate-900"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <textarea
                  required
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="Brief description of this product category..."
                  rows={4}
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm leading-relaxed text-slate-900"
                />
              </div>
            </div>

            <div className="p-6 md:p-10 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 shrink-0 transition-colors">
              <button
                onClick={() => setEditing(null)}
                className="px-6 py-3.5 md:px-8 md:py-4 font-bold text-slate-500 hover:text-slate-900 transition-colors text-sm md:text-base"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-3.5 md:px-12 md:py-4 bg-slate-900 text-white font-black rounded-xl md:rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 uppercase tracking-widest text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaLib && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h3 className="text-lg font-black text-slate-900">
                Media Library
              </h3>
              <button
                onClick={() => setShowMediaLib(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Close Library"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-2">
                Filter by Category:
              </span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer min-w-[200px]"
              >
                <option value="ALL">All Assets</option>
                {sections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/30">
              {loadingMedia ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : mediaAssets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaAssets
                    .filter(
                      (img) =>
                        filterCategory === "ALL" ||
                        img.categoryId === filterCategory
                    )
                    .map((img) => (
                      <button
                        key={img.id}
                        onClick={() => handleSelectImage(img.url)}
                        className="group relative aspect-video bg-white rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                      >
                        <img
                          src={img.url}
                          className="w-full h-full object-cover"
                          alt={img.name}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100">
                          {img.categoryId && (
                            <span className="mb-1 text-[8px] text-white font-black uppercase bg-blue-600/80 backdrop-blur-sm self-start px-2 py-0.5 rounded">
                              {
                                sections.find((c) => c.id === img.categoryId)
                                  ?.name
                              }
                            </span>
                          )}
                          <span className="text-[10px] text-white font-mono bg-black/50 px-2 py-1 rounded truncate w-full text-left">
                            {img.name}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">
                    No media assets found.
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Upload images in the "Media Assets" section first.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const XCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
