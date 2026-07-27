<<<<<<< HEAD
import os
import json
=======
import json
import os

>>>>>>> 0a08b43 (Update backend code)
from dotenv import load_dotenv

load_dotenv()

<<<<<<< HEAD
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

# Only import/initialize the OpenAI client if a key is actually provided.
client = None
if OPENAI_API_KEY:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
=======
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

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
>>>>>>> 0a08b43 (Update backend code)
    except Exception:
        client = None


def _call_llm(prompt: str, system: str = "You are a helpful B2B sales assistant.") -> str:
<<<<<<< HEAD
    """Small helper that calls the LLM and returns plain text. Returns None on any failure."""
=======
>>>>>>> 0a08b43 (Update backend code)
    if not client:
        return None
    try:
        response = client.chat.completions.create(
<<<<<<< HEAD
            model="gpt-4o-mini",
=======
            model=MODEL_NAME,
>>>>>>> 0a08b43 (Update backend code)
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception:
<<<<<<< HEAD
        # If the API call fails for any reason (no internet, bad key, etc.)
        # we simply fall back to the rule-based logic instead of crashing.
        return None


# ---------------------------------------------------------------------
# 1. LEAD INTELLIGENCE & COMPANY ANALYSIS  (Module 2)
# ---------------------------------------------------------------------

def generate_company_insights(lead) -> dict:
    """
    Analyses a lead's company profile and returns:
    business_needs, opportunities, industry_analysis
    """
    prompt = f"""
    Analyze this B2B sales prospect and return a JSON object with keys
    "business_needs", "opportunities", "industry_analysis" (each a short
    2-3 sentence paragraph).

    Company: {lead.company_name}
    Industry: {lead.industry}
    Company size: {lead.company_size}
    Annual revenue: {lead.annual_revenue}
    Funding stage: {lead.funding_stage}
    Technology stack: {lead.technology_stack}
    Location: {lead.location}
    """
=======
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
>>>>>>> 0a08b43 (Update backend code)
    llm_output = _call_llm(prompt)
    if llm_output:
        try:
            data = json.loads(llm_output)
            return {
                "business_needs": data.get("business_needs", ""),
                "opportunities": data.get("opportunities", ""),
                "industry_analysis": data.get("industry_analysis", ""),
            }
        except Exception:
<<<<<<< HEAD
            pass  # fall through to rule-based version below

    # ---------- Rule-based fallback ----------
=======
            pass

>>>>>>> 0a08b43 (Update backend code)
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


<<<<<<< HEAD
# ---------------------------------------------------------------------
# 2. LEAD SCORING & RECOMMENDATION ENGINE  (Module 4)
# ---------------------------------------------------------------------

def calculate_lead_score(lead) -> dict:
    """
    Returns a lead_score (0-100), conversion_probability (0-100),
    priority_level (High/Medium/Low) and a breakdown of scoring_factors.

    This uses simple, transparent point-based rules (easy to explain in
    a viva) rather than a black-box model - which is perfectly fine for
    a student/internship project.
    """
    score = 40  # base score every lead starts with
    factors = {}

    # 1) Company size factor
=======
def calculate_lead_score(lead) -> dict:
    score = 40
    factors = {}

>>>>>>> 0a08b43 (Update backend code)
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

<<<<<<< HEAD
    # 2) Funding stage factor
=======
>>>>>>> 0a08b43 (Update backend code)
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

<<<<<<< HEAD
    # 3) Revenue factor (very rough parsing of strings like "$45M - $60M")
=======
>>>>>>> 0a08b43 (Update backend code)
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

<<<<<<< HEAD
    # 4) Technology stack fit (bonus if they use common/compatible tech)
=======
>>>>>>> 0a08b43 (Update backend code)
    tech_points = 0
    if lead.technology_stack:
        common_tech = ["aws", "python", "react", "node", "kubernetes", "postgresql", "azure"]
        stack_lower = lead.technology_stack.lower()
        matches = sum(1 for tech in common_tech if tech in stack_lower)
        tech_points = min(matches * 3, 10)
    factors["technology_fit"] = tech_points
    score += tech_points

<<<<<<< HEAD
    # Clamp score between 0 - 100
    score = max(0, min(100, score))

    # Conversion probability roughly tracks the score, with a little scaling
=======
    score = max(0, min(100, score))

>>>>>>> 0a08b43 (Update backend code)
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


<<<<<<< HEAD
# ---------------------------------------------------------------------
# 3. AI OUTREACH GENERATION  (Module 3)
# ---------------------------------------------------------------------

def generate_outreach_email(lead) -> dict:
    """Returns {"subject": ..., "content": ...} for a personalized cold email."""
    prompt = f"""
    Write a short, personalized, friendly B2B cold outreach email
    (max 120 words) to a prospect. Return JSON with keys "subject" and "content".

    Prospect company: {lead.company_name}
    Contact name: {lead.contact_name or "there"}
    Industry: {lead.industry}
    Funding stage: {lead.funding_stage}
    Technology stack: {lead.technology_stack}
    """
=======
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
>>>>>>> 0a08b43 (Update backend code)
    llm_output = _call_llm(prompt)
    if llm_output:
        try:
            data = json.loads(llm_output)
            if data.get("subject") and data.get("content"):
                return {"subject": data["subject"], "content": data["content"]}
        except Exception:
            pass

<<<<<<< HEAD
    # ---------- Template-based fallback ----------
=======
>>>>>>> 0a08b43 (Update backend code)
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


<<<<<<< HEAD
# ---------------------------------------------------------------------
# 4. CONVERSATION INTELLIGENCE  (Module 5)
# ---------------------------------------------------------------------

def summarize_conversation(transcript: str) -> dict:
    """Returns {"summary": ..., "action_items": [...]}"""
    prompt = f"""
    Summarize this sales call/meeting transcript in 3-4 sentences, and list
    concrete action items. Return JSON with keys "summary" (string) and
    "action_items" (list of strings).

    Transcript:
    {transcript}
    """
=======
def summarize_conversation(transcript: str) -> dict:
    prompt = (
        "Summarize this sales call/meeting transcript in 3-4 sentences, and list "
        "concrete action items. Return JSON with keys \"summary\" (string) and "
        "\"action_items\" (list of strings).\n\n"
        f"Transcript:\n{transcript}\n"
    )
>>>>>>> 0a08b43 (Update backend code)
    llm_output = _call_llm(prompt)
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

<<<<<<< HEAD
    # ---------- Simple extractive fallback (no LLM needed) ----------
    sentences = [s.strip() for s in transcript.replace("\n", " ").split(".") if s.strip()]
    # naive "summary" = first 3 sentences joined
=======
    sentences = [s.strip() for s in transcript.replace("\n", " ").split(".") if s.strip()]
>>>>>>> 0a08b43 (Update backend code)
    summary = ". ".join(sentences[:3])
    if summary and not summary.endswith("."):
        summary += "."
    if not summary:
        summary = "No transcript content provided."

<<<<<<< HEAD
    # naive action items = sentences containing action-like keywords
=======
>>>>>>> 0a08b43 (Update backend code)
    action_keywords = ["will", "need to", "should", "follow up", "send", "schedule", "next step"]
    action_items = [s for s in sentences if any(k in s.lower() for k in action_keywords)]
    if not action_items:
        action_items = ["Follow up with the prospect within 48 hours."]

    return {"summary": summary, "action_items": action_items[:5]}
