import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("bookings").select("*, packages(name, type), profiles(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => setBookings(data || []));
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xl font-bold">All Bookings</h2>
      {bookings.map((b: any) => (
        <div key={b.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-mono font-bold text-primary text-sm">{b.tracking_id}</p>
              <p className="text-sm text-muted-foreground">{b.profiles?.full_name || "Unknown"} • {b.packages?.name || "N/A"}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${b.status === "completed" ? "text-emerald bg-emerald/10" : b.status === "cancelled" ? "text-destructive bg-destructive/10" : "text-primary bg-primary/10"}`}>
              {b.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><p className="text-muted-foreground">Total</p><p className="font-medium">৳{Number(b.total_amount).toLocaleString()}</p></div>
            <div><p className="text-muted-foreground">Paid</p><p className="font-medium">৳{Number(b.paid_amount).toLocaleString()}</p></div>
            <div><p className="text-muted-foreground">Due</p><p className="font-medium text-destructive">৳{Number(b.due_amount || 0).toLocaleString()}</p></div>
          </div>
        </div>
      ))}
      {bookings.length === 0 && <p className="text-center text-muted-foreground py-12">No bookings yet.</p>}
    </div>
  );
}
