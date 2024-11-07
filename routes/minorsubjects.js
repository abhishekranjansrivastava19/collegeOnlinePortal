const express = require("express");
const MinorSubject = require("../models/minorsubject");
const College = require("../models/college")
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/:collegeId`, async (req, res, next) => {
  const { collegeId } = req.params;
  try {
    const subjects = await MinorSubject.find({ collegeId: new mongoose.Types.ObjectId(collegeId) })
    .populate(
      "collegeId",
      "name logo address"
    );
    if (subjects.length === 0) {
      return res.status(404).json({ error: "No minor subject found for this college" });
    }
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve minor subjects",
      error: error.message,
    });
  }
});

router.get(`/:id`, async (req, res, next) => {
  const { id } = req.params;
  try {
    const minorSubject = await MinorSubject.findById(id).populate("course");
    if (!minorSubject) {
      return res.status(404).json({ message: "Minor subject not found" });
    }
    res.status(200).json(minorSubject);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve minor subject",
      error: error.message,
    });
  }
});


// Single API to add major subject 
router.post("/:collegeId", async (req, res) => {
  try {
    const {collegeId} = req.params
    const { subjectname } = req.body;

    if (!collegeId || !subjectname) {
      return res.status(400).json({ message: "College ID and Subject name are required." });
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: "College not found." });
    }
    const existingSubject = await MinorSubject.findOne({collegeId, subjectname})
    if(existingSubject){
      return res.status(400).json({ message: "Subject already exists for this college." });
    }
    const newMinorSubject = new MinorSubject({ collegeId, subjectname });

    // Save the new major subject
    //const savedSubject = 
    await newMinorSubject.save();

    // Add the major subject to the course's majorSubjects array

    // course.majorSubjects.push(savedSubject._id);
    // await course.save();

    res.status(200).json({ message: "Minor subject added successfully.", newMinorSubject });
  } catch (error) {
    res.status(500).json({ message: "Error adding minor subject", error });
  }
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedMinorSubject = await MinorSubject.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedMinorSubject) {
      return res.status(404).json({ message: "Minor subject not found" });
    }
    res.status(200).json(updatedMinorSubject);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update minor subject",
        error: error.message,
      });
  }
});

router.delete(`/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedMinorSubject = await MinorSubject.findByIdAndDelete(id);
    if (!deletedMinorSubject) {
      return res.status(404).json({ message: "Minor subject not found" });
    }
    res.status(200).json({ message: "Minor subject deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to delete minor subject",
        error: error.message,
      });
  }
});

module.exports = router;
