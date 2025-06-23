const Book = require("../models/Book");

// Add book
const addBook = async (req, res) => {
  const { title, author, isbn, category } = req.body;

  try {
    const newBook = new Book({ title, author, isbn, category });
    await newBook.save();

    res.status(201).json({ message: "The book has been successfully added!", book: newBook });
  } catch (err) {
    res.status(500).json({ message: "Book addition error", error: err.message });
  }
};

// Get All Books
const getAllBooks = async (req, res) => {
  try {
    const { search, category, availability, sortBy = 'title', page = 1, limit = 10 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (availability === 'true') filter.available = true;
    if (availability === 'false') filter.available = false;

    const books = await Book.find(filter)
      .populate("category")
      .sort({ [sortBy]: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Book.countDocuments(filter);

    res.status(200).json({
      books,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (err) {
    res.status(500).json({ message: "Books could not be loaded", error: err.message });
  }
};

// Get a book with ISBN
const getBookByISBN = async (req, res) => {
  const { isbn } = req.params;

  try {
    const book = await Book.findOne({ isbn });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ message: "Search error", error: err.message });
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookByISBN
};