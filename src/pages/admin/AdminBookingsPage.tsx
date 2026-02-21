import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Edit2, Trash2, Save, X, Search } from "lucide-react";
import { generateInvoice, CompanyInfo, InvoicePayment } from "@/lib/invoiceGenerator";

const inputClass = "w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const STATUSES = ["pending", "confirmed", "visa_processing", "ticket_issued", "completed", "cancelled"];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchBookings = () =>
    supabase.from("bookings").select("*, packages(name, type, duration_days), profiles(full_name, phone, passport_number, address)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setBookings(data || []));

  useEffect(() => { fetchBookings(); }, []);

  const startEdit = (b: any) => {
    setEditingId(b.id);
    setEditForm({ status: b.status, total_amount: b.total_amount, notes: b.notes || "", num_travelers: b.num_travelers });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("bookings").update({
      status: editForm.status,
      total_amount: parseFloat(editForm.total_amount),
      notes: editForm.notes || null,
      num_travelers: parseInt(editForm.num_travelers),
    }).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking updated");
    setEditingId(null);
    fetchBookings();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("bookings").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking deleted");
    setDeleteId(null);
    fetchBookings();
  };

  const handleDownloadInvoice = async (b: any) => {
    setGeneratingId(b.id);
    try {
      const { data: payments } = await supabase.from("payments").select("*").eq("booking_id", b.id).order("installment_number", { ascending: true });
      const { data: cms } = await supabase.from("site_content" as any).select("content").eq("section_key", "contact").maybeSingle();
      const cmsContent = (cms as any)?.content || {};
      const company: CompanyInfo = { name: "RAHE KABA", phone: cmsContent.phone || "", email: cmsContent.email || "", address: cmsContent.location || "" };
      await generateInvoice({ ...b, packages: b.packages }, b.profiles || {}, (payments || []) as InvoicePayment[], company);
      toast.success("Invoice downloaded");
    } catch { toast.error("Failed to generate invoice"); }
    setGeneratingId(null);
  };

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (b.tracking_id?.toLowerCase().includes(q) || b.profiles?.full_name?.toLowerCase().includes(q) || b.packages?.name?.toLowerCase().includes(q) || b.status?.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-heading text-xl font-bold">All Bookings</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className={inputClass + " pl-9"} placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.map((b: any) => (
        <div key={b.id} className="bg-card border border-border rounded-lg p-4">
          {editingId === b.id ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-mono font-bold text-primary text-sm">{b.tracking_id}</p>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md flex items-center gap-1"><Save className="h-3 w-3" /> Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs bg-secondary text-foreground px-3 py-1.5 rounded-md flex items-center gap-1"><X className="h-3 w-3" /> Cancel</button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Status</label>
                  <select className={inputClass} value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Total Amount</label>
                  <input className={inputClass} type="number" value={editForm.total_amount} onChange={(e) => setEditForm({ ...editForm, total_amount: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Travelers</label>
                  <input className={inputClass} type="number" value={editForm.num_travelers} onChange={(e) => setEditForm({ ...editForm, num_travelers: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Notes</label>
                  <input className={inputClass} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-mono font-bold text-primary text-sm">{b.tracking_id}</p>
                  <p className="text-sm text-muted-foreground">{b.profiles?.full_name || "Unknown"} • {b.packages?.name || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${b.status === "completed" ? "text-emerald bg-emerald/10" : b.status === "cancelled" ? "text-destructive bg-destructive/10" : "text-primary bg-primary/10"}`}>
                    {b.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-muted-foreground">Total</p><p className="font-medium">৳{Number(b.total_amount).toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Paid</p><p className="font-medium">৳{Number(b.paid_amount).toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Due</p><p className="font-medium text-destructive">৳{Number(b.due_amount || 0).toLocaleString()}</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3">
                <button onClick={() => handleDownloadInvoice(b)} disabled={generatingId === b.id} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline disabled:opacity-50">
                  <Download className="h-3.5 w-3.5" /> {generatingId === b.id ? "Generating..." : "Invoice"}
                </button>
                <button onClick={() => startEdit(b)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteId(b.id)} className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No bookings found.</p>}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-2">Delete Booking?</h3>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone. All associated payments will remain.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="text-sm px-4 py-2 rounded-md bg-secondary">Cancel</button>
              <button onClick={confirmDelete} className="text-sm px-4 py-2 rounded-md bg-destructive text-destructive-foreground">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
