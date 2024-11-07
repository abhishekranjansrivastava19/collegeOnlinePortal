const VocationalSubject = require("../models/vocationalsubject");
const College = require("../models/college")
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/:collegeId`, async (req, res, next) => {
  const { collegeId } = req.params;
  try {
    const subjects = await VocationalSubject.find({ collegeId: new mongoose.Types.ObjectId(collegeId) })
    .populate(
      "collegeId",
      "name logo address"
    );
    if (subjects.length === 0) {
      return res.status(404).json({ error: "No vocational subject found for this college" });
    }
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve vocational subjects",
      error: error.message,
    });
  }
});

router.get(`/:id`, async (req, res, next) => {
  const { id } = req.params;
  try {
    const vocationalSubject = await VocationalSubject.findById(id).populate("course");
    if (!vocationalSubject) {
      return res.status(404).json({ message: "Vocational subject not found" });
    }
    res.status(200).json(vocationalSubject);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve vocational subject",
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
    const existingSubject = await VocationalSubject.findOne({collegeId, subjectname})
    if(existingSubject){
      return res.status(400).json({ message: "Subject already exists for this college." });
    }
    const newVocationalSubject = new VocationalSubject({ collegeId, subjectname });

    // Save the new major subject
    //const savedSubject = 
    await newVocationalSubject.save();

    // Add the major subject to the course's majorSubjects array

    // course.majorSubjects.push(savedSubject._id);
    // await course.save();

    res.status(200).json({ message: "Vocational subject added successfully.", newVocationalSubject });
  } catch (error) {
    res.status(500).json({ message: "Error adding Vocational subject", error });
  }
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedVocationalSubject = await VocationalSubject.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedVocationalSubject) {
      return res.status(404).json({ message: "Vocational subject not found" });
    }
    res.status(200).json(updatedVocationalSubject);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update vocational subject",
        error: error.message,
      });
  }
});

router.delete(`/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedVocationalSubject = await VocationalSubject.findByIdAndDelete(id);
    if (!deletedVocationalSubject) {
      return res.status(404).json({ message: "Vocational subject not found" });
    }
    res.status(200).json({ message: "Vocational subject deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to delete Vocational subject",
        error: error.message,
      });
  }
});

module.exports = router;
