export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (envUrl) {
    const semBarraFinal = envUrl.replace(/\/$/, '');
    return semBarraFinal.endsWith('/api')
      ? semBarraFinal.slice(0, -4)
      : semBarraFinal;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  return '';
}