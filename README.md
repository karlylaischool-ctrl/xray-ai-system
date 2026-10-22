# X-Ray AI Report Generation System

A comprehensive web application for AI-powered X-ray analysis with patient and doctor interfaces, featuring MLX VLM for image analysis, Google Cloud AI for patient education, and MongoDB for data storage.

## Features

### Doctor Interface
- **Patient Management**: Full CRUD operations for patient records including demographics, medical history, and allergies
- **Report Generation**: AI-powered X-ray analysis using MLX VLM with doctor interpretation
- **Search & Filter**: Advanced search by patient, date, diagnosis, body part, doctor, and status
- **Approval System**: Doctors can approve reports after review
- **Version History**: Complete audit trail of all changes with timestamps and doctor attribution
- **Appointment Management**: Schedule and manage patient appointments
- **Research Search**: Filter and search through patient records

### Patient Interface
- **Report Viewing**: View approved X-ray reports with images
- **AI Chatbot**: Educational AI assistant powered by Google Cloud AI for layman interpretation
- **PDF Export**: Export reports as PDF with consent
- **Appointment Scheduling**: Book appointments with doctors
- **Personal Records**: Search own records by date, type, doctor, hospital, body part
- **Status Tracking**: See approval status of reports

### Technical Features
- **JWT Authentication**: Secure login/registration for doctors and patients
- **Version Control**: Every change tracked with version history
- **Role-Based Access**: Separate interfaces for doctors and patients
- **MLX VLM Integration**: Local AI model for X-ray analysis
- **Google Cloud AI**: Patient education chatbot
- **MongoDB**: Flexible document storage for complex medical data
- **Vue.js + Vuetify**: Modern, responsive frontend with warm, friendly design

## Tech Stack

### Backend
- **Node.js/Express**: REST API server
- **MongoDB/Mongoose**: Database and ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **PDFKit**: PDF generation
- **axios**: HTTP client for Google Cloud AI

### Frontend
- **Vue.js 3**: Progressive JavaScript framework
- **Vuetify 3**: Material Design component library
- **Vue Router**: Client-side routing
- **Pinia**: State management
- **Axios**: HTTP client
- **Vite**: Build tool

### AI/ML
- **MLX VLM (Qwen2-VL-2B-Instruct-4bit)**: Local X-ray image analysis
- **Google Cloud AI (Gemini)**: Patient education chatbot

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)
- MLX VLM installed on the system
- Google Cloud API key (for chatbot feature)

## Installation

### 1. Clone the repository

```bash
cd /Users/karlylai/Downloads/fyp3
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/xray-ai-system
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
GOOGLE_CLOUD_PROJECT_ID=your_project_id
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Database Setup

Ensure MongoDB is running:

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### 5. MLX VLM Setup

Ensure MLX VLM is installed and the model is available:

```bash
# Install MLX VLM if not already installed
pip install mlx-vlm

# The model used: mlx-community/Qwen2-VL-2B-Instruct-4bit
```

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3001`

### Configure API access

The API is served from `/api` on the backend host (default `http://localhost:5000/api`).
The frontend uses the same-origin `/api` path by default and Vite proxies it to
`http://localhost:5000`. To point the frontend at a deployed API directly, create
`frontend/.env` and set:

```env
VITE_API_URL=https://your-api.example.com/api
```

For local development with a backend on a different port, keep `VITE_API_URL=/api`
and set `VITE_API_PROXY_TARGET` to the backend origin, for example
`http://localhost:5001`.

Set `CORS_ORIGIN` in `backend/.env` to a comma-separated list of browser origins
that should be allowed to call the backend directly, such as
`https://app.example.com,https://admin.example.com`. The default `*` allows
cross-origin browser requests from any origin; use an explicit list in production.
The API uses bearer tokens rather than cookies, so cross-origin credentials are
not enabled.

External clients should send JSON requests and include the JWT returned from
`POST /api/auth/login` (or registration) on protected routes:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

All routes below are relative to the `/api` base path. Role-restricted endpoints
are noted in the endpoint list; requests without a valid token receive an
unauthorized response.

## Usage

### Initial Setup

1. **Register a Doctor Account**:
   - Navigate to `http://localhost:3001/register`
   - Select role: "doctor"
   - Enter doctor ID, hospital, and specialization
   - Register the account

2. **Register a Patient Account**:
   - Navigate to `http://localhost:3001/register`
   - Select role: "patient"
   - Register the account

### Doctor Workflow

1. **Login** as a doctor
2. **Add Patient**: Navigate to Patients → Add Patient → Enter demographics
3. **Create Report**:
   - Navigate to Reports → New Report
   - Select patient and upload X-ray image
   - Click "Analyze with AI" to run MLX VLM analysis
   - Review AI findings and add doctor interpretation
   - Save the report
4. **Approve Report**: Navigate to report detail → Click "Approve Report"
5. **View Version History**: Navigate to Versions → See all changes with timestamps

### Patient Workflow

1. **Login** as a patient
2. **View Reports**: Navigate to My Records → View approved reports
3. **Ask AI Assistant**: Navigate to AI Assistant → Ask questions about reports
4. **Export PDF**: On report detail → Click "Export PDF" with consent
5. **Schedule Appointment**: Navigate to Appointments → Schedule with doctor

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (authenticated)
- `GET /api/auth/users` - List users (authenticated)

### Patients
- `GET /api/patients` - Get all patients (with search/filter)
- `POST /api/patients` - Create patient (doctor only)
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient (doctor only)
- `DELETE /api/patients/:id` - Delete patient (doctor only)

### Reports
- `POST /api/reports/analyze` - Analyze X-ray with MLX VLM
- `GET /api/reports` - Get all reports (with search/filter)
- `POST /api/reports` - Create report (doctor only)
- `GET /api/reports/:id` - Get report by ID
- `PUT /api/reports/:id` - Update report (doctor only)
- `PUT /api/reports/:id/approve` - Approve report (doctor only)
- `DELETE /api/reports/:id` - Delete report (doctor only)

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Chatbot
- `POST /api/chatbot/ask` - Ask AI assistant (patient only)

### Version History
- `GET /api/versions` - Get version history
- `GET /api/versions/:entityType/:entityId` - Get versions for specific entity

### PDF Export
- `POST /api/pdf/export` - Export report as PDF

## Database Schema

### User
- email, password, role (doctor/patient), name, doctorId, hospital, specialization

### Patient
- patientId, userId, demographics (name, DOB, gender, phone, address), medicalHistory, allergies, assignedDoctors

### Report
- reportId, patientId, doctorId, studyType, bodyPart, imagePaths, aiAnalysis, doctorInterpretation, laymenInterpretation, status, version

### Appointment
- appointmentId, patientId, doctorId, scheduledDate, duration, type, status, notes

### VersionHistory
- entityType, entityId, version, changes, changedBy, changeType, changeDescription, timestamp

## Security Considerations

- Change JWT_SECRET in production
- Use environment variables for all sensitive data
- Implement rate limiting for API endpoints
- Add HTTPS in production
- Validate and sanitize all user inputs
- Implement proper file upload security for X-ray images

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file

### MLX VLM Analysis Fails
- Ensure MLX VLM is installed: `pip install mlx-vlm`
- Check that the model is downloaded: `mlx-community/Qwen2-VL-2B-Instruct-4bit`
- Verify image path is correct

### Google Cloud AI Chatbot Not Working
- Check GOOGLE_CLOUD_API_KEY in .env
- Ensure API key has Gemini API access
- Verify GOOGLE_CLOUD_PROJECT_ID

### Frontend Not Connecting to Backend
- Ensure backend is running on port 5000
- Check CORS configuration in backend
- Verify API_URL in frontend stores

## License

ISC

## Support

For issues and questions, please contact the development team.
