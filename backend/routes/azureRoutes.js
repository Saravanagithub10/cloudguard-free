const express = require("express");
const {
  getResources,
} = require("../controllers/azureController");

const router = express.Router();

router.get("/resources", getResources);

module.exports = router;