import { useState, useEffect } from "react";
import { Search, Bell, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Header({ onSearch }) {
  const [currentTime, setCurrentTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/drugs?search=${encodeURIComponent(searchTerm.trim())}`);
    }
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
        {/* Notification Bell */}
        <button className="notification-bell-btn" title="3 New Notifications">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

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
