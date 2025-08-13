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
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/security/csrf-token?ts=${Date.now()}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    // Prefer JSON body
    const data = await res.json().catch(() => ({}));
    const token =
      (data?.token ||
        res.headers.get('X-CSRF-TOKEN') ||
        res.headers.get('x-csrf-token') ||
        null) as string | null;
    csrfToken = token;
    return csrfToken;
  } catch {
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

export async function forceRefreshCsrf() {
  csrfToken = null;
  return fetchCsrfToken();
}

export function clearCsrf() {
  csrfToken = null;
}

export async function apiFetch(input: string, options: RequestInit = {}) {
  const method = (options.method || 'GET').toUpperCase();

  let url = input;
  if (!isAbsolute(input)) {
    if (!API_URL) throw new Error('REACT_APP_API_URL is not set');
    url = input.startsWith('/') ? `${API_URL}${input}` : `${API_URL}/${input}`;
  }

  const reqInit: RequestInit = {
    credentials: 'include',
    ...options,
  };

  if (needsCsrf(method)) {
    if (!csrfToken) await initCsrf();
    const headers = new Headers(reqInit.headers || {});
    if (csrfToken) headers.set('X-CSRF-TOKEN', csrfToken);
    // Don’t set Content-Type for FormData
    if (reqInit.body instanceof FormData) {
      // leave as-is
    }
    reqInit.headers = headers;
  }

  let res = await fetch(url, reqInit);

  // If CSRF failed or expired, force refresh and retry once
  if (needsCsrf(method) && (res.status === 400 || res.status === 403)) {
    await forceRefreshCsrf();
    const retryHeaders = new Headers(reqInit.headers || {});
    if (csrfToken) retryHeaders.set('X-CSRF-TOKEN', csrfToken);
    res = await fetch(url, { ...reqInit, headers: retryHeaders });
  }

  return res;
}