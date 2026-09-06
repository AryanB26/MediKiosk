from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseABDMAdapter(ABC):
    @abstractmethod
    async def verify_abha(self, abha_number: str) -> Dict[str, Any]:
        """Verify ABHA number via ABDM M1 gateway."""
        pass

    @abstractmethod
    async def fetch_longitudinal_ehr(self, abha_number: str) -> List[Dict[str, Any]]:
        """Fetch ABDM linked records via M2/M3 FHIR consent framework."""
        pass
