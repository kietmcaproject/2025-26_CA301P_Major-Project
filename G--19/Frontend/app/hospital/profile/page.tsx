"use client";

import { useState, useEffect } from "react";
import { Heart, ArrowLeft, Save, Loader, Upload } from "lucide-react";
import Link from "next/link";

export default function HospitalProfile() {
  const [hospitalId, setHospitalId] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sleepTime, setSleepTime] = useState(20);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setHospitalId(user.hospitalId || "");
      setHospitalName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setSleepTime(user.sleepTime || 20);
      setImageUrl(user.profileImage || "");
    }
  }, []);

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

    try {
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : {};
      const userId = user._id || user.id || null;

      const payload = {
        userId,
        hospitalId,
        fullName: hospitalName,
        email,
        phone,
        profileImage: imageUrl,
        sleepTime,
      };

      try {
        const res = await fetch("http://localhost:5000/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          try { window.dispatchEvent(new CustomEvent('user-updated', { detail: data.user })); } catch(e){}
          setMessage("Profile updated and saved to server ✓");
        } else {
          const updatedUser = { ...user, hospitalId, fullName: hospitalName, email, phone, profileImage: imageUrl, sleepTime };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedUser })); } catch(e){}
          setMessage("Profile updated locally (server gave no user)");
        }
      } catch (err) {
        const updatedUser = { ...user, hospitalId, fullName: hospitalName, email, phone, profileImage: imageUrl, sleepTime };
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
      <header className="bg-linear-to-r from-red-600 to-red-700 text-white p-6 sticky top-0 z-30 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/hospital/dashboard" className="hover:opacity-80 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Heart className="w-8 h-8 fill-white" />
          <h1 className="text-2xl font-bold">Edit Hospital Profile</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center overflow-hidden border-4 border-red-600 shadow-lg">
              {imageUrl ? (
                <img src={imageUrl} alt="Hospital" className="w-full h-full object-cover" />
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
              <label className="block text-sm font-bold text-red-700 mb-2">🏥 Hospital ID</label>
              <input
                type="text"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Hospital ID"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-red-700 mb-2">🏥 Hospital Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Hospital Name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-red-700 mb-2">✉️ Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="hospital@example.com"
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
                If you logout without stopping location share, it will remain active for this duration (minimum 5 min, default 20 min, maximum 480 min)
              </p>
            </div>
          </div>

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
