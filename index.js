require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const bookRoutes = require("./routes/bookRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const loanRoutes = require("./routes/loanRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", studentRoutes);
app.use("/api", bookRoutes);
app.use("/api", categoryRoutes);
app.use("/api", loanRoutes);

app.get("/", (req, res) => {
  res.send("Kütüphane Sistemi Başladı! 📚");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB bağlantısı başarılı!"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});