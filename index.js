require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const bookRoutes = require("./routes/bookRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const loanRoutes = require("./routes/loanRoutes");
const commentRoutes = require("./routes/commentRoutes");
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const cleanupExpiredReservations = require("./utils/cleanupReservation");
const analyticsRoutes = require("./routes/analyticsRoutes");



const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/comments", commentRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/analytics", analyticsRoutes);


app.get("/", (req, res) => {
  res.send("Library System Launched");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;

// Reservation cleanup task
setInterval(() => {
  cleanupExpiredReservations();
}, 30 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}...`);
});