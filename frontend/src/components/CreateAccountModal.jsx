import { useState } from "react";
import {
  X,
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { apiFetch } from "../api";

export default function CreateAccountModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    pharmacyName: "",
    pharmacistName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdUser, setCreatedUser] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.pharmacyName.trim()) {
      setError("Please enter the Pharmacy Store name.");
      return;
    }
    if (!formData.username.trim()) {
      setError("Please choose a username for this pharmacy store.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyName: formData.pharmacyName.trim(),
          pharmacistName: formData.pharmacistName.trim() || "Chief Pharmacist",
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create pharmacy account");
      }

      setCreatedUser({
        pharmacyName: formData.pharmacyName.trim(),
        username: formData.username.trim(),
        token: data.token,
        user: data.user,
      });

      if (onSuccess) {
        onSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToNewStore = () => {
    if (createdUser && createdUser.token) {
      localStorage.setItem("luna_auth_token", createdUser.token);
      localStorage.setItem("luna_auth_user", JSON.stringify(createdUser.user));
      window.location.href = "/";
    }
  };

  const handleResetAndClose = () => {
    setFormData({
      pharmacyName: "",
      pharmacistName: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
    setCreatedUser(null);
    onClose();
  };

  return (
    <div className="modal-backdrop-luxury" onClick={handleResetAndClose}>
      <div
        className="modal-card-luxury create-account-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header-luxury">
          <div className="modal-header-brand">
            <div className="modal-icon-badge-gold">
              <Building2 size={22} className="text-gold-accent" />
            </div>
            <div>
              <h3 className="modal-title-gold">Create Pharmacy Account</h3>
              <p className="modal-subtitle-text">
                Add a new pharmacy store with isolated inventory & sales records
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleResetAndClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success View */}
        {createdUser ? (
          <div className="create-account-success-view">
            <div className="success-icon-pulse">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h4 className="success-title">Account Created Successfully!</h4>
            <p className="success-desc">
              <strong>{createdUser.pharmacyName}</strong> has been registered with its own private database partition.
            </p>

            <div className="created-credentials-card">
              <div className="cred-row">
                <span className="cred-label">Store Name:</span>
                <span className="cred-val">{createdUser.pharmacyName}</span>
              </div>
              <div className="cred-row">
                <span className="cred-label">Username:</span>
                <span className="cred-val highlight-gold">{createdUser.username}</span>
              </div>
              <div className="cred-row">
                <span className="cred-label">Data Privacy:</span>
                <span className="cred-val text-emerald-600 font-medium">
                  <ShieldCheck size={14} className="inline mr-1" />
                  100% Isolated Data
                </span>
              </div>
            </div>

            <div className="success-actions-row">
              <button
                type="button"
                className="btn-modal-switch-tenant"
                onClick={handleSwitchToNewStore}
              >
                <span>Switch to this Pharmacy Now</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={handleResetAndClose}
              >
                Done (Stay Here)
              </button>
            </div>
          </div>
        ) : (
          /* Create Account Form */
          <form onSubmit={handleSubmit} className="modal-form-luxury">
            {error && (
              <div className="form-error-alert">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="modal-form-body-grid">
              {/* Pharmacy Name */}
              <div className="form-group-luxury">
                <label>
                  <Building2 size={15} className="text-gold-accent" />
                  <span>Pharmacy Store Name <strong className="text-red-400">*</strong></span>
                </label>
                <input
                  type="text"
                  name="pharmacyName"
                  placeholder="e.g. Sunrise Pharmacy, Eyerus Central..."
                  value={formData.pharmacyName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Pharmacist / Owner Name */}
              <div className="form-group-luxury">
                <label>
                  <User size={15} className="text-gold-accent" />
                  <span>Pharmacist / Owner Name</span>
                </label>
                <input
                  type="text"
                  name="pharmacistName"
                  placeholder="e.g. Dr. Helen Tadesse"
                  value={formData.pharmacistName}
                  onChange={handleChange}
                />
              </div>

              {/* Username */}
              <div className="form-group-luxury">
                <label>
                  <User size={15} className="text-gold-accent" />
                  <span>Login Username <strong className="text-red-400">*</strong></span>
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username (e.g. sunrise_admin)"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group-luxury">
                <label>
                  <Lock size={15} className="text-gold-accent" />
                  <span>Password (min. 6 characters) <strong className="text-red-400">*</strong></span>
                </label>
                <div className="input-with-eye-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="btn-eye-toggle-inside"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group-luxury">
                <label>
                  <Lock size={15} className="text-gold-accent" />
                  <span>Confirm Password <strong className="text-red-400">*</strong></span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="modal-footer-luxury">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={handleResetAndClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-submit-gold"
                disabled={loading}
              >
                <Sparkles size={16} />
                <span>{loading ? "Creating Store..." : "Create Pharmacy Account"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
