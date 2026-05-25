const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const User = require("../models/User");

// GET /api/users/search?name=vijay
router.get("/search", protect, async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim().length < 1) {
      return res.status(200).json({ users: [] });
    }

    // Search users by name — case insensitive
    // $regex = pattern matching, $options: 'i' = ignore case
    // Exclude current logged in user from results
    const users = await User.find({
      name: { $regex: name, $options: "i" },
      _id: { $ne: req.user._id }, // $ne = not equal — exclude yourself
    })
      .select("name email") // only return name and email — not password or balance
      .limit(10); // max 10 results

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;