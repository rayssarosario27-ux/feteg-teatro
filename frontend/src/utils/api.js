export function getApiBaseUrl() {
  const defaultProductionApi = 'https://admin-feteg.vercel.app';
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  const adminOverride = import.meta.env.VITE_ADMIN_API_URL?.trim();

  const normalizarBase = (valor) => {
    if (!valor) return '';
    const semBarraFinal = valor.replace(/\/$/, '');
    return semBarraFinal.endsWith('/api')
      ? semBarraFinal.slice(0, -4)
      : semBarraFinal;
  };

  if (envUrl) {
    const baseNormalizada = normalizarBase(envUrl);

    if (typeof window !== 'undefined') {
      const { hostname } = window.location;
      const emLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

      if (!emLocalhost) {
        try {
          const hostDaApi = new URL(baseNormalizada).hostname;
          if (hostDaApi === hostname) {
            return normalizarBase(adminOverride) || defaultProductionApi;
          }
        } catch {
          return normalizarBase(adminOverride) || defaultProductionApi;
        }
      }
    }

    return baseNormalizada;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  return normalizarBase(adminOverride) || defaultProductionApi;
}