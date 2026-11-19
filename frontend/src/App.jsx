import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import AllDrugs from "./components/AllDrugs";
import SellDrug from "./components/SellDrug";
import DailySales from "./components/DailySales";
import Settings from "./components/Settings";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import MobileBottomNav from "./components/MobileBottomNav";

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`app-layout-container ${mobileMenuOpen ? "drawer-open-active" : ""}`}>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Fixed Left Sidebar / Mobile Slide-in Drawer */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace (Top Header + Page Content) */}
      <div className="app-main-workspace">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          mobileMenuOpen={mobileMenuOpen}
        />
        <main className="app-scrollable-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/drugs" element={<AllDrugs />} />
            <Route path="/sell" element={<SellDrug />} />
            <Route path="/daily-sales" element={<DailySales />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Dock Navigation (visible on smartphones) */}
      <MobileBottomNav />
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Owner Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<MainLayout />} />
      </Route>
    </Routes>
  );
}

export default App;
