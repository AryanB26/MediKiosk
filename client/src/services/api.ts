const API_BASE = '/api/v1';

export async function fetchJson(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Identification
  identifyPatient: (data: { id_type: string; external_ref: string; full_name?: string; phone_number?: string }) =>
    fetchJson('/patients/identify', { method: 'POST', body: JSON.stringify(data) }),

  // Consent
  recordConsent: (data: { patient_id: string; visit_id: string; scopes: string[] }) =>
    fetchJson('/consents', { method: 'POST', body: JSON.stringify(data) }),

  // Conversation
  startConversation: (data: { visit_id: string; patient_id: string; interaction_language: string }) =>
    fetchJson('/conversation/start', { method: 'POST', body: JSON.stringify(data) }),

  submitAnswer: (data: { session_id: string; step_number: number; question_id: string; touch_value?: any; interaction_language: string }) =>
    fetchJson('/conversation/answer', { method: 'POST', body: JSON.stringify(data) }),

  // Document Upload & OCR
  uploadDocument: (formData: FormData) =>
    fetch('/api/v1/documents/upload', { method: 'POST', body: formData }).then((r) => r.json()),

  // Doctor Queue & Case
  getDoctorQueue: () => fetchJson('/doctor/queue'),
  getCaseOverview: (visitId: string) => fetchJson(`/doctor/visit/${visitId}/case-overview`),
  submitIntakePayload: (data: any) =>
    fetchJson('/doctor/intake/submit', { method: 'POST', body: JSON.stringify(data) }),
  verifySummary: (summaryId: string, data: any) =>
    fetchJson(`/doctor/summary/${summaryId}/verify`, { method: 'POST', body: JSON.stringify(data) }),
};
