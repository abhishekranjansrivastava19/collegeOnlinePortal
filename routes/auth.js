const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv/config');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
  
    try {
      // Remove 'Bearer ' from the token if it's prefixed
      const actualToken = token.split(' ')[1]
  
      // Verify the token
      const decoded = jwt.verify(actualToken, JWT_SECRET)
      req.user = decoded // Attach the decoded user data to the request object
      next()
    } catch (err) {
      return res.status(403).json({ message: 'Invalid token' })
    }
  }
  
  // Validate token route
  router.get('/', verifyToken, (req, res) => {
    // Respond with user data if token is valid
    res.status(200).json({
      message: 'Token is valid',
      userId: req.user.userId,
      userRole: req.user.userRole,
      collegeId: req.user.collegeId,
    })
  })


  module.exports = router;