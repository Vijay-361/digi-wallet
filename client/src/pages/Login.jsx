import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logo}>💳</div>
        <h1 style={s.title}>Welcome Back</h1>
        <p style={s.subtitle}>Sign in to your wallet</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.group}>
            <label style={s.label}>Email</label>
            <input
              style={s.input} type="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="you@example.com" required
            />
          </div>
          <div style={s.group}>
            <label style={s.label}>Password</label>
            <input
              style={s.input} type="password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="Your password" required
            />
          </div>
          <button
            style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            type="submit" disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={s.link}>
          Don't have an account?{" "}
          <Link to="/register" style={s.a}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

const s = {
  container: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", padding: "1rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  card: {
    background: "white", borderRadius: "16px", padding: "2.5rem",
    width: "100%", maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
  },
  logo: { fontSize: "3rem", textAlign: "center", marginBottom: "0.5rem" },
  title: {
    fontSize: "1.75rem", fontWeight: 700,
    textAlign: "center", marginBottom: "0.25rem"
  },
  subtitle: {
    textAlign: "center", color: "#718096",
    marginBottom: "2rem", fontSize: "0.95rem"
  },
  error: {
    background: "#fff5f5", border: "1px solid #fed7d7",
    color: "#c53030", padding: "0.75rem", borderRadius: "8px",
    marginBottom: "1rem", fontSize: "0.9rem"
  },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  group: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "0.875rem", fontWeight: 600, color: "#4a5568" },
  input: {
    padding: "0.75rem 1rem", border: "2px solid #e2e8f0",
    borderRadius: "8px", fontSize: "1rem", outline: "none"
  },
  btn: {
    padding: "0.875rem",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginTop: "0.5rem"
  },
  link: {
    textAlign: "center", marginTop: "1.5rem",
    color: "#718096", fontSize: "0.9rem"
  },
  a: { color: "#667eea", fontWeight: 600 },
};

export default Login;