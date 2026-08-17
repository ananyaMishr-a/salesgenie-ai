import json
import os
import re
import sys

# Add the root directory to Python path so we can import the standalone 'ai' folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

try:
    from ai.company_research_agent import analyze_company
except ImportError:
    pass

from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

# ---------------------------------------------------------------------------
# AI call chain, in order of preference:
#   1. Gemini (primary) - structured, Pydantic-validated JSON output
#   2. Groq / OpenAI (secondary) - UNCHANGED original behavior, kept as-is
#   3. Rule-based templates (tertiary) - UNCHANGED, in each function below.
#      This guarantees the app never breaks even if both AI providers are
#      unavailable.
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
# If Gemini's output doesn't match one of these exactly, it's treated as a
# failure and the function falls through to the next path, same as any
# other AI failure (quota limit, network error, etc.).
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


class _StrategySection(BaseModel):
    priority: str
    description: str
    footer_text: str


class _OutreachStrategySchema(BaseModel):
    follow_up_timing: _StrategySection
    channel_mix: _StrategySection
    content_strategy: _StrategySection


class _LeadScoreSchema(BaseModel):
    # Mirrors the exact 4 factor categories the frontend's LeadScorePanel
    # already renders (company_size, funding_stage, annual_revenue,
    # technology_fit) — each 0-25 points, so the UI keeps working
    # unchanged whether the score came from AI or the rule-based fallback.
    lead_score: int = Field(ge=0, le=100)
    company_size_points: int = Field(ge=0, le=25)
    funding_stage_points: int = Field(ge=0, le=25)
    annual_revenue_points: int = Field(ge=0, le=25)
    technology_fit_points: int = Field(ge=0, le=25)
    reasoning: str


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
    # UNCHANGED — secondary AI path (Groq/OpenAI), exactly as it was.
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

    # 1. NEW — try Gemini first (structured + validated)
    data = _call_gemini_structured(prompt, system, _CompanyInsightsSchema)
    if data:
        return data

    # 2. UNCHANGED — fall back to Groq/OpenAI
    llm_output = _call_llm(prompt, system)
    if llm_output:
        try:
            data = json.loads(llm_output)
            return {
                "business_needs": data.get("business_needs", ""),
                "opportunities": data.get("opportunities", ""),
                "industry_analysis": data.get("industry_analysis", ""),
            }
        except Exception:
            pass

    # 3. UNCHANGED — rule-based fallback
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
    prompt = (
        "Score this B2B sales lead for qualification. Evaluate 4 factors, each "
        "worth 0-25 points: company_size_points, funding_stage_points, "
        "annual_revenue_points, technology_fit_points. Return a JSON object with "
        "keys: \"lead_score\" (0-100, should roughly equal 40 base + the 4 factor "
        "points added together, but use your judgement), \"company_size_points\", "
        "\"funding_stage_points\", \"annual_revenue_points\", \"technology_fit_points\" "
        "(each 0-25), and \"reasoning\" (1-2 sentences explaining the score).\n\n"
        f"Company: {lead.company_name}\n"
        f"Industry: {lead.industry}\n"
        f"Company size: {lead.company_size}\n"
        f"Annual revenue: {lead.annual_revenue}\n"
        f"Funding stage: {lead.funding_stage}\n"
        f"Technology stack: {lead.technology_stack}\n"
    )
    system = "You are a B2B sales qualification analyst."

    # 1. NEW — try Gemini first (structured + validated). The score and
    # per-factor points come from the AI's judgement, but conversion
    # probability and priority level are always computed deterministically
    # below (see _derive_probability_and_priority) — this keeps the numbers
    # internally consistent (e.g. a "High priority" always means score >= 80)
    # regardless of whether AI or the rule-based fallback produced the score.
    data = _call_gemini_structured(prompt, system, _LeadScoreSchema)
    if data:
        factors = {
            "company_size": data["company_size_points"],
            "funding_stage": data["funding_stage_points"],
            "annual_revenue": data["annual_revenue_points"],
            "technology_fit": data["technology_fit_points"],
            "ai_reasoning": data["reasoning"],
        }
        probability, priority = _derive_probability_and_priority(data["lead_score"])
        return {
            "lead_score": data["lead_score"],
            "conversion_probability": probability,
            "priority_level": priority,
            "scoring_factors": json.dumps(factors),
        }

    # 2. UNCHANGED — original deterministic rule-based scoring, used as
    # the fallback if Gemini isn't configured or doesn't return valid,
    # schema-matching output.
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
    probability, priority = _derive_probability_and_priority(score)

    return {
        "lead_score": score,
        "conversion_probability": probability,
        "priority_level": priority,
        "scoring_factors": json.dumps(factors),
    }


def _derive_probability_and_priority(score: int) -> tuple[float, str]:
    """
    Shared, deterministic derivation used by BOTH the AI path and the
    rule-based fallback, so conversion_probability/priority_level always
    stay consistent with lead_score no matter which path produced it.
    Identical formula/thresholds to the original implementation.
    """
    conversion_probability = round(min(95.0, score * 0.85), 1)
    if score >= 80:
        priority = "High"
    elif score >= 55:
        priority = "Medium"
    else:
        priority = "Low"
    return conversion_probability, priority


def generate_outreach_email(lead, tone: str = "Professional") -> dict:
    prompt = (
        f"Write a short, personalized, {tone.lower()}, B2B cold outreach email "
        "(max 120 words) to a prospect. Return JSON with keys \"subject\" and \"content\".\n\n"
        f"Prospect company: {lead.company_name}\n"
        f"Contact name: {lead.contact_name or 'there'}\n"
        f"Industry: {lead.industry}\n"
        f"Funding stage: {lead.funding_stage}\n"
        f"Technology stack: {lead.technology_stack}\n"
    )
    system = "You are a helpful B2B sales assistant."

    # 1. NEW — try Gemini first (structured + validated)
    data = _call_gemini_structured(prompt, system, _OutreachEmailSchema)
    if data:
        return {"subject": data["subject"], "content": data["content"]}

    # 2. UNCHANGED — fall back to Groq/OpenAI
    llm_output = _call_llm(prompt, system)
    if llm_output:
        try:
            data = json.loads(llm_output)
            if data.get("subject") and data.get("content"):
                return {"subject": data["subject"], "content": data["content"]}
        except Exception:
            pass

    # 3. UNCHANGED — rule-based fallback (tone-aware, exactly as before)
    contact = lead.contact_name or "there"
    subject = f"Helping {lead.company_name} move faster with AI"

    tone_greeting = "Hi"
    tone_signoff = "Best regards"
    if tone.lower() == "casual":
        tone_greeting = "Hey"
        tone_signoff = "Cheers"
    elif tone.lower() == "direct":
        tone_greeting = "Hi"
        tone_signoff = "Thanks"

    content = (
        f"{tone_greeting} {contact},\n\n"
        f"I noticed {lead.company_name} is doing great work in {lead.industry or 'your industry'}"
        f"{', especially at the ' + lead.funding_stage + ' stage' if lead.funding_stage else ''}. "
        f"Teams like yours often struggle with manual, repetitive sales and ops work that slows "
        f"down growth.\n\n"
        f"We built a platform that automates exactly that - lead research, outreach, and "
        f"follow-ups - so your team can focus on closing deals instead of busywork.\n\n"
        f"Would you be open to a quick 15-minute call this week to see if it's a fit for "
        f"{lead.company_name}?\n\n"
        f"{tone_signoff},\nSales Team"
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

    # 1. NEW — try Gemini first (structured + validated)
    data = _call_gemini_structured(prompt, system, _ConversationSummarySchema)
    if data:
        return {"summary": data["summary"], "action_items": data["action_items"]}

    # 2. UNCHANGED — fall back to Groq/OpenAI
    llm_output = _call_llm(prompt, system)
    if llm_output:
        try:
            data = json.loads(llm_output)
            if data.get("summary"):
                return {
                    "summary": data["summary"],
                    "action_items": data.get("action_items", []),
                }
        except Exception:
            pass

    # 3. UNCHANGED — rule-based fallback
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


def generate_outreach_strategy(lead) -> dict:
    prompt = (
        "Analyze this B2B sales prospect and return a JSON object containing an outreach strategy. "
        "The JSON MUST have exactly these three keys: \"follow_up_timing\", \"channel_mix\", and \"content_strategy\". "
        "Each key must map to an object with three string fields: \"priority\" (High, Medium, or Low), "
        "\"description\" (2-3 sentences of strategy), and \"footer_text\" (a short 2-5 word summary like 'Optimal: Tuesday 10:00 AM' or 'Multi-channel approach').\n\n"
        f"Company: {lead.company_name}\n"
        f"Industry: {lead.industry}\n"
        f"Company size: {lead.company_size}\n"
        f"Funding stage: {lead.funding_stage}\n"
        f"Technology stack: {lead.technology_stack}\n"
    )
    system = "You are a helpful B2B sales assistant."

    # 1. NEW — try Gemini first (structured + validated, including the
    # nested follow_up_timing/channel_mix/content_strategy objects)
    data = _call_gemini_structured(prompt, system, _OutreachStrategySchema)
    if data:
        return data

    # 2. UNCHANGED — fall back to Groq/OpenAI
    llm_output = _call_llm(prompt, system)
    if llm_output:
        try:
            data = json.loads(llm_output)
            if "follow_up_timing" in data and "channel_mix" in data and "content_strategy" in data:
                return data
        except Exception:
            pass

    # 3. UNCHANGED — rule-based fallback
    return {
        "follow_up_timing": {
            "priority": "High",
            "description": f"Send follow-up within 48 hours of initial email. Tuesday mornings show highest response rates for {lead.industry or 'tech'} executives.",
            "footer_text": "Optimal: Tuesday 10:00 AM"
        },
        "channel_mix": {
            "priority": "Medium",
            "description": f"After email, connect on LinkedIn within 24 hours. Reference specific {lead.company_name} achievements in connection note.",
            "footer_text": "Multi-channel approach"
        },
        "content_strategy": {
            "priority": "Medium",
            "description": "Share relevant case study on similar-sized company success. Focus on ROI metrics that align with growth stage priorities.",
            "footer_text": "Value-first approach"
        }
    }
