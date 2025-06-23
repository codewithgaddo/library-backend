const Reservation = require("../models/Reservation");
const Book = require("../models/Book");
const User = require("../models/User");

// POST /api/reservations
const reserveBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const studentId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book || !book.available) {
      return res.status(400).json({ error: "Book is not available for reservation." });
    }

    const existing = await Reservation.findOne({
      book: bookId,
      active: true
    });

    if (existing) {
      return res.status(409).json({ error: "Book is already reserved." });
    }

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const reservation = await Reservation.create({
      student: studentId,
      book: bookId,
      expiresAt
    });

    book.available = false;
    await book.save();

    res.status(201).json({ message: "Book reserved successfully.", reservation });
  } catch (err) {
    console.error("reserveBook error:", err);
    res.status(500).json({ error: "Failed to reserve book." });
  }
};

// PATCH /api/reservations/:id/cancel
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation || !reservation.active) {
      return res.status(404).json({ error: "Reservation not found or already inactive." });
    }

    reservation.active = false;
    await reservation.save();

    const book = await Book.findById(reservation.book);
    if (book) {
      book.available = true;
      await book.save();
    }

    res.json({ message: "Reservation cancelled." });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel reservation." });
  }
};

// GET /api/reservations/my
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ student: req.user.id, active: true })
      .populate("book", "title author");

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your reservations." });
  }
};

// GET /api/reservations (all)
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("student", "name surname email studentNumber")
      .populate("book", "title author");

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all reservations." });
  }
};

// GET /api/reservations/student/:studentNumber
const getReservationsByStudentNumber = async (req, res) => {
  try {
    const { studentNumber } = req.params;

    const student = await User.findOne({ studentNumber });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const reservations = await Reservation.find({ student: student._id })
      .populate("book", "title author");

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reservations by student number." });
  }
};

module.exports = {
  reserveBook,
  cancelReservation,
  getMyReservations,
  getAllReservations,
  getReservationsByStudentNumber
};
