// ---------------------------------------------------------------------------
// Phase 2.1 backend (Oracle VM): nginx on port 80 reverse-proxies to uvicorn
// on port 8000. Plain HTTP — Expo Go allows cleartext in dev; production
// builds will need an ATS/cleartext exception or HTTPS.
// ---------------------------------------------------------------------------

export const API_BASE = 'http://152.67.178.243';
export const API_V1 = `${API_BASE}/api/v1`;
