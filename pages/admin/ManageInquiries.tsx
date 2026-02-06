import React, { useState, useEffect } from "react";
import { db } from "../../services/db";
import { Inquiry, InquiryStatus } from "../../types";
import {
  Mail,
  Phone,
  User,
  Building,
  MessageSquare,
  Clock,
  Filter,
  CheckCircle,
  AlertCircle,
  Inbox,
  ChevronLeft,
  Download,
  Trash2,
} from "lucide-react";

export const ManageInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState<InquiryStatus | "ALL">("NEW");

  useEffect(() => {
    db.getInquiries().then((data) => {
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInquiries(sorted);
    });
  }, []);

  const updateStatus = async (id: string, status: InquiryStatus) => {
    await db.updateInquiryStatus(id, status);
    const updated = await db.getInquiries();
    const sorted = [...updated].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setInquiries(sorted);
    if (selected?.id === id) {
      const s = sorted.find((x) => x.id === id);
      if (s) setSelected(s);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this inquiry? This action cannot be undone."
      )
    ) {
      await db.deleteInquiry(id);
      const updated = await db.getInquiries();
      const sorted = [...updated].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInquiries(sorted);
      setSelected(null); // Deselect the inquiry after deletion
    }
  };

  const downloadAsCSV = () => {
    if (filteredInquiries.length === 0) return;

    const headers = [
      "ID",
      "Date",
      "Customer Name",
      "Email",
      "Phone",
      "Company",
      "Product",
      "Status",
      "Message",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredInquiries.map((inq) =>
        [
          inq.id,
          new Date(inq.createdAt).toLocaleString(),
          `"${inq.customerName.replace(/"/g, '""')}"`,
          inq.email,
          `"${inq.phone}"`,
          `"${(inq.company || "N/A").replace(/"/g, '""')}"`,
          `"${(inq.productName || "General").replace(/"/g, '""')}"`,
          inq.status,
          `"${inq.message.replace(/"/g, '""').replace(/\n/g, " ")}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inquiries_${filter.toLowerCase()}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInquiries = inquiries.filter(
    (i) => filter === "ALL" || i.status === filter
  );

  const getStatusStyle = (status: InquiryStatus) => {
    switch (status) {
      case "NEW":
        return "bg-orange-100 text-orange-600 border-orange-200";
      case "CONTACTED":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "CLOSED":
        return "bg-green-100 text-green-600 border-green-200";
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end space-y-4 md:space-y-0 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            Lead Intelligence
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Enterprise requests awaiting technical consultation.
          </p>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto max-w-full no-scrollbar pb-1">
          <div className="flex items-center space-x-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            {(["ALL", "NEW", "CONTACTED", "CLOSED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  if (window.innerWidth < 1024) setSelected(null);
                }}
                className={`px-3 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === f
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={downloadAsCSV}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow overflow-hidden">
        {/* List View - Hidden on mobile if a lead is selected */}
        <div
          className={`lg:col-span-5 xl:col-span-4 space-y-4 overflow-y-auto pr-2 custom-scrollbar ${
            selected ? "hidden lg:block" : "block"
          }`}
        >
          {filteredInquiries.map((inq) => (
            <button
              key={inq.id}
              onClick={() => setSelected(inq)}
              className={`w-full text-left p-5 md:p-6 rounded-3xl transition-all border-2 relative overflow-hidden ${
                selected?.id === inq.id
                  ? "bg-white border-blue-600 shadow-xl shadow-blue-500/5 -translate-y-1"
                  : "bg-white border-transparent hover:border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-3 pr-8">
                <div className="space-y-1">
                  <div className="font-black text-slate-900 text-sm md:text-base">
                    {inq.customerName}
                  </div>
                  <div className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {inq.company || "Private Contractor"}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[8px] font-black border uppercase tracking-tighter ${getStatusStyle(
                    inq.status
                  )}`}
                >
                  {inq.status}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(inq.id);
                }}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Inquiry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="flex items-center text-[9px] md:text-[10px] font-bold text-slate-500 space-x-3">
                <span className="flex items-center whitespace-nowrap">
                  <Clock className="h-3 w-3 mr-1 text-slate-300" />{" "}
                  {new Date(inq.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center truncate">
                  <Inbox className="h-3 w-3 mr-1 text-slate-300" />{" "}
                  {inq.productName || "General"}
                </span>
              </div>
            </button>
          ))}
          {filteredInquiries.length === 0 && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <Inbox className="h-10 w-10 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-medium">
                No leads in this queue.
              </p>
            </div>
          )}
        </div>

        {/* Detail View - Full screen on mobile if a lead is selected */}
        <div
          className={`lg:col-span-7 xl:col-span-8 flex flex-col h-full ${
            !selected ? "hidden lg:flex" : "flex"
          }`}
        >
          {selected ? (
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
              <div className="p-6 md:p-10 bg-slate-900 text-white shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setSelected(null)}
                      className="lg:hidden p-2 bg-white/10 rounded-lg hover:bg-white/20"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black">
                        Lead Diagnostic
                      </h2>
                      <div className="hidden md:flex items-center mt-2 text-slate-400 space-x-3">
                        <span className="text-[10px] font-mono tracking-widest uppercase">
                          TXN ID: {selected.id}
                        </span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {new Date(selected.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-2 md:p-4 rounded-xl md:rounded-2xl flex items-center space-x-2 md:space-x-4">
                    <span className="hidden sm:inline text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-400">
                      Pipeline Status:
                    </span>
                    <select
                      value={selected.status}
                      onChange={(e) =>
                        updateStatus(
                          selected.id,
                          e.target.value as InquiryStatus
                        )
                      }
                      className="bg-slate-800 border border-slate-700 px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 overflow-y-auto flex-grow custom-scrollbar">
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">
                      Contact Information
                    </label>
                    <div className="space-y-4 md:space-y-5">
                      <div className="flex items-center space-x-4 group">
                        <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 group-hover:bg-blue-50 transition-colors">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 font-black uppercase">
                            Decision Maker
                          </div>
                          <div className="font-black text-slate-900 text-sm md:text-base">
                            {selected.customerName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 group">
                        <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 group-hover:bg-blue-50 transition-colors">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 font-black uppercase">
                            Organization
                          </div>
                          <div className="font-black text-slate-900 text-sm md:text-base">
                            {selected.company || "Enterprise Private"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 group">
                        <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 group-hover:bg-blue-50 transition-colors">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] text-slate-400 font-black uppercase">
                            Verified Email
                          </div>
                          <a
                            href={`mailto:${selected.email}`}
                            className="font-black text-slate-900 hover:text-blue-600 transition-colors truncate block text-sm md:text-base"
                          >
                            {selected.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 group">
                        <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 group-hover:bg-blue-50 transition-colors">
                          <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 font-black uppercase">
                            Phone Matrix
                          </div>
                          <a
                            href={`tel:${selected.phone}`}
                            className="font-black text-slate-900 hover:text-blue-600 transition-colors text-sm md:text-base"
                          >
                            {selected.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col h-full">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">
                    Requirement Brief
                  </label>
                  <div className="bg-slate-50 rounded-2xl md:rounded-[2rem] p-6 md:p-8 border border-slate-100 flex-grow relative overflow-hidden min-h-[150px]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 md:opacity-100">
                      <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-slate-200" />
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium italic relative z-10">
                      "{selected.message}"
                    </p>
                  </div>
                  <div className="mt-6 md:mt-8 p-4 md:p-6 bg-blue-50 rounded-xl md:rounded-2xl border border-blue-100 flex justify-between items-center shrink-0">
                    <div className="min-w-0 pr-4">
                      <div className="text-[9px] md:text-[10px] text-blue-400 font-black uppercase">
                        Inquiry Target
                      </div>
                      <div className="text-blue-700 font-black text-xs md:text-sm truncate">
                        {selected.productName || "Normal Inquiry"}
                      </div>
                    </div>
                    <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-400 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-10 border-t border-slate-50 flex justify-between items-center shrink-0">
                <div className="hidden sm:flex items-center space-x-2">
                  <CheckCircle
                    className={`h-5 w-5 ${
                      selected.status === "CLOSED"
                        ? "text-green-500"
                        : "text-slate-200"
                    }`}
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Workflow Verified
                  </span>
                </div>
                <button
                  onClick={() => updateStatus(selected.id, "CLOSED")}
                  disabled={selected.status === "CLOSED"}
                  className="w-full sm:w-auto px-6 md:px-8 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-green-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest"
                >
                  Archive Request
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 ml-2"
                  title="Delete Lead"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-white border border-slate-100 border-dashed rounded-[2.5rem] flex items-center justify-center text-center p-12 md:p-20 shadow-sm transition-colors">
              <div className="max-w-xs">
                <div className="bg-slate-50 w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Mail className="h-8 w-8 md:h-10 md:w-10 text-slate-200" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2">
                  Select a Lead
                </h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  Select an enterprise inquiry from the list to view diagnostic
                  details and technical requirements.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
