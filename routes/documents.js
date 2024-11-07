const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Document = require("../models/document"); // Import the Document model

const router = express.Router();

// Define allowed file types for multer
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "application/pdf": "pdf",
};

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid file type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads/documents"); // Save files to 'public/uploads/documents' directory
  },
  file: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}'-'${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// CREATE (POST) - Add a new document with file upload
// router.post("/upload", uploadOptions.fields([
//   { name: "profile_image", maxCount: 1 },
//   { name: "aadhar_image", maxCount: 1 },
//   { name: "transfer_certificate", maxCount: 1 },
//   { name: "twelth_marksheet", maxCount: 1 },
//   { name: "ug_marksheet", maxCount: 1 },
// ]), async (req, res) => {
//   try {
//     const { courseType, student } = req.body;

//     // Capture file paths from multer
//     const basePath = `${req.protocol}://${req.get("host")}/public/uploads/documents/`;

//     const profile_image = req.files['profile_image'] ? `${basePath}${req.files['profile_image'][0].filename}` : '';
//     const aadhar_image = req.files['aadhar_image'] ? `${basePath}${req.files['aadhar_image'][0].filename}` : '';
//     const transfer_certificate = req.files['transfer_certificate'] ? `${basePath}${req.files['transfer_certificate'][0].filename}` : '';
//     const twelth_marksheet = req.files['twelth_marksheet'] ? `${basePath}${req.files['twelth_marksheet'][0].filename}` : '';
//     const ug_marksheet = req.files['ug_marksheet'] ? `${basePath}${req.files['ug_marksheet'][0].filename}` : '';

//     // Create a new document instance
//     const newDocument = new Document({
//       student,
//       profile_image,
//       aadhar_image,
//       transfer_certificate,
//       courseType,
//       twelth_marksheet,
//       ug_marksheet,
//     });

//     console.log(newDocument);
//     // Save the document to the database
//     const savedDocument = await newDocument.save();
    
//     return res.status(201).json({
//       message: "Document created successfully",
//       document: savedDocument,
//     });
//   } catch (error) {
//     console.error('Error creating document:', error); // Log the error details
//     return res.status(500).json({
//       message: "Error creating document",
//       error: error.message,
//     });
//   }
// });

router.post("/upload", uploadOptions.fields([
  { name: "profile_image", maxCount: 1 },
  { name: "aadhar_image", maxCount: 1 },
  { name: "transfer_certificate", maxCount: 1 },
  { name: "twelth_marksheet", maxCount: 1 },
  { name: "ug_marksheet", maxCount: 1 },
]), async (req, res) => {
  try {
    const { courseType, student } = req.body;

    // Capture file paths from multer
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/documents/`;

    const profile_image = req.files['profile_image'] ? `${basePath}${req.files['profile_image'][0].filename}` : '';
    const aadhar_image = req.files['aadhar_image'] ? `${basePath}${req.files['aadhar_image'][0].filename}` : '';
    const transfer_certificate = req.files['transfer_certificate'] ? `${basePath}${req.files['transfer_certificate'][0].filename}` : '';
    const twelth_marksheet = req.files['twelth_marksheet'] ? `${basePath}${req.files['twelth_marksheet'][0].filename}` : '';
    const ug_marksheet = req.files['ug_marksheet'] ? `${basePath}${req.files['ug_marksheet'][0].filename}` : '';

    // Check if a document for the student already exists
    const existingDocument = await Document.findOne({ student });

    if (existingDocument) {
      // Update the existing document
      existingDocument.profile_image = profile_image || existingDocument.profile_image;
      existingDocument.aadhar_image = aadhar_image || existingDocument.aadhar_image;
      existingDocument.transfer_certificate = transfer_certificate || existingDocument.transfer_certificate;
      existingDocument.courseType = courseType || existingDocument.courseType;
      existingDocument.twelth_marksheet = twelth_marksheet || existingDocument.twelth_marksheet;
      existingDocument.ug_marksheet = ug_marksheet || existingDocument.ug_marksheet;

      // Save the updated document to the database
      const updatedDocument = await existingDocument.save();

      return res.status(200).json({
        message: "Document updated successfully",
        document: updatedDocument,
      });
    } else {
      // Create a new document instance
      const newDocument = new Document({
        student,
        profile_image,
        aadhar_image,
        transfer_certificate,
        courseType,
        twelth_marksheet,
        ug_marksheet,
      });

      // Save the document to the database
      const savedDocument = await newDocument.save();

      return res.status(201).json({
        message: "Document created successfully",
        document: savedDocument,
      });
    }
  } catch (error) {
    console.error('Error processing document:', error); // Log the error details
    return res.status(500).json({
      message: "Error processing document",
      error: error.message,
    });
  }
});
 


// READ (GET) - Get a document by student ID
router.get("/:studentId", async (req, res) => {
  const { studentId } = req.params;
  try {
    // Find the document by student ID
    const document = await Document.findOne({ student: studentId });
    if (!document) {
      return res.status(404).json({
        message: "No document found for the provided student ID",
      });
    }
    return res.status(200).json(document);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching document",
      error: error.message,
    });
  }
});


// UPDATE (PUT) - Update a document by student ID
router.put("/:studentId", uploadOptions.fields([
  { name: "profile_image", maxCount: 1 },
  { name: "aadhar_image", maxCount: 1 },
  { name: "transfer_certificate", maxCount: 1 },
  { name: "twelth_marksheet", maxCount: 1 },
  { name: "ug_marksheet", maxCount: 1 },
]), async (req, res) => {
  const { studentId } = req.params;
  const { courseType } = req.body;

  try {
    // Capture file paths from multer if files are uploaded
    const profile_image = req.files["profile_image"] ? req.files["profile_image"][0].path : "";
    const aadhar_image = req.files["aadhar_image"] ? req.files["aadhar_image"][0].path : "";
    const transfer_certificate = req.files["transfer_certificate"] ? req.files["transfer_certificate"][0].path : "";
    const twelth_marksheet = req.files["twelth_marksheet"] ? req.files["twelth_marksheet"][0].path : "";
    const ug_marksheet = req.files["ug_marksheet"] ? req.files["ug_marksheet"][0].path : "";

    // Update the document in the database
    const updatedDocument = await Document.findOneAndUpdate(
      { student: studentId },
      {
        profile_image: profile_image || undefined, // Only update if provided
        aadhar_image: aadhar_image || undefined,
        transfer_certificate: transfer_certificate || undefined,
        courseType,
        twelth_marksheet: twelth_marksheet || undefined,
        ug_marksheet: ug_marksheet || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({
        message: "No document found for the provided student ID",
      });
    }

    return res.status(200).json({
      message: "Document updated successfully",
      document: updatedDocument,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating document",
      error: error.message,
    });
  }
});

// DELETE (DELETE) - Delete a document by student ID
router.delete("/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    // Find and delete the document by student ID
    const deletedDocument = await Document.findOneAndDelete({ student: studentId });

    if (!deletedDocument) {
      return res.status(404).json({
        message: "No document found for the provided student ID",
      });
    }

    return res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting document",
      error: error.message,
    });
  }
});

module.exports = router;
