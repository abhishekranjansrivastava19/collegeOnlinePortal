const Caste = require("../models/caste");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/:collegeId`, async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid College Id" });
    } 
    const caste = await Caste.find({ collegeId: new mongoose.Types.ObjectId(collegeId) })
    .populate(
      "collegeId",
      "name logo address"
    );
    if (caste.length === 0) {
      return res.status(404).json({ error: "No caste found for this college" });
    }

    res.status(200).json(caste);
  } catch (error) {
    console.error("Error fetching caste:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.get(`/:id`, async (req, res, next) => {
  try {
    const caste = await Caste.findById(req.params.id);

    if (!caste) {
      return res
        .status(500)
        .json({ message: "The caste with the given ID was not found." });
    }

    return res.status(200).json(caste);
  } catch (error) {
    next(error); 
  }
});


router.post("/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid College ID format" });
    }
    const existingCaste = await Caste.findOne({ collegeId, name });
    if (existingCaste) {
      return res.status(400).send("Caste is already registered");
    }
    const newCaste = new Caste({
      collegeId: collegeId,
      name: name,
    });

    await newCaste.save();
    res.status(201).json(newCaste);
  } catch (error) {
    console.error("Error creating caste:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/:casteId", async (req, res) => {
  try {
    const caste = await Caste.findById(req.params.casteId);
    if (!caste) return res.status(400).send("invalid caste");

    const updatedCaste = await Caste.findByIdAndUpdate(
      req.params.casteId,
      {
        name: req.body.name,
      },
      {new: true}
    );

    if (!updatedCaste) {
      return res.status(404).json({ message: "Caste not found" });
    }

    res.status(200).json(updatedCaste);
  } catch (error) {
    console.error("Error updating caste:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.delete(`/:id`, (req, res) => {
    Caste.findByIdAndDelete(req.params.id)
    .then((caste) => {
      if (caste) {
        return res
          .status(200)
          .json({ sucess: true, message: "the caste is deleted!!" });
      } else {
        return res
          .status(404)
          .json({ sucess: false, message: "caste not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ sucess: false, error: err });
    });
});


module.exports = router;
