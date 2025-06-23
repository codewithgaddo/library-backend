const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  type: {
    type: String,
    enum: ["borrow", "extend"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  decisionDate: Date
});

module.exports = mongoose.model("Request", requestSchema);
