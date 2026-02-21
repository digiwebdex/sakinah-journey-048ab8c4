import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "umrah", description: "", price: "", duration_days: "", image_url: "" });

  const fetch = () => supabase.from("packages").select("*").order("created_at", { ascending: false }).then(({ data }) => setPackages(data || []));
  useEffect(() => { fetch(); }, []);

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
    fetch();
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
            {["hajj", "umrah", "visa", "hotel", "transport", "ziyara"].map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <input className={inputClass} placeholder="Price (BDT)" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className={inputClass} placeholder="Duration (days)" type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} />
          <textarea className={`${inputClass} sm:col-span-2`} placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="bg-gradient-gold text-primary-foreground font-semibold py-2.5 rounded-md text-sm sm:col-span-2">Create Package</button>
        </form>
      )}
      <div className="space-y-3">
        {packages.map((p: any) => (
          <div key={p.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{p.type} • {p.duration_days} days • {p.is_active ? "Active" : "Inactive"}</p>
            </div>
            <p className="font-heading font-bold text-primary">৳{Number(p.price).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
