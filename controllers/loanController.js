const Loan = require("../models/Loan");
const Book = require("../models/Book");

// Book Loan (staff transaction)
const assignLoan = async (req, res) => {
  const { studentId, bookId } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book || !book.available) {
      return res.status(400).json({ message: "The book is not available." });
    }

    // Reserve the book
    book.available = false;
    await book.save();

    const newLoan = new Loan({ student: studentId, book: bookId });
    await newLoan.save();

    res.status(201).json({ message: "The book has been borrowed!", loan: newLoan });
  } catch (err) {
    res.status(500).json({ message: "An error occurred while lending", error: err.message });
  }
};

// Bring all loans (for the staff panel)
const getAllLoans = async (req, res) => {
  try {
    await checkAndUpdateLoanStatus(); // 🆕 overdue kontrolü

    const loans = await Loan.find()
      .populate("student", "-password")
      .populate("book");

    res.status(200).json(loans);
  } catch (err) {
    res.status(500).json({ message: "Loan list could not be retrieved", error: err.message });
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
    res.status(500).json({ message: "Student books could not be obtained", error: err.message });
  }
};

// Return the book (official procedure)
const returnLoan = async (req, res) => {
  const { id } = req.params;

  try {
    const loan = await Loan.findById(id);
    if (!loan) return res.status(404).json({ message: "No entry found" });

    loan.isReturned = true;
    loan.returnDate = new Date();

    // If it is late, save the penalty amount
    if (loan.dueDate && loan.returnDate > loan.dueDate) {
      const daysLate = Math.ceil((loan.returnDate - loan.dueDate) / (1000 * 60 * 60 * 24));
      const finePerDay = 5;
      loan.fine = daysLate * finePerDay;
      loan.status = "overdue";
    } else {
      loan.status = "returned";
    }

    await loan.save();

    const book = await Book.findById(loan.book);
    book.available = true;
    await book.save();

    res.status(200).json({ message: "The book has been returned", fine: loan.fine });
  } catch (err) {
    res.status(500).json({ message: "Error during returned", error: err.message });
  }
};

// Loss/damage report (student procedure)
const reportLostOrDamaged = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const loan = await Loan.findById(id);
    if (!loan) return res.status(404).json({ message: "No entry found" });

    loan.lostOrDamaged.status = true;
    loan.lostOrDamaged.note = note;
    await loan.save();

    res.status(200).json({ message: "Loss/damage reported" });
  } catch (err) {
    res.status(500).json({ message: "Reported error", error: err.message });
  }
};

const checkAndUpdateLoanStatus = async () => {
  const today = new Date();

  // Find active but overdue books
  const overdueLoans = await Loan.find({
    isReturned: false,
    dueDate: { $lt: today }
  });

  for (let loan of overdueLoans) {
    const daysLate = Math.ceil((today - loan.dueDate) / (1000 * 60 * 60 * 24));
    const finePerDay = 5;

    loan.status = "overdue";
    loan.fine = daysLate * finePerDay;
    await loan.save();
  }
};

module.exports = {
  assignLoan,
  getAllLoans,
  getLoansByStudent,
  returnLoan,
  reportLostOrDamaged
};
