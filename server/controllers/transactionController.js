const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const sendMoney = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { receiverEmail, amount, note, idempotencyKey } = req.body;
    const senderId = req.user._id;

    if (!receiverEmail || !amount)
      return res.status(400).json({ message: "Receiver email and amount required" });

    // Check duplicate transaction
    if (idempotencyKey) {
      const existing = await Transaction.findOne({ idempotencyKey });
      if (existing)
        return res.status(200).json({
          message: "Transaction already processed",
          newBalance: req.user.balance,
        });
    }

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0)
      return res.status(400).json({ message: "Amount must be a positive number" });

    const sender = await User.findById(senderId).session(session);
    const receiver = await User.findOne({
      email: receiverEmail.toLowerCase(),
    }).session(session);

    if (!receiver)
      return res.status(404).json({ message: "No account found with that email" });

    if (sender._id.toString() === receiver._id.toString())
      return res.status(400).json({ message: "Cannot send money to yourself" });

    if (sender.balance < transferAmount)
      return res.status(400).json({
        message: `Insufficient balance. You have ₹${sender.balance}`,
      });

    await session.withTransaction(async () => {
      await User.findByIdAndUpdate(
        sender._id,
        { $inc: { balance: -transferAmount } },
        { session }
      );

      await User.findByIdAndUpdate(
        receiver._id,
        { $inc: { balance: transferAmount } },
        { session }
      );

      await Transaction.create(
        [
          {
            sender: sender._id,
            receiver: receiver._id,
            amount: transferAmount,
            status: "completed",
            note: note || "",
            idempotencyKey: idempotencyKey || undefined,
          },
        ],
        { session }
      );
    });

    const updatedSender = await User.findById(sender._id).select("balance");

    res.status(200).json({
      message: `₹${transferAmount} sent to ${receiver.name} successfully`,
      newBalance: updatedSender.balance,
    });
  } catch (error) {
    console.error("Send money error:", error);
    res.status(500).json({ message: "Transaction failed. No money was moved." });
  } finally {
    session.endSession();
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch history" });
  }
};

module.exports = { sendMoney, getHistory };