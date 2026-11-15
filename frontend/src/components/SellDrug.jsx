import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../api";
import { useSettings } from "../context/SettingsContext";
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
  Phone,
  MessageSquare,
  Copy,
  Check,
  X,
  AlertCircle
} from "lucide-react";

function SellDrug() {
  const { settings } = useSettings();
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [copiedSMS, setCopiedSMS] = useState(false);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/drugs");
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
        customer_name: customerName ? `${customerName.trim()}${customerPhone ? ` (${customerPhone.trim()})` : ""}` : "Walk-in Customer",
        items: cart.map((item) => ({
          drug_id: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await apiFetch("/api/sales", {
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

      // Create Receipt Card Data
      const completedReceipt = {
        receiptNumber: `EP-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }),
        customerName: customerName.trim() || "Walk-in Customer",
        customerPhone: customerPhone.trim(),
        items: cart.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          total: i.price * i.quantity
        })),
        subtotal,
        tax,
        total,
        pharmacyName: settings.pharmacyName || "Eyerus Pharmacy",
        tagline: settings.tagline || "Health Today, Better Tomorrow"
      };

      setReceiptData(completedReceipt);
      setShowReceiptModal(true);

      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      fetchDrugs(); // Refresh stock
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const generateReceiptText = () => {
    if (!receiptData) return "";
    return [
      `🧾 ${receiptData.pharmacyName.toUpperCase()}`,
      `${receiptData.tagline}`,
      `Receipt: #${receiptData.receiptNumber}`,
      `Date: ${receiptData.date}  ${receiptData.time}`,
      `Customer: ${receiptData.customerName}`,
      receiptData.customerPhone ? `Phone: ${receiptData.customerPhone}` : null,
      `--------------------------------`,
      ...receiptData.items.map(
        (it) => `• ${it.name} (x${it.quantity}): ETB ${it.total.toFixed(2)}`
      ),
      `--------------------------------`,
      `Subtotal: ETB ${receiptData.subtotal.toFixed(2)}`,
      `Tax (15%): ETB ${receiptData.tax.toFixed(2)}`,
      `TOTAL: ETB ${receiptData.total.toFixed(2)}`,
      `--------------------------------`,
      `Thank you for choosing ${receiptData.pharmacyName}!`,
      `Get well soon 🌿`
    ].filter(Boolean).join("\n");
  };

  const handleSendSMS = () => {
    if (!receiptData) return;
    const text = generateReceiptText();
    const phone = receiptData.customerPhone ? receiptData.customerPhone.replace(/[^0-9+]/g, "") : "";
    const smsUrl = `sms:${phone}?body=${encodeURIComponent(text)}`;
    window.open(smsUrl, "_blank");
  };

  const handleCopySMS = () => {
    const text = generateReceiptText();
    navigator.clipboard.writeText(text);
    setCopiedSMS(true);
    setTimeout(() => setCopiedSMS(false), 2500);
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

          {/* Customer Phone Number for SMS */}
          <div className="pos-customer-input-box" style={{ marginTop: "10px" }}>
            <label>Customer Phone Number (for SMS Receipt)</label>
            <div className="pos-customer-input-wrapper">
              <Phone size={16} className="input-user-icon" />
              <input
                type="tel"
                placeholder="e.g. 0911234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
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

          {/* Checkout & Generate Receipt Button */}
          <button
            className="btn-checkout-print"
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckoutAndPrint}
          >
            <ShoppingCart size={18} />
            <span>
              {isProcessing ? "Processing Sale..." : "Checkout & Generate Receipt"}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE SMALL RECEIPT CARD & SMS MODAL
          ========================================================================= */}
      {showReceiptModal && receiptData && (
        <div className="receipt-modal-backdrop">
          <div className="receipt-modal-dialog">
            {/* Modal Top Bar */}
            <div className="receipt-modal-header no-print">
              <div className="receipt-modal-title">
                <CheckCircle2 size={20} className="text-emerald-500" />
                <span>Sale Completed Successfully</span>
              </div>
              <button
                className="btn-close-receipt-modal"
                onClick={() => setShowReceiptModal(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* The Actual Small Printable Receipt Card */}
            <div id="printable-receipt-card" className="receipt-thermal-card">
              <div className="receipt-card-header">
                <div className="receipt-cross-symbol">🌿</div>
                <h2 className="receipt-pharmacy-name">{receiptData.pharmacyName}</h2>
                <p className="receipt-pharmacy-tagline">{receiptData.tagline}</p>
                <div className="receipt-divider-dash" />
                
                <div className="receipt-details-list">
                  <div className="receipt-detail-row">
                    <span>Receipt #:</span>
                    <strong>{receiptData.receiptNumber}</strong>
                  </div>
                  <div className="receipt-detail-row">
                    <span>Date & Time:</span>
                    <span>{receiptData.date} {receiptData.time}</span>
                  </div>
                  <div className="receipt-detail-row">
                    <span>Customer:</span>
                    <strong>{receiptData.customerName}</strong>
                  </div>
                  {receiptData.customerPhone && (
                    <div className="receipt-detail-row">
                      <span>Phone:</span>
                      <strong>{receiptData.customerPhone}</strong>
                    </div>
                  )}
                </div>
                <div className="receipt-divider-dash" />
              </div>

              {/* Items Purchased Table */}
              <table className="receipt-items-table">
                <thead>
                  <tr>
                    <th align="left">Medication</th>
                    <th align="center">Qty</th>
                    <th align="right">Price</th>
                    <th align="right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="receipt-item-name">{item.name}</td>
                      <td align="center">x{item.quantity}</td>
                      <td align="right">{item.price.toFixed(2)}</td>
                      <td align="right"><strong>{item.total.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-divider-dash" />

              {/* Financial Totals */}
              <div className="receipt-financial-totals">
                <div className="receipt-detail-row">
                  <span>Subtotal:</span>
                  <span>ETB {receiptData.subtotal.toFixed(2)}</span>
                </div>
                <div className="receipt-detail-row">
                  <span>Tax (15% VAT):</span>
                  <span>ETB {receiptData.tax.toFixed(2)}</span>
                </div>
                <div className="receipt-grand-total-row">
                  <span>GRAND TOTAL:</span>
                  <span>ETB {receiptData.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="receipt-divider-dash" />

              {/* Friendly Closing Footer */}
              <div className="receipt-card-footer">
                <p className="footer-thanks">Thank you for visiting {receiptData.pharmacyName}!</p>
                <p className="footer-wish">Get well soon! 💊✨</p>
                <div className="receipt-barcode-visual">
                  ||| | ||||| || |||||| | ||| |||| | |||||
                </div>
              </div>
            </div>

            {/* Actions for User (Hidden during Print) */}
            <div className="receipt-modal-actions-panel no-print">
              <button
                type="button"
                className="btn-receipt-action btn-print-card"
                onClick={handlePrintSlip}
              >
                <Printer size={18} />
                <span>Print Small Card Slip</span>
              </button>

              <button
                type="button"
                className="btn-receipt-action btn-send-sms"
                onClick={handleSendSMS}
              >
                <MessageSquare size={18} />
                <span>Send via SMS Message</span>
              </button>

              <button
                type="button"
                className="btn-receipt-action btn-copy-sms"
                onClick={handleCopySMS}
              >
                {copiedSMS ? <Check size={18} /> : <Copy size={18} />}
                <span>{copiedSMS ? "Copied SMS Text!" : "Copy Receipt Text"}</span>
              </button>

              <button
                type="button"
                className="btn-receipt-action btn-close-flow"
                onClick={() => setShowReceiptModal(false)}
              >
                <span>New Sale / Done</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellDrug;
