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
  CheckCircle2
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

function Settings() {
  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    pharmacyName: settings.pharmacyName || "Luna Pharmacy",
    tagline: settings.tagline || "Health Today, Better Tomorrow",
    pharmacistName: settings.pharmacistName || "Asme Teklay",
    pharmacistRole: settings.pharmacistRole || "Pharmacist",
    pharmacistPhoto: settings.pharmacistPhoto || "",
    theme: settings.theme || "light",
    currency: settings.currency || "ETB",
    taxRate: settings.taxRate || 15,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

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
              Configure your pharmacy branding, theme, pharmacist profile, and financial preferences
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
                  placeholder="e.g. Asme Teklay"
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
                  placeholder="e.g. Pharmacist, Pharmacy Director"
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
                placeholder="e.g. Luna Pharmacy"
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
    </div>
  );
}

export default Settings;
