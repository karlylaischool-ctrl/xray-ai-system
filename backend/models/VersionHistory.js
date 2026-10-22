const mongoose = require('mongoose');

const versionHistorySchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['patient', 'report', 'appointment'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  relatedPatientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  version: {
    type: Number,
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changeType: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true
  },
  changeDescription: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VersionHistory', versionHistorySchema);
