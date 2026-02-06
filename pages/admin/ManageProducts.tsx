import React, { useState, useEffect } from "react";
import { db } from "../../services/db";
import { Product, Category, ImageAsset } from "../../types";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ListPlus,
  Trash,
  ChevronRight,
  AlertCircle,
  Box,
  LayoutGrid,
  X,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

export const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Media Library State
  const [showMediaLib, setShowMediaLib] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<ImageAsset[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [p, c] = await Promise.all([db.getProducts(), db.getCategories()]);
      setProducts(p);
      setCats(c);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter Logic
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "ALL" || p.categoryId === categoryFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? p.isActive : !p.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  // Ensure category is selected if missing OR invalid (e.g. category deleted)
  useEffect(() => {
    if (editing && cats.length > 0) {
      const isValid = cats.find((c) => c.id === editing.categoryId);
      if (!editing.categoryId || !isValid) {
        setEditing({ ...editing, categoryId: cats[0].id });
      }
    }
  }, [editing, cats]);

  const handleSave = async () => {
    // Strict Validation
    if (!editing?.name?.trim()) {
      alert("Product Identity (Name) is required.");
      return;
    }
    if (!editing?.categoryId) {
      alert("Please assign this product to a category.");
      return;
    }
    if (!editing?.shortDescription?.trim()) {
      alert("Short Pitch is required for the catalog view.");
      return;
    }
    if (!editing?.description?.trim()) {
      alert("Full product description is required.");
      return;
    }

    const validImages =
      editing.images?.filter((img) => img.trim() !== "") || [];
    if (validImages.length === 0) {
      alert("At least one Visual Asset (Image URL) is required.");
      return;
    }

    // URL Validation for all provided images
    for (const url of validImages) {
      try {
        new URL(url);
      } catch (_) {
        alert(`Invalid image URL detected: ${url}`);
        return;
      }
    }

    setIsSaving(true);
    const newProd: Product = {
      id: editing.id || "p_" + Math.random().toString(36).substr(2, 5),
      name: editing.name,
      categoryId: editing.categoryId,
      description: editing.description,
      shortDescription: editing.shortDescription,
      images: validImages,
      specs: editing.specs || { Model: "Standard" },
      isFeatured: editing.isFeatured || false,
      isActive: editing.isActive ?? true,
    };

    const result = await db.saveProduct(newProd);
    if (result) {
      const updated = await db.getProducts();
      setProducts(updated);
      setEditing(null);
    } else {
      alert("Failed to synchronize with backend. Check console for details.");
    }
    setIsSaving(false);
  };

  const handleAddSpec = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      specs: { ...editing.specs, "": "" },
    });
  };

  const handleUpdateSpec = (oldKey: string, newKey: string, value: string) => {
    if (!editing || !editing.specs) return;
    const newSpecs = { ...editing.specs };
    if (oldKey !== newKey) {
      delete newSpecs[oldKey];
    }
    newSpecs[newKey] = value;
    setEditing({ ...editing, specs: newSpecs });
  };

  const handleAddImage = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      images: [...(editing.images || []), ""],
    });
  };

  const handleUpdateImage = (index: number, val: string) => {
    if (!editing || !editing.images) return;
    const newImages = [...editing.images];
    newImages[index] = val;
    setEditing({ ...editing, images: newImages });
  };

  const handleRemoveImage = (index: number) => {
    if (!editing || !editing.images) return;
    const newImages = [...editing.images];
    newImages.splice(index, 1);
    setEditing({ ...editing, images: newImages });
  };

  const handleRemoveSpec = (key: string) => {
    if (!editing || !editing.specs) return;
    const newSpecs = { ...editing.specs };
    delete newSpecs[key];
    setEditing({ ...editing, specs: newSpecs });
  };

  const handleOpenMediaLib = async (index: number) => {
    setActiveImageIndex(index);
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
    if (editing && activeImageIndex !== null) {
      handleUpdateImage(activeImageIndex, url);
      setShowMediaLib(false);
      setActiveImageIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
            Loading Products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              Product Management
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Add and manage your aluminium products.
            </p>
          </div>
          <button
            onClick={() => {
              if (cats.length === 0) {
                alert(
                  "You must create at least one category (Section) before adding products."
                );
                return;
              }
              setEditing({
                name: "",
                categoryId: cats[0]?.id,
                isActive: true,
                specs: { Model: "Standard" },
                images: [""],
              });
            }}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl md:rounded-2xl font-bold flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Product
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Segments</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="HIDDEN">Hidden Only</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col transition-colors">
          {products.length > 0 ? (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Product Designation
                    </th>
                    <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Segment
                    </th>
                    <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">
                      Status
                    </th>
                    <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 md:px-8 py-5">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                            <img
                              src={p.images[0]}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 leading-tight mb-1 truncate max-w-[150px] md:max-w-[200px]">
                              {p.name}
                            </div>
                            <div className="text-[8px] md:text-[9px] text-slate-400 font-mono tracking-tighter uppercase">
                              ID: {p.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 md:px-3 md:py-1 rounded-lg whitespace-nowrap">
                          {cats.find((c) => c.id === p.categoryId)?.name ||
                            "Unassigned"}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          {p.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[8px] md:text-[9px] font-black">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[8px] md:text-[9px] font-black">
                              <XCircle className="h-3 w-3 mr-1" /> HIDDEN
                            </span>
                          )}
                          {p.isFeatured && (
                            <span className="text-[7px] md:text-[8px] font-black text-indigo-500 uppercase tracking-tighter">
                              SPOTLIGHT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-1.5 md:space-x-2">
                          <button
                            onClick={() => setEditing(p)}
                            className="p-2 md:p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg md:rounded-xl transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "Delete this product from catalog?"
                                )
                              ) {
                                setDeletingId(p.id);
                                try {
                                  // Artificial delay for better UX
                                  await new Promise((resolve) =>
                                    setTimeout(resolve, 800)
                                  );
                                  await db.deleteProduct(p.id);
                                  const updated = await db.getProducts();
                                  setProducts(updated);
                                } catch (err) {
                                  alert("Failed to delete product.");
                                }
                                setDeletingId(null);
                              }
                            }}
                            disabled={deletingId === p.id}
                            className="p-2 md:p-2.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg md:rounded-xl transition-colors disabled:opacity-50"
                          >
                            {deletingId === p.id ? (
                              <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center p-12 md:p-20 text-center">
              <div className="max-w-md">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Box className="h-8 w-8 md:h-10 md:w-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  {products.length === 0
                    ? "No Records Found"
                    : "No Matching Products"}
                </h3>
                <p className="text-slate-400 text-sm font-medium mb-8">
                  {products.length === 0
                    ? "Your product database is currently empty. Start by adding your first aluminium product."
                    : "Try adjusting your filters or search terms to find what you're looking for."}
                </p>
                {products.length === 0 && (
                  <button
                    onClick={() =>
                      setEditing({
                        name: "",
                        categoryId: cats[0]?.id,
                        isActive: true,
                        specs: { Model: "Standard" },
                        images: [""],
                      })
                    }
                    className="inline-flex items-center bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Product
                  </button>
                )}
                {products.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("ALL");
                      setStatusFilter("ALL");
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] lg:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 duration-500 border border-slate-100">
            <div className="p-6 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 transition-colors">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  {editing.id ? "Refine Product" : "Create Product"}
                </h2>
                <p className="text-slate-400 text-[10px] md:text-xs mt-1">
                  Product ID: {editing.name || "NEW_RECORD"}
                </p>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-2 md:p-3 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 md:p-10 overflow-y-auto flex-grow space-y-8 md:space-y-10 custom-scrollbar">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                    Product Name
                  </label>
                  <input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    placeholder="Official Product Name"
                    className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 text-sm md:text-base"
                  />
                  <select
                    value={editing.categoryId}
                    onChange={(e) =>
                      setEditing({ ...editing, categoryId: e.target.value })
                    }
                    className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700 text-sm md:text-base"
                  >
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0 pt-2">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div
                        className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-all ${
                          editing.isActive ? "bg-green-500" : "bg-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editing.isActive}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              isActive: e.target.checked,
                            })
                          }
                          className="hidden"
                        />
                        <div
                          className={`absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                            editing.isActive
                              ? "right-0.5 md:right-1"
                              : "left-0.5 md:left-1"
                          }`}
                        ></div>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-slate-600 group-hover:text-slate-900">
                        Visibility
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div
                        className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-all ${
                          editing.isFeatured ? "bg-indigo-500" : "bg-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editing.isFeatured}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              isFeatured: e.target.checked,
                            })
                          }
                          className="hidden"
                        />
                        <div
                          className={`absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                            editing.isFeatured
                              ? "right-0.5 md:right-1"
                              : "left-0.5 md:left-1"
                          }`}
                        ></div>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-slate-600 group-hover:text-slate-900">
                        Spotlight
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                    Short Pitch
                  </label>
                  <textarea
                    value={editing.shortDescription}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="Brief technical summary (1-2 sentences)"
                    rows={4}
                    className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm leading-relaxed text-slate-900"
                  />
                </div>
              </div>

              {/* Descriptions & Specs */}
              <div className="space-y-4">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                  Full Description
                </label>
                <textarea
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="Provide full product details, material composition, and specifications..."
                  rows={6}
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm leading-relaxed text-slate-900"
                />
              </div>

              {/* Multi-Image Handling */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center">
                    <ImageIcon className="h-3 w-3 mr-2 text-blue-500" /> Visual
                    Assets (Image URLs)
                  </label>
                  <button
                    onClick={handleAddImage}
                    className="w-fit text-[8px] md:text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"
                  >
                    Add URL
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(editing.images || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl md:rounded-2xl border border-slate-100 transition-colors"
                    >
                      <input
                        value={img}
                        onChange={(e) => handleUpdateImage(idx, e.target.value)}
                        placeholder="https://..."
                        className="flex-grow bg-transparent text-[10px] md:text-xs font-mono outline-none text-slate-900"
                      />
                      <button
                        onClick={() => handleOpenMediaLib(idx)}
                        className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-400 rounded-lg transition-colors"
                        title="Choose from Library"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="text-red-400 hover:text-red-600 shrink-0"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Specs */}
              <div className="space-y-6 pb-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center">
                    <ListPlus className="h-3 w-3 mr-2 text-blue-500" />{" "}
                    Specifications
                  </label>
                  <button
                    onClick={handleAddSpec}
                    className="w-fit text-[8px] md:text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all uppercase tracking-widest"
                  >
                    Add Row
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {Object.entries(editing.specs || {}).map(
                    ([key, val], idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 border-b border-slate-50 pb-4"
                      >
                        <input
                          defaultValue={key}
                          onBlur={(e) =>
                            handleUpdateSpec(key, e.target.value, val as string)
                          }
                          placeholder="Attr"
                          className="w-[100px] text-[9px] font-black uppercase text-slate-400 tracking-wider outline-none bg-transparent"
                        />
                        <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
                        <input
                          defaultValue={val as string}
                          onBlur={(e) =>
                            handleUpdateSpec(key, key, e.target.value)
                          }
                          placeholder="Value"
                          className="flex-grow text-[11px] md:text-sm font-bold text-slate-800 outline-none bg-transparent"
                        />
                        <button
                          onClick={() => handleRemoveSpec(key)}
                          className="text-slate-300 hover:text-red-400 shrink-0"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  )}
                </div>
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
                disabled={isSaving}
                onClick={handleSave}
                className="px-8 py-3.5 md:px-12 md:py-4 bg-slate-900 text-white font-black rounded-xl md:rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 text-xs md:text-sm uppercase tracking-widest"
              >
                {isSaving ? "Saving..." : "Save Changes"}
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
                {cats.map((c) => (
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
                              {cats.find((c) => c.id === img.categoryId)?.name}
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
