const express = require("express");
const router = express.Router();

const {
  addCategory,
  getCategories
} = require("../controllers/categoryController");

router.post("/categories", addCategory);
router.get("/categories", getCategories);

module.exports = router;
