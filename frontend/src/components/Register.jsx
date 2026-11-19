import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", pharmacyName: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("luna_auth_token", data.token);
      localStorage.setItem("luna_auth_user", JSON.stringify(data.user));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-card">
        <h2>Create Pharmacy Account</h2>
        {error && <p className="error">{error}</p>}
        <input placeholder="Pharmacy Name" value={form.pharmacyName} onChange={(e) => setForm({ ...form, pharmacyName: e.target.value })} required />
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Create Account</button>
        <p><Link to="/login">Back to login</Link></p>
      </form>
    </div>
  );
}