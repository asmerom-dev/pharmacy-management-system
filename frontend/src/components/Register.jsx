import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pharmacyName: "",
    pharmacistName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.pharmacyName.trim() || !formData.username.trim() || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
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
        throw new Error(data.error || "Failed to create account");
      }

      // Save token and new user session
      localStorage.setItem("luna_auth_token", data.token);
      localStorage.setItem("luna_auth_user", JSON.stringify(data.user));

      // Redirect to main dashboard
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="eyerus-login-page">
      {/* Background Ambience Layers */}
      <div className="eyerus-login-bg-overlay" />
      <div className="eyerus-login-golden-glow-top" />
      <div className="eyerus-login-golden-glow-bottom" />

      <div className="eyerus-login-content-flow">
        {/* Top Logo Badge */}
        <div className="eyerus-logo-badge-wrapper">
          <img
            src="/login-logo-badge.png"
            alt="Pharmacy Logo"
            className="eyerus-logo-badge-img"
          />
        </div>

        {/* Brand Header */}
        <div className="eyerus-brand-title-wrap">
          <h1 className="eyerus-main-title">
            <span className="title-white">Pharmacy </span>
            <span className="title-gold">Platform</span>
          </h1>

          <div className="eyerus-subtitle-row">
            <span className="sub-gold-line" />
            <span className="sub-text">Create New Pharmacy Store Account</span>
            <span className="sub-gold-line" />
          </div>
        </div>

        {/* Register Card */}
        <div className="eyerus-card-outer">
          <div className="eyerus-pills-accent-wrap">
            <img
              src="/pills-accent.png"
              alt="Medicine Bottle & Pills"
              className="eyerus-pills-accent-img"
            />
          </div>

          <div className="eyerus-card-inner">
            {error && (
              <div className="eyerus-error-banner">
                <AlertCircle size={17} className="text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="eyerus-form">
              {/* Pharmacy Store Name */}
              <div className="eyerus-input-wrap">
                <Building2 size={20} className="eyerus-input-icon-gold" />
                <input
                  type="text"
                  name="pharmacyName"
                  placeholder="Pharmacy Store Name *"
                  value={formData.pharmacyName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Pharmacist / Owner Name */}
              <div className="eyerus-input-wrap">
                <User size={20} className="eyerus-input-icon-gold" />
                <input
                  type="text"
                  name="pharmacistName"
                  placeholder="Chief Pharmacist / Owner Name"
                  value={formData.pharmacistName}
                  onChange={handleChange}
                />
              </div>

              {/* Username */}
              <div className="eyerus-input-wrap">
                <User size={20} className="eyerus-input-icon-gold" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username *"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>

              {/* Password */}
              <div className="eyerus-input-wrap">
                <Lock size={20} className="eyerus-input-icon-gold" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password (min. 6 characters) *"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="eyerus-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-300" />
                  ) : (
                    <Eye size={20} className="text-gray-300" />
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="eyerus-input-wrap">
                <Lock size={20} className="eyerus-input-icon-gold" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Data Isolation Guarantee badge */}
              <div className="register-data-privacy-badge">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Each store gets its own private inventory, sales & reports</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="eyerus-btn-signin"
                disabled={submitting}
              >
                <Sparkles size={19} className="btn-lock-icon" />
                <span className="btn-text">
                  {submitting ? "Creating Account..." : "Create Store & Launch"}
                </span>
                <ArrowRight size={20} className="btn-arrow-icon" />
              </button>

              {/* Back to Login Link */}
              <div className="eyerus-register-prompt-row">
                <span>Already have a pharmacy account? </span>
                <button
                  type="button"
                  className="eyerus-link-create-store"
                  onClick={() => navigate("/login")}
                >
                  Sign In &rarr;
                </button>
              </div>
            </form>

            {/* Bottom Secure Access Divider */}
            <div className="eyerus-secure-footer">
              <span className="secure-line" />
              <div className="secure-badge">
                <div className="shield-icon-wrap">
                  <Shield size={16} className="shield-icon-gold" />
                  <Lock size={9} className="shield-inner-lock" />
                </div>
                <span>Multi-Store Secure Architecture</span>
              </div>
              <span className="secure-line" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
