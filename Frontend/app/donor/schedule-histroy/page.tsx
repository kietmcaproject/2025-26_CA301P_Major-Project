"use client";

import { useEffect, useState } from "react";

export default function ScheduleHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let donorId = null;

    if (token) {
      try {
        const p = JSON.parse(atob(token.split(".")[1]));
        donorId = p.userId;
      } catch {}
    }

    if (!donorId) donorId = localStorage.getItem("userId");

    if (!donorId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/donor/schedule-history/${donorId}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!history.length) return <p className="p-6">No scheduled donations yet.</p>;

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">My Donation Schedules</h2>

        <div className="space-y-4">
          {history.map((s) => (
            <div
              key={s._id}
              className="p-4 bg-white rounded shadow border-l-4 border-red-600"
            >
              <p>
                <strong>Date:</strong> {s.date} {s.time}
              </p>
              <p>
                <strong>Contact:</strong> {s.contact}
              </p>
              <p>
                <strong>Status:</strong> {s.status}
              </p>
              <p className="text-sm text-gray-600">
                Notes: {s.notes || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
