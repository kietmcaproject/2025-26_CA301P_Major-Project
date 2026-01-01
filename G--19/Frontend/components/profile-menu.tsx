"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      setUser(null);
    }
  }, []);

  // Listen for cross-component user updates (dispatched when profile is saved)
  useEffect(() => {
    const onUserUpdated = (e: any) => {
      try {
        const payload = e?.detail;
        // Defensive checks: ignore payloads that are not user objects or belong to a different user/role
        if (!payload) {
          const raw = localStorage.getItem("user");
          if (raw) setUser(JSON.parse(raw));
          return;
        }

        // If payload looks like a request (has request-specific fields) and doesn't include user identifying fields, ignore
        const looksLikeRequest = payload.unitsNeeded !== undefined || payload.bloodType !== undefined || payload.recipientName !== undefined || payload.hospital !== undefined;
        const hasUserIdentifier = payload && (payload._id || payload.id || payload.email || payload.role);
        if (looksLikeRequest && !hasUserIdentifier) return;

        // If there's a current stored user, only accept updates for the same user id/role — prevents other users' profile events from overwriting
        try {
          const raw = localStorage.getItem("user");
          const current = raw ? JSON.parse(raw) : null;
          if (current && payload._id && String(payload._id) !== String(current._id || current.id)) return;
          if (current && payload.role && current.role && payload.role !== current.role) return;
        } catch (e) {
          // ignore parsing errors and continue
        }

        // At this point payload appears to be a user update for the current user — accept it
        setUser(payload);
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("user-updated", onUserUpdated as EventListener);
    return () => window.removeEventListener("user-updated", onUserUpdated as EventListener);
  }, []);

  // Listen for cross-tab localStorage changes to `user` and update only when appropriate
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "user") return;
      try {
        const newVal = e.newValue ? JSON.parse(e.newValue) : null;
        if (!newVal) return;

        // If we have a current user stored, only accept same-id updates
        const raw = localStorage.getItem("user");
        const current = raw ? JSON.parse(raw) : null;
        if (current && newVal && newVal._id && current._id && String(newVal._id) !== String(current._id)) {
          console.warn("profile-menu: received cross-tab user for different id, ignoring", { currentId: current._id, incomingId: newVal._id });
          return;
        }

        setUser(newVal);
      } catch (err) {
        // ignore parse errors
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Debug helper: wrap localStorage.setItem in this tab to detect accidental writes to `user`
  useEffect(() => {
    try {
      const win: any = window;
      if (!win || !win.localStorage) return;
      const originalSetItem = win.localStorage.setItem.bind(win.localStorage);
      if ((originalSetItem as any).__wrapped_for_user_debug) return; // already wrapped

      const wrapped = function (key: string, value: string) {
        if (key === "user") {
          try {
            console.warn("[profile-menu] localStorage.user set in this tab:", { value });
            // include stack trace to find caller
            console.warn(new Error("stack").stack);
          } catch (e) {
            // ignore
          }
        }
        return originalSetItem(key, value);
      } as any;
      (wrapped as any).__wrapped_for_user_debug = true;
      win.localStorage.setItem = wrapped;

      return () => {
        try {
          win.localStorage.setItem = originalSetItem;
        } catch (e) {}
      };
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // navigate to home using Next router
    router.push("/");
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100"
        aria-label="Profile"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-red-600 text-white flex items-center justify-center">
          {user?.profileImage ? (
            // show profile image if available
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profileImage} alt={user.fullName || 'Profile'} className="w-8 h-8 object-cover" />
          ) : user?.fullName ? (
            user.fullName.charAt(0).toUpperCase()
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-semibold">
                {user?.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profileImage} alt={user.fullName || 'Profile'} className="w-12 h-12 object-cover rounded-full" />
                ) : user?.fullName ? (
                  user.fullName.charAt(0).toUpperCase()
                ) : (
                  "U"
                )}
              </div>
              <div>
                <div className="font-semibold">{user?.fullName || "Unknown"}</div>
                <div className="text-sm text-gray-500">{user?.email || "No email"}</div>
                <div className="text-xs text-gray-400">{user?.role || "guest"}</div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-700">
              {user?.phone && <div>Phone: {user.phone}</div>}
              {user?.hospitalName && <div>Hospital: {user.hospitalName}</div>}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setOpen(false); router.push('/profile'); }}
                className="flex-1 bg-gray-100 py-2 rounded-md text-sm"
              >
                View Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
