import json
import requests
import logging
from django.conf import settings

# from openai import OpenAI

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        # OpenAI path kept as comments for reference.
        # api_key = getattr(settings, "OPENAI_API_KEY", None)
        # if not api_key:
        #     raise ValueError("OPENAI_API_KEY is not configured")
        # self.client = OpenAI(api_key=api_key)

        self.hf_api_key = getattr(settings, "HUGGINGFACE_API_KEY", None)
        self.hf_model = getattr(
            settings, "HUGGINGFACE_MODEL", "meta-llama/Meta-Llama-3-8B-Instruct"
        )

    def _parse_json_or_raise(self, payload: str):
        try:
            return json.loads(payload)
        except json.JSONDecodeError:
            excerpt = payload[:300] if payload else "<empty response>"
            raise ValueError(f"AI response was not valid JSON. Raw excerpt: {excerpt}")

    def _extract_json_fragment(self, payload: str):
        """Extract JSON object from text with better bracket matching."""
        if not payload:
            return payload

        start = payload.find("{")
        if start == -1:
            return payload

        # Try to find matching closing brace
        brace_count = 0
        for i in range(start, len(payload)):
            if payload[i] == "{":
                brace_count += 1
            elif payload[i] == "}":
                brace_count -= 1
                if brace_count == 0:
                    extracted = payload[start : i + 1]
                    logger.debug(f"Extracted JSON fragment: {extracted[:200]}...")
                    return extracted

        # Fallback to simple extraction if brace matching fails
        end = payload.rfind("}")
        if start != -1 and end != -1 and end > start:
            return payload[start : end + 1]
        return payload

    def _contains_json_object(self, payload: str):
        return "{" in payload and "}" in payload

    def _clean_error_message(self, message: str):
        if not message:
            return "Unknown provider error"

        compact = " ".join(message.split())

        # Avoid leaking raw HTML into API responses shown in the frontend.
        if "<html" in compact.lower() or "<!doctype" in compact.lower():
            if "cannot post" in compact.lower():
                return "Provider endpoint rejected the request path"
            return "Provider returned an unexpected HTML error response"

        if len(compact) > 240:
            return f"{compact[:240]}..."
        return compact

    def _default_symptom_analysis(self, symptoms: str, note: str = ""):
        summary = (
            "AI analysis could not be fully parsed, so this is a conservative "
            "fallback response. Please consult a licensed clinician for advice."
        )
        if note:
            summary = f"{summary} {note}"

        return {
            "probable_conditions": [
                {
                    "name": "Unable to determine from AI output",
                    "likelihood": "low",
                    "reasoning": "The model response was incomplete or malformed.",
                }
            ],
            "recommended_specialization": "General Physician",
            "medication_guidance": [
                {
                    "name": "No self-medication recommendation",
                    "purpose": "Safety-first fallback",
                    "dosage_note": "Avoid starting new medicine based only on this AI output.",
                    "warning": "Seek medical care if symptoms worsen or persist.",
                }
            ],
            "home_care_suggestions": [
                "Stay hydrated and rest.",
                "Monitor temperature and key symptoms.",
                "Seek clinical advice for persistent or worsening symptoms.",
            ],
            "red_flags": [
                "Difficulty breathing",
                "Chest pain",
                "Persistent high fever",
                "Confusion or altered mental status",
            ],
            "summary": summary,
            "disclaimer": "This is educational guidance only and not a medical diagnosis.",
        }

    def _normalize_symptom_analysis(self, result, symptoms: str):
        if not isinstance(result, dict):
            return self._default_symptom_analysis(
                symptoms, "Received non-object JSON from AI provider."
            )

        normalized = {
            "probable_conditions": result.get("probable_conditions")
            if isinstance(result.get("probable_conditions"), list)
            else [],
            "recommended_specialization": result.get(
                "recommended_specialization", "General Physician"
            ),
            "medication_guidance": result.get("medication_guidance")
            if isinstance(result.get("medication_guidance"), list)
            else [],
            "home_care_suggestions": result.get("home_care_suggestions")
            if isinstance(result.get("home_care_suggestions"), list)
            else [],
            "red_flags": result.get("red_flags")
            if isinstance(result.get("red_flags"), list)
            else [],
            "summary": result.get(
                "summary",
                "AI-generated educational guidance based on submitted symptoms.",
            ),
            "disclaimer": "This is educational guidance only and not a medical diagnosis.",
        }

        if not normalized["probable_conditions"]:
            normalized["probable_conditions"] = self._default_symptom_analysis(
                symptoms
            )["probable_conditions"]
        if not normalized["medication_guidance"]:
            normalized["medication_guidance"] = self._default_symptom_analysis(
                symptoms
            )["medication_guidance"]
        if not normalized["home_care_suggestions"]:
            normalized["home_care_suggestions"] = self._default_symptom_analysis(
                symptoms
            )["home_care_suggestions"]
        if not normalized["red_flags"]:
            normalized["red_flags"] = self._default_symptom_analysis(symptoms)[
                "red_flags"
            ]

        if normalized["recommended_specialization"] not in {
            "Cardiologist",
            "Neurologist",
            "Dermatologist",
            "Orthopedic",
            "Pediatrician",
            "Psychiatrist",
            "Gynecologist",
            "Oncologist",
            "Gastroenterologist",
            "General Physician",
        }:
            normalized["recommended_specialization"] = "General Physician"

        return normalized

    def _attempt_fix_json(self, malformed: str) -> str:
        """Attempt to fix common JSON formatting issues."""
        # Remove markdown code blocks
        if malformed.startswith("```"):
            malformed = malformed.strip("`").strip()
            if malformed.startswith("json"):
                malformed = malformed[4:].strip()

        # Remove markdown json tags
        malformed = malformed.replace("```json", "").replace("```", "")

        # Handle common issues
        malformed = malformed.strip()

        # Try adding missing braces
        if malformed and malformed[0] != "{":
            malformed = "{" + malformed
        if malformed and malformed[-1] != "}":
            malformed = malformed + "}"

        return malformed

    def _try_parse_json_payload(self, payload: str):
        if not payload:
            logger.warning("Empty payload received")
            return None

        # Try to fix common issues first
        fixed_payload = self._attempt_fix_json(payload)
        candidates = [
            payload,
            fixed_payload,
            self._extract_json_fragment(payload),
            self._extract_json_fragment(fixed_payload),
        ]

        for i, candidate in enumerate(candidates):
            if not candidate or not candidate.strip():
                continue

            try:
                parsed = json.loads(candidate)
                if isinstance(parsed, dict):
                    logger.info(f"Successfully parsed JSON from candidate {i}")
                    return parsed
            except json.JSONDecodeError as e:
                logger.debug(f"Failed to parse candidate {i}: {str(e)}")
                logger.debug(f"Candidate content: {candidate[:300]}...")
                continue

        logger.error(f"Could not parse JSON from payload: {payload[:300]}...")
        return None

    def _hf_generate(
        self,
        prompt: str,
        max_new_tokens: int = 700,
        require_json_object: bool = False,
    ):
        if not self.hf_api_key:
            raise ValueError(
                "HUGGINGFACE_API_KEY is not configured. Create a free token at huggingface.co/settings/tokens"
            )

        url = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.hf_api_key}",
            "Content-Type": "application/json",
        }
        base_payload = {
            "model": self.hf_model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a clinical triage assistant. Follow the user instructions exactly.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            "temperature": 0.1,
            "max_tokens": max_new_tokens,
            "stream": False,
        }

        payload_variants = []
        if require_json_object:
            payload_with_json_mode = dict(base_payload)
            payload_with_json_mode["response_format"] = {"type": "json_object"}
            payload_variants.append(payload_with_json_mode)
        payload_variants.append(dict(base_payload))

        last_error = None
        data = None
        for payload in payload_variants:
            response = requests.post(url, headers=headers, json=payload, timeout=90)
            try:
                data = response.json()
            except ValueError:
                data = {"error": response.text}

            if response.status_code < 400:
                last_error = None
                break

            error_msg = (
                data.get("error", "Unknown Hugging Face API error")
                if isinstance(data, dict)
                else str(data)
            )
            last_error = str(error_msg)

            # Retry with a simpler payload when provider rejects request shape.
            if "input validation error" in last_error.lower():
                continue

            raise Exception(last_error)

        if last_error:
            raise Exception(last_error)

        if (
            isinstance(data, dict)
            and isinstance(data.get("choices"), list)
            and data["choices"]
            and isinstance(data["choices"][0], dict)
        ):
            message = data["choices"][0].get("message", {})
            content = message.get("content")
            reasoning = message.get("reasoning")

            if isinstance(content, str) and content.strip():
                return content.strip()

            # Some models can return the usable text in `reasoning` while leaving
            # `content` empty. We still parse strictly later in analyze_symptoms.
            if isinstance(reasoning, str) and reasoning.strip():
                return reasoning.strip()

            message_excerpt = str(message)
            if len(message_excerpt) > 500:
                message_excerpt = f"{message_excerpt[:500]}..."
            raise Exception(
                "AI provider returned an empty `message.content`. "
                f"Raw message: {message_excerpt}"
            )

        if isinstance(data, dict) and data.get("error"):
            raise Exception(data["error"])

        raise Exception("Unexpected response format from Hugging Face API")



    def analyze_symptoms(self, symptoms):
        """Analyze symptoms and return structured AI guidance."""
        hf_prompt = f"""
You are a clinical triage assistant.
Do not provide diagnosis certainty. Provide educational guidance only.

Allowed specializations:
Cardiologist, Neurologist, Dermatologist, Orthopedic, Pediatrician,
Psychiatrist, Gynecologist, Oncologist, Gastroenterologist, General Physician.

Symptoms:
{symptoms}

Output requirements:
- Return ONLY one valid JSON object.
- Do not output markdown.
- Do not output analysis/thinking steps.
- Do not output any text before or after JSON.

Use this exact JSON structure:
{{
  "probable_conditions": [
    {{"name": "string", "likelihood": "low|medium|high", "reasoning": "string"}}
  ],
  "recommended_specialization": "string",
  "medication_guidance": [
    {{"name": "string", "purpose": "string", "dosage_note": "string", "warning": "string"}}
  ],
  "home_care_suggestions": ["string"],
  "red_flags": ["string"],
  "summary": "string",
  "disclaimer": "This is educational guidance only and not a medical diagnosis."
}}
"""

        try:
            result = self._hf_generate(
                hf_prompt, max_new_tokens=900, require_json_object=True
            )
            logger.info(f"AI response received, length: {len(result)}")
            logger.debug(f"Raw AI response: {result[:500]}")
        except Exception as e:
            logger.error(f"Primary provider call failed: {str(e)}")
            return self._default_symptom_analysis(
                symptoms,
                (
                    "Primary provider call failed. "
                    f"Reason: {self._clean_error_message(str(e))}"
                ),
            )

        parsed_result = self._try_parse_json_payload(result)

        # Some routed models ignore JSON mode or return truncated output.
        # Retry once with a hardened formatter prompt before fallback.
        if parsed_result is None:
            logger.warning(
                "Initial JSON parsing failed, attempting retry with formatter prompt"
            )
            retry_prompt = f"""
Convert the following symptom details into exactly one valid JSON object.
Return JSON only with no markdown, no comments, and no extra text.

Symptoms:
{symptoms}

Required JSON schema:
{{
    "probable_conditions": [
        {{"name": "string", "likelihood": "low|medium|high", "reasoning": "string"}}
    ],
    "recommended_specialization": "string",
    "medication_guidance": [
        {{"name": "string", "purpose": "string", "dosage_note": "string", "warning": "string"}}
    ],
    "home_care_suggestions": ["string"],
    "red_flags": ["string"],
    "summary": "string",
    "disclaimer": "This is educational guidance only and not a medical diagnosis."
}}

If previous model output exists and is malformed, fix it into valid JSON while preserving intent:
{result[:5000]}
"""

            try:
                retry_result = self._hf_generate(
                    retry_prompt,
                    max_new_tokens=900,
                    require_json_object=True,
                )
                logger.info(f"Retry response received, length: {len(retry_result)}")
                logger.debug(f"Raw retry response: {retry_result[:500]}")
            except Exception as e:
                logger.error(f"Retry provider call failed: {str(e)}")
                return self._default_symptom_analysis(
                    symptoms,
                    (
                        "Retry provider call failed while repairing malformed output. "
                        f"Reason: {self._clean_error_message(str(e))}"
                    ),
                )

            parsed_result = self._try_parse_json_payload(retry_result)

        if parsed_result is None:
            return self._default_symptom_analysis(
                symptoms,
                "The upstream model returned malformed JSON.",
            )

        return self._normalize_symptom_analysis(parsed_result, symptoms)

    def analyze_symptoms_only(self, symptoms):
        """Public helper for symptom-first workflow without PDF uploads."""
        return self.analyze_symptoms(symptoms)

    def summarize_medical_report(self, report_text, symptoms=""):
        """Summarize medical report content"""
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

        # OpenAI request kept as comments for reference.
        # response = self.client.chat.completions.create(
        #     model="gpt-3.5-turbo",
        #     messages=[
        #         {
        #             "role": "system",
        #             "content": "You are a medical AI assistant that summarizes medical reports for healthcare professionals.",
        #         },
        #         {"role": "user", "content": prompt},
        #     ],
        #     temperature=0.3,
        #     max_tokens=500,
        # )
        # summary = response.choices[0].message.content.strip()

        hf_prompt = (
            "You are a medical AI assistant that summarizes medical reports for healthcare professionals.\n\n"
            f"{prompt}"
        )

        try:
            summary = self._hf_generate(hf_prompt, max_new_tokens=500)
        except Exception as e:
            raise Exception(
                f"AI summary request failed: {self._clean_error_message(str(e))}"
            )

        if not summary:
            raise ValueError("AI summary response was empty")

        return summary


