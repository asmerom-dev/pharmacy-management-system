import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  ArrowRight,
  Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setSubmitting(true);
      await login(username.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify and try again.");
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
            alt="Eyerus Pharmacy Logo"
            className="eyerus-logo-badge-img"
          />
        </div>

        {/* Brand Header */}
        <div className="eyerus-brand-title-wrap">
          <h1 className="eyerus-main-title">
            <span className="title-white">Eyerus </span>
            <span className="title-gold">Pharmacy</span>
          </h1>

          <div className="eyerus-subtitle-row">
            <span className="sub-gold-line" />
            <span className="sub-text">Owner & Pharmacist Access Portal</span>
            <span className="sub-gold-line" />
          </div>
        </div>

        {/* Login Card with 3D Pills Accent on Top */}
        <div className="eyerus-card-outer">
          {/* 3D Medicine Bottle & Pills Accent sitting on top edge */}
          <div className="eyerus-pills-accent-wrap">
            <img
              src="/pills-accent.png"
              alt="Medicine Bottle & Pills"
              className="eyerus-pills-accent-img"
            />
          </div>

          <div className="eyerus-card-inner">
            {/* Error Alert */}
            {error && (
              <div className="eyerus-error-banner">
                <AlertCircle size={17} className="text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="eyerus-form">
              {/* Username Field */}
              <div className="eyerus-input-wrap">
                <User size={20} className="eyerus-input-icon-gold" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="eyerus-input-wrap">
                <Lock size={20} className="eyerus-input-icon-gold" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

              {/* Remember this device Checkbox */}
              <div className="eyerus-remember-row">
                <label className="eyerus-custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="eyerus-checkbox-custom">
                    {rememberMe && <Check size={14} strokeWidth={3.5} className="text-black" />}
                  </span>
                  <span className="remember-text">Remember this device</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="eyerus-btn-signin"
                disabled={submitting}
              >
                <Lock size={19} className="btn-lock-icon" />
                <span className="btn-text">
                  {submitting ? "Signing In..." : "Sign In"}
                </span>
                <ArrowRight size={20} className="btn-arrow-icon" />
              </button>
            </form>

            {/* Bottom Secure Access Divider */}
            <div className="eyerus-secure-footer">
              <span className="secure-line" />
              <div className="secure-badge">
                <div className="shield-icon-wrap">
                  <Shield size={16} className="shield-icon-gold" />
                  <Lock size={9} className="shield-inner-lock" />
                </div>
                <span>Secure Access</span>
              </div>
              <span className="secure-line" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
