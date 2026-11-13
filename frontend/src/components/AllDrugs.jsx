import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Pill,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Filter,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import AddDrugModal from "./AddDrugModal";

function AllDrugs() {
  const [searchParams] = useSearchParams();
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/drugs");
      if (res.ok) {
        const data = await res.json();
        setDrugs(data);
      }
    } catch (err) {
      console.error("Error fetching drugs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const res = await fetch(`/api/drugs/${id}`, { method: "DELETE" });
        if (res.ok) {
          setDrugs(drugs.filter((d) => d.id !== id));
        } else {
          alert("Failed to delete medication.");
        }
      } catch (err) {
        console.error("Error deleting drug:", err);
      }
    }
  };

  // Categories list
  const categories = ["All", ...new Set(drugs.map((d) => d.category).filter(Boolean))];

  // Filtering
  const filteredDrugs = drugs.filter((drug) => {
    const matchesSearch =
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || drug.category === selectedCategory;

    let status = "In Stock";
    if (drug.stock === 0) status = "Out of Stock";
    else if (drug.stock <= 20) status = "Low Stock";

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "In Stock" && drug.stock > 20) ||
      (selectedStatus === "Low Stock" && drug.stock > 0 && drug.stock <= 20) ||
      (selectedStatus === "Out of Stock" && drug.stock === 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalEntries = filteredDrugs.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDrugs = filteredDrugs.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (stock) => {
    if (stock === 0) {
      return <span className="status-badge status-out">● Out of Stock</span>;
    }
    if (stock <= 20) {
      return <span className="status-badge status-low">● Low Stock</span>;
    }
    return <span className="status-badge status-in">● In Stock</span>;
  };

  return (
    <div className="inventory-view-page">
      {/* Header Bar */}
      <div className="inventory-top-header">
        <div className="inventory-heading-wrapper">
          <div className="inventory-icon-badge">
            <Pill size={22} className="text-white" />
          </div>
          <div>
            <h2 className="main-page-title">Inventory / All Drugs</h2>
            <p className="main-page-subtitle">Manage your medicine stock</p>
          </div>
        </div>

        <button
          className="btn-add-drug-green"
          onClick={() => {
            setEditingDrug(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Add New Drug</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="inventory-filter-bar">
        <div className="search-filter-input-wrap">
          <Search size={18} className="filter-search-icon" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="dropdowns-filter-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select-custom"
          >
            <option value="All">All Categories</option>
            {categories
              .filter((c) => c !== "All")
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select-custom"
          >
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Drugs Table */}
      <div className="inventory-table-card">
        <table className="inventory-table">
          <thead>
            <tr>
              <th style={{ width: "45px" }}>#</th>
              <th>Drug Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit Price</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th style={{ textAlign: "center", width: "110px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="table-empty-notice">
                  Loading medications...
                </td>
              </tr>
            ) : paginatedDrugs.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty-notice">
                  No medications found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedDrugs.map((drug, index) => (
                <tr key={drug.id} className="table-row-hover">
                  <td className="row-index">{startIndex + index + 1}</td>
                  <td className="font-semibold text-slate-800">{drug.name}</td>
                  <td className="text-slate-600">{drug.category}</td>
                  <td className="font-semibold">{drug.stock}</td>
                  <td className="font-semibold text-emerald-800">
                    ETB {parseFloat(drug.price).toFixed(2)}
                  </td>
                  <td className="text-slate-600">
                    {drug.expiry_date || "2027-06-30"}
                  </td>
                  <td>{getStatusBadge(drug.stock)}</td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        className="btn-action-edit"
                        title="Edit"
                        onClick={() => {
                          setEditingDrug(drug);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-action-delete"
                        title="Delete"
                        onClick={() => handleDelete(drug.id, drug.name)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Table Footer / Pagination */}
        <div className="table-pagination-footer">
          <span className="pagination-info-text">
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, totalEntries)} of {totalEntries}{" "}
            entries
          </span>

          <div className="pagination-controls">
            <button
              className="page-nav-arrow"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="page-number-active">{currentPage}</span>
            <button
              className="page-nav-arrow"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Drug Modal */}
      <AddDrugModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDrug(null);
        }}
        onDrugAdded={() => {
          fetchDrugs();
        }}
      />
    </div>
  );
}

export default AllDrugs;
