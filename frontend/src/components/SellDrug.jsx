import { useState, useEffect } from "react";

function SellDrug() {
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all drugs for the dropdown when component loads
  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      const response = await fetch("/api/drugs");
      const data = await response.json();
      // Only show drugs that have stock available
      setDrugs(data.filter((drug) => drug.stock > 0));
    } catch (error) {
      console.log("Error fetching drugs:", error);
    }
  };

  // Handle the sale submission
  const handleSell = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drug_id: parseInt(selectedDrug),
          quantity: parseInt(quantity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `${data.message} | Remaining stock: ${data.remainingStock}`,
        });
        // Reset form
        setSelectedDrug("");
        setQuantity("");
        // Refresh drugs list to update stock numbers
        fetchDrugs();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to record sale" });
    }

    setLoading(false);
    // Clear message after 4 seconds
    setTimeout(() => setMessage(null), 4000);
  };

  // Find the selected drug to show its info
  const selectedDrugInfo = drugs.find(
    (drug) => drug.id === parseInt(selectedDrug)
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>🛒 Sell Drug</h1>
        <p>
          Record a sale — the stock will automatically decrease when you submit.
        </p>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === "success" ? "✅" : "❌"} {message.text}
        </div>
      )}

      {/* Sale Form */}
      <div className="card">
        <form onSubmit={handleSell} className="form-container">
          <div className="form-group">
            <label>Select Drug</label>
            <select
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
              required
            >
              <option value="">-- Choose a drug --</option>
              {drugs.map((drug) => (
                <option key={drug.id} value={drug.id}>
                  {drug.name} (Stock: {drug.stock}) - ${parseFloat(drug.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Show selected drug info */}
          {selectedDrugInfo && (
            <div
              style={{
                background: "#f8fdf8",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "18px",
                fontSize: "14px",
              }}
            >
              <strong>Selected:</strong> {selectedDrugInfo.name} |{" "}
              <strong>Price:</strong> ${parseFloat(selectedDrugInfo.price).toFixed(2)} |{" "}
              <strong>Available Stock:</strong> {selectedDrugInfo.stock}
            </div>
          )}

          <div className="form-group">
            <label>Quantity to Sell</label>
            <input
              type="number"
              min="1"
              max={selectedDrugInfo ? selectedDrugInfo.stock : 999}
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          {/* Show total price preview */}
          {selectedDrugInfo && quantity > 0 && (
            <div
              style={{
                background: "#e8f5e9",
                padding: "14px 18px",
                borderRadius: "8px",
                marginBottom: "18px",
                fontSize: "16px",
                fontWeight: "600",
                color: "#1b5e20",
              }}
            >
              💰 Total Price: $
              {(parseFloat(selectedDrugInfo.price) * parseInt(quantity)).toFixed(2)}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !selectedDrug || !quantity}
          >
            {loading ? "Processing..." : "💳 Record Sale"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SellDrug;
