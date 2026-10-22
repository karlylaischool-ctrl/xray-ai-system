const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studyType: {
    type: String,
    required: true
  },
  bodyPart: {
    type: String,
    required: true
  },
  imagePaths: [{
    path: String,
    uploadedAt: Date
  }],
  aiAnalysis: {
    findings: String,
    impression: String,
    confidence: Number,
    generatedAt: Date
  },
  findingsPrompt: String,
  impressionPrompt: String,
  doctorInterpretation: {
    diagnosis: String,
    clinicalNotes: String,
    recommendations: String
  },
  laymenInterpretation: {
    simplifiedExplanation: String,
    educationalNotes: String
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
