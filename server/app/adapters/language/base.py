from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseLanguageAdapter(ABC):
    @abstractmethod
    async def transcribe_speech(self, audio_bytes: bytes, language: str) -> Dict[str, Any]:
        """Convert Indian language speech (Hindi/Marathi/English) to text transcript."""
        pass

    @abstractmethod
    async def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text between Indian languages and English."""
        pass

    @abstractmethod
    async def synthesize_speech(self, text: str, language: str) -> bytes:
        """Generate TTS audio for kiosk questions."""
        pass
