import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Edit2, Save, X, Search } from "lucide-react";
import CustomerFinancialReport from "@/components/admin/CustomerFinancialReport";

const inputClass = "w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [search, setSearch] = useState("");

  const fetchCustomers = () =>
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setCustomers(data || []));

  useEffect(() => { fetchCustomers(); }, []);

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setEditForm({ full_name: c.full_name || "", phone: c.phone || "", passport_number: c.passport_number || "", address: c.address || "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("profiles").update({
      full_name: editForm.full_name || null,
      phone: editForm.phone || null,
      passport_number: editForm.passport_number || null,
      address: editForm.address || null,
    }).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Customer updated");
    setEditingId(null);
    fetchCustomers();
  };

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.full_name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.passport_number?.toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="font-heading text-xl font-bold">Customers</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className={inputClass + " pl-9"} placeholder="Search by name, phone, passport..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-lg p-4">
            {editingId === c.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Full Name</label>
                    <input className={inputClass} value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Phone</label>
                    <input className={inputClass} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Passport Number</label>
                    <input className={inputClass} value={editForm.passport_number} onChange={(e) => setEditForm({ ...editForm, passport_number: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Address</label>
                    <input className={inputClass} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md flex items-center gap-1"><Save className="h-3 w-3" /> Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs bg-secondary px-3 py-1.5 rounded-md flex items-center gap-1"><X className="h-3 w-3" /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.full_name || "No name"}</p>
                    <p className="text-xs text-muted-foreground">{c.phone || "No phone"} • Passport: {c.passport_number || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                  <button onClick={(e) => { e.stopPropagation(); startEdit(c); }} className="text-muted-foreground hover:text-foreground">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No customers found.</p>}
      </div>

      <CustomerFinancialReport
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onOpenChange={(open) => { if (!open) setSelectedCustomer(null); }}
      />
    </div>
  );
}
