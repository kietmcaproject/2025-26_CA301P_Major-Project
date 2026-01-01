"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, AlertCircle, CheckCircle, Droplet, Heart } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

export default function HospitalRequestsMap({
  hospitalRequests,
  donorLocation,
}: {
  hospitalRequests: any[];
  donorLocation?: { lat: number; lng: number } | null;
}) {
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Haversine formula to calculate distance
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
    return Math.round(R * c * 10) / 10;
  };

  // Filter hospital requests by distance when donor location is available
  useEffect(() => {
    if (donorLocation && hospitalRequests && hospitalRequests.length > 0) {
      const requestsWithDistance = hospitalRequests
        .map((request) => {
          if (
            request.location &&
            request.location.latitude &&
            request.location.longitude
          ) {
            const distance = calculateDistance(
              donorLocation.lat,
              donorLocation.lng,
              request.location.latitude,
              request.location.longitude
            );
            return { ...request, distance: Math.round(distance * 10) / 10 };
          }
          // Include requests even if location not available (distance will be null)
          // This ensures hospitals without saved location still appear on map
          return { ...request, distance: null };
        })
        .filter(
          (r): r is any =>
            r !== null && (r.distance === null || r.distance <= 50)
        )
        .sort((a, b) => {
          // Sort by distance if available, otherwise put at end
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

      setFilteredRequests(requestsWithDistance);
      console.log("[HospitalRequestsMap] Filtered requests:", requestsWithDistance);
    }
  }, [donorLocation, hospitalRequests]);

  const mapRequests =
    filteredRequests.length > 0
      ? filteredRequests
          .filter((r) => r.location && r.location.latitude && r.location.longitude) // Only map requests with valid locations
          .map((r) => ({
            location: r.location,
            name: r.hospital || "Hospital",
            notes: `${r.unitsNeeded || "?"} units — ${r.bloodType || "?"}`,
          }))
      : [];

  return (
    <div className="space-y-0">
      {/* Map Section with Sidebar */}
      {filteredRequests.length > 0 ? (
        <>
          {/* Show map only if there are requests with valid locations */}
          {mapRequests.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Map - Left Side (2/3 width) */}
              <div className="md:col-span-2">
                <div className="rounded-2xl overflow-hidden shadow-lg h-96 border-2 border-red-100 relative z-0">
                  <LeafletMap
                    hospitals={mapRequests}
                    activeDonors={[]}
                    currentLocation={donorLocation}
                  />
                </div>
              </div>

              {/* Hospital Requests List - Right Sidebar (1/3 width) */}
              <div className="space-y-3 max-h-96 overflow-y-auto relative z-10">
                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">🩸 Requests Near You</p>
                  <p className="text-sm text-gray-600 mt-2">{filteredRequests.filter((r: any) => r.distance !== null).length} hospital requests found within 0-50 km</p>
                  {donorLocation && (
                    <p className="text-xs text-gray-500 mt-2">Your Location: {donorLocation.lat.toFixed(4)}, {donorLocation.lng.toFixed(4)}</p>
                  )}
                </div>

                {filteredRequests
                  .filter((r: any) => r.distance !== null)
                  .map((request: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => setSelectedRequest(request)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                        selectedRequest?._id === request._id
                          ? "bg-red-100 border-red-600 shadow-lg"
                          : "bg-gradient-to-r from-white to-red-50 border-red-200 hover:border-red-400 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{request.hospital}</h3>
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shrink-0 ml-1">
                          {request.distance?.toFixed(1) || "0"} km
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-600 mb-3">
                        {request.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{request.phone}</span>
                          </div>
                        )}
                        {request.location?.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="line-clamp-1">{request.location.address}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mb-3">
                        <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                          {request.bloodType || "?"}
                        </span>
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                          {request.unitsNeeded || "?"} units
                        </span>
                      </div>

                      {/* Action Buttons - Show when selected */}
                      {selectedRequest?._id === request._id && (
                        <div className="mt-4 pt-4 space-y-3 border-t-2 border-red-200">
                          <Link
                            href={`/donor/schedule-donation?requestId=${request._id}&hospital=${encodeURIComponent(
                              request.hospital || ""
                            )}&units=${request.unitsNeeded}&bloodType=${request.bloodType}`}
                            className="block"
                          >
                            <button className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Confirm & Schedule
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              alert("Request rejected");
                              setSelectedRequest(null);
                            }}
                            className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Reject Request
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Show list of requests without location data */}
          {filteredRequests.some((r: any) => r.distance === null) && (
            <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
              <p className="text-sm font-semibold text-amber-800 mb-4">📍 Hospitals without location data:</p>
              <div className="grid gap-3">
                {filteredRequests
                  .filter((r: any) => r.distance === null)
                  .map((request: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => setSelectedRequest(request)}
                      className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                        selectedRequest?._id === request._id
                          ? "bg-amber-100 border-amber-600 shadow-lg"
                          : "bg-white border-amber-100 hover:border-amber-400"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{request.hospital}</h3>
                        <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">No Location</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-red-100 text-red-700 font-semibold px-2 py-1 rounded">
                          {request.bloodType || "?"}
                        </span>
                        <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded">
                          {request.unitsNeeded || "?"} units
                        </span>
                      </div>

                      {selectedRequest?._id === request._id && (
                        <div className="mt-3 pt-3 space-y-2 border-t border-amber-200">
                          <Link
                            href={`/donor/schedule-donation?requestId=${request._id}&hospital=${encodeURIComponent(
                              request.hospital || ""
                            )}&units=${request.unitsNeeded}&bloodType=${request.bloodType}`}
                            className="block"
                          >
                            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded font-bold text-sm transition flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Schedule Donation
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      ) : donorLocation ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            No hospital requests found
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Check back later for new blood requests from hospitals
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Share your location to see nearby hospital requests
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
