const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
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
  returnDate: {
    type: Date
  },
  isReturned: {
    type: Boolean,
    default: false
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