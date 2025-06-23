const express = require("express");
const router = express.Router();
const {
 addComment,
 getCommentStatusForBooks,
 getCommentsForBook,
 deleteComment
} = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuth = require("../middlewares/roleAuthMiddleware");

router.use(authMiddleware);

router.post('/', roleAuth(['student','librarian']), addComment);
router.get('/status', roleAuth(['student','librarian']), getCommentStatusForBooks);
router.get('/:bookId', getCommentsForBook);
router.delete('/:id', roleAuth(['admin', 'librarian']),  deleteComment);

module.exports = router;