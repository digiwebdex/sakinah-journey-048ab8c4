import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Edit2, Trash2, Save, X, Plus } from "lucide-react";
import { generateReceipt, CompanyInfo, InvoicePayment } from "@/lib/invoiceGenerator";

const inputClass = "w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ booking_id: "", amount: "", due_date: "", payment_method: "manual", notes: "" });
  const [bookingsList, setBookingsList] = useState<any[]>([]);

  const fetchPayments = () => supabase.from("payments").select("*, bookings(tracking_id, total_amount, paid_amount, due_amount, num_travelers, created_at, status, package_id, user_id, packages(name, type, duration_days))").order("created_at", { ascending: false }).then(({ data }) => setPayments(data || []));
  
  useEffect(() => { fetchPayments(); }, []);

  const loadBookings = async () => {
    const { data } = await supabase.from("bookings").select("id, tracking_id, user_id, profiles(full_name)").order("created_at", { ascending: false });
    setBookingsList(data || []);
  };

  const markPaid = async (id: string) => {
    const { error } = await supabase.from("payments").update({ status: "completed", paid_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Payment marked as completed");
    fetchPayments();
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({ amount: p.amount, due_date: p.due_date || "", status: p.status, payment_method: p.payment_method || "manual", notes: p.notes || "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("payments").update({
      amount: parseFloat(editForm.amount),
      due_date: editForm.due_date || null,
      status: editForm.status,
      payment_method: editForm.payment_method,
      notes: editForm.notes || null,
      ...(editForm.status === "completed" && !payments.find(p => p.id === editingId)?.paid_at ? { paid_at: new Date().toISOString() } : {}),
    }).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Payment updated");
    setEditingId(null);
    fetchPayments();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("payments").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Payment deleted");
    setDeleteId(null);
    fetchPayments();
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const booking = bookingsList.find((b) => b.id === addForm.booking_id);
    if (!booking) { toast.error("Select a booking"); return; }
    const { error } = await supabase.from("payments").insert({
      booking_id: addForm.booking_id,
      user_id: booking.user_id,
      amount: parseFloat(addForm.amount),
      due_date: addForm.due_date || null,
      payment_method: addForm.payment_method,
      notes: addForm.notes || null,
      status: "pending",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Payment added");
    setShowAdd(false);
    setAddForm({ booking_id: "", amount: "", due_date: "", payment_method: "manual", notes: "" });
    fetchPayments();
  };

  const handleReceipt = async (p: any) => {
    setGeneratingId(p.id);
    try {
      const { data: profile } = await supabase.from("profiles").select("full_name, phone, passport_number, address").eq("user_id", p.user_id).maybeSingle();
      const { data: allPayments } = await supabase.from("payments").select("*").eq("booking_id", p.booking_id);
      const { data: cms } = await supabase.from("site_content" as any).select("content").eq("section_key", "contact").maybeSingle();
      const cmsContent = (cms as any)?.content || {};
      const company: CompanyInfo = { name: "RAHE KABA", phone: cmsContent.phone || "", email: cmsContent.email || "", address: cmsContent.location || "" };
      const booking = p.bookings || {};
      await generateReceipt(p as InvoicePayment, { ...booking, packages: booking.packages }, profile || {}, company, (allPayments || []) as InvoicePayment[]);
      toast.success("Receipt downloaded");
    } catch { toast.error("Failed to generate receipt"); }
    setGeneratingId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading text-xl font-bold">All Payments</h2>
        <button onClick={() => { setShowAdd(!showAdd); if (!showAdd) loadBookings(); }} className="bg-gradient-gold text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2">
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? "Cancel" : "Add Payment"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddPayment} className="bg-card border border-border rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select className={inputClass} required value={addForm.booking_id} onChange={(e) => setAddForm({ ...addForm, booking_id: e.target.value })}>
            <option value="">Select Booking</option>
            {bookingsList.map((b) => <option key={b.id} value={b.id}>{b.tracking_id} — {b.profiles?.full_name || "N/A"}</option>)}
          </select>
          <input className={inputClass} placeholder="Amount (BDT)" type="number" required value={addForm.amount} onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })} />
          <input className={inputClass} type="date" value={addForm.due_date} onChange={(e) => setAddForm({ ...addForm, due_date: e.target.value })} />
          <select className={inputClass} value={addForm.payment_method} onChange={(e) => setAddForm({ ...addForm, payment_method: e.target.value })}>
            {["manual", "bkash", "nagad", "bank", "cash"].map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
          </select>
          <input className={inputClass + " sm:col-span-2"} placeholder="Notes (optional)" value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} />
          <button type="submit" className="bg-gradient-gold text-primary-foreground font-semibold py-2.5 rounded-md text-sm sm:col-span-2">Add Payment</button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-3 pr-4">Booking</th>
              <th className="pb-3 pr-4">#</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3 pr-4">Due Date</th>
              <th className="pb-3 pr-4">Method</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                {editingId === p.id ? (
                  <>
                    <td className="py-3 pr-4 font-mono text-xs">{p.bookings?.tracking_id || p.booking_id.slice(0, 8)}</td>
                    <td className="py-3 pr-4">{p.installment_number || "—"}</td>
                    <td className="py-3 pr-4"><input className={inputClass + " w-24"} type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></td>
                    <td className="py-3 pr-4"><input className={inputClass + " w-32"} type="date" value={editForm.due_date} onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} /></td>
                    <td className="py-3 pr-4">
                      <select className={inputClass + " w-24"} value={editForm.payment_method} onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}>
                        {["manual", "bkash", "nagad", "bank", "cash"].map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <select className={inputClass + " w-28"} value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                        {["pending", "completed", "failed", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="text-xs text-primary hover:underline flex items-center gap-1"><Save className="h-3 w-3" /> Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-muted-foreground hover:underline"><X className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 pr-4 font-mono text-xs">{p.bookings?.tracking_id || p.booking_id.slice(0, 8)}</td>
                    <td className="py-3 pr-4">{p.installment_number || "—"}</td>
                    <td className="py-3 pr-4 font-medium">৳{Number(p.amount).toLocaleString()}</td>
                    <td className="py-3 pr-4">{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</td>
                    <td className="py-3 pr-4 capitalize text-xs">{p.payment_method || "—"}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${p.status === "completed" ? "text-emerald bg-emerald/10" : p.status === "pending" ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {p.status === "pending" && <button onClick={() => markPaid(p.id)} className="text-xs text-primary hover:underline">Mark Paid</button>}
                        {p.status === "completed" && (
                          <button onClick={() => handleReceipt(p)} disabled={generatingId === p.id} className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50">
                            <Download className="h-3 w-3" /> {generatingId === p.id ? "..." : "Receipt"}
                          </button>
                        )}
                        <button onClick={() => startEdit(p)} className="text-xs text-muted-foreground hover:text-foreground"><Edit2 className="h-3 w-3" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="text-xs text-destructive hover:underline"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {payments.length === 0 && <p className="text-center text-muted-foreground py-12">No payments yet.</p>}

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-2">Delete Payment?</h3>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
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
