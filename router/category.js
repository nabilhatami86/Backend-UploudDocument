const express = require('express');
const router = express.Router();
const { getCategory, createCategory, updateCategory, deleteCategory, getDocumentsByCategory } = require('../controller/categoryController');
const {isAdmin} = require('../middleware/authMiddleware');

router.get('/category', getCategory);
// router.get('/category', getDocumentsByCategory);
router.post('/category', isAdmin, createCategory);
router.put('/category/:id', isAdmin, updateCategory);
router.delete('/category/:id', isAdmin, deleteCategory);

module.exports = router;
