"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRequest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: "O+",
    unitsNeeded: 1,
    urgency: "MODERATE",
    patientName: "",
    patientAge: "",
    reason: "",
  });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "unitsNeeded" || name === "patientAge" ? parseInt(value) : value,
    }));
  };

  const captureLocation = () => {
    if (!navigator.geolocation) return alert("Your browser does not support geolocation");
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocLoading(false);
        alert("📍 Location captured for this request");
      },
      (err) => {
        setLocLoading(false);
        if (err.code === 1) alert("Please allow location access to capture hospital coordinates");
        else alert("Unable to get location: " + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      // Get hospitalId from user data - could be userId or hospitalId
      const hospitalId = user?._id || user?.id || user?.hospitalId;
      const hospitalName = user?.fullName || user?.name;

      if (!hospitalId) {
        alert("❌ Hospital ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      if (!hospitalName) {
        alert("❌ Hospital name not found. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/request/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodType: formData.bloodType,
          unitsNeeded: formData.unitsNeeded,
          hospital: hospitalName,
          urgency: formData.urgency,
          // map form patient field to backend recipientName so it persists
          recipientName: formData.patientName || null,
          locationKm: 10, // Default radius (can be adjusted)
          // include explicit coordinates when available so donors can see request on map
          location: location ? { latitude: location.latitude, longitude: location.longitude } : undefined,
          requestedBy: hospitalId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Blood request created successfully!");
        router.push("/hospital/dashboard");
      } else {
        alert("❌ Error: " + (data.message || "Could not create request"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Network error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-white via-red-50 to-white">
      {/* HEADER */}
      <header className="bg-linear-to-r from-red-600 to-red-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/hospital/dashboard" className="hover:bg-red-500 p-2 rounded-lg transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 fill-white" />
            <h1 className="text-3xl font-bold">Create Blood Request</h1>
          </div>
        </div>
      </header>

      {/* FORM */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BLOOD TYPE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Type *</label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                title="Blood Type Selection"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* UNITS NEEDED */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Units Needed *</label>
              <input
                type="number"
                name="unitsNeeded"
                min="1"
                max="10"
                value={formData.unitsNeeded}
                onChange={handleChange}
                placeholder="Enter units needed"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* URGENCY */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level *</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                title="Urgency Level Selection"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* PATIENT NAME */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="Enter patient name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* PATIENT AGE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Age</label>
              <input
                type="number"
                name="patientAge"
                min="0"
                max="120"
                value={formData.patientAge}
                onChange={handleChange}
                placeholder="Enter patient age"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* REASON */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Request</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g., Emergency surgery, accident, chronic condition..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* SUBMIT */}
            {/* LOCATION CAPTURE + SUBMIT */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={locLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
                >
                  {locLoading ? "Capturing..." : "Capture Location"}
                </button>
                {location && (
                  <span className="ml-3 text-sm text-gray-600">📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                )}
              </div>

              <div className="flex-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Request"}
              </button>
              <Link
                href="/hospital/dashboard"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-lg text-center transition"
              >
                Cancel
              </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
