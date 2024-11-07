const SuperAdmin = require("../models/superAdmin");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post('/register', async (req,res)=>{
    let existingAdmin = await SuperAdmin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'SuperAdmin with this email already exists' });
  }
    let user = new SuperAdmin({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        isSuperAdmin: req.body.isSuperAdmin
    })
    user = await user.save();
    if(!user) {
        return res.status(400).send('the Super Admin cannot be created!')
    }
    res.send({message: "Admin registered successfully"});
  })
  
  
  router.post(`/login`, async (req, res) => {
    let user = await SuperAdmin.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send("the Super Admin not found")
    }
  
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user._id,
                isSuperAdmin: user.isSuperAdmin,
            },
            secret,
            { expiresIn: '7d' }
        )
        res.status(200).send({user: user.email, token: token, message: "login successfully", result:'success'});
    } else {
        res.status(400).send({message:"password is wrong"});
    }
  
  })


  module.exports = router;