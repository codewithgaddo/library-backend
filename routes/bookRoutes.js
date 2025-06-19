const express = require("express");
const router = express.Router();

const {
  addBook,
  getAllBooks,
  getBookByISBN
} = require("../controllers/bookController");

// Add Book
router.post("/books", addBook);

// getAllBooks
router.get("/books", getAllBooks);

// getBookByISBN
router.get("/books/:isbn", getBookByISBN);

module.exports = router;