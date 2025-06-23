const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuthMiddleware = require("../middlewares/roleAuthMiddleware");

// All routes below require user to be authenticated and be admin or librarian
router.use(authMiddleware);
router.use(roleAuthMiddleware(["admin", "librarian"]));

// Dashboard summary
router.get("/dashboard-stats", analyticsController.getDashboardStats);

// Category distribution
router.get("/category-distribution", analyticsController.getCategoryDistribution);

// Borrowing trends
router.get("/borrowing-trends", analyticsController.getBorrowingTrends);

// Popular books
router.get("/popular-books", analyticsController.getPopularBooks);

// User activity timeline
router.get("/user-activity", analyticsController.getUserActivity);

// Overdue books stats
router.get("/overdue-stats", analyticsController.getOverdueStats);

module.exports = router;
