// Lightweight mock auth for the Rhea demo. No backend.
const KEY = "rhea.session";

export function signIn(email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify({ email, at: Date.now() }));
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function isSignedIn() {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(KEY);
}
