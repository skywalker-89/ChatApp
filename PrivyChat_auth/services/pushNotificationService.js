// PrivyChat_auth/services/pushNotificationService.js

const pool = require("../config/db"); // Import your database connection

// Save the push token for the user
async function savePushToken(userId, pushToken) {
  try {
    await pool.query("UPDATE users SET push_token = $1 WHERE id = $2", [
      pushToken,
      userId,
    ]);
    console.log(`Push token saved for user: ${userId}`);
  } catch (error) {
    console.error("Error saving push token:", error);
  }
}

// Retrieve the push token for the user
async function getPushToken(userId) {
  try {
    const result = await pool.query(
      "SELECT push_token FROM users WHERE id = $1",
      [userId]
    );
    return result.rows[0]?.push_token;
  } catch (error) {
    console.error("Error retrieving push token:", error);
    return null;
  }
}

module.exports = { savePushToken, getPushToken };
