const Session = require("../models/session");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/:collegeId`, async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: "Invalid College Id" });
    } 
    const session = await Session.find({ collegeId: new mongoose.Types.ObjectId(collegeId) })
    .populate(
      "collegeId",
      "name logo address"
    );
    if (session.length === 0) {
      return res.status(404).json({ error: "No session found for this college" });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.get(`/:id`, async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res
        .status(500)
        .json({ message: "The session with the given ID was not found." });
    }

    return res.status(200).json(session);
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
    const existingSession = await Session.findOne({ collegeId, name });
    if (existingSession) {
      return res.status(400).send("Session is already registered");
    }
    const newSession = new Session({
      collegeId: collegeId,
      name: name,
      start: req.body.start,
      end: req.body.end
    });

    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/:sessionId", async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(400).send("invalid session");

    const updatedSession = await Session.findByIdAndUpdate(
      req.params.sessionId,
      {
        name: req.body.name,
        start: req.body.start,
        end: req.body.end
      },
      {new: true}
    );

    if (!updatedSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.delete(`/:id`, (req, res) => {
    Session.findByIdAndDelete(req.params.id)
    .then((session) => {
      if (session) {
        return res
          .status(200)
          .json({ sucess: true, message: "the session is deleted!!" });
      } else {
        return res
          .status(404)
          .json({ sucess: false, message: "session not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ sucess: false, error: err });
    });
});


module.exports = router;
