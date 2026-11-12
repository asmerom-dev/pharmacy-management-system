import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      {/* Pharmacy Logo and Name */}
      <div className="sidebar-header">
        <div className="pharmacy-icon">💊</div>
        <h2>PharmaCare</h2>
        <p>Management System</p>
      </div>

      {/* Navigation Links */}
      <ul className="sidebar-nav">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
            end
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/drugs"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="nav-icon">💊</span>
            All Drugs
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/sell"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="nav-icon">🛒</span>
            Sell Drug
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/daily-sales"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="nav-icon">📅</span>
            Daily Sales
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
