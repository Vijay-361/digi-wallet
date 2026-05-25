import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const SendMoney = () => {
  const { user, updateBalance } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    receiverEmail: "", amount: "", note: ""
  });
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Search users by name
  const handleSearch = async (value) => {
    setSearchName(value);
    setSelectedUser(null);
    setFormData({ ...formData, receiverEmail: "" });

    if (value.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await api.get(`/users/search?name=${value}`);
      setSearchResults(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // When user clicks a search result
  const selectUser = (u) => {
    setSelectedUser(u);
    setSearchName(u.name);
    setFormData({ ...formData, receiverEmail: u.email });
    setSearchResults([]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.receiverEmail) {
      setError("Please search and select a recipient");
      return;
    }
    if (Number(formData.amount) > user.balance) {
      setError(`Insufficient balance. You have ₹${user.balance}`);
      return;
    }
    if (formData.receiverEmail === user.email) {
      setError("You cannot send money to yourself");
      return;
    }
    setLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await api.post("/transactions/send", {
        ...formData,
        amount: Number(formData.amount),
        idempotencyKey,
      });
      updateBalance(res.data.newBalance);
      setSuccess(res.data.message);
      setFormData({ receiverEmail: "", amount: "", note: "" });
      setSearchName("");
      setSelectedUser(null);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <button style={s.back} onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h1 style={s.title}>Send Money</h1>
        <p style={s.bal}>
          Balance: <strong>₹{user?.balance?.toLocaleString("en-IN")}</strong>
        </p>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>✅ {success}</div>}

        <form onSubmit={handleSubmit} style={s.form}>

          {/* SEARCH BOX */}
          <div style={s.group}>
            <label style={s.label}>Search Recipient by Name</label>
            <input
              style={s.input}
              type="text"
              value={searchName}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Type name to search..."
              disabled={loading}
            />

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div style={s.dropdown}>
                {searchResults.map((u) => (
                  <div
                    key={u._id}
                    style={s.dropItem}
                    onClick={() => selectUser(u)}
                    onMouseEnter={(e) =>
                      e.currentTarget.style.background = "#f0f4f8"
                    }
                    onMouseLeave={(e) =>
                      e.currentTarget.style.background = "white"
                    }
                  >
                    <div style={s.dropAvatar}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={s.dropName}>{u.name}</p>
                      <p style={s.dropEmail}>{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searching && (
              <p style={s.searching}>Searching...</p>
            )}
          </div>

          {/* Selected user chip */}
          {selectedUser && (
            <div style={s.selectedChip}>
              <span>✅ Sending to: <strong>{selectedUser.name}</strong></span>
              <span style={s.chipEmail}>{selectedUser.email}</span>
            </div>
          )}

          {/* AMOUNT */}
          <div style={s.group}>
            <label style={s.label}>Amount (₹)</label>
            <input
              style={s.input} type="number" name="amount"
              value={formData.amount} onChange={handleChange}
              placeholder="Enter amount" min="1"
              required disabled={loading}
            />
          </div>

          {/* NOTE */}
          <div style={s.group}>
            <label style={s.label}>Note (optional)</label>
            <input
              style={s.input} type="text" name="note"
              value={formData.note} onChange={handleChange}
              placeholder="For lunch, rent etc."
              disabled={loading}
            />
          </div>

          <button
            style={{
              ...s.btn,
              opacity: loading || !formData.receiverEmail
                || !formData.amount ? 0.6 : 1
            }}
            type="submit"
            disabled={loading || !formData.receiverEmail || !formData.amount}
          >
            {loading ? "Processing..." : `Send ₹${formData.amount || "0"}`}
          </button>
        </form>
      </div>
    </div>
  );
};

const s = {
  container: {
    minHeight: "100vh", background: "#f7f8fc",
    display: "flex", alignItems: "center",
    justifyContent: "center", padding: "1rem"
  },
  card: {
    background: "white", borderRadius: "16px", padding: "2rem",
    width: "100%", maxWidth: "480px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
  },
  back: {
    background: "none", border: "none", color: "#667eea",
    fontSize: "0.9rem", cursor: "pointer", padding: 0,
    marginBottom: "1.5rem", fontWeight: 500
  },
  title: { fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" },
  bal: { color: "#718096", marginBottom: "1.5rem", fontSize: "0.9rem" },
  error: {
    background: "#fff5f5", border: "1px solid #fed7d7",
    color: "#c53030", padding: "0.75rem", borderRadius: "8px",
    marginBottom: "1rem", fontSize: "0.9rem"
  },
  success: {
    background: "#f0fff4", border: "1px solid #9ae6b4",
    color: "#276749", padding: "0.75rem", borderRadius: "8px",
    marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 500
  },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  group: { display: "flex", flexDirection: "column", gap: "0.4rem",
    position: "relative" },
  label: { fontSize: "0.875rem", fontWeight: 600, color: "#4a5568" },
  input: {
    padding: "0.75rem 1rem", border: "2px solid #e2e8f0",
    borderRadius: "8px", fontSize: "1rem", outline: "none"
  },
  dropdown: {
    position: "absolute", top: "100%", left: 0, right: 0,
    background: "white", border: "1px solid #e2e8f0",
    borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    zIndex: 100, marginTop: "4px", overflow: "hidden"
  },
  dropItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 14px", cursor: "pointer",
    background: "white", transition: "background 0.15s"
  },
  dropAvatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "#EEEDFE", color: "#3C3489",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "14px", flexShrink: 0
  },
  dropName: { fontSize: "13px", fontWeight: 600, color: "#1a202c" },
  dropEmail: { fontSize: "11px", color: "#718096" },
  searching: { fontSize: "12px", color: "#718096", marginTop: "4px" },
  selectedChip: {
    background: "#f0fff4", border: "1px solid #9ae6b4",
    borderRadius: "8px", padding: "10px 14px",
    display: "flex", flexDirection: "column", gap: "2px",
    fontSize: "13px", color: "#276749"
  },
  chipEmail: { fontSize: "11px", color: "#718096" },
  btn: {
    padding: "0.875rem",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "1rem", fontWeight: 600, cursor: "pointer",
    marginTop: "0.5rem"
  },
};

export default SendMoney;