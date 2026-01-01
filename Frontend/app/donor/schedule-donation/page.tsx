"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { MapPin, Phone, Calendar, Clock, FileText, AlertCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function ScheduleDonationPage() {
  const params = useSearchParams();

  const requestId = params.get("requestId");
  const hospital = params.get("hospital");
  const units = params.get("units");
  const bloodType = params.get("bloodType");

  const [donorId, setDonorId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [contact, setContact] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [lastDonationDate, setLastDonationDate] = useState<string | null>(null);
  const [nextEligibleDate, setNextEligibleDate] = useState<string | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [dateError, setDateError] = useState("");

  /* ------------------------------------
       LOAD DONOR ID FROM JWT TOKEN
  ------------------------------------ */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setDonorId(decoded.userId);
      
      // Load last donation date
      loadLastDonationDate(decoded.userId);
    }
  }, []);

  /* ------------------------------------
       LOAD LAST DONATION DATE & CHECK COOLDOWN
  ------------------------------------ */
  const loadLastDonationDate = async (donerId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/donor/last-donation/${donerId}`);
      const data = await res.json();
      
      if (data.success && data.lastDonationDate) {
        const lastDate = new Date(data.lastDonationDate);
        setLastDonationDate(lastDate.toISOString().split('T')[0]);
        
        // Calculate next eligible date (56 days later)
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + 56);
        const nextEligible = nextDate.toISOString().split('T')[0];
        setNextEligibleDate(nextEligible);
        
        // Check if cooldown is still active
        const today = new Date();
        if (today < nextDate) {
          setCooldownActive(true);
        }
      }
    } catch (error) {
      console.error("Error loading last donation date:", error);
    }
  };

  /* ------------------------------------
       VALIDATE DATE AGAINST 56-DAY COOLDOWN
  ------------------------------------ */
  const validateDonationDate = (selectedDate: string) => {
    setDate(selectedDate);
    setDateError("");
    
    if (!nextEligibleDate) return;
    
    if (selectedDate < nextEligibleDate) {
      setDateError(`❌ You can only schedule donations after ${nextEligibleDate}. You must wait 56 days from your last donation.`);
    } else {
      setDateError("");
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        alert("Location captured!");
      },
      () => alert("Location access denied")
    );
  };

  /* ------------------------------------
        SUBMIT SCHEDULE
  ------------------------------------ */
  const submitSchedule = async () => {
    if (!donorId || !requestId || !contact || !date || !time || !location) {
      return alert("Please fill all required fields.");
    }

    // Check cooldown before submitting
    if (nextEligibleDate && date < nextEligibleDate) {
      return alert(`⏳ You must wait until ${nextEligibleDate} to schedule your next donation (56 days from last donation).`);
    }

    const res = await fetch("http://localhost:5000/schedule/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donorId,
        requestId,
        donorLocation: {
          latitude: location.lat,
          longitude: location.lng,
        },
        contact,
        date,
        time,
        notes,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Donation Schedule Confirmed!");
      window.location.href = "/donor/dashboard"; // FIXED REDIRECTION
    } else {
      alert("Error: " + data.message);
    }
  };

  return (
    <main className="min-h-screen bg-red-50 p-10 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full border border-red-200">

        <h1 className="text-3xl font-bold text-red-700 mb-6">❤️ Schedule Blood Donation</h1>

        {/* Hospital Info */}
        <div className="p-4 border border-red-200 rounded-lg mb-6 bg-red-50">
          <h2 className="text-xl font-bold text-red-700">Hospital Information</h2>
          <p className="mt-2 text-lg font-semibold">{hospital || "Unknown Hospital"}</p>

          <p className="mt-3 p-3 bg-red-100 rounded-lg text-red-700 font-semibold">
            Needed: <b>{units} units</b> of <b>{bloodType}</b>
          </p>
        </div>

        {/* Location */}
        <button
          onClick={getLocation}
          className="w-full bg-blue-600 text-white py-3 rounded-lg flex justify-center gap-2 items-center mb-4"
        >
          <MapPin /> Share My Location
        </button>

        {location && (
          <p className="text-green-700 mb-4 font-semibold">
            Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        )}

        {/* 56-Day Cooldown Warning */}
        {cooldownActive && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded-lg">
            <div className="flex gap-3 items-start">
              <AlertCircle className="text-amber-600 w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800">⏳ 56-Day Cooldown Period</p>
                <p className="text-amber-700 text-sm mt-1">
                  Your last donation was on <b>{lastDonationDate}</b>.
                </p>
                <p className="text-amber-700 text-sm font-semibold mt-1">
                  You can next schedule a donation after: <b>{nextEligibleDate}</b>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact */}
        <label className="font-semibold flex items-center gap-2">
          <Phone /> Contact Number
        </label>
        <input
          type="text"
          placeholder="Enter phone number"
          className="w-full border rounded-lg p-3 mb-4"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        {/* Date */}
        <label className="font-semibold flex items-center gap-2">
          <Calendar /> Select Date
        </label>
        <input
          type="date"
          className="w-full border rounded-lg p-3 mb-2"
          value={date}
          onChange={(e) => validateDonationDate(e.target.value)}
          min={nextEligibleDate || undefined}
          disabled={cooldownActive}
        />
        
        {/* Date Error Message */}
        {dateError && (
          <div className="text-red-600 text-sm font-semibold mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
            {dateError}
          </div>
        )}

        {!dateError && date && nextEligibleDate && date >= nextEligibleDate && (
          <div className="text-green-600 text-sm font-semibold mb-4 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
            ✅ This date is valid for scheduling your donation.
          </div>
        )}

        {/* Time */}
        <label className="font-semibold flex items-center gap-2">
          <Clock /> Select Time
        </label>
        <input
          type="time"
          className="w-full border rounded-lg p-3 mb-4"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        {/* Notes */}
        <label className="font-semibold flex items-center gap-2">
          <FileText /> Notes (Optional)
        </label>
        <textarea
          placeholder="Any additional information..."
          className="w-full border rounded-lg p-3 mb-4 h-24"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Submit */}
        <button
          onClick={submitSchedule}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg"
        >
          Confirm Donation Schedule
        </button>
      </div>
    </main>
  );
}
