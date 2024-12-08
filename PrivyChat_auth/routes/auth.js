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

router.post(
  "/update-profile-pic",
  authenticateToken,
  upload.single("profile_pic"), // Handling the file upload
  async (req, res) => {
    console.log("Request body:", req.body);
    console.log("File:", req.file);

    try {
      // Check if file exists and if the buffer is not empty
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Log the file buffer size
      console.log("File buffer size:", req.file.buffer.length);

      if (req.file.buffer.length === 0) {
        return res.status(400).json({ error: "File is empty" });
      }

      const userId = req.user.id;

      // Fetch the user's current profile picture URL
      const result = await pool.query(
        "SELECT profile_pic FROM users WHERE id = $1",
        [userId]
      );
      const user = result.rows[0];
      console.log(user);

      // If no user found, return an error
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // If a current profile picture exists, delete it from Cloudinary
      if (user.profile_pic) {
        // Extract the public_id from the profile_pic URL
        const publicId = user.profile_pic
          .split("/")
          .slice(-2)
          .join("/")
          .replace(/\.[^.]+$/, ""); // Get the part after 'profile_pictures/'
        console.log("Deleting Cloudinary image with public_id:", publicId);

        //profile_pictures/nooajlkl1dzghjfdzhnb

        // Delete the old profile picture from Cloudinary
        await cloudinary.uploader.destroy(publicId);
      }

      // Convert file buffer to base64
      const fileBase64 = req.file.buffer.toString("base64");

      // Log the base64 string (make sure it's not empty or malformed)
      console.log("Base64 String: ", fileBase64.substring(0, 50)); // Log first 50 characters

      // Correctly format the base64 string for Cloudinary
      const base64String = `data:${req.file.mimetype};base64,${fileBase64}`;

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(base64String, {
        folder: "profile_pictures", // Specify folder (optional)
      });

      console.log("Cloudinary upload result:", uploadResult);

      if (!uploadResult.secure_url) {
        return res
          .status(400)
          .json({ error: "Failed to upload image to Cloudinary" });
      }

      // Update profile picture URL in the database
      const updatedUserResult = await pool.query(
        "UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING *",
        [uploadResult.secure_url, userId]
      );

      console.log("Updated user result:", updatedUserResult.rows[0]);

      // If no rows are updated, something went wrong with the database query
      if (updatedUserResult.rowCount === 0) {
        return res
          .status(400)
          .json({ error: "Profile picture update failed in database" });
      }

      res.status(200).json({ user: updatedUserResult.rows[0] });
    } catch (err) {
      console.error("Error updating profile picture:", err);
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
  u.active_status,
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

// Mark user as active
router.put("/user/active", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Update the user's active status in the database
    const result = await pool.query(
      "UPDATE users SET active_status = 'active' WHERE id = $1 RETURNING *",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User marked as active", user: result.rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to mark user as active", details: err.message });
  }
});

// Mark user as inactive
router.put("/user/inactive", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Update the user's active status in the database
    const result = await pool.query(
      "UPDATE users SET active_status = 'inactive' WHERE id = $1 RETURNING *",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User marked as inactive", user: result.rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to mark user as inactive", details: err.message });
  }
});

// Upload endpoint for an image
router.post("/image-upload", upload.single("file"), async (req, res) => {
  // console.log(req.body.roomId);
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert file buffer to Base64
    const fileBase64 = req.file.buffer.toString("base64");

    // Format Base64 string for Cloudinary
    const base64String = `data:${req.file.mimetype};base64,${fileBase64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder: `rooms/${req.body.roomId}`, // Optional: Specify folder
    });

    // Check for secure URL
    if (!uploadResult.secure_url) {
      return res
        .status(400)
        .json({ error: "Failed to upload image to Cloudinary" });
    }

    // Respond with the uploaded image URL
    res.status(200).json({ imageUrl: uploadResult.secure_url });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Upload endpoint for an image
router.post("/audio-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert file buffer to Base64
    const fileBase64 = req.file.buffer.toString("base64");

    // Format Base64 string for Cloudinary
    const base64String = `data:${req.file.mimetype};base64,${fileBase64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64String, {
      resource_type: "video", // Use video for audio files
      folder: `rooms/${req.body.roomId}`,
    });

    // Check for secure URL
    if (!uploadResult.secure_url) {
      return res
        .status(400)
        .json({ error: "Failed to upload audio to Cloudinary" });
    }

    // Respond with the uploaded audio URL
    res.status(200).json({ audioUrl: uploadResult.secure_url });
  } catch (error) {
    console.error("Error uploading audio:", error);
    res.status(500).json({ error: "Failed to upload audio" });
  }
});

module.exports = router;
