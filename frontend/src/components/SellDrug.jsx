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
  const [digitalReceiptOption, setDigitalReceiptOption] = useState("skip"); // "skip" | "whatsapp" | "telegram"

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

      // Trigger automatic receipt delivery based on chosen option
      if (digitalReceiptOption === "whatsapp") {
        handleSendWhatsApp(completedReceipt);
      } else if (digitalReceiptOption === "telegram") {
        handleSendTelegram(completedReceipt);
      }

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

  const generateReceiptText = (customData = null) => {
    const data = customData || receiptData;
    if (!data) return "";
    return [
      `🧾 ${data.pharmacyName.toUpperCase()}`,
      `${data.tagline}`,
      `--------------------------------`,
      `Receipt: #${data.receiptNumber}`,
      `Date: ${data.date}  ${data.time}`,
      `Customer: ${data.customerName}`,
      data.customerPhone ? `Phone: ${data.customerPhone}` : null,
      `--------------------------------`,
      ...data.items.map(
        (it) => `• ${it.name} (x${it.quantity}): ETB ${it.total.toFixed(2)}`
      ),
      `--------------------------------`,
      `Subtotal: ETB ${data.subtotal.toFixed(2)}`,
      `Tax (15%): ETB ${data.tax.toFixed(2)}`,
      `GRAND TOTAL: ETB ${data.total.toFixed(2)}`,
      `--------------------------------`,
      `Thank you for choosing ${data.pharmacyName}!`,
      `Get well soon 🌿`
    ].filter(Boolean).join("\n");
  };

  const formatPhoneForWhatsApp = (rawPhone) => {
    if (!rawPhone) return "";
    let clean = rawPhone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "251" + clean.slice(1);
    }
    return clean;
  };

  const handleSendWhatsApp = (customData = null) => {
    const data = customData || receiptData;
    if (!data) return;
    const text = generateReceiptText(data);
    const phone = formatPhoneForWhatsApp(data.customerPhone);
    const waUrl = phone 
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const handleSendTelegram = (customData = null) => {
    const data = customData || receiptData;
    if (!data) return;
    const text = generateReceiptText(data);
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(text)}`;
    window.open(tgUrl, "_blank");
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

          {/* Customer Phone Number */}
          <div className="pos-customer-input-box" style={{ marginTop: "10px" }}>
            <label>Customer Phone Number (for WhatsApp / Telegram Receipt)</label>
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

          {/* Section: Digital Receipt */}
          <div className="pos-digital-receipt-box">
            <label className="pos-field-heading">Digital Receipt</label>
            <div className="pos-digital-options-list">
              <button
                type="button"
                className={`pos-digital-opt-pill ${digitalReceiptOption === "skip" ? "active-skip" : ""}`}
                onClick={() => setDigitalReceiptOption("skip")}
              >
                <span className="pill-dot">⚪</span>
                <span className="pill-label">Skip Digital Receipt</span>
              </button>

              <button
                type="button"
                className={`pos-digital-opt-pill ${digitalReceiptOption === "whatsapp" ? "active-whatsapp" : ""}`}
                onClick={() => setDigitalReceiptOption("whatsapp")}
              >
                <span className="pill-dot">🟢</span>
                <span className="pill-label">Send via WhatsApp</span>
              </button>

              <button
                type="button"
                className={`pos-digital-opt-pill ${digitalReceiptOption === "telegram" ? "active-telegram" : ""}`}
                onClick={() => setDigitalReceiptOption("telegram")}
              >
                <span className="pill-dot">🔵</span>
                <span className="pill-label">Send via Telegram</span>
              </button>
            </div>

            {digitalReceiptOption === "whatsapp" && (
              <p className="pos-digital-hint hint-wa">
                🟢 Will automatically open WhatsApp with receipt ready to send.
              </p>
            )}
            {digitalReceiptOption === "telegram" && (
              <p className="pos-digital-hint hint-tg">
                🔵 Will automatically open Telegram with receipt ready to send.
              </p>
            )}
            {digitalReceiptOption === "skip" && (
              <p className="pos-digital-hint hint-skip">
                ⚪ Records sale and inventory only — no message sent.
              </p>
            )}
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

          {/* Checkout & Sale Button */}
          <button
            className={`btn-checkout-print ${
              digitalReceiptOption === "whatsapp"
                ? "btn-checkout-whatsapp"
                : digitalReceiptOption === "telegram"
                ? "btn-checkout-telegram"
                : "btn-checkout-skip"
            }`}
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckoutAndPrint}
          >
            <ShoppingCart size={18} />
            <span>
              {isProcessing
                ? "Processing Sale..."
                : digitalReceiptOption === "whatsapp"
                ? "Complete Sale & Send WhatsApp"
                : digitalReceiptOption === "telegram"
                ? "Complete Sale & Send Telegram"
                : "Complete Sale (No Message)"}
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
                className="btn-receipt-action btn-send-whatsapp"
                onClick={handleSendWhatsApp}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.044-1.93-.464-1.428-.587-2.336-2.029-2.408-2.123-.07-.095-.568-.756-.568-1.442 0-.687.359-1.025.487-1.166.128-.142.28-.178.373-.178.094 0 .188.001.27.006.088.004.204-.033.319.245.118.283.403.985.438 1.056.036.071.059.154.012.247-.047.094-.07.153-.141.236-.07.082-.148.183-.211.246-.071.071-.144.148-.063.289.083.141.369.608.791.984.545.485.998.636 1.14.707.142.071.224.06.308-.035.083-.095.355-.413.449-.554.095-.142.189-.118.319-.071.13.047.827.39 97.461.142.071.236.106.271.165.035.059.035.341-.109.746z"/>
                </svg>
                <span>Send via WhatsApp</span>
              </button>

              <button
                type="button"
                className="btn-receipt-action btn-send-telegram"
                onClick={() => handleSendTelegram()}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                <span>Send via Telegram</span>
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
