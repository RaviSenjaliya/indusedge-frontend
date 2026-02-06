import React, { useState, useEffect } from "react";
import { db } from "../../services/db";
import { ImageAsset, Category } from "../../types";
import {
  Upload,
  Copy,
  CheckCircle,
  Image as ImageIcon,
  AlertCircle,
  Trash2,
  Clock,
  X,
  Edit2,
  Save,
} from "lucide-react";

export const ImageUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<ImageAsset | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const [imgs, cats] = await Promise.all([
        db.getImages(),
        db.getCategories(),
      ]);
      setImages(imgs);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load data");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      await db.uploadImage(file, selectedCategory);
      await loadImages();
      // Reset form
      setFile(null);
      setPreview("");
      setSelectedCategory("");
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this image?")) return;
    try {
      await db.deleteImage(id);
      setImages(images.filter((img) => img.publicId !== id));
    } catch (err) {
      alert("Failed to delete image.");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingImage) return;
    try {
      await db.updateImageCategory(
        editingImage.publicId,
        editingImage.categoryId || ""
      );
      await loadImages();
      setEditingImage(null);
    } catch (err) {
      alert("Failed to update category.");
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <div className="text-center px-4">
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">
          Media Assets
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">
          Upload and manage images for your product catalog.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/10 active:border-blue-600">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  className="h-64 object-contain rounded-2xl shadow-sm mb-6"
                  alt="Preview"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(null);
                    setPreview("");
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
            <span className="text-xl font-bold text-slate-900 mb-2">
              {file ? file.name : "Click to Select Image"}
            </span>
            <span className="text-slate-400 text-sm font-medium">
              Supports PNG, JPG, WEBP • Max 5MB
            </span>
          </label>
        </div>

        {/* Category Selection for Upload */}
        <div className="mt-8 max-w-md mx-auto">
          <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2 text-center">
            Assign Category (Optional)
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm text-center"
          >
            <option value="">-- General / Uncategorized --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center font-bold text-sm">
            <AlertCircle className="h-5 w-5 mr-3" />
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-3" />
                Upload to Cloud
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-100 pb-6 gap-6">
          <div className="px-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Recent Uploads
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Filter by Category
            </p>
          </div>
          <div className="flex items-center w-full sm:w-auto px-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-48 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="ALL">All Assets</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No images uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images
              .filter(
                (img) =>
                  filterCategory === "ALL" || img.categoryId === filterCategory
              )
              .map((img) => (
                <div
                  key={img.id}
                  className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="aspect-video bg-slate-50 rounded-2xl mb-4 overflow-hidden relative">
                    <img
                      src={img.url}
                      className="w-full h-full object-cover"
                      alt={img.name}
                    />
                    {img.categoryId && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                          {categories.find((c) => c.id === img.categoryId)
                            ?.name || "Unknown"}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                      <button
                        onClick={() => window.open(img.url, "_blank")}
                        className="p-2 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-xl backdrop-blur-sm transition-colors"
                        title="View Full Size"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingImage(img)}
                        className="p-2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-xl backdrop-blur-sm transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(img.publicId)}
                        className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-xl backdrop-blur-sm transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(img.uploadedAt).toLocaleDateString()}
                      </span>
                      <span className="truncate max-w-[100px]">{img.name}</span>
                    </div>

                    <div className="flex items-center bg-slate-50 p-1.5 pl-3 rounded-xl border border-slate-100">
                      <code className="flex-grow text-[10px] font-mono text-slate-500 truncate mr-2 select-all">
                        {img.url}
                      </code>
                      <button
                        onClick={() => copyToClipboard(img.url, img.id)}
                        className={`p-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${
                          copiedId === img.id
                            ? "bg-green-500 text-white"
                            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {copiedId === img.id ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Edit2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Edit Category
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Assign a new category to this image.
              </p>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl mb-4">
              <img
                src={editingImage.url}
                alt="Preview"
                className="w-full h-32 object-contain rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                Select Category
              </label>
              <select
                value={editingImage.categoryId || ""}
                onChange={(e) =>
                  setEditingImage({
                    ...editingImage,
                    categoryId: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              >
                <option value="">-- Uncategorized --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setEditingImage(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
