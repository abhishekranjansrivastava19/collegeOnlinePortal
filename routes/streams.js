const Stream = require("../models/stream");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/:collegeId`, async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid College Id" });
    } 
    const stream = await Stream.find({ collegeId: new mongoose.Types.ObjectId(collegeId) })
    .populate(
      "collegeId",
      "name logo address"
    );
    if (stream.length === 0) {
      return res.status(404).json({ error: "No stream found for this college" });
    }

    res.status(200).json(stream);
  } catch (error) {
    console.error("Error fetching streams:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.get(`/:id`, async (req, res, next) => {
  try {
    const stream = await Stream.findById(req.params.id);

    if (!stream) {
      return res
        .status(500)
        .json({ message: "The stream with the given ID was not found." });
    }

    return res.status(200).json(stream);
  } catch (error) {
    next(error); 
  }
});


router.post("/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid College ID format" });
    }
    // const existingStream = await Stream.findOne({ name: req.body.name });
    // if (existingStream) {
    //   return res.status(400).send("Stream is already registered");
    // }
    const newStream = new Stream({
      collegeId: collegeId,
      name: name,
    });

    await newStream.save();
    res.status(201).json(newStream);
  } catch (error) {
    console.error("Error creating stream:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/:streamId", async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.streamId);
    if (!stream) return res.status(400).send("invalid stream");

    const updatedStream = await Stream.findByIdAndUpdate(
      req.params.streamId,
      {
        name: req.body.name,
      },
      {new: true}
    );

    if (!updatedStream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.status(200).json(updatedStream);
  } catch (error) {
    console.error("Error updating stream:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.delete(`/:id`, (req, res) => {
  Stream.findByIdAndDelete(req.params.id)
    .then((stream) => {
      if (stream) {
        return res
          .status(200)
          .json({ sucess: true, message: "the stream is deleted!!" });
      } else {
        return res
          .status(404)
          .json({ sucess: false, message: "stream not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ sucess: false, error: err });
    });
});


module.exports = router;
