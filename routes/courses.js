const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const mongoose = require("mongoose");
const MajorSubject = require("../models/majorsubject");
const MinorSubject = require("../models/minorsubject");
const VocationalSubject = require("../models/vocationalsubject");

router.get(`/:collegeId/`, async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid Stream Id" });
    }
    const course = await Course.find({
      collegeId: new mongoose.Types.ObjectId(collegeId),
    }).populate("streamId", "name");
    if (course.length === 0) {
      return res
        .status(404)
        .json({ error: "No course found for this college" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get(`/getCourse/:id`, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("majorSubjects") // Populate major subjects
      .populate("minorSubjects") // Populate minor subjects
      .populate("vocationalSubjects"); // Populate vocational subjects;
    if (!course) {
      return res
        .status(500)
        .json({ message: "The course with the given ID was not found." });
    }
    return res.status(200).json(course);
  } catch (error) {
    next(error);
  }
});

router.post("/:streamId/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { streamId } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid College ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(streamId)) {
      return res.status(400).json({ error: "Invalid Stream ID format" });
    }
    const existingCourse = await Course.findOne({ name: req.body.name });
    if (existingCourse) {
      return res.status(400).send("Course is already registered");
    }
    const newCourse = new Course({
      collegeId: collegeId,
      streamId: streamId,
      name: name,
      courseType: req.body.courseType,
      registrationAmt: req.body.registrationAmt,
      lastDate: req.body.lastDate,
      maxMajor: req.body.maxMajor,
      maxMinor: req.body.maxMinor,
      maxVocational: req.body.maxVocational,
      majorSubjects: req.body.majorSubjects,
      minorSubjects: req.body.minorSubjects,
      vocationalSubjects: req.body.vocationalSubjects,
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    console.error("Error creating Course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:courseId/majorSubjects", async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId).populate("majorSubjects");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course.majorSubjects);
  } catch (error) {
    console.error("Error fetching major subjects:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:courseId/minorSubjects", async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId).populate("minorSubjects");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course.minorSubjects);
  } catch (error) {
    console.error("Error fetching minor subjects:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:courseId/vocationalSubjects", async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId).populate(
      "vocationalSubjects"
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course.vocationalSubjects);
  } catch (error) {
    console.error("Error fetching vocational subjects:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:courseId/removeSubjects", async (req, res) => {
  const { subjectId } = req.body; // Get the subject ID from the request body

  if (!subjectId) {
    return res.status(400).json({ message: "Subject ID is required" });
  }

  try {
    // Find the course by ID and remove the subject ID from the majorSubjects array
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $pull: { majorSubjects: subjectId } }, // $pull operator to remove the subject ID
      { new: true } // Return the updated course
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course); // Respond with the updated course object
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:courseId/removeVocationalSubjects", async (req, res) => {
  const { subjectId } = req.body; // Get the subject ID from the request body

  if (!subjectId) {
    return res.status(400).json({ message: "Subject ID is required" });
  }

  try {
    // Find the course by ID and remove the subject ID from the majorSubjects array
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $pull: { vocationalSubjects: subjectId } }, // $pull operator to remove the subject ID
      { new: true } // Return the updated course
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course); // Respond with the updated course object
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:courseId/removeMinorSubjects", async (req, res) => {
  const { subjectId } = req.body; // Get the subject ID from the request body

  if (!subjectId) {
    return res.status(400).json({ message: "Subject ID is required" });
  }

  try {
    // Find the course by ID and remove the subject ID from the majorSubjects array
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $pull: { minorSubjects: subjectId } }, // $pull operator to remove the subject ID
      { new: true } // Return the updated course
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course); // Respond with the updated course object
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:courseId/addSubjects", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { subjectIds } = req.body;

    if (!courseId || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        message: "Course ID and an array of Subject IDs are required.",
      });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    const existingSubjects = await MajorSubject.find({
      _id: { $in: subjectIds },
    });

    const existingSubjectIds = course.majorSubjects.map((subject) =>
      subject.toString()
    );
    const newSubjectsToAdd = subjectIds.filter(
      (subjectId) =>
        existingSubjectIds.indexOf(subjectId) === -1 &&
        existingSubjects.some((subject) => subject._id.toString() === subjectId)
    );
    if (newSubjectsToAdd.length === 0) {
      return res.status(400).json({
        message: "All subjects are either already added or do not exist.",
      });
    }

    course.majorSubjects.push(...newSubjectsToAdd);
    await course.save();

    res.status(200).json({
      message: "Subjects added to the course successfully.",
      course,
    });
  } catch (error) {
    console.error("Error adding subjects to course:", error); // Log the error
    res.status(500).json({ message: "Error adding subjects to course", error });
  }
});

router.put("/:courseId/addMinorSubjects", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { subjectIds } = req.body;

    if (!courseId || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        message: "Course ID and an array of Subject IDs are required.",
      });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    const existingSubjects = await MinorSubject.find({
      _id: { $in: subjectIds },
    });

    const existingSubjectIds = course.minorSubjects.map((subject) =>
      subject.toString()
    );
    const newSubjectsToAdd = subjectIds.filter(
      (subjectId) =>
        existingSubjectIds.indexOf(subjectId) === -1 &&
        existingSubjects.some((subject) => subject._id.toString() === subjectId)
    );
    if (newSubjectsToAdd.length === 0) {
      return res.status(400).json({
        message: "All subjects are either already added or do not exist.",
      });
    }

    course.minorSubjects.push(...newSubjectsToAdd);
    await course.save();

    res.status(200).json({
      message: "Subjects added to the course successfully.",
      course,
    });
  } catch (error) {
    console.error("Error adding subjects to course:", error); // Log the error
    res.status(500).json({ message: "Error adding subjects to course", error });
  }
});

router.put("/:courseId/addVocationalSubjects", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { subjectIds } = req.body;

    if (!courseId || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        message: "Course ID and an array of Subject IDs are required.",
      });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    const existingSubjects = await VocationalSubject.find({
      _id: { $in: subjectIds },
    });

    const existingSubjectIds = course.vocationalSubjects.map((subject) =>
      subject.toString()
    );
    const newSubjectsToAdd = subjectIds.filter(
      (subjectId) =>
        existingSubjectIds.indexOf(subjectId) === -1 &&
        existingSubjects.some((subject) => subject._id.toString() === subjectId)
    );
    if (newSubjectsToAdd.length === 0) {
      return res.status(400).json({
        message: "All subjects are either already added or do not exist.",
      });
    }

    course.vocationalSubjects.push(...newSubjectsToAdd);
    await course.save();

    res.status(200).json({
      message: "Subjects added to the course successfully.",
      course,
    });
  } catch (error) {
    console.error("Error adding subjects to course:", error); // Log the error
    res.status(500).json({ message: "Error adding subjects to course", error });
  }
});

router.put("/:courseId", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(400).send("invalid course");

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.courseId,
      {
        streamId: req.params.streamId,
        name: req.body.name,
        courseType: req.body.courseType,
        registrationAmt: req.body.registrationAmt,
        maxMajor: req.body.maxMajor,
        maxMinor: req.body.maxMinor,
        maxVocational: req.body.maxVocational,
        lastDate: req.body.lastDate,
      },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete(`/:id`, (req, res) => {
  Course.findByIdAndDelete(req.params.id)
    .then((course) => {
      if (course) {
        return res
          .status(200)
          .json({ sucess: true, message: "the course is deleted!!" });
      } else {
        return res
          .status(404)
          .json({ sucess: false, message: "course not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ sucess: false, error: err });
    });
});

module.exports = router;
