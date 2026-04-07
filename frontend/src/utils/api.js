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

  // Removido fallback para localhost para evitar confusão em produção

  return '';
}