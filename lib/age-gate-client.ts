export const AGE_GATE_COOKIE = "age_gate_21";
export const AGE_GATE_STORAGE = "age_gate_21";
const MAX_AGE_SEC = 365 * 24 * 60 * 60;

export function getAgeGateAccepted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(AGE_GATE_STORAGE) === "accepted") return true;
    const match = document.cookie.match(new RegExp(`(^| )${AGE_GATE_COOKIE}=([^;]+)`));
    return match?.[2] === "accepted";
  } catch {
    return false;
  }
}

export function setAgeGateAccepted(): void {
  try {
    localStorage.setItem(AGE_GATE_STORAGE, "accepted");
    document.cookie = `${AGE_GATE_COOKIE}=accepted; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}
