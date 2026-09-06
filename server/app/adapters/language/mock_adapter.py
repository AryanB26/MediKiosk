from typing import Dict, Any
from app.adapters.language.base import BaseLanguageAdapter

class MockLanguageAdapter(BaseLanguageAdapter):
    async def transcribe_speech(self, audio_bytes: bytes, language: str) -> Dict[str, Any]:
        transcripts = {
            "mr": "खाने के बाद सीने में भारी जलन और खट्टी डकारें होती हैं। रात को नींद नहीं आती।",
            "hi": "मुझे पिछले तीन दिनों से सीने और पेट के ऊपरी हिस्से में बहुत तेज जलन हो रही है।",
            "en": "I have severe epigastric burning and acidic regurgitation after meals for 3 days."
        }
        return {
            "transcript": transcripts.get(language, transcripts["hi"]),
            "language": language,
            "confidence": 0.991,
            "model": "Bhashini Voice AI v2.1"
        }

    async def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        if target_lang == "en":
            return "Pain in upper stomach and chest since yesterday evening after heavy meal, burning sensation."
        return text

    async def synthesize_speech(self, text: str, language: str) -> bytes:
        # Returns synthetic audio marker bytes
        return b"RIFF....WAVEfmt ....data...."
