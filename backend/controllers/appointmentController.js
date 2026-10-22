const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { trackVersion } = require('../middleware/versionControl');

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, scheduledDate, duration, type, notes } = req.body;
    
    // If patient is creating the appointment, convert user ID to patient ID
    let actualPatientId = patientId;
    if (req.user.role === 'patient') {
      const patientRecord = await Patient.findOne({ userId: req.user._id });
      if (patientRecord) {
        actualPatientId = patientRecord._id;
      } else {
        return res.status(400).json({ message: 'Patient record not found' });
      }
    }
    
    const appointmentCount = await Appointment.countDocuments();
    const appointmentId = `AP${String(appointmentCount + 1).padStart(6, '0')}`;
    
    const appointment = await Appointment.create({
      appointmentId,
      patientId: actualPatientId,
      doctorId,
      scheduledDate,
      duration: duration || 30,
      type: type || 'consultation',
      notes,
      createdBy: req.user._id
    });
    
    await trackVersion('appointment', appointment._id, appointment.toObject(), req.user._id, 'create', 'Appointment created', actualPatientId);
    
    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
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
          appointments: []
        });
      }
    }
    
    const appointments = await Appointment.find(query)
      .populate('patientId', 'patientId demographics')
      .populate('doctorId', 'name doctorId hospital')
      .sort({ scheduledDate: -1 });
    
    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    const oldData = appointment.toObject();
    Object.assign(appointment, req.body);
    appointment.updatedAt = Date.now();
    
    await appointment.save();
    
    await trackVersion('appointment', appointment._id, { old: oldData, new: appointment.toObject() }, req.user._id, 'update', 'Appointment updated', appointment.patientId);
    
    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await trackVersion('appointment', appointment._id, appointment.toObject(), req.user._id, 'delete', 'Appointment deleted', appointment.patientId);
    
    await appointment.deleteOne();
    
    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
