"use client";

import { useEffect } from "react";

export default function UserGuard() {
  useEffect(() => {
    try {
      const win: any = window;
      if (!win || !win.localStorage) return;

      // Wrap localStorage.setItem
      const originalSetItem = win.localStorage.setItem.bind(win.localStorage);
      if (!(originalSetItem as any).__user_guard_wrapped) {
        const wrappedSetItem = function (key: string, value: string) {
          try {
            if (key === "user") {
              let parsed = null;
              try {
                parsed = JSON.parse(value);
              } catch (e) {}

              // If payload doesn't look like a valid user object (require id/_id/email/role), block and warn
              const hasUserIdentifier = parsed && (parsed._id || parsed.id || parsed.email || parsed.role);
              if (!hasUserIdentifier) {
                console.warn('[user-guard] Blocked localStorage.user write (missing user identifier)', { value });
                return;
              }

              // If an existing user is present, ensure incoming user is same id/role
              const raw = win.localStorage.getItem("user");
              const current = raw ? (() => { try { return JSON.parse(raw); } catch (e) { return null; } })() : null;
              if (current && parsed && parsed._id && current._id && String(parsed._id) !== String(current._id)) {
                console.warn('[user-guard] Blocked localStorage.user write for different user id', { currentId: current._id, incomingId: parsed._id });
                return;
              }
            }
          } catch (err) {
            // fallthrough to original behavior if our guard fails
            console.error('[user-guard] error in guard logic', err);
          }

          return originalSetItem(key, value);
        } as any;
        (wrappedSetItem as any).__user_guard_wrapped = true;
        win.localStorage.setItem = wrappedSetItem;
      }

      // Wrap dispatchEvent to guard user-updated events
      const originalDispatch = win.dispatchEvent.bind(win);
      if (!(originalDispatch as any).__user_guard_wrapped) {
        const wrappedDispatch = function (evt: Event) {
          try {
            if (evt && (evt as any).type === 'user-updated') {
              const payload = (evt as any).detail;
              const looksLikeRequest = payload && (payload.unitsNeeded !== undefined || payload.bloodType !== undefined || payload.recipientName !== undefined || payload.hospital !== undefined);
              const hasUserIdentifierEvt = payload && (payload._id || payload.id || payload.email || payload.role);
              if (looksLikeRequest && !hasUserIdentifierEvt) {
                console.warn('[user-guard] Blocked user-updated event (looks like request)', payload);
                return false;
              }

              // If current user exists, ensure ids/role match
              const raw = win.localStorage.getItem('user');
              const current = raw ? (() => { try { return JSON.parse(raw); } catch (e) { return null; } })() : null;
              if (current && payload && payload._id && current._id && String(payload._id) !== String(current._id)) {
                console.warn('[user-guard] Blocked user-updated event for different user id', { currentId: current._id, incomingId: payload._id });
                return false;
              }
            }
          } catch (err) {
            console.error('[user-guard] error in dispatch guard', err);
          }

          return originalDispatch(evt);
        } as any;
        (wrappedDispatch as any).__user_guard_wrapped = true;
        win.dispatchEvent = wrappedDispatch;
      }
    } catch (err) {
      // ignore
      console.error('[user-guard] initialization error', err);
    }

    return () => {
      // intentionally not restoring originals to keep guard active for the session
    };
  }, []);

  return null;
}
