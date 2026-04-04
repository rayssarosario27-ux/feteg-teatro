import baseHandler from './[...path].js';

export default async function handler(req, res) {
  const originalUrl = new URL(req.url, 'http://localhost');
  const rewrittenPath = originalUrl.searchParams.get('path');

  if (rewrittenPath !== null) {
    const normalizedPath = rewrittenPath
      ? rewrittenPath.startsWith('/')
        ? rewrittenPath
        : `/${rewrittenPath}`
      : '';

    const nextParams = new URLSearchParams(originalUrl.searchParams);
    nextParams.delete('path');

    const queryString = nextParams.toString();
    req.url = `/api${normalizedPath}${queryString ? `?${queryString}` : ''}`;
  }

  return baseHandler(req, res);
}
