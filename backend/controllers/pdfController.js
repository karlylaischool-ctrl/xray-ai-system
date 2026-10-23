const PDFDocument = require('pdfkit');
const Report = require('../models/Report');
const Patient = require('../models/Patient');
const fs = require('fs');
const path = require('path');

exports.exportReportPDF = async (req, res) => {
  try {
    const { reportId, consent } = req.body;
    
    if (!consent) {
      return res.status(400).json({ message: 'Consent is required for PDF export' });
    }
    
    const report = await Report.findById(reportId)
      .populate('patientId', 'patientId demographics')
      .populate('doctorId', 'name doctorId hospital');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({
        _id: report.patientId._id,
        userId: req.user._id
      });

      if (!patient) {
        return res.status(403).json({ message: 'You can only export your own reports' });
      }
    }

    const uploadsDirectory = path.resolve(__dirname, '../uploads');
    const imagePaths = [];
    for (const image of report.imagePaths || []) {
      const imagePath = image.path;
      const resolvedPath = path.resolve(__dirname, '..', imagePath || '');
      const relativePath = path.relative(uploadsDirectory, resolvedPath);

      if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        return res.status(400).json({ message: 'Report contains an invalid X-ray image path' });
      }
      if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
        return res.status(404).json({ message: 'An X-ray image for this report could not be found' });
      }

      imagePaths.push(resolvedPath);
    }

    if (imagePaths.length === 0) {
      return res.status(422).json({ message: 'No X-ray image is available for this report' });
    }
    
    const doc = new PDFDocument({ margin: 50 });
    res.attachment(`report_${report.reportId}.pdf`);
    res.type('application/pdf');

    doc.on('error', (error) => {
      console.error('PDF generation error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to generate PDF' });
      } else {
        res.destroy(error);
      }
    });
    doc.pipe(res);
    
    doc.fontSize(20).font('Helvetica-Bold').text('X-Ray Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`Report ID: ${report.reportId}`);
    doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`);
    doc.text(`Study Type: ${report.studyType}`);
    doc.text(`Body Part: ${report.bodyPart}`);
    doc.moveDown();
    
    doc.fontSize(14).font('Helvetica-Bold').text('Patient Information');
    doc.fontSize(12).font('Helvetica');
    doc.text(`Patient ID: ${report.patientId.patientId}`);
    doc.text(`Name: ${report.patientId.demographics.firstName} ${report.patientId.demographics.lastName}`);
    doc.text(`Date of Birth: ${new Date(report.patientId.demographics.dateOfBirth).toLocaleDateString()}`);
    doc.moveDown();

    doc.addPage();
    imagePaths.forEach((imagePath, index) => {
      if (index > 0) {
        doc.addPage();
      }
      doc.fontSize(14).font('Helvetica-Bold').text(`X-Ray Image${index > 0 ? ` ${index + 1}` : ''}`);
      doc.moveDown(0.5);
      doc.image(imagePath, {
        fit: [500, 500],
        align: 'center',
        valign: 'center'
      });
      doc.moveDown();
    });
    doc.addPage();
    
    doc.fontSize(14).font('Helvetica-Bold').text('Doctor Information');
    doc.fontSize(12).font('Helvetica');
    doc.text(`Doctor: ${report.doctorId.name}`);
    doc.text(`Doctor ID: ${report.doctorId.doctorId}`);
    doc.text(`Hospital: ${report.doctorId.hospital}`);
    doc.moveDown();
    
    doc.fontSize(14).font('Helvetica-Bold').text('AI Analysis');
    doc.fontSize(12).font('Helvetica');
    doc.text(`Findings: ${report.aiAnalysis?.findings || 'N/A'}`);
    doc.text(`Impression: ${report.aiAnalysis?.impression || 'N/A'}`);
    doc.moveDown();
    
    if (report.doctorInterpretation) {
      doc.fontSize(14).font('Helvetica-Bold').text('Doctor Interpretation');
      doc.fontSize(12).font('Helvetica');
      doc.text(`Diagnosis: ${report.doctorInterpretation.diagnosis || 'N/A'}`);
      doc.text(`Clinical Notes: ${report.doctorInterpretation.clinicalNotes || 'N/A'}`);
      doc.text(`Recommendations: ${report.doctorInterpretation.recommendations || 'N/A'}`);
      doc.moveDown();
    }
    
    doc.fontSize(10).font('Helvetica-Oblique').text(
      'This report is generated with patient consent. Medical information is confidential.',
      { align: 'center' }
    );
    
    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      res.destroy(error);
    }
  }
};
