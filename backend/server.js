const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const resourceRoutes = require("./routes/resourceRoutes");
const alertRoutes = require("./routes/alertRoutes");

const healthRoutes = require("./routes/healthRoutes");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CloudGuard Free API",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/alerts", alertRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CloudGuard backend running at http://localhost:${PORT}`);
});