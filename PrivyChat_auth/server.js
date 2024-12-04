const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");
const pool = require("./config/db");

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/auth", authRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
