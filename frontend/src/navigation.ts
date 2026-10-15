const normalizeLocation = (value: string) => value === '/values' ? '/?section=values' : value || '/';
export const currentLocation = () => typeof window === 'undefined' ? '/' : normalizeLocation(window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : '/' + window.location.pathname.slice(import.meta.env.BASE_URL.length).replace(/\/$/, '') + window.location.search);
export function routeHref(target: string): string {
  if (!target.startsWith('#/')) return target;
  const route = normalizeLocation(target.slice(1));
  const [path, query] = route.split('?');
  return import.meta.env.BASE_URL + path.replace(/^\//, '') + (path === '/' || path.endsWith('/') ? '' : '/') + (query ? '?' + query : '');
}
export function navigate(target: string) {
  const next = normalizeLocation(target);
  if (next === currentLocation()) return;
  window.history.pushState(null, '', routeHref('#' + next));
  window.dispatchEvent(new PopStateEvent('popstate'));
}
