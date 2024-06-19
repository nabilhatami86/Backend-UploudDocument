const express = require('express');
const router = express.Router();
const { getDocument, createDocument, deleteDocument, rename, downloadDocument } = require('../controller/documentController');
const {isAdmin} = require ('../middleware/authMiddleware')


router.get('/list', getDocument);
router.get('/download/:id',downloadDocument);
router.post('/download/:id',isAdmin,downloadDocument);
router.post('/upload',  isAdmin, createDocument);
router.put('/rename/:id',  isAdmin, rename);
router.delete('/delete/:id',  isAdmin, deleteDocument);


module.exports = router;