const Notice = require("../models/notice");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/:collegeId`, async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid College Id" });
    }
    const notice = await Notice.find({
      collegeId: new mongoose.Types.ObjectId(collegeId),
    });
    if (notice.length === 0) {
      return res
        .status(404)
        .json({ error: "No notice found for this college" });
    }
    res.status(200).json(notice);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid College ID format" });
    }
    const existingNotice = await Notice.findOne({ title: req.body.title });
    if (existingNotice) {
      return res.status(400).send("Notice is already exist");
    }
    const newNotice = new Notice({
      collegeId: collegeId,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
    });

    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (error) {
    console.error("Error pulishing notice:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:noticeId", async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.noticeId);
    if (!notice) return res.status(400).send("invalid notice");

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.noticeId,
      {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
      },
      { new: true }
    );

    if (!updatedNotice) {
      return res.status(404).json({ message: "notice not found" });
    }

    res.status(200).json(updatedNotice);
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete(`/:id`, (req, res) => {
  Notice.findByIdAndDelete(req.params.id)
    .then((notice) => {
      if (notice) {
        return res
          .status(200)
          .json({ sucess: true, message: "the notice is deleted!!" });
      } else {
        return res
          .status(404)
          .json({ sucess: false, message: "notice not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ sucess: false, error: err });
    });
});

module.exports = router;
