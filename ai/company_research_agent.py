"""
Company Research Agent
Input: a company name (+ optional domain)
Output: structured CompanyInsights (see schemas.py)

This is the function Aditi (Backend Lead) will call from FastAPI:
    from company_research_agent import analyze_company
    insights = analyze_company("Stripe")
"""

import os
import json
from dotenv import load_dotenv
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import sys
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import google.generativeai as genai

try:
    from ai.schemas import CompanyResearchInput, CompanyInsights
except ImportError:
    from schemas import CompanyResearchInput, CompanyInsights

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-flash-latest")

PROMPT_TEMPLATE = """
You are a B2B sales research analyst. Analyze the following company and return
ONLY a valid JSON object (no markdown, no extra text) matching this exact structure:

{{
  "industry": "string",
  "company_size": "string (estimated employee range)",
  "tech_stack": ["string", "string"],
  "funding_stage": "string",
  "growth_signals": ["string", "string"],
  "qualification_score": integer between 0 and 100,
  "reasoning": "1-2 sentence explanation for the score"
}}

Company name: {company_name}
Domain (if known): {domain}

Base your answer on realistic, publicly known information about this company.
If you are unsure of exact figures, give a reasonable estimate rather than leaving fields empty.
Return ONLY the JSON object, nothing else.
"""


def _call_gemini(company_name: str, domain: str | None) -> dict:
    """
    Attempts the real Gemini call and returns a parsed dict.
    Raises an exception on ANY failure (network, quota, bad JSON) --
    the caller decides what to do about it.
    """
    prompt = PROMPT_TEMPLATE.format(
        company_name=company_name,
        domain=domain or "unknown"
    )

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Gemini sometimes wraps JSON in ```json ... ``` -- strip that off if present
    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        raw_text = raw_text.replace("json\n", "", 1).replace("json", "", 1)

    return json.loads(raw_text)  # raises json.JSONDecodeError if malformed


def _fallback_insights(company_name: str, domain: str | None) -> dict:
    """
    Rule-based backup used ONLY if the real Gemini call fails
    (quota exceeded, network error, bad output, etc.).
    This keeps the app usable even when the AI is temporarily unavailable --
    same idea as the fallback pattern in Aditi's ai_service.py.
    """
    return {
        "industry": "Unknown (AI analysis unavailable)",
        "company_size": "Not available",
        "tech_stack": [],
        "funding_stage": "Not available",
        "growth_signals": [
            f"Could not reach Gemini for a live analysis of {company_name}. "
            "This is a placeholder result -- retry once the API is available."
        ],
        "qualification_score": 50,  # neutral default, not a real judgement
        "reasoning": (
            f"Fallback result: AI analysis for {company_name} could not be completed "
            "right now (rate limit, network issue, or unexpected response). "
            "A neutral score of 50 was assigned as a placeholder."
        ),
    }


def analyze_company(company_name: str, domain: str | None = None) -> CompanyInsights:
    """
    Takes a company name (and optional domain), returns structured CompanyInsights.

    Tries the real Gemini call first. If that fails for ANY reason
    (quota limit, network issue, malformed response), falls back to a
    clearly-labeled placeholder instead of crashing -- so the rest of the
    app (backend/frontend) never breaks just because the AI call failed.

    Every path -- success or fallback -- is validated through the same
    Pydantic schema, so callers always get a guaranteed, correct shape.
    """
    input_data = CompanyResearchInput(company_name=company_name, domain=domain)

    try:
        data = _call_gemini(input_data.company_name, input_data.domain)
    except Exception as e:
        print(f"WARNING: Gemini call failed ({type(e).__name__}: {e}). Using fallback insights.")
        data = _fallback_insights(input_data.company_name, input_data.domain)

    # Validate against our schema — this guarantees the shape Aditi's backend expects,
    # on BOTH the success path and the fallback path
    insights = CompanyInsights(**data)
    return insights


if __name__ == "__main__":
    # Quick manual test -- run this file directly to try it out
    test_company = "Notion"
    print(f"Analyzing: {test_company}...\n")

    result = analyze_company(test_company, domain="stripe.com")

    print("=" * 50)
    print(f"COMPANY: {test_company}")
    print("=" * 50)
    print(f"Industry:          {result.industry}")
    print(f"Company Size:      {result.company_size}")
    print(f"Tech Stack:        {', '.join(result.tech_stack)}")
    print(f"Funding Stage:     {result.funding_stage}")
    print(f"Growth Signals:    {', '.join(result.growth_signals)}")
    print(f"Qualification Score: {result.qualification_score}/100")
    print(f"Reasoning:         {result.reasoning}")
