"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { DONOR } from "@/lib/api-endpoints";

export default function DonorStatsPage() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalUnits: 0,
    lastDonationDate: "",
    nextEligibleDate: "",
    mostDonatedBloodType: "",
  });

  const [donorId, setDonorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // STEP 1 — Decode JWT to get donor ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setDonorId(decoded.userId);
    }
  }, []);

  // STEP 2 — Fetch donation history and calculate stats
  useEffect(() => {
    if (!donorId) return;

    fetch(DONOR.donationHistory(donorId))
      .then((res) => res.json())
      .then((data) => {
        const donations = data.donations || [];

        if (donations.length === 0) {
          setStats({
            totalDonations: 0,
            totalUnits: 0,
            lastDonationDate: "N/A",
            nextEligibleDate: "Eligible Now",
            mostDonatedBloodType: "N/A",
          });
          setLoading(false);
          return;
        }

        // Total donations
        const totalDonations = donations.length;

        // Units donated
        const totalUnits = donations.reduce((sum: number, d: any) => sum + d.units, 0);

        // Most recent donation
        const lastDonation = donations[0]; // sorted from newest to oldest
        const lastDate = lastDonation.date?.slice(0, 10) || "N/A";

        // Next eligible donation date (every 90 days)
        const nextEligible = new Date(lastDonation.date);
        nextEligible.setDate(nextEligible.getDate() + 90);

        const nextEligibleDate = nextEligible.toISOString().slice(0, 10);

        // Most donated blood type
        const bloodCount: any = {};
        donations.forEach((donation: any) => {
          if (!bloodCount[donation.bloodType]) {
            bloodCount[donation.bloodType] = 0;
          }
          bloodCount[donation.bloodType] += 1;
        });

        const mostDonatedBloodType =
          Object.entries(bloodCount).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A";

        // Set calculated stats
        setStats({
          totalDonations,
          totalUnits,
          lastDonationDate: lastDate,
          nextEligibleDate,
          mostDonatedBloodType,
        });

        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [donorId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Donation Statistics</h1>

      {loading ? (
        <p className="text-gray-600">Loading stats...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Total Donations */}
          <StatCard title="Total Donations" value={stats.totalDonations} color="red" />

          {/* Total Units Donated */}
          <StatCard title="Total Units Donated" value={stats.totalUnits} color="green" />

          {/* Last Donation Date */}
          <StatCard title="Last Donation Date" value={stats.lastDonationDate} color="blue" />

          {/* Next Eligible Date */}
          <StatCard title="Next Eligible Donation" value={stats.nextEligibleDate} color="purple" />

          {/* Most Donated Blood Type */}
          <StatCard title="Most Donated Blood Type" value={stats.mostDonatedBloodType} color="yellow" />
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: any;
  color: string;
}) {
  const bg = {
    red: "bg-red-100 text-red-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    yellow: "bg-yellow-100 text-yellow-700",
  }[color];

  return (
    <div className={`p-6 rounded-xl shadow bg-white border-l-4 ${bg}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
