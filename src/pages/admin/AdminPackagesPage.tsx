import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X, Edit2, Trash2, Save, ToggleLeft, ToggleRight } from "lucide-react";

const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const TYPES = ["hajj", "umrah", "visa", "hotel", "transport", "ziyara"];

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "umrah", description: "", price: "", duration_days: "", image_url: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPkgs = () => supabase.from("packages").select("*").order("created_at", { ascending: false }).then(({ data }) => setPackages(data || []));
  useEffect(() => { fetchPkgs(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("packages").insert({
      name: form.name, type: form.type, description: form.description,
      price: parseFloat(form.price), duration_days: form.duration_days ? parseInt(form.duration_days) : null,
      image_url: form.image_url || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Package created");
    setShowForm(false);
    setForm({ name: "", type: "umrah", description: "", price: "", duration_days: "", image_url: "" });
    fetchPkgs();
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, type: p.type, description: p.description || "", price: p.price, duration_days: p.duration_days || "", image_url: p.image_url || "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("packages").update({
      name: editForm.name, type: editForm.type, description: editForm.description,
      price: parseFloat(editForm.price), duration_days: editForm.duration_days ? parseInt(editForm.duration_days) : null,
      image_url: editForm.image_url || null,
    }).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Package updated");
    setEditingId(null);
    fetchPkgs();
  };

  const toggleActive = async (p: any) => {
    const { error } = await supabase.from("packages").update({ is_active: !p.is_active }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(p.is_active ? "Package deactivated" : "Package activated");
    fetchPkgs();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("packages").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Package deleted");
    setDeleteId(null);
    fetchPkgs();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading text-xl font-bold">Packages</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-gradient-gold text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Package"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className={inputClass} placeholder="Package Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <input className={inputClass} placeholder="Price (BDT)" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className={inputClass} placeholder="Duration (days)" type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} />
          <textarea className={`${inputClass} sm:col-span-2`} placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className={`${inputClass} sm:col-span-2`} placeholder="Image URL (optional)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <button type="submit" className="bg-gradient-gold text-primary-foreground font-semibold py-2.5 rounded-md text-sm sm:col-span-2">Create Package</button>
        </form>
      )}

      <div className="space-y-3">
        {packages.map((p: any) => (
          <div key={p.id} className="bg-card border border-border rounded-lg p-4">
            {editingId === p.id ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <input className={inputClass} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                <select className={inputClass} value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                  {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
                <input className={inputClass} type="number" placeholder="Price" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                <input className={inputClass} type="number" placeholder="Duration" value={editForm.duration_days} onChange={(e) => setEditForm({ ...editForm, duration_days: e.target.value })} />
                <textarea className={inputClass + " sm:col-span-2"} placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} />
                <div className="flex gap-2 items-center sm:col-span-3">
                  <button onClick={saveEdit} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md flex items-center gap-1"><Save className="h-3 w-3" /> Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs bg-secondary px-3 py-1.5 rounded-md">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.type} • {p.duration_days || "—"} days • {p.is_active ? "Active" : "Inactive"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-heading font-bold text-primary">৳{Number(p.price).toLocaleString()}</p>
                  <button onClick={() => toggleActive(p)} className="text-muted-foreground hover:text-foreground" title={p.is_active ? "Deactivate" : "Activate"}>
                    {p.is_active ? <ToggleRight className="h-5 w-5 text-emerald" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setDeleteId(p.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-2">Delete Package?</h3>
            <p className="text-sm text-muted-foreground mb-4">This will not affect existing bookings using this package.</p>
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
