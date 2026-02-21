import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function AdminAccountingPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", category: "operations", note: "" });

  const fetch = () => supabase.from("expenses").select("*").order("date", { ascending: false }).then(({ data }) => setExpenses(data || []));
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("expenses").insert({ title: form.title, amount: parseFloat(form.amount), category: form.category, note: form.note || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Expense recorded");
    setShowForm(false);
    setForm({ title: "", amount: "", category: "operations", note: "" });
    fetch();
  };

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading text-xl font-bold">Accounting</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-gradient-gold text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Expense"}
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">Total Expenses</p>
        <p className="text-2xl font-heading font-bold text-destructive">৳{totalExpenses.toLocaleString()}</p>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className={inputClass} placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={inputClass} placeholder="Amount (BDT)" type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {["operations", "marketing", "travel", "salary", "office", "other"].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <input className={inputClass} placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button type="submit" className="bg-gradient-gold text-primary-foreground font-semibold py-2.5 rounded-md text-sm sm:col-span-2">Record Expense</button>
        </form>
      )}

      <div className="space-y-2">
        {expenses.map((e: any) => (
          <div key={e.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{e.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{e.category} • {new Date(e.date).toLocaleDateString()}</p>
            </div>
            <p className="font-heading font-bold text-destructive">৳{Number(e.amount).toLocaleString()}</p>
          </div>
        ))}
        {expenses.length === 0 && <p className="text-center text-muted-foreground py-12">No expenses recorded.</p>}
      </div>
    </div>
  );
}
