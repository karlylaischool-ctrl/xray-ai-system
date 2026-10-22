const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const Patient = require('../models/Patient');
const { trackVersion } = require('../middleware/versionControl');

exports.analyzeXRay = async (req, res) => {
  try {
    const { findingsPrompt, impressionPrompt } = req.body;
    let imagePath = req.file ? req.file.path : req.body.imagePath;
    
    console.log('Analyze request - imagePath:', imagePath);
    console.log('Has file:', !!req.file);
    console.log('Findings prompt:', findingsPrompt);
    console.log('Impression prompt:', impressionPrompt);
    
    if (!imagePath) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    if (!findingsPrompt || !impressionPrompt) {
      return res.status(400).json({ message: 'Both findings and impression prompts are required' });
    }
    
    // Convert relative path to absolute if needed
    if (!path.isAbsolute(imagePath)) {
      imagePath = path.join(__dirname, '..', imagePath);
    }
    
    if (!fs.existsSync(imagePath)) {
      console.log('Image path does not exist:', imagePath);
      return res.status(400).json({ message: 'Invalid image path - file not found' });
    }
    
    const modelId = 'mlx-community/Qwen2-VL-2B-Instruct-4bit';
    const combinedPrompt = `Analyze this medical image and provide a radiology report in strict JSON format with these two sections:
1. "findings": ${findingsPrompt}
2. "impression": ${impressionPrompt}
Output must be valid JSON with these exact keys: "findings", "impression".`;
    
    console.log('Running MLX with model:', modelId);
    console.log('Combined prompt:', combinedPrompt);
    console.log('Image:', imagePath);
    
    const mlx = spawn('mlx_vlm.generate', [
      '--model', modelId,
      '--max-tokens', '2048',
      '--prompt', combinedPrompt,
      '--image', imagePath
    ]);
    
    let stdout = '';
    let stderr = '';
    
    mlx.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    mlx.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    mlx.on('close', (code) => {
      if (code !== 0) {
        console.error('MLX Error:', stderr);
        return res.status(500).json({ message: 'Analysis failed', error: stderr });
      }
      
      console.log('MLX Output:', stdout);
      
      try {
        // Try to extract JSON from the output
        let jsonMatch = stdout.match(/\{[^}]*"findings"[^}]*"impression"[^}]*\}/s);
        
        if (!jsonMatch) {
          // Try a broader match
          jsonMatch = stdout.match(/\{.*\}/s);
        }
        
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          // Convert findings to string if it's an object
          if (typeof analysis.findings === 'object') {
            analysis.findings = JSON.stringify(analysis.findings, null, 2);
          }
          
          // Convert impression to string if it's an object
          if (typeof analysis.impression === 'object') {
            analysis.impression = JSON.stringify(analysis.impression, null, 2);
          }
          
          res.json({
            success: true,
            analysis,
            imagePath: req.file ? req.file.path : imagePath
          });
        } else {
          // If no JSON found, create a structured response from the text
          const analysis = {
            findings: stdout.substring(0, 2000),
            impression: 'Analysis completed - see findings above'
          };
          res.json({
            success: true,
            analysis,
            imagePath: req.file ? req.file.path : imagePath
          });
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Fallback to text-based response
        const analysis = {
          findings: stdout.substring(0, 2000),
          impression: 'Analysis completed - see findings above'
        };
        res.json({
          success: true,
          analysis,
          imagePath: req.file ? req.file.path : imagePath
        });
      }
    });
    
    mlx.on('error', (err) => {
      console.error('MLX spawn error:', err);
      res.status(500).json({ message: 'Failed to start MLX', error: err.message });
    });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const { patientId, studyType, bodyPart, imagePaths, aiAnalysis, doctorInterpretation, findingsPrompt, impressionPrompt } = req.body;
    
    console.log('Create report request body:', req.body);
    console.log('Doctor interpretation received:', doctorInterpretation);
    
    // Get the maximum report ID to avoid duplicates
    const lastReport = await Report.findOne().sort({ reportId: -1 });
    let nextNumber = 1;
    if (lastReport) {
      const lastNumber = parseInt(lastReport.reportId.replace('RP', ''));
      nextNumber = lastNumber + 1;
    }
    const reportId = `RP${String(nextNumber).padStart(6, '0')}`;
    
    const report = await Report.create({
      reportId,
      patientId,
      doctorId: req.user._id,
      studyType,
      bodyPart,
      imagePaths: imagePaths || [],
      aiAnalysis,
      doctorInterpretation,
      findingsPrompt,
      impressionPrompt,
      status: 'pending'
    });
    
    console.log('Report created with ID:', report.reportId);
    console.log('Report doctorInterpretation:', report.doctorInterpretation);
    
    trackVersion('report', report._id, report.toObject(), req.user._id, 'create', 'Report created', patientId).catch(err => {
      console.error('Version tracking error:', err);
    });
    
    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { patient, date, diagnosis, bodyPart, doctor, status } = req.query;
    
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    } else {
      // For patients, find their patient record first
      const patientRecord = await Patient.findOne({ userId: req.user._id });
      if (patientRecord) {
        query.patientId = patientRecord._id;
      } else {
        // If no patient record found, return empty results
        return res.json({
          success: true,
          reports: []
        });
      }
    }
    
    if (patient) query.patientId = patient;
    if (bodyPart) query.bodyPart = { $regex: bodyPart, $options: 'i' };
    if (status) query.status = status;
    if (doctor) query.doctorId = doctor;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }
    
    const reports = await Report.find(query)
      .populate('patientId', 'patientId demographics')
      .populate('doctorId', 'name doctorId')
      .populate('approvedBy', 'name doctorId')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      reports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patientId', 'patientId demographics medicalHistory allergies')
      .populate('doctorId', 'name doctorId hospital specialization')
      .populate('approvedBy', 'name doctorId');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const oldData = report.toObject();
    Object.assign(report, req.body);
    report.updatedAt = Date.now();
    
    await report.save();
    
    await trackVersion('report', report._id, { old: oldData, new: report.toObject() }, req.user._id, 'update', 'Report updated', report.patientId);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    report.status = 'approved';
    report.approvedAt = Date.now();
    report.approvedBy = req.user.id;
    report.updatedAt = Date.now();
    
    await report.save();
    
    await trackVersion('report', report._id, { old: { status: report.status }, new: { status: 'approved' } }, req.user._id, 'update', 'Report approved', report.patientId);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    await trackVersion('report', report._id, report.toObject(), req.user._id, 'delete', 'Report deleted', report.patientId);
    
    await report.deleteOne();
    
    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
