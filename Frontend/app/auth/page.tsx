"use client";

import type React from "react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import Link from "next/link";

type UserType = "hospital" | "donor" | "recipient";

export default function Auth() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userType, setUserType] = useState<UserType>(
    (searchParams.get("type") as UserType) || "donor"
  );

  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationShared, setLocationShared] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    hospitalName: "",
    recipientName: "",
    email: "",
    password: "",
    phone: "",
    bloodType: "O+",
    hospitalId: "",
    licenseNumber: "",
    urgency: "low",
    latitude: "",
    longitude: "",
    address: "",
  });

  // -------------------------------
  // HANDLE INPUT
  // -------------------------------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------------
  // REQUEST GEOLOCATION
  // -------------------------------
  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported in your browser");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
        setLocationShared(true);
        setLocationLoading(false);
        console.log(`Location captured: ${latitude}, ${longitude}`);
      },
      (err) => {
        console.error("Geolocation error:", err?.code || err?.message || err);
        if (err?.code === err?.PERMISSION_DENIED) {
          alert("Location access denied. Please enable location permissions in your browser settings.");
        } else if (err?.code === err?.TIMEOUT) {
          alert("Location request timed out. Please try again.");
        } else {
          alert("Unable to get your location. Please check browser permissions.");
        }
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 30000 }
    );
  };

  // -------------------------------
  // FORM SUBMIT (REGISTER / LOGIN)
  // -------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const backend = "http://localhost:5000";

    const url = isLogin ? `${backend}/auth/login` : `${backend}/auth/register`;

    // Convert frontend fields → backend fields
    const body: any = {
      fullName:
        userType === "hospital"
          ? formData.hospitalName
          : userType === "recipient"
          ? formData.recipientName
          : formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      bloodType: userType === "donor" ? formData.bloodType : undefined,
      hospitalId: userType === "hospital" ? formData.hospitalId : undefined,
      role: userType,
    };

    // Add location for hospitals (required for registration)
    if (userType === "hospital" && !isLogin) {
      if (!formData.latitude || !formData.longitude) {
        alert("Hospital location (latitude and longitude) is required");
        setLoading(false);
        return;
      }
      body.location = {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };
      if (formData.address) {
        body.address = formData.address;
      }
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      // -------------------------------
      // SAVE TOKEN + USER DETAILS
      // -------------------------------
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id || data.user._id);
        localStorage.setItem("role", data.user.role);
        // Save full user object (including fullName, email, phone, etc.)
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // -------------------------------
      // REDIRECT BASED ON ROLE
      // -------------------------------
      const role = data.user.role;

      if (role === "donor") router.push("/donor/dashboard");
      if (role === "hospital") router.push("/hospital/dashboard");
      if (role === "recipient") router.push("/recipient/dashboard");

    } catch (err) {
      console.error(err);
      alert("Network or server error.");
    }

    setLoading(false);
  };

  // -------------------------------
  // UI CONFIG
  // -------------------------------
  const userTypeConfig = {
    hospital: {
      title: "Hospital Registration",
      icon: "🏥",
      color: "from-red-600 to-red-700",
      nameField: "hospitalName",
      placeholder: "Hospital Name",
    },
    donor: {
      title: "Become a Life Saver",
      icon: "❤️",
      color: "from-red-500 to-red-600",
      nameField: "fullName",
      placeholder: "Full Name",
    },
    recipient: {
      title: "Request Blood",
      icon: "🩸",
      color: "from-red-600 to-red-800",
      nameField: "recipientName",
      placeholder: "Recipient Name",
    },
  };

  const config = userTypeConfig[userType];

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 flex items-center justify-center p-4">

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
      >
        <Heart className="w-5 h-5" />
        Pulse Bank
      </Link>

      <div className="w-full max-w-4xl">

        {/* USER TYPE SELECTION */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {(["hospital", "donor", "recipient"] as UserType[]).map((type) => (
            <button
              key={type}
              onClick={() => setUserType(type)}
              className={`p-6 rounded-xl border-2 transition transform hover:scale-105 ${
                userType === type
                  ? "bg-red-600 text-white border-red-700 shadow-lg"
                  : "bg-white text-gray-700 border-gray-200 hover:border-red-400"
              }`}
            >
              <div className="text-4xl mb-3">
                {type === "hospital" ? "🏥" : type === "donor" ? "❤️" : "🩸"}
              </div>
              <div className="font-semibold capitalize">{type}</div>
            </button>
          ))}
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* HEADER */}
          <div className={`bg-gradient-to-r ${config.color} text-white p-8 text-center`}>
            <div className="text-5xl mb-4">{config.icon}</div>
            <h1 className="text-3xl font-bold mb-2">{config.title}</h1>
            <p className="opacity-90">
              {isLogin ? "Welcome back! Sign in to continue" : "Join our community and save lives"}
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* NAME (REGISTRATION ONLY) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {config.placeholder}
                </label>
                <input
                  type="text"
                  name={config.nameField}
                  value={(formData as any)[config.nameField]}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder={config.placeholder}
                />
              </div>
            )}

            {/* HOSPITAL ID (REGISTRATION ONLY FOR HOSPITAL) */}
            {!isLogin && userType === "hospital" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital ID</label>
                <input
                  type="text"
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter hospital ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            {/* HOSPITAL ID (LOGIN ONLY FOR HOSPITAL) */}
            {isLogin && userType === "hospital" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital ID</label>
                <input
                  type="text"
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter hospital ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            {/* EMAIL (REGISTRATION ONLY FOR DONOR/RECIPIENT, HIDDEN FOR LOGIN) */}
            {userType !== "hospital" && (
              <div className={!isLogin ? "grid md:grid-cols-2 gap-6" : "space-y-6"}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder={isLogin ? "Enter your email" : ""}
                  />
                </div>

                {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                )}
              </div>
            )}

            {/* EMAIL + PHONE (REGISTRATION ONLY FOR HOSPITAL) */}
            {!isLogin && userType === "hospital" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            {/* HOSPITAL LOCATION (REGISTRATION ONLY FOR HOSPITAL) */}
            {!isLogin && userType === "hospital" && (
              <>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-sm text-yellow-800 font-semibold">📍 Hospital Location Required</p>
                  <p className="text-xs text-yellow-700 mt-1">Share your hospital location so recipients can find you on the map</p>
                </div>

                {/* SHARE LOCATION BUTTON */}
                <button
                  type="button"
                  onClick={requestLocationPermission}
                  disabled={locationLoading}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    locationShared
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  } ${locationLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {locationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Detecting Location...
                    </>
                  ) : locationShared ? (
                    <>
                      ✓ Location Shared
                    </>
                  ) : (
                    <>
                      📍 Share My Location
                    </>
                  )}
                </button>

                {locationShared && (
                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                    <p className="text-sm text-green-800 font-semibold">✓ Location Captured</p>
                    <p className="text-xs text-green-700 mt-1">
                      Latitude: {parseFloat(formData.latitude).toFixed(4)}, Longitude: {parseFloat(formData.longitude).toFixed(4)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hospital Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., Sitabuldi, Nagpur 440013"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </>
            )}

            {/* EMAIL + PHONE (LOGIN ONLY FOR HOSPITAL) */}
            {isLogin && userType === "hospital" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Optional for login"
                  />
                </div>
              </div>
            )}

            {/* BLOOD TYPE (REGISTRATION ONLY FOR DONOR) */}
            {!isLogin && userType === "donor" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Type
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* LOGIN / REGISTER TOGGLE */}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-red-600 hover:text-red-700 font-semibold text-sm"
            >
              {isLogin ? "Create new account" : "Already have an account? Login"}
            </button>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
