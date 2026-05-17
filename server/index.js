require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const transactionsRoutes = require("./routes/transactions");
const walletRoutes = require("./routes/wallet");

const app = express();

app.use(cors({origin : process.env.CLIENT_URL || "http://localhost:3000"}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions",transactionsRoutes);
app.use("/api/wallet",walletRoutes);

app.get("/",(req,res)=> res.json({message:"Digital wallet is running"}));

mongoose.connnect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB connected");
    app.listen(process.env.PORY || 5000, () =>
     console.log(`Server on http://localhost:${process.env.PORT || 5000}`)
);
})
.catch((err)=>
{
    console.error("MongoDB failed:", err.message);
});