from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("patients", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="SymptomAssessment",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("symptoms", models.TextField()),
                (
                    "recommended_specialization",
                    models.CharField(blank=True, max_length=255, null=True),
                ),
                ("probable_conditions", models.JSONField(blank=True, default=list)),
                ("medication_guidance", models.JSONField(blank=True, default=list)),
                (
                    "home_care_suggestions",
                    models.JSONField(blank=True, default=list),
                ),
                ("red_flags", models.JSONField(blank=True, default=list)),
                ("ai_summary", models.TextField(blank=True, null=True)),
                ("disclaimer", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "dependent",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="symptom_assessments",
                        to="patients.dependent",
                    ),
                ),
                (
                    "patient",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="symptom_assessments",
                        to="patients.patient",
                    ),
                ),
            ],
        ),
    ]
