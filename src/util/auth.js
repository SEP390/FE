export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (_) {
    return null;
  }
}

export function getRoleFromToken(token) {
  const payload = parseJwt(token);
  if (!payload) return null;
  // Common JWT claim names for roles/authorities
  const role = payload.role || payload.roles || payload.authorities || payload.scope;
  if (Array.isArray(role)) return role[0] || null;
  if (typeof role === 'string') return role;
  return null;
}

export function getRedirectPathForRole(role) {
  if (!role) return '/';
  const normalized = String(role).toLowerCase();
  if (normalized.includes('manager')) return '/manager';
  if (normalized.includes('guard')) return '/guard/requests';
  if (normalized.includes('cleaner')) return '/cleaner/schedule';
  if (normalized.includes('technical') || normalized.includes('technician')) return '/technical/requests';
  if (normalized.includes('resident') || normalized.includes('student')) return '/student-info';
  return '/';
}


