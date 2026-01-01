"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function DonorMap({ donors }: any) {
  return (
    <MapContainer
      center={[28.6139, 77.2090]} // default Delhi
      zoom={12}
      style={{ height: "300px", width: "100%", borderRadius: "10px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {donors.map((d: any, i: number) => (
        <Marker key={i} position={[d.latitude, d.longitude]}>
          <Popup>
            <b>{d.fullName}</b> <br />
            {d.bloodType}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
