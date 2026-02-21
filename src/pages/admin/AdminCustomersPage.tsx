import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setCustomers(data || []));
  }, []);

  return (
    <div>
      <h2 className="font-heading text-xl font-bold mb-4">Customers</h2>
      <div className="space-y-2">
        {customers.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{c.full_name || "No name"}</p>
                <p className="text-xs text-muted-foreground">{c.phone || "No phone"} • Passport: {c.passport_number || "N/A"}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {customers.length === 0 && <p className="text-center text-muted-foreground py-12">No customers yet.</p>}
      </div>
    </div>
  );
}
