from google.genai import client as genai_client
import os

api_key = os.getenv("GEMINI_API_KEY")

class GeminiClient:
    def __init__(self):
        # Use provided api_key, or get from environment variable
        self.client = genai_client.Client(api_key=api_key)
    
    def generate_content(self, prompt, model="gemini-2.5-flash"):
        """Generate content using Gemini"""
        response = self.client.models.generate_content(
            model=model,
            contents=prompt
        )
        return response.text