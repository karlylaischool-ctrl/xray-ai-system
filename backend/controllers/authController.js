const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { email, password, role, name, doctorId, hospital, specialization, firstName, lastName, dateOfBirth, gender, phone, address } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    if (role === 'doctor' && doctorId) {
      const existingDoctor = await User.findOne({ doctorId });
      if (existingDoctor) {
        return res.status(400).json({ message: 'Doctor ID already exists' });
      }
    }
    
    const user = await User.create({
      email,
      password,
      role,
      name,
      doctorId: role === 'doctor' ? doctorId : undefined,
      hospital,
      specialization
    });
    
    // If registering as a patient, create a patient record
    if (role === 'patient') {
      const patientCount = await Patient.countDocuments();
      const patientId = `PT${String(patientCount + 1).padStart(6, '0')}`;
      
      await Patient.create({
        userId: user._id,
        patientId,
        demographics: {
          firstName: firstName || name,
          lastName: lastName || '',
          dateOfBirth: dateOfBirth || null,
          gender: gender || 'other',
          phone: phone || '',
          address: address || ''
        }
      });
      
      console.log('Patient record created for user:', user._id);
    }
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        doctorId: user.doctorId,
        hospital: user.hospital,
        specialization: user.specialization
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        doctorId: user.doctorId,
        hospital: user.hospital,
        specialization: user.specialization
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        doctorId: user.doctorId,
        hospital: user.hospital,
        specialization: user.specialization
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
