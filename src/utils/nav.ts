export function navigate(path: string) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
}

export type AppView =
  | { name: 'menu' }
  | { name: 'daily' }
  | { name: 'unlimited' }
  | { name: 'archive' }
  | { name: 'practice'; date: string };

export function viewFor(pathname: string): AppView {
  if (pathname === '/daily') return { name: 'daily' };
  if (pathname === '/unlimited') return { name: 'unlimited' };
  if (pathname === '/archive') return { name: 'archive' };
  const practice = pathname.match(/^\/practice\/(\d{4}-\d{2}-\d{2})\/?$/);
  if (practice) return { name: 'practice', date: practice[1] };
  return { name: 'menu' };
}
