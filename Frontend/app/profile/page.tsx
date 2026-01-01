"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      setUser(null);
    }
  }, []);

  if (!user) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
          <p className="text-gray-600">No profile data found. Please log in.</p>
          <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded" onClick={() => router.push('/')}>Go Home</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-white via-red-50 to-white">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-2xl font-bold">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.fullName}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400">Role: {user.role || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          {user.role === 'donor' && (
            <div>
              <h3 className="font-semibold">Donor Details</h3>
              <div className="mt-2 text-gray-700">
                <div>Blood Type: {user.bloodType || 'Unknown'}</div>
                <div>Available: {user.available ? 'Yes' : 'No'}</div>
                <div>Phone: {user.phone || 'N/A'}</div>
              </div>
            </div>
          )}

          {user.role === 'hospital' && (
            <div>
              <h3 className="font-semibold">Hospital Details</h3>
              <div className="mt-2 text-gray-700">
                <div>Hospital Name: {user.hospitalName || user.fullName}</div>
                <div>Address: {user.address || 'N/A'}</div>
                <div>Phone: {user.phone || 'N/A'}</div>
              </div>
            </div>
          )}

          {user.role === 'recipient' && (
            <div>
              <h3 className="font-semibold">Recipient Details</h3>
              <div className="mt-2 text-gray-700">
                <div>Recipient Name: {user.requestedByName || user.fullName}</div>
                <div>Patient: {user.patientName || 'N/A'}</div>
                <div>Phone: {user.phone || 'N/A'}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button className="bg-gray-100 px-4 py-2 rounded-md text-sm" disabled> Edit (WIP) </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/'); }}>Logout</button>
        </div>
      </div>
    </main>
  );
}
