const express = require("express");
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
} = require("../controllers/incidentController");

const router = express.Router();

router.get("/", getIncidents);
router.get("/:id", getIncidentById);
router.post("/", createIncident);
router.patch("/:id/status", updateIncidentStatus);

module.exports = router;