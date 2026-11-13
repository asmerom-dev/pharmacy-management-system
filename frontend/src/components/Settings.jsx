import { useState } from "react";
import { Settings as SettingsIcon, Save, Shield, Database, Bell, User } from "lucide-react";

function Settings() {
  const [pharmacyName, setPharmacyName] = useState("Luna Pharmacy");
  const [tagline, setTagline] = useState("Health Today, Better Tomorrow");
  const [pharmacist, setPharmacist] = useState("Asme Teklay");
  const [taxRate, setTaxRate] = useState(15);
  const [currency, setCurrency] = useState("ETB");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-view-page">
      <div className="page-intro-header">
        <div className="intro-title-wrapper">
          <div className="pulse-icon-gold">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="main-page-title">Settings</h2>
            <p className="main-page-subtitle">Configure your pharmacy preferences and store parameters</p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="pos-alert alert-success" style={{ marginBottom: "20px" }}>
          Preferences saved successfully!
        </div>
      )}

      <div className="settings-cards-grid">
        <form onSubmit={handleSave} className="settings-form-panel">
          <div className="settings-section-card">
            <div className="settings-section-header">
              <User size={18} className="text-emerald-700" />
              <h4>Pharmacy & Operator Info</h4>
            </div>

            <div className="settings-fields-group">
              <div className="form-group-custom">
                <label>Pharmacy Brand Name</label>
                <input
                  type="text"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                />
              </div>

              <div className="form-group-custom">
                <label>Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div className="form-group-custom">
                <label>Chief Pharmacist Name</label>
                <input
                  type="text"
                  value={pharmacist}
                  onChange={(e) => setPharmacist(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="settings-section-card">
            <div className="settings-section-header">
              <Shield size={18} className="text-emerald-700" />
              <h4>Financial & Currency Setup</h4>
            </div>

            <div className="settings-fields-group">
              <div className="form-group-custom">
                <label>Currency Code</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>

              <div className="form-group-custom">
                <label>VAT / Sales Tax (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-action-emerald" style={{ alignSelf: "flex-start", marginTop: "10px" }}>
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
