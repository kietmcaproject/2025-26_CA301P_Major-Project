"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RecipientSettings() {
  const [user, setUser] = useState<any | null>(null);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUser(u);
        setPhone(u.phone || "");
      }
    } catch (e) {
      setUser(null);
    }
  }, []);

  const save = () => {
    if (!user) return;
    setSaving(true);
    const updated = { ...user, phone };
    // Save to localStorage for now (replace with API call later)
    localStorage.setItem("user", JSON.stringify(updated));
    try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch(e){}
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved (local)");
      router.refresh();
    }, 600);
  };

  if (!user) return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <p className="text-gray-600">No recipient user found. Please log in.</p>
        <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded" onClick={() => router.push('/')}>Go Home</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen p-6 bg-linear-to-br from-white via-red-50 to-white">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold">Recipient Settings</h1>
        <div className="mt-4">
          <label className="block text-sm text-gray-600">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" title="Enter your phone number" />
        </div>

        <div className="mt-4 flex gap-3">
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="bg-gray-100 px-4 py-2 rounded" onClick={() => router.back()}>Cancel</button>
        </div>
      </div>
    </main>
  );
}
