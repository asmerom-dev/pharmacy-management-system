import { useState } from "react";

function DailySales() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState(false);

  // Fetch today's daily sales
  const fetchDailySales = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sales/daily");
      const data = await response.json();
      setSales(data.sales);
      setSummary(data.summary);
      setShowData(true);
    } catch (error) {
      console.log("Error fetching daily sales:", error);
    }
    setLoading(false);
  };

  // Format the time from the sale_date
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>📅 Daily Sales</h1>
        <p>View all sales made today — click the button to load data.</p>
      </div>

      {/* Daily Data Button */}
      <div className="toolbar">
        <button className="btn btn-secondary" onClick={fetchDailySales}>
          📊 Daily Data
        </button>
      </div>

      {/* Loading State */}
      {loading && <div className="loading">Loading today's sales...</div>}

      {/* Sales Data */}
      {showData && !loading && (
        <div className="card">
          {/* Summary Cards */}
          {summary && (
            <div className="daily-summary">
              <div className="summary-item">
                <h4>{sales.length}</h4>
                <p>Total Transactions</p>
              </div>
              <div className="summary-item">
                <h4>{summary.totalItems}</h4>
                <p>Items Sold</p>
              </div>
              <div className="summary-item">
                <h4>${summary.totalRevenue.toFixed(2)}</h4>
                <p>Total Revenue</p>
              </div>
            </div>
          )}

          {/* Sales Table */}
          {sales.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Drug Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Price</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={sale.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 500 }}>{sale.drug_name}</td>
                    <td>{sale.quantity}</td>
                    <td>${parseFloat(sale.unit_price).toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: "#1b5e20" }}>
                      ${parseFloat(sale.total_price).toFixed(2)}
                    </td>
                    <td>{formatTime(sale.sale_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No sales recorded today yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Initial State - before clicking the button */}
      {!showData && !loading && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>Click "Daily Data" button to see today's sales</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailySales;
