"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearAdminSession,
  isAdminLoggedIn,
  setAdminSession,
  verifyAdminPassword,
  ADMIN_SESSION_KEY,
} from "@/lib/admin";

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  // Same-tab updates via custom event
  window.addEventListener("admin-session-change", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("admin-session-change", listener);
  };
}

function getSnapshot() {
  return isAdminLoggedIn();
}

function getServerSnapshot() {
  return false;
}

function notify() {
  window.dispatchEvent(new Event("admin-session-change"));
}

export function useAdminAuth() {
  const loggedIn = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Force re-read after hydration for sessionStorage
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const login = useCallback((password: string) => {
    if (!verifyAdminPassword(password)) return false;
    setAdminSession();
    notify();
    return true;
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
    notify();
  }, []);

  return {
    hydrated,
    loggedIn: hydrated ? loggedIn || isAdminLoggedIn() : false,
    login,
    logout,
    sessionKey: ADMIN_SESSION_KEY,
  };
}
