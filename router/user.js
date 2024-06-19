const express = require('express');
const router = express.Router();
const {  register, logout, login, getUserById } = require('../controller/userController');

router.get('/user/:id', getUserById);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);




module.exports = router;