const Reservation = require("../models/Reservation");
const Book = require("../models/Book");

const cleanupExpiredReservations = async () => {
  const now = new Date();

  const expired = await Reservation.find({
    expiresAt: { $lt: now },
    active: true
  });

  for (let reservation of expired) {
    reservation.active = false;
    await reservation.save();

    const book = await Book.findById(reservation.book);
    if (book) {
      book.available = true;
      await book.save();
    }

    console.log(`Reservation expired and cleaned up: ${reservation._id}`);
  }
};

module.exports = cleanupExpiredReservations;
