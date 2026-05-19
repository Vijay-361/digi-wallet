const User = require("../models/User");

const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({
      balance: user.balance,
      name: user.name,
      email: user.email,
      id: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch balance" });
  }
};

module.exports = { getBalance };