import { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  Pill,
  User,
  AlertCircle
} from "lucide-react";

function SellDrug() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/drugs");
      if (res.ok) {
        const data = await res.json();
        setDrugs(data);
      }
    } catch (err) {
      console.error("Error fetching drugs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  const addToCart = (drug) => {
    setSuccessMessage("");
    setErrorMessage("");

    if (drug.stock <= 0) {
      setErrorMessage(`${drug.name} is out of stock!`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === drug.id);
      if (existing) {
        if (existing.quantity >= drug.stock) {
          setErrorMessage(`Cannot exceed available stock (${drug.stock}) for ${drug.name}`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === drug.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: drug.id,
            name: drug.name,
            price: parseFloat(drug.price),
            stock: drug.stock,
            quantity: 1,
          },
        ];
      }
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock) {
              setErrorMessage(`Only ${item.stock} in stock for ${item.name}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax;

  const handleCheckoutAndPrint = async () => {
    if (cart.length === 0) {
      setErrorMessage("Please add at least one medication to the bill.");
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage("");

      const payload = {
        customer_name: customerName || "Walk-in Customer",
        items: cart.map((item) => ({
          drug_id: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process sale");
      }

      setSuccessMessage(
        `Sale completed successfully for ETB ${total.toFixed(2)}!`
      );

      // Print receipt
      setTimeout(() => {
        window.print();
      }, 300);

      clearCart();
      setCustomerName("");
      fetchDrugs(); // Refresh stock
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Highlighting matching search characters
  const renderHighlightedName = (name, query) => {
    if (!query) return name;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = name.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="search-highlight-mark">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Alphabetical and Prioritized Search Filtering
  const filteredAndSortedDrugs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return drugs
      .filter((drug) => {
        if (!q) return true;
        return drug.name.toLowerCase().includes(q) || drug.category.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (q) {
          const aStarts = a.name.toLowerCase().startsWith(q);
          const bStarts = b.name.toLowerCase().startsWith(q);
          // If a starts with query and b doesn't, a comes first
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
        }
        // Default alphabetical sort (A to Z)
        return a.name.localeCompare(b.name);
      });
  }, [drugs, searchTerm]);

  return (
    <div className="pos-view-page">
      {/* Header Bar */}
      <div className="pos-top-header">
        <div className="pos-heading-wrapper">
          <div className="pos-icon-badge">
            <ShoppingCart size={22} className="text-white" />
          </div>
          <div>
            <h2 className="main-page-title">Sell Medicine (POS)</h2>
            <p className="main-page-subtitle">Fast & Easy Billing with Smart Alphabetical Search</p>
          </div>
        </div>

        <button
          className="btn-print-pos-tool"
          onClick={() => window.print()}
          title="Print POS View"
        >
          <Printer size={18} />
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="pos-alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="pos-alert alert-danger">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 2-Column Responsive POS Workspace */}
      <div className="pos-split-grid">
        {/* Left Side: Drug Selection Catalog */}
        <div className="pos-catalog-panel">
          {/* Search Box */}
          <div className="pos-search-box">
            <Search size={18} className="pos-search-icon" />
            <input
              type="text"
              placeholder="Search medicine (e.g. type 'A' for Amoxicillin, Aspirin)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-clear-search-x"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Medicines List */}
          <div className="pos-medicines-list">
            {loading ? (
              <div className="pos-loading-state">Loading medicines...</div>
            ) : filteredAndSortedDrugs.length === 0 ? (
              <div className="pos-loading-state">
                No medicines found matching "{searchTerm}".
              </div>
            ) : (
              filteredAndSortedDrugs.map((drug) => (
                <div key={drug.id} className="pos-drug-card-item">
                  <div className="pos-card-left-info">
                    <div className="pos-pill-capsule-icon">
                      <svg viewBox="0 0 32 32" className="pos-pill-svg" fill="none">
                        <g transform="rotate(-45 16 16)">
                          <rect x="8" y="10" width="8" height="12" rx="4" fill="#3B82F6" />
                          <rect x="16" y="10" width="8" height="12" rx="4" fill="#10B981" />
                        </g>
                      </svg>
                    </div>
                    <div className="pos-drug-title-group">
                      <h4 className="pos-drug-name">
                        {renderHighlightedName(drug.name, searchTerm)}
                      </h4>
                      <div className="pos-meta-line">
                        <span className="pos-category-sub">{drug.category}</span>
                        <span
                          className={`pos-stock-tag ${
                            drug.stock === 0
                              ? "stock-tag-out"
                              : drug.stock <= 20
                              ? "stock-tag-low"
                              : "stock-tag-in"
                          }`}
                        >
                          {drug.stock === 0
                            ? "Out of Stock"
                            : `In Stock: ${drug.stock}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pos-card-right-action">
                    <span className="pos-price-label">
                      ETB {parseFloat(drug.price).toFixed(2)}
                    </span>
                    <button
                      className="btn-add-pos-plus"
                      onClick={() => addToCart(drug)}
                      disabled={drug.stock <= 0}
                      title={
                        drug.stock <= 0 ? "Out of Stock" : "Add to current bill"
                      }
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Current Bill Panel */}
        <div className="pos-bill-panel">
          <div className="pos-bill-header">
            <h3>Current Bill</h3>
            {cart.length > 0 && (
              <button className="btn-clear-bill" onClick={clearCart}>
                <Trash2 size={14} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Cart Table */}
          <div className="pos-cart-table-wrapper">
            {cart.length === 0 ? (
              <div className="pos-cart-empty">
                <ShoppingCart size={36} className="empty-cart-icon" />
                <p>Your bill is empty</p>
                <span>Click (+) on any medication to add it</span>
              </div>
            ) : (
              <table className="pos-cart-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th>Price</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td className="cart-item-name">
                        <Pill size={14} className="cart-pill-icon" />
                        <span className="cart-item-text">{item.name}</span>
                      </td>
                      <td className="cart-item-qty">
                        <div className="qty-counter-control">
                          <button
                            className="btn-qty-step"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="qty-number-label">
                            {item.quantity}
                          </span>
                          <button
                            className="btn-qty-step"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="cart-price-cell">
                        ETB {item.price.toFixed(2)}
                      </td>
                      <td className="cart-total-cell">
                        ETB {(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Customer Name */}
          <div className="pos-customer-input-box">
            <label>Customer Name (Optional)</label>
            <div className="pos-customer-input-wrapper">
              <User size={16} className="input-user-icon" />
              <input
                type="text"
                placeholder="Enter customer name..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          {/* Totals & Calculations */}
          <div className="pos-financial-breakdown">
            <div className="breakdown-line">
              <span>Subtotal:</span>
              <span className="font-semibold">ETB {subtotal.toFixed(2)}</span>
            </div>
            <div className="breakdown-line">
              <span>Tax (15%):</span>
              <span className="font-semibold">ETB {tax.toFixed(2)}</span>
            </div>
            <div className="pos-gold-total-banner">
              <span className="gold-banner-label">Total:</span>
              <span className="gold-banner-amount">
                ETB {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout & Print Button */}
          <button
            className="btn-checkout-print"
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckoutAndPrint}
          >
            <ShoppingCart size={18} />
            <span>
              {isProcessing ? "Processing Sale..." : "Checkout & Print"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellDrug;
