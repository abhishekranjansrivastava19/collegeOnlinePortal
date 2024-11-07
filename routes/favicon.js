const path = require("path");
var express = require("express");
const router = express.Router();

router.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.ico")); // Adjust the path as necessary
});

module.exports = router