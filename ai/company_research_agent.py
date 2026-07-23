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
import google.generativeai as genai

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


def analyze_company(company_name: str, domain: str | None = None) -> CompanyInsights:
    """
    Takes a company name (and optional domain), returns structured CompanyInsights.
    Raises ValueError if the model output can't be parsed.
    """
    input_data = CompanyResearchInput(company_name=company_name, domain=domain)

    prompt = PROMPT_TEMPLATE.format(
        company_name=input_data.company_name,
        domain=input_data.domain or "unknown"
    )

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Gemini sometimes wraps JSON in ```json ... ``` — strip that off if present
    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        raw_text = raw_text.replace("json\n", "", 1).replace("json", "", 1)

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Model did not return valid JSON. Raw output:\n{raw_text}") from e

    # Validate against our schema — this guarantees the shape Aditi's backend expects
    insights = CompanyInsights(**data)
    return insights


if __name__ == "__main__":
    # Quick manual test — run this file directly to try it out
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
