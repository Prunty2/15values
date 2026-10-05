/** Keep internal links in this document and avoid duplicate history entries. */
export const currentLocation = () => normalizeLocation(window.location.hash.slice(1));
const normalizeLocation = (value: string) => value === '/values' ? '/?section=values' : value || '/';

export function navigate(target: string) {
  const next = normalizeLocation(target);
  if (next === currentLocation()) return;
  window.history.pushState(null, '', `#${next}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
