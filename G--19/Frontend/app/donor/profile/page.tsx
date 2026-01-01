"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import LeafletMap from "../../../components/LeafletMap";
import { Heart, ArrowLeft, Save, Loader, Upload } from "lucide-react";
import Link from "next/link";

export default function DonorProfile() {
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [donationHistory, setDonationHistory] = useState<any[]>([]);
  const [donorId, setDonorId] = useState<string | null>(null);
  const [hospitalRequests, setHospitalRequests] = useState<any[]>([]);
  const [recipientRequests, setRecipientRequests] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [perks, setPerks] = useState<any[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [lastCheckupDate, setLastCheckupDate] = useState<string | null>(null);
  const [sleepTime, setSleepTime] = useState<number>(20);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setDonorId(user._id || user.id || null);
      setDonorName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setBloodType(user.bloodType || "");
      setImageUrl(user.profileImage || "");
      setPerks(user.perks || []);
      setTotalDonations(user.totalDonations || 0);
      setLastCheckupDate(user.lastHealthCheckupDate ? new Date(user.lastHealthCheckupDate).toLocaleDateString() : null);
      setSleepTime(user.sleepTime || 20);
    }
    // fallback: try to decode token
    if (!stored) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const d: any = jwtDecode(token);
          setDonorId(d.userId || d._id || null);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Fetch donation history, schedules and hospital requests
  useEffect(() => {
    if (!donorId) return;

    // donation history
    fetch(`http://localhost:5000/donor/history/${donorId}`)
      .then((res) => res.json())
      .then((data) => setDonationHistory(data.donations || []))
      .catch((err) => console.error("donor history fetch err", err));

    // schedules
    fetch(`http://localhost:5000/schedule/donor/${donorId}`)
      .then((res) => res.json())
      .then((data) => setSchedules(data.schedules || []))
      .catch((err) => console.error("schedule fetch err", err));

    // all requests - split into hospital and recipient
    fetch(`http://localhost:5000/request/all`)
      .then((res) => res.json())
      .then((data) => {
        const all = data.requests || [];
        const hospitals = all.filter((r: any) => r.hospital && r.hospital !== "" && !r.isRecipientRequest);
        const recipients = all.filter((r: any) => r.isRecipientRequest || !r.hospital || r.hospital === "");
        setHospitalRequests(hospitals);
        setRecipientRequests(recipients);
      })
      .catch((err) => console.error("requests fetch err", err));
  }, [donorId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    console.log("[Profile Save] Current imageUrl state:", imageUrl);
    console.log("[Profile Save] Image length:", imageUrl?.length);

    try {
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : {};
      const userId = donorId || user._id || user.id;

      const payload = {
        userId,
        fullName: donorName,
        email,
        phone,
        bloodType,
        profileImage: imageUrl,
        sleepTime: sleepTime,
      };

      console.log("[Profile Save] Payload:", { ...payload, profileImage: payload.profileImage ? `[Image data: ${payload.profileImage.substring(0, 50)}...]` : "none" });

      // Try to persist to backend; fallback to localStorage
      try {
        const res = await fetch("http://localhost:5000/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        console.log("[Profile Save] Server response:", data);
        if (data.success && data.user) {
          console.log("[Profile Save] Saving to localStorage - profileImage:", data.user.profileImage ? "present" : "missing");
          localStorage.setItem("user", JSON.stringify(data.user));
          // notify other components in same window
          try { window.dispatchEvent(new CustomEvent('user-updated', { detail: data.user })); } catch(e){}
          setMessage("Profile updated and saved to server ✓");
        } else {
          // fallback
          const updatedUser = { ...user, fullName: donorName, email, phone, bloodType, profileImage: imageUrl };
          console.log("[Profile Save] Fallback - saving locally with profileImage:", updatedUser.profileImage ? "present" : "missing");
          localStorage.setItem("user", JSON.stringify(updatedUser));
          try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedUser })); } catch(e){}
          setMessage("Profile updated locally (server gave no user)");
        }
      } catch (err) {
        const updatedUser = { ...user, fullName: donorName, email, phone, bloodType, profileImage: imageUrl };
        console.log("[Profile Save] Error - saving locally with profileImage:", updatedUser.profileImage ? "present" : "missing");
        localStorage.setItem("user", JSON.stringify(updatedUser));
        try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedUser })); } catch(e){}
        setMessage("Profile saved locally (server unreachable)");
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error updating profile ✗");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-white via-red-50 to-white">
      <header className="bg-red-600 text-white p-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/donor/dashboard" className="hover:opacity-80 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Heart className="w-8 h-8 fill-white" />
          <h1 className="text-2xl font-bold">Edit Donor Profile</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center overflow-hidden border-4 border-red-600 shadow-lg">
              {imageUrl ? (
                <img src={imageUrl} alt="Donor" className="w-full h-full object-cover" />
              ) : (
                <Heart className="w-16 h-16 text-red-600" />
              )}
            </div>
            <label className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition font-semibold shadow-md">
              <Upload className="w-5 h-5" />
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-5 border-t pt-6">
            <div>
              <label className="block text-sm font-bold text-red-700 mb-2">👤 Full Name</label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-red-700 mb-2">✉️ Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="donor@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-red-700 mb-2">📞 Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-red-700 mb-2">🩸 Blood Type</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white"
                title="Select blood type"
              >
                <option value="">Select Blood Type</option>
                <option value="O-">O- (Universal Donor)</option>
                <option value="O+">O+</option>
                <option value="A-">A-</option>
                <option value="A+">A+</option>
                <option value="B-">B-</option>
                <option value="B+">B+</option>
                <option value="AB-">AB-</option>
                <option value="AB+">AB+ (Universal Recipient)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-red-700 mb-2">⏰ Location Sharing Sleep Time (minutes)</label>
              <input
                type="number"
                value={sleepTime}
                onChange={(e) => setSleepTime(Math.max(5, parseInt(e.target.value) || 20))}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="20"
                min="5"
                max="480"
              />
              <p className="text-xs text-gray-600 mt-2">
                If you logout without clicking unavailable, your location will be shared for this duration (minimum 5 min, default 20 min, maximum 480 min)
              </p>
            </div>
          </div>

          {/* Donation History Section */}
          {donationHistory.length > 0 && (
            <div className="border-t pt-6 space-y-4">
              <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
                ❤️ Donation History
              </h2>
              <div className="space-y-3">
                {donationHistory.map((donation, idx) => (
                  <div key={idx} className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <p className="font-bold text-red-700">{donation.date}</p>
                    <p className="text-gray-600">{donation.units} units - {donation.bloodType}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg text-center font-bold text-sm ${
                message.includes("✓")
                  ? "bg-green-100 text-green-700 border-2 border-green-300"
                  : "bg-red-100 text-red-700 border-2 border-red-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full px-6 py-4 bg-linear-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
