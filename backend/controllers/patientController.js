const Patient = require('../models/Patient');
const { trackVersion } = require('../middleware/versionControl');

exports.createPatient = async (req, res) => {
  try {
    const { demographics, medicalHistory, allergies } = req.body;
    
    const patientCount = await Patient.countDocuments();
    const patientId = `PT${String(patientCount + 1).padStart(6, '0')}`;
    
    const patient = await Patient.create({
      userId: req.user._id,
      patientId,
      demographics,
      medicalHistory: medicalHistory || [],
      allergies: allergies || [],
      assignedDoctors: [req.user._id],
      createdBy: req.user._id
    });
    
    // Track version asynchronously (don't await)
    trackVersion('patient', patient._id, patient.toObject(), req.user._id, 'create', 'Patient record created', patient._id).catch(err => {
      console.error('Version tracking error:', err);
    });
    
    res.status(201).json({
      success: true,
      patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const { search, date, bodyPart, doctor, status, allPatients } = req.query;
    
    let query = {};
    
    // If requesting all patients (for dropdown selection), don't filter by assignment
    if (allPatients !== 'true') {
      if (req.user.role === 'doctor') {
        query.assignedDoctors = req.user._id;
      } else {
        query.userId = req.user._id;
      }
    }
    
    if (search) {
      query.$or = [
        { 'demographics.firstName': { $regex: search, $options: 'i' } },
        { 'demographics.lastName': { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const patients = await Patient.find(query)
      .populate('assignedDoctors', 'name doctorId hospital')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      patients
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctors', 'name doctorId hospital specialization');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const oldData = patient.toObject();
    Object.assign(patient, req.body);
    patient.updatedAt = Date.now();
    
    await patient.save();
    
    trackVersion('patient', patient._id, { old: oldData, new: patient.toObject() }, req.user._id, 'update', 'Patient record updated', patient._id).catch(err => {
      console.error('Version tracking error:', err);
    });
    
    res.json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    trackVersion('patient', patient._id, patient.toObject(), req.user._id, 'delete', 'Patient record deleted', patient._id).catch(err => {
      console.error('Version tracking error:', err);
    });
    
    await patient.deleteOne();
    
    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
