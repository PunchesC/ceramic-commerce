// Centralized API helper with CSRF support and credentials
// Keeps the CSRF token in memory and attaches it to unsafe requests.

const API_URL = process.env.REACT_APP_API_URL;

let csrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;

function isAbsolute(url: string) {
  return /^https?:\/\//i.test(url);
}

function needsCsrf(method: string) {
  const m = method.toUpperCase();
  return m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE';
}

async function fetchCsrfToken(): Promise<string | null> {
  if (!API_URL) {
    console.warn('REACT_APP_API_URL is not set; CSRF token cannot be fetched.');
    csrfToken = null;
    return null;
  }
  try {
    const res = await fetch(`${API_URL}/api/security/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });
    // Try header first
    const headerToken = res.headers.get('X-CSRF-TOKEN') || res.headers.get('x-csrf-token');
    if (headerToken) {
      csrfToken = headerToken;
      return csrfToken;
    }
    // Fallback to JSON body with several common keys
    try {
      const data = await res.json().catch(() => ({}));
      csrfToken = (data?.token || data?.requestToken || data?.csrfToken || null) as string | null;
      return csrfToken;
    } catch {
      csrfToken = null;
      return null;
    }
  } catch (e) {
    console.warn('Failed to fetch CSRF token:', e);
    csrfToken = null;
    return null;
  }
}

export async function initCsrf() {
  if (!csrfToken && !csrfPromise) {
    csrfPromise = fetchCsrfToken().finally(() => {
      csrfPromise = null;
    });
  }
  return csrfPromise ?? Promise.resolve(csrfToken);
}

export async function apiFetch(input: string, options: RequestInit = {}) {
  const method = (options.method || 'GET').toUpperCase();

  // Resolve URL
  let url = input;
  if (!isAbsolute(input)) {
    if (!API_URL) throw new Error('REACT_APP_API_URL is not set');
    url = input.startsWith('/') ? `${API_URL}${input}` : `${API_URL}/${input}`;
  }

  // Ensure credentials are included
  const reqInit: RequestInit = {
    credentials: 'include',
    ...options,
  };

  // Add CSRF token for unsafe methods
  if (needsCsrf(method)) {
    if (!csrfToken) {
      await initCsrf();
    }
    const headers = new Headers(reqInit.headers || {});
    if (csrfToken) headers.set('X-CSRF-TOKEN', csrfToken);

    // Avoid overriding Content-Type when body is FormData
    if (reqInit.body instanceof FormData) {
      // leave Content-Type unset so browser sets proper boundary
    }

    reqInit.headers = headers;
  }

  let res = await fetch(url, reqInit);

  // If CSRF failed or expired, try to refresh once and retry for unsafe methods
  if (needsCsrf(method) && (res.status === 400 || res.status === 403)) {
    await initCsrf();
    const retryHeaders = new Headers(reqInit.headers || {});
    if (csrfToken) retryHeaders.set('X-CSRF-TOKEN', csrfToken);
    res = await fetch(url, { ...reqInit, headers: retryHeaders });
  }

  return res;
}
