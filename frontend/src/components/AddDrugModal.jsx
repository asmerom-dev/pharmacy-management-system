import { useState } from "react";
import { apiFetch } from "../api";
import { X, Pill, Save, Calendar, Tag, DollarSign, Layers } from "lucide-react";

function AddDrugModal({ isOpen, onClose, onDrugAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const categories = [
    "Pain Reliever",
    "Antibiotic",
    "Gastric",
    "Diabetes",
    "Blood Pressure",
    "Allergy",
    "Blood Thinner",
    "Vitamin",
    "Respiratory",
    "Cholesterol"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.category || !formData.price || formData.stock === "") {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch("/api/drugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
          expiry_date: formData.expiry_date,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add medication");
      }

      const newDrug = await res.json();
      if (onDrugAdded) onDrugAdded(newDrug);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-icon">
              <Pill size={18} />
            </span>
            <h3>Add New Drug</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="modal-body-form">
          <div className="modal-layout">
            {/* Left 3D Illustration Card */}
            <div className="modal-illustration-card">
              <div className="med-illustration-wrapper">
                <svg viewBox="0 0 160 160" className="med-art-svg" fill="none">
                  <circle cx="80" cy="80" r="72" fill="#E8F5E9" opacity="0.6" />
                  {/* Bottle */}
                  <rect x="35" y="55" width="46" height="70" rx="8" fill="#10B981" />
                  <rect x="42" y="42" width="32" height="15" rx="4" fill="#047857" />
                  <rect x="39" y="36" width="38" height="8" rx="3" fill="#D4AF37" />
                  <rect x="45" y="72" width="26" height="36" rx="4" fill="#FFFFFF" opacity="0.9" />
                  <path d="M58 82V98M50 90H66" stroke="#047857" strokeWidth="4" strokeLinecap="round" />
                  
                  {/* Small Syrup Bottle */}
                  <rect x="90" y="65" width="40" height="60" rx="8" fill="#3B82F6" opacity="0.9" />
                  <rect x="96" y="54" width="28" height="13" rx="4" fill="#1D4ED8" />
                  <rect x="93" y="48" width="34" height="8" rx="3" fill="#F59E0B" />
                  <rect x="98" y="80" width="24" height="30" rx="4" fill="#FFFFFF" opacity="0.9" />
                  <path d="M110 88V102M103 95H117" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />

                  {/* Blister pack */}
                  <g transform="translate(48, 115) rotate(-12)">
                    <rect x="0" y="0" width="70" height="28" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
                    <ellipse cx="14" cy="14" rx="8" ry="6" fill="#F59E0B" />
                    <ellipse cx="35" cy="14" rx="8" ry="6" fill="#F59E0B" />
                    <ellipse cx="56" cy="14" rx="8" ry="6" fill="#10B981" />
                  </g>
                </svg>
                <p className="med-art-caption">Medicine Catalog System</p>
              </div>
            </div>

            {/* Right Form Fields */}
            <div className="modal-fields-column">
              {error && <div className="modal-error-banner">{error}</div>}

              <div className="form-row-split">
                <div className="form-group-custom">
                  <label>
                    Drug Name <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter drug name..."
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label>
                    Category <span className="req-star">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-split">
                <div className="form-group-custom">
                  <label>
                    Unit Price (ETB) <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price..."
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label>
                    Stock Quantity <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Enter quantity..."
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom full-width">
                <label>
                  Expiry Date <span className="req-star">*</span>
                </label>
                <div className="input-with-icon">
                  <Calendar size={16} className="field-icon" />
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="modal-footer-actions">
            <button
              type="button"
              className="btn-cancel-modal"
              onClick={onClose}
              disabled={loading}
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn-save-modal"
              disabled={loading}
            >
              <Save size={16} />
              <span>{loading ? "Saving..." : "Save Drug"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDrugModal;
