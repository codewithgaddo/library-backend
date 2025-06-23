const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const generatePassword = require("../utils/generatePassword");

const register = async (req, res) => {
  try {
    const { name, surname, country, role, email, password, studentNumber } = req.body;

    let finalEmail = email;
    let finalPassword = password;

    // Auto-generate if student
    if (role === "student") {
      if (!studentNumber) {
        return res.status(400).json({ error: "Student number is required for student role." });
      }
      finalEmail = `${studentNumber}@schoolmail.com`;
      finalPassword = generatePassword();
    } else {
      // For other roles, email & password must be provided
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required for non-student roles." });
      }
    }

    const existing = await User.findOne({ email: finalEmail });
    if (existing) return res.status(400).json({ error: "Email is already registered." });

    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const newUser = new User({
      name,
      surname,
      country,
      role: role || "student",
      email: finalEmail,
      password: hashedPassword,
      studentNumber: role === "student" ? studentNumber : undefined
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration successful",
      email: finalEmail,
      password: role === "student" ? finalPassword : "Provided by user"
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.active) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentNumber: user.studentNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

const logout = (req, res) => {
  res.status(200).json({ message: "Logout successful. Please remove token on client." });
};

const refreshToken = async (req, res) => {
  const token = req.body.token;
  if (!token) return res.status(401).json({ error: "Refresh token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ error: "Invalid or unauthorised token" });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (err) {
    res.status(403).json({ error: "Token could not be verified" });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Current password is incorrect." });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password successfully updated." });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ error: "An error occurred while changing the password." });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  changePassword
};