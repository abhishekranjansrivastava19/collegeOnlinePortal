const Student = require("../models/student");
const Admin = require("../models/admin");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Student API's get/getall/register/login/delete/update

router.get(`/:collegeId/student`, async (req, res) => {
  const studentList = await Student.find().select("-passwordHash");

  if (!studentList) {
    res.status(500).json({ success: false });
  }
  res.send(studentList);
});



// Admin API's for create_admin/update_admin/delete_admin/login

router.get(`/admin`, async (req, res, next) => {
  const adminList = await Admin.find();
  res.send(adminList);
  if (!adminList) {
    res.send(500).json({ sucess: false });
  }
});

router.get("/admin/:id", async (req, res) => {
  try {
    let user = await Admin.findById(req.params.id)
      .select("-passwordHash")
      .populate("collegeId", "name logo address");

    if (!user) {
      return res
        .status(404)
        .json({ message: "The user with the given ID was not found" });
    }

    return res.status(200).send(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

router.post(`/:collegeId/create_admin`, async (req, res) => {
  const collegeId = req.body.collegeId;
  if (!collegeId) {
    return res.status(400).send("collegeId is required");
  }
  const existingAdmin = await Admin.findOne({ email: req.body.email });
  if (existingAdmin) {
    return res.status(201).send("Email is already registered");
  }
  let admin = new Admin({
    collegeId,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    userRole: req.body.userRole,
    editProfile: req.body.editProfile,
    editRegisAmt: req.body.editRegisAmt,
    createdTime: req.body.createdTime,
  });
  admin = await admin.save();

  if (!admin) return res.status(400).send("the admin cannot be registered!");

  res.send(admin);
});

router.put(`/update_admin/:id`, async (req, res) => {
  const adminExist = await Admin.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = adminExist.passwordHash;
  }

  let email = adminExist.email; // Default to current email

  if (req.body.email !== adminExist.email) {
    const updatedEmail = req.body.email;
    // Check if the new email is already registered by another college
    const existingAdminWithEmail = await Admin.findOne({ email: updatedEmail });

    // If another college with this email exists, return an error
    if (existingAdminWithEmail && existingAdminWithEmail._id.toString() !== adminExist._id.toString()) {
      return res.status(201).send("Email is already registered");
    }

    // If no other college is using this email, update it
    email = updatedEmail;
  }
  // console.log(newPassword);
  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    {
      collegeId: req.params.collegeId,
      name: req.body.name,
      email: email,
      phone: req.body.phone,
      address: req.body.address,
      passwordHash: newPassword,
      userRole: req.body.userRole,
      editProfile: req.body.editProfile,
      editRegisAmt: req.body.editRegisAmt,
      createdTime: req.body.createdTime,
    },
    { new: true }
  );
  if (!admin) return res.status(400).send("the Admin cannot be updated!");

  res.send(admin);
});

router.delete("/delete_admin/:id", (req, res) => {
  Admin.findByIdAndDelete(req.params.id)
    .then((admin) => {
      if (admin) {
        return res
          .status(200)
          .json({ success: true, message: "the admin is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "admin not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.post("/:collegeId/login", async (req, res) => {
  const secret = process.env.secret;
  try {
    // Attempt to find the user in each collection
    let user = await Admin.findOne({ email: req.body.email });
    if (!user) {
      user = await Student.findOne({ email: req.body.email });
    }

    // If no user is found
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          collegeId: user.collegeId,
          userRole: user.userRole,
        },
        secret,
        { expiresIn: "1w" }
      );
      res.status(200).send({
        user: user.email,
        token: token,
        message: "login successfully",
        result: "success",
      });
    } else {
      res.status(400).send({ message: "password is wrong" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
