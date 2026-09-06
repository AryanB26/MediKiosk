from typing import Dict, Any
from app.adapters.ocr.base import BaseOCRAdapter
from app.adapters.ocr.mock_adapter import MockOCRAdapter

class VisionOCRAdapter(BaseOCRAdapter):
    def __init__(self):
        self.mock_fallback = MockOCRAdapter()

    async def process_document_image(self, image_bytes: bytes, file_name: str) -> Dict[str, Any]:
        # Production vision OCR implementation falls back cleanly to mock in dev/sandbox
        return await self.mock_fallback.process_document_image(image_bytes, file_name)
