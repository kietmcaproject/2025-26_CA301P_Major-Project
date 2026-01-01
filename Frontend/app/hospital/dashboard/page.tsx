"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import {
  Heart,
  AlertCircle,
  Users,
  Droplet,
  TrendingUp,
  LogOut,
  FileText,
  Plus,
  MapPin,
  Calendar,
  Gift,
  Navigation,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

// 👉 FIXED MAP (dynamic import prevents SSR errors)
import dynamic from "next/dynamic";
const HospitalMap = dynamic(() => import("@/components/HospitalMap"), {
  ssr: false,
});

// Existing components (unchanged)
import BloodCompatibilityChart from "@/components/blood-compatibility-chart";
import AIChatbot from "@/components/ai-chatbot";
import ProfileMenu from "@/components/profile-menu";
// Correct URLs (backend runs on 5000)
const STATS_URL = "http://localhost:5000/hospital/stats";
const ACTIVE_DONORS_URL = "http://localhost:5000/hospital/active-donors";
const REQUESTS_URL = "http://localhost:5000/request/all";


export default function HospitalDashboard() {
  const [hospitalName, setHospitalName] = useState("Hospital");
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [hospitalEmail, setHospitalEmail] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalImage, setHospitalImage] = useState("");
  const [hospitalLocation, setHospitalLocation] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [hospitalRequests, setHospitalRequests] = useState<any[]>([]);
  const [recipientRequests, setRecipientRequests] = useState<any[]>([]);
  const [activeDonors, setActiveDonors] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    livesSaved: 0,
    donorsNearby: 0,
    avgMatchTime: 0,
  });

  const socketRef = useSocket();

  const [isRefreshing, setIsRefreshing] = useState(false);

  /* -----------------------------------------------
     REFRESH ALL DATA
  -----------------------------------------------*/
  // helper to resolve current hospital identity (id and name)
  const getCurrentHospitalIdentity = () => {
    let currentHospitalId = hospitalId;
    let currentHospitalName = hospitalName;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        currentHospitalId = currentHospitalId || (u._id || u.id || null);
        currentHospitalName = currentHospitalName || (u.fullName || u.name || null);
      }
    } catch (e) {}
    return { currentHospitalId, currentHospitalName };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // fetch stats and requests in parallel
      const [statsRes, reqRes] = await Promise.all([fetch(STATS_URL), fetch(REQUESTS_URL)]);

      const statsData = await statsRes.json();
      setStats({
        totalRequests: statsData.totalRequests || 0,
        livesSaved: statsData.livesSaved || 0,
        donorsNearby: statsData.donorsNearby || 0,
        avgMatchTime: statsData.avgMatchTime || 0,
      });

      const reqData = await reqRes.json();
      const allRequests = reqData.requests || [];
      setRequests(allRequests);

      const { currentHospitalId, currentHospitalName } = getCurrentHospitalIdentity();

      const hospitals = allRequests.filter((r: any) =>
        !r.isRecipientRequest && (
          (r.requestedBy && (
            r.requestedBy === currentHospitalId ||
            (r.requestedBy?._id && String(r.requestedBy._id) === String(currentHospitalId)) ||
            String(r.requestedBy) === String(currentHospitalId)
          )) ||
          (r.hospital && currentHospitalName && r.hospital === currentHospitalName)
        )
      );

      // Filter recipient requests that are for THIS hospital
      const recipients = allRequests.filter((r: any) => 
        r.isRecipientRequest && (
          (r.destinationHospital && currentHospitalName && r.destinationHospital === currentHospitalName) ||
          (r.hospital && currentHospitalName && r.hospital === currentHospitalName)
        )
      );
      
      // Only show active requests (not fulfilled/completed/successful)
      const statusesToExclude = ["fulfilled", "completed", "successful"];
      
      const activeHospitalRequests = hospitals.filter((r: any) => 
        !r.status || !statusesToExclude.includes(r.status.toLowerCase())
      );
      const activeRecipientRequests = recipients.filter((r: any) => 
        !r.status || !statusesToExclude.includes(r.status.toLowerCase())
      );
      
      setHospitalRequests(activeHospitalRequests);
      setRecipientRequests(activeRecipientRequests);
      
      // Calculate lives saved from fulfilled requests
      const fulfilledRequests = allRequests.filter((r: any) => 
        r.status && (
          r.status.toLowerCase() === "fulfilled" || 
          r.status.toLowerCase() === "completed" || 
          r.status.toLowerCase() === "successful"
        )
      );
      
      setStats({
        totalRequests: activeHospitalRequests.length + activeRecipientRequests.length,
        livesSaved: fulfilledRequests.length,
        donorsNearby: statsData.donorsNearby || 0,
        avgMatchTime: statsData.avgMatchTime || 0,
      });
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  /* ----------------------------------------------
     LOAD HOSPITAL NAME
  -----------------------------------------------*/
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setHospitalName(user.fullName || "Hospital");
      setHospitalId(user._id || null);
      setHospitalEmail(user.email || "");
      setHospitalPhone(user.phone || "");
      setHospitalImage(user.profileImage || "");
    }
  }, []);

  /* Keep hospital info (including image) in sync with profile page updates */
  useEffect(() => {
    const onUserUpdated = (event: any) => {
      const updated = event?.detail || {};
      setHospitalName(updated.fullName || "Hospital");
      setHospitalEmail(updated.email || "");
      setHospitalPhone(updated.phone || "");
      setHospitalImage(updated.profileImage || "");
    };

    window.addEventListener("user-updated", onUserUpdated as EventListener);
    return () => window.removeEventListener("user-updated", onUserUpdated as EventListener);
  }, []);

  /* -----------------------------------------------
     REQUEST GEOLOCATION PERMISSION & UPDATE LOCATION
  -----------------------------------------------*/
  const requestLocationPermission = async () => {
    if (!hospitalId) {
      console.log("Hospital ID not available yet");
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      setLocationPermissionDenied(true);
      return;
    }

    console.log("Requesting geolocation permission...");
    setShowLocationPrompt(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Location obtained: ${latitude}, ${longitude}`);
        setHospitalLocation({ latitude, longitude });
        setShowLocationPrompt(false);

        // Update hospital location in backend
        try {
          // Validate hospitalId exists
          if (!hospitalId) {
            console.error("Hospital ID not available. Please log in again.");
            setShowLocationPrompt(false);
            alert("Hospital ID not found. Please log out and log in again.");
            return;
          }

          const response = await fetch("http://localhost:5000/hospital/update-location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hospitalId,
              latitude,
              longitude,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Failed to update location: HTTP ${response.status}`);
            console.error("Error response:", errorData);
            
            if (response.status === 404) {
              if (errorData.message === "Hospital not found. Please log in again.") {
                console.error(`Hospital record not found in database for ID: ${hospitalId}`);
                console.warn("Your hospital account may have been deleted. Clearing session...");
                localStorage.removeItem("user");
                alert("Your hospital account was not found in the system. Please log in again.");
                window.location.href = "/auth?type=hospital";
              } else {
                console.error("Backend endpoint not found. Ensure the backend server is running on http://localhost:5000");
                alert("Location update failed. Please ensure backend server is running and try again.");
              }
            } else if (response.status === 400) {
              console.error("Bad request:", errorData.message);
              alert("Missing required location data. Please try again.");
            } else {
              alert(`Error updating location: HTTP ${response.status}`);
            }
            setShowLocationPrompt(false);
            return;
          }

          const data = await response.json();
          if (data.success) {
            console.log("Hospital location updated successfully:", data.hospital);
          } else {
            console.error("Failed to update location:", data.message);
            if (data.message === "Hospital not found. Please log in again.") {
              localStorage.removeItem("user");
              console.warn("Hospital record not found. Redirecting to login...");
              window.location.href = "/auth?type=hospital";
            }
          }
        } catch (error) {
          console.error("Error updating hospital location:", error);
          if (error instanceof TypeError && error.message.includes("fetch")) {
            console.error("Network error: Could not reach backend server at http://localhost:5000. Is the server running?");
            alert("Could not connect to backend server. Please ensure it's running on port 5000.");
          }
          setShowLocationPrompt(false);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        setShowLocationPrompt(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermissionDenied(true);
          console.log("Location permission denied by user");
        } else if (error.code === error.TIMEOUT) {
          console.log("Location request timed out - user can retry");
        } else {
          console.log("Location unavailable - will prompt user to retry");
        }
        // Don't show alerts for geolocation errors - just log them
        // User can manually click to retry
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
  };

  // Request location permission only if user manually triggers it
  // Removed automatic location request on mount to prevent geolocation errors blocking dashboard
  useEffect(() => {
    // This useEffect can be used later if needed for manual location requests
    // For now, location sharing is optional and user-triggered
  }, []);

  /* ----------------------------------------------
     FETCH STATS
  -----------------------------------------------*/
  const loadStats = async () => {
    try {
      const res = await fetch(STATS_URL);
      if (!res.ok) {
        console.error(`loadStats error: ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats((prev) => ({
          ...prev,
          donorsNearby: data.donorsNearby,
          avgMatchTime: data.avgMatchTime,
        }));
      }
    } catch (err) {
      console.error("loadStats fetch error:", err);
    }
  };

  /* ----------------------------------------------
     FETCH ACTIVE DONORS
  -----------------------------------------------*/
  const loadActiveDonors = async () => {
    try {
      const res = await fetch(ACTIVE_DONORS_URL);
      if (!res.ok) {
        console.error(`loadActiveDonors error: ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setActiveDonors(data.donors || []);
      }
    } catch (err) {
      console.error("loadActiveDonors fetch error:", err);
    }
  };

  /* ----------------------------------------------
     FETCH REQUESTS
  -----------------------------------------------*/
  const loadRequests = async () => {
    try {
      const res = await fetch(REQUESTS_URL);
      if (!res.ok) {
        console.error(`loadRequests error: ${res.status}`);
        return;
      }
      const data = await res.json();
      const allRequests = data.requests || [];
      setRequests(allRequests);

      const { currentHospitalId, currentHospitalName } = getCurrentHospitalIdentity();

      const hospitals = allRequests.filter((r: any) =>
        !r.isRecipientRequest && (
          (r.requestedBy && (
            r.requestedBy === currentHospitalId ||
            (r.requestedBy?._id && String(r.requestedBy._id) === String(currentHospitalId)) ||
            String(r.requestedBy) === String(currentHospitalId)
          )) ||
          (r.hospital && currentHospitalName && r.hospital === currentHospitalName)
        )
      );

      const recipients = allRequests.filter((r: any) => r.isRecipientRequest || !r.hospital || r.hospital === "");
      
      // Filter out fulfilled/completed/successful requests
      const statusesToExclude = ["fulfilled", "completed", "successful"];
      const activeHospitals = hospitals.filter((r: any) => 
        !r.status || !statusesToExclude.includes(r.status.toLowerCase())
      );
      const activeRecipients = recipients.filter((r: any) => 
        !r.status || !statusesToExclude.includes(r.status.toLowerCase())
      );
      
      setHospitalRequests(activeHospitals);
      setRecipientRequests(activeRecipients);

      setStats((prev) => ({
        ...prev,
        totalRequests: allRequests.length,
        livesSaved: Math.floor(allRequests.length * 1.5),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  /* ----------------------------------------------
     INITIAL LOAD + SOCKET LISTENER
  -----------------------------------------------*/
  useEffect(() => {
    loadStats();
    loadActiveDonors();
    loadRequests();

    const socket = socketRef.current;
    if (!socket) return;

    // Listen for donor availability changes
    socket.on("donor_status_changed", () => {
      loadStats();
      loadActiveDonors();
    });

    // Listen for new requests created by this hospital or other hospitals
    socket.on("request_created", (payload: any) => {
      if (!payload || !payload._id) return;

      setRequests((prev) => {
        const exists = prev.some((r: any) => r._id === payload._id);
        if (exists) return prev;
        // increment stats only when actually adding new item
        setStats((s) => ({ ...s, totalRequests: s.totalRequests + 1 }));
        return [payload, ...prev];
      });

      // Add to the appropriate list — only include hospitalRequests that belong to this hospital
      const { currentHospitalId, currentHospitalName } = getCurrentHospitalIdentity();

      if (payload.isRecipientRequest) {
        // Only add if this request is for THIS hospital
        if (payload.hospital && currentHospitalName && payload.hospital === currentHospitalName) {
          setRecipientRequests((prev) => (prev.some((r: any) => r._id === payload._id) ? prev : [payload, ...prev]));
        }
      } else {
        // determine whether this payload was created by THIS hospital
        const createdByHospital = !!(
          (payload.requestedBy && (
            payload.requestedBy === currentHospitalId ||
            (payload.requestedBy?._id && String(payload.requestedBy._id) === String(currentHospitalId)) ||
            String(payload.requestedBy) === String(currentHospitalId)
          )) ||
          (payload.hospital && currentHospitalName && payload.hospital === currentHospitalName)
        );

        if (createdByHospital) {
          setHospitalRequests((prev) => (prev.some((r: any) => r._id === payload._id) ? prev : [payload, ...prev]));
        }
      }

      console.log("New request created (real-time):", payload);
    });

    // Listen for donor availability changes to refresh donor list
    socket.on("availability_changed", () => {
      loadActiveDonors();
      loadStats();
    });
    // Listen for request fulfilled (when hospital marks donation completed)
    socket.on("request_fulfilled", (payload: any) => {
      // Remove fulfilled request from active requests
      setHospitalRequests((prev) => prev.filter((r: any) => r._id !== payload.requestId));
      setRecipientRequests((prev) => prev.filter((r: any) => r._id !== payload.requestId));
      setRequests((prev) => prev.filter((r: any) => r._id !== payload.requestId));

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalRequests: Math.max(0, prev.totalRequests - 1),
      }));
    });

    // Listen for donation confirmation/rejection from donors
    socket.on("request_confirmed", (payload: any) => {
      if (!payload || !payload._id) return;

      console.log("Request confirmation status updated:", payload);

      // Update the request in both hospital and recipient request lists
      setHospitalRequests((prev) =>
        prev.map((r: any) =>
          r._id === payload._id
            ? {
                ...r,
                confirmationStatus: payload.confirmationStatus,
                confirmedBy: payload.confirmedBy,
                confirmationNotes: payload.confirmationNotes,
              }
            : r
        )
      );

      setRecipientRequests((prev) =>
        prev.map((r: any) =>
          r._id === payload._id
            ? {
                ...r,
                confirmationStatus: payload.confirmationStatus,
                confirmedBy: payload.confirmedBy,
                confirmationNotes: payload.confirmationNotes,
              }
            : r
        )
      );

      // Update the main requests list
      setRequests((prev) =>
        prev.map((r: any) =>
          r._id === payload._id
            ? {
                ...r,
                confirmationStatus: payload.confirmationStatus,
                confirmedBy: payload.confirmedBy,
                confirmationNotes: payload.confirmationNotes,
              }
            : r
        )
      );

      // Update stats to reflect confirmed request (reduce active requests count)
      setStats((prev) => ({
        ...prev,
        totalRequests: Math.max(0, prev.totalRequests - 1),
      }));
    });

    // Listen for donation completion (when scheduled time arrives)
    socket.on("donation_completed", (payload: any) => {
      if (!payload || !payload.requestId) return;

      console.log("Donation completed (time reached):", payload);

      // Update the request status to "Successful"
      setHospitalRequests((prev) =>
        prev.map((r: any) =>
          r._id === payload.requestId
            ? {
                ...r,
                confirmationStatus: "Successful",
                status: "Fulfilled",
              }
            : r
        )
      );

      setRecipientRequests((prev) =>
        prev.map((r: any) =>
          r._id === payload.requestId
            ? {
                ...r,
                confirmationStatus: "Successful",
                status: "Fulfilled",
              }
            : r
        )
      );

      setRequests((prev) =>
        prev.map((r: any) =>
          r._id === payload.requestId
            ? {
                ...r,
                confirmationStatus: "Successful",
                status: "Fulfilled",
              }
            : r
        )
      );
    });

    return () => {
      socket.off("donor_status_changed");
      socket.off("request_created");
      socket.off("availability_changed");
      socket.off("request_fulfilled");
      socket.off("request_confirmed");
      socket.off("donation_completed");
    };
  }, [socketRef]);

  /* ----------------------------------------------
     UI HELPERS
  -----------------------------------------------*/
  const getUrgencyColor = (urg: string) => {
    switch (urg?.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-600 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MODERATE":
        return "bg-yellow-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const getStatusColor = (status: string) =>
    status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : status === "Fulfilled"
      ? "bg-green-100 text-green-700"
      : "bg-gray-300 text-gray-700";

  /* ----------------------------------------------
     RENDER UI
  -----------------------------------------------*/
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 fill-white" />
            <h1 className="text-3xl font-bold">{hospitalName}</h1>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-2 rounded-full hover:bg-red-500 transition bg-white text-red-600 w-10 h-10 flex items-center justify-center"
              title="Profile menu"
            >
              👤
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 bg-gradient-to-b from-white to-gray-50 text-gray-800 rounded-2xl shadow-2xl w-64 z-40 border border-red-100 overflow-hidden">
                {/* Profile Info Section */}
                <div className="p-5 bg-gradient-to-r from-red-50 to-red-100 border-b-2 border-red-200">
                  <p className="font-bold text-lg text-red-700">{hospitalName}</p>
                  <p className="text-sm text-gray-600 mt-1">{hospitalEmail}</p>
                  <p className="text-sm text-gray-600">{hospitalPhone}</p>
                </div>
                
                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/hospital/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-gray-800 transition border-l-4 border-transparent hover:border-red-600"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FileText className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Edit Profile</span>
                  </Link>
                  <Link
                    href="/hospital/history"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-gray-800 transition border-l-4 border-transparent hover:border-blue-600"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">View History</span>
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-100 text-gray-800 transition border-l-4 border-transparent hover:border-red-700"
                  >
                    <LogOut className="w-5 h-5 text-red-700" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* LOCATION PERMISSION BANNER */}
      {showLocationPrompt && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mx-6 mt-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-blue-600 animate-pulse" />
            <div>
              <p className="font-semibold text-blue-900">Enabling Location Sharing</p>
              <p className="text-sm text-blue-700">Please allow location access so nearby recipients can find you...</p>
            </div>
          </div>
        </div>
      )}

      {locationPermissionDenied && (
        <div className="bg-amber-50 border-l-4 border-amber-600 p-4 mx-6 mt-4 rounded-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">Location Permission Denied</p>
                <p className="text-sm text-amber-700">Recipients won't be able to find your hospital. Please enable location in your browser settings.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setLocationPermissionDenied(false);
                requestLocationPermission();
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* MAIN BODY */}
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* HERO CARD */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-red-600 grid md:grid-cols-2">
          <div className="p-10">
            <h2 className="text-3xl font-bold text-red-700">Welcome back!</h2>
            <p className="text-gray-700 mt-2">Thanks for coordinating blood donations and saving lives.</p>

            <div className="mt-6 flex gap-4">
              <Link
                href="/hospital/new-request"
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold hover:shadow-lg transition"
              >
                <Plus className="w-5 h-5" /> New Request
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 via-red-100 to-red-200 flex items-center justify-center p-4 min-h-[280px]">
            {hospitalImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={hospitalImage}
                  alt="Hospital profile"
                  className="max-w-full max-h-[250px] rounded-lg shadow-2xl object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Heart className="text-red-600 w-20 h-20" />
                <p className="text-red-600 text-sm font-medium">Upload your photo</p>
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE DONORS MAP */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-red-700 flex items-center gap-2">
              <MapPin className="w-8 h-8" />
              Active Donors Nearby
            </h2>
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full font-semibold">
              {stats.donorsNearby} Donors Online
            </span>
          </div>
          {stats.donorsNearby > 0 && (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-100 overflow-hidden relative z-10" style={{ height: "500px" }}>
              <HospitalMap activeDonors={activeDonors} />
            </div>
          )}
          {stats.donorsNearby === 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-2xl border-2 border-amber-200 p-8 text-center" style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div>
                <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Donors Online</h3>
                <p className="text-gray-600">No donors are currently available in your area. Check back soon!</p>
              </div>
            </div>
          )}
        </div>

        {/* STATISTICS SECTION */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard icon={Users} label="Donors Nearby" value={stats.donorsNearby} color="from-green-500 to-green-600" />
          <StatCard icon={Droplet} label="Avg Match Time" value={`${stats.avgMatchTime} min`} color="from-red-600 to-red-700" />
          <StatCard icon={TrendingUp} label="Lives Saved" value={stats.livesSaved} color="from-green-500 to-green-600" />
          <StatCard icon={Heart} label="Active Requests" value={stats.totalRequests} color="from-red-500 to-red-600" />
        </div>

        {/* BLOOD COMPATIBILITY */}
        <BloodCompatibilityChartHospital />

        {/* REQUEST TABLES */}
        <div className="space-y-8">
          {/* Hospital-created requests */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <Droplet className="w-8 h-8 text-red-600" />
              <h2 className="text-3xl font-bold text-red-700">Hospital Requests</h2>
            </div>

            {(hospitalRequests || []).length === 0 ? (
              <div className="text-center py-12">
                <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No hospital requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(hospitalRequests || []).map((req: any, i: number) => (
                  <div key={`h-${i}`} className="p-6 border-2 border-red-100 rounded-xl hover:shadow-lg transition bg-gradient-to-r from-red-50 to-white">
                    <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Patient Name</p>
                        <p className="font-bold text-gray-900">{req.recipientName || req.patientName || req.requestedBy?.fullName || req.requestedByName || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Blood Type</p>
                        <p className="font-bold text-red-600 text-lg">{req.bloodType}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Units</p>
                        <p className="font-bold text-gray-900">{req.unitsNeeded}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Urgency</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getUrgencyColor(req.urgency)}`}>
                          {req.urgency}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Confirmation</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          req.confirmationStatus === "Confirmed" ? "bg-green-100 text-green-700" :
                          req.confirmationStatus === "Rejected" ? "bg-red-100 text-red-700" :
                          req.confirmationStatus === "Successful" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {req.confirmationStatus || "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recipient-created requests */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-purple-700">Recipient Requests</h2>
            </div>

            {(recipientRequests || []).length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No recipient requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(recipientRequests || []).map((req: any, i: number) => (
                  <div key={`r-${i}`} className="p-6 border-2 border-purple-100 rounded-xl hover:shadow-lg transition bg-gradient-to-r from-purple-50 to-white">
                    <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Recipient</p>
                        <p className="font-bold text-gray-900">{req.recipientName || req.requestedBy?.fullName || req.requestedByName || req.requesterName || (typeof req.requestedBy === 'string' ? req.requestedBy : "N/A")}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Blood Type</p>
                        <p className="font-bold text-red-600 text-lg">{req.bloodType}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Units</p>
                        <p className="font-bold text-gray-900">{req.unitsNeeded}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Urgency</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getUrgencyColor(req.urgency)}`}>
                          {req.urgency}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Confirmation</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          req.confirmationStatus === "Confirmed" ? "bg-green-100 text-green-700" :
                          req.confirmationStatus === "Rejected" ? "bg-red-100 text-red-700" :
                          req.confirmationStatus === "Successful" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {req.confirmationStatus || "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AIChatbot />
    </main>
  );
}

/* ----------------------------------------------
   STAT CARD COMPONENT
-----------------------------------------------*/
function StatCard({ icon: Icon, label, value, color = "from-red-500 to-red-700" }: any) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition transform hover:scale-105`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        <Icon className="w-6 h-6 opacity-90" />
      </div>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
}

/* ----------------------------------------------
   BLOOD COMPATIBILITY CHART - Hospital Version
-----------------------------------------------*/
function BloodCompatibilityChartHospital() {
  const types = [
    {
      type: "O-",
      badge: "🌟 Universal Donor",
      donate: ["Everyone"],
      description: "Rarest hero - can save anyone",
      bg: "bg-gradient-to-br from-red-100 to-red-200",
      border: "border-red-400"
    },
    {
      type: "O+",
      badge: "Most Common",
      donate: ["O+", "A+", "B+", "AB+"],
      description: "Help positive blood types",
      bg: "bg-gradient-to-br from-red-100 to-red-200",
      border: "border-red-400"
    },
    {
      type: "A-",
      badge: "Rare Giver",
      donate: ["A-", "A+", "AB-", "AB+"],
      description: "Support 4 blood types",
      bg: "bg-gradient-to-br from-rose-100 to-rose-200",
      border: "border-rose-400"
    },
    {
      type: "A+",
      badge: "Common",
      donate: ["A+", "AB+"],
      description: "Help A and AB types",
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      border: "border-red-300"
    },
    {
      type: "B-",
      badge: "Rare Giver",
      donate: ["B-", "B+", "AB-", "AB+"],
      description: "Support 4 blood types",
      bg: "bg-gradient-to-br from-rose-100 to-rose-200",
      border: "border-rose-400"
    },
    {
      type: "B+",
      badge: "Common",
      donate: ["B+", "AB+"],
      description: "Help B and AB types",
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      border: "border-red-300"
    },
    {
      type: "AB-",
      badge: "Rarest",
      donate: ["AB-", "AB+"],
      description: "Precious for AB types",
      bg: "bg-gradient-to-br from-pink-100 to-pink-200",
      border: "border-pink-400"
    },
    {
      type: "AB+",
      badge: "🌟 Universal Recipient",
      donate: ["AB+"],
      description: "Can receive from anyone",
      bg: "bg-gradient-to-br from-red-200 to-red-300",
      border: "border-red-500"
    },
  ];

  return (
    <div className="mt-10 p-8 bg-gradient-to-r from-white via-blue-50 to-white rounded-2xl shadow-lg border-2 border-blue-200">
      <h2 className="text-3xl font-bold text-red-700 mb-2 flex items-center gap-2">
        <span className="text-4xl">🩺</span> Blood Compatibility Chart
      </h2>
      <p className="text-gray-600 mb-6 text-sm">Understand which blood types can be used for transfusions and donations</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {types.map((b, i) => (
          <div
            key={i}
            className={`${b.bg} p-5 rounded-2xl shadow-lg border-2 ${b.border} hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-1">{b.type}</h3>
                <span className="inline-block bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                  {b.badge}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-700 font-semibold mb-3 italic">"{b.description}"</p>
            <div>
              <p className="text-xs font-bold text-gray-800 mb-2">💉 Donates to:</p>
              <div className="flex flex-wrap gap-2">
                {b.donate.map((d, j) => (
                  <span
                    key={j}
                    className="px-3 py-1.5 bg-white font-bold text-gray-800 rounded-lg text-xs shadow border-2 border-gray-300"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-5 border-l-4 border-red-600">
        <p className="text-sm text-gray-700">
          <span className="font-bold text-red-700">💡 Pro Tip:</span> O- blood type donors are the most sought after because they can donate to anyone. AB+ recipients can receive from all blood types. Understanding compatibility helps you plan better blood requests.
        </p>
      </div>
    </div>
  );
}
