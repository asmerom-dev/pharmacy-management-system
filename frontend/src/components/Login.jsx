import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles
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
      setError("Please enter both your username and password.");
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
    <div className="login-page-container">
      {/* Background Decorative Glow */}
      <div className="login-bg-glow-top" />
      <div className="login-bg-glow-bottom" />

      <div className="login-card-wrapper">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-logo-circle">
            <svg viewBox="0 0 44 44" className="brand-cross-svg" fill="none">
              <path
                d="M16 4C16 2.89543 16.8954 2 18 2H26C27.1046 2 28 2.89543 28 4V16H40C41.1046 16 42 16.8954 42 18V26C42 27.1046 41.1046 28 40 28H28V40C28 41.1046 27.1046 42 26 42H18C16.8954 42 16 41.1046 16 40V28H4C2.89543 28 2 27.1046 2 26V18C2 16.8954 2.89543 16 4 16H16V4Z"
                fill="url(#loginGoldGrad)"
              />
              <path
                d="M22 10C24 14 31 16 33 24C34 28 30 33 25 33C21 33 17 30 18 26C19 22 21 16 22 10Z"
                fill="#10B981"
              />
              <path
                d="M22 18C24 22 28 25 29 28"
                stroke="#047857"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="loginGoldGrad" x1="2" y1="2" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FDE68A" />
                  <stop offset="0.4" stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#D97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="login-app-title">Luna Pharmacy</h1>
          <p className="login-app-subtitle">Owner & Pharmacist Access Portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error-banner">
            <AlertCircle size={18} className="text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form-body">
          <div className="login-input-group">
            <label>Username / Email</label>
            <div className="login-input-field-wrap">
              <User size={18} className="login-field-icon" />
              <input
                type="text"
                placeholder="Enter username (e.g. admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label>Master Password</label>
            <div className="login-input-field-wrap">
              <Lock size={18} className="login-field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-options-row">
            <label className="remember-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={submitting}
          >
            <Lock size={17} />
            <span>{submitting ? "Signing In..." : "Sign In to Dashboard"}</span>
            <ArrowRight size={17} className="btn-login-arrow" />
          </button>
        </form>

        {/* Security & Default Info */}
        <div className="login-footer-info">
          <div className="login-security-tag">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>End-to-End Encrypted Session • Owner Only</span>
          </div>
          <div className="login-default-hint">
            <span>Default Access:</span> <code>admin</code> / <code>luna1234</code>
            <p className="hint-sub">You can customize your username and password anytime in Settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
