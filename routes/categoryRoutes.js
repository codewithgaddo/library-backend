const express = require("express");
const router = express.Router();

const {
  addCategory,
  getCategories
} = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuth = require("../middlewares/roleAuthMiddleware");

router.use(authMiddleware);

router.post("/",roleAuth(["librarian", "admin"]), addCategory);
router.get("/", getCategories);

module.exports = router;
