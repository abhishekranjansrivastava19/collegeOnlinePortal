const StudentMaster = require("../models/studentMaster");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");



router.get(`/get/:studentId`, async (req, res, next) => {
  const { studentId } = req.params;
  try {
    const student = await StudentMaster.find({
      student: new mongoose.Types.ObjectId(studentId),
    });
    // .populate({ path: "studentId", select: "course" }) // Populate major subjects with only 'name'
    if (!student) {
      return res
        .status(500)
        .json({ message: "The student with the given ID was not found." });
    }
    return res.status(200).json(student);
  } catch (error) {
    next(error);
  }
});


const updateFields = (existingData, newData) => {
  Object.keys(newData).forEach((key) => {
    if (newData[key] !== undefined && newData[key] !== "") {
      existingData[key] = newData[key];
    }
  });
  return existingData;
};

router.post("/:studentId", async (req, res) => {
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: "Invalid studentId format" });
  }

  try {
    // Check if the student already exists
    let studentMaster = await StudentMaster.findOne({
      student: new mongoose.Types.ObjectId(studentId),
    });

    if (studentMaster) {
      // If student exists, update their data
      const updatedData = {
        father_name: req.body.father_name,
        mother_name: req.body.mother_name,
        permanent_address: req.body.permanent_address,
        correspondence_address: req.body.correspondence_address,
        father_phone: req.body.father_phone,
        mother_phone: req.body.mother_phone,
        father_occupation: req.body.father_occupation,
        mother_occupation: req.body.mother_occupation,
        father_qualification: req.body.father_qualification,
        mother_qualification: req.body.mother_qualification,
        aadhar_no: req.body.aadhar_no,
        caste: req.body.caste,
        religion: req.body.religion,
      };

      // Update only fields with valid non-empty data
      studentMaster = updateFields(studentMaster, updatedData);

      const updatedStudentMaster = await studentMaster.save();

      return res.status(200).json({
        message: "Student data updated successfully",
        studentMaster: updatedStudentMaster,
      });
    } else {
      // If student does not exist, create new entry
      studentMaster = new StudentMaster({
        student: studentId,
        father_name: req.body.father_name,
        mother_name: req.body.mother_name,
        permanent_address: req.body.permanent_address,
        correspondence_address: req.body.correspondence_address,
        father_phone: req.body.father_phone,
        mother_phone: req.body.mother_phone,
        father_occupation: req.body.father_occupation,
        mother_occupation: req.body.mother_occupation,
        father_qualification: req.body.father_qualification,
        mother_qualification: req.body.mother_qualification,
        aadhar_no: req.body.aadhar_no,
        caste: req.body.caste,
        religion: req.body.religion,
      });

      const createdStudentMaster = await studentMaster.save();
      return res.status(201).json({
        message: "StudentMaster entry created successfully",
        studentMaster: createdStudentMaster,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
