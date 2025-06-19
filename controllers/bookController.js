const Book = require("../models/Book");

// Add book
const addBook = async (req, res) => {
  const { title, author, isbn, category } = req.body;

  try {
    const newBook = new Book({ title, author, isbn, category });
    await newBook.save();

    res.status(201).json({ message: "Kitap başarıyla eklendi!", book: newBook });
  } catch (err) {
    res.status(500).json({ message: "Kitap ekleme hatası", error: err.message });
  }
};

// Get All Books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("category");
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: "Kitaplar yüklenemedi", error: err.message });
  }
};

// Get a book with ISBN
const getBookByISBN = async (req, res) => {
  const { isbn } = req.params;

  try {
    const book = await Book.findOne({ isbn });

    if (!book) {
      return res.status(404).json({ message: "Kitap bulunamadı" });
    }

    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ message: "Arama hatası", error: err.message });
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookByISBN
};