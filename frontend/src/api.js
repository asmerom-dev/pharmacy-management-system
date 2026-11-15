// Centralized API configuration and request helper
// Automatically switches between local Vite proxy and Cloud Backend (Render/Railway)

export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/**
 * apiFetch handles prefixing with API_BASE and automatically includes
 * the owner's JWT bearer token if signed in.
 */
export async function apiFetch(path, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${cleanPath}`;

  const token = localStorage.getItem("luna_auth_token");
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export default apiFetch;
