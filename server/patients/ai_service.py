import PyPDF2
from openai import OpenAI
from django.conf import settings
import json

class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def extract_text_from_pdf(self, pdf_file):
        """Extract text from uploaded PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def analyze_symptoms(self, symptoms):
        """Analyze symptoms and predict medical specialization"""
        try:
            prompt = f"""
            Based on the following symptoms, predict the most relevant medical specialization(s).
            Choose from: Cardiologist, Neurologist, Dermatologist, Orthopedic, Pediatrician, 
            Psychiatrist, Gynecologist, Oncologist, Gastroenterologist, General Physician.
            
            Symptoms: {symptoms}
            
            Respond with ONLY a JSON object in this format:
            {{
                "primary_specialization": "specialization_name",
                "alternative_specializations": ["specialization_1", "specialization_2"],
                "reasoning": "brief explanation"
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a medical AI assistant that helps predict medical specializations based on symptoms."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=300
            )
            
            result = response.choices[0].message.content.strip()
            # Parse JSON response
            try:
                parsed_result = json.loads(result)
                return parsed_result
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "primary_specialization": "General Physician",
                    "alternative_specializations": [],
                    "reasoning": result
                }
        
        except Exception as e:
            raise Exception(f"Error analyzing symptoms: {str(e)}")
    
    def summarize_medical_report(self, report_text, symptoms=""):
        """Summarize medical report content"""
        try:
            prompt = f"""
            Summarize the following medical report in a clear and concise manner.
            Focus on key findings, diagnoses, and recommendations.
            
            Patient Symptoms: {symptoms}
            
            Medical Report:
            {report_text[:4000]}  # Limit text to avoid token limits
            
            Provide a summary that includes:
            1. Key findings
            2. Diagnoses (if any)
            3. Recommendations
            4. Critical information for the doctor
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a medical AI assistant that summarizes medical reports for healthcare professionals."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            summary = response.choices[0].message.content.strip()
            return summary
        
        except Exception as e:
            raise Exception(f"Error summarizing report: {str(e)}")
    
    def process_medical_report(self, pdf_file, symptoms):
        """
        Complete processing pipeline:
        1. Extract text from PDF
        2. Analyze symptoms
        3. Summarize medical report
        """
        try:
            # Extract text from PDF
            extracted_text = self.extract_text_from_pdf(pdf_file)
            
            # Analyze symptoms
            symptom_analysis = self.analyze_symptoms(symptoms)
            
            # Summarize medical report
            report_summary = self.summarize_medical_report(extracted_text, symptoms)
            
            return {
                'extracted_text': extracted_text,
                'symptom_analysis': symptom_analysis,
                'report_summary': report_summary,
                'primary_specialization': symptom_analysis.get('primary_specialization', 'General Physician'),
            }
        
        except Exception as e:
            raise Exception(f"Error processing medical report: {str(e)}")


# Alternative: Using HuggingFace (Free Alternative)
# Uncomment this if you want to use HuggingFace instead of OpenAI

"""
from transformers import pipeline

class HuggingFaceAIService:
    def __init__(self):
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        self.classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    
    def extract_text_from_pdf(self, pdf_file):
        # Same as above
        pass
    
    def analyze_symptoms(self, symptoms):
        candidate_labels = [
            "Cardiologist", "Neurologist", "Dermatologist", "Orthopedic",
            "Pediatrician", "Psychiatrist", "Gynecologist", "Oncologist",
            "Gastroenterologist", "General Physician"
        ]
        
        result = self.classifier(symptoms, candidate_labels)
        
        return {
            "primary_specialization": result['labels'][0],
            "alternative_specializations": result['labels'][1:3],
            "reasoning": f"Based on symptom classification with confidence {result['scores'][0]:.2f}"
        }
    
    def summarize_medical_report(self, report_text, symptoms=""):
        # Chunk text if too long
        max_length = 1024
        text_chunks = [report_text[i:i+max_length] for i in range(0, len(report_text), max_length)]
        
        summaries = []
        for chunk in text_chunks[:3]:  # Limit to first 3 chunks
            summary = self.summarizer(chunk, max_length=150, min_length=50, do_sample=False)
            summaries.append(summary[0]['summary_text'])
        
        return " ".join(summaries)
"""