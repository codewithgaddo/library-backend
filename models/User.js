const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "librarian", "admin"],
    default: "student"
  },
  studentNumber: { type: String }, // Special for students
  country: { type: String },
  active: { type: Boolean, default: true },
  refreshToken: { type: String },

  // Optional fields for password reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);