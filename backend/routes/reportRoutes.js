const express = require("express");
const {
  getSecurityReport,
  downloadFindingsCsv,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/", getSecurityReport);
router.get("/findings.csv", downloadFindingsCsv);

module.exports = router;