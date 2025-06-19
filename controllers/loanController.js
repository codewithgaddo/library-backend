const Loan = require("../models/Loan");
const Book = require("../models/Book");

// Book Loan (staff transaction)
const assignLoan = async (req, res) => {
  const { studentId, bookId } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book || !book.available) {
      return res.status(400).json({ message: "Kitap mevcut değil." });
    }

    // Reserve the book
    book.available = false;
    await book.save();

    const newLoan = new Loan({ student: studentId, book: bookId });
    await newLoan.save();

    res.status(201).json({ message: "Kitap ödünç verildi!", loan: newLoan });
  } catch (err) {
    res.status(500).json({ message: "Ödünç verirken hata oluştu", error: err.message });
  }
};

// Bring all loans (for the staff panel)
const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate("student").populate("book");
    res.status(200).json(loans);
  } catch (err) {
    res.status(500).json({ message: "Ödünç listesi alınamadı", error: err.message });
  }
};

// The student's own books
const getLoansByStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    const loans = await Loan.find({ student: studentId, isReturned: false })
      .populate("book");

    res.status(200).json(loans);
  } catch (err) {
    res.status(500).json({ message: "Öğrenci kitapları alınamadı", error: err.message });
  }
};

// Return the book (official procedure)
const returnLoan = async (req, res) => {
  const { id } = req.params;

  try {
    const loan = await Loan.findById(id);
    if (!loan) return res.status(404).json({ message: "Kayıt bulunamadı" });

    loan.isReturned = true;
    loan.returnDate = new Date();
    await loan.save();

    // Kitabı müsait yap
    const book = await Book.findById(loan.book);
    book.available = true;
    await book.save();

    res.status(200).json({ message: "Kitap iade edildi" });
  } catch (err) {
    res.status(500).json({ message: "Teslim sırasında hata", error: err.message });
  }
};

// Loss/damage report (student procedure)
const reportLostOrDamaged = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const loan = await Loan.findById(id);
    if (!loan) return res.status(404).json({ message: "Kayıt bulunamadı" });

    loan.lostOrDamaged.status = true;
    loan.lostOrDamaged.note = note;
    await loan.save();

    res.status(200).json({ message: "Kayıp / hasar bildirildi" });
  } catch (err) {
    res.status(500).json({ message: "Bildirim hatası", error: err.message });
  }
};

module.exports = {
  assignLoan,
  getAllLoans,
  getLoansByStudent,
  returnLoan,
  reportLostOrDamaged
};
