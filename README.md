# Health Pilot

Health Pilot is a full-stack healthcare management platform connecting patients and doctors. It features role-based dashboards, appointment scheduling with lifecycle management, AI-powered symptom analysis and medical report processing, patient-doctor chat, family/dependent management, and prescription PDF generation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Django](https://img.shields.io/badge/Django-4.2.30-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

---

- [Architecture](#architecture)
- [Frontend](#frontend)
  - [Tech Stack & Packages](#tech-stack--packages)
  - [Project Structure](#project-structure)
  - [Routing](#routing)
  - [API Integration](#api-integration)
  - [Data Fetching Pattern](#data-fetching-pattern)
- [Backend](#backend)
  - [Tech Stack & Packages](#tech-stack--packages-1)
  - [Project Structure](#project-structure-1)
  - [Models](#models)
  - [API Endpoints](#api-endpoints)
  - [Authentication & Authorization](#authentication--authorization)
  - [AI Service](#ai-service)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Docker](#docker)
- [Development Commands](#development-commands)

---

## Architecture

```
User (Browser)
    │
    ▼
Next.js App (localhost:3000)
    │  (xior HTTP client + Token auth)
    ▼
Django REST API (localhost:8000/api/)
    │
    ├── PostgreSQL / SQLite
    ├── Hugging Face Inference API (AI analysis)
    └── Redis (Celery task queue, optional)
```

---

## Frontend

### Tech Stack & Packages

| Package | Version | Purpose |
|---|---|---|
| **next** | 16.2.6 | React framework with App Router |
| **react** / **react-dom** | 19.2.3 | UI library |
| **typescript** | ^5.9.3 | Type safety |
| **@tanstack/react-query** | ^5.90.12 | Server state management, caching, and mutations |
| **xior** | ^0.8.2 | HTTP client (axios-alternative) with interceptors |
| **zod** | ^4.2.1 | Schema validation |
| **react-hook-form** | ^7.69.0 | Performant form management |
| **@hookform/resolvers** | — | Bridges zod schemas into react-hook-form |
| **tailwindcss** | 4.1.18 | Utility-first CSS framework |
| **@radix-ui/react-*** | 12 packages | Accessible, unstyled UI primitives (dialog, select, dropdown-menu, tabs, switch, avatar, etc.) |
| **class-variance-authority** | ^0.7.1 | Component variant management |
| **tailwind-merge** | ^3.4.0 | Intelligent Tailwind class merging |
| **lucide-react** | ^0.562.0 | Icon library |
| **next-themes** | ^0.4.6 | Dark/light mode switching |
| **nuqs** | ^2.8.5 | URL search params state management |
| **sonner** | ^2.0.7 | Toast notifications |
| **date-fns** | ^4.1.0 | Date formatting and manipulation |
| **cmdk** | ^1.1.1 | Command palette (used in comboboxes) |
| **react-day-picker** | ^9.13.0 | Calendar and date picker |
| **react-intersection-observer** | — | Scroll-based infinite query triggering |
| **clsx** | — | Conditional class name construction |

### Project Structure

```
client/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   #  Auth routes (login, register, reset)
│   ├── (dashboard)/              #  Protected dashboard routes
│   │   ├── appointments/
│   │   ├── doctors/
│   │   ├── patients/
│   │   ├── reports/
│   │   ├── family/
│   │   ├── schedule/
│   │   ├── reviews/
│   │   ├── activity/
│   │   ├── profile/
│   │   └── settings/
│   └── (public)/                 #  Public pages (landing, features, about, etc.)
│       ├── page.tsx              # Landing page
│       ├── features/
│       ├── about/
│       ├── contact/
│       ├── privacy/
│       ├── terms/
│       ├── cookies/
│       ├── hipaa/
│       ├── faq/
│       ├── help/
│       ├── docs/
│       └── community/
├── components/
│   ├── auth/                     # LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm
│   ├── chat/                     # ChatInterface for patient-doctor messaging
│   ├── dashboard/                # Sidebar, Header, DashboardClient, profile/settings clients
│   ├── ui/                       # 30 shadcn/ui primitives (button, card, dialog, form, etc.)
│   └── providers.tsx             # QueryClientProvider, ThemeProvider, NuqsAdapter
├── hooks/                        # All TanStack Query hooks (12 files)
├── lib/
│   ├── api.ts                    # Configured xior instance with auth interceptor
│   ├── notifications.ts          # Toast notification helpers
│   └── utils.ts                  # cn() class merging utility
├── schemas/                      # Zod validation schemas (7 files, mirrors backend models)
├── types/                        # TypeScript interfaces (11 files)
├── constants.ts                  # Blood groups, time slots, days, specializations
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### Routing

| Group | Path | Description | Access |
|---|---|---|---|
| Public | `/` | Landing page | Everyone |
| Public | `/features`, `/about`, `/contact`, etc. | Static content pages | Everyone |
| Auth | `/login` | Login form | Redirects to `/dashboard` if authenticated |
| Auth | `/register` | Registration form | Redirects to `/dashboard` if authenticated |
| Auth | `/forgot-password` | Password reset request | Everyone |
| Auth | `/reset-password/[uid]/[token]` | Password reset confirm | Everyone |
| Dashboard | `/dashboard` | Role-based stats summary | Authenticated |
| Dashboard | `/appointments` | Appointment list & management | Authenticated |
| Dashboard | `/doctors` | Browse doctors | Patient only |
| Dashboard | `/patients` | Manage patients | Doctor only |
| Dashboard | `/reports` | AI Symptom Analyzer | Patient only |
| Dashboard | `/family` | Dependent/family management | Patient only |
| Dashboard | `/schedule` | Manage availability slots | Doctor only |
| Dashboard | `/reviews` | View/manage reviews | Authenticated |
| Dashboard | `/activity` | Paginated activity feed | Authenticated |
| Dashboard | `/profile` | Edit personal profile | Authenticated |
| Dashboard | `/settings` | Notification preferences | Authenticated |

### API Integration

All frontend-to-backend communication uses a single **xior** instance defined in `client/lib/api.ts`:

```typescript
const api = xior.create({ baseURL: "https://health-pilot-server.vercel.app/api" });

// Request interceptor attaches auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers = { ...config.headers, Authorization: `Token ${token}` };
  return config;
});
```

**Authentication flow:**
- `POST /api/auth/login/` → receives `key` (token) → stored in `localStorage`
- `POST /api/auth/registration/` → creates user + profile → auto-login or redirect
- `POST /api/auth/logout/` → removes token + clears TanStack Query cache
- `useUser()` hook checks `localStorage` for token, then fetches `GET /api/auth/user/`

### Data Fetching Pattern

Every API resource follows a consistent pattern using TanStack Query hooks:

```typescript
// Query — auto-manages caching, refetching, and loading/error states
export function useDoctors(search: string, page: number) {
  return useQuery({
    queryKey: ["doctors", search, page],
    queryFn: async () => {
      const { data } = await api.get("/doctors/", { params: { search, page } });
      return data;
    },
  });
}

// Mutation — invalidates related queries on success
export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/appointments/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
```

**Key query keys used across the app:**

| Query Key | Endpoint | Purpose |
|---|---|---|
| `["user"]` | `GET /auth/user/` | Current authenticated user |
| `["doctors", search, page]` | `GET /doctors/` | Paginated doctor list |
| `["doctor-profile"]` | `GET /doctors/profile/` | Current doctor's own profile |
| `["patient-profile"]` | `GET /patients/profile/` | Current patient's own profile |
| `["patients", search, page]` | `GET /patients/` | Paginated patient list (doctor view) |
| `["appointments", ...filters]` | `GET /appointments/` | Appointment list with filters |
| `["availability"]` | `GET /doctor-availability/` | Doctor availability slots |
| `["dependents"]` | `GET /dependents/` | Patient's family members |
| `["symptom-assessments", page]` | `GET /symptom-assessments/` | AI symptom assessment history |
| `["dashboard-summary", userType]` | `GET /patients\|doctors/dashboard_summary/` | Dashboard statistics |
| `["dashboard-activity", userType, page]` | `GET /patients\|doctors/activity/` | Activity feed |
| `["user-settings"]` | `GET /user/settings/` | User notification preferences |
| `["chat-messages", appointmentId]` | `GET /chat/{id}/messages/` | Chat messages for an appointment |
| `["medical-reports", page]` | `GET /medical-reports/` | Uploaded medical reports |

---

## Backend

### Tech Stack & Packages

| Package | Version | Purpose |
|---|---|---|
| **Django** | 4.2.30 | Web framework |
| **djangorestframework** | 3.15.2 | REST API toolkit |
| **dj-rest-auth** | 5.0.2 | Authentication endpoints (login, logout, password reset) |
| **django-allauth** | 65.14.1 | User registration with email-only auth |
| **django-cors-headers** | 4.3.1 | Cross-Origin Resource Sharing |
| **drf-yasg** | 1.21.11 | Swagger/OpenAPI documentation generation |
| **whitenoise** | 6.9.0 | Static file serving |
| **gunicorn** | — | Production WSGI server |
| **psycopg2-binary** | 2.9.11 | PostgreSQL database adapter |
| **dj-database-url** | 2.1.0 | Database URL parsing for config |
| **python-dotenv** | 1.2.2 | Environment variable loading |
| **pillow** | 12.2.0 | Image processing (doctor profile pictures) |
| **reportlab** | 4.4.0 | Prescription PDF generation |
| **httpx** | 0.27.2 | HTTP client for AI API calls |
| **drf-yasg** | 1.21.11 | Swagger UI |

### Project Structure

```
server/
├── api/                           # Django project configuration
│   ├── settings.py                # All settings (DB, auth, CORS, email, AI, Celery)
│   ├── urls.py                    # Root URL routing
│   └── views.py                   # Health check endpoint
├── accounts/                      # User & authentication app
│   ├── models.py                  # User (custom), UserSettings
│   ├── serializers.py             # Register, User, Settings serializers
│   ├── views.py                   # UserSettingsView, PasswordResetConfirmView
│   ├── permissions.py             # IsDoctor, IsPatient, IsOwnerOrReadOnly, etc.
│   └── admin.py
├── patients/                      # Patient app
│   ├── models.py                  # Patient, MedicalReport, SymptomAssessment, Dependent
│   ├── serializers.py             # Patient, MedicalReport, Dependent, SymptomAssessment
│   ├── views.py                   # PatientViewSet, MedicalReportViewSet, etc.
│   ├── ai_service.py              # Hugging Face AI integration
│   └── admin.py
├── doctors/                       # Doctor app
│   ├── models.py                  # Doctor, DoctorAvailability
│   ├── serializers.py             # Doctor, DoctorAvailability, DoctorList
│   ├── views.py                   # DoctorViewSet, DoctorAvailabilityViewSet
│   └── admin.py
├── appointments/                  # Appointments & chat app
│   ├── models.py                  # Appointment, ChatMessage
│   ├── serializers.py             # AppointmentCreate, Appointment, ChatMessage
│   ├── views.py                   # AppointmentViewSet, Chat views
│   ├── pdf.py                     # Prescription PDF generation (ReportLab)
│   └── admin.py
├── reviews/                       # Reviews app
│   ├── models.py                  # Review
│   ├── serializers.py             # ReviewSerializer
│   └── views.py                   # ReviewViewSet
├── manage.py                      # Django management entry point
├── requirements.txt               # Python dependencies
├── seed_data.py                   # Database seeding (72+ users, 1000+ appointments)
├── Dockerfile
└── vercel.json                    # Vercel deployment config
```

### Models

#### accounts.User (Custom User Model)

| Field | Type | Notes |
|---|---|---|
| `email` | EmailField | Unique, used as `USERNAME_FIELD` |
| `user_type` | CharField(10) | Choices: `"patient"`, `"doctor"` |
| `phone` | CharField(30) | Nullable |
| `first_name` | CharField | Inherited from `AbstractUser` |
| `last_name` | CharField | Inherited from `AbstractUser` |
| `password` | CharField | Inherited |
| `is_active` | BooleanField | Inherited |
| `is_staff` | BooleanField | Inherited |
| `is_superuser` | BooleanField | Inherited |

- Username is **not used** (`username = None`). Authentication is email-only.
- Uses custom `UserManager` with `create_user(email, password)`.

#### accounts.UserSettings

| Field | Type | Default |
|---|---|---|
| `user` | OneToOneField → User | `related_name="settings"` |
| `appointment_reminders` | BooleanField | True |
| `health_tips` | BooleanField | True |
| `security_alerts` | BooleanField | True |
| `two_factor_auth` | BooleanField | False |

- Auto-created via `post_save` signal when a `User` is created.

#### patients.Patient

| Field | Type | Notes |
|---|---|---|
| `user` | OneToOneField → User | `related_name="patient_profile"` |
| `date_of_birth` | DateField | Nullable |
| `blood_group` | CharField(5) | Nullable |
| `address` | TextField | Nullable |
| `emergency_contact` | CharField(30) | Nullable |
| `created_at` | DateTimeField | `auto_now_add` |
| `updated_at` | DateTimeField | `auto_now` |

#### patients.MedicalReport

| Field | Type | Notes |
|---|---|---|
| `patient` | ForeignKey → Patient | `related_name="medical_reports"` |
| `dependent` | ForeignKey → Dependent | Nullable, `SET_NULL` on delete |
| `report_file` | FileField | `upload_to="medical_reports/"` |
| `symptoms` | TextField | User-described symptoms at upload time |
| `ai_specialization` | CharField(255) | Nullable, AI-recommended specialization |
| `ai_summary` | TextField | Nullable, AI-generated report summary |
| `extracted_text` | TextField | Nullable, AI-extracted text from PDF |
| `uploaded_at` | DateTimeField | `auto_now_add` |

#### patients.SymptomAssessment

| Field | Type | Notes |
|---|---|---|
| `patient` | ForeignKey → Patient | `related_name="symptom_assessments"` |
| `dependent` | ForeignKey → Dependent | Nullable |
| `symptoms` | TextField | User's symptom description |
| `recommended_specialization` | CharField(255) | Nullable |
| `probable_conditions` | JSONField | `default=list` — array of `{name, likelihood, reasoning}` |
| `medication_guidance` | JSONField | `default=list` — array of `{name, purpose, dosage_note, warning}` |
| `home_care_suggestions` | JSONField | `default=list` |
| `red_flags` | JSONField | `default=list` |
| `ai_summary` | TextField | Nullable |
| `disclaimer` | TextField | Nullable |
| `created_at` | DateTimeField | `auto_now_add` |

#### patients.Dependent

| Field | Type | Notes |
|---|---|---|
| `patient` | ForeignKey → Patient | `related_name="dependents"` |
| `name` | CharField(255) | |
| `relationship` | CharField(20) | Choices: Son, Daughter, Spouse, Parent, Other |
| `date_of_birth` | DateField | |
| `gender` | CharField(10) | Choices: Male, Female, Other |
| `blood_group` | CharField(5) | Nullable |
| `linked_user` | OneToOneField → User | Nullable, `related_name="dependent_profile"` |
| `created_at` | DateTimeField | `auto_now_add` |
| `updated_at` | DateTimeField | `auto_now` |

#### doctors.Doctor

| Field | Type | Notes |
|---|---|---|
| `user` | OneToOneField → User | `related_name="doctor_profile"` |
| `specialization` | CharField(50) | 10 choices: cardiologist, neurologist, dermatologist, orthopedic, pediatrician, psychiatrist, gynecologist, oncologist, gastroenterologist, general_physician |
| `bio` | TextField | Nullable |
| `profile_picture` | ImageField | Nullable |
| `experience_years` | IntegerField | Default 0 |
| `consultation_fee` | DecimalField(10,2) | Default 0.00 |
| `created_at` | DateTimeField | `auto_now_add` |
| `updated_at` | DateTimeField | `auto_now` |

#### doctors.DoctorAvailability

| Field | Type | Notes |
|---|---|---|
| `doctor` | ForeignKey → Doctor | `related_name="availabilities"` |
| `day_of_week` | CharField(10) | Choices: monday–sunday |
| `start_time` | TimeField | |
| `end_time` | TimeField | |
| `is_available` | BooleanField | Default True |
| **Meta.unique_together** | | (`doctor`, `day_of_week`, `start_time`) |

#### appointments.Appointment

| Field | Type | Notes |
|---|---|---|
| `patient` | ForeignKey → Patient | `related_name="appointments"` |
| `dependent` | ForeignKey → Dependent | Nullable, `SET_NULL` |
| `doctor` | ForeignKey → Doctor | `related_name="appointments"` |
| `medical_report` | ForeignKey → MedicalReport | Nullable |
| `appointment_date` | DateField | |
| `appointment_time` | TimeField | |
| `status` | CharField(20) | Choices: pending, accepted, rejected, completed, cancelled |
| `symptoms` | TextField | |
| `doctor_notes` | TextField | Nullable |
| `prescription_data` | JSONField | `default=list` — array of medication objects |
| `follow_up_required` | BooleanField | Default False |
| `follow_up_date` | DateField | Nullable |
| `follow_up_notes` | TextField | Nullable |
| `rejection_reason` | TextField | Nullable |
| `created_at` | DateTimeField | `auto_now_add` |
| `updated_at` | DateTimeField | `auto_now` |
| **Meta.unique_together** | | (`doctor`, `appointment_date`, `appointment_time`) |

#### appointments.ChatMessage

| Field | Type | Notes |
|---|---|---|
| `appointment` | ForeignKey → Appointment | `related_name="messages"` |
| `sender_type` | CharField(10) | Inherited from `sender` generic relation or explicit field |
| `message` | TextField | |
| `attachment` | FileField | Nullable |
| `created_at` | DateTimeField | `auto_now_add` |

#### reviews.Review

| Field | Type | Notes |
|---|---|---|
| `doctor` | ForeignKey → Doctor | `related_name="reviews"` |
| `patient` | ForeignKey → Patient | `related_name="reviews"` |
| `rating` | IntegerField | Validated 1–5 |
| `comment` | TextField | |
| `created_at` | DateTimeField | `auto_now_add` |
| `updated_at` | DateTimeField | `auto_now` |
| **Meta.unique_together** | | (`doctor`, `patient`) — one review per patient per doctor |

### API Endpoints

All endpoints are mounted under `/api/` prefix.

#### Authentication (dj-rest-auth)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login/` | No | Login, returns token `key` |
| POST | `/api/auth/logout/` | Token | Logout |
| POST | `/api/auth/registration/` | No | Register new user |
| GET | `/api/auth/user/` | Token | Get current user |
| PATCH/PUT | `/api/auth/user/` | Token | Update current user |
| POST | `/api/auth/password/change/` | Token | Change password |
| POST | `/api/auth/password/reset/` | No | Forgot password (sends email) |
| POST | `/api/auth/password/reset/confirm/` | No | Reset password with uid/token |
| POST | `/api/auth/registration/verify-email/` | No | Verify email |
| POST | `/api/auth/registration/resend-email/` | No | Resend verification email |

#### Accounts

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/user/settings/` | Token | Get notification settings |
| PATCH/PUT | `/api/user/settings/` | Token | Update notification settings |

#### Patients

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/patients/` | Token | List patients (own or doctor's) |
| GET | `/api/patients/{id}/` | Token | Patient detail |
| PATCH/PUT | `/api/patients/{id}/` | Token | Update patient |
| GET | `/api/patients/profile/` | Token (patient) | Get own patient profile |
| GET | `/api/patients/dashboard_summary/` | Token (patient) | Dashboard stats (appointments count, upcoming, etc.) |
| GET | `/api/patients/activity/` | Token (patient) | Paginated activity feed |
| PATCH/PUT | `/api/patients/update_profile/` | Token (patient) | Update patient profile fields |
| GET | `/api/patients/appointments/` | Token (patient) | Patient's appointments |

#### Doctors

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/doctors/` | Token | List doctors (paginated, searchable by name/specialization) |
| GET | `/api/doctors/{id}/` | Token | Doctor detail (includes reviews, availabilities) |
| PATCH/PUT | `/api/doctors/{id}/` | Token | Update doctor |
| GET | `/api/doctors/profile/` | Token (doctor) | Get own doctor profile |
| PATCH/PUT | `/api/doctors/update_profile/` | Token (doctor) | Update doctor profile |
| GET | `/api/doctors/by_specialization/` | Token | Filter doctors by specialization query param |
| GET | `/api/doctors/appointments/` | Token (doctor) | Doctor's appointments |
| GET | `/api/doctors/dashboard_summary/` | Token (doctor) | Dashboard stats |
| GET | `/api/doctors/activity/` | Token (doctor) | Paginated activity feed |

#### Doctor Availability

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/doctor-availability/` | Token | List slots (own or filterable by `doctor_id`) |
| POST | `/api/doctor-availability/` | Token (doctor) | Create availability slot(s) |
| GET | `/api/doctor-availability/{id}/` | Token | Get slot detail |
| PATCH/PUT | `/api/doctor-availability/{id}/` | Token (doctor) | Update slot |
| DELETE | `/api/doctor-availability/{id}/` | Token (doctor) | Delete slot |

#### Appointments

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/appointments/` | Token | List appointments (filtered by role) |
| POST | `/api/appointments/` | Token (patient) | Create appointment |
| GET | `/api/appointments/{id}/` | Token | Appointment detail |
| POST | `/api/appointments/{id}/accept/` | Token (doctor) | Accept appointment |
| POST | `/api/appointments/{id}/reject/` | Token (doctor) | Reject appointment (include reason) |
| POST | `/api/appointments/{id}/complete/` | Token (doctor) | Complete appointment (add notes, prescription) |
| POST | `/api/appointments/{id}/cancel/` | Token (patient) | Cancel appointment |
| GET | `/api/appointments/{id}/prescription_pdf/` | Token | Download prescription as PDF |
| GET | `/api/appointments/available_slots/` | Token | Get free slots for a doctor on a date |

#### Chat

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/chat/send/` | Token | Send a chat message |
| GET | `/api/chat/{appointment_id}/messages/` | Token | List chat messages for an appointment |

#### Medical Reports

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/medical-reports/` | Token | List medical reports |
| POST | `/api/medical-reports/` | Token (patient) | Upload report (triggers AI analysis) |
| GET | `/api/medical-reports/{id}/` | Token | Report detail |

#### Dependents

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/dependents/` | Token (patient) | List dependents |
| POST | `/api/dependents/` | Token (patient) | Create dependent |
| GET | `/api/dependents/{id}/` | Token | Dependent detail |
| PATCH/PUT | `/api/dependents/{id}/` | Token (patient) | Update dependent |
| DELETE | `/api/dependents/{id}/` | Token (patient) | Delete dependent |

#### Symptom Assessments

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/symptom-assessments/` | Token | List assessments |
| POST | `/api/symptom-assessments/` | Token (patient) | Create assessment (triggers AI analysis) |
| GET | `/api/symptom-assessments/{id}/` | Token | Assessment detail |

#### Reviews

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews/` | Token | List reviews (filterable by `doctor_id`, `patient_id`) |
| POST | `/api/reviews/` | Token (patient) | Create review |
| GET | `/api/reviews/{id}/` | Token | Review detail |
| PATCH/PUT | `/api/reviews/{id}/` | Token (patient) | Update own review |
| DELETE | `/api/reviews/{id}/` | Token (patient) | Delete own review |

### Authentication & Authorization

- **Token-based**: Django REST Framework `TokenAuthentication`. No JWT.
- **Role system**: `User.user_type` field with values `"patient"` or `"doctor"`.
- **Registration**: Custom `CustomRegisterSerializer` creates the User and automatically instantiates a `Patient` or `Doctor` profile based on `user_type`.
- **Permissions**:
  - `IsDoctor` — restricts to `user_type == "doctor"`
  - `IsPatient` — restricts to `user_type == "patient"`
  - `IsOwnerOrReadOnly` — only the owner can edit
  - `IsDoctorOwner` / `IsPatientOwner` — role-specific ownership checks
- **Email-only auth**: `ACCOUNT_AUTHENTICATION_METHOD = "email"`, no username field.
- **Email verification**: Configured as `"none"` (optional).

### AI Service

Located in `server/patients/ai_service.py`. Integrates with Hugging Face Inference API.

**`analyze_symptoms(symptoms)`** — Used by symptom assessment flow:
- Sends symptom description to Hugging Face chat completions API
- Parses structured JSON response containing:
  - `probable_conditions` (array of `{name, likelihood, reasoning}`)
  - `recommended_specialization`
  - `medication_guidance` (array of `{name, purpose, dosage_note, warning}`)
  - `home_care_suggestions`
  - `red_flags`
  - `summary`
  - `disclaimer`
- Falls back to safe defaults if AI call fails or returns malformed JSON.

**`process_medical_report(report_file, symptoms)`** — Used by medical report upload:
- Sends PDF file content + symptoms to Hugging Face
- Returns extracted text, primary specialization, report summary, and symptom analysis

**Configuration:**
- Endpoint: `https://router.huggingface.co/v1/chat/completions`
- Model: Configurable via `HUGGINGFACE_MODEL` env var (default: `Qwen/Qwen2.5-7B-Instruct-1M:fastest`)
- Auth: `HUGGINGFACE_API_KEY` env var

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ (or Bun)
- Docker (optional, for containerized setup)

### 1) Clone and configure env

```bash
git clone https://github.com/farhan-nahid/health-pilot.git
cd health-pilot
cp .env.example .env
```

### 2) Run backend (Django)

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend: http://localhost:8000

### 3) Run frontend (Next.js)

```bash
cd client
npm install
npm run dev
```

Frontend: http://localhost:3000

---

## Environment Variables

Create `.env` from `.env.example` at the repository root.

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | — | Django secret key |
| `DEBUG` | False | Debug mode |
| `DATABASE_URL` | — | PostgreSQL connection string (SQLite fallback if unset) |
| `FRONTEND_URL` | http://localhost:3000 | Frontend URL for CORS/email links |
| `HUGGINGFACE_API_KEY` | — | Hugging Face API token for AI features |
| `HUGGINGFACE_MODEL` | Qwen/Qwen2.5-7B-Instruct-1M:fastest | AI model name |
| `EMAIL_HOST` / `EMAIL_HOST_USER` / etc. | — | SMTP configuration |
| `CELERY_BROKER_URL` | redis://localhost:6379/0 | Redis URL (optional, for async tasks) |

---

## Docker

### Development stack

```bash
docker compose -f docker-compose.dev.yaml --env-file .env up --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL (port 5433)
- Redis (port 6380)
- API docs: http://localhost:8000/api/docs/

### Production stack

```bash
docker compose -f docker-compose.prod.yaml --env-file .env up --build -d
```

---

## Development Commands

### Frontend

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run format` | Run Biome formatter |
| `npm run typecheck` | TypeScript type checking |

### Backend

| Command | Purpose |
|---|---|
| `python manage.py runserver` | Start dev server |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py makemigrations` | Create new migrations |
| `python manage.py test` | Run tests |
| `python manage.py createsuperuser` | Create admin user |
| `python seed_data.py` | Seed database with sample data |
