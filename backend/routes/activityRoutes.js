const express = require("express");
const {
  getActivities,
  getActivityById,
} = require("../controllers/activityController");

const router = express.Router();

router.get("/", getActivities);
router.get("/:id", getActivityById);

module.exports = router;