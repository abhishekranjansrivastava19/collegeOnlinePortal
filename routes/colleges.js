const College = require("../models/college");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("inValid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/collegelogo");
  },
  file: function (req, file, cb) {
    const fileName = file.originalname.split("").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}'-'${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage });

router.get("/status", async (req, res) => {
  try {
    const currentDate = new Date();

    const DueDays = 30;

    const upcomingDate = new Date(currentDate);
    upcomingDate.setDate(currentDate.getDate() + DueDays);

    // Get count of active colleges (lastDate > current date)
    const activeCount = await College.countDocuments({
      lastDate: { $gt: currentDate },
    });

    // Get count of inactive colleges (lastDate <= current date)
    const inactiveCount = await College.countDocuments({
      lastDate: { $lte: currentDate },
    });

    // Get count of colleges whose lastDate is coming soon (within the next 30 days)
    const upcomingCount = await College.countDocuments({
      lastDate: {
        $gte: new Date(currentDate.setHours(0, 0, 0, 0)), // Start of the current day
        $lte: new Date(upcomingDate.setHours(23, 59, 59, 999)), // End of the upcoming date (30 days from now)
      },
    });

    // Get list of inactive colleges (lastDate <= current date)
    const inactiveColleges = await College.find({
      lastDate: { $lte: currentDate },
    });

    // Get list of active colleges (lastDate <= current date)
    const activeColleges = await College.find({
      lastDate: { $gt: currentDate },
    });

    // Get list of colleges whose lastDate is coming soon (within the next 30 days)
    const upcomingColleges = await College.find({
      lastDate: {
        $gte: new Date(currentDate.setHours(0, 0, 0, 0)), // Start of the current day
        $lt: new Date(upcomingDate.setHours(23, 59, 59, 999)), // End of the upcoming date (30 days from now)
      },
    });

    res.status(200).json({
      activeCount,
      inactiveCount,
      upcomingCount,
      inactiveColleges,
      activeColleges,
      upcomingColleges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving college status counts and list",
      error: error.message,
    });
  }
});

router.get(`/`, async (req, res, next) => {
  const collegeList = await College.find();
  res.send(collegeList);
  if (!collegeList) {
    res.send(500).json({ sucess: false });
  }
});

// router.get("/check-email/:email", async (req, res) => {
//   try {
//     const { email } = req.params;
//     if (!email) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Please enter email" });
//     }
//     const college = await College.findOne({ email });
//     if (email) {
//       return res
//         .status(200)
//         .json({ success: true, message: "Email already registered" });
//     }

//     res.status(200).json({ success: true, message: "Email available" });
//   } catch (error) {
//     console.error("Error checking email:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

router.get(`/:id`, async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res
        .status(500)
        .json({ message: "The college with the given ID was not found." });
    }

    return res.status(200).json(college);
  } catch (error) {
    next(error); // Pass the error to the next middleware (optional for error handling)
  }
});

router.post(`/`, uploadOptions.single("logo"), async (req, res, next) => {
  const file = req.file;
  if (!file) return res.status(400).send("no image in the request");

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/collegelogo/`;
  const ExistingEmail = await College.findOne({ email: req.body.email });
  if (ExistingEmail) {
    return res.status(200).send("Email is already registered");
  }
  const college = new College({
    name: req.body.name,
    logo: `${basePath}${fileName}`,
    address: req.body.address,
    state: req.body.state,
    country: req.body.country,
    city: req.body.city,
    phone: req.body.phone,
    email: req.body.email,
    brandColor: req.body.brandColor,
    primaryColor: req.body.primaryColor,
    secondaryColor: req.body.secondaryColor,
    tertiaryColor: req.body.tertiaryColor,
    quaternaryColor: req.body.quaternaryColor,
    brandTextColor: req.body.brandTextColor,
    primaryTextColor: req.body.primaryTextColor,
    secondaryTextColor: req.body.secondaryTextColor,
    tertiaryTextColor: req.body.tertiaryTextColor,
    quaternaryTextColor: req.body.quaternaryTextColor,
    remark: req.body.remark,
    lastDate: req.body.lastDate,
    // modules: modules
  });
  college
    .save()
    .then((createdcollege) => {
      res.status(201).json(createdcollege);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        sucess: false,
      });
    });
});

router.put(`/:id`, uploadOptions.single("logo"), async (req, res, next) => {
  const college = await College.findById(req.params.id);
  if (!college) return res.status(400).send("invalid college");
  const file = req.file;
  let imagepath;
  if (file) {
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/collegelogo/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = college.logo;
  }

  let email = college.email; // Default to current email
  if (req.body.email !== college.email) {
    const updatedEmail = req.body.email;
    // Check if the new email is already registered by another college
    const existingCollegeWithEmail = await College.findOne({
      email: updatedEmail,
    });

    // If another college with this email exists, return an error
    if (
      existingCollegeWithEmail &&
      existingCollegeWithEmail._id.toString() !== college._id.toString()
    ) {
      return res.status(201).send("Email is already registered");
    }

    // If no other college is using this email, update it
    email = updatedEmail;
  }

  const Updatecollege = await College.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      logo: imagepath,
      address: req.body.address,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      phone: req.body.phone,
      email: email,
      brandColor: req.body.brandColor,
      primaryColor: req.body.primaryColor,
      secondaryColor: req.body.secondaryColor,
      tertiaryColor: req.body.tertiaryColor,
      quaternaryColor: req.body.quaternaryColor,
      brandTextColor: req.body.brandTextColor,
      primaryTextColor: req.body.primaryTextColor,
      secondaryTextColor: req.body.secondaryTextColor,
      tertiaryTextColor: req.body.tertiaryTextColor,
      quaternaryTextColor: req.body.quaternaryTextColor,
      remark: req.body.remark,
      lastDate: req.body.lastDate,
      // modules: modules
    },
    { new: true }
  );

  if (!Updatecollege)
    return res.status(400).send("the college cannot be created!");
  res.send(Updatecollege);
  next();
});

router.delete(`/:id`, (req, res) => {
  College.findByIdAndDelete(req.params.id)
    .then((college) => {
      if (college) {
        return res
          .status(200)
          .json({ sucess: true, message: "the college is deleted!!" });
      } else {
        return res
          .status(404)
          .json({ sucess: false, message: "college not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ sucess: false, error: err });
    });
});

router.get("/get/count", async (req, res, next) => {
  try {
    // Use async/await without callback
    const count = await College.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    next(error); // Handle error using Express's error handling
  }
});

module.exports = router;
