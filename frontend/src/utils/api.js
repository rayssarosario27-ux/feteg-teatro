export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  const normalizarBase = (valor) => {
    if (!valor) return '';
    const semBarraFinal = valor.replace(/\/$/, '');
    return semBarraFinal.endsWith('/api')
      ? semBarraFinal.slice(0, -4)
      : semBarraFinal;
  };

  if (envUrl) {
    const baseNormalizada = normalizarBase(envUrl);
    return baseNormalizada;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  return '';
}