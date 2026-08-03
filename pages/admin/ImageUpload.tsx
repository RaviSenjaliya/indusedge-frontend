import React, { useState, useEffect, useRef } from "react";
import { db, describeError } from "../../services/db";
import { ImageAsset, Category } from "../../types";
import {
  Upload,
  Copy,
  CheckCircle,
  Image as ImageIcon,
  Eye,
  Trash2,
  Clock,
  X,
  Edit2,
  Save,
  ExternalLink,
} from "lucide-react";
import {
  Button,
  IconButton,
  Card,
  Select,
  Modal,
  ModalBody,
  ModalFooter,
  PageHeader,
  EmptyState,
  useToast,
  useConfirm,
  cn,
} from "../../components/ui";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Static, non-DB categories always available for tagging media assets.
// "Projects" lets admins reserve images for the public Projects/portfolio
// section, alongside the DB-driven product categories.
const STATIC_CATEGORIES: Category[] = [
  {
    id: "projects",
    name: "Projects",
    description: "Images for the Projects / portfolio section",
    image: "",
    icon: "",
    isActive: true,
  },
];

export const ImageUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<ImageAsset | null>(null);
  const [previewImage, setPreviewImage] = useState<ImageAsset | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dropzoneRef = useRef<HTMLDivElement | null>(null);

  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /** Shared validation + staging for both the file input and drag-and-drop. */
  const acceptFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Invalid file", "Only image files can be uploaded.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("File too large", "Maximum file size is 5MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      acceptFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files && e.dataTransfer.files[0];
    if (dropped) {
      acceptFile(dropped);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await db.uploadImage(file, selectedCategory);
      await loadImages();
      // Reset form
      setFile(null);
      setPreview("");
      setSelectedCategory("");
      toast.success("Image uploaded");
    } catch (err: any) {
      const { title, detail } = describeError(err);
      toast.error(title, detail);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete image?",
      message: "Permanently delete this image?",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await db.deleteImage(id);
      setImages((prev) => prev.filter((img) => img.publicId !== id));
      toast.success("Image deleted");
    } catch (err) {
      const { title, detail } = describeError(err);
      toast.error(title, detail);
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
      toast.success("Category updated");
    } catch (err) {
      const { title, detail } = describeError(err);
      toast.error(title, detail);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("URL copied");
  };

  // Static categories first, then the DB-driven product categories.
  const allCategories = [...STATIC_CATEGORIES, ...categories];

  const filteredImages = images.filter(
    (img) => filterCategory === "ALL" || img.categoryId === filterCategory
  );

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-500 pb-12">
      <PageHeader
        title="Media Assets"
        subtitle="Upload and manage images for your product catalog."
      />

      {/* Upload Section */}
      <Card padding="lg">
        <div
          ref={dropzoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "rounded-2xl border-2 border-dashed p-5 text-center transition-colors",
            isDragging
              ? "border-blue-500 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/40"
              : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/10 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center"
          >
            {preview ? (
              <div className="group relative">
                <img
                  src={preview}
                  className="mb-6 h-64 rounded-2xl object-contain shadow-sm"
                  alt="Preview"
                />
                <button
                  type="button"
                  aria-label="Remove selected image"
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(null);
                    setPreview("");
                  }}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
            <span className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
              {file ? file.name : "Click to Select or Drag an Image Here"}
            </span>
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
              Supports PNG, JPG, WEBP • Max 5MB
            </span>
          </label>
        </div>

        {/* Category Selection for Upload */}
        <div className="mx-auto mt-5 max-w-md">
          <Select
            label="Assign Category (Optional)"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- General / Uncategorized --</option>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-5 flex justify-center">
          <Button
            variant="dark"
            size="lg"
            leftIcon={Upload}
            loading={loading}
            disabled={!file}
            onClick={handleUpload}
          >
            Upload to Cloud
          </Button>
        </div>
      </Card>

      {/* Gallery Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl dark:text-white">
              Recent Uploads
            </h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Filter by Category
            </p>
          </div>
          <Select
            dense
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            containerClassName="w-full sm:w-52"
            aria-label="Filter by category"
          >
            <option value="ALL">All Assets</option>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {images.length === 0 ? (
          <EmptyState
            framed
            icon={ImageIcon}
            title="No images uploaded yet"
            message="Uploaded images will appear here."
            action={
              <Button
                variant="subtle"
                leftIcon={Upload}
                onClick={() =>
                  dropzoneRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                }
              >
                Upload an image
              </Button>
            }
          />
        ) : filteredImages.length === 0 ? (
          <EmptyState
            framed
            icon={ImageIcon}
            title="No assets in this category"
            message="Try a different category or clear the filter."
            action={
              <Button variant="subtle" onClick={() => setFilterCategory("ALL")}>
                Show All Assets
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {filteredImages.map((img) => (
              <Card
                key={img.id}
                padding="sm"
                className="group hover:shadow-lg dark:hover:shadow-black/30"
              >
                <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <img
                    src={img.url}
                    className="h-full w-full object-cover"
                    alt={img.name}
                  />
                  {img.categoryId && (
                    <div className="absolute left-2 top-2">
                      <span className="rounded-lg bg-black/60 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                        {allCategories.find((c) => c.id === img.categoryId)
                          ?.name || "Unknown"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconButton
                      icon={Eye}
                      label="View full image"
                      variant="dark"
                      onClick={() => setPreviewImage(img)}
                    />
                    <IconButton
                      icon={Edit2}
                      label="Edit category"
                      variant="primary"
                      onClick={() => setEditingImage(img)}
                    />
                    <IconButton
                      icon={Trash2}
                      label="Delete image"
                      variant="danger"
                      onClick={() => handleDelete(img.publicId)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(img.uploadedAt).toLocaleDateString()}
                    </span>
                    <span className="max-w-[100px] truncate">{img.name}</span>
                  </div>

                  <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 p-1.5 pl-3 dark:border-slate-800 dark:bg-slate-800/60">
                    <code className="mr-2 flex-grow select-all truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {img.url}
                    </code>
                    <button
                      type="button"
                      title="Copy URL"
                      aria-label={copiedId === img.id ? "Copied" : "Copy URL"}
                      onClick={() => copyToClipboard(img.url, img.id)}
                      className={cn(
                        "shrink-0 rounded-lg p-2 transition-all active:scale-95",
                        copiedId === img.id
                          ? "bg-emerald-500 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
                      )}
                    >
                      {copiedId === img.id ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      <Modal
        open={!!editingImage}
        onClose={() => setEditingImage(null)}
        size="sm"
        animation="zoom"
      >
        {editingImage && (
          <>
            <ModalBody className="space-y-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <Edit2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Edit Category
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
                  Assign a new category to this image.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800/60">
                <img
                  src={editingImage.url}
                  alt="Preview"
                  className="h-32 w-full rounded-lg object-contain"
                />
              </div>

              <Select
                label="Select Category"
                value={editingImage.categoryId || ""}
                onChange={(e) =>
                  setEditingImage({
                    ...editingImage,
                    categoryId: e.target.value,
                  })
                }
              >
                <option value="">-- Uncategorized --</option>
                {allCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button variant="subtle" onClick={() => setEditingImage(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                leftIcon={Save}
                onClick={handleUpdateCategory}
              >
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Full Image Preview — shows the asset uncropped (object-contain) */}
      <Modal
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        size="xl"
        animation="zoom"
      >
        {previewImage && (
          <>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-2">
                <Eye className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {previewImage.name}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Original
                </a>
                <IconButton
                  icon={X}
                  label="Close preview"
                  variant="ghost"
                  onClick={() => setPreviewImage(null)}
                />
              </div>
            </div>
            <div className="flex flex-grow items-center justify-center overflow-auto bg-slate-100 p-4 dark:bg-slate-950">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
