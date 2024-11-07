const MajorSubject = require("../models/majorsubject");
const College = require("../models/college")
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/:collegeId`, async (req, res, next) => {
  const { collegeId } = req.params;
  try {
    const subjects = await MajorSubject.find({ collegeId: new mongoose.Types.ObjectId(collegeId) })
    .populate(
      "collegeId",
      "name logo address"
    );
    if (subjects.length === 0) {
      return res.status(404).json({ error: "No major subject found for this college" });
    }
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve major subjects",
      error: error.message,
    });
  }
});

router.get(`/:id`, async (req, res, next) => {
  const { id } = req.params;
  try {
    const majorSubject = await MajorSubject.findById(id).populate("course");
    if (!majorSubject) {
      return res.status(404).json({ message: "Major subject not found" });
    }
    res.status(200).json(majorSubject);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve major subject",
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
    const existingSubject = await MajorSubject.findOne({collegeId, subjectname})
    if(existingSubject){
      return res.status(400).json({ message: "Subject already exists for this college." });
    }
    const newMajorSubject = new MajorSubject({ collegeId, subjectname });

    // Save the new major subject
    //const savedSubject = 
    await newMajorSubject.save();

    // Add the major subject to the course's majorSubjects array

    // course.majorSubjects.push(savedSubject._id);
    // await course.save();

    res.status(200).json({ message: "Major subject added successfully.", newMajorSubject });
  } catch (error) {
    res.status(500).json({ message: "Error adding major subject", error });
  }
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedMajorSubject = await MajorSubject.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedMajorSubject) {
      return res.status(404).json({ message: "Major subject not found" });
    }
    res.status(200).json(updatedMajorSubject);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update major subject",
        error: error.message,
      });
  }
});

router.delete(`/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedMajorSubject = await MajorSubject.findByIdAndDelete(id);
    if (!deletedMajorSubject) {
      return res.status(404).json({ message: "Major subject not found" });
    }
    res.status(200).json({ message: "Major subject deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to delete major subject",
        error: error.message,
      });
  }
});

module.exports = router;
