const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const healthRoutes = require("./routes/healthRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const alertRoutes = require("./routes/alertRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const activityRoutes = require("./routes/activityRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/activity", activityRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CloudGuard backend running at http://localhost:${PORT}`);
});