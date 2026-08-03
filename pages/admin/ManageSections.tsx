import React, { useState, useEffect } from "react";
import { db, describeError } from "../../services/db";
import { Category, Product } from "../../types";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Box,
  CheckCircle2,
  XCircle,
  Search,
  Image as ImageIcon,
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
  SearchInput,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  PageHeader,
  EmptyState,
  useToast,
  useConfirm,
} from "../../components/ui";
import type { Column } from "../../components/ui";
import { MediaLibraryModal } from "../../components/admin/MediaLibraryModal";

export const ManageSections: React.FC = () => {
  const [sections, setSections] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMediaLib, setShowMediaLib] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const toast = useToast();
  const confirm = useConfirm();

  const filteredSections = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sections.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? s.isActive : !s.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [sections, searchQuery, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          db.getCategories(),
          db.getProducts(),
        ]);
        setSections(cats);
        setProducts(prods);
      } catch (err) {
        console.error("Failed to fetch sections:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, []);

  const startNewCategory = () =>
    setEditing({
      name: "",
      description: "",
      isActive: true,
      icon: "Activity",
    });

  const handleSave = async () => {
    if (!editing?.name || !editing?.image || !editing?.description) {
      toast.error(
        "Missing fields",
        "All fields are required for product categories."
      );
      return;
    }

    // Basic URL validation
    try {
      new URL(editing.image || "");
    } catch (_) {
      toast.error("Invalid URL", "Please provide a valid asset URL.");
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

    try {
      await db.saveCategory(newSec);
      const updated = await db.getCategories();
      setSections(updated);
      setEditing(null);
      toast.success("Category saved");
    } catch (err) {
      const { title, detail } = describeError(err);
      toast.error(title, detail);
    }
  };

  const toggleStatus = async (id: string) => {
    const s = sections.find((x) => x.id === id);
    if (!s) return;
    try {
      await db.saveCategory({ ...s, isActive: !s.isActive });
      const updated = await db.getCategories();
      setSections(updated);
      toast.info(s.isActive ? "Category hidden" : "Category activated");
    } catch (err) {
      const { title, detail } = describeError(err);
      toast.error(title, detail);
    }
  };

  /**
   * Close the category editor — unless the nested media picker is open.
   * Both kit Modals register their own document-level Escape listeners, so
   * without this guard a single Escape press while the picker is open would
   * also dismiss the editor and silently discard in-progress edits. With it,
   * Escape closes only the picker; a second Escape closes the editor.
   */
  const closeEditor = () => {
    if (showMediaLib) return;
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    // Guard: a category with associated products cannot be deleted.
    const linked = products.filter((p) => p.categoryId === id);
    if (linked.length > 0) {
      const section = sections.find((s) => s.id === id);
      toast.error(
        "Cannot delete this category",
        `${linked.length} product${
          linked.length > 1 ? "s are" : " is"
        } still linked to "${
          section?.name || id
        }". Reassign or delete those products first.`
      );
      return;
    }

    const ok = await confirm({
      tone: "danger",
      title: "Delete this category?",
      message: "This category has no products linked and will be removed.",
    });
    if (!ok) return;
    try {
      await db.deleteCategory(id);
      const [updatedCats, updatedProds] = await Promise.all([
        db.getCategories(),
        db.getProducts(),
      ]);
      setSections(updatedCats);
      setProducts(updatedProds);
      toast.success("Category deleted");
    } catch (err) {
      const { title, detail } = describeError(err);
      toast.error(title, detail);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: "category",
      header: "Category",
      render: (s) => (
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <img src={s.image} className="h-full w-full object-cover" alt="" />
          </div>
          <div className="min-w-0">
            <div className="mb-1 max-w-[160px] truncate font-bold leading-tight text-slate-900 md:max-w-[220px] dark:text-white">
              {s.name}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-tighter text-slate-400 dark:text-slate-500">
              ID: {s.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "hidden md:table-cell",
      render: (s) => (
        <p className="max-w-xs truncate text-xs font-medium text-slate-500 dark:text-slate-400">
          {s.description || "No description provided."}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (s) =>
        s.isActive ? (
          <Badge tone="green" icon={CheckCircle2}>
            Active
          </Badge>
        ) : (
          <Badge tone="slate" icon={XCircle}>
            Hidden
          </Badge>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => (
        <div className="flex justify-end gap-2 whitespace-nowrap">
          <IconButton
            icon={Edit2}
            label="Edit category"
            onClick={() => setEditing(s)}
          />
          <IconButton
            icon={s.isActive ? EyeOff : Eye}
            label={s.isActive ? "Hide category" : "Activate category"}
            variant={s.isActive ? "default" : "primary"}
            onClick={() => toggleStatus(s.id)}
          />
          <IconButton
            icon={Trash2}
            label="Delete category"
            variant="danger"
            onClick={() => handleDelete(s.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-500 pb-12">
      <PageHeader
        title="Product Categories"
        subtitle="Manage your aluminium product categories."
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={startNewCategory}>
            New Category
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card padding="sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or description..."
            className="md:col-span-2"
          />
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

      <DataTable<Category>
        columns={columns}
        rows={filteredSections}
        rowKey={(s) => s.id}
        loading={loading}
        empty={
          sections.length === 0 ? (
            <EmptyState
              icon={Box}
              title="No categories yet"
              message="Your product categories are currently empty. Start by creating your first category."
              action={
                <Button variant="dark" leftIcon={Plus} onClick={startNewCategory}>
                  Create First Category
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No matching categories"
              message="Try adjusting your search or status filter to find what you're looking for."
              action={
                <Button variant="ghost" onClick={clearFilters}>
                  Clear all filters
                </Button>
              }
            />
          )
        }
      />

      {editing && (
        <Modal open onClose={closeEditor} size="md" animation="slide">
          <ModalHeader
            title={editing.id ? "Edit Category" : "New Category"}
            subtitle={`ID: ${editing.id || "New"}`}
            onClose={closeEditor}
          />
          <ModalBody className="space-y-4 md:space-y-5">
            <Input
              label="Category Name"
              required
              value={editing.name ?? ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="e.g. Aluminium Sheets"
            />
            <Input
              label="Cover Image URL"
              mono
              type="url"
              value={editing.image ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, image: e.target.value })
              }
              placeholder="https://images.unsplash.com/..."
              labelAction={
                <button
                  type="button"
                  onClick={() => setShowMediaLib(true)}
                  className="flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  <ImageIcon className="mr-1.5 h-3 w-3" /> Choose from Library
                </button>
              }
            />
            <Textarea
              label="Description"
              rows={4}
              required
              value={editing.description ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Brief description of this product category..."
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeEditor}>
              Discard
            </Button>
            <Button variant="dark" onClick={handleSave}>
              Save Changes
            </Button>
          </ModalFooter>
        </Modal>
      )}

      <MediaLibraryModal
        open={showMediaLib}
        onClose={() => setShowMediaLib(false)}
        categories={sections}
        onSelect={(url) => {
          setEditing((prev) => (prev ? { ...prev, image: url } : prev));
          setShowMediaLib(false);
        }}
      />
    </div>
  );
};
