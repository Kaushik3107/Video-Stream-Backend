const express = require('express');
const { registerUser, authUser } = require('../controllers/userController');

const router = express.Router();

// Register user route
router.post('/register', registerUser);

// Login user route
router.post('/login', authUser);

module.exports = router;
