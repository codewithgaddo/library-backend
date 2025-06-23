const express = require("express");
const router = express.Router();

const {
  createRequest,
  getAllRequests,
  approveRequest,
  rejectRequest
} = require("../controllers/requestController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleAuth = require("../middlewares/roleAuthMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Students can submit a borrow or extension request
router.post("/", roleAuth(["student"]), createRequest);

// Admins and librarians can view and manage requests
router.get("/", roleAuth(["admin", "librarian"]), getAllRequests);
router.patch("/:id/approve", roleAuth(["admin", "librarian"]), approveRequest);
router.patch("/:id/reject", roleAuth(["admin", "librarian"]), rejectRequest);

module.exports = router;
