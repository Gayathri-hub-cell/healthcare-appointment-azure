// useApi() returns a fetch helper that attaches a fresh Microsoft access token
// to every request to the backend API.
import { useMsal } from '@azure/msal-react';
import { apiRequest } from './authConfig';

const BASE = import.meta.env.VITE_API_BASE;

export function useApi() {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  return async (path, options = {}) => {
    const { accessToken } = await instance.acquireTokenSilent({ ...apiRequest, account });
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error((await res.text()) || `Request failed (${res.status})`);
    return res.status === 204 ? null : res.json();
  };
}
