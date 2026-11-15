import { useState, useRef } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Shield,
  User,
  Camera,
  Trash2,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Lock,
  KeyRound,
  AlertCircle
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";

function Settings() {
  const { settings, updateSettings } = useSettings();
  const { changePassword } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    pharmacyName: settings.pharmacyName || "Eyerus Pharmacy",
    tagline: settings.tagline || "Health Today, Better Tomorrow",
    pharmacistName: settings.pharmacistName || "Eyerus Gebremariam",
    pharmacistRole: settings.pharmacistRole || "Chief Pharmacist",
    pharmacistPhoto: settings.pharmacistPhoto || "",
    theme: settings.theme || "light",
    currency: settings.currency || "ETB",
    taxRate: settings.taxRate || 15,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password change state
  const [pwData, setPwData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image file must be under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, pharmacistPhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, pharmacistPhoto: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleThemeSelect = (selectedTheme) => {
    setFormData((prev) => ({ ...prev, theme: selectedTheme }));
    updateSettings({ theme: selectedTheme });
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!pwData.currentPassword || !pwData.newPassword) {
      setPwError("Please enter both current and new password.");
      return;
    }

    if (pwData.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }

    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    try {
      setPwSubmitting(true);
      await changePassword(pwData.currentPassword, pwData.newPassword);
      setPwSuccess("Master password updated successfully!");
      setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err) {
      setPwError(err.message || "Failed to update password.");
    } finally {
      setPwSubmitting(false);
    }
  };

  return (
    <div className="settings-view-page">
      <div className="page-intro-header">
        <div className="intro-title-wrapper">
          <div className="pulse-icon-gold">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="main-page-title">Settings & Customization</h2>
            <p className="main-page-subtitle">
              Configure your pharmacy branding, theme, pharmacist profile, security, and financial preferences
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="pos-alert alert-success settings-alert-anim">
          <CheckCircle2 size={18} />
          <span>All settings & tagline updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="settings-form-layout">
        {/* Section 1: Appearance & Theme */}
        <div className="settings-section-card">
          <div className="settings-section-header">
            <Sparkles size={18} className="text-gold-accent" />
            <h4>Appearance & Theme</h4>
          </div>

          <div className="theme-selection-grid">
            {/* Light Mode Card */}
            <div
              className={`theme-option-box ${formData.theme === "light" ? "theme-option-selected" : ""}`}
              onClick={() => handleThemeSelect("light")}
            >
              <div className="theme-preview-pill light-preview">
                <Sun size={24} className="text-amber-500" />
              </div>
              <div className="theme-label-group">
                <span className="theme-title">Light Emerald Mode</span>
                <span className="theme-desc">Cream ivory background with luxury gold accents</span>
              </div>
              <div className="theme-radio-dot" />
            </div>

            {/* Dark Mode Card */}
            <div
              className={`theme-option-box ${formData.theme === "dark" ? "theme-option-selected" : ""}`}
              onClick={() => handleThemeSelect("dark")}
            >
              <div className="theme-preview-pill dark-preview">
                <Moon size={24} className="text-emerald-400" />
              </div>
              <div className="theme-label-group">
                <span className="theme-title">Midnight Emerald (Dark)</span>
                <span className="theme-desc">Deep charcoal & emerald for low-light environments</span>
              </div>
              <div className="theme-radio-dot" />
            </div>
          </div>
        </div>

        {/* Section 2: Pharmacist Profile & Avatar */}
        <div className="settings-section-card">
          <div className="settings-section-header">
            <User size={18} className="text-emerald-700" />
            <h4>Pharmacist Profile & Photo</h4>
          </div>

          <div className="profile-upload-row">
            <div className="profile-avatar-large">
              {formData.pharmacistPhoto ? (
                <img
                  src={formData.pharmacistPhoto}
                  alt="Pharmacist Profile"
                  className="avatar-large-img"
                />
              ) : (
                <div className="avatar-large-placeholder">
                  <User size={40} className="text-emerald-600" />
                </div>
              )}
            </div>

            <div className="profile-actions-column">
              <h5>Pharmacist Avatar</h5>
              <p className="profile-photo-hint">
                Upload a professional headshot (JPG, PNG or WEBP, max 2MB). This displays on your sidebar profile card.
              </p>

              <div className="profile-photo-btn-group">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  className="btn-upload-photo"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Camera size={16} />
                  <span>{formData.pharmacistPhoto ? "Change Photo" : "Upload Photo"}</span>
                </button>

                {formData.pharmacistPhoto && (
                  <button
                    type="button"
                    className="btn-remove-photo"
                    onClick={handleRemovePhoto}
                  >
                    <Trash2 size={16} />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="settings-fields-group" style={{ marginTop: "18px" }}>
            <div className="form-row-split">
              <div className="form-group-custom">
                <label>Chief Pharmacist Name</label>
                <input
                  type="text"
                  name="pharmacistName"
                  value={formData.pharmacistName}
                  onChange={handleChange}
                  placeholder="e.g. Eyerus Gebremariam"
                  required
                />
              </div>

              <div className="form-group-custom">
                <label>Pharmacist Job Title / Role</label>
                <input
                  type="text"
                  name="pharmacistRole"
                  value={formData.pharmacistRole}
                  onChange={handleChange}
                  placeholder="e.g. Chief Pharmacist, Pharmacy Director"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Pharmacy Branding */}
        <div className="settings-section-card">
          <div className="settings-section-header">
            <Shield size={18} className="text-emerald-700" />
            <h4>Pharmacy Branding & Tagline</h4>
          </div>

          <div className="settings-fields-group">
            <div className="form-group-custom">
              <label>Pharmacy Brand Name</label>
              <input
                type="text"
                name="pharmacyName"
                value={formData.pharmacyName}
                onChange={handleChange}
                placeholder="e.g. Eyerus Pharmacy"
                required
              />
            </div>

            <div className="form-group-custom">
              <label>Tagline / Motto</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. Health Today, Better Tomorrow"
                required
              />
              <span className="field-hint-text">
                This tagline appears directly under your pharmacy logo on the left sidebar.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Currency & Tax Parameters */}
        <div className="settings-section-card">
          <div className="settings-section-header">
            <Shield size={18} className="text-emerald-700" />
            <h4>Financial & Currency Setup</h4>
          </div>

          <div className="form-row-split">
            <div className="form-group-custom">
              <label>Currency Code</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                placeholder="ETB"
                required
              />
            </div>

            <div className="form-group-custom">
              <label>VAT / Sales Tax (%)</label>
              <input
                type="number"
                step="0.5"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="settings-footer-action">
          <button type="submit" className="btn-action-gold btn-save-large">
            <Save size={18} />
            <span>Save All Preferences</span>
          </button>
        </div>
      </form>

      {/* Section 5: Owner Password & Security (Separate Form) */}
      <div className="settings-section-card" style={{ marginTop: "24px" }}>
        <div className="settings-section-header">
          <Lock size={18} className="text-emerald-700" />
          <h4>Owner Security & Master Password</h4>
        </div>

        {pwSuccess && (
          <div className="pos-alert alert-success" style={{ marginBottom: "16px" }}>
            <CheckCircle2 size={18} />
            <span>{pwSuccess}</span>
          </div>
        )}

        {pwError && (
          <div className="pos-alert alert-danger" style={{ marginBottom: "16px" }}>
            <AlertCircle size={18} />
            <span>{pwError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="settings-fields-group">
          <div className="form-row-split">
            <div className="form-group-custom">
              <label>Current Master Password</label>
              <input
                type="password"
                placeholder="Enter current password (default: luna1234)"
                value={pwData.currentPassword}
                onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group-custom">
              <label>New Master Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={pwData.newPassword}
                onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group-custom" style={{ maxWidth: "50%" }}>
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-type new password"
              value={pwData.confirmPassword}
              onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div style={{ marginTop: "12px" }}>
            <button
              type="submit"
              className="btn-action-emerald"
              disabled={pwSubmitting}
              style={{ display: "inline-flex", width: "auto", padding: "10px 24px" }}
            >
              <KeyRound size={16} />
              <span>{pwSubmitting ? "Updating..." : "Update Master Password"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
