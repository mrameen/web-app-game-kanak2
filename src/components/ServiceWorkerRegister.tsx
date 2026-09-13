"use client";

import { useEffect } from "react";

/** Registers the lightweight service worker when the origin allows it. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Secure context required (HTTPS or localhost). On plain LAN HTTP, skip quietly.
    if (!window.isSecureContext) return;

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Ignore registration errors (unsupported / blocked).
    });
  }, []);

  return null;
}
