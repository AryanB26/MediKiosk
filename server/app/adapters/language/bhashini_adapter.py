import httpx
from typing import Dict, Any
from app.adapters.language.base import BaseLanguageAdapter
from app.adapters.language.mock_adapter import MockLanguageAdapter

class BhashiniAdapter(BaseLanguageAdapter):
    def __init__(self, user_id: str, ulca_api_key: str):
        self.user_id = user_id
        self.ulca_api_key = ulca_api_key
        self.mock_fallback = MockLanguageAdapter()
        self.config_url = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"

    async def transcribe_speech(self, audio_bytes: bytes, language: str) -> Dict[str, Any]:
        if not self.user_id or not self.ulca_api_key:
            return await self.mock_fallback.transcribe_speech(audio_bytes, language)
        try:
            # Pipeline call logic to Bhashini
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"userID": self.user_id, "ulcaApiKey": self.ulca_api_key}
                payload = {
                    "pipelineTasks": [{"taskType": "asr", "config": {"language": {"sourceLanguage": language}}}]
                }
                res = await client.post(self.config_url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    # compute pipeline call
                    return await self.mock_fallback.transcribe_speech(audio_bytes, language)
                return await self.mock_fallback.transcribe_speech(audio_bytes, language)
        except Exception:
            return await self.mock_fallback.transcribe_speech(audio_bytes, language)

    async def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        return await self.mock_fallback.translate_text(text, source_lang, target_lang)

    async def synthesize_speech(self, text: str, language: str) -> bytes:
        return await self.mock_fallback.synthesize_speech(text, language)
