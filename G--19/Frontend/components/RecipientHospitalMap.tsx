"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Phone, Hospital, Navigation } from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

// Function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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
  return R * c;
};

export default function RecipientHospitalMap({ recipientLocation }: any) {
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientLat, setRecipientLat] = useState(recipientLocation?.latitude || 21.1466);
  const [recipientLon, setRecipientLon] = useState(recipientLocation?.longitude || 79.0889);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Update location when prop changes and refetch hospitals
  useEffect(() => {
    if (recipientLocation && recipientLocation.latitude && recipientLocation.longitude) {
      console.log("[RecipientHospitalMap] Location updated from prop:", recipientLocation);
      setRecipientLat(recipientLocation.latitude);
      setRecipientLon(recipientLocation.longitude);
      // Clear error when location changes so we fetch again
      setError(null);
    }
  }, [recipientLocation]);

  // Get user location if not provided by prop
  useEffect(() => {
    if (!recipientLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("[RecipientHospitalMap] Got geolocation:", position.coords);
          setRecipientLat(position.coords.latitude);
          setRecipientLon(position.coords.longitude);
        },
        (error) => {
          console.log("[RecipientHospitalMap] Geolocation error - using default location:", error);
        }
      );
    }
  }, [recipientLocation]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("[RecipientHospitalMap] Fetching hospitals for location:", { recipientLat, recipientLon });
        
        const response = await fetch("http://localhost:5000/hospital/all");
        console.log("[RecipientHospitalMap] Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("[RecipientHospitalMap] Hospital API Response:", data);

        if (data.success && data.hospitals && data.hospitals.length > 0) {
          // Calculate distance for each hospital
          const hospitalsWithDistance = data.hospitals.map((hospital: any) => {
            const hospitalLat = hospital.location?.latitude || 21.1466;
            const hospitalLon = hospital.location?.longitude || 79.0889;
            
            const distance = calculateDistance(
              recipientLat,
              recipientLon,
              hospitalLat,
              hospitalLon
            );
            
            console.log(`[RecipientHospitalMap] Hospital: ${hospital.hospitalName}, Distance: ${distance} km`);
            
            return {
              ...hospital,
              distance: distance.toFixed(2),
            };
          });

          // Filter hospitals within 0-50 km radius (increased from 20 km)
          const nearbyHospitals = hospitalsWithDistance.filter((h: any) => {
            const dist = parseFloat(h.distance);
            return dist >= 0 && dist <= 50;
          });

          console.log("[RecipientHospitalMap] Nearby hospitals found:", nearbyHospitals.length);

          // Sort by distance
          nearbyHospitals.sort((a: any, b: any) => 
            parseFloat(a.distance) - parseFloat(b.distance)
          );

          if (nearbyHospitals.length === 0) {
            // Don't show error, just empty state - hospitals may not have saved locations
            setError(null);
            setHospitals([]); 
          } else {
            setError(null); // Clear error when hospitals are found
            setHospitals(nearbyHospitals);
            console.log("[RecipientHospitalMap] Successfully loaded", nearbyHospitals.length, "hospitals");
          }
        } else {
          setError(null);
          setHospitals([]);
          console.log("[RecipientHospitalMap] No hospitals data:", data);
        }
      } catch (error) {
        console.error("[RecipientHospitalMap] Error fetching hospitals:", error);
        setError(`Failed to fetch hospitals: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitals();
  }, [recipientLat, recipientLon]);

  // Prepare hospital data for map - use proper structure for LeafletMap
  const hospitalsForMap = hospitals.map((hospital: any) => ({
    location: {
      latitude: hospital.location?.latitude || 21.1466,
      longitude: hospital.location?.longitude || 79.0889
    },
    fullName: hospital.hospitalName || "Hospital",
    bloodType: hospital.bloodType || "Hospital",
  }));

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <Hospital className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-blue-700">Nearby Hospitals</h2>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-semibold">Loading hospitals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <Hospital className="w-8 h-8 text-red-600" />
          <h2 className="text-3xl font-bold text-red-700">Nearby Hospitals</h2>
        </div>
        <div className="text-center py-12 bg-red-50 rounded-xl border-2 border-red-200">
          <Hospital className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">No hospital on your location</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <Hospital className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-blue-700">Nearby Hospitals</h2>
      </div>

      {hospitals.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-xl">
          <MapPin className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">No hospitals found nearby</p>
          <p className="text-sm text-gray-500 mt-2">Hospitals may not have saved their locations yet. Check back later.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="md:col-span-2">
            <div className="rounded-xl overflow-hidden shadow-lg h-96 border-2 border-blue-100">
              <LeafletMap
                hospitals={hospitalsForMap}
                currentLocation={{ latitude: recipientLat, longitude: recipientLon }}
              />
            </div>
          </div>

          {/* Hospital List Section */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-600">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">📍 Hospitals Near You</p>
              <p className="text-sm text-gray-600 mt-1">{hospitals.length} hospitals found within 0-20 km</p>
              {hospitals.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">Your Location: {recipientLat.toFixed(4)}, {recipientLon.toFixed(4)}</p>
              )}
            </div>

            {hospitals.map((hospital: any, index: number) => (
              <div
                key={index}
                onClick={() => setSelectedHospital(hospital)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                  selectedHospital?.id === hospital.id
                    ? "bg-blue-100 border-blue-600 shadow-lg"
                    : "bg-gradient-to-r from-white to-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{hospital.hospitalName}</h3>
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-1">
                    {hospital.distance} km
                  </span>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  {hospital.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="truncate">{hospital.phone}</span>
                    </div>
                  )}
                  {hospital.location?.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{hospital.location.address}</span>
                    </div>
                  )}
                </div>

                {/* Distance Bar */}
                <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                    style={{
                      width: `${Math.max(
                        10,
                        100 - (parseFloat(hospital.distance) / Math.max(...hospitals.map((h: any) => parseFloat(h.distance)))) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {hospital.distance} km away
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Hospital Details */}
      {selectedHospital && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-600">
          <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
            <Hospital className="w-5 h-5" />
            {selectedHospital.hospitalName}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Distance from You</p>
              <p className="text-2xl font-bold text-blue-700">{selectedHospital.distance} <span className="text-lg text-gray-600">km</span></p>
            </div>
            
            {selectedHospital.phone && (
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Contact
                </p>
                <a
                  href={`tel:${selectedHospital.phone}`}
                  className="text-lg font-bold text-blue-700 hover:underline"
                >
                  {selectedHospital.phone}
                </a>
              </div>
            )}
          </div>

          {selectedHospital.location?.address && (
            <div className="mt-4">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Address
              </p>
              <p className="text-gray-700">{selectedHospital.location.address}</p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                if (selectedHospital.phone) {
                  window.location.href = `tel:${selectedHospital.phone}`;
                }
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Hospital
            </button>
            <button
              onClick={() => {
                if (selectedHospital.location) {
                  window.open(
                    `https://maps.google.com/?q=${selectedHospital.location.latitude},${selectedHospital.location.longitude}`,
                    "_blank"
                  );
                }
              }}
              className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
