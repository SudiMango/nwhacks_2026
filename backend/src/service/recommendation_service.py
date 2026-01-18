import json
from typing import List, Dict

from ..util.gemini_client import GeminiClient


class RecommendationService:
  def __init__(self):
    self.gemini = GeminiClient()

  def recommend(self, favorite_genres: List[str], last_book: str, count: int = 8) -> List[Dict]:
    genres_text = ", ".join(favorite_genres) if favorite_genres else "any"
    last_book_text = last_book if last_book else "None provided"

    prompt = f"""
    You are a book concierge. Recommend {count} books tailored to the user's taste.

    Favorite genres: {genres_text}
    Last book read: {last_book_text}

    Respond ONLY with a valid JSON array of objects using this exact shape:
    [
      {{
        "title": "string",
        "author": "string",
        "genre": "string",
      }}
    ]

    Do not include markdown fences or extra text.
    """

    try:
      raw = self.gemini.generate_content(prompt)
      cleaned = raw.strip()
      if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1]
        if cleaned.startswith("json"):
          cleaned = cleaned[4:]
      data = json.loads(cleaned)
      if isinstance(data, list):
        # ensure each item has required keys
        normalized = []
        for item in data:
          if not isinstance(item, dict):
            continue
          normalized.append(
            {
              "title": item.get("title", ""),
              "author": item.get("author", ""),
              "genre": item.get("genre", ""),
            }
          )
        return normalized[:count]
    except Exception as e:
      print(f"Recommendation parse error: {e}")

    return []
