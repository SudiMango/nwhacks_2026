import requests
import os

api_key = os.getenv("ELEVEN_LABS_API_KEY")

class ElevenLabsClient:
    def __init__(self):
        # Use provided api_key, or get from environment variable
        self.base_url = "https://api.elevenlabs.io/v1"
    
    def transcribe(self, wav_file_path, model_id='scribe_v1'):
        """Transcribe audio file to text"""
        url = f"{self.base_url}/speech-to-text"
        
        headers = {
            "xi-api-key": api_key
        }
        
        with open(wav_file_path, 'rb') as f:
            files = {
                'file': f
            }
            data = {
                'model_id': model_id
            }
            response = requests.post(url, headers=headers, files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            return result.get('text')
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return None