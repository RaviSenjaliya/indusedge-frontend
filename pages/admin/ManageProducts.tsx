import React, { useState, useEffect } from "react";
import { db } from "../../services/db";
import { Product, Category } from "../../types";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ChevronRight,
  Box,
  Search,
} from "lucide-react";
import {
  Button,
  IconButton,
  Badge,
  Card,
  DataTable,
  Input,
  Textarea,
  Select,
  Switch,
  SearchInput,
  FieldLabel,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  PageHeader,
  EmptyState,
  Spinner,
  useToast,
  useConfirm,
} from "../../components/ui";
import type { Column } from "../../components/ui";
import { MediaLibraryModal } from "../../components/admin/MediaLibraryModal";

export const ManageProducts: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();

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

  const openCreate = () => {
    if (cats.length === 0) {
      toast.warning(
        "Create a section first",
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
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
  };

  const handleSave = async () => {
    // Strict Validation
    if (!editing?.name?.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!editing?.categoryId) {
      toast.error("Please assign this product to a category");
      return;
    }
    if (!editing?.shortDescription?.trim()) {
      toast.error("Short Pitch is required", "It appears in the catalog view.");
      return;
    }
    if (!editing?.description?.trim()) {
      toast.error("Full product description is required");
      return;
    }

    const validImages =
      editing.images?.filter((img) => img.trim() !== "") || [];
    if (validImages.length === 0) {
      toast.error("At least one image URL is required");
      return;
    }

    // URL Validation for all provided images
    for (const url of validImages) {
      try {
        new URL(url);
      } catch (_) {
        toast.error("Invalid image URL detected", url);
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
      toast.success("Product saved", `"${newProd.name}" is up to date.`);
    } else {
      toast.error(
        "Failed to synchronize",
        "Could not save to the backend. Check console for details."
      );
    }
    setIsSaving(false);
  };

  const handleDelete = async (p: Product) => {
    const ok = await confirm({
      title: "Delete product?",
      message: `"${p.name}" will be permanently removed from the catalog.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    setDeletingId(p.id);
    try {
      await db.deleteProduct(p.id);
      const updated = await db.getProducts();
      setProducts(updated);
      toast.success("Product deleted", `"${p.name}" was removed.`);
    } catch (err) {
      toast.error("Failed to delete product", "Please try again.");
    }
    setDeletingId(null);
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

  const handleOpenMediaLib = (index: number) => {
    setActiveImageIndex(index);
    setShowMediaLib(true);
  };

  const handleSelectImage = (url: string) => {
    if (editing && activeImageIndex !== null) {
      handleUpdateImage(activeImageIndex, url);
      setShowMediaLib(false);
      setActiveImageIndex(null);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <img
              src={p.images[0]}
              className="h-full w-full object-cover"
              alt=""
            />
          </div>
          <div className="min-w-0">
            <div className="mb-1 max-w-[150px] truncate font-bold leading-tight text-slate-900 md:max-w-[200px] dark:text-white">
              {p.name}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-tighter text-slate-400 dark:text-slate-500">
              ID: {p.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "segment",
      header: "Segment",
      render: (p) => (
        <Badge tone="slate">
          {cats.find((c) => c.id === p.categoryId)?.name || "Unassigned"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (p) => (
        <div className="flex flex-col items-center gap-1">
          {p.isActive ? (
            <Badge tone="green" icon={CheckCircle2}>
              Active
            </Badge>
          ) : (
            <Badge tone="slate" icon={XCircle}>
              Hidden
            </Badge>
          )}
          {p.isFeatured && (
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
              Spotlight
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-2 whitespace-nowrap">
          <IconButton
            icon={Edit2}
            label="Edit product"
            onClick={() => setEditing(p)}
          />
          {deletingId === p.id ? (
            <span className="inline-flex items-center justify-center rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800">
              <Spinner
                size="xs"
                tone="current"
                className="text-red-500 dark:text-red-400"
              />
            </span>
          ) : (
            <IconButton
              icon={Trash2}
              label="Delete product"
              variant="danger"
              onClick={() => handleDelete(p)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-500 pb-12">
      <PageHeader
        title="Product Management"
        subtitle="Add and manage your aluminium products."
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={openCreate}>
            Add Product
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card padding="sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by product name..."
          />
          <Select
            dense
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by segment"
          >
            <option value="ALL">All Segments</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            dense
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="HIDDEN">Hidden Only</option>
          </Select>
        </div>
      </Card>

      <DataTable<Product>
        columns={columns}
        rows={filteredProducts}
        rowKey={(p) => p.id}
        loading={loading}
        empty={
          products.length === 0 ? (
            <EmptyState
              icon={Box}
              title="No Records Found"
              message="Your product database is currently empty. Start by adding your first aluminium product."
              action={
                <Button variant="dark" leftIcon={Plus} onClick={openCreate}>
                  Add Your First Product
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No matching products"
              message="Try adjusting your filters or search terms to find what you're looking for."
              action={
                <Button variant="ghost" onClick={clearFilters}>
                  Clear all filters
                </Button>
              }
            />
          )
        }
      />

      {/* Product Editor */}
      {editing && (
        <Modal
          open
          onClose={() => {
            // Guard against stacked-modal Escape: when the Media Library is
            // open on top, its kit Modal AND this one both listen for Esc.
            // Without this check a single Esc would close the picker and
            // silently discard every unsaved edit in the product form.
            if (!showMediaLib) setEditing(null);
          }}
          size="lg"
          animation="slide"
        >
          <ModalHeader
            title={editing.id ? "Refine Product" : "Create Product"}
            subtitle={editing.id ? `Product ID: ${editing.id}` : "New Record"}
            onClose={() => setEditing(null)}
          />

          <ModalBody className="space-y-5 md:space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <div className="space-y-4">
                <Input
                  label="Product Name"
                  value={editing.name ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="Official Product Name"
                />
                <Select
                  label="Category"
                  value={editing.categoryId ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, categoryId: e.target.value })
                  }
                >
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
                  <Switch
                    checked={!!editing.isActive}
                    onChange={(v) => setEditing({ ...editing, isActive: v })}
                    label="Visibility"
                    tone="green"
                  />
                  <Switch
                    checked={!!editing.isFeatured}
                    onChange={(v) => setEditing({ ...editing, isFeatured: v })}
                    label="Spotlight"
                    tone="indigo"
                  />
                </div>
              </div>

              <Textarea
                label="Short Pitch"
                rows={4}
                value={editing.shortDescription ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, shortDescription: e.target.value })
                }
                placeholder="Brief technical summary (1-2 sentences)"
              />
            </div>

            {/* Full Description */}
            <Textarea
              label="Full Description"
              rows={6}
              value={editing.description ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Provide full product details, material composition, and specifications..."
            />

            {/* Visual Assets */}
            <div className="space-y-4">
              <FieldLabel
                action={
                  <Button size="sm" variant="subtle" onClick={handleAddImage}>
                    Add URL
                  </Button>
                }
              >
                Visual Assets (Image URLs)
              </FieldLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(editing.images || []).map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      dense
                      mono
                      value={img}
                      onChange={(e) => handleUpdateImage(idx, e.target.value)}
                      placeholder="https://..."
                      containerClassName="min-w-0 flex-grow"
                      aria-label={`Image URL ${idx + 1}`}
                    />
                    <IconButton
                      icon={ImageIcon}
                      label="Choose from library"
                      onClick={() => handleOpenMediaLib(idx)}
                    />
                    <IconButton
                      icon={Trash2}
                      label="Remove image URL"
                      variant="danger"
                      onClick={() => handleRemoveImage(idx)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Specs — uncontrolled defaultValue/onBlur inputs on
                purpose: committing on blur avoids remount-induced focus loss
                while a key is being renamed. Do not convert to controlled. */}
            <div className="space-y-4 pb-6">
              <FieldLabel
                action={
                  <Button size="sm" variant="dark" onClick={handleAddSpec}>
                    Add Row
                  </Button>
                }
              >
                Specifications
              </FieldLabel>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                {Object.entries(editing.specs || {}).map(([key, val], idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800"
                  >
                    <input
                      defaultValue={key}
                      onBlur={(e) =>
                        handleUpdateSpec(key, e.target.value, val as string)
                      }
                      placeholder="Attr"
                      className="w-[100px] bg-transparent text-[9px] font-black uppercase tracking-wider text-slate-400 outline-none placeholder:text-slate-300 dark:text-slate-500 dark:placeholder:text-slate-600"
                    />
                    <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600" />
                    <input
                      defaultValue={val as string}
                      onBlur={(e) =>
                        handleUpdateSpec(key, key, e.target.value)
                      }
                      placeholder="Value"
                      className="flex-grow bg-transparent text-[11px] font-bold text-slate-800 outline-none placeholder:text-slate-300 md:text-sm dark:text-slate-200 dark:placeholder:text-slate-600"
                    />
                    <IconButton
                      icon={Trash2}
                      label="Remove specification"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSpec(key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Discard
            </Button>
            <Button variant="dark" loading={isSaving} onClick={handleSave}>
              Save Changes
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Media Library */}
      <MediaLibraryModal
        open={showMediaLib}
        onClose={() => {
          setShowMediaLib(false);
          setActiveImageIndex(null);
        }}
        onSelect={handleSelectImage}
        categories={cats}
      />
    </div>
  );
};
