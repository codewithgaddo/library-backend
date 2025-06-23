const express = require("express");
const router = express.Router();

const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuth = require("../middlewares/roleAuthMiddleware");

router.use(authMiddleware);

router.post("/",roleAuth(["librarian", "admin"]), addCategory);
router.get("/", getCategories);
router.put("/:id", roleAuth(["admin", "librarian"]), updateCategory);
router.delete("/:id", roleAuth(["admin", "librarian"]), deleteCategory);


module.exports = router;
