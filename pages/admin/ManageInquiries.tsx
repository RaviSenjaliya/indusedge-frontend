import React, { useState, useEffect, useMemo, useRef } from "react";
import { db } from "../../services/db";
import { Inquiry, InquiryStatus } from "../../types";
import * as XLSX from "xlsx";
import {
  Download,
  Trash2,
  Inbox,
  Calendar,
  X,
  Phone,
  Package,
  MapPin,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  IconButton,
  Badge,
  INQUIRY_STATUS_TONE,
  INQUIRY_STATUS_LABEL,
  Card,
  StatCard,
  DataTable,
  Input,
  Select,
  SearchInput,
  Modal,
  PageHeader,
  EmptyState,
  SkeletonStat,
  useToast,
  useConfirm,
} from "../../components/ui";
import type { Column } from "../../components/ui";

export const ManageInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState<InquiryStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "all" | "name" | "product" | "phone"
  >("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

  const toast = useToast();
  const confirm = useConfirm();

  // While the delete confirm dialog is open, both it and the detail Modal
  // listen for Escape at the document level — so Escape (meant to cancel the
  // confirm) would also close the detail modal underneath. This flag lets the
  // detail modal's onClose no-op for the duration of the confirm.
  const confirmOpenRef = useRef(false);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const data = await db.getInquiries();
      setInquiries(data);
    } catch (error) {
      console.error("Failed to load inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: InquiryStatus) => {
    await db.updateInquiryStatus(id, status);
    const updated = await db.getInquiries();
    setInquiries(updated);
    if (selected?.id === id) {
      const s = updated.find((x) => x.id === id);
      if (s) setSelected(s);
    }
    toast.info("Status updated");
  };

  const handleDelete = async (id: string) => {
    confirmOpenRef.current = true;
    let ok: boolean;
    try {
      ok = await confirm({
        title: "Delete this inquiry?",
        message: "This will permanently remove the record. This action cannot be undone.",
        confirmLabel: "Delete",
        tone: "danger",
      });
    } finally {
      confirmOpenRef.current = false;
    }
    if (!ok) return;
    await db.deleteInquiry(id);
    const updated = await db.getInquiries();
    setInquiries(updated);
    if (selected?.id === id) setSelected(null);
    toast.success("Inquiry deleted");
  };

  const downloadAsExcel = () => {
    if (filteredInquiries.length === 0) {
      toast.warning("Nothing to export");
      return;
    }

    const data = filteredInquiries.map((inq) => ({
      Date: new Date(inq.createdAt).toLocaleDateString(),
      "User Name": inq.customerName,
      "Phone Number": inq.phone,
      City: inq.city || "",
      State: inq.state || "",
      "Product Name": inq.productName || "General",
      Description: inq.message,
      Status: inq.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inquiries");

    // Auto-size columns
    const maxWidths = Object.keys(data[0] || {}).map((key) => {
      const len = Math.max(
        key.length,
        ...data.map((row: any) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: len + 2 };
    });
    worksheet["!cols"] = maxWidths;

    XLSX.writeFile(
      workbook,
      `Inquiries_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Export downloaded");
  };

  const filteredInquiries = useMemo(() => {
    let result = inquiries.filter((i) => {
      const matchesFilter = filter === "ALL" || i.status === filter;
      const searchLower = searchQuery.trim().toLowerCase();
      let matchesSearch = true;
      if (searchLower) {
        if (searchType === "name") {
          matchesSearch = i.customerName.toLowerCase().includes(searchLower);
        } else if (searchType === "product") {
          matchesSearch = (i.productName || "General")
            .toLowerCase()
            .includes(searchLower);
        } else if (searchType === "phone") {
          matchesSearch = i.phone.toLowerCase().includes(searchLower);
        } else {
          matchesSearch =
            i.customerName.toLowerCase().includes(searchLower) ||
            (i.productName || "").toLowerCase().includes(searchLower) ||
            i.phone.toLowerCase().includes(searchLower) ||
            (i.city || "").toLowerCase().includes(searchLower) ||
            (i.state || "").toLowerCase().includes(searchLower);
        }
      }

      const matchesDate = !dateFilter || i.createdAt.includes(dateFilter);

      return matchesFilter && matchesSearch && matchesDate;
    });

    result.sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortBy === "oldest")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      if (sortBy === "name")
        return a.customerName.localeCompare(b.customerName);
      return 0;
    });

    return result;
  }, [inquiries, filter, searchQuery, searchType, dateFilter, sortBy]);

  const stats = useMemo(() => {
    return {
      total: inquiries.length,
      new: inquiries.filter((i) => i.status === "NEW").length,
      contacted: inquiries.filter((i) => i.status === "CONTACTED").length,
      closed: inquiries.filter((i) => i.status === "CLOSED").length,
    };
  }, [inquiries]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilter("ALL");
    setDateFilter("");
  };

  const columns: Column<Inquiry>[] = [
    {
      key: "date",
      header: "Date",
      className: "whitespace-nowrap",
      render: (inq) => (
        <div>
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {new Date(inq.createdAt).toLocaleDateString()}
          </div>
          <div className="font-mono text-[9px] text-slate-400 dark:text-slate-500">
            {new Date(inq.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (inq) => (
        <div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {inq.customerName}
          </div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {inq.phone}
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (inq) =>
        inq.city || inq.state ? (
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                {inq.city || "—"}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                {inq.state || ""}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
        ),
    },
    {
      key: "product",
      header: "Product",
      render: (inq) => (
        <Badge tone="slate">{inq.productName || "General"}</Badge>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (inq) => (
        <div
          className="max-w-[200px] cursor-help truncate text-xs text-slate-500 dark:text-slate-400"
          title={inq.message}
        >
          {inq.message}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (inq) => (
        <Badge tone={INQUIRY_STATUS_TONE[inq.status]}>
          {INQUIRY_STATUS_LABEL[inq.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      className: "whitespace-nowrap",
      render: (inq) => (
        <IconButton
          icon={Trash2}
          label="Delete inquiry"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(inq.id);
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-500 pb-12">
      <PageHeader
        title="Inquiry Management"
        subtitle="View and manage customer inquiries and leads."
        actions={
          <Button variant="dark" leftIcon={Download} onClick={downloadAsExcel}>
            Export to Excel
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <StatCard label="Total" value={stats.total} icon={Inbox} tone="slate" />
            <StatCard label="New" value={stats.new} icon={AlertCircle} tone="amber" />
            <StatCard label="Contacted" value={stats.contacted} icon={Clock} tone="blue" />
            <StatCard label="Archived" value={stats.closed} icon={CheckCircle2} tone="green" />
          </>
        )}
      </div>

      <Card padding="sm" className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="flex gap-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search ${searchType === "all" ? "leads" : searchType}...`}
            className="min-w-0 flex-grow"
          />
          <Select
            dense
            value={searchType}
            onChange={(e) =>
              setSearchType(
                e.target.value as "all" | "name" | "product" | "phone"
              )
            }
            containerClassName="w-28 shrink-0"
            aria-label="Search field"
          >
            <option value="all">All</option>
            <option value="name">Name</option>
            <option value="product">Product</option>
            <option value="phone">Phone</option>
          </Select>
        </div>

        <Input
          dense
          type="date"
          icon={Calendar}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          aria-label="Filter by date"
        />

        <Select
          dense
          value={filter}
          onChange={(e) => setFilter(e.target.value as InquiryStatus | "ALL")}
          aria-label="Filter by status"
        >
          <option value="ALL">All Status</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="CLOSED">Archived</option>
        </Select>

        <Select
          dense
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "newest" | "oldest" | "name")
          }
          aria-label="Sort order"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
        </Select>
      </Card>

      <DataTable<Inquiry>
        columns={columns}
        rows={filteredInquiries}
        rowKey={(inq) => inq.id}
        onRowClick={setSelected}
        loading={loading}
        minWidth="900px"
        empty={
          <EmptyState
            icon={Inbox}
            title="No leads found"
            message="Try adjusting your filters or search terms to find what you're looking for."
            action={
              <Button variant="ghost" onClick={clearFilters}>
                Clear all filters
              </Button>
            }
          />
        }
      />

      {/* Detail modal */}
      <Modal
        open={!!selected}
        onClose={() => {
          // Ignore Escape/backdrop-close while the delete confirm is on top,
          // so cancelling the confirm keeps the detail view open.
          if (confirmOpenRef.current) return;
          setSelected(null);
        }}
        size="lg"
        animation="slide"
      >
        {selected && (
          <>
            {/* Flush header (custom, replaces ModalHeader) */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-6 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-base font-black text-white">
                  {selected.customerName[0]}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-black text-slate-900 md:text-lg dark:text-white">
                    {selected.customerName}
                  </h2>
                  <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    ID: {selected.id}
                  </div>
                </div>
              </div>
              <IconButton
                icon={X}
                label="Close"
                variant="ghost"
                size="md"
                onClick={() => setSelected(null)}
              />
            </div>

            <div className="custom-scrollbar flex-grow space-y-5 overflow-y-auto p-5 md:space-y-6 md:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card padding="md">
                  <div className="mb-1 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    <Calendar className="mr-1.5 h-3 w-3" /> Date Recorded
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {new Date(selected.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(selected.createdAt).toLocaleTimeString()}
                  </div>
                </Card>
                <Card padding="md">
                  <div className="mb-1 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    <Phone className="mr-1.5 h-3 w-3" /> Phone
                  </div>
                  <a
                    href={`tel:${selected.phone}`}
                    className="font-black text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {selected.phone}
                  </a>
                </Card>
                <Card padding="md" className="sm:col-span-2">
                  <div className="mb-1 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    <MapPin className="mr-1.5 h-3 w-3" /> Location
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {[selected.city, selected.state]
                      .filter(Boolean)
                      .join(", ") || "Not provided"}
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center px-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <Package className="mr-1.5 h-3 w-3" /> Inquired Product
                </div>
                <div className="rounded-2xl bg-blue-600 p-5 font-black text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-950/40">
                  {selected.productName || "General"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center px-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <MessageSquare className="mr-1.5 h-3 w-3" /> Message
                </div>
                <div className="min-h-[120px] whitespace-pre-line rounded-2xl border border-slate-100 bg-slate-50 p-5 font-medium italic leading-relaxed text-slate-700 md:p-6 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                  "{selected.message}"
                </div>
              </div>
            </div>

            {/* Footer bar */}
            <div className="flex shrink-0 flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6 dark:border-slate-800">
              <Select
                dense
                value={selected.status}
                onChange={(e) =>
                  updateStatus(selected.id, e.target.value as InquiryStatus)
                }
                containerClassName="w-full sm:w-44"
                aria-label="Inquiry status"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CLOSED">Archived</option>
              </Select>
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <IconButton
                  icon={Trash2}
                  label="Delete inquiry"
                  variant="danger"
                  size="lg"
                  onClick={() => handleDelete(selected.id)}
                />
                <Button
                  variant="dark"
                  className="flex-grow sm:flex-grow-0"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
