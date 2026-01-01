"use client";

import dynamic from "next/dynamic";
import React from "react";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

export default function HospitalMap({ activeDonors }: any) {
  return (
    <div className="w-full h-full relative" style={{ position: "relative" }}>
      <LeafletMap activeDonors={activeDonors} />
    </div>
  );
}
