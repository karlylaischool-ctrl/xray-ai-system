const VersionHistory = require('../models/VersionHistory');
const Patient = require('../models/Patient');

exports.getVersionHistory = async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    
    let query = {};
    
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    
    // Patients can only see version history related to their own records
    if (req.user.role === 'patient') {
      // Get the patient ID from the user ID
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) {
        query.relatedPatientId = patient._id;
      } else {
        // If no patient record found, return empty results
        return res.json({
          success: true,
          versions: []
        });
      }
    }
    
    const versions = await VersionHistory.find(query)
      .populate('changedBy', 'name email role')
      .populate('relatedPatientId', 'patientId demographics')
      .sort({ timestamp: -1 });
    
    res.json({
      success: true,
      versions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEntityVersions = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const versions = await VersionHistory.find({ entityType, entityId })
      .populate('changedBy', 'name email role')
      .sort({ version: -1 });
    
    res.json({
      success: true,
      versions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
