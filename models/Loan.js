const mongoose = require("mongoose");


const loanSchema = new mongoose.Schema({
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
  loanDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: Date,
  isReturned: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["active", "returned", "overdue"],
    default: "active"
  },
  fine: {
    type: Number,
    default: 0
  },
  lostOrDamaged: {
    status: {
      type: Boolean,
      default: false
    },
    note: {
      type: String,
      default: ""
    }
  }
});

module.exports = mongoose.model("Loan", loanSchema);