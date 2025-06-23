const express = require('express');
const router = express.Router();

const { logout, refreshToken, login, register, changePassword } = require('../controllers/authController');
const authMiddleware = require("../middlewares/authMiddleware")

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/refresh', refreshToken);
router.patch('/change-password', authMiddleware, changePassword)
module.exports = router;