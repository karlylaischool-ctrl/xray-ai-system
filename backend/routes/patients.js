const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('doctor'), createPatient)
  .get(protect, getPatients);

router.route('/:id')
  .get(protect, getPatientById)
  .put(protect, authorize('doctor'), updatePatient)
  .delete(protect, authorize('doctor'), deletePatient);

module.exports = router;
