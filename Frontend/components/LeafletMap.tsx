"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-leaflet components with no SSR
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

// Import useMap separately - will be used conditionally
let useMap: any = null;
if (typeof window !== "undefined") {
  import("react-leaflet").then((m) => {
    useMap = m.useMap;
  });
}

// Create marker icons once leaflet is available
const createMarkerIcon = (leaflet: any) => {
  return leaflet.divIcon({
    html: `<div style="
      background-color: #ef4444;
      border: 2px solid white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      font-weight: bold;
      color: white;
      font-size: 12px;
    ">♥</div>`,
    className: "custom-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const createHospitalIcon = (leaflet: any) => {
  return leaflet.divIcon({
    html: `<div style="
      background-color: #2563eb;
      border: 2px solid white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      font-weight: bold;
      color: white;
      font-size: 12px;
    ">H</div>`,
    className: "hospital-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12],
  });
};

// Map instance setter - simplified cleanup
const MapInstanceSetter = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod;
      return {
        default: () => {
          const map = useMap();
          useEffect(() => {
            // No-op - let React Leaflet handle cleanup
            return () => {};
          }, [map]);
          return null;
        },
      };
    }),
  { ssr: false }
);

export default function LeafletMap({ activeDonors = [], hospitals = [], currentLocation = null }: any) {
  const [isClient, setIsClient] = useState(false);
  const [leafletLib, setLeafletLib] = useState<any>(null);
  const [mapKey] = useState(() => `map-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load leaflet only on client to avoid window reference during SSR
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadLeaflet = async () => {
      const [leaflet] = await Promise.all([
        import("leaflet"),
        import("leaflet/dist/leaflet.css"),
      ]);
      setLeafletLib(leaflet.default || leaflet);
    };
    loadLeaflet();
  }, []);

  // Cleanup handled by React Leaflet - no manual intervention needed

  if (!isClient || !leafletLib) {
    return <div className="w-full h-full bg-gray-200" />;
  }

  const center: [number, number] =
    activeDonors && activeDonors.length > 0 && activeDonors[0]?.location
      ? [activeDonors[0].location.latitude, activeDonors[0].location.longitude]
      : [21.1466, 79.0889];

  // Validate and filter donors
  const validDonors = (activeDonors || []).filter((d: any) => 
    d?.location?.latitude && d?.location?.longitude
  );

  // Validate and filter hospitals
  const validHospitals = (hospitals || []).filter((h: any) => 
    h?.location?.latitude && h?.location?.longitude
  );

  // Helper: haversine distance (km)
  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  console.log("[LeafletMap] Rendering with:", { validDonors: validDonors.length, validHospitals: validHospitals.length });

  return (
    <div className="w-full h-full relative" key={mapKey}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
        key={mapKey}
      >
        <MapInstanceSetter />
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Render donor markers */}
        {validDonors.map((d: any, i: number) => (
          <Marker
            key={`donor-${i}`}
            position={[d.location.latitude, d.location.longitude]}
            icon={createMarkerIcon(leafletLib)}
          >
            <Popup>
              <div>
                <b>{d.fullName || "Donor"}</b> <br />
                Blood: {d.bloodType || "Unknown"}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render hospital markers */}
        {validHospitals.map((h: any, i: number) => {
          // compute distance if currentLocation available
          let distanceLabel = null;
          try {
            const cur = currentLocation;
            const curLat = cur?.lat ?? cur?.latitude ?? null;
            const curLon = cur?.lng ?? cur?.longitude ?? null;
            if (curLat != null && curLon != null && h.location && h.location.latitude != null && h.location.longitude != null) {
              const km = haversineKm(curLat, curLon, h.location.latitude, h.location.longitude);
              distanceLabel = `${km < 1 ? (km*1000).toFixed(0) + ' m' : km.toFixed(1) + ' km'}`;
            }
          } catch (e) {
            // ignore
          }

          return (
            <Marker
              key={`hospital-${i}`}
              position={[h.location.latitude, h.location.longitude]}
              icon={createHospitalIcon(leafletLib)}
            >
              <Popup>
                <div>
                  <b>{h.fullName || h.name || h.hospital || "Hospital"}</b> <br />
                  {h.notes && <div className="text-sm">{h.notes}</div>}
                  {distanceLabel && <div className="text-sm text-gray-600 mt-1">{distanceLabel} away</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
