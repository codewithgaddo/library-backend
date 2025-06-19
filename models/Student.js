const mongoose = require("mongoose");

//Student Data
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    studentNumber: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    country: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model("Student", studentSchema);