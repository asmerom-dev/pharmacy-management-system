import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Calendar,
  Sun,
  Moon,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Check,
  ChevronRight,
  Eye,
  CheckCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { apiFetch } from "../api";

function Header() {
  const [currentTime, setCurrentTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { settings, toggleTheme } = useSettings();

  const getStoredReadIds = () => {
    try {
      const raw = localStorage.getItem("luna_read_notification_ids");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveStoredReadIds = (ids) => {
    try {
      localStorage.setItem("luna_read_notification_ids", JSON.stringify(ids));
    } catch (e) {}
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
      setCurrentTime(now.toLocaleString("en-US", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real notifications from drug inventory
  const loadNotifications = async () => {
    try {
      const res = await apiFetch("/api/drugs");
      if (res.ok) {
        const drugs = await res.json();
        const list = [];
        const readIds = getStoredReadIds();

        // 1. Check out-of-stock
        const outOfStock = drugs.filter((d) => d.stock === 0);
        outOfStock.forEach((d) => {
          list.push({
            id: `out-${d.id}`,
            type: "danger",
            title: "Out of Stock Warning",
            message: `${d.name} is completely out of stock!`,
            time: "Immediate action required",
            drugName: d.name,
            read: readIds.includes(`out-${d.id}`),
          });
        });

        // 2. Check low stock
        const lowStock = drugs.filter((d) => d.stock > 0 && d.stock <= 20);
        lowStock.forEach((d) => {
          list.push({
            id: `low-${d.id}`,
            type: "warning",
            title: "Low Stock Alert",
            message: `Only ${d.stock} units left for ${d.name}.`,
            time: "Restock recommended",
            drugName: d.name,
            read: readIds.includes(`low-${d.id}`),
          });
        });

        // 3. Positive system alert
        list.push({
          id: "sys-ready",
          type: "success",
          title: "System Status",
          message: "Database and POS system are synchronized.",
          time: "Just now",
          read: readIds.includes("sys-ready"),
        });

        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/drugs?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Mark single notification as read
  const markSingleAsRead = (id, e) => {
    if (e) e.stopPropagation();
    const readIds = getStoredReadIds();
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      saveStoredReadIds(updated);
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    saveStoredReadIds(allIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Handle clicking notification item
  const handleNotificationClick = (n) => {
    if (!n.read) {
      markSingleAsRead(n.id);
    }
    if (n.drugName) {
      navigate(`/drugs?search=${encodeURIComponent(n.drugName)}`);
    } else {
      navigate("/daily-sales");
    }
    setShowNotifications(false);
  };

  return (
    <header className="app-top-header">
      {/* Search Input Bar */}
      <form className="top-search-bar" onSubmit={handleSearchSubmit}>
        <Search size={18} className="search-icon-input" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {/* Header Right Actions */}
      <div className="top-header-right">
        {/* Quick Theme Toggle Button */}
        <button
          className="header-theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${settings.theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {settings.theme === "dark" ? (
            <Sun size={19} className="theme-sun-icon" />
          ) : (
            <Moon size={19} className="theme-moon-icon" />
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="notification-wrapper-relative" ref={dropdownRef}>
          <button
            className={`notification-bell-btn ${showNotifications ? "bell-active" : ""}`}
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {/* Interactive Dropdown Panel */}
          {showNotifications && (
            <div className="notifications-dropdown-menu">
              <div className="notif-dropdown-header">
                <div className="notif-header-title">
                  <Bell size={16} className="text-gold-accent" />
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="notif-pill-count">{unreadCount} New</span>
                  )}
                </div>
                {unreadCount > 0 ? (
                  <button className="btn-mark-read" onClick={markAllAsRead}>
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                ) : (
                  <span className="notif-all-caught-up">
                    <CheckCircle2 size={13} className="text-emerald-500" /> All caught up
                  </span>
                )}
              </div>

              <div className="notif-items-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                    <p>No new alerts!</p>
                    <span>All inventory levels are looking healthy.</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item-row ${n.read ? "notif-read" : "notif-unread"}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className={`notif-icon-circle notif-type-${n.type}`}>
                        {n.type === "danger" && <Ban size={15} />}
                        {n.type === "warning" && <AlertTriangle size={15} />}
                        {n.type === "success" && <CheckCircle2 size={15} />}
                      </div>
                      <div className="notif-text-content">
                        <div className="notif-title-line">
                          <span className="notif-title">{n.title}</span>
                          <span className="notif-time">{n.time}</span>
                        </div>
                        <p className="notif-message">{n.message}</p>
                      </div>

                      {/* Read status indicator and individual checkmark */}
                      <div className="notif-status-action">
                        {n.read ? (
                          <span className="notif-badge-read" title="Read">
                            <Check size={12} /> Read
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn-mark-single-read"
                            title="Mark as read"
                            onClick={(e) => markSingleAsRead(n.id, e)}
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <ChevronRight size={14} className="notif-arrow" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="notif-dropdown-footer">
                <button
                  className="btn-view-all-inventory"
                  onClick={() => {
                    navigate("/drugs");
                    setShowNotifications(false);
                  }}
                >
                  <span>Go to Inventory Management</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Date / Time Badge */}
        <div className="date-time-chip">
          <Calendar size={16} className="chip-icon" />
          <span>{currentTime || "Loading date..."}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
