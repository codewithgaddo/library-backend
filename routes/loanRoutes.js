const express = require("express");
const router = express.Router();

const {
  assignLoan,
  getAllLoans,
  getLoansByStudent,
  returnLoan,
  reportLostOrDamaged
} = require("../controllers/loanController");

router.post("/loans", assignLoan); 
router.get("/loans", getAllLoans); 
router.get("/loans/my/:studentId", getLoansByStudent); 
router.patch("/loans/:id/return", returnLoan); 
router.patch("/loans/:id/lost", reportLostOrDamaged); 

module.exports = router;
