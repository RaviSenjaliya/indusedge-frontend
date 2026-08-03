import React, { useState, useEffect } from "react";
import { db, describeError } from "../../services/db";
import { Project, Category } from "../../types";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Briefcase,
  Search,
  MapPin,
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

export const ManageProjects: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [projects, setProjects] = useState<Project[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showMediaLib, setShowMediaLib] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [p, c] = await Promise.all([db.getProjects(), db.getCategories()]);
      setProjects(p);
      setCats(c.filter((cat) => cat.isActive));
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? p.isActive : !p.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const openCreate = () => {
    setEditing({
      title: "",
      category: "",
      location: "",
      year: String(new Date().getFullYear()),
      images: [""],
      description: "",
      isFeatured: false,
      isActive: true,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  const handleSave = async () => {
    if (!editing?.title?.trim()) {
      toast.error("Project title is required");
      return;
    }

    const validImages =
      editing.images?.filter((img) => img.trim() !== "") || [];
    if (validImages.length === 0) {
      toast.error("At least one project image is required");
      return;
    }
    for (const url of validImages) {
      try {
        new URL(url);
      } catch (_) {
        toast.error("Invalid image URL detected", url);
        return;
      }
    }

    if (!editing?.description?.trim()) {
      toast.error("A short description is required");
      return;
    }

    setIsSaving(true);
    const newProj: Project = {
      id: editing.id || "proj_" + Math.random().toString(36).substr(2, 5),
      title: editing.title,
      category: editing.category || "",
      location: editing.location || "",
      year: editing.year || "",
      images: validImages,
      description: editing.description,
      isFeatured: editing.isFeatured ?? false,
      isActive: editing.isActive ?? true,
    };

    try {
      await db.saveProject(newProj);
      const updated = await db.getProjects();
      setProjects(updated);
      setEditing(null);
      toast.success("Project saved", `"${newProj.title}" is up to date.`);
    } catch (err) {
      const { title, detail } = describeError(err);
      toast.error(title, detail);
    }
    setIsSaving(false);
  };

  const handleDelete = async (p: Project) => {
    const ok = await confirm({
      title: "Delete project?",
      message: `"${p.title}" will be permanently removed from the portfolio.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    setDeletingId(p.id);
    try {
      await db.deleteProject(p.id);
      const updated = await db.getProjects();
      setProjects(updated);
      toast.success("Project deleted", `"${p.title}" was removed.`);
    } catch (err) {
      const { title, detail } = describeError(err);
      toast.error(title, detail);
    }
    setDeletingId(null);
  };

  const handleAddImage = () => {
    if (!editing) return;
    setEditing({ ...editing, images: [...(editing.images || []), ""] });
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
    setEditing({ ...editing, images: newImages.length ? newImages : [""] });
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

  const columns: Column<Project>[] = [
    {
      key: "project",
      header: "Project",
      render: (p) => (
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <img
              src={p.images?.[0]}
              className="h-full w-full object-cover"
              alt=""
            />
            {p.images?.length > 1 && (
              <span className="absolute bottom-0 right-0 rounded-tl-md bg-slate-900/80 px-1 text-[8px] font-black text-white">
                +{p.images.length - 1}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="mb-1 max-w-[150px] truncate font-bold leading-tight text-slate-900 md:max-w-[220px] dark:text-white">
              {p.title}
            </div>
            <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-tighter text-slate-400 dark:text-slate-500">
              <MapPin className="h-3 w-3" />
              {p.location || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (p) => <Badge tone="slate">{p.category || "General"}</Badge>,
    },
    {
      key: "year",
      header: "Year",
      align: "center",
      render: (p) => (
        <span className="font-black text-slate-600 dark:text-slate-300">
          {p.year || "—"}
        </span>
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
              Visible
            </Badge>
          ) : (
            <Badge tone="slate" icon={XCircle}>
              Hidden
            </Badge>
          )}
          {p.isActive && p.isFeatured && (
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
            label="Edit project"
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
              label="Delete project"
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
        title="Project Management"
        subtitle="Add and manage the past work shown on your public site."
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={openCreate}>
            Add Project
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card padding="sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title or location..."
          />
          <Select
            dense
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Visible Only</option>
            <option value="HIDDEN">Hidden Only</option>
          </Select>
        </div>
      </Card>

      <DataTable<Project>
        columns={columns}
        rows={filteredProjects}
        rowKey={(p) => p.id}
        loading={loading}
        empty={
          projects.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No Projects Yet"
              message="Your portfolio is currently empty. Add your first completed project to showcase it on the website."
              action={
                <Button variant="dark" leftIcon={Plus} onClick={openCreate}>
                  Add Your First Project
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No matching projects"
              message="Try adjusting your search or filters."
              action={
                <Button variant="ghost" onClick={clearFilters}>
                  Clear all filters
                </Button>
              }
            />
          )
        }
      />

      {/* Project Editor */}
      {editing && (
        <Modal
          open
          onClose={() => {
            if (!showMediaLib) setEditing(null);
          }}
          size="lg"
          animation="slide"
        >
          <ModalHeader
            title={editing.id ? "Refine Project" : "Create Project"}
            subtitle={editing.id ? `Project ID: ${editing.id}` : "New Record"}
            onClose={() => setEditing(null)}
          />

          <ModalBody className="space-y-5 md:space-y-6">
            <Input
              label="Project Title"
              value={editing.title ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
              placeholder="e.g. Industrial Warehouse Cladding"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              <Select
                label="Category"
                value={editing.category ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
              >
                <option value="">-- Select Category --</option>
                {/* Preserve a legacy/custom value not in the current sections */}
                {editing.category &&
                  !cats.some((c) => c.name === editing.category) && (
                    <option value={editing.category}>{editing.category}</option>
                  )}
                {cats.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Location"
                value={editing.location ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, location: e.target.value })
                }
                placeholder="e.g. Vadodara, Gujarat"
              />
              <Input
                label="Year"
                value={editing.year ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, year: e.target.value })
                }
                placeholder="e.g. 2025"
              />
            </div>

            {/* Project Images — the first image is used as the cover on the
                public website; the rest are stored for future galleries. */}
            <div className="space-y-4">
              <FieldLabel
                action={
                  <Button size="sm" variant="subtle" onClick={handleAddImage}>
                    Add Image
                  </Button>
                }
              >
                Project Images{" "}
                <span className="font-medium normal-case tracking-normal text-slate-400">
                  (first image is shown on the website)
                </span>
              </FieldLabel>
              <div className="space-y-4">
                {(editing.images || []).map((img, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                      {img ? (
                        <img
                          src={img}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                      {idx === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-blue-600 py-0.5 text-center text-[7px] font-black uppercase tracking-wider text-white">
                          Cover
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-grow items-center gap-2">
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
                        label="Remove image"
                        variant="danger"
                        onClick={() => handleRemoveImage(idx)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Textarea
              label="Description"
              rows={4}
              value={editing.description ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Describe the work delivered for this project..."
            />

            <div className="space-y-2 pt-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <Switch
                  checked={!!editing.isActive}
                  onChange={(v) => setEditing({ ...editing, isActive: v })}
                  label="Show on public website"
                  tone="green"
                />
                <Switch
                  checked={!!editing.isActive && !!editing.isFeatured}
                  onChange={(v) => setEditing({ ...editing, isFeatured: v })}
                  label="Spotlight on home page"
                  tone="indigo"
                  disabled={!editing.isActive}
                />
              </div>
              {!editing.isActive && (
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Spotlight requires the project to be shown on the public
                  website first.
                </p>
              )}
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
      />
    </div>
  );
};
