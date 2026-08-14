import json
import os
import re

from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

# ---------------------------------------------------------------------------
# AI call chain, in order of preference:
#   1. Gemini (primary) - structured, Pydantic-validated JSON output
#   2. Groq / OpenAI (secondary) - original behavior, kept as-is
#   3. Rule-based templates (tertiary) - Aditi's original fallback logic,
#      UNCHANGED below in each function. This guarantees the app never
#      breaks even if both AI providers are unavailable.
# ---------------------------------------------------------------------------

_gemini_model = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel("gemini-flash-latest")
    except Exception:
        _gemini_model = None

client = None
MODEL_NAME = None

if GROQ_API_KEY:
    try:
        from openai import OpenAI

        client = OpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")
        MODEL_NAME = "llama-3.3-70b-versatile"
    except Exception:
        client = None
elif OPENAI_API_KEY:
    try:
        from openai import OpenAI

        client = OpenAI(api_key=OPENAI_API_KEY)
        MODEL_NAME = "gpt-4o-mini"
    except Exception:
        client = None


# ---------------------------------------------------------------------------
# Pydantic schemas — used only to validate the PRIMARY (Gemini) path.
# If Gemini's output doesn't match one of these exactly, we treat it as a
# failure and move to the next fallback, rather than passing bad data along.
# ---------------------------------------------------------------------------

class _CompanyInsightsSchema(BaseModel):
    business_needs: str
    opportunities: str
    industry_analysis: str


class _OutreachEmailSchema(BaseModel):
    subject: str
    content: str


class _ConversationSummarySchema(BaseModel):
    summary: str
    action_items: list[str]


def _extract_json(raw_text: str) -> str:
    """Strips ```json ... ``` style markdown fences some LLMs wrap output in."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        text = re.sub(r"^json\s*", "", text, count=1, flags=re.IGNORECASE)
    return text.strip()


def _call_gemini_structured(prompt: str, system: str, schema: type[BaseModel]) -> dict | None:
    """
    Primary AI path. Calls Gemini and validates the response against the
    given Pydantic schema. Returns a plain dict on success, or None on
    ANY failure (not configured, network error, bad JSON, missing/invalid
    fields) — None signals the caller to fall through to the next path.
    """
    if not _gemini_model:
        return None
    try:
        full_prompt = (
            f"{system}\n\n{prompt}\n\n"
            "Return ONLY a valid JSON object matching the required fields. "
            "No markdown, no code fences, no extra commentary."
        )
        response = _gemini_model.generate_content(full_prompt)
        raw = json.loads(_extract_json(response.text))
        validated = schema(**raw)
        return validated.model_dump()
    except (json.JSONDecodeError, ValidationError, Exception):
        return None


def _call_llm(prompt: str, system: str = "You are a helpful B2B sales assistant.") -> str:
    """
    Secondary AI path (Groq/OpenAI). Unchanged from the original
    implementation — kept exactly as it was as a backup if Gemini isn't
    configured or didn't return valid, schema-matching output.
    """
    if not client:
        return None
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return None


def generate_company_insights(lead) -> dict:
    prompt = (
        "Analyze this B2B sales prospect and return a JSON object with keys "
        '"business_needs", "opportunities", "industry_analysis" (each a short '
        "2-3 sentence paragraph).\n\n"
        f"Company: {lead.company_name}\n"
        f"Industry: {lead.industry}\n"
        f"Company size: {lead.company_size}\n"
        f"Annual revenue: {lead.annual_revenue}\n"
        f"Funding stage: {lead.funding_stage}\n"
        f"Technology stack: {lead.technology_stack}\n"
        f"Location: {lead.location}\n"
    )
    system = "You are a B2B sales research analyst."

    # 1. Try Gemini (primary, structured + validated)
    data = _call_gemini_structured(prompt, system, _CompanyInsightsSchema)
    if data:
        return data

    # 2. Fall back to Groq/OpenAI (secondary, original behavior unchanged)
    llm_output = _call_llm(prompt, system)
    if llm_output:
        try:
            data = json.loads(_extract_json(llm_output))
            if data.get("business_needs") and data.get("opportunities") and data.get("industry_analysis"):
                return {
                    "business_needs": data.get("business_needs", ""),
                    "opportunities": data.get("opportunities", ""),
                    "industry_analysis": data.get("industry_analysis", ""),
                }
        except Exception:
            pass

    # 3. Both AI paths failed — original rule-based fallback (UNCHANGED)
    industry = lead.industry or "the industry"
    stage = lead.funding_stage or "an early"
    stack = lead.technology_stack or "a modern"

    business_needs = (
        f"{lead.company_name} operates in {industry} and, based on its size "
        f"({lead.company_size or 'unknown size'}), likely needs to improve operational "
        f"efficiency, scale its sales processes, and adopt automation to keep up with growth."
    )
    opportunities = (
        f"Being at the {stage} funding stage suggests {lead.company_name} has budget "
        f"available for new tools. There is a strong opportunity to position our product "
        f"as a way to speed up their workflows and reduce manual effort."
    )
    industry_analysis = (
        f"Companies in {industry} using a {stack} technology stack typically value "
        f"integrations and fast time-to-value. This makes {lead.company_name} a good fit "
        f"for a product demo focused on quick ROI."
    )
    return {
        "business_needs": business_needs,
        "opportunities": opportunities,
        "industry_analysis": industry_analysis,
    }


def calculate_lead_score(lead) -> dict:
    # Unchanged — this was already deterministic/rule-based, not an LLM
    # call, so there's nothing to "upgrade" here. A rule-based score is
    # arguably more defensible than an AI guess for something this
    # decision-critical, so this stays exactly as Aditi built it.
    score = 40
    factors = {}

    size_points = 0
    if lead.company_size:
        size_lower = lead.company_size.lower()
        if "1000" in size_lower or "enterprise" in size_lower:
            size_points = 20
        elif "250" in size_lower or "500" in size_lower:
            size_points = 15
        elif "50" in size_lower or "100" in size_lower:
            size_points = 10
        else:
            size_points = 5
    factors["company_size"] = size_points
    score += size_points

    funding_points = 0
    if lead.funding_stage:
        f = lead.funding_stage.lower()
        if "series c" in f or "series d" in f or "public" in f:
            funding_points = 20
        elif "series b" in f:
            funding_points = 15
        elif "series a" in f:
            funding_points = 10
        elif "seed" in f:
            funding_points = 5
    factors["funding_stage"] = funding_points
    score += funding_points

    revenue_points = 0
    if lead.annual_revenue:
        digits = "".join(ch for ch in lead.annual_revenue if ch.isdigit())
        if digits:
            approx_value = int(digits[:3]) if len(digits) >= 1 else 0
            if approx_value >= 50:
                revenue_points = 15
            elif approx_value >= 10:
                revenue_points = 10
            else:
                revenue_points = 5
    factors["annual_revenue"] = revenue_points
    score += revenue_points

    tech_points = 0
    if lead.technology_stack:
        common_tech = ["aws", "python", "react", "node", "kubernetes", "postgresql", "azure"]
        stack_lower = lead.technology_stack.lower()
        matches = sum(1 for tech in common_tech if tech in stack_lower)
        tech_points = min(matches * 3, 10)
    factors["technology_fit"] = tech_points
    score += tech_points

    score = max(0, min(100, score))

    conversion_probability = round(min(95.0, score * 0.85), 1)

    if score >= 80:
        priority = "High"
    elif score >= 55:
        priority = "Medium"
    else:
        priority = "Low"

    return {
        "lead_score": score,
        "conversion_probability": conversion_probability,
        "priority_level": priority,
        "scoring_factors": json.dumps(factors),
    }


def generate_outreach_email(lead) -> dict:
    prompt = (
        "Write a short, personalized, friendly B2B cold outreach email "
        "(max 120 words) to a prospect. Return JSON with keys \"subject\" and \"content\".\n\n"
        f"Prospect company: {lead.company_name}\n"
        f"Contact name: {lead.contact_name or 'there'}\n"
        f"Industry: {lead.industry}\n"
        f"Funding stage: {lead.funding_stage}\n"
        f"Technology stack: {lead.technology_stack}\n"
    )
    system = "You are a helpful B2B sales assistant."

    # 1. Try Gemini (primary, structured + validated)
    data = _call_gemini_structured(prompt, system, _OutreachEmailSchema)
    if data:
        return {"subject": data["subject"], "content": data["content"]}

    # 2. Fall back to Groq/OpenAI (secondary, original behavior unchanged)
    llm_output = _call_llm(prompt, system)
    if llm_output:
        try:
            data = json.loads(_extract_json(llm_output))
            if data.get("subject") and data.get("content"):
                return {"subject": data["subject"], "content": data["content"]}
        except Exception:
            pass

    # 3. Both AI paths failed — original rule-based fallback (UNCHANGED)
    contact = lead.contact_name or "there"
    subject = f"Helping {lead.company_name} move faster with AI"
    content = (
        f"Hi {contact},\n\n"
        f"I noticed {lead.company_name} is doing great work in {lead.industry or 'your industry'}"
        f"{', especially at the ' + lead.funding_stage + ' stage' if lead.funding_stage else ''}. "
        f"Teams like yours often struggle with manual, repetitive sales and ops work that slows "
        f"down growth.\n\n"
        f"We built a platform that automates exactly that - lead research, outreach, and "
        f"follow-ups - so your team can focus on closing deals instead of busywork.\n\n"
        f"Would you be open to a quick 15-minute call this week to see if it's a fit for "
        f"{lead.company_name}?\n\n"
        f"Best regards,\nSales Team"
    )
    return {"subject": subject, "content": content}


def summarize_conversation(transcript: str) -> dict:
    prompt = (
        "Summarize this sales call/meeting transcript in 3-4 sentences, and list "
        "concrete action items. Return JSON with keys \"summary\" (string) and "
        "\"action_items\" (list of strings).\n\n"
        f"Transcript:\n{transcript}\n"
    )
    system = "You are a helpful B2B sales assistant."

    # 1. Try Gemini (primary, structured + validated)
    data = _call_gemini_structured(prompt, system, _ConversationSummarySchema)
    if data:
        return {"summary": data["summary"], "action_items": data["action_items"]}

    # 2. Fall back to Groq/OpenAI (secondary, original behavior unchanged)
    llm_output = _call_llm(prompt, system)
    if llm_output:
        try:
            data = json.loads(_extract_json(llm_output))
            if data.get("summary"):
                return {
                    "summary": data["summary"],
                    "action_items": data.get("action_items", []),
                }
        except Exception:
            pass

    # 3. Both AI paths failed — original rule-based fallback (UNCHANGED)
    sentences = [s.strip() for s in transcript.replace("\n", " ").split(".") if s.strip()]
    summary = ". ".join(sentences[:3])
    if summary and not summary.endswith("."):
        summary += "."
    if not summary:
        summary = "No transcript content provided."

    action_keywords = ["will", "need to", "should", "follow up", "send", "schedule", "next step"]
    action_items = [s for s in sentences if any(k in s.lower() for k in action_keywords)]
    if not action_items:
        action_items = ["Follow up with the prospect within 48 hours."]

    return {"summary": summary, "action_items": action_items[:5]}
