import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { settings } = useSettings();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out of the Luna Pharmacy Portal?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Logo & Header */}
      <div className="sidebar-brand-container">
        <div className="brand-logo-badge">
          {/* Golden Medical Cross with Leaf SVG */}
          <svg viewBox="0 0 44 44" className="brand-cross-svg" fill="none">
            {/* Golden cross base */}
            <path
              d="M16 4C16 2.89543 16.8954 2 18 2H26C27.1046 2 28 2.89543 28 4V16H40C41.1046 16 42 16.8954 42 18V26C42 27.1046 41.1046 28 40 28H28V40C28 41.1046 27.1046 42 26 42H18C16.8954 42 16 41.1046 16 40V28H4C2.89543 28 2 27.1046 2 26V18C2 16.8954 2.89543 16 4 16H16V4Z"
              fill="url(#goldGradient)"
            />
            {/* Green Leaf Accent */}
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
              <linearGradient id="goldGradient" x1="2" y1="2" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE68A" />
                <stop offset="0.4" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="brand-text-block">
          <h1 className="brand-name">
            {settings.pharmacyName || "Luna Pharmacy"}
          </h1>
          <p className="brand-tagline">
            {settings.tagline || "Health Today, Better Tomorrow"}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav-menu">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item-link ${isActive ? "nav-item-active" : ""}`
          }
        >
          <LayoutDashboard size={20} className="nav-item-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/drugs"
          className={({ isActive }) =>
            `nav-item-link ${isActive ? "nav-item-active" : ""}`
          }
        >
          <Pill size={20} className="nav-item-icon" />
          <span>Inventory / All Drugs</span>
        </NavLink>

        <NavLink
          to="/sell"
          className={({ isActive }) =>
            `nav-item-link ${isActive ? "nav-item-active" : ""}`
          }
        >
          <ShoppingCart size={20} className="nav-item-icon" />
          <span>Sell Medicine (POS)</span>
        </NavLink>

        <NavLink
          to="/daily-sales"
          className={({ isActive }) =>
            `nav-item-link ${isActive ? "nav-item-active" : ""}`
          }
        >
          <TrendingUp size={20} className="nav-item-icon" />
          <span>Daily Sales & Reports</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item-link ${isActive ? "nav-item-active" : ""}`
          }
        >
          <Settings size={20} className="nav-item-icon" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-bottom-panel">
        <div className="user-profile-badge">
          <div className="user-avatar-circle">
            {settings.pharmacistPhoto ? (
              <img
                src={settings.pharmacistPhoto}
                alt={settings.pharmacistName}
                className="user-custom-avatar-img"
              />
            ) : (
              <svg viewBox="0 0 36 36" fill="none" className="avatar-doctor-svg">
                <circle cx="18" cy="18" r="18" fill="#047857" />
                <circle cx="18" cy="13" r="6" fill="#FDE68A" />
                <path
                  d="M7 32C7 26 12 23 18 23C24 23 29 26 29 32"
                  fill="#10B981"
                />
                <path
                  d="M15 24V28M21 24V28M15 28C15 29.6 16.3 31 18 31C19.7 31 21 29.6 21 28"
                  stroke="#FDE68A"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          <div className="user-info-text">
            <h4 className="user-name">
              {settings.pharmacistName || "Asme Teklay"}
            </h4>
            <span className="user-role">
              {settings.pharmacistRole || "Pharmacist"}
            </span>
          </div>
          <ChevronDown size={16} className="user-dropdown-arrow" />
        </div>

        <button
          className="btn-logout-sidebar"
          onClick={handleLogout}
          title="Sign out of Owner Portal"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
