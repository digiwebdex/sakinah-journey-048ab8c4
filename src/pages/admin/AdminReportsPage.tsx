import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*, packages(name, type)").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("date", { ascending: false }),
    ]).then(([bk, py, ex]) => {
      setBookings(bk.data || []);
      setPayments(py.data || []);
      setExpenses(ex.data || []);
    });
  }, []);

  const totalRevenue = payments.filter(p => p.status === "completed").reduce((s, p) => s + Number(p.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  const stats = [
    { label: "Total Bookings", value: bookings.length },
    { label: "Revenue Collected", value: `৳${totalRevenue.toLocaleString()}` },
    { label: "Total Expenses", value: `৳${totalExpenses.toLocaleString()}` },
    { label: "Net Profit", value: `৳${netProfit.toLocaleString()}`, color: netProfit >= 0 ? "text-emerald" : "text-destructive" },
  ];

  return (
    <div>
      <h2 className="font-heading text-xl font-bold mb-4">Reports</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-heading font-bold ${s.color || "text-foreground"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <h3 className="font-heading text-lg font-bold mb-3">Recent Bookings by Package Type</h3>
      <div className="space-y-2">
        {Object.entries(
          bookings.reduce((acc: Record<string, number>, b) => {
            const type = b.packages?.type || "unknown";
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {})
        ).map(([type, count]) => (
          <div key={type} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
            <p className="text-sm font-medium capitalize">{type}</p>
            <span className="bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full">{count as number}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
