const VersionHistory = require('../models/VersionHistory');

exports.trackVersion = async (entityType, entityId, changes, userId, changeType, description, relatedPatientId = null) => {
  try {
    const lastVersion = await VersionHistory.findOne({ entityType, entityId })
      .sort({ version: -1 });
    
    const newVersion = lastVersion ? lastVersion.version + 1 : 1;
    
    await VersionHistory.create({
      entityType,
      entityId,
      relatedPatientId,
      version: newVersion,
      changes,
      changedBy: userId,
      changeType,
      changeDescription: description
    });
    
    return newVersion;
  } catch (error) {
    console.error('Version tracking error:', error);
  }
};
