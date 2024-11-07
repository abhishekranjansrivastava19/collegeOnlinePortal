const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Module = require("../models/module");

router.get(`/`, async (req, res, next) => {
  const moduleList = await Module.find();
  res.send(moduleList);
  if (!moduleList) {
    res.send(500).json({ sucess: false });
  }
  // res.status(200).send(collegeList);
  // next.send(collegeList);
});



router.get(`/:id`, async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res
        .status(500)
        .json({ message: "The module with the given ID was not found." });
    }

    return res.status(200).json(module);
  } catch (error) {
    next(error); // Pass the error to the next middleware (optional for error handling)
  }
});

router.post(`/`, (req, res, next) => {

  const module = new Module({
    name: req.body.name,
    permissions: {
        view: req.body.view,
        create: req.body.create,
        update: req.body.update,
        delete: req.body.delete
    }
  });
  module
    .save()
    .then((createdmodule) => {
      res.status(201).json(createdmodule);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        sucess: false,
      });
    });
});



module.exports = router;