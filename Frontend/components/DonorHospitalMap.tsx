"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, AlertCircle, CheckCircle, Navigation } from "lucide-react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

export default function DonorHospitalMap({ donorLocation }: { donorLocation?: { lat: number; lng: number } | null }) {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    donorLocation || null
  );

  // Haversine formula to calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  };

  // Fetch hospitals with valid locations
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/hospital/all");
      const data = await response.json();

      if (data.success && Array.isArray(data.hospitals)) {
        console.log("[DonorHospitalMap] Hospitals fetched:", data.hospitals);
        setHospitals(data.hospitals);
        setError(null);
      } else {
        setError("No hospitals available");
        setHospitals([]);
      }
    } catch (err) {
      console.error("[DonorHospitalMap] Error fetching hospitals:", err);
      setError("Failed to load hospitals");
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  // Request geolocation if not provided
  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported in your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        console.log("[DonorHospitalMap] Location obtained:", location);
      },
      (err) => {
        console.warn("[DonorHospitalMap] Geolocation error:", err);
        setError("Unable to get your location. Showing all hospitals.");
      }
    );
  };

  // Load hospitals on mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  // Filter hospitals by distance when location is available
  useEffect(() => {
    if (userLocation && hospitals.length > 0) {
      const hospitalsWithDistance = hospitals
        .map((hospital) => {
          if (
            hospital.location &&
            hospital.location.latitude &&
            hospital.location.longitude
          ) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              hospital.location.latitude,
              hospital.location.longitude
            );
            return { ...hospital, distance };
          }
          return null;
        })
        .filter(
          (h): h is any =>
            h !== null && h.distance >= 0 && h.distance <= 20
        )
        .sort((a, b) => a.distance - b.distance);

      console.log("[DonorHospitalMap] Filtered hospitals:", hospitalsWithDistance);
      setFilteredHospitals(hospitalsWithDistance);

      if (hospitalsWithDistance.length === 0) {
        setError("No hospitals found within 20 km radius");
      }
    }
  }, [userLocation, hospitals]);

  const handleCreateTestHospitals = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/hospital/seed-hospitals",
        { method: "POST" }
      );
      const data = await response.json();
      if (data.success) {
        alert("Test hospitals created successfully!");
        fetchHospitals();
      }
    } catch (err) {
      console.error("Error creating test hospitals:", err);
      alert("Failed to create test hospitals");
    }
  };

  const mapHospitals =
    filteredHospitals.length > 0
      ? filteredHospitals.map((h) => ({
          location: h.location,
          name: h.fullName || h.name || "Hospital",
          notes: h.phone || "No contact info",
        }))
      : [];

  return (
    <div className="space-y-6">
      {/* Header with action button */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <MapPin className="w-8 h-8" />
          Nearby Hospitals to Donate
        </h2>
        {!userLocation && (
          <button
            onClick={requestGeolocation}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Navigation className="w-4 h-4" />
            Find Nearby
          </button>
        )}
      </div>

      {/* Location Status Banner */}
      {userLocation && (
        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Location Detected</p>
            <p className="text-sm text-green-700">
              Showing hospitals within 20 km radius
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">No Hospitals Found</p>
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          </div>
          {hospitals.length === 0 && (
            <button
              onClick={handleCreateTestHospitals}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition"
            >
              Create Test Hospitals
            </button>
          )}
        </div>
      )}

      {/* Map Section */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading hospitals...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 overflow-hidden">
          <div style={{ height: "500px" }} className="w-full">
            <LeafletMap
              hospitals={mapHospitals}
              activeDonors={[]}
              currentLocation={userLocation}
            />
          </div>
        </div>
      )}

      {/* Hospital List with Details */}
      {filteredHospitals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHospitals.map((hospital, index) => (
            <div
              key={index}
              onClick={() => setSelectedHospital(hospital)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition ${
                selectedHospital?._id === hospital._id
                  ? "border-red-600 bg-red-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-red-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900">
                  {hospital.fullName || hospital.name || "Hospital"}
                </h3>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {hospital.distance} km
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {hospital.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>{hospital.phone}</span>
                  </div>
                )}
                {hospital.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>{hospital.address}</span>
                  </div>
                )}
                {hospital.operatingHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>{hospital.operatingHours}</span>
                  </div>
                )}
              </div>

              {selectedHospital?._id === hospital._id && (
                <div className="mt-4 pt-4 border-t-2 border-red-200">
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition">
                    View Blood Requests
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredHospitals.length === 0 && !error && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Share your location to find nearby hospitals
          </p>
        </div>
      )}
    </div>
  );
}
