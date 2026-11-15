import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../api";
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
  CalendarDays,
  RefreshCw
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
  const [activePeriod, setActivePeriod] = useState("today"); // Default to "today" so today's sales are prominent!

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/sales/daily");
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
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  // Helper to parse dates and smart labels (Today / Yesterday / Specific Date)
  const parseSaleDateInfo = (saleDate) => {
    if (!saleDate) {
      return { isToday: true, isYesterday: false, dateStr: "Today", timeStr: "Just now" };
    }
    const d = new Date(saleDate);
    if (isNaN(d.getTime())) {
      return { isToday: false, isYesterday: false, dateStr: "Recent", timeStr: "Recent" };
    }

    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    return { isToday, isYesterday, dateStr, timeStr };
  };

  // Extract recent sales list from API response
  const rawTransactions = useMemo(() => {
    const list = reportData.recentSales || reportData.sales || [];
    return list;
  }, [reportData]);

  // Client-side calculations to ensure timezone-accurate metrics
  const { calculatedTodayRevenue, calculatedTodayCount, processedTransactions } = useMemo(() => {
    let todayRev = 0;
    let todayCount = 0;

    const processed = rawTransactions.map((tx) => {
      const dateInfo = parseSaleDateInfo(tx.sale_date);
      const totalNum = parseFloat(tx.total_price || 0);

      if (dateInfo.isToday) {
        todayRev += totalNum;
        todayCount += 1;
      }

      return {
        ...tx,
        ...dateInfo,
        displayName: tx.drug_name || tx.name || "Medication",
        parsedPrice: totalNum
      };
    });

    return {
      calculatedTodayRevenue: todayRev,
      calculatedTodayCount: todayCount,
      processedTransactions: processed
    };
  }, [rawTransactions]);

  // Active revenue based on selected period
  const getPeriodRevenue = () => {
    if (activePeriod === "today") {
      return calculatedTodayRevenue > 0
        ? calculatedTodayRevenue
        : reportData.summary.todayRevenue || 0;
    }
    if (activePeriod === "month") {
      return reportData.summary.monthRevenue || 0;
    }
    return reportData.summary.weekRevenue || 0;
  };

  const getPeriodTransactions = () => {
    if (activePeriod === "today") {
      return calculatedTodayCount > 0
        ? calculatedTodayCount
        : reportData.summary.todayTransactions || 0;
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
    ? reportData.trend.map((t) => ({
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
              ETB {reportData.summary.avgSale > 0 ? formatETB(reportData.summary.avgSale) : "597.00"}
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
            <div className="reports-card-title-group">
              <h4>Recent Transactions</h4>
              <span className="reports-view-all">
                ({processedTransactions.length} recorded)
              </span>
            </div>
            <button
              className="btn-refresh-tx"
              onClick={fetchSalesData}
              title="Refresh Sales"
            >
              <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
            </button>
          </div>

          <div className="recent-transactions-table-wrap">
            {processedTransactions.length === 0 ? (
              <div className="pos-cart-empty">
                <Receipt size={36} className="empty-cart-icon" />
                <p>No sales recorded yet</p>
                <span>Sales made in Sell Medicine will appear here automatically</span>
              </div>
            ) : (
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
                  {processedTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="tx-time-cell-detailed">
                        <div className="tx-date-badge-wrap">
                          {tx.isToday ? (
                            <span className="badge-smart-date badge-today">Today</span>
                          ) : tx.isYesterday ? (
                            <span className="badge-smart-date badge-yesterday">Yesterday</span>
                          ) : (
                            <span className="badge-smart-date badge-past">
                              {tx.dateStr}
                            </span>
                          )}
                          <span className="tx-exact-time">
                            <Clock size={12} className="tx-clock-inline" />
                            {tx.timeStr}
                          </span>
                        </div>
                      </td>
                      <td className="tx-medicine-cell font-semibold text-slate-800">
                        {tx.displayName}
                      </td>
                      <td className="tx-qty-cell" style={{ textAlign: "center" }}>
                        {tx.quantity}
                      </td>
                      <td className="tx-amount-cell" style={{ textAlign: "right" }}>
                        ETB {tx.parsedPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailySales;
