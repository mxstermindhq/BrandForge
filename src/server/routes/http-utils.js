function parsePathParams(pathname, pattern) {
  const pathParts = pathname.split('/').filter(Boolean);
  const patParts = pattern.split('/').filter(Boolean);
  if (pathParts.length !== patParts.length) return null;
  const params = {};
  for (let i = 0; i < patParts.length; i += 1) {
    const seg = patParts[i];
    if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(pathParts[i]);
    else if (seg !== pathParts[i]) return null;
  }
  return params;
}

module.exports = { parsePathParams };
