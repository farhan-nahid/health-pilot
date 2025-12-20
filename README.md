# 🏥 Health Pilot

A comprehensive healthcare management platform connecting patients with doctors through intelligent appointment scheduling, medical report analysis, and AI-powered health recommendations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Django](https://img.shields.io/badge/Django-4.2.27-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Docker Deployment](#-docker-deployment)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Database Models](#-database-models)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### For Patients
- 🔐 **Secure Authentication** - Email-based authentication with customizable settings
- 📄 **Medical Report Upload** - Upload and manage medical reports with AI analysis
- 🤖 **AI-Powered Recommendations** - Get specialist recommendations based on symptoms and reports
- 📅 **Appointment Booking** - Schedule appointments with available doctors
- 📊 **Health Dashboard** - Track appointments, reports, and health metrics
- 🔔 **Notifications** - Appointment reminders and health tips
- ⚙️ **Profile Management** - Update personal information and preferences

### For Doctors
- 👨‍⚕️ **Professional Profile** - Showcase specialization, experience, and consultation fees
- 📅 **Schedule Management** - Set availability by day and time slots
- 📋 **Appointment Management** - Accept, reject, or complete appointments
- 📝 **Patient Reports** - View medical reports shared by patients
- 💬 **Doctor Notes** - Add notes and recommendations for appointments
- 📊 **Dashboard Analytics** - Track appointments and patient interactions

### Admin Features
- 👥 **User Management** - Manage patients and doctors
- 📈 **System Analytics** - Monitor platform usage and statistics
- 🔧 **Configuration** - System-wide settings and configurations

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2.27 with Django REST Framework
- **Authentication**: dj-rest-auth with django-allauth
- **Database**: PostgreSQL 15 (SQLite for development)
- **Cache**: Redis 7
- **Task Queue**: Celery
- **AI Integration**: OpenAI API
- **API Documentation**: drf-yasg (Swagger)
- **Server**: Gunicorn (production)

### Frontend
- **Framework**: Next.js 16.1.0 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Xior
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Notifications**: Sonner

### DevOps
- **Containerization**: Docker & Docker Compose
- **Deployment**: Render (with Blueprint support)
- **Version Control**: Git

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Next.js       │         │   Django        │
│   Frontend      │────────▶│   REST API      │
│   (Port 3000)   │         │   (Port 8000)   │
└─────────────────┘         └─────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐    ┌────▼────┐    ┌─────▼─────┐
              │ PostgreSQL│    │  Redis  │    │  OpenAI   │
              │ Database  │    │  Cache  │    │    API    │
              └───────────┘    └─────────┘    └───────────┘
```

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+ or Bun
- PostgreSQL 15+ (or use SQLite for development)
- Redis (optional, for caching)
- Docker & Docker Compose (for containerized deployment)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/farhan-nahid/health-pilot.git
cd health-pilot
```

#### 2. Backend Setup

```bash
cd server

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional)
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will be available at: http://localhost:8000

#### 3. Frontend Setup

```bash
cd client

# Install dependencies (using bun)
bun install

# Or using npm
npm install

# Run development server
bun dev
# Or: npm run dev
```

Frontend will be available at: http://localhost:3000

### Environment Variables

#### Backend (.env)
```env
DEBUG=1
SECRET_KEY=your-secret-key
DB_ENGINE=django.db.backends.postgresql
DB_NAME=healthpilot
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
OPENAI_API_KEY=your-openai-key
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env

# Build and run all services
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

**Services will be available at:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin
- API Docs: http://localhost:8000/swagger

### Individual Service Deployment

```bash
# Backend only
cd server
docker-compose up --build

# Frontend only
cd client
docker-compose up --build
```

### Deploy to Render

This project includes a `render.yaml` blueprint for one-click deployment:

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will auto-detect `render.yaml`
4. Click "Apply" to deploy all services

For detailed deployment instructions, see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

## 📚 API Documentation

### Interactive API Documentation

- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

### Main API Endpoints

#### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/user/` - Get current user

#### Patients
- `GET /api/patients/profile/` - Get patient profile
- `PUT /api/patients/profile/` - Update patient profile
- `POST /api/patients/reports/` - Upload medical report
- `GET /api/patients/reports/` - List medical reports

#### Doctors
- `GET /api/doctors/` - List all doctors
- `GET /api/doctors/{id}/` - Get doctor details
- `GET /api/doctors/profile/` - Get own doctor profile
- `PUT /api/doctors/profile/` - Update doctor profile
- `POST /api/doctors/availability/` - Set availability
- `GET /api/doctors/availability/` - Get availability

#### Appointments
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/` - List appointments
- `PATCH /api/appointments/{id}/accept/` - Accept appointment
- `PATCH /api/appointments/{id}/reject/` - Reject appointment
- `PATCH /api/appointments/{id}/complete/` - Complete appointment

## 📁 Project Structure

```
health-pilot/
├── client/                    # Next.js Frontend
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (dashboard)/      # Dashboard pages
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── dashboard/        # Dashboard components
│   │   └── ui/              # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript types
│   ├── public/              # Static assets
│   ├── Dockerfile           # Frontend Docker config
│   └── package.json         # Frontend dependencies
│
├── server/                   # Django Backend
│   ├── accounts/            # User authentication
│   ├── doctors/             # Doctor management
│   ├── patients/            # Patient management
│   ├── appointments/        # Appointment system
│   ├── core/                # Django settings
│   ├── Dockerfile           # Backend Docker config
│   ├── requirements.txt     # Python dependencies
│   └── manage.py            # Django management
│
├── docker-compose.yml       # Multi-service orchestration
├── render.yaml             # Render deployment config
├── .env.example            # Environment template
└── README.md               # This file
```

## 🗄️ Database Models

### User & Authentication
- **User** - Custom user model with email authentication
  - Fields: email, user_type (patient/doctor), phone, first_name, last_name
- **UserSettings** - User preferences and notification settings
  - Fields: appointment_reminders, health_tips, security_alerts, two_factor_auth

### Doctor Management
- **Doctor** - Doctor profile and information
  - Fields: user, specialization, bio, profile_picture, experience_years, consultation_fee
  - Specializations: Cardiologist, Neurologist, Dermatologist, Orthopedic, Pediatrician, etc.
- **DoctorAvailability** - Doctor schedule management
  - Fields: doctor, day_of_week, start_time, end_time, is_available

### Patient Management
- **Patient** - Patient profile and information
  - Fields: user, date_of_birth, blood_group, address, emergency_contact
- **MedicalReport** - Patient medical reports with AI analysis
  - Fields: patient, report_file, symptoms, ai_specialization, ai_summary, extracted_text

### Appointments
- **Appointment** - Appointment booking and management
  - Fields: patient, doctor, medical_report, appointment_date, appointment_time, status, symptoms, doctor_notes, rejection_reason
  - Status: pending, accepted, rejected, completed, cancelled

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Django REST Framework for the robust API framework
- Next.js team for the amazing React framework
- Radix UI for accessible component primitives
- OpenAI for AI-powered features
- All contributors and supporters

## 📞 Support

For support, email support@healthpilot.com or open an issue in the repository.

---

**Built with ❤️ for better healthcare management**
