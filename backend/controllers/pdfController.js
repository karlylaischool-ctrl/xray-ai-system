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
    
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `report_${report.reportId}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../exports', fileName);
    
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    
    doc.pipe(fs.createWriteStream(filePath));
    
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
    
    doc.on('end', () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('PDF download error:', err);
        }
        fs.unlinkSync(filePath);
      });
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
