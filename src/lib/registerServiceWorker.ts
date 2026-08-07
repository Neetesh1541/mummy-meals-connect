import { registerSW } from "virtual:pwa-register";

const SW_URL = "/sw.js";

function isBlockedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;

  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }

  const host = window.location.hostname;
  const blockedHost =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  if (blockedHost) return true;

  return new URL(window.location.href).searchParams.get("sw") === "off";
}

async function unregisterAppServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      registrations
        .filter((r) => (r.active?.scriptURL ?? r.installing?.scriptURL ?? "").endsWith(SW_URL))
        .map((r) => r.unregister())
    );
  } catch {
    /* ignore */
  }
}

export interface RegisterOptions {
  onNeedRefresh: (reload: () => Promise<void> | void) => void;
  onOfflineReady?: () => void;
}

/**
 * Single guarded entry point for service-worker registration.
 * Never registers in dev, Lovable preview, iframes, or with ?sw=off.
 */
export function registerAppServiceWorker({ onNeedRefresh, onOfflineReady }: RegisterOptions) {
  if (isBlockedContext()) {
    void unregisterAppServiceWorkers();
    return;
  }

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      onNeedRefresh(() => updateSW(true));
    },
    onOfflineReady() {
      onOfflineReady?.();
    },
  });
}
