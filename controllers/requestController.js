const Request = require("../models/Request");
const Loan = require("../models/Loan");
const Book = require("../models/Book");

// Create a borrow or extend request
const createRequest = async (req, res) => {
  try {
    const { bookId, type } = req.body;
    const studentId = req.user.id;

    if (!bookId || !type) {
      return res.status(400).json({ error: "bookId and type are required." });
    }

    if (!["borrow", "extend"].includes(type)) {
      return res.status(400).json({ error: "Invalid request type." });
    }

    const existing = await Request.findOne({
      student: studentId,
      book: bookId,
      type,
      status: "pending"
    });

    if (existing) {
      return res.status(409).json({ error: "You already have a pending request for this book and type." });
    }

    if (type === "extend") {
      const activeLoan = await Loan.findOne({
        student: studentId,
        book: bookId,
        isReturned: false
      });

      if (!activeLoan) {
        return res.status(400).json({ error: "You must have an active loan to request an extension." });
      }

      if (activeLoan.extended) {
        return res.status(400).json({ error: "This loan has already been extended once." });
      }
    }

    const newRequest = await Request.create({
      student: studentId,
      book: bookId,
      type
    });

    res.status(201).json({ message: "Request submitted successfully.", request: newRequest });
  } catch (err) {
    console.error("createRequest error:", err);
    res.status(500).json({ error: "Failed to submit request." });
  }
};

// Get all requests (admin/librarian)
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("student", "name surname email")
      .populate("book", "title author");

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests." });
  }
};

// Approve a request
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id).populate("book");

    if (!request || request.status !== "pending") {
      return res.status(404).json({ error: "Request not found or already processed." });
    }

    if (request.type === "borrow") {
      if (!request.book.available) {
        return res.status(400).json({ error: "The book is currently unavailable." });
      }

      const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      await Loan.create({
        student: request.student,
        book: request.book._id,
        dueDate
      });

      request.book.available = false;
      await request.book.save();
    }

    if (request.type === "extend") {
      const loan = await Loan.findOne({
        student: request.student,
        book: request.book._id,
        isReturned: false
      });

      if (!loan) return res.status(404).json({ error: "Active loan not found for this book." });

      loan.dueDate = new Date(loan.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      loan.extended = true;
      await loan.save();
    }

    request.status = "approved";
    request.decisionDate = new Date();
    await request.save();

    res.json({ message: "Request approved." });
  } catch (err) {
    console.error("approveRequest error:", err);
    res.status(500).json({ error: "Failed to approve request." });
  }
};

// Reject a request
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ error: "Request not found or already processed." });
    }

    request.status = "rejected";
    request.decisionDate = new Date();
    await request.save();

    res.json({ message: "Request rejected." });
  } catch (err) {
    console.error("rejectRequest error:", err);
    res.status(500).json({ error: "Failed to reject request." });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  approveRequest,
  rejectRequest
};
