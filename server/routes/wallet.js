const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { getBalance } = require("../controllers/walletController");

router.get("/balance", protect, getBalance);

module.exports = router;