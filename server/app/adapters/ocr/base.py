from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseOCRAdapter(ABC):
    @abstractmethod
    async def process_document_image(self, image_bytes: bytes, file_name: str) -> Dict[str, Any]:
        """Perform document OCR, bounding box alignment, and entity extraction."""
        pass
