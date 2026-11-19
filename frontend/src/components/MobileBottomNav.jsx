import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  TrendingUp,
  Settings
} from "lucide-react";

export default function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-dock" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `mobile-dock-item ${isActive ? "dock-active" : ""}`
        }
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/drugs"
        className={({ isActive }) =>
          `mobile-dock-item ${isActive ? "dock-active" : ""}`
        }
      >
        <Pill size={20} />
        <span>Inventory</span>
      </NavLink>

      <NavLink
        to="/sell"
        className={({ isActive }) =>
          `mobile-dock-item dock-pos-center ${isActive ? "dock-pos-active" : ""}`
        }
      >
        <div className="dock-pos-circle">
          <ShoppingCart size={22} />
        </div>
        <span>Sell POS</span>
      </NavLink>

      <NavLink
        to="/daily-sales"
        className={({ isActive }) =>
          `mobile-dock-item ${isActive ? "dock-active" : ""}`
        }
      >
        <TrendingUp size={20} />
        <span>Reports</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `mobile-dock-item ${isActive ? "dock-active" : ""}`
        }
      >
        <Settings size={20} />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}
