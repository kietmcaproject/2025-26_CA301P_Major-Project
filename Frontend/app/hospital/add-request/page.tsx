"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

type TokenPayload = {
  userId?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

export default function AddRequestPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    bloodType: "O+",
    unitsNeeded: "",
    urgency: "LOW",
    hospital: "",
    locationKm: "",
  });

  const [loading, setLoading] = useState(false);
  const [requestedBy, setRequestedBy] = useState<string | null>(null);

  // Try to get hospital ID from JWT; fallback to localStorage.userId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);
        if (decoded?.userId) {
          setRequestedBy(decoded.userId);
          return;
        }
      } catch (err) {
        // ignore
      }
    }

    const fallback = localStorage.getItem("userId");
    if (fallback) setRequestedBy(fallback);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const { bloodType, unitsNeeded, urgency, hospital, locationKm } = formData;
    if (!bloodType || !unitsNeeded || !urgency || !hospital || !locationKm) {
      alert("Please fill all fields.");
      return;
    }

    if (!requestedBy) {
      alert("Hospital identity not found. Please login again.");
      return;
    }

    const payload = {
      bloodType,
      unitsNeeded: Number(unitsNeeded),
      hospital,
      urgency,
      locationKm: Number(locationKm),
      requestedBy,
    };

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/request/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert("Error: " + (data.message || data.error || "Failed to create request."));
        setLoading(false);
        return;
      }

      alert("Blood request created successfully!");
      // optionally navigate to hospital dashboard or request list
      router.push("/hospital/dashboard");
    } catch (err) {
      console.error(err);
      alert("Network or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white p-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-xl shadow-lg flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 fill-white" />
          <h1 className="text-3xl font-bold">Add New Blood Request</h1>
        </div>

        <Link
          href="/hospital/dashboard"
          className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-10 border-l-4 border-red-600">
        <div className="flex items-center gap-3 mb-6">
          <Plus className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-red-700">Request Details</h2>
        </div>

        <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blood Type */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Blood Type</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Units Needed */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Units Needed</label>
            <input
              type="number"
              min={1}
              name="unitsNeeded"
              value={formData.unitsNeeded}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Number of units"
              required
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Urgency Level</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="LOW">Low</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Hospital Name */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Hospital Name</label>
            <input
              type="text"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Hospital name"
              required
            />
          </div>

          {/* Distance */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Distance (km)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              name="locationKm"
              value={formData.locationKm}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Distance radius to search donors"
              required
            />
          </div>

          {/* Full width submit */}
          <div className="md:col-span-2 flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:from-red-700 hover:to-red-800 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        {/* small note */}
        <p className="mt-6 text-sm text-gray-600">
          Note: request will be visible to donors nearby based on urgency and distance.
        </p>
      </div>
    </main>
  );
}
