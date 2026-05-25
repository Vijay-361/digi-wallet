import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Dashboard = () => {
  const { user, logout, updateBalance } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balRes, txnRes] = await Promise.all([
          api.get("/wallet/balance"),
          api.get("/transactions/history"),
        ]);
        setBalance(balRes.data.balance);
        updateBalance(balRes.data.balance);
        setTransactions(txnRes.data.transactions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={s.loading}>
        <div style={s.spinner} />
        <p>Loading your wallet...</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: "1.5rem" }}>💳</span>
          <span style={s.appName}>DigiWallet</span>
        </div>
        <div style={s.headerRight}>
          <span style={s.userName}>
            Hi, {user?.name?.split(" ")[0]}
          </span>
          <button style={s.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div style={s.content}>
        <div style={s.balCard}>
          <p style={s.balLabel}>Available Balance</p>
          <h2 style={s.balAmount}>
            ₹{balance.toLocaleString("en-IN")}
          </h2>
          <p style={s.balEmail}>{user?.email}</p>
          <button style={s.sendBtn} onClick={() => navigate("/send")}>
            Send Money →
          </button>
        </div>

        <div style={s.histBox}>
          <h3 style={s.histTitle}>Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p style={s.noTxn}>
              No transactions yet. Send money to get started!
            </p>
          ) : (
            transactions.map((txn) => {
              const isSender = txn.sender._id === user.id;
              const other = isSender
                ? txn.receiver.name
                : txn.sender.name;
              return (
                <div key={txn._id} style={s.txnItem}>
                  <div style={{
                    ...s.avatar,
                    background: isSender ? "#fff5f5" : "#f0fff4",
                    color: isSender ? "#c53030" : "#276749"
                  }}>
                    {other.charAt(0).toUpperCase()}
                  </div>
                  <div style={s.txnDetails}>
                    <p style={s.txnName}>{other}</p>
                    <p style={s.txnMeta}>
                      {isSender ? "You sent" : "You received"} •{" "}
                      {new Date(txn.createdAt).toLocaleDateString("en-IN")}
                    </p>
                    {txn.note && (
                      <p style={s.txnNote}>"{txn.note}"</p>
                    )}
                  </div>
                  <div style={{
                    ...s.txnAmount,
                    color: isSender ? "#c53030" : "#276749"
                  }}>
                    {isSender ? "-" : "+"}
                    ₹{txn.amount.toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { minHeight: "100vh", background: "#f7f8fc" },
  header: {
    background: "white", padding: "1rem 2rem",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
    position: "sticky", top: 0, zIndex: 10
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "0.5rem" },
  appName: { fontSize: "1.25rem", fontWeight: 700, color: "#667eea" },
  headerRight: { display: "flex", alignItems: "center", gap: "1rem" },
  userName: { color: "#4a5568", fontWeight: 500 },
  logoutBtn: {
    padding: "0.4rem 1rem", border: "2px solid #e2e8f0",
    background: "white", borderRadius: "8px", cursor: "pointer",
    color: "#718096", fontSize: "0.875rem"
  },
  content: { maxWidth: "680px", margin: "2rem auto", padding: "0 1rem" },
  balCard: {
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    borderRadius: "20px", padding: "2.5rem", color: "white",
    textAlign: "center", marginBottom: "2rem",
    boxShadow: "0 8px 30px rgba(102,126,234,0.4)"
  },
  balLabel: {
    fontSize: "0.9rem", opacity: 0.85, marginBottom: "0.5rem",
    textTransform: "uppercase", letterSpacing: "1px"
  },
  balAmount: { fontSize: "3rem", fontWeight: 800, marginBottom: "0.5rem" },
  balEmail: { fontSize: "0.875rem", opacity: 0.75, marginBottom: "1.5rem" },
  sendBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "2px solid rgba(255,255,255,0.6)",
    color: "white", padding: "0.75rem 2rem", borderRadius: "50px",
    fontSize: "1rem", fontWeight: 600, cursor: "pointer"
  },
  histBox: {
    background: "white", borderRadius: "16px", padding: "1.5rem"
  },
  histTitle: {
    fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem"
  },
  noTxn: { textAlign: "center", padding: "2rem", color: "#718096" },
  txnItem: {
    display: "flex", alignItems: "center", gap: "1rem",
    padding: "1rem 0", borderBottom: "1px solid #f0f4f8"
  },
  avatar: {
    width: "44px", height: "44px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "1rem", flexShrink: 0
  },
  txnDetails: { flex: 1 },
  txnName: { fontWeight: 600, color: "#1a202c", fontSize: "0.95rem" },
  txnMeta: { fontSize: "0.8rem", color: "#718096", marginTop: "2px" },
  txnNote: {
    fontSize: "0.8rem", color: "#a0aec0", fontStyle: "italic"
  },
  txnAmount: { fontWeight: 700, fontSize: "1rem" },
  loading: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "1rem", color: "#718096"
  },
  spinner: {
    width: "40px", height: "40px", border: "4px solid #e2e8f0",
    borderTopColor: "#667eea", borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
};

export default Dashboard;