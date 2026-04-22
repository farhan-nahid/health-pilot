from io import BytesIO

from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def _get_patient_name(appointment):
    if appointment.dependent:
        return appointment.dependent.name
    return appointment.patient.user.get_full_name() or appointment.patient.user.email


def _get_doctor_name(appointment):
    return appointment.doctor.user.get_full_name() or appointment.doctor.user.email


def _draw_header(canvas, doc, appointment):
    canvas.saveState()
    width, height = A4

    # Homepage-inspired soft blue accent background elements
    canvas.setFillColor(colors.HexColor("#EFF6FF"))
    canvas.circle(width - 10 * mm, height - 8 * mm, 24 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#ECFEFF"))
    canvas.circle(8 * mm, height - 12 * mm, 18 * mm, fill=1, stroke=0)

    canvas.setFillColor(colors.HexColor("#2563EB"))
    logo_x = 18 * mm
    logo_y = height - 34 * mm
    logo_w = 18 * mm
    logo_h = 18 * mm
    canvas.roundRect(logo_x, logo_y, logo_w, logo_h, 5 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    logo_font = "Helvetica-Bold"
    logo_font_size = 13
    canvas.setFont(logo_font, logo_font_size)
    ascent = pdfmetrics.getAscent(logo_font) * logo_font_size / 1000
    descent = pdfmetrics.getDescent(logo_font) * logo_font_size / 1000
    centered_baseline_y = logo_y + (logo_h - (ascent - descent)) / 2 - descent
    canvas.drawCentredString(logo_x + (logo_w / 2), centered_baseline_y, "HP")

    canvas.setFillColor(colors.HexColor("#0F172A"))
    canvas.setFont("Helvetica-Bold", 18)
    canvas.drawString(40 * mm, height - 24 * mm, "Health Pilot")
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#334155"))
    canvas.drawString(40 * mm, height - 30 * mm, "Prescription and follow-up summary")

    canvas.setFont("Helvetica", 9)
    canvas.drawRightString(
        width - 18 * mm,
        height - 24 * mm,
        f"Appointment #{appointment.id}",
    )
    canvas.drawRightString(
        width - 18 * mm,
        height - 30 * mm,
        timezone.localtime(timezone.now()).strftime("%d %b %Y, %I:%M %p"),
    )

    canvas.setStrokeColor(colors.HexColor("#BFDBFE"))
    canvas.setLineWidth(1)
    canvas.line(18 * mm, height - 36 * mm, width - 18 * mm, height - 36 * mm)
    canvas.restoreState()


def build_prescription_pdf(appointment):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=42 * mm,
        bottomMargin=18 * mm,
        title=f"Health Pilot Prescription #{appointment.id}",
        author="Health Pilot",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "PrescriptionTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=8,
    )
    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=colors.HexColor("#2563EB"),
        spaceBefore=8,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#334155"),
    )
    label_style = ParagraphStyle(
        "Label",
        parent=body_style,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0F172A"),
    )
    small_style = ParagraphStyle(
        "Small",
        parent=body_style,
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#334155"),
    )

    story = [
        Paragraph("Prescription", title_style),
        Paragraph(
            "This document summarizes the medicines, instructions, and follow-up plan recorded for the completed consultation.",
            body_style,
        ),
        Spacer(1, 8),
    ]

    info_rows = [
        [
            Paragraph("Patient", label_style),
            Paragraph(_get_patient_name(appointment), body_style),
        ],
        [
            Paragraph("Doctor", label_style),
            Paragraph(_get_doctor_name(appointment), body_style),
        ],
        [
            Paragraph("Specialization", label_style),
            Paragraph(appointment.doctor.specialization, body_style),
        ],
        [
            Paragraph("Appointment Date", label_style),
            Paragraph(appointment.appointment_date.strftime("%d %b %Y"), body_style),
        ],
        [
            Paragraph("Appointment Time", label_style),
            Paragraph(appointment.appointment_time.strftime("%I:%M %p"), body_style),
        ],
        [
            Paragraph("Status", label_style),
            Paragraph(appointment.status.title(), body_style),
        ],
    ]

    info_table = Table(info_rows, colWidths=[40 * mm, 120 * mm], hAlign="LEFT")
    info_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EFF6FF")),
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#BFDBFE")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DBEAFE")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.extend([info_table, Spacer(1, 10)])

    story.append(Paragraph("Clinical Summary", section_style))
    story.append(
        Paragraph(
            appointment.doctor_notes or "No clinical notes were recorded.", body_style
        )
    )

    if appointment.prescription_data:
        story.append(Paragraph("Medicines", section_style))

        medicine_rows = [
            ["Medicine", "Dose", "When to take", "Duration", "Instructions"]
        ]
        for medicine in appointment.prescription_data:
            medicine_rows.append(
                [
                    Paragraph(str(medicine.get("name", "-")), small_style),
                    Paragraph(str(medicine.get("dose", "-")), small_style),
                    Paragraph(str(medicine.get("when_to_take", "-")), small_style),
                    Paragraph(str(medicine.get("duration", "-")), small_style),
                    Paragraph(str(medicine.get("instructions", "-")), small_style),
                ]
            )

        medicine_table = Table(
            medicine_rows,
            colWidths=[32 * mm, 22 * mm, 36 * mm, 24 * mm, 46 * mm],
            repeatRows=1,
            hAlign="LEFT",
        )
        medicine_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563EB")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 9),
                    ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#BFDBFE")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DBEAFE")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        story.extend([medicine_table, Spacer(1, 8)])
    else:
        story.append(
            Paragraph("No medicines were recorded for this consultation.", small_style)
        )

    if (
        appointment.follow_up_required
        or appointment.follow_up_date
        or appointment.follow_up_notes
    ):
        story.append(Paragraph("Follow-up", section_style))
        follow_up_text = (
            "A follow-up visit is recommended."
            if appointment.follow_up_required
            else "Follow-up notes were recorded."
        )
        if appointment.follow_up_date:
            follow_up_text += (
                f" Next visit: {appointment.follow_up_date.strftime('%d %b %Y')}."
            )
        if appointment.follow_up_notes:
            follow_up_text += f" {appointment.follow_up_notes}"
        story.append(Paragraph(follow_up_text, body_style))

    story.append(Spacer(1, 14))
    story.append(Paragraph("Doctor Signature", section_style))

    signature_table = Table(
        [
            [
                Paragraph("", body_style),
                Paragraph("", body_style),
            ],
            [
                Paragraph(
                    f"<b>Dr. {_get_doctor_name(appointment)}</b><br/><font size='8' color='#64748B'>Doctor Name</font>",
                    body_style,
                ),
                Paragraph(
                    f"<b>{timezone.localtime(timezone.now()).strftime('%d %b %Y')}</b><br/><font size='8' color='#64748B'>Date</font>",
                    body_style,
                ),
            ],
        ],
        colWidths=[120 * mm, 40 * mm],
        hAlign="LEFT",
    )
    signature_table.setStyle(
        TableStyle(
            [
                ("LINEABOVE", (0, 0), (0, 0), 1, colors.HexColor("#334155")),
                ("LINEABOVE", (1, 0), (1, 0), 1, colors.HexColor("#334155")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.extend([signature_table, Spacer(1, 10)])

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", color=colors.HexColor("#BFDBFE")))
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            "Generated by Health Pilot. Keep this document for your records and share it with your pharmacist or care provider if needed.",
            small_style,
        )
    )

    doc.build(
        story,
        onFirstPage=lambda canvas, doc: _draw_header(canvas, doc, appointment),
        onLaterPages=lambda canvas, doc: _draw_header(canvas, doc, appointment),
    )
    buffer.seek(0)
    return buffer
