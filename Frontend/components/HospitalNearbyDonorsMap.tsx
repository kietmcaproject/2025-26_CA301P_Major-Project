"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, AlertCircle, CheckCircle, User, Phone } from "lucide-react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

export default function HospitalNearbyDonorsMap({
  hospitalLocation,
}: {
  hospitalLocation?: { latitude: number; longitude: number } | null;
}) {
  const [donors, setDonors] = useState<any[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<any[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hospitalLoc, setHospitalLoc] = useState<{
    lat: number;
    lng: number;
  } | null>(
    hospitalLocation
      ? { lat: hospitalLocation.latitude, lng: hospitalLocation.longitude }
      : null
  );

  // Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Fetch available donors
  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/donor/available");
      const data = await response.json();

      if (data.success && Array.isArray(data.donors)) {
        console.log("[HospitalNearbyDonorsMap] Donors fetched:", data.donors);
        setDonors(data.donors);
        setError(null);
      } else {
        setError("No available donors found");
        setDonors([]);
      }
    } catch (err) {
      console.error("[HospitalNearbyDonorsMap] Error fetching donors:", err);
      setError("Failed to load donors");
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  // Load donors on mount
  useEffect(() => {
    fetchDonors();
  }, []);

  // Filter donors by distance when hospital location is available
  useEffect(() => {
    if (hospitalLoc && donors.length > 0) {
      const donorsWithDistance = donors
        .map((donor) => {
          if (donor.location && donor.location.latitude && donor.location.longitude) {
            const distance = calculateDistance(
              hospitalLoc.lat,
              hospitalLoc.lng,
              donor.location.latitude,
              donor.location.longitude
            );
            return { ...donor, distance };
          }
          return null;
        })
        .filter((d): d is any => d !== null && d.distance >= 0 && d.distance <= 20)
        .sort((a, b) => a.distance - b.distance);

      console.log("[HospitalNearbyDonorsMap] Filtered donors:", donorsWithDistance);
      setFilteredDonors(donorsWithDistance);

      if (donorsWithDistance.length === 0 && donors.length > 0) {
        setError("No available donors within 20 km radius");
      }
    }
  }, [hospitalLoc, donors]);

  const mapDonors =
    filteredDonors.length > 0
      ? filteredDonors.map((d) => ({
          location: d.location,
          name: d.fullName || d.name || "Donor",
          notes: d.bloodType || "No blood type",
        }))
      : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <Navigation className="w-8 h-8" />
          Available Donors Nearby
        </h2>
        <button
          onClick={fetchDonors}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Refresh Donors
        </button>
      </div>

      {/* Location Status Banner */}
      {hospitalLoc && (
        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Location Active</p>
            <p className="text-sm text-green-700">
              Showing available donors within 20 km radius
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && filteredDonors.length === 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">No Donors Available</p>
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        </div>
      )}

      {/* Map Section */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading available donors...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 overflow-hidden">
          <div style={{ height: "500px" }} className="w-full">
            <LeafletMap
              hospitals={[]}
              activeDonors={mapDonors}
              currentLocation={hospitalLoc}
            />
          </div>
        </div>
      )}

      {/* Donor List with Details */}
      {filteredDonors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDonors.map((donor, index) => (
            <div
              key={index}
              onClick={() => setSelectedDonor(donor)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition ${
                selectedDonor?._id === donor._id
                  ? "border-red-600 bg-red-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-red-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {donor.fullName || donor.name || "Donor"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Blood Type: <span className="font-semibold text-red-600">{donor.bloodType || "Unknown"}</span>
                  </p>
                </div>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {donor.distance} km
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {donor.email && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>{donor.email}</span>
                  </div>
                )}
                {donor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{donor.phone}</span>
                  </div>
                )}
                {donor.availability && (
                  <div className="mt-2">
                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      ✓ Available
                    </span>
                  </div>
                )}
              </div>

              {selectedDonor?._id === donor._id && (
                <div className="mt-4 pt-4 border-t-2 border-red-200">
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition">
                    Contact Donor
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDonors.length === 0 && !error && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            No available donors found in your area yet
          </p>
        </div>
      )}
    </div>
  );
}
