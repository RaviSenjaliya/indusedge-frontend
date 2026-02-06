import React, { useState, useEffect } from "react";
import { pushService } from "../../services/pushService";
import { db } from "../../services/db";
import {
  Bell,
  Send,
  Trash2,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Zap,
  LayoutGrid,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { ImageAsset, Category } from "../../types";

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  recipients: string;
}

export const ManageNotifications: React.FC = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [iconUrl, setIconUrl] = useState(
    "https://cdn-icons-png.flaticon.com/512/1087/1087080.png"
  );
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [showMediaLib, setShowMediaLib] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<ImageAsset[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [sections, setSections] = useState<Category[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [notifs, cats] = await Promise.all([
        db.getNotifications(),
        db.getCategories(),
      ]);
      setHistory(notifs);
      setSections(cats);
    };
    loadData();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert("Both Headline and Message Content are required.");
      return;
    }

    // URL validation if iconUrl is provided (it has a default, but user might change it)
    if (iconUrl.trim()) {
      try {
        new URL(iconUrl);
      } catch (_) {
        alert("Please provide a valid Asset URL for the notification icon.");
        return;
      }
    }

    setIsSending(true);

    try {
      // Send actual notification via backend
      const result = await db.broadcastNotification(title, body, iconUrl);

      // Also send a local notification for the admin to see the result immediately
      await pushService.sendLocalNotification(title, body, iconUrl);

      const updatedHistory = await db.getNotifications();
      setHistory(updatedHistory);

      setTitle("");
      setBody("");
      // Keep iconUrl as it might be a standard brand icon
    } catch (err) {
      console.error("Broadcast failed:", err);
      alert(
        "Deployment failed. Verify network connectivity and server status."
      );
    } finally {
      setIsSending(false);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    await db.deleteNotification(id);
    const updated = await db.getNotifications();
    setHistory(updated);
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
    setIconUrl(url);
    setShowMediaLib(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Broadcast technical updates and procurement alerts to your global
            network.
          </p>
        </div>
        <div className="bg-white px-6 py-2.5 rounded-full border border-slate-200 shadow-sm flex items-center space-x-3 transition-colors">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            Broadcast Channel: Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Composer Form */}
        <div className="lg:col-span-7 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-10">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
              <Send className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Compose Broadcast
            </h2>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 block">
                Notification Headline
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Technical Stock: Centrifugal Pumps"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 block">
                Message Content
              </label>
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Briefly describe the update or technical alert..."
                rows={4}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-slate-700"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 block">
                  Asset URL (Icon)
                </label>
                <button
                  type="button"
                  onClick={handleOpenMediaLib}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ImageIcon className="h-3 w-3 mr-1.5" /> Choose from Library
                </button>
              </div>
              <input
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-mono text-xs text-slate-500"
              />
            </div>

            <div className="pt-4 flex flex-col items-center gap-6">
              <button
                type="submit"
                disabled={isSending || !title || !body}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 px-10 rounded-2xl flex items-center justify-center space-x-3 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
              >
                {isSending ? (
                  <span className="text-xs uppercase tracking-[0.2em] animate-pulse">
                    Broadcasting to Node...
                  </span>
                ) : (
                  <>
                    <span className="text-xs uppercase tracking-[0.2em]">
                      Deploy Global Broadcast
                    </span>
                    <Globe className="h-4 w-4" />
                  </>
                )}
              </button>
              <div className="flex items-center space-x-2 text-slate-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  W3C Web Push Protocol (ISO-8601)
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Live Preview & Analytics */}
        <div className="lg:col-span-5 space-y-10">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h3 className="text-xl font-black mb-8 relative z-10 uppercase tracking-tight">
              Technical Preview
            </h3>

            {/* Notification Preview Mock */}
            <div className="space-y-6 relative z-10">
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Monitor className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Desktop Simulation
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center space-x-5 backdrop-blur-xl group">
                <div className="shrink-0 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center p-2">
                  <img
                    src={iconUrl}
                    alt="Preview Icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-grow">
                  <h4 className="font-bold text-sm text-white truncate">
                    {title || "Headline Pending..."}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-medium">
                    {body || "Waiting for message content payload..."}
                  </p>
                </div>
                <div className="shrink-0">
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-400 mt-8 mb-2">
                <Smartphone className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Mobile Simulation
                </span>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-5 rounded-3xl flex items-start space-x-4">
                <div className="shrink-0 w-10 h-10 bg-slate-700 rounded-xl p-1.5">
                  <img
                    src={iconUrl}
                    alt="Mobile Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">
                      IndusEdge
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase">
                      Now
                    </span>
                  </div>
                  <h4 className="font-bold text-[11px] text-white">
                    {title || "Pending Title"}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1">
                    {body || "Pending Body"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">
              Recent Activity
            </h3>

            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group p-5 bg-slate-50 hover:bg-slate-100 rounded-3xl border border-slate-100 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <Clock className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 truncate max-w-[150px]">
                          {item.title}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {new Date(item.sentAt).toLocaleDateString()} at{" "}
                          {new Date(item.sentAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <AlertCircle className="h-10 w-10 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  No Broadcast Logs
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
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
