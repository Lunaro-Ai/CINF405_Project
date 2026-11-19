const BASE = '/api';

const getToken = () => localStorage.getItem('token');

const request = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getEntries: () => request('/entries'),
  addEntry: (body) => request('/entries', { method: 'POST', body: JSON.stringify(body) }),
  getEntry: (id) => request(`/entries/${id}`),
  updateStatus: (id, status) => request(`/entries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteEntry: (id) => request(`/entries/${id}`, { method: 'DELETE' }),

  addNote: (entryId, text) => request(`/entries/${entryId}/notes`, { method: 'POST', body: JSON.stringify({ text }) }),
  updateNote: (entryId, noteId, text) => request(`/entries/${entryId}/notes/${noteId}`, { method: 'PATCH', body: JSON.stringify({ text }) }),
  deleteNote: (entryId, noteId) => request(`/entries/${entryId}/notes/${noteId}`, { method: 'DELETE' }),

  saveReview: (entryId, body) => request(`/entries/${entryId}/review`, { method: 'POST', body: JSON.stringify(body) }),

  addChallenge: (entryId, description) => request(`/entries/${entryId}/challenges`, { method: 'POST', body: JSON.stringify({ description }) }),
  toggleChallenge: (entryId, challengeId) => request(`/entries/${entryId}/challenges/${challengeId}/done`, { method: 'PATCH' }),
  deleteChallenge: (entryId, challengeId) => request(`/entries/${entryId}/challenges/${challengeId}`, { method: 'DELETE' }),
};
