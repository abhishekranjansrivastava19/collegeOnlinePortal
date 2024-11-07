const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "http://api.geonames.org/searchJSON?country=IN&featureCode=ADM1&maxRows=50&username=Abhi7905355614"
    );
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      // API responded with a status code outside the 2xx range
      console.error("API Error:", error.response.status, error.response.data);
      res
        .status(500)
        .json({ error: `API Error: ${error.response.data.status.message}` });
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received from API:", error.request);
      res.status(500).json({ error: "No response received from the API" });
    } else {
      // Other errors (network issues, etc.)
      console.error("Error fetching states:", error.message);
      res.status(500).json({ error: "Error fetching states" });
    }
  }
});

module.exports = router;
