import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);

  const fetch = () => supabase.from("payments").select("*, bookings(tracking_id)").order("created_at", { ascending: false }).then(({ data }) => setPayments(data || []));
  useEffect(() => { fetch(); }, []);

  const markPaid = async (id: string) => {
    const { error } = await supabase.from("payments").update({ status: "completed", paid_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Payment marked as completed");
    fetch();
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-bold mb-4">All Payments</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-3 pr-4">Booking</th>
              <th className="pb-3 pr-4">#</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3 pr-4">Due Date</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="py-3 pr-4 font-mono text-xs">{p.bookings?.tracking_id || p.booking_id.slice(0, 8)}</td>
                <td className="py-3 pr-4">{p.installment_number || "—"}</td>
                <td className="py-3 pr-4 font-medium">৳{Number(p.amount).toLocaleString()}</td>
                <td className="py-3 pr-4">{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${p.status === "completed" ? "text-emerald bg-emerald/10" : p.status === "pending" ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3">
                  {p.status === "pending" && (
                    <button onClick={() => markPaid(p.id)} className="text-xs text-primary hover:underline">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {payments.length === 0 && <p className="text-center text-muted-foreground py-12">No payments yet.</p>}
    </div>
  );
}
