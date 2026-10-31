const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { register } = require("azfn-express");

const healthRoutes = require("./routes/healthRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const alertRoutes = require("./routes/alertRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const reportRoutes = require("./routes/reportRoutes");
const azureRoutes = require("./routes/azureRoutes");
const metricsRoutes = require("./routes/metricsRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/azure", azureRoutes);
app.use("/api/metrics", metricsRoutes);

register(app, "CloudGuardApi", {
  route: "{*segments}",
  authLevel: "anonymous",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
});
