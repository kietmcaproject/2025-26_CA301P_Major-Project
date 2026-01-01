"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Droplet, MapPin, Bell } from "lucide-react";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/donor/requests")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.requests || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching requests:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-white via-red-50 to-white">
      <h1 className="text-3xl font-bold text-red-700 mb-6 flex gap-2 items-center">
        <Bell className="w-7 h-7 text-red-700" /> Urgent Blood Requests
      </h1>

      {loading ? (
        <p className="text-gray-600">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">No urgent requests found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">

          {requests.map((req: any, index: number) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600">

              {/* Hospital Name */}
              <h2 className="text-xl font-bold text-red-700">{req.hospital}</h2>

              {/* Distance */}
              <p className="flex gap-2 items-center text-gray-600 text-sm mt-1">
                <MapPin className="w-4 h-4 text-red-500" />
                {req.locationKm} km away
              </p>

              {/* Blood Type | Units */}
              <div className="flex justify-between items-center mt-4">
                <span className="flex gap-1 items-center text-red-700 font-semibold">
                  <Droplet className="w-4 h-4" />
                  {req.bloodType}
                </span>

                <span className="text-gray-800 font-semibold">
                  {req.unitsNeeded} units
                </span>
              </div>

              {/* Urgency */}
              <p className="text-sm text-gray-600 mt-2">
                Urgency:{" "}
                <span
                  className={
                    req.urgency === "HIGH"
                      ? "text-red-600 font-bold"
                      : req.urgency === "MODERATE"
                      ? "text-yellow-600 font-bold"
                      : "text-green-600 font-bold"
                  }
                >
                  {req.urgency}
                </span>
              </p>

              {/* Schedule Donation Button */}
              <Link
                href={`/donor/schedule-donation?requestId=${req._id}&hospital=${encodeURIComponent(
                  req.hospital
                )}&units=${req.unitsNeeded}&bloodType=${req.bloodType}`}
              >
                <button className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg shadow font-semibold">
                  Schedule Donation
                </button>
              </Link>

            </div>
          ))}

        </div>
      )}
    </main>
  );
}
