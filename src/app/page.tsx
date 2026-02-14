"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Expense } from "@/types/expense";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Home() {
  const [expenses, setexpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [timeRange, setTimeRange] = useState("all");

  const displayExpenses = expenses
    .filter((item) => {
      // Mapping categories for filter logic
      const categoryMap: { [key: string]: string } = {
        "All": "All",
        "Food & Drink": "อาหารและเครื่องดื่ม",
        "Transport": "เดินทาง",
        "Accommodation": "ที่พัก",
        "Shopping": "ช้อปปิ้ง"
      };

      const matchCategory = filterCategory === "All" || item.category === categoryMap[filterCategory];
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let matchTime = true;
      if (timeRange === "today") {
        matchTime = itemDate.getTime() === today.getTime();
      } else if (timeRange === "last7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        matchTime = itemDate >= sevenDaysAgo;
      } else if (timeRange === "thisMonth") {
        matchTime = itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
      }
      return matchCategory && matchTime;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount-desc") return Number(b.amount) - Number(a.amount);
      if (sortBy === "amount-asc") return Number(a.amount) - Number(b.amount);
      return 0;
    });

  const totalExpenseStatic = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const averagePerDayStatic = expenses.length > 0 ? totalExpenseStatic / 30 : 0;

  const categorySummary = displayExpenses.reduce((acc: any, item) => {
    // Translate DB category back to English for display
    const translateMap: { [key: string]: string } = {
      "อาหารและเครื่องดื่ม": "Food & Drink",
      "เดินทาง": "Transport",
      "ที่พัก": "Accommodation",
      "ช้อปปิ้ง": "Shopping"
    };
    const engName = translateMap[item.category] || item.category;
    acc[engName] = (acc[engName] || 0) + Number(item.amount);
    return acc;
  }, {});

  const chartData = Object.entries(categorySummary).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this record?")) {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (!error) {
        setexpenses(expenses.filter((item) => item.id !== id));
      }
    }
  };

  useEffect(() => {
    async function fetchExpenses() {
      const { data, error } = await supabase.from("expenses").select("*").order("date", { ascending: false });
      if (error) {
        console.log("Error fetching expenses:", error.message);
      } else {
        setexpenses(data || []);
      }
      setLoading(false);
    }
    fetchExpenses();
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto p-10 text-center animate-pulse text-gray-400">Loading Dashboard...</div>;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8 pb-20 text-gray-900">
      <header className="flex justify-between items-center pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">SpendTrace</h1>
          <p className="text-sm text-gray-500">Analyze your financial data</p>
        </div>
        <Link href="/Add">
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all active:scale-95">
            + Add Record
          </button>
        </Link>
      </header>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white border-2 border-red-100 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total Expenses</p>
          <p className="text-3xl font-bold text-red-600">฿{totalExpenseStatic.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white border-2 border-blue-100 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Daily Average (30 days)</p>
          <p className="text-3xl font-bold text-blue-600">฿{averagePerDayStatic.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Unified Analytics Section: Chart & Summary Side-by-Side */}
      <section className="bg-white p-8 border rounded-3xl shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-8">Expense Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          
          {/* Donut Chart */}
          <div className="lg:col-span-3 h-75 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 italic">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" animationDuration={800}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `฿${v.toLocaleString()}`} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Side Summary List */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Summary by Category</p>
            {Object.entries(categorySummary).map(([cat, amt]: any, index) => (
              <div key={cat} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <p className="text-sm font-semibold text-gray-700">{cat}</p>
                </div>
                <p className="text-md font-bold text-gray-900">฿{amt.toLocaleString()}</p>
              </div>
            ))}
            {Object.keys(categorySummary).length === 0 && <p className="text-sm text-gray-400 italic">No records found</p>}
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-2xl items-center shadow-inner">
        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">Time Range</label>
          <select className="p-2 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="last7days">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">Category</label>
          <select className="p-2 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Food & Drink">Food & Drink</option>
            <option value="Transport">Transport</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Shopping">Shopping</option>
          </select>
        </div>
        <div className="flex flex-col ml-auto">
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">Sort By</label>
          <select className="p-2 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium" onChange={(e) => setSortBy(e.target.value)}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount (High-Low)</option>
            <option value="amount-asc">Amount (Low-High)</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
        <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
          {displayExpenses.length === 0 ? (
            <p className="p-10 text-center text-gray-400">No transactions match your filters</p>
          ) : (
            displayExpenses.map((item) => (
              <div key={item.id} className="group flex justify-between items-center p-5 border-b last:border-0 hover:bg-gray-50 transition">
                <div>
                  <p className="font-bold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {item.category === "อาหารและเครื่องดื่ม" ? "Food & Drink" : 
                     item.category === "เดินทาง" ? "Transport" : 
                     item.category === "ที่พัก" ? "Accommodation" : 
                     item.category === "ช้อปปิ้ง" ? "Shopping" : item.category} • {new Date(item.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-red-500">-{Number(item.amount).toLocaleString()} ฿</p>
                  <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}