"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DonorHistory() {
  const [donorId, setDonorId] = useState<string | null>(null);
  const [donorName, setDonorName] = useState("Donor");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [hospitalRequests, setHospitalRequests] = useState<any[]>([]);
  const [recipientRequests, setRecipientRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setDonorId(user._id || user.id || null);
      setDonorName(user.fullName || "Donor");
    }
    // fallback: try to decode token
    if (!stored) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const d: any = jwtDecode(token);
          setDonorId(d.userId || d._id || null);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Fetch history data
  useEffect(() => {
    if (!donorId) return;

    Promise.all([
      fetch(`http://localhost:5000/schedule/donor/${donorId}`).then((res) => res.json()),
      fetch(`http://localhost:5000/request/all`).then((res) => res.json()),
    ])
      .then(([scheduleRes, requestRes]) => {
        // Filter completed schedules
        const completedSchedules = (scheduleRes.schedules || []).filter(
          (s: any) => s.status && (s.status.toLowerCase() === "completed" || s.status.toLowerCase() === "cancelled")
        );
        setSchedules(completedSchedules);

        // Filter requests
        const all = requestRes.requests || [];
        const hospitals = all.filter((r: any) => r.hospital && r.hospital !== "" && !r.isRecipientRequest);
        const recipients = all.filter((r: any) => r.isRecipientRequest || !r.hospital || r.hospital === "");

        const completedHospitals = hospitals.filter(
          (r: any) => r.confirmationStatus && (r.confirmationStatus === "Successful" || r.confirmationStatus === "Rejected")
        );
        const completedRecipients = recipients.filter(
          (r: any) => r.confirmationStatus && (r.confirmationStatus === "Successful" || r.confirmationStatus === "Rejected")
        );

        setHospitalRequests(completedHospitals);
        setRecipientRequests(completedRecipients);
      })
      .catch((err) => console.error("Error fetching history:", err))
      .finally(() => setLoading(false));
  }, [donorId]);

  return (
    <main className="min-h-screen bg-linear-to-br from-white via-red-50 to-white">
      {/* HEADER */}
      <header className="bg-red-600 text-white p-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/donor/dashboard" className="hover:opacity-80 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Heart className="w-8 h-8 fill-white" />
          <h1 className="text-2xl font-bold">Donation Request History</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Loading history...</p>
            </div>
          ) : (
            <>
              {/* Scheduled Donations History */}
              {schedules.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                    📅 Scheduled Donations
                  </h2>
                  <div className="space-y-3">
                    {schedules.map((s: any, idx: number) => (
                      <div key={idx} className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-lg font-bold text-blue-900">{s.requestId?.hospital || s.hospital || "Hospital"}</p>
                            <div className="mt-2 space-y-1 text-sm text-blue-700">
                              <p>📅 <span className="font-semibold">{s.date}</span> @ <span className="font-semibold">{s.time}</span></p>
                              <p>💉 Units: <span className="font-semibold">{s.requestId?.unitsNeeded || s.unitsNeeded}</span> | Blood: <span className="font-semibold">{s.requestId?.bloodType || s.bloodType}</span></p>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${
                            s.status.toLowerCase() === "completed"
                              ? "bg-green-200 text-green-800"
                              : "bg-orange-200 text-orange-800"
                          }`}>
                            {s.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hospital Requests History */}
              {hospitalRequests.length > 0 && (
                <div className="border-t pt-6 space-y-4">
                  <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                    🏥 Hospital Requests
                  </h2>
                  <div className="space-y-3">
                    {hospitalRequests.map((req: any, idx: number) => (
                      <div key={idx} className={`p-5 rounded-lg border-l-4 shadow-sm hover:shadow-md transition ${
                        req.confirmationStatus === "Successful"
                          ? "bg-gradient-to-r from-green-50 to-green-100 border-green-500"
                          : "bg-gradient-to-r from-red-50 to-red-100 border-red-500"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className={`text-lg font-bold ${req.confirmationStatus === "Successful" ? "text-green-900" : "text-red-900"}`}>
                              {req.hospital}
                            </p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p className={req.confirmationStatus === "Successful" ? "text-green-700" : "text-red-700"}>
                                💉 {req.unitsNeeded} units — 🩸 {req.bloodType}
                              </p>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${
                            req.confirmationStatus === "Successful"
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}>
                            {req.confirmationStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipient Requests History */}
              {recipientRequests.length > 0 && (
                <div className="border-t pt-6 space-y-4">
                  <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                    👥 Recipient Requests
                  </h2>
                  <div className="space-y-3">
                    {recipientRequests.map((req: any, idx: number) => (
                      <div key={idx} className={`p-5 rounded-lg border-l-4 shadow-sm hover:shadow-md transition ${
                        req.confirmationStatus === "Successful"
                          ? "bg-gradient-to-r from-green-50 to-green-100 border-green-500"
                          : "bg-gradient-to-r from-red-50 to-red-100 border-red-500"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className={`text-lg font-bold ${req.confirmationStatus === "Successful" ? "text-green-900" : "text-red-900"}`}>
                              {req.recipientName || req.requestedBy?.fullName || "Recipient"}
                            </p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p className={req.confirmationStatus === "Successful" ? "text-green-700" : "text-red-700"}>
                                💉 {req.unitsNeeded} units — 🩸 {req.bloodType}
                              </p>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${
                            req.confirmationStatus === "Successful"
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}>
                            {req.confirmationStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {schedules.length === 0 && hospitalRequests.length === 0 && recipientRequests.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No donation history yet</p>
                  <p className="text-gray-500 text-sm mt-2">Your completed and rejected donations will appear here</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
