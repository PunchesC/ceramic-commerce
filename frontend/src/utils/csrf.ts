const base = process.env.REACT_APP_API_URL;
export async function fetchCsrfToken() {
  const res = await fetch(`${base}/api/security/csrf-token`, {
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`Failed to fetch CSRF token (${res.status})`);
  const data = await res.json();
  if (!data?.token) throw new Error('CSRF token missing in response');
  sessionStorage.setItem('csrfToken', data.token);
  return data.token;
}