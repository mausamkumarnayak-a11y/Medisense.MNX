// Central API base URL configuration
// In production on Render (or other hosts), set VITE_API_URL (e.g. https://medisense-backend.onrender.com)
// If not set, falls back to relative root '' when running on a hosted domain (for unified backend deployment)
// or http://127.0.0.1:8000 when running locally in development.
const envUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = (
  envUrl ||
  (typeof window !== 'undefined' &&
   window.location.hostname !== 'localhost' &&
   window.location.hostname !== '127.0.0.1'
    ? ''
    : 'http://127.0.0.1:8000')
).replace(/\/+$/, '');

export default API_BASE_URL;
