import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X, Edit2, Trash2, Save } from "lucide-react";

const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const CATEGORIES = ["operations", "marketing", "travel", "salary", "office", "visa", "hotel", "transport", "other"];

export default function AdminAccountingPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", category: "operations", note: "", date: "", booking_id: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [revenue, setRevenue] = useState(0);

  const fetchData = async () => {
    const [expRes, payRes, bkRes] = await Promise.all([
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("payments").select("amount").eq("status", "completed"),
      supabase.from("bookings").select("id, tracking_id, profiles(full_name)").order("created_at", { ascending: false }),
    ]);
    setExpenses(expRes.data || []);
    setRevenue((payRes.data || []).reduce((s, p) => s + Number(p.amount), 0));
    setBookings(bkRes.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("expenses").insert({
      title: form.title, amount: parseFloat(form.amount), category: form.category,
      note: form.note || null, date: form.date || undefined,
      booking_id: form.booking_id || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Expense recorded");
    setShowForm(false);
    setForm({ title: "", amount: "", category: "operations", note: "", date: "", booking_id: "" });
    fetchData();
  };

  const startEdit = (e: any) => {
    setEditingId(e.id);
    setEditForm({ title: e.title, amount: e.amount, category: e.category, note: e.note || "", date: e.date, booking_id: e.booking_id || "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("expenses").update({
      title: editForm.title, amount: parseFloat(editForm.amount), category: editForm.category,
      note: editForm.note || null, date: editForm.date, booking_id: editForm.booking_id || null,
    }).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Expense updated");
    setEditingId(null);
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("expenses").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Expense deleted");
    setDeleteId(null);
    fetchData();
  };

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = revenue - totalExpenses;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading text-xl font-bold">Accounting</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-gradient-gold text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Expense"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-heading font-bold text-primary">৳{revenue.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-heading font-bold text-destructive">৳{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p className={`text-2xl font-heading font-bold ${netProfit >= 0 ? "text-emerald" : "text-destructive"}`}>৳{netProfit.toLocaleString()}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className={inputClass} placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={inputClass} placeholder="Amount (BDT)" type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <select className={inputClass} value={form.booking_id} onChange={(e) => setForm({ ...form, booking_id: e.target.value })}>
            <option value="">No linked booking</option>
            {bookings.map((b) => <option key={b.id} value={b.id}>{b.tracking_id} — {b.profiles?.full_name || "N/A"}</option>)}
          </select>
          <input className={inputClass} placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button type="submit" className="bg-gradient-gold text-primary-foreground font-semibold py-2.5 rounded-md text-sm sm:col-span-2">Record Expense</button>
        </form>
      )}

      <div className="space-y-2">
        {expenses.map((e: any) => (
          <div key={e.id} className="bg-card border border-border rounded-lg p-4">
            {editingId === e.id ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <input className={inputClass} value={editForm.title} onChange={(ev) => setEditForm({ ...editForm, title: ev.target.value })} />
                <input className={inputClass} type="number" value={editForm.amount} onChange={(ev) => setEditForm({ ...editForm, amount: ev.target.value })} />
                <select className={inputClass} value={editForm.category} onChange={(ev) => setEditForm({ ...editForm, category: ev.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <input className={inputClass} type="date" value={editForm.date} onChange={(ev) => setEditForm({ ...editForm, date: ev.target.value })} />
                <select className={inputClass} value={editForm.booking_id} onChange={(ev) => setEditForm({ ...editForm, booking_id: ev.target.value })}>
                  <option value="">No linked booking</option>
                  {bookings.map((b) => <option key={b.id} value={b.id}>{b.tracking_id}</option>)}
                </select>
                <input className={inputClass} placeholder="Note" value={editForm.note} onChange={(ev) => setEditForm({ ...editForm, note: ev.target.value })} />
                <div className="flex gap-2 items-center sm:col-span-3">
                  <button onClick={saveEdit} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md flex items-center gap-1"><Save className="h-3 w-3" /> Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs bg-secondary px-3 py-1.5 rounded-md">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{e.category} • {new Date(e.date).toLocaleDateString()}{e.booking_id ? " • Linked" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-heading font-bold text-destructive">৳{Number(e.amount).toLocaleString()}</p>
                  <button onClick={() => startEdit(e)} className="text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setDeleteId(e.id)} className="text-destructive hover:underline"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {expenses.length === 0 && <p className="text-center text-muted-foreground py-12">No expenses recorded.</p>}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-2">Delete Expense?</h3>
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
