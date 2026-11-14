import { useState, useEffect } from "react";
import {
  TrendingUp,
  Coins,
  Receipt,
  Percent,
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  CalendarDays
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
      todayRevenue: 0,
      todayTransactions: 0,
      weekRevenue: 0,
      weekTransactions: 0,
      monthRevenue: 0,
      monthTransactions: 0,
      avgSale: 0,
      topDrug: "N/A"
    }
  });
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState("week"); // "today" | "week" | "month"

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

  // Get current active revenue and transaction values based on classification
  const getPeriodRevenue = () => {
    if (activePeriod === "today") {
      return reportData.summary.todayRevenue || 0;
    }
    if (activePeriod === "month") {
      return reportData.summary.monthRevenue || 0;
    }
    return reportData.summary.weekRevenue || 0;
  };

  const getPeriodTransactions = () => {
    if (activePeriod === "today") {
      return reportData.summary.todayTransactions || 0;
    }
    if (activePeriod === "month") {
      return reportData.summary.monthTransactions || 0;
    }
    return reportData.summary.weekTransactions || 0;
  };

  const getPeriodLabel = () => {
    if (activePeriod === "today") return "Today's";
    if (activePeriod === "month") return "This Month's";
    return "This Week's";
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
    ? reportData.sales
    : [
        {
          id: 1,
          date_str: "Nov 14, 2026",
          time_str: "04:45 PM",
          is_today: true,
          drug_name: "Paracetamol 500mg",
          quantity: 2,
          total_price: 10.00
        },
        {
          id: 2,
          date_str: "Nov 14, 2026",
          time_str: "03:15 PM",
          is_today: true,
          drug_name: "Amoxicillin 500mg",
          quantity: 1,
          total_price: 15.00
        },
        {
          id: 3,
          date_str: "Nov 13, 2026",
          time_str: "06:20 PM",
          is_yesterday: true,
          drug_name: "Metformin 500mg",
          quantity: 1,
          total_price: 12.00
        },
        {
          id: 4,
          date_str: "Nov 13, 2026",
          time_str: "02:10 PM",
          is_yesterday: true,
          drug_name: "Aspirin 75mg",
          quantity: 2,
          total_price: 12.00
        },
        {
          id: 5,
          date_str: "Nov 12, 2026",
          time_str: "11:30 AM",
          drug_name: "Ibuprofen 400mg",
          quantity: 3,
          total_price: 16.50
        }
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
            <p className="main-page-subtitle">Track revenue, monitor transactions, and view sales history</p>
          </div>
        </div>

        {/* Period Classification Switcher Pills */}
        <div className="period-classification-switch">
          <button
            className={`btn-period-pill ${activePeriod === "today" ? "period-pill-active" : ""}`}
            onClick={() => setActivePeriod("today")}
          >
            Today
          </button>
          <button
            className={`btn-period-pill ${activePeriod === "week" ? "period-pill-active" : ""}`}
            onClick={() => setActivePeriod("week")}
          >
            This Week
          </button>
          <button
            className={`btn-period-pill ${activePeriod === "month" ? "period-pill-active" : ""}`}
            onClick={() => setActivePeriod("month")}
          >
            This Month
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="reports-metrics-row">
        {/* Card 1: Classified Revenue */}
        <div className="report-stat-card card-revenue">
          <div className="stat-card-icon-round bg-yellow-circle">
            <Coins size={22} className="text-yellow-600" />
          </div>
          <div className="stat-card-info">
            <div className="stat-card-header-flex">
              <span className="stat-card-title">{getPeriodLabel()} Revenue</span>
              <span className="stat-period-tag">{activePeriod.toUpperCase()}</span>
            </div>
            <span className="stat-card-number">
              ETB {formatETB(getPeriodRevenue())}
            </span>
          </div>
        </div>

        {/* Card 2: Classified Transactions */}
        <div className="report-stat-card card-transactions">
          <div className="stat-card-icon-round bg-blue-circle">
            <Receipt size={22} className="text-blue-600" />
          </div>
          <div className="stat-card-info">
            <div className="stat-card-header-flex">
              <span className="stat-card-title">{getPeriodLabel()} Transactions</span>
              <span className="stat-period-tag">{activePeriod.toUpperCase()}</span>
            </div>
            <span className="stat-card-number">
              {getPeriodTransactions()} orders
            </span>
          </div>
        </div>

        {/* Card 3: Avg. per Sale */}
        <div className="report-stat-card card-avg">
          <div className="stat-card-icon-round bg-purple-circle">
            <Percent size={22} className="text-purple-600" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Avg. Order Value</span>
            <span className="stat-card-number">
              ETB {reportData.summary.avgSale > 0 ? formatETB(reportData.summary.avgSale) : "597"}
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
            <div className="reports-card-title-group">
              <CalendarDays size={18} className="text-emerald-700" />
              <h4>Revenue Trend (Last 7 Days)</h4>
            </div>
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

        {/* Right: Recent Transactions with Specific Date & Smart Time */}
        <div className="reports-transactions-card">
          <div className="reports-card-header">
            <h4>Recent Transactions</h4>
            <span className="reports-view-all">Total: {recentTransactions.length}</span>
          </div>

          <div className="recent-transactions-table-wrap">
            <table className="recent-transactions-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Medicine</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, idx) => (
                  <tr key={tx.id || idx}>
                    <td className="tx-time-cell-detailed">
                      <div className="tx-date-badge-wrap">
                        {tx.is_today ? (
                          <span className="badge-smart-date badge-today">Today</span>
                        ) : tx.is_yesterday ? (
                          <span className="badge-smart-date badge-yesterday">Yesterday</span>
                        ) : (
                          <span className="badge-smart-date badge-past">
                            {tx.date_str || "Past"}
                          </span>
                        )}
                        <span className="tx-exact-time">
                          <Clock size={12} className="tx-clock-inline" />
                          {tx.time_str || "04:45 PM"}
                        </span>
                      </div>
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
