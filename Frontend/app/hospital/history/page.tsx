"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Heart, ArrowLeft, MapPin, Calendar, Droplet } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
});

export default function HospitalHistory() {
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [hospitalName, setHospitalName] = useState("Hospital");
  const [requests, setRequests] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setHospitalId(user._id || user.id || null);
      setHospitalName(user.fullName || "Hospital");
    }
    // fallback: try to decode token
    if (!stored) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const d: any = jwtDecode(token);
          setHospitalId(d.userId || d._id || null);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Fetch history data
  useEffect(() => {
    if (!hospitalName) return;

    setLoading(true);

    Promise.all([
      fetch("http://localhost:5000/request/all").then((res) => res.json()),
      fetch(`http://localhost:5000/hospital/schedules/${encodeURIComponent(hospitalName)}`).then((res) => res.json()),
    ])
      .then(([requestRes, scheduleRes]) => {
        // All requests created by this hospital
        const allRequests = requestRes.requests || [];
        const myRequests = allRequests.filter((r: any) => r.hospital === hospitalName);
        setRequests(myRequests);

        // All schedules for this hospital - filter only completed ones with date/time in past
        const allSchedules = scheduleRes.schedules || [];
        const now = new Date();
        
        // Deduplicate and filter by date reached + completed status
        const seen = new Set<string>();
        const completedSchedules = allSchedules
          .filter((s: any) => {
            if (!s.status || s.status.toLowerCase() !== "completed") return false;
            
            // Check if date & time has passed
            try {
              const scheduleDateTime = new Date(`${s.date} ${s.time}`);
              if (scheduleDateTime > now) return false; // Future date, skip
            } catch (e) {
              return false; // Invalid date format
            }
            
            // Deduplicate by donor + date + time combination
            const key = `${s.donorName}-${s.date}-${s.time}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a: any, b: any) => {
            // Sort by date and time in descending order (most recent first)
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateB.getTime() - dateA.getTime();
          });
        
        setSchedules(completedSchedules);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, [hospitalName]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/hospital/dashboard" className="hover:opacity-80 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Heart className="w-8 h-8 fill-white" />
          <h1 className="text-2xl font-bold">Hospital History</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-600 text-lg">Loading history...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Requests Created by Hospital */}
            {requests.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-6">
                  <Droplet className="w-8 h-8 text-red-600" />
                  <h2 className="text-3xl font-bold text-red-700">Blood Requests Created</h2>
                </div>

                <div className="space-y-4">
                  {requests.map((r, i) => (
                    <div key={i} className="p-6 border-2 border-red-100 rounded-xl hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-2xl font-bold text-red-700">{r.bloodType}</p>
                          <p className="text-gray-600 mt-1">{r.unitsNeeded} units needed</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                          r.urgency === "critical" ? "bg-red-100 text-red-700" :
                          r.urgency === "high" ? "bg-orange-100 text-orange-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {r.urgency?.toUpperCase() || "NORMAL"}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4 text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-red-600" />
                          <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-600" />
                          <span>Status: {r.status || "Pending"}</span>
                        </div>
                      </div>

                      {/* Map for location */}
                      {r.location && r.location.latitude && r.location.longitude ? (
                        <div className="mt-4 h-48 overflow-hidden rounded-lg border-2 border-red-100">
                          <LeafletMap activeDonors={[{ location: r.location, fullName: r.hospital }]} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200 text-center">
                <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No blood requests created yet</p>
              </div>
            )}

            {/* Donation Schedules Accepted */}
            {schedules.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-8 h-8 text-green-600" />
                  <h2 className="text-3xl font-bold text-green-700">Completed Donations</h2>
                </div>

                <div className="space-y-4">
                  {schedules.map((s, idx) => (
                    <div key={idx} className="p-6 border-2 border-green-100 rounded-xl hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xl font-bold text-green-700">Donor: {s.donorName}</p>
                          <p className="text-gray-600 mt-1">Blood Type: {s.bloodType}</p>
                        </div>
                        <span className="px-4 py-2 rounded-full font-semibold text-sm bg-green-100 text-green-700">
                          COMPLETED
                        </span>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <span>{s.date} at {s.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplet className="w-5 h-5 text-green-600" />
                          <span>{s.unitsNeeded} units collected</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-green-600" />
                          <span>Successfully donated</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No completed donations yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
