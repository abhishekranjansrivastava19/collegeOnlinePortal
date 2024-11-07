const Student = require("../models/student");
const Admin = require("../models/admin");
const College = require("../models/college");
const Session = require("../models/session");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const StudentMaster = require("../models/studentMaster");
const Document = require("../models/document");



router.get("/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;

    // Validate the collegeId
    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid College ID" });
    }

    // Fetch students by college ID
    const students = await Student.find({ collegeId: collegeId, isFinalized: true })
      .populate({ path: "collegeId", select: "name logo address" })
      .populate({ path: "session", select: "name" })
      .populate({ path: "course", select: "name registrationAmt" })
      .populate({ path: "majorSubjects", select: "subjectname" })
      .populate({ path: "minorSubjects", select: "subjectname" })
      .populate({ path: "vocationalSubjects", select: "subjectname" });

    // Check if students were found
    if (students.length === 0) {
      return res.status(404).json({ error: "No students found for this college" });
    }

    // Fetch StudentMaster details for each student
    const studentData = await Promise.all(
      students.map(async (student) => {
        const studentMaster = await StudentMaster.findOne({ student: student._id }).select(
          "father_name mother_name permanent_address correspondence_address father_phone father_occupation father_qualification mother_phone mother_qualification mother_occupation aadhar_no caste religion"
        );

        // Return a combined student object with StudentMaster details
        return {
          ...student.toObject(),
          studentMaster: studentMaster ? studentMaster.toObject() : null,
        };
      })
    );

    // Send the response with all student data
    res.status(200).json(studentData);
  } catch (error) {
    console.error("Error fetching students by college ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get(`/getStudent/:id`, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate({ path: "majorSubjects", select: "subjectname" }) // Populate major subjects with only 'name'
      .populate({ path: "minorSubjects", select: "subjectname" }) // Populate minor subjects with only 'name'
      .populate({ path: "vocationalSubjects", select: "subjectname" }) // Populate vocational subjects with only 'name'
      .populate({ path: "course", select: "name registrationAmt" }) // Populate course with only 'name'
      .populate({ path: "session", select: "name" }); // Populate course with only 'name'
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

router.get(`/getStudentDetails/:id`, async (req, res, next) => {
  try {
    // Fetch the student data and populate related fields
    const student = await Student.findById(req.params.id)
      .populate({ path: "majorSubjects", select: "subjectname" })
      .populate({ path: "minorSubjects", select: "subjectname" })
      .populate({ path: "vocationalSubjects", select: "subjectname" })
      .populate({ path: "course", select: "name registrationAmt" })
      .populate({ path: "session", select: "name" });

    if (!student) {
      return res.status(404).json({ message: "The student with the given ID was not found." });
    }

    // Fetch related data from StudentMaster and Document collections
    const studentMasterData = await StudentMaster.findOne({ student: req.params.id });
    const documentData = await Document.findOne({ student: req.params.id });
    console.log(documentData)
    // Merge all data into a single object
    const studentDetails = {
      ...student.toObject(),             
      ...studentMasterData?.toObject(),  
      ...documentData?.toObject()   
    };

    return res.status(200).json(studentDetails);
  } catch (error) {
    next(error);
  }
});

router.post("/:collegeId/register", async (req, res) => {
  const { collegeId } = req.params; // Extract collegeId from the URL parameters
  const { email } = req.body; // Extract email from the URL parameters
  // Validate if collegeId is present
  if (!collegeId) {
    return res.status(400).send("collegeId is required");
  }
  const existingStudent = await Student.findOne({ email });
  const existingAdmin = await Admin.findOne({ email });

  const session = await Session.findById(req.body.session);

  if (!session) {
    return res.status(400).json({ error: "Invalid session selected." });
  }

  const currentDate = new Date();

  // Check if the current date is within the session's start and end date range
  if (currentDate < session.start || currentDate > session.end) {
    return res.status(400).json({
      error:
        "The selected session is not valid. Please select a session within the valid date range.",
    });
  }
  if (
    !req.body.majorSubjects ||
    !req.body.minorSubjects ||
    !req.body.vocationalSubjects
  ) {
    return res.status(400).json({ message: "Subjects cannot be empty." });
  }
  const { courseType, twelthQualification, ugQualification } = req.body;

  // Validation checks
  if (courseType === "Under Graduate" && !twelthQualification) {
    return res
      .status(400)
      .json({ error: "12th qualification is mandatory for UG course type." });
  }

  if (courseType === "Post Graduate" && !ugQualification) {
    return res
      .status(400)
      .json({ error: "UG qualification is mandatory for PG course type." });
  }

  if (existingStudent) {
    return res.status(201).send("Email is already registered");
  }
  if (existingAdmin) {
    return res.status(201).send("Email is already registered");
  }

  let student = new Student({
    fname: req.body.fname,
    lname: req.body.lname,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    email: email,
    phone: req.body.phone,
    dob: req.body.dob,
    gender: req.body.gender,
    session: req.body.session,
    collegeId: collegeId,
    courseType: req.body.courseType,
    course: req.body.course,
    isFinalized: req.body.isFinalized,
    majorSubjects: req.body.majorSubjects,
    minorSubjects: req.body.minorSubjects,
    vocationalSubjects: req.body.vocationalSubjects,
    tenthQualification: req.body.tenthQualification,
    twelthQualification: req.body.twelthQualification,
    ugQualification: req.body.ugQualification,
    paymentStatus: req.body.paymentStatus,
  });

  student = await student.save();
  if (!student)
    return res.status(400).send("the student cannot be registered!");

  res.send(student);
});

router.put(`/:collegeId/:id`, async (req, res, next) => {
  const student = await Student.findById(req.params.id);
  const { collegeId } = req.params;
  if (!student) return res.status(400).send("invalid student");

  let email = student.email; // Default to current email
  if (req.body.email !== student.email) {
    const updatedEmail = req.body.email;

    const existingStudentWithEmail = await Student.findOne({
      email: updatedEmail,
    });
    const existingCollegeWithEmail = await College.findOne({
      email: updatedEmail,
    });
    const existingAdminWithEmail = await Admin.findOne({ email: updatedEmail });

    if (
      existingStudentWithEmail &&
      existingAdminWithEmail &&
      existingCollegeWithEmail._id.toString() !== student._id.toString()
    ) {
      return res.status(201).send("Email is already registered");
    }

    email = updatedEmail;
  }

  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = student.passwordHash;
  }

  const Updatestudent = await Student.findByIdAndUpdate(
    req.params.id,
    {
      fname: req.body.fname,
      lname: req.body.lname,
      passwordHash: newPassword,
      email: email,
      phone: req.body.phone,
      dob: req.body.dob,
      gender: req.body.gender,
      session: req.body.session,
      collegeId: collegeId,
      courseType: req.body.courseType,
      course: req.body.course,
      isFinalized: req.body.isFinalized,
      majorSubjects: req.body.majorSubjects,
      minorSubjects: req.body.minorSubjects,
      vocationalSubjects: req.body.vocationalSubjects,
      tenthQualification: req.body.tenthQualification,
      twelthQualification: req.body.twelthQualification,
      ugQualification: req.body.ugQualification,
      paymentStatus: req.body.paymentStatus,
    },
    { new: true }
  );

  if (!Updatestudent)
    return res.status(400).send("the student cannot be updated!");
  res.send(Updatestudent);
  next();
});

router.put("/:collegeId/:studentId/finalize", async (req, res) => {
  const { studentId, collegeId } = req.params;

  try {
    const student = await Student.findById(req.params.studentId);

    if (!student.paymentStatus) {
      console.log("nhi Hua");
      return res.json({
        redirectUrl: `http://localhost:3001/college/${collegeId}/${studentId}/StudentPanel/registration`,
        message:
          "Payment is incomplete. Please complete the payment to proceed.",
      });
    }

    if (!student.tenthQualification && !student.twelthQualification) {
      console.log("payment ho gya pr educational info nhi fill kiya");
      return res.json({
        redirectUrl: `http://localhost:3001/college/${collegeId}/${studentId}/StudentPanel/educationalInfo`,
        message:
          "Educational information is incomplete. Please fill your educational information to proceed.",
      });
    }

    // Check if the student exists in StudentMaster database
    const studentMaster = await StudentMaster.findOne({
      student: new mongoose.Types.ObjectId(studentId),
    });
    if (!studentMaster) {
      console.log(
        "payment ho gya, educational info bhi bhar gyi pr personal Info nhi fill kiya"
      );
      return res.json({
        redirectUrl: `http://localhost:3001/college/${collegeId}/${studentId}/StudentPanel/personalInfo`,
        message:
          "Personal information is incomplete. Please fill your personal information to proceed.",
      });
    }

    const studentDocuments = await Document.findOne({
      student: new mongoose.Types.ObjectId(studentId),
    });
    if (!studentDocuments) {
      console.log(
        "payment ho gya, educational info bhi bhar gyi, personal Info bhi bhar gyi pr documents upload nhi fill kiye"
      );
      return res.json({
        redirectUrl: `http://localhost:3001/college/${collegeId}/${studentId}/StudentPanel/docUpload`,
        message: "Please upload your neccessary documents to proceed.",
      });
    }

    // If documents exist, proceed to update 'isFinalized'
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { isFinalized: req.body.isFinalized },
      { new: true }
    );

    if (!updatedStudent) {
      return res
        .status(400)
        .send(
          "Form is not submitted check all the required Information is filled ?"
        );
    }

    // Respond with the updated student details
    res.send(updatedStudent);
  } catch (error) {
    // Handle any errors during the process
    res.status(500).send("Error in submitting form : " + error.message);
  }
});

router.post("/:id/qualifications", async (req, res) => {
  const { id } = req.params;
  const { twelthQualification, tenthQualification } = req.body;

  try {
    // Prepare the update object for both qualifications if present in the request body
    const updateFields = {};

    if (twelthQualification) {
      updateFields.twelthQualification = {
        instituteName: twelthQualification.instituteName,
        passingYear: twelthQualification.passingYear,
        enrollmentNumber: twelthQualification.enrollmentNumber,
        maxMarks: twelthQualification.maxMarks,
        obtainedMarks: twelthQualification.obtainedMarks,
        percentage: twelthQualification.percentage,
      };
    }

    if (tenthQualification) {
      updateFields.tenthQualification = {
        instituteName: tenthQualification.instituteName,
        passingYear: tenthQualification.passingYear,
        enrollmentNumber: tenthQualification.enrollmentNumber,
        maxMarks: tenthQualification.maxMarks,
        obtainedMarks: tenthQualification.obtainedMarks,
        percentage: tenthQualification.percentage,
      };
    }

    // Use findByIdAndUpdate to insert if no qualification exists or update if it already exists
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true } // upsert: true to insert if no document exists
    );

    if (!updatedStudent) {
      return res.status(404).send({ message: "Student not found" });
    }

    res.send(updatedStudent);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "An error occurred while updating the qualifications" });
  }
});

router.put('/verify', async (req, res) => {
  const { studentIds } = req.body; // Expecting an array of student IDs in the request body

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ message: 'Invalid student IDs array.' });
  }

  try {
    // Update the students' isVerified status to true
    const result = await Student.updateMany(
      { _id: { $in: studentIds } }, // Filter to match the provided student IDs
      { $set: { isVarified: true } } // Set isVerified to true
    );
    return res.status(200).json({ message: 'Students updated successfully.', result });
  } catch (error) {
    console.error('Error updating students:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
});

router.get(
  "/get/student_count/:collegeId/:sessionId",
  async (req, res, next) => {
    try {
      const { collegeId, sessionId } = req.params; // Extract collegeId and sessionId from request parameters

      const studentCounts = await Student.aggregate([
        {
          $match: {
            collegeId: new mongoose.Types.ObjectId(collegeId), // Filter by collegeId
            session: new mongoose.Types.ObjectId(sessionId), // Filter by sessionId
          },
        },
        {
          $group: {
            _id: null, // Group all documents together
            totalCount: { $sum: 1 }, // Total count of students
            paidCount: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", true] }, 1, 0] },
            }, // Count of students with paymentStatus: true
            unpaidCount: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", false] }, 1, 0] },
            }, // Count of students with paymentStatus: false
            verifiedCount: {
              $sum: { $cond: [{ $eq: ["$isVarified", true] }, 1, 0] },
            }, // Count of students with paymentStatus: false
            malePaidCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$paymentStatus", true] },
                      { $eq: ["$gender", "Male"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            }, // Count of paid male students
            femalePaidCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$paymentStatus", true] },
                      { $eq: ["$gender", "Female"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            }, // Count of paid female students
          },
        },
      ]);

      const paidStudents = await Student.find({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        session: new mongoose.Types.ObjectId(sessionId),
        paymentStatus: true,
      }).populate("course", "name courseType");

      const unpaidStudents = await Student.find({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        session: new mongoose.Types.ObjectId(sessionId),
        paymentStatus: false,
      }).populate("course", "name courseType");

      const verifiedStudents = await Student.find({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        session: new mongoose.Types.ObjectId(sessionId),
        isVarified: true,
      }).populate("course", "name courseType");

      // Return the results with student counts and lists
      const result =
        studentCounts.length > 0
          ? {
              collegeId,
              sessionId,
              totalCount: studentCounts[0].totalCount,
              paidCount: studentCounts[0].paidCount,
              unpaidCount: studentCounts[0].unpaidCount,
              verifiedCount: studentCounts[0].verifiedCount,
              malePaidCount: studentCounts[0].malePaidCount,
              femalePaidCount: studentCounts[0].femalePaidCount,
              paidStudents,
              unpaidStudents,
              verifiedStudents
            }
          : {
              collegeId,
              sessionId,
              totalCount: 0,
              paidCount: 0,
              unpaidCount: 0,
              verifiedCount: 0,
              malePaidCount: 0,
              femalePaidCount: 0,
              paidStudents: [],
              unpaidStudents: [],
              verifiedStudents: [],
            };

      res.status(200).json(result);
    } catch (error) {
      next(error); // Handle errors
    }
  }
);

router.get("/:collegeId/search", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { fname } = req.query;

    // Validate the collegeId
    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid College ID" });
    }

    // Validate the name parameter
    if (!fname || fname.trim().length === 0) {
      return res.status(400).json({ error: "Name query parameter is required" });
    }

    // Search for students by name within the specified college
    const students = await Student.find({
      collegeId: collegeId,
      isFinalized: true,
      fname: { $regex: fname, $options: "i" } // Case-insensitive search
    })
      .populate({ path: "collegeId", select: "name logo address" })
      .populate({ path: "session", select: "name" })
      .populate({ path: "course", select: "name registrationAmt" })
      .populate({ path: "majorSubjects", select: "subjectname" })
      .populate({ path: "minorSubjects", select: "subjectname" })
      .populate({ path: "vocationalSubjects", select: "subjectname" });

    // Check if students were found
    if (students.length === 0) {
      return res.status(404).json({ error: "No students found with the provided name in this college" });
    }

    // Fetch StudentMaster details for each student
    const studentData = await Promise.all(
      students.map(async (student) => {
        const studentMaster = await StudentMaster.findOne({ student: student._id }).select(
          "father_name mother_name permanent_address correspondence_address father_phone father_occupation father_qualification mother_phone mother_qualification mother_occupation aadhar_no caste religion"
        );

        // Return a combined student object with StudentMaster details
        return {
          ...student.toObject(),
          studentMaster: studentMaster ? studentMaster.toObject() : null,
        };
      })
    );

    // Send the response with all matched student data
    res.status(200).json(studentData);
  } catch (error) {
    console.error("Error searching students by name in college:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
