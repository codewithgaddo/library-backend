const express = require("express");
const router = express.Router();

const { getAllBooks, addBook, getBookByISBN } = require("../controllers/bookController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuth = require("../middlewares/roleAuthMiddleware");

router.use(authMiddleware);

router.get("/", getAllBooks);
router.post("/", roleAuth(["librarian","admin"]), addBook);
router.get("/:isbn", getBookByISBN);

module.exports = router;
