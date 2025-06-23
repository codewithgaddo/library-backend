const express = require("express");
const router = express.Router();

const {
  reserveBook,
  cancelReservation,
  getMyReservations,
  getAllReservations,
  getReservationsByStudentNumber
} = require("../controllers/reservationController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleAuth = require("../middlewares/roleAuthMiddleware");

router.use(authMiddleware);

// STUDENT
router.post("/", roleAuth(["student"]), reserveBook);
router.get("/my", roleAuth(["student"]), getMyReservations);
router.patch("/:id/cancel", roleAuth(["student"]), cancelReservation);

// STAFF
router.get("/", roleAuth(["admin", "librarian"]), getAllReservations);
router.get("/student/:studentNumber", roleAuth(["admin", "librarian"]), getReservationsByStudentNumber);


module.exports = router;
