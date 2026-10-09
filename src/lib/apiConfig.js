// Change VITE_API_BASE_URL when switching to another backend.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.zudocars.com').replace(/\/+$/, '');
export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export function dashboardHeaders() {
  const user = JSON.parse(localStorage.getItem('zudo_user') || sessionStorage.getItem('zudo_user') || '{}');
  if (!user.token) throw new Error('Please sign out and sign in again.');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` };
}
