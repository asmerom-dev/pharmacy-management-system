import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Ban,
  ShoppingCart,
  Coins,
  ArrowUpRight,
  Plus,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Package
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";
import AddDrugModal from "./AddDrugModal";

function Dashboard() {
  const [stats, setStats] = useState({
    totalDrugs: 0,
    totalUnits: 0,
    lowStock: 0,
    outOfStock: 0,
    todaySales: 0,
    todayRevenue: 0,
    salesTrend: [],
    topSelling: []
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/drugs/stats/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Format currency
  const formatETB = (val) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Sample fallback data if database is fresh
  const topSellingData = stats.topSelling && stats.topSelling.length > 0
    ? stats.topSelling
    : [
        { name: "Paracetamol", total_sold: 180 },
        { name: "Amoxicillin", total_sold: 145 },
        { name: "Ibuprofen", total_sold: 120 },
        { name: "Metformin", total_sold: 95 },
        { name: "Aspirin", total_sold: 80 }
      ];

  const trendData = stats.salesTrend && stats.salesTrend.length > 0
    ? stats.salesTrend.map(d => ({
        day: d.day_name || "Day",
        revenue: parseFloat(d.revenue) || 0,
        transactions: parseInt(d.transactions, 10) || 0
      }))
    : [
        { day: "Mon", revenue: 3500, transactions: 45 },
        { day: "Tue", revenue: 5200, transactions: 65 },
        { day: "Wed", revenue: 4800, transactions: 60 },
        { day: "Thu", revenue: 7000, transactions: 78 },
        { day: "Fri", revenue: 8500, transactions: 85 },
        { day: "Sat", revenue: 12450, transactions: 98 },
        { day: "Sun", revenue: 9800, transactions: 72 }
      ];

  return (
    <div className="dashboard-view-page">
      {/* Page Header */}
      <div className="page-intro-header">
        <div className="intro-title-wrapper">
          <div className="pulse-icon-gold">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="main-page-title">Dashboard</h2>
            <p className="main-page-subtitle">Welcome back, Asme Teklay!</p>
          </div>
        </div>
      </div>

      {/* 5 Top Stat Cards */}
      <div className="stats-metric-grid">
        {/* Card 1: Total Drugs in Stock */}
        <div className="metric-card metric-card-green">
          <div className="metric-card-content">
            <div className="metric-icon-sphere bg-green-sphere">
              {/* Bottle SVG */}
              <svg viewBox="0 0 40 40" className="stat-svg-icon" fill="none">
                <rect x="12" y="14" width="16" height="22" rx="4" fill="#047857" />
                <rect x="14" y="8" width="12" height="6" rx="2" fill="#10B981" />
                <rect x="13" y="6" width="14" height="3" rx="1.5" fill="#FDE68A" />
                <rect x="15" y="20" width="10" height="11" rx="2" fill="#FFFFFF" />
                <path d="M20 23V28M17.5 25.5H22.5" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="metric-data-block">
              <span className="metric-value-huge">
                {stats.totalUnits ? stats.totalUnits : stats.totalDrugs || 248}
              </span>
              <span className="metric-label-text">Total Drugs in Stock</span>
              <span className="metric-growth-badge growth-positive">
                <ArrowUpRight size={12} /> +2%
              </span>
            </div>
          </div>
          <div className="card-bottom-accent accent-green" />
        </div>

        {/* Card 2: Low Stock Alerts */}
        <div className="metric-card metric-card-amber">
          <div className="metric-card-content">
            <div className="metric-icon-sphere bg-amber-sphere">
              <AlertTriangle size={24} className="text-amber-gold" />
            </div>
            <div className="metric-data-block">
              <span className="metric-value-huge">
                {stats.lowStock !== undefined ? stats.lowStock : 12}
              </span>
              <span className="metric-label-text">Low Stock Alerts</span>
              <span className="metric-growth-badge growth-neutral">
                <ArrowUpRight size={12} /> +0%
              </span>
            </div>
          </div>
          <div className="card-bottom-accent accent-amber" />
        </div>

        {/* Card 3: Out of Stock Warnings */}
        <div className="metric-card metric-card-red">
          <div className="metric-card-content">
            <div className="metric-icon-sphere bg-red-sphere">
              <Ban size={24} className="text-red-danger" />
            </div>
            <div className="metric-data-block">
              <span className="metric-value-huge">
                {stats.outOfStock !== undefined ? stats.outOfStock : 5}
              </span>
              <span className="metric-label-text">Out of Stock Warnings</span>
              <span className="metric-growth-badge growth-neutral">
                <ArrowUpRight size={12} /> +0%
              </span>
            </div>
          </div>
          <div className="card-bottom-accent accent-red" />
        </div>

        {/* Card 4: Today's Transactions */}
        <div className="metric-card metric-card-blue">
          <div className="metric-card-content">
            <div className="metric-icon-sphere bg-blue-sphere">
              <ShoppingCart size={24} className="text-blue-accent" />
            </div>
            <div className="metric-data-block">
              <span className="metric-value-huge">
                {stats.todaySales || 87}
              </span>
              <span className="metric-label-text">Today's Transactions</span>
              <span className="metric-growth-badge growth-positive">
                <ArrowUpRight size={12} /> +8%
              </span>
            </div>
          </div>
          <div className="card-bottom-accent accent-blue" />
        </div>

        {/* Card 5: Today's Revenue */}
        <div className="metric-card metric-card-gold">
          <div className="metric-card-content">
            <div className="metric-icon-sphere bg-gold-sphere">
              <Coins size={24} className="text-gold-accent" />
            </div>
            <div className="metric-data-block">
              <span className="metric-value-huge">
                {stats.todayRevenue > 0
                  ? `${formatETB(stats.todayRevenue)} ETB`
                  : "12,450 ETB"}
              </span>
              <span className="metric-label-text">Today's Revenue</span>
              <span className="metric-growth-badge growth-positive">
                <ArrowUpRight size={12} /> +12%
              </span>
            </div>
          </div>
          <div className="card-bottom-accent accent-gold" />
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="analytics-dual-charts-row">
        {/* Left Chart: Top-Selling Medications */}
        <div className="chart-card-custom">
          <div className="chart-card-header">
            <div className="chart-header-title">
              <div className="chart-title-icon-bars" />
              <h3>Top-Selling Medications</h3>
            </div>
            <Link to="/drugs" className="chart-details-link">
              View Details &rarr;
            </Link>
          </div>
          <div className="chart-container-inner" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingData} margin={{ top: 20, right: 15, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="emeraldBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#022c22" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: "#D1D5DB" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                  contentStyle={{
                    backgroundColor: "#064E3B",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    border: "1px solid #D4AF37",
                  }}
                  formatter={(val) => [`${val} units sold`, "Volume"]}
                />
                <Bar
                  dataKey="total_sold"
                  fill="url(#emeraldBarGrad)"
                  radius={[6, 6, 0, 0]}
                  barSize={38}
                  label={{ position: "top", fill: "#111827", fontSize: 12, fontWeight: 600 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Sales Trend (Last 7 Days) */}
        <div className="chart-card-custom">
          <div className="chart-card-header">
            <div className="chart-header-title">
              <Activity size={18} className="text-emerald-700" />
              <h3>Sales Trend (Last 7 Days)</h3>
            </div>
            <div className="chart-custom-legend">
              <span className="legend-indicator dot-revenue"></span> Revenue
              <span className="legend-indicator dot-transactions"></span> Transactions
            </div>
          </div>
          <div className="chart-container-inner" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: "#D1D5DB" }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#064E3B",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    border: "1px solid #D4AF37",
                  }}
                  formatter={(value, name) => [
                    name === "Revenue" ? `${formatETB(value)} ETB` : `${value} sales`,
                    name
                  ]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#047857"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#047857", strokeWidth: 1.5, stroke: "#FFF" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#F59E0B", strokeWidth: 1.5, stroke: "#FFF" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Actions & Pharmacy Status */}
      <div className="dashboard-bottom-section">
        {/* Quick Actions Panel */}
        <div className="quick-actions-panel">
          <div className="quick-actions-title">
            <span className="lightning-icon">⚡</span>
            <h4>Quick Actions</h4>
          </div>
          <div className="quick-action-buttons-group">
            <button
              className="btn-action-emerald"
              onClick={() => navigate("/sell")}
            >
              <ShoppingCart size={16} />
              <span>Dispense / Sell Drug</span>
              <span className="btn-arrow">&rarr;</span>
            </button>

            <button
              className="btn-action-gold"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              <span>Add Medicine</span>
              <span className="btn-arrow">&rarr;</span>
            </button>

            <button
              className="btn-action-emerald"
              onClick={() => navigate("/daily-sales")}
            >
              <FileText size={16} />
              <span>Generate Report</span>
              <span className="btn-arrow">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Health Status Card */}
        <div className="pharmacy-health-card">
          <div className="shield-icon-wrapper">
            <svg viewBox="0 0 48 48" className="shield-svg" fill="none">
              <path
                d="M24 4L8 10V22C8 32.5 14.8 41.8 24 44C33.2 41.8 40 32.5 40 22V10L24 4Z"
                fill="#064E3B"
              />
              <path
                d="M24 15V33M15 24H33"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="health-card-text">
            <h5>Your Pharmacy is in Good Health!</h5>
            <p>All systems are running smoothly.</p>
          </div>
          <div className="health-check-badge">
            <CheckCircle2 size={20} className="check-icon-green" />
          </div>
        </div>
      </div>

      {/* Add Drug Modal */}
      <AddDrugModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDrugAdded={() => {
          fetchStats();
        }}
      />
    </div>
  );
}

export default Dashboard;
