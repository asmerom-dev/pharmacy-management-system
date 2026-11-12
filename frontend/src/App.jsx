import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import AllDrugs from "./components/AllDrugs";
import SellDrug from "./components/SellDrug";
import DailySales from "./components/DailySales";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/drugs" element={<AllDrugs />} />
          <Route path="/sell" element={<SellDrug />} />
          <Route path="/daily-sales" element={<DailySales />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
