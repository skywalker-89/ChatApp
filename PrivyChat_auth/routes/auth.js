const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const authenticateToken = require("../middleware/auth");
require("dotenv").config();

const router = express.Router();

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register User
router.post("/register", upload.single("profile_pic"), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Upload profile picture to Cloudinary (if provided)
    let profilePicUrl = null;
    if (req.file) {
      const fileBase64 = req.file.buffer.toString("base64"); // Convert buffer to base64
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${fileBase64}`,
        {
          folder: "profile_pictures",
        }
      );
      profilePicUrl = result.secure_url; // Save the secure URL
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const result = await pool.query(
      "INSERT INTO users (name, email, password, profile_pic) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, profilePicUrl]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    res
      .status(400)
      .json({ error: "User registration failed", details: err.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// Change Password
router.post("/change-password", authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ error: "Incorrect old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedNewPassword,
      req.user.id,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to change password", details: err.message });
  }
});

// Update Profile Picture
router.post(
  "/update-profile-pic",
  authenticateToken,
  upload.single("profile_pic"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Upload profile picture to Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        { folder: "profile_pictures" },
        (err, uploadResult) => {
          if (err) throw new Error("Cloudinary upload failed");
          return uploadResult;
        }
      );

      // Update profile picture URL in the database
      const updatedUser = await pool.query(
        "UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING *",
        [result.secure_url, userId]
      );

      res.status(200).json({ user: updatedUser.rows[0] });
    } catch (err) {
      res.status(400).json({
        error: "Failed to update profile picture",
        details: err.message,
      });
    }
  }
);

// Get Profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, profile_pic FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch user profile", details: err.message });
  }
});

// Get all friends for the authenticated user
router.get("/friends", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Retrieve user ID from the JWT token
    const result = await pool.query(
      `SELECT 
  u.id, 
  u.name, 
  u.email, 
  u.profile_pic,
  f.organization
FROM 
  friends f
JOIN 
  users u ON u.id = f.friend_id
WHERE 
  f.user_id = $1 
  AND f.status = 'accepted';`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch friends", details: err.message });
  }
});

// Add a friend for the authenticated user
router.post("/friends", authenticateToken, async (req, res) => {
  const { friendId } = req.body;

  try {
    const userId = req.user.id;

    // Check if the friend relationship already exists
    const checkResult = await pool.query(
      `SELECT * FROM friends WHERE user_id = $1 AND friend_id = $2`,
      [userId, friendId]
    );
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: "Friend already added" });
    }

    // Insert friend relationship into the database
    await pool.query(
      `INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)`,
      [userId, friendId]
    );

    // both way friend adding
    await pool.query(
      `INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)`,
      [friendId, userId]
    );

    res.status(201).json({ message: "Friend added successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to add friend", details: err.message });
  }
});

// Remove a friend for the authenticated user
router.delete("/friends/:friendId", authenticateToken, async (req, res) => {
  const { friendId } = req.params;

  try {
    const userId = req.user.id;

    // Delete both directions of the friend relationship
    const result = await pool.query(
      `DELETE FROM friends 
         WHERE (user_id = $1 AND friend_id = $2) 
            OR (user_id = $2 AND friend_id = $1)`,
      [userId, friendId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Friend not found" });
    }

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to remove friend", details: err.message });
  }
});

// Update friend's organization (optional, based on your FriendPage functionality)
router.put("/friends/:friendId", authenticateToken, async (req, res) => {
  const { friendId } = req.params;
  const { organization } = req.body;

  try {
    const userId = req.user.id;

    // Check if the friend relationship exists between the user and the friend
    const checkFriendship = await pool.query(
      `SELECT * FROM friends WHERE user_id = $1 AND friend_id = $2`,
      [userId, friendId]
    );

    if (checkFriendship.rows.length === 0) {
      return res.status(404).json({ error: "Friend not found" });
    }

    // Update the organization field
    const result = await pool.query(
      `UPDATE friends SET organization = $1 WHERE user_id = $2 AND friend_id = $3 RETURNING *`,
      [organization, userId, friendId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Failed to update organization" });
    }

    res.status(200).json({
      message: "Organization updated",
      friend: result.rows[0], // Return the updated friend details
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update organization",
      details: err.message,
    });
  }
});

module.exports = router;
