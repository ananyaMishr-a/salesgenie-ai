"""
Day 1: Confirm the Gemini API connection works.
Run this file after you've added your API key to .env
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load the API key from .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY not found. "
        "Copy .env.example to .env and paste your key inside it."
    )

genai.configure(api_key=api_key)

# Use the current fast + free-tier-friendly model
model = genai.GenerativeModel("gemini-flash-latest")

response = model.generate_content("Say hello and confirm you are working, in one short sentence.")

print("=" * 50)
print("GEMINI RESPONSE:")
print(response.text)
print("=" * 50)
print("\n✅ If you see a response above, your setup works!")
