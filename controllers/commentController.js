const Comment = require('../models/Comment');
const Loan = require('../models/Loan');
const Book = require('../models/Book');

// Add Comment
exports.addComment = async (req, res) => {
    try {
        const { isbn, content, rating } = req.body;
        const studentId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'The score should be between 1 and 5.' });
        }

        // Find book with ISBN
        const trimmedIsbn = isbn?.trim();
        const book = await Book.findOne({ isbn: trimmedIsbn });

        if (!book) {
            console.error("Book not found for ISBN:", trimmedIsbn); // log
            return res.status(404).json({ error: 'Book not found.' });
        }

        const bookId = book._id;

        // Did the student borrow and return this book?
        const hasRead = await Loan.findOne({
            student: studentId,
            book: bookId,
            isReturned : true
        });

        if (!hasRead) {
            return res.status(403).json({ error: 'You can only comment on books you have returned.' });
        }

        // Commented Before
        const alreadyCommented = await Comment.findOne({ student: studentId, book: bookId });
        if (alreadyCommented) {
            return res.status(400).json({ error: 'You have already reviewed this book.' });
        }

        const comment = await Comment.create({
            student: studentId,
            book: bookId,
            content,
            rating
        });

        res.status(201).json(comment);
    } catch (err) {
        console.error("Error in addComment:", err);
        res.status(500).json({ error: 'No comments can be added.' });
    }
};

// Get all commented bookIds for this student
exports.getCommentStatusForBooks = async (req, res) => {
    try {
        const studentId = req.user.id;

        const comments = await Comment.find({ student: studentId }).select('book');
        const commentedBookIds = comments.map(c => c.book.toString());

        res.json({ commentedBookIds });
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch comment status list.' });
    }
};

// Get All Comments For Book
exports.getCommentsForBook = async (req, res) => {
    try {
        const comments = await Comment.find({ book: req.params.bookId })
            .populate('student', 'name surname studentNumber')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: 'Comments could not be retrieved.' });
    }
};

// Check if a comment has been made (for frontend)
exports.checkCommentStatus = async (req, res) => {
    try {
        const { bookId } = req.params;
        const studentId = req.user.id;

        const hasCommented = await Comment.exists({ student: studentId, book: bookId });
        res.json({ hasCommented: !!hasCommented });
    } catch (err) {
        res.status(500).json({ error: 'Comment status could not be verified.' });
    }
};

// Delete comment (admin/librarian only)
exports.deleteComment = async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'No comments found.' });
    }
    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: 'The comment could not be deleted.' });
  }
};