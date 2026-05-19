const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { sendMoney, getHistory } = require("../controllers/transactionController");

router.post("/send", protect, sendMoney);
router.get("/history", protect, getHistory);

module.exports = router;