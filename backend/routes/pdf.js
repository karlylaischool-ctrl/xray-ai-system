const express = require('express');
const router = express.Router();
const { exportReportPDF } = require('../controllers/pdfController');
const { protect } = require('../middleware/auth');

router.post('/export', protect, exportReportPDF);

module.exports = router;
