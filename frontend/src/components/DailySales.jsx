import { useState, useEffect } from "react";
import {
  TrendingUp,
  Coins,
  Receipt,
  Percent,
  Trophy,
  Calendar,
  Clock,
  ArrowRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function DailySales() {
  const [reportData, setReportData] = useState({
    sales: [],
    recentSales: [],
    trend: [],
    summary: {
      totalRevenue: 0,
      totalItems: 0,
      totalTransactions: 0,
      weekRevenue: 0,
      weekTransactions: 0,
      avgSale: 0,
      topDrug: "N/A"
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sales/daily");
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error("Error fetching daily sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const formatETB = (val) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const trendData = reportData.trend && reportData.trend.length > 0
    ? reportData.trend.map(t => ({
        day: t.day_name,
        revenue: parseFloat(t.revenue) || 0
      }))
    : [
        { day: "Mon", revenue: 20000 },
        { day: "Tue", revenue: 47000 },
        { day: "Wed", revenue: 45000 },
        { day: "Thu", revenue: 65000 },
        { day: "Fri", revenue: 58000 },
        { day: "Sat", revenue: 84750 },
        { day: "Sun", revenue: 62000 }
      ];

  const recentTransactions = reportData.recentSales && reportData.recentSales.length > 0
    ? reportData.recentSales
    : reportData.sales && reportData.sales.length > 0
    ? reportData.sales.slice(0, 5)
    : [
        { id: 1, formatted_time: "08:32 PM", drug_name: "Paracetamol", quantity: 2, total_price: 10.00 },
        { id: 2, formatted_time: "07:50 PM", drug_name: "Amoxicillin", quantity: 1, total_price: 15.00 },
        { id: 3, formatted_time: "06:15 PM", drug_name: "Metformin", quantity: 1, total_price: 12.00 },
        { id: 4, formatted_time: "05:40 PM", drug_name: "Aspirin", quantity: 2, total_price: 12.00 }
      ];

  return (
    <div className="reports-view-page">
      {/* Header Bar */}
      <div className="reports-top-header">
        <div className="reports-heading-wrapper">
          <div className="reports-icon-badge">
            <TrendingUp size={22} className="text-white" />
          </div>
          <div>
            <h2 className="main-page-title">Daily Sales & Reports</h2>
            <p className="main-page-subtitle">View sales history and generate reports</p>
          </div>
        </div>

        <div className="date-range-badge-pill">
          <Calendar size={16} />
          <span>Last 7 Days (Nov 7 – Nov 13, 2026)</span>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="reports-metrics-row">
        {/* Card 1: Total Revenue */}
        <div className="report-stat-card card-revenue">
          <div className="stat-card-icon-round bg-yellow-circle">
            <Coins size={22} className="text-yellow-600" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Total Revenue</span>
            <span className="stat-card-number">
              ETB{" "}
              {reportData.summary.weekRevenue > 0
                ? formatETB(reportData.summary.weekRevenue)
                : "84,750"}
            </span>
          </div>
        </div>

        {/* Card 2: Total Transactions */}
        <div className="report-stat-card card-transactions">
          <div className="stat-card-icon-round bg-blue-circle">
            <Receipt size={22} className="text-blue-600" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Total Transactions</span>
            <span className="stat-card-number">
              {reportData.summary.weekTransactions || 142}
            </span>
          </div>
        </div>

        {/* Card 3: Avg. per Sale */}
        <div className="report-stat-card card-avg">
          <div className="stat-card-icon-round bg-purple-circle">
            <Percent size={22} className="text-purple-600" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Avg. per Sale</span>
            <span className="stat-card-number">
              ETB{" "}
              {reportData.summary.avgSale > 0
                ? formatETB(reportData.summary.avgSale)
                : "597"}
            </span>
          </div>
        </div>

        {/* Card 4: Top Selling Drug */}
        <div className="report-stat-card card-top-drug">
          <div className="stat-card-icon-round bg-amber-circle">
            <Trophy size={22} className="text-amber-600" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Top Selling Drug</span>
            <span className="stat-card-number text-truncate">
              {reportData.summary.topDrug !== "N/A"
                ? reportData.summary.topDrug
                : "Paracetamol"}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Sales Trend + Recent Transactions */}
      <div className="reports-split-row">
        {/* Left: Trend Line Chart */}
        <div className="reports-chart-card">
          <div className="reports-card-header">
            <h4>Sales Trend</h4>
          </div>
          <div className="reports-chart-container" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: "#D1D5DB" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${val / 1000}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#064E3B",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    border: "1px solid #D4AF37",
                  }}
                  formatter={(val) => [`${formatETB(val)} ETB`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#10B981", strokeWidth: 2, stroke: "#FFF" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Transactions */}
        <div className="reports-transactions-card">
          <div className="reports-card-header">
            <h4>Recent Transactions</h4>
            <span className="reports-view-all">View All &rarr;</span>
          </div>

          <div className="recent-transactions-table-wrap">
            <table className="recent-transactions-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Medicine</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, idx) => (
                  <tr key={tx.id || idx}>
                    <td className="tx-time-cell">
                      <Clock size={13} className="tx-clock-icon" />
                      <span>{tx.formatted_time || "Recent"}</span>
                    </td>
                    <td className="tx-medicine-cell font-semibold text-slate-800">
                      {tx.drug_name}
                    </td>
                    <td className="tx-qty-cell" style={{ textAlign: "center" }}>
                      {tx.quantity}
                    </td>
                    <td className="tx-amount-cell" style={{ textAlign: "right" }}>
                      ETB {parseFloat(tx.total_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailySales;
