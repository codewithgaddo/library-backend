const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuth = require("../middlewares/roleAuthMiddleware");

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  getMyProfile
} = require("../controllers/userController");



router.get("/me", authMiddleware, getMyProfile)

// All user operations require: admin + token
router.use(authMiddleware, roleAuth(["admin"]));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/suspend", suspendUser);
router.patch("/:id/activate", activateUser);

module.exports = router;