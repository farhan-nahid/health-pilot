#!/usr/bin/env python
"""
Data Seeding Script for Health Pilot
Generates 1000+ records for each model with progress logging
"""

import os
import sys
import django
import random
from datetime import timedelta, date
from decimal import Decimal

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "api.settings")

django.setup()

from accounts.models import User, UserSettings
from appointments.models import Appointment
from doctors.models import Doctor, DoctorAvailability
from patients.models import Patient, MedicalReport, Dependent
from reviews.models import Review
from django.db import transaction

print("=" * 80)
print("HEALTH PILOT - DATABASE SEEDING SCRIPT")
print("=" * 80)

# ------------------ DATA POOLS ------------------
FIRST_NAMES_MALE = [
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Joseph",
    "Thomas",
    "Charles",
]
FIRST_NAMES_FEMALE = [
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Barbara",
    "Elizabeth",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
]
LAST_NAMES = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
]

SPECIALIZATIONS = [
    "cardiologist",
    "neurologist",
    "dermatologist",
    "orthopedic",
    "pediatrician",
]
BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
RELATIONSHIPS = ["Son", "Daughter", "Spouse", "Parent"]
GENDERS = ["Male", "Female", "Other"]
DAYS_OF_WEEK = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]

# Medical Symptoms List
SYMPTOMS = [
    "Fever",
    "Headache",
    "Cough",
    "Shortness of breath",
    "Chest pain",
    "Fatigue",
    "Dizziness",
    "Nausea",
    "Vomiting",
    "Diarrhea",
    "Abdominal pain",
    "Joint pain",
    "Muscle pain",
    "Back pain",
    "Sore throat",
    "Runny nose",
    "Congestion",
    "Loss of appetite",
    "Skin rash",
    "Itching",
    "Swelling in legs",
    "Palpitations",
    "Excessive sweating",
    "Weight loss",
    "Weight gain",
    "Insomnia",
    "Anxiety",
    "Depression",
    "Blurred vision",
    "Eye pain",
    "Ear pain",
    "Hearing loss",
    "Numbness in hands or feet",
    "Tingling sensation",
    "Weakness",
    "Tremors",
    "Difficulty breathing",
    "Wheezing",
    "Constipation",
    "Heartburn",
    "Difficulty swallowing",
    "Blood in stool",
    "Blood in urine",
    "Frequent urination",
    "Painful urination",
    "Irregular periods",
    "Pelvic pain",
    "Excessive bleeding",
    "Hair loss",
    "Dry skin",
]

# Common symptom combinations for more realistic data
SYMPTOM_COMBINATIONS = [
    ["Fever", "Cough", "Fatigue"],
    ["Headache", "Dizziness", "Nausea"],
    ["Chest pain", "Shortness of breath", "Palpitations"],
    ["Abdominal pain", "Nausea", "Vomiting"],
    ["Joint pain", "Muscle pain", "Fatigue"],
    ["Back pain", "Numbness in hands or feet"],
    ["Sore throat", "Cough", "Congestion"],
    ["Skin rash", "Itching"],
    ["Fever", "Headache", "Muscle pain"],
    ["Diarrhea", "Abdominal pain", "Nausea"],
    ["Weight loss", "Fatigue", "Loss of appetite"],
    ["Insomnia", "Anxiety", "Depression"],
    ["Blurred vision", "Headache", "Dizziness"],
    ["Swelling in legs", "Shortness of breath", "Fatigue"],
    ["Palpitations", "Dizziness", "Shortness of breath"],
]


# ------------------ HELPERS ------------------
def log_progress(i, total, message):
    """Print progress (first 10 + every 10th)"""
    if i < 10 or (i + 1) % 10 == 0:
        print(f"[{i + 1}/{total}] {message}")


def generate_email(first_name, last_name, index):
    domains = ["gmail.com", "yahoo.com", "outlook.com"]
    return f"{first_name.lower()}.{last_name.lower()}{index}@{random.choice(domains)}"


def generate_phone():
    return f"+1-{random.randint(200, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"


def generate_dob():
    return date.today() - timedelta(days=random.randint(18 * 365, 70 * 365))


def generate_symptoms():
    """Generate random symptoms - either from common combinations or random selection"""
    # 40% chance to use a common combination
    if random.random() < 0.4:
        combination = random.choice(SYMPTOM_COMBINATIONS)
        return ", ".join(combination)
    else:
        # Randomly select 1-4 symptoms
        num_symptoms = random.randint(1, 4)
        selected = random.sample(SYMPTOMS, min(num_symptoms, len(SYMPTOMS)))
        return ", ".join(selected)


# ------------------ SEED USERS ------------------
@transaction.atomic
def seed_users_and_settings(count=1000):
    print("\nSeeding Users...")

    users = []

    # Test users
    test_users = [
        ("nahid@doctor.com", "doctor"),
        ("nahid@patient.com", "patient"),
    ]

    for i, (email, user_type) in enumerate(test_users):
        u = User(
            email=email,
            user_type=user_type,
            first_name="Nahid",
            last_name=user_type.capitalize(),
            phone=generate_phone(),
            is_active=True,
        )
        u.set_password("Letmein123!")
        users.append(u)
        print(f"[TEST {i + 1}/2] Created {user_type}: {email}")

    # Random users - split between patients and doctors
    # For 72 total users: 2 test + 50 patients + 20 doctors
    # So we need 49 more patients and 19 more doctors from random users
    patient_count = 0
    doctor_count = 0
    target_patients = 49  # 50 total - 1 test patient
    target_doctors = 19  # 20 total - 1 test doctor

    for i in range(2, count):
        first = random.choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)
        last = random.choice(LAST_NAMES)
        email = generate_email(first, last, i)

        # Assign user type based on targets
        if patient_count < target_patients:
            user_type = "patient"
            patient_count += 1
        elif doctor_count < target_doctors:
            user_type = "doctor"
            doctor_count += 1
        else:
            # If we've reached targets, distribute evenly or default to patient
            user_type = random.choice(["patient", "doctor"])

        u = User(
            email=email,
            user_type=user_type,
            first_name=first,
            last_name=last,
            phone=generate_phone(),
            is_active=True,
        )
        u.set_password("Letmein123!")
        users.append(u)

        log_progress(i, count, f"Prepared user: {email} ({user_type})")

    User.objects.bulk_create(users, batch_size=100)

    # Create user settings in batch
    print("\nCreating User Settings...")
    all_users = list(User.objects.all())
    settings_list = [UserSettings(user=u) for u in all_users]
    UserSettings.objects.bulk_create(settings_list, batch_size=100)
    print(f"✓ Created {len(settings_list)} user settings")

    print(f"✓ Inserted {count} users")
    print(f"✓ Password: Letmein123!")


# ------------------ DOCTORS ------------------
@transaction.atomic
def seed_doctors():
    print("\nSeeding Doctors...")

    doctors = []
    users = User.objects.filter(user_type="doctor")

    for i, user in enumerate(users):
        d = Doctor(
            user=user,
            specialization=random.choice(SPECIALIZATIONS),
            experience_years=random.randint(1, 20),
            consultation_fee=Decimal(random.randint(50, 300)),
        )
        doctors.append(d)

        log_progress(i, users.count(), f"Doctor: {user.email}")

    Doctor.objects.bulk_create(doctors, batch_size=100)
    print(f"✓ Created {len(doctors)} doctors")

    # Seed doctor availabilities in batch
    print("\nSeeding Doctor Availabilities...")
    availabilities = []
    all_doctors = list(Doctor.objects.all())
    for doctor in all_doctors:
        # Create 3-5 random availabilities per doctor
        num_availabilities = random.randint(3, 5)
        selected_days = random.sample(DAYS_OF_WEEK, num_availabilities)

        for day in selected_days:
            start_hour = random.randint(8, 14)
            end_hour = start_hour + random.randint(4, 8)
            if end_hour > 22:
                end_hour = 22

            avail = DoctorAvailability(
                doctor=doctor,
                day_of_week=day,
                start_time=f"{start_hour:02d}:00",
                end_time=f"{end_hour:02d}:00",
                is_available=True,
            )
            availabilities.append(avail)

    DoctorAvailability.objects.bulk_create(availabilities, batch_size=100)
    print(f"✓ Created {len(availabilities)} doctor availabilities")


# ------------------ PATIENTS ------------------
@transaction.atomic
def seed_patients():
    print("\nSeeding Patients...")

    patients = []
    users = User.objects.filter(user_type="patient")

    for i, user in enumerate(users):
        p = Patient(
            user=user,
            date_of_birth=generate_dob(),
            blood_group=random.choice(BLOOD_GROUPS),
        )
        patients.append(p)

        log_progress(i, users.count(), f"Patient: {user.email}")

    Patient.objects.bulk_create(patients, batch_size=100)
    print(f"✓ Created {len(patients)} patients")


# ------------------ APPOINTMENTS ------------------
@transaction.atomic
def seed_appointments():
    print("\nSeeding Appointments...")

    patients = list(Patient.objects.all())
    doctors = list(Doctor.objects.all())

    appointments = []
    used_slots = {}  # 🔥 Track per doctor

    statuses = ["pending", "completed", "cancelled"]

    total = len(patients) * 2
    counter = 0
    batch_counter = 0

    for patient in patients:
        for _ in range(2):
            doctor = random.choice(doctors)

            # init doctor slot tracking
            if doctor.id not in used_slots:
                used_slots[doctor.id] = set()

            # 🔥 ensure unique slot
            for _ in range(50):  # retry max 50 times
                appointment_date = date.today() + timedelta(days=random.randint(0, 10))
                appointment_time = f"{random.randint(8, 17):02d}:{random.choice(['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'])}:00"

                slot = (appointment_date, appointment_time)

                if slot not in used_slots[doctor.id]:
                    used_slots[doctor.id].add(slot)
                    break
            else:
                continue  # skip if no unique slot found

            a = Appointment(
                patient=patient,
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                status=random.choice(statuses),
                symptoms=generate_symptoms(),
            )

            appointments.append(a)
            batch_counter += 1

            # Insert in batches of 100
            if batch_counter >= 100:
                Appointment.objects.bulk_create(appointments, batch_size=100, ignore_conflicts=True)
                print(f"✓ Batch inserted {len(appointments)} appointments")
                appointments = []
                batch_counter = 0

            log_progress(
                counter,
                total,
                f"{patient.user.email} → {doctor.user.email} ({appointment_date} {appointment_time})",
            )
            counter += 1

    # Insert remaining appointments
    if appointments:
        Appointment.objects.bulk_create(appointments, batch_size=100, ignore_conflicts=True)
        print(f"✓ Batch inserted {len(appointments)} remaining appointments")

    print(f"✓ Completed appointment seeding")


# ------------------ SPECIAL APPOINTMENTS FOR NAHID USERS ------------------
@transaction.atomic
def seed_special_nahid_appointments():
    print("\nSeeding Special Appointments for Nahid Users...")

    # Get nahid@doctor.com's doctor profile
    try:
        doctor_user = User.objects.get(email="nahid@doctor.com")
        doctor = Doctor.objects.get(user=doctor_user)
        print(f"✓ Found doctor: {doctor.user.email}")
    except (User.DoesNotExist, Doctor.DoesNotExist):
        print("⚠️  nahid@doctor.com not found, skipping doctor appointments")
        return

    # Get nahid@patient.com's patient profile
    try:
        patient_user = User.objects.get(email="nahid@patient.com")
        patient = Patient.objects.get(user=patient_user)
        print(f"✓ Found patient: {patient.user.email}")
    except (User.DoesNotExist, Patient.DoesNotExist):
        print("⚠️  nahid@patient.com not found, skipping patient appointments")
        return

    all_patients = list(Patient.objects.all())
    all_doctors = list(Doctor.objects.all())

    if not all_patients or not all_doctors:
        print("⚠️  No patients or doctors available, skipping special appointments")
        return

    appointments = []
    used_slots = {}
    batch_counter = 0
    total_created = 0

    # 1. Create 100 appointments for nahid@doctor.com with random patients
    print(
        f"\nCreating 100 appointments for {doctor.user.email} with random patients..."
    )
    if doctor.id not in used_slots:
        used_slots[doctor.id] = set()

    for i in range(100):
        random_patient = random.choice(all_patients)

        # Try to find unique slot
        for _ in range(50):
            appointment_date = date.today() + timedelta(days=random.randint(0, 30))
            appointment_time = f"{random.randint(8, 17):02d}:{random.choice(['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'])}:00"

            slot = (appointment_date, appointment_time)

            if slot not in used_slots[doctor.id]:
                used_slots[doctor.id].add(slot)
                break
        else:
            continue  # skip if no unique slot found

        a = Appointment(
            patient=random_patient,
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status=random.choice(["pending", "accepted", "completed", "cancelled"]),
            symptoms=generate_symptoms(),
        )

        appointments.append(a)
        batch_counter += 1

        # Insert in batches of 100
        if batch_counter >= 100:
            Appointment.objects.bulk_create(appointments, batch_size=100, ignore_conflicts=True)
            print(f"✓ Batch inserted {len(appointments)} appointments for doctor")
            total_created += len(appointments)
            appointments = []
            batch_counter = 0

        if (i + 1) % 10 == 0:
            print(
                f"[{i + 1}/100] Added appointment for patient: {random_patient.user.email}"
            )

    # 2. Create 100 appointments for nahid@patient.com with random doctors
    print(
        f"\nCreating 100 appointments for {patient.user.email} with random doctors..."
    )

    for i in range(100):
        random_doctor = random.choice(all_doctors)

        # Initialize slot tracking for this doctor
        if random_doctor.id not in used_slots:
            used_slots[random_doctor.id] = set()

        # Try to find unique slot
        for _ in range(50):
            appointment_date = date.today() + timedelta(days=random.randint(0, 30))
            appointment_time = f"{random.randint(8, 17):02d}:{random.choice(['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'])}:00"

            slot = (appointment_date, appointment_time)

            if slot not in used_slots[random_doctor.id]:
                used_slots[random_doctor.id].add(slot)
                break
        else:
            continue  # skip if no unique slot found

        a = Appointment(
            patient=patient,
            doctor=random_doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status=random.choice(["pending", "accepted", "completed", "cancelled"]),
            symptoms=generate_symptoms(),
        )

        appointments.append(a)
        batch_counter += 1

        # Insert in batches of 100
        if batch_counter >= 100:
            Appointment.objects.bulk_create(appointments, batch_size=100, ignore_conflicts=True)
            print(f"✓ Batch inserted {len(appointments)} appointments for patient")
            total_created += len(appointments)
            appointments = []
            batch_counter = 0

        if (i + 1) % 10 == 0:
            print(
                f"[{i + 1}/100] Added appointment with doctor: {random_doctor.user.email}"
            )

    # Insert remaining appointments
    if appointments:
        Appointment.objects.bulk_create(appointments, batch_size=100, ignore_conflicts=True)
        total_created += len(appointments)
        print(f"✓ Batch inserted {len(appointments)} remaining appointments")

    print(f"\n✓ Created {total_created} special appointments for Nahid users")


# ------------------ REVIEWS FOR NAHID DOCTOR ------------------
@transaction.atomic
def seed_reviews_for_nahid_doctor():
    print("\nSeeding Reviews for nahid@doctor.com...")

    # Get nahid@doctor.com's doctor profile
    try:
        doctor_user = User.objects.get(email="nahid@doctor.com")
        doctor = Doctor.objects.get(user=doctor_user)
        print(f"✓ Found doctor: {doctor.user.email}")
    except (User.DoesNotExist, Doctor.DoesNotExist):
        print("⚠️  nahid@doctor.com not found, skipping reviews")
        return

    # Get all patients who had appointments with this doctor
    appointments = Appointment.objects.filter(doctor=doctor).select_related("patient")
    patients_who_had_appointments = set(
        app.patient for app in appointments if app.patient
    )

    if not patients_who_had_appointments:
        print(
            "⚠️  No patients found with appointments for this doctor, skipping reviews"
        )
        return

    # Review comments pool
    review_comments = [
        "Excellent doctor! Very professional and caring.",
        "Great experience. The doctor took time to listen to my concerns.",
        "Very knowledgeable and helpful. Highly recommended!",
        "Good doctor but had to wait a bit long in the waiting room.",
        "Amazing! Solved my problem quickly and efficiently.",
        "Professional staff and clean clinic. Doctor was very thorough.",
        "I felt heard and understood. Great bedside manner.",
        "The explanation was clear and treatment is working well.",
        "Very satisfied with the consultation. Will come back if needed.",
        "Doctor was friendly and made me feel comfortable.",
        "Comprehensive examination and good advice. Thank you!",
        "Wait time was reasonable and doctor was very attentive.",
        "One of the best doctors I've ever consulted.",
        "Very impressed with the level of care and professionalism.",
        "The doctor explained everything clearly and answered all questions.",
        "Felt rushed during the appointment, but overall good care.",
        "Excellent service! The clinic is modern and well-equipped.",
        "Doctor was patient and understanding. Great experience!",
        "Treatment plan is working perfectly. Feeling much better now.",
        "Highly recommend! Very experienced and skilled doctor.",
    ]

    reviews = []
    reviewed_patients = set()

    # Create 15-25 reviews from random patients who had appointments
    num_reviews = min(random.randint(15, 25), len(patients_who_had_appointments))
    selected_patients = random.sample(list(patients_who_had_appointments), num_reviews)

    for i, patient in enumerate(selected_patients):
        # Skip if already reviewed (due to unique constraint)
        if patient.id in reviewed_patients:
            continue

        # Generate rating (weighted towards higher ratings)
        rating_weights = [0.05, 0.10, 0.15, 0.35, 0.35]  # 1-5 stars
        rating = random.choices([1, 2, 3, 4, 5], weights=rating_weights)[0]

        # Select random comment
        comment = random.choice(review_comments)

        review = Review(doctor=doctor, patient=patient, rating=rating, comment=comment)

        reviews.append(review)
        reviewed_patients.add(patient.id)

        if (i + 1) % 5 == 0:
            print(
                f"[{i + 1}/{num_reviews}] Added review ({rating}⭐) from patient: {patient.user.email}"
            )

    # Bulk create reviews
    if reviews:
        Review.objects.bulk_create(reviews, batch_size=100)
        print(f"\n✓ Created {len(reviews)} reviews for nahid@doctor.com")

        # Calculate average rating
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        print(f"✓ Average rating: {avg_rating:.1f}/5.0 ⭐")


# ------------------ MAIN ------------------
if __name__ == "__main__":
    try:
        print("\nClearing DB...")
        Review.objects.all().delete()
        Appointment.objects.all().delete()
        MedicalReport.objects.all().delete()
        Dependent.objects.all().delete()
        DoctorAvailability.objects.all().delete()
        Doctor.objects.all().delete()
        Patient.objects.all().delete()
        UserSettings.objects.all().delete()
        User.objects.all().delete()

        print("✓ Cleared\n")

        # Create specific numbers: 2 test users + 50 patients + 20 doctors = 72 users
        # First create 50 patient users
        print("Creating 50 patients and 20 doctors...")
        seed_users_and_settings(72)  # 2 test + 50 patients + 20 doctors

        # Then separate them by type
        seed_doctors()  # Will create doctors from doctor-type users (20)
        seed_patients()  # Will create patients from patient-type users (50)

        seed_appointments()
        seed_special_nahid_appointments()
        seed_reviews_for_nahid_doctor()

        print("\n" + "=" * 80)
        print("DONE ✅")
        print("=" * 80)

    except Exception as e:
        print("ERROR:", e)
        import traceback

        traceback.print_exc()
