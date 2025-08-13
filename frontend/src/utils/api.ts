// Unified API helper with streamlined CSRF handling.

const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

let csrfToken: string | null = null;
let inflightCsrf: Promise<string | null> | null = null;

function isAbsolute(url: string) {
  return /^https?:\/\//i.test(url);
}

function needsCsrf(method: string) {
  const m = method.toUpperCase();
  // Mutating verbs
  return m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS';
}

async function fetchCsrfToken(): Promise<string | null> {
  if (!API_URL) {
    console.warn('[api] REACT_APP_API_URL not set; cannot fetch CSRF token.');
    csrfToken = null;
    return null;
  }
  try {
    const res = await fetch(`${API_URL}/api/security/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) {
      console.warn('[api] CSRF token endpoint returned', res.status);
      csrfToken = null;
      return null;
    }
    // Expect a canonical shape { token: "..." }
    const data = await res.json().catch(() => ({}));
    const token = data?.token ?? data?.requestToken ?? null;
    if (typeof token === 'string' && token.length > 0) {
      csrfToken = token;
    } else {
      console.warn('[api] CSRF token missing in response payload.');
      csrfToken = null;
    }
    return csrfToken;
  } catch (err) {
    console.warn('[api] Failed to fetch CSRF token', err);
    csrfToken = null;
    return null;
  }
}

export async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  if (!inflightCsrf) {
    inflightCsrf = fetchCsrfToken().finally(() => {
      inflightCsrf = null;
    });
  }
  return inflightCsrf;
}

export function clearCsrf() {
  csrfToken = null;
}

export async function forceRefreshCsrf() {
  clearCsrf();
  return ensureCsrf();
}

function attachCsrf(headers: Headers) {
  if (csrfToken) {
    headers.set('X-CSRF-TOKEN', csrfToken);
  }
}

function prepareBodyAndHeaders(init: RequestInit, headers: Headers) {
  const body = init.body;
  if (!body) return;

  // If FormData: let browser set boundary & omit JSON headers
  if (body instanceof FormData) {
    headers.delete('Content-Type');
    return;
  }

  // If plain object (not already a string), serialize
  if (typeof body === 'object' && !(body instanceof Blob) && !(body instanceof ArrayBuffer)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }
  // If you pass a string body manually, ensure caller set Content-Type.
}

export async function apiFetch(input: string, options: RequestInit = {}) {
  if (!API_URL && !isAbsolute(input)) {
    throw new Error('REACT_APP_API_URL is not set');
  }

  const method = (options.method || 'GET').toUpperCase();
  let url = input;
  if (!isAbsolute(url)) {
    url = input.startsWith('/') ? `${API_URL}${input}` : `${API_URL}/${input}`;
  }

  const init: RequestInit = {
    credentials: 'include',
    ...options,
    method
  };

  const headers = new Headers(init.headers || {});
  prepareBodyAndHeaders(init, headers);

  if (needsCsrf(method)) {
    // Ensure token first
    if (!csrfToken) {
      await ensureCsrf();
    }
    attachCsrf(headers);
    headers.set('X-Requested-With', 'XMLHttpRequest'); // optional convention
  }

  init.headers = headers;

  let res = await fetch(url, init);

  // Retry once if clearly anti-forgery failure
  if (needsCsrf(method) && (res.status === 400 || res.status === 403)) {
    const text = await res.clone().text().catch(() => '');
    if (/csrf|antiforgery/i.test(text)) {
      await forceRefreshCsrf();
      if (csrfToken) {
        const retryHeaders = new Headers(init.headers);
        attachCsrf(retryHeaders);
        init.headers = retryHeaders;
        res = await fetch(url, init);
      }
    }
  }

  return res;
}

// Expose for debugging
export function getCsrfTokenCached() {
  return csrfToken;
}