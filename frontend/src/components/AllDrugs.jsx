import { useState, useEffect } from "react";

function AllDrugs() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDrugs, setShowDrugs] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);

  // New drug form state
  const [newDrug, setNewDrug] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
  });

  // Fetch all drugs from the backend
  const fetchDrugs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/drugs");
      const data = await response.json();
      setDrugs(data);
      setShowDrugs(true);
    } catch (error) {
      console.log("Error fetching drugs:", error);
      setMessage({ type: "error", text: "Failed to load drugs" });
    }
    setLoading(false);
  };

  // Handle adding a new drug
  const handleAddDrug = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/drugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDrug.name,
          category: newDrug.category,
          price: parseFloat(newDrug.price),
          stock: parseInt(newDrug.stock),
        }),
      });

      if (response.ok) {
        const addedDrug = await response.json();
        setDrugs([...drugs, addedDrug]);
        setNewDrug({ name: "", category: "", price: "", stock: "" });
        setShowAddForm(false);
        setMessage({ type: "success", text: `${addedDrug.name} added successfully!` });
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add drug" });
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  // Delete a drug
  const handleDeleteDrug = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await fetch(`/api/drugs/${id}`, { method: "DELETE" });
      if (response.ok) {
        setDrugs(drugs.filter((drug) => drug.id !== id));
        setMessage({ type: "success", text: `${name} deleted successfully!` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete drug" });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  // Get stock status badge
  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <span className="badge badge-danger">Out of Stock</span>;
    } else if (stock <= 50) {
      return <span className="badge badge-warning">Low Stock ({stock})</span>;
    } else {
      return <span className="badge badge-success">In Stock ({stock})</span>;
    }
  };

  // Filter drugs by search term
  const filteredDrugs = drugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>💊 All Drugs</h1>
        <p>View and manage all medications in your pharmacy inventory.</p>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === "success" ? "✅" : "❌"} {message.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={fetchDrugs}>
            📋 Show All Drugs
          </button>
          {showDrugs && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "✖ Cancel" : "➕ Add New Drug"}
            </button>
          )}
        </div>

        {showDrugs && (
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search drugs by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      </div>

      {/* Add Drug Form (shows when toggled) */}
      {showAddForm && (
        <div className="add-drug-section">
          <h3>➕ Add New Drug to Inventory</h3>
          <form onSubmit={handleAddDrug} className="add-drug-form">
            <div className="form-group">
              <label>Drug Name</label>
              <input
                type="text"
                placeholder="e.g. Amoxicillin 500mg"
                value={newDrug.name}
                onChange={(e) =>
                  setNewDrug({ ...newDrug, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={newDrug.category}
                onChange={(e) =>
                  setNewDrug({ ...newDrug, category: e.target.value })
                }
                required
              >
                <option value="">Select category</option>
                <option value="Antibiotic">Antibiotic</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Gastric">Gastric</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Blood Pressure">Blood Pressure</option>
                <option value="Allergy">Allergy</option>
                <option value="Cholesterol">Cholesterol</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Blood Thinner">Blood Thinner</option>
                <option value="Vitamin">Vitamin</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 12.50"
                value={newDrug.price}
                onChange={(e) =>
                  setNewDrug({ ...newDrug, price: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 100"
                value={newDrug.stock}
                onChange={(e) =>
                  setNewDrug({ ...newDrug, stock: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                ✅ Add Drug
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && <div className="loading">Loading drugs...</div>}

      {/* Drugs Table */}
      {showDrugs && !loading && (
        <div className="card">
          <p style={{ color: "#888", marginBottom: "10px", fontSize: "14px" }}>
            Showing {filteredDrugs.length} of {drugs.length} drugs
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Drug Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrugs.length > 0 ? (
                filteredDrugs.map((drug, index) => (
                  <tr key={drug.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 500 }}>{drug.name}</td>
                    <td>{drug.category}</td>
                    <td>${parseFloat(drug.price).toFixed(2)}</td>
                    <td>{getStockBadge(drug.stock)}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "5px 12px", fontSize: "12px" }}
                        onClick={() => handleDeleteDrug(drug.id, drug.name)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#aaa" }}>
                    No drugs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Initial State - before clicking Show All Drugs */}
      {!showDrugs && !loading && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <p>Click "Show All Drugs" to view your inventory</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllDrugs;
