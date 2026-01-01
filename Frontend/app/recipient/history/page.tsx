"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Heart, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function RecipientHistory() {
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("Recipient");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setRecipientId(user._id || user.id || null);
      setRecipientName(user.fullName || "Recipient");
    }
    // fallback: try to decode token
    if (!stored) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const d: any = jwtDecode(token);
          setRecipientId(d.userId || d._id || null);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Fetch request history
  useEffect(() => {
    if (!recipientId) return;

    fetch("http://localhost:5000/request/all")
      .then((res) => res.json())
      .then((data) => {
        const all = data.requests || [];
        // Filter only requests made by THIS recipient
        const myRequests = all.filter(
          (req: any) => req.requestedBy === recipientId
        );
        setRequests(myRequests);
      })
      .catch((err) => console.error("Error fetching history:", err))
      .finally(() => setLoading(false));
  }, [recipientId]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Fulfilled":
        return "bg-green-50 border-green-300 text-green-700";
      case "Pending":
        return "bg-orange-50 border-orange-300 text-orange-700";
      default:
        return "bg-gray-50 border-gray-300 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/recipient/dashboard" className="hover:opacity-80 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Heart className="w-8 h-8 fill-white" />
          <h1 className="text-2xl font-bold">Blood Request History</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Loading history...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-red-200 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No blood requests yet</p>
              <Link
                href="/recipient/create-request"
                className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition"
              >
                Create New Request
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                <Heart className="w-6 h-6 fill-red-600" />
                All Blood Requests
              </h2>

              <div className="grid gap-4">
                {requests.map((req: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-xl border-2 hover:shadow-lg transition ${getStatusColor(req.status)}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {req.bloodType} Blood Type
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white bg-opacity-60">
                        {req.status === "Fulfilled" ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-600">Fulfilled</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-5 h-5 text-orange-600" />
                            <span className="font-bold text-orange-600">Pending</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 border-t pt-4">
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Units Needed</p>
                        <p className="text-2xl font-bold text-red-600">{req.unitsNeeded}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Hospital</p>
                        <p className="text-lg font-semibold text-gray-800">{req.hospital || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Urgency</p>
                        <p className="text-lg font-semibold text-orange-600">{req.urgency || "MODERATE"}</p>
                      </div>
                    </div>

                    {/* Status Details */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-600 font-bold uppercase mb-2">Request Status</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${req.status === "Fulfilled" ? "bg-green-600" : "bg-orange-400"}`}></div>
                          <span className="text-gray-700">
                            {req.status === "Fulfilled" ? "Request Fulfilled" : "Awaiting Donation"}
                          </span>
                        </div>
                        {req.status === "Fulfilled" && (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-green-600"></div>
                              <span className="text-gray-700">Donor Matched</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-green-600"></div>
                              <span className="text-gray-700">Blood Delivered</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
