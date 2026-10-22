const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  analyzeXRay,
  createReport,
  getReports,
  getReportById,
  updateReport,
  approveReport,
  deleteReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/analyze', protect, upload.single('image'), analyzeXRay);
router.route('/')
  .post(protect, authorize('doctor'), createReport)
  .get(protect, getReports);

router.route('/:id')
  .get(protect, getReportById)
  .put(protect, authorize('doctor'), updateReport)
  .delete(protect, authorize('doctor'), deleteReport);

router.put('/:id/approve', protect, authorize('doctor'), approveReport);

module.exports = router;
