"use client";

import { useState, useEffect } from "react";

export default function DonorPerksCard() {
  const [perks, setPerks] = useState<any[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [availablePerkCount, setAvailablePerkCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      const userPerks = user.perks || [];
      setPerks(userPerks);
      setTotalDonations(user.totalDonations || 0);
      
      // Count available perks
      const available = userPerks.filter((p: any) => {
        const expiryDate = new Date(p.expiryDate);
        return p.status === "available" && expiryDate > new Date();
      }).length;
      setAvailablePerkCount(available);
    }

    // Listen for user updates
    const handleUserUpdate = (event: any) => {
      const updatedUser = event.detail;
      const userPerks = updatedUser.perks || [];
      setPerks(userPerks);
      setTotalDonations(updatedUser.totalDonations || 0);
      
      const available = userPerks.filter((p: any) => {
        const expiryDate = new Date(p.expiryDate);
        return p.status === "available" && expiryDate > new Date();
      }).length;
      setAvailablePerkCount(available);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("user-updated", handleUserUpdate);
      return () => window.removeEventListener("user-updated", handleUserUpdate);
    }
  }, []);

  if (perks.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎁</span>
          <h3 className="text-lg font-bold text-blue-900">Donor Rewards</h3>
        </div>
        <p className="text-blue-700 text-sm mb-3">
          Donate blood to unlock exclusive health perks and rewards!
        </p>
        <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
          <p className="text-xs text-blue-800">
            ✨ Get a <strong>FREE HEALTH CHECKUP</strong> after every donation - valid for 7 days!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-400 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎁</span>
          <div>
            <h3 className="text-lg font-bold text-purple-900">Your Donor Rewards</h3>
            <p className="text-xs text-purple-700">
              {totalDonations} Donation{totalDonations !== 1 ? "s" : ""} • {availablePerkCount} Available Perk{availablePerkCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center border-2 border-purple-400 shadow-md">
          <p className="font-bold text-purple-900 text-lg">{availablePerkCount}</p>
        </div>
      </div>

      {availablePerkCount > 0 && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3 border-2 border-green-400 mb-4">
          <p className="text-sm font-bold text-green-800">
            ✅ You have {availablePerkCount} FREE HEALTH CHECKUP{availablePerkCount !== 1 ? "S" : ""} waiting to be claimed!
          </p>
          <p className="text-xs text-green-700 mt-1">Visit any hospital partner to redeem your perk</p>
        </div>
      )}

      <div className="space-y-2">
        {perks.slice(0, 2).map((perk: any, idx: number) => {
          const expiryDate = new Date(perk.expiryDate);
          const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isAvailable = perk.status === "available" && daysLeft > 0;

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg text-sm ${
                isAvailable
                  ? "bg-green-100 border-2 border-green-400"
                  : "bg-gray-100 border-2 border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-800">🏥 {perk.title}</p>
                  <p className="text-xs text-gray-700 mt-1">
                    {isAvailable ? `✅ Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}` : "❌ Expired"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ml-2 ${
                    isAvailable
                      ? "bg-green-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {isAvailable ? "Claim Now" : "Expired"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {perks.length > 2 && (
        <p className="text-xs text-purple-700 mt-3 text-center font-semibold">
          +{perks.length - 2} more perk{perks.length - 2 !== 1 ? "s" : ""} in your profile
        </p>
      )}
    </div>
  );
}
