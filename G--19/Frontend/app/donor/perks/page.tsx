"use client";

import { useState, useEffect } from "react";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DonorPerks() {
  const [perks, setPerks] = useState<any[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [lastCheckupDate, setLastCheckupDate] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setPerks(user.perks || []);
      setTotalDonations(user.totalDonations || 0);
      setLastCheckupDate(user.lastHealthCheckupDate ? new Date(user.lastHealthCheckupDate).toLocaleDateString() : null);
    }

    // Listen for updates
    const handleUserUpdate = (event: any) => {
      const updatedUser = event.detail;
      setPerks(updatedUser.perks || []);
      setTotalDonations(updatedUser.totalDonations || 0);
      setLastCheckupDate(updatedUser.lastHealthCheckupDate ? new Date(updatedUser.lastHealthCheckupDate).toLocaleDateString() : null);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("user-updated", handleUserUpdate);
      return () => window.removeEventListener("user-updated", handleUserUpdate);
    }
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-br from-white via-red-50 to-white">
      <header className="bg-red-600 text-white p-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/donor/dashboard" className="hover:opacity-80 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Heart className="w-8 h-8 fill-white" />
          <h1 className="text-2xl font-bold">My Donor Rewards</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">

          {/* Rewards Overview */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-5 rounded-xl border-2 border-purple-400 shadow-lg">
              <p className="text-sm text-purple-700 font-semibold">Total Donations</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{totalDonations}</p>
              <p className="text-xs text-purple-600 mt-1">🏆 Keep donating for more rewards</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-5 rounded-xl border-2 border-blue-400 shadow-lg">
              <p className="text-sm text-blue-700 font-semibold">Last Checkup</p>
              <p className="text-lg font-bold text-blue-900 mt-2">{lastCheckupDate || "No checkups yet"}</p>
              <p className="text-xs text-blue-600 mt-1">📅 Available every 90 days</p>
            </div>
          </div>

          {/* Available Perks */}
          {perks && perks.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-lg">📋 Your Health Perks</h3>
              {perks.map((perk: any, idx: number) => {
                const expiryDate = new Date(perk.expiryDate);
                const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isExpired = perk.status === "expired" || daysLeft < 0;
                const isUsed = perk.status === "used";
                const isAvailable = perk.status === "available" && !isExpired;

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-xl border-2 shadow-md transition-all ${
                      isAvailable
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400"
                        : isUsed
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"
                        : "bg-gradient-to-r from-red-50 to-orange-50 border-red-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🏥</span>
                          <h4 className="font-bold text-gray-800 text-lg">{perk.title}</h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isAvailable
                                ? "bg-green-200 text-green-800"
                                : isUsed
                                ? "bg-gray-300 text-gray-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {isAvailable ? "Available" : isUsed ? "Used" : "Expired"}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{perk.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-semibold">💉 Includes:</span>
                            <span className="text-gray-800 font-bold">Blood Test, BP/Sugar Test</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-semibold">📅 Valid Until:</span>
                            <span className="text-gray-800 font-bold">{new Date(perk.expiryDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-semibold">⏰ Time Left:</span>
                            <span className={`font-bold ${isAvailable ? "text-green-700" : "text-red-700"}`}>
                              {isAvailable ? `${daysLeft} days` : "Expired"}
                            </span>
                          </div>
                          {isUsed && perk.claimedAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-semibold">✅ Used At:</span>
                              <span className="text-gray-800 font-bold">{perk.claimedAt}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isAvailable && (
                      <div className="mt-4 p-3 bg-white rounded-lg border-2 border-green-300">
                        <p className="text-xs text-green-700 font-semibold">
                          ✨ Visit any hospital partner to claim your free health checkup within 7 days!
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 text-center">
              <p className="text-blue-800 font-semibold mb-2">💝 No perks yet</p>
              <p className="text-blue-700 text-sm">
                Complete a blood donation to unlock your first free health checkup perk! 
                Every 90 days you're eligible for another checkup.
              </p>
            </div>
          )}

          {/* Program Details */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5 border-2 border-orange-400">
            <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              ℹ️ How Our Donor Rewards Work
            </h3>
            <ul className="space-y-2 text-sm text-orange-900">
              <li className="flex gap-2">
                <span className="font-bold">1️⃣</span>
                <span>Every successful blood donation earns you a <strong>FREE HEALTH CHECKUP</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2️⃣</span>
                <span>Valid for <strong>7 days</strong> after your donation is completed</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3️⃣</span>
                <span>Includes: Blood Test, BP Test, Sugar Test</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4️⃣</span>
                <span>You can claim one checkup every <strong>90 days</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">5️⃣</span>
                <span>Visit any hospital partner to redeem your perk</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </main>
  );
}
