const express = require("express");
const router = express.Router();

const {
  assignLoan,
  getAllLoans,
  getLoansByStudent,
  returnLoan,
  reportLostOrDamaged
} = require("../controllers/loanController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuth = require("../middlewares/roleAuthMiddleware");

router.use(authMiddleware);

router.post("/", roleAuth(["librarian"]), assignLoan); 
router.get("/", roleAuth(["librarian", "admin"]), getAllLoans); 
router.get("/student/:studentId", roleAuth(["student"]), getLoansByStudent); 
router.patch("/:id/return", roleAuth(["librarian"]), returnLoan); 
router.patch("/:id/lost", roleAuth(["student"]), reportLostOrDamaged); 

module.exports = router;
