const User = require("../models/User");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

// Ger My Profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Profile could not be retrieved", error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user." });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    }).select("-password");
    if (!updated) return res.status(404).json({ error: "User not found." });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user." });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found." });
    res.json({ message: "User has been deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user." });
  }
};

// Suspend user
const suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    ).select("-password");
    res.json({ message: "User has been suspended.", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to suspend user." });
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: true },
      { new: true }
    ).select("-password");
    res.json({ message: "User has been activated.", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to activate user." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  getMyProfile
};
