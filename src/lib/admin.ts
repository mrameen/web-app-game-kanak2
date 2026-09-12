export const ADMIN_SESSION_KEY = "reading-game-admin-session";

/** Default password for local/internal admin. Override with NEXT_PUBLIC_ADMIN_PASSWORD. */
export const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD?.trim() || "baca@admin";

export interface AdminSession {
  loggedIn: true;
  at: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function verifyAdminPassword(password: string): boolean {
  return password.trim() === ADMIN_PASSWORD;
}

export function setAdminSession(): void {
  if (!isBrowser()) return;
  const session: AdminSession = {
    loggedIn: true,
    at: new Date().toISOString(),
  };
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminLoggedIn(): boolean {
  if (!isBrowser()) return false;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    return parsed.loggedIn === true;
  } catch {
    return false;
  }
}
