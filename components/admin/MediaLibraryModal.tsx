import React, { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { db } from "../../services/db";
import { ImageAsset, Category } from "../../types";
import {
  Modal,
  ModalHeader,
  Select,
  Skeleton,
  EmptyState,
} from "../ui";

export interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen asset URL. */
  onSelect: (url: string) => void;
  /** Pass categories if the caller already has them; otherwise they're fetched. */
  categories?: Category[];
}

/**
 * Shared media picker used by Sections and Products.
 * Fetches assets on open, filters by category, returns the URL via onSelect.
 */
export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  open,
  onClose,
  onSelect,
  categories,
}) => {
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [cats, setCats] = useState<Category[]>(categories ?? []);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setFilter("ALL");
    const load = async () => {
      try {
        const [imgs, fetchedCats] = await Promise.all([
          db.getImages(),
          categories ? Promise.resolve(categories) : db.getCategories(),
        ]);
        if (cancelled) return;
        setAssets(imgs);
        setCats(fetchedCats);
      } catch (err) {
        console.error("Failed to load media assets:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, categories]);

  const visible = assets.filter(
    (img) => filter === "ALL" || img.categoryId === filter
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      animation="zoom"
      panelClassName="h-[80vh]"
    >
      <ModalHeader title="Media Library" subtitle="Select an asset" onClose={onClose} />

      {/* Filter bar */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-3 md:px-6 dark:border-slate-800">
        <span className="hidden text-[10px] font-black uppercase tracking-widest text-slate-400 sm:block dark:text-slate-500">
          Filter by category
        </span>
        <Select
          dense
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          containerClassName="w-full sm:w-56"
          aria-label="Filter media by category"
        >
          <option value="ALL">All Assets</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="custom-scrollbar flex-grow overflow-y-auto p-5 md:p-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-xl" />
            ))}
          </div>
        ) : visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {visible.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => onSelect(img.url)}
                className="group relative aspect-video overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm transition-all hover:border-blue-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-800"
              >
                <img
                  src={img.url}
                  className="h-full w-full object-cover"
                  alt={img.name}
                  loading="lazy"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                  {img.categoryId && (
                    <span className="mb-1 self-start rounded bg-blue-600/80 px-2 py-0.5 text-[8px] font-black uppercase text-white backdrop-blur-sm">
                      {cats.find((c) => c.id === img.categoryId)?.name}
                    </span>
                  )}
                  <span className="w-full truncate rounded bg-black/50 px-2 py-1 text-left font-mono text-[10px] text-white">
                    {img.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ImageIcon}
            title="No media assets"
            message='Upload images in the "Media Assets" section first, then pick them here.'
            className="py-12"
          />
        )}
      </div>
    </Modal>
  );
};
