import { Platform } from 'react-native';
/** Web: make sure the PWA manifest/meta are present and the service worker is registered (the Vercel build uses Expo's own index.html). */
export function setupPwa() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const head = document.head;
  const add = (tag: string, attrs: Record<string, string>) => { const el = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); head.appendChild(el); };
  if (!document.querySelector('link[rel="manifest"]')) {
    add('link', { rel: 'manifest', href: '/manifest.json' });
    add('meta', { name: 'theme-color', content: '#3A2416' });
    add('link', { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' });
    add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
    add('meta', { name: 'mobile-web-app-capable', content: 'yes' });
    add('meta', { name: 'apple-mobile-web-app-title', content: 'Mamaput' });
  }
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.getRegistration().then((r) => { if (!r) navigator.serviceWorker.register('/sw.js').catch(() => {}); }).catch(() => {});
}
