import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import AllDrugs from "./components/AllDrugs";
import SellDrug from "./components/SellDrug";
import DailySales from "./components/DailySales";
import Settings from "./components/Settings";

function App() {
  return (
    <div className="app-layout-container">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Workspace (Top Header + Page Content) */}
      <div className="app-main-workspace">
        <Header />
        <main className="app-scrollable-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/drugs" element={<AllDrugs />} />
            <Route path="/sell" element={<SellDrug />} />
            <Route path="/daily-sales" element={<DailySales />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
