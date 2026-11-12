import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  // State for dashboard stats
  const [stats, setStats] = useState({
    totalDrugs: 0,
    outOfStock: 0,
    todaySales: 0,
    todayRevenue: 0,
  });

  // State for top selling drugs chart
  const [topDrugs, setTopDrugs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data when component loads
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats and top drugs at the same time
      const [statsRes, topRes] = await Promise.all([
        fetch("/api/drugs/stats/dashboard"),
        fetch("/api/sales/top"),
      ]);

      const statsData = await statsRes.json();
      const topData = await topRes.json();

      setStats(statsData);
      setTopDrugs(
        topData.map((drug) => ({
          name: drug.name.length > 15 ? drug.name.substring(0, 15) + "..." : drug.name,
          totalSold: parseInt(drug.total_sold),
        }))
      );

      setLoading(false);
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>📊 Owner Dashboard</h1>
        <p>Welcome back! Here is your pharmacy overview for today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">💊</div>
          <div className="stat-info">
            <h3>{stats.totalDrugs}</h3>
            <p>Total Drugs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">⚠️</div>
          <div className="stat-info">
            <h3>{stats.outOfStock}</h3>
            <p>Out of Stock</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">🛒</div>
          <div className="stat-info">
            <h3>{stats.todaySales}</h3>
            <p>Today's Sales</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">💰</div>
          <div className="stat-info">
            <h3>${stats.todayRevenue.toFixed(2)}</h3>
            <p>Today's Revenue</p>
          </div>
        </div>
      </div>

      {/* Top Selling Drugs Chart */}
      <div className="chart-container">
        <h2>🏆 Top Selling Drugs (Most Bought)</h2>
        {topDrugs.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topDrugs} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-20}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="totalSold"
                fill="#2e7d32"
                radius={[6, 6, 0, 0]}
                name="Quantity Sold"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <p>No sales data yet. Start selling to see the chart!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
