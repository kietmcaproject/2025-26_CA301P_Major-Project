"use client";

import { DonationConfirmationModal } from "@/components/donation-confirmation-modal";

// // "use client";

// // import Link from "next/link";
// // import { useEffect, useState, useRef } from "react";
// // import { jwtDecode } from "jwt-decode";
import dynamic from "next/dynamic";
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });
const HospitalRequestsMap = dynamic(() => import("@/components/HospitalRequestsMap"), { ssr: false });
// // import {
// //   Heart,
// //   Droplet,
// //   MapPin,
// //   CheckCircle,
// //   Play,
// // } from "lucide-react";
// // import { io } from "socket.io-client";

// // export default function DonorDashboard() {
// //   const [history, setHistory] = useState<any[]>([]);
// //   const [requests, setRequests] = useState<any[]>([]);
// //   const [donorId, setDonorId] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
// //   const [available, setAvailable] = useState<boolean>(false);
// //   const [showVideo, setShowVideo] = useState(false);

// //   const socketRef = useRef<any>(null);

// //   // Load donorId from token
// //   useEffect(() => {
// //     const token = localStorage.getItem("token");
// //     if (token) {
// //       const decoded: any = jwtDecode(token);
// //       setDonorId(decoded.userId);
// //     }
// //   }, []);

// //   // Socket.io live request notifications
// //   useEffect(() => {
// //     if (!donorId) return;

// //     const socket = io("http://localhost:5000");
// //     socketRef.current = socket;

// //     socket.on("connect", () => {
// //       socket.emit("register", donorId);
// //     });

// //     socket.on("new_request", (req) => {
// //       alert(`🔔 NEW REQUEST: ${req.bloodType} → ${req.unitsNeeded} units needed`);
// //       setRequests((prev) => [req, ...prev]);
// //     });

// //     return () => socket.disconnect();
// //   }, [donorId]);

// //   // Fetch history
// //   useEffect(() => {
// //     if (!donorId) return;

// //     fetch(`http://localhost:5000/donor/history/${donorId}`)
// //       .then((res) => res.json())
// //       .then((data) => {
// //         setHistory(data.donations || []);
// //         setLoading(false);
// //       });
// //   }, [donorId]);

// //   // Fetch urgent requests
// //   useEffect(() => {
// //     fetch("http://localhost:5000/donor/requests")
// //       .then((res) => res.json())
// //       .then((data) => setRequests(data.requests || []));
// //   }, []);

// //   // Location handler
// //   const getLocation = () => {
// //     navigator.geolocation.getCurrentPosition(
// //       (pos) => {
// //         setLocation({
// //           lat: pos.coords.latitude,
// //           lng: pos.coords.longitude,
// //         });
// //         alert("📍 Location Captured Successfully");
// //       },
// //       () => alert("❌ Location access denied")
// //     );
// //   };

// //   // Mark availability
// //   const markAvailable = async () => {
// //     if (!location) return alert("Please share your location first");

// //     await fetch("http://localhost:5000/donor/availability", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         donorId,
// //         available: true,
// //         latitude: location.lat,
// //         longitude: location.lng,
// //       }),
// //     });

// //     setAvailable(true);
// //   };

// //   const markUnavailable = async () => {
// //     await fetch("http://localhost:5000/donor/availability", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ donorId, available: false }),
// //     });

// //     setAvailable(false);
// //   };

// //   return (
// //     <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
// //       {/* HEADER */}
// //       <header className="bg-red-600 text-white p-6 shadow-lg flex justify-between items-center sticky top-0 z-20">
// //         <div className="flex items-center gap-3 text-2xl font-bold">
// //           <Heart className="w-7 h-7 fill-white" />
// //           Pulse Bank
// //         </div>

// //         <div className="flex items-center gap-4">
// //           {location && (
// //             <div className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg">
// //               <MapPin className="w-5 h-5" /> Location Active
// //             </div>
// //           )}

// //           <button
// //             onClick={() => {
// //               localStorage.removeItem("token");
// //               window.location.href = "/";
// //             }}
// //             className="p-2 hover:bg-red-500 rounded-lg"
// //           >
// //             Logout
// //           </button>
// //         </div>
// //       </header>

// //       {/* MAIN SECTION */}
// //       <div className="max-w-7xl mx-auto p-6">
// //         {/* HERO CARD */}
// //         <div className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-red-600 grid md:grid-cols-2">
// //           <div className="p-10">
// //             <h2 className="text-3xl font-bold text-red-700">
// //               Welcome Back, Life Saver!
// //             </h2>

// //             <p className="text-gray-700 mt-2">
// //               Thank you for helping save lives ❤️
// //             </p>

// //             <div className="mt-4 space-y-1">
// //               <p>
// //                 <b>{history.length}</b> total donations
// //               </p>
// //               <p>
// //                 <b>{history.length * 400}</b> ml contributed
// //               </p>
// //             </div>

// //             <div className="mt-6 flex gap-4 flex-wrap">
// //               <button
// //                 onClick={getLocation}
// //                 className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg shadow"
// //               >
// //                 <MapPin /> Share Location
// //               </button>

// //               {!available ? (
// //                 <button
// //                   onClick={markAvailable}
// //                   className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg shadow"
// //                 >
// //                   <CheckCircle /> Mark Available
// //                 </button>
// //               ) : (
// //                 <button
// //                   onClick={markUnavailable}
// //                   className="flex items-center gap-2 bg-gray-600 text-white px-5 py-3 rounded-lg shadow"
// //                 >
// //                   Disable Availability
// //                 </button>
// //               )}
// //             </div>
// //           </div>

// //           <div className="bg-gray-900 flex items-center justify-center">
// //             <Heart className="text-gray-400 w-20 h-20" />
// //           </div>
// //         </div>

// //         {/* VIDEO */}
// //         {!showVideo ? (
// //           <div className="bg-red-50 mt-8 p-6 rounded-xl flex items-center justify-between border">
// //             <div>
// //               <h3 className="text-2xl font-bold text-red-700">Feel Inspired?</h3>
// //               <p className="text-gray-600">
// //                 Watch stories of lives changed through donation.
// //               </p>
// //             </div>

// //             <button
// //               onClick={() => setShowVideo(true)}
// //               className="bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
// //             >
// //               <Play className="w-5" /> Watch Video
// //             </button>
// //           </div>
// //         ) : (
// //           <div className="mt-8 shadow-lg rounded-xl overflow-hidden border">
// //             <iframe
// //               className="w-full aspect-video"
// //               src="https://www.youtube.com/embed/_JlmwDqaYA0"
// //             ></iframe>
// //             <button
// //               onClick={() => setShowVideo(false)}
// //               className="bg-red-600 w-full text-white py-2 font-semibold"
// //             >
// //               Close Video
// //             </button>
// //           </div>
// //         )}

// //         {/* SPECIAL SECTIONS */}
// //         <BloodDonationGuide />
// //         <CompatibilityChart />
// //         <ImpactStories />

// //         {/* URGENT REQUESTS */}
// //         <UrgentRequests requests={requests} />
// //       </div>
// //     </main>
// //   );
// // }

// // /* ---------------------------------------
// //   REUSABLE COMPONENTS
// // ----------------------------------------*/

// // function BloodDonationGuide() {
// //   return (
// //     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
// //       <h2 className="text-2xl font-bold text-red-700 mb-4">
// //         Blood Donation Frequency Guide
// //       </h2>

// //       <div className="grid md:grid-cols-2 gap-6">
// //         {[
// //           { type: "Whole Blood", wait: 56, year: 6 },
// //           { type: "Plasma", wait: 2, year: 24 },
// //           { type: "Platelets", wait: 2, year: 24 },
// //           { type: "Red Cells", wait: 112, year: 3 },
// //         ].map((item, i) => (
// //           <div key={i} className="p-5 border rounded-xl shadow">
// //             <h3 className="text-xl font-bold text-red-700">{item.type}</h3>
// //             <p>Can donate every {item.wait} days</p>
// //             <p className="text-sm text-gray-600">
// //               Yearly limit: {item.year} times
// //             </p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function CompatibilityChart() {
// //   const types = [
// //     { type: "O-", donate: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] },
// //     { type: "O+", donate: ["O+", "A+", "B+", "AB+"] },
// //     { type: "A-", donate: ["A-", "A+", "AB-", "AB+"] },
// //     { type: "A+", donate: ["A+", "AB+"] },
// //     { type: "B-", donate: ["B-", "B+", "AB-", "AB+"] },
// //     { type: "B+", donate: ["B+", "AB+"] },
// //     { type: "AB-", donate: ["AB-", "AB+"] },
// //     { type: "AB+", donate: ["AB+"] },
// //   ];

// //   return (
// //     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
// //       <h2 className="text-2xl font-bold text-red-700 mb-4">
// //         Blood Compatibility Chart
// //       </h2>

// //       <div className="grid md:grid-cols-2 gap-6">
// //         {types.map((b, i) => (
// //           <div key={i} className="p-5 border rounded-xl shadow">
// //             <h3 className="text-xl font-bold text-red-700 mb-2">{b.type}</h3>

// //             <p className="text-gray-700">Donates to:</p>

// //             <div className="flex flex-wrap gap-2 mt-1">
// //               {b.donate.map((d, j) => (
// //                 <span
// //                   key={j}
// //                   className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
// //                 >
// //                   {d}
// //                 </span>
// //               ))}
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function ImpactStories() {
// //   const stories = [
// //     { title: "Sarah's Second Chance", img: "/story1.jpg" },
// //     { title: "Newborn Battle Survivor", img: "/story2.jpg" },
// //     { title: "Accident Hero Recovery", img: "/story3.jpg" },
// //   ];

// //   return (
// //     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
// //       <h2 className="text-2xl font-bold text-red-700 mb-4">Stories of Impact</h2>

// //       <div className="grid md:grid-cols-3 gap-6">
// //         {stories.map((story, i) => (
// //           <div key={i} className="rounded-xl overflow-hidden shadow">
// //             <div className="h-40 bg-gray-200"></div>
// //             <div className="p-4 bg-red-50">
// //               <h3 className="font-bold text-red-700">{story.title}</h3>
// //               <p className="text-gray-600 text-sm">
// //                 Your donation made a real difference
// //               </p>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function UrgentRequests({ requests }: any) {
// //   return (
// //     <div className="mt-12">
// //       <h2 className="text-3xl font-bold text-red-700 mb-4">
// //         Nearby Hospitals Requesting Blood
// //       </h2>

// //       <div className="grid md:grid-cols-3 gap-6">
// //         {requests.map((req: any, i: number) => (
// //           <div
// //             key={i}
// //             className="bg-white rounded-xl shadow p-5 border-l-4 border-red-600"
// //           >
// //             <h3 className="text-xl font-bold text-red-700">
// //               {req.hospital || req.hospitalName || "Unknown Hospital"}
// //             </h3>

// //             <p className="text-gray-600 mt-1">
// //               {req.locationKm ? `${req.locationKm} km away` : ""}
// //             </p>

// //             <div className="flex justify-between mt-3">
// //               <span className="font-bold text-red-700">{req.bloodType}</span>
// //               <span className="font-bold">{req.unitsNeeded} units</span>
// //             </div>

// //             <p className="text-sm text-gray-600 mt-2">
// //               Urgency: {req.urgency || "Moderate"}
// //             </p>

// //             {/* FIXED SCHEDULE DONATION LINK */}
// //             <Link
// //               href={`/donor/schedule-donation?requestId=${req._id}&hospital=${encodeURIComponent(
// //                 req.hospital || req.hospitalName || ""
// //               )}&units=${req.unitsNeeded}&bloodType=${req.bloodType}`}
// //               className="w-full"
// //             >
// //               <button className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg">
// //                 Schedule Donation
// //               </button>
// //             </Link>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // "use client";

// // import Link from "next/link";
// // import { useEffect, useState, useRef } from "react";
// // import { jwtDecode } from "jwt-decode";
// // import {
// //   Heart,
// //   Droplet,
// //   MapPin,
// //   CheckCircle,
// //   Play,
// //   Calendar,
// //   Clock,
// //   AlertCircle,
// // } from "lucide-react";
// // import { io } from "socket.io-client";

// // export default function DonorDashboard() {
// //   const [history, setHistory] = useState<any[]>([]);
// //   const [requests, setRequests] = useState<any[]>([]);
// //   const [schedules, setSchedules] = useState<any[]>([]);
// //   const [donorId, setDonorId] = useState<string | null>(null);
// //   const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
// //   const [available, setAvailable] = useState<boolean>(false);
// //   const [showVideo, setShowVideo] = useState(false);

// //   const socketRef = useRef<any>(null);

// //   /* ----------------------------------------------------------
// //       LOAD DONOR ID FROM TOKEN
// //   ----------------------------------------------------------*/
// //   useEffect(() => {
// //     const token = localStorage.getItem("token");
// //     if (token) {
// //       const decoded: any = jwtDecode(token);
// //       setDonorId(decoded.userId);
// //     }
// //   }, []);

// //   /* ----------------------------------------------------------
// //       SOCKET.IO – LISTEN FOR HOSPITAL RESPONSE
// //   ----------------------------------------------------------*/
// //   useEffect(() => {
// //     if (!donorId) return;

// //     const socket = io("http://localhost:5000");
// //     socketRef.current = socket;

// //     socket.emit("register", donorId);

// //     socket.on("schedule_status_updated", (data) => {
// //       setSchedules((prev) =>
// //         prev.map((s) =>
// //           s._id === data.scheduleId ? { ...s, status: data.status } : s
// //         )
// //       );
// //        alert(`Your donation schedule was ${data.status.toUpperCase()}`);
// //     });

// //     return () => socket.disconnect();
// //   }, [donorId]);

// //   /* ----------------------------------------------------------
// //       FETCH DONATION HISTORY
// //   ----------------------------------------------------------*/
// //   useEffect(() => {
// //     if (!donorId) return;

// //     fetch(`http://localhost:5000/donor/history/${donorId}`)
// //       .then((res) => res.json())
// //       .then((data) => setHistory(data.donations || []));
// //   }, [donorId]);

// //   /* ----------------------------------------------------------
// //       FETCH DONOR SCHEDULES
// //   ----------------------------------------------------------*/
// //   useEffect(() => {
// //     if (!donorId) return;

// //     fetch(`http://localhost:5000/schedule/donor/${donorId}`)
// //       .then((res) => res.json())
// //       .then((data) => setSchedules(data.schedules || []));
// //   }, [donorId]);

// //   /* ----------------------------------------------------------
// //       FETCH URGENT REQUESTS
// //   ----------------------------------------------------------*/
// //   useEffect(() => {
// //     fetch("http://localhost:5000/donor/requests")
// //       .then((res) => res.json())
// //       .then((data) => setRequests(data.requests || []));
// //   }, []);

// //   /* ----------------------------------------------------------
// //       LOCATION
// //   ----------------------------------------------------------*/
// //   const getLocation = () => {
// //     navigator.geolocation.getCurrentPosition(
// //       (pos) => {
// //         setLocation({
// //           lat: pos.coords.latitude,
// //           lng: pos.coords.longitude,
// //         });
// //         alert("📍 Location Captured Successfully");
// //       },
// //       () => alert("❌ Please allow location access")
// //     );
// //   };

// //   /* ----------------------------------------------------------
// //       AVAILABILITY
// //   ----------------------------------------------------------*/
// //   const markAvailable = async () => {
// //     if (!location) return alert("Please share your location first");

// //     await fetch("http://localhost:5000/donor/availability", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         donorId,
// //         available: true,
// //         latitude: location.lat,
// //         longitude: location.lng,
// //       }),
// //     });

// //     setAvailable(true);
// //   };

// //   const markUnavailable = async () => {
// //     await fetch("http://localhost:5000/donor/availability", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ donorId, available: false }),
// //     });

// //     setAvailable(false);
// //   };

// //   /* ----------------------------------------------------------
// //       UI SECTION
// //   ----------------------------------------------------------*/
// //   return (
// //     <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
// //       {/* HEADER */}
// //       <header className="bg-red-600 text-white p-6 shadow-lg flex justify-between items-center sticky top-0 z-20">
// //         <div className="flex items-center gap-3 text-2xl font-bold">
// //           <Heart className="w-7 h-7 fill-white" />
// //           Pulse Bank
// //         </div>

// //         <button
// //           onClick={() => {
// //             localStorage.removeItem("token");
// //             window.location.href = "/";
// //           }}
// //           className="p-2 hover:bg-red-500 rounded-lg"
// //         >
// //           Logout
// //         </button>
// //       </header>

// //       {/* MAIN CONTENT */}
// //       <div className="max-w-7xl mx-auto p-6 space-y-12">
// //         {/* HERO */}
// //         <HeroCard
// //           history={history}
// //           location={location}
// //           getLocation={getLocation}
// //           available={available}
// //           markAvailable={markAvailable}
// //           markUnavailable={markUnavailable}
// //         />

// //         {/* VIDEO */}
// //         <VideoSection showVideo={showVideo} setShowVideo={setShowVideo} />

// //         {/* DONATION GUIDE */}
// //         <BloodDonationGuide />

// //         {/* COMPATIBILITY */}
// //         <CompatibilityChart />

// //         {/* IMPACT STORIES */}
// //         <ImpactStories />

// //         {/* ACTIVE REQUESTS */}
// //         <UrgentRequests requests={requests} />

// //         {/* SCHEDULED DONATIONS */}
// //         <ScheduledRequests schedules={schedules} />

// //         {/* DONATION HISTORY */}
// //         <DonationHistory history={history} />
// //       </div>
// //     </main>
// //   );
// // }

// // /* ----------------------------------------------------------
// //     COMPONENTS
// // ----------------------------------------------------------*/

// // function HeroCard({ history, location, getLocation, available, markAvailable, markUnavailable }: any) {
// //   return (
// //     <div className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-red-600 grid md:grid-cols-2">
// //       <div className="p-10">
// //         <h2 className="text-3xl font-bold text-red-700">Welcome Back, Life Saver!</h2>
// //         <p className="text-gray-700 mt-2">Thank you for helping save lives ❤️</p>

// //         <div className="mt-4 space-y-1">
// //           <p><b>{history.length}</b> total donations</p>
// //           <p><b>{history.length * 400}</b> ml contributed</p>
// //         </div>

// //         <div className="mt-6 flex gap-4 flex-wrap">
// //           <button onClick={getLocation} className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow flex gap-2 items-center">
// //             <MapPin /> Share Location
// //           </button>

// //           {!available ? (
// //             <button onClick={markAvailable} className="bg-green-600 text-white px-5 py-3 rounded-lg shadow flex gap-2 items-center">
// //               <CheckCircle /> Mark Available
// //             </button>
// //           ) : (
// //             <button onClick={markUnavailable} className="bg-gray-600 text-white px-5 py-3 rounded-lg shadow flex gap-2 items-center">
// //               Disable Availability
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       <div className="bg-gray-900 flex items-center justify-center">
// //         <Heart className="text-gray-400 w-20 h-20" />
// //       </div>
// //     </div>
// //   );
// // }

// // /* ----------------------------------------------------------
// //     VIDEO SECTION
// // ----------------------------------------------------------*/
// // function VideoSection({ showVideo, setShowVideo }: any) {
// //   return !showVideo ? (
// //     <div className="bg-red-50 mt-8 p-6 rounded-xl flex items-center justify-between border">
// //       <div>
// //         <h3 className="text-2xl font-bold text-red-700">Feel Inspired?</h3>
// //         <p className="text-gray-600">Watch stories of lives changed through donation.</p>
// //       </div>

// //       <button
// //         onClick={() => setShowVideo(true)}
// //         className="bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
// //       >
// //         <Play className="w-5" /> Watch Video
// //       </button>
// //     </div>
// //   ) : (
// //     <div className="mt-8 shadow-lg rounded-xl overflow-hidden border">
// //       <iframe className="w-full aspect-video" src="https://www.youtube.com/embed/_JlmwDqaYA0"></iframe>
// //       <button
// //         onClick={() => setShowVideo(false)}
// //         className="bg-red-600 w-full text-white py-2 font-semibold"
// //       >
// //         Close Video
// //       </button>
// //     </div>
// //   );
// // }

// // /* ----------------------------------------------------------
// //     SCHEDULED DONATIONS
// // ----------------------------------------------------------*/
// // function ScheduledRequests({ schedules }: any) {
// //   if (!schedules.length) return null;

// //   return (
// //     <div className="mt-12">
// //       <h2 className="text-3xl font-bold text-red-700 mb-4">My Scheduled Donations</h2>

// //       <div className="grid md:grid-cols-2 gap-6">
// //         {schedules.map((s: any, i: number) => (
// //           <div key={i} className="bg-white p-5 rounded-xl shadow border-l-4 border-orange-500">
// //             <h3 className="text-xl font-bold text-red-700">Hospital: {s.requestId?.hospital || "N/A"}</h3>

// //             <p className="text-gray-700 mt-2 flex items-center gap-2">
// //               <Calendar className="w-5" /> {s.date}
// //             </p>
// //             <p className="text-gray-700 flex items-center gap-2">
// //               <Clock className="w-5" /> {s.time}
// //             </p>

// //             <p className="mt-3">
// //               Status:{" "}
// //               <span className="px-3 py-1 rounded-lg bg-red-100 text-red-700 font-semibold">
// //                 {s.status.toUpperCase()}
// //               </span>
// //             </p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // /* ----------------------------------------------------------
// //     DONATION HISTORY
// // ----------------------------------------------------------*/
// // function DonationHistory({ history }: any) {
// //   if (!history.length) return null;

// //   return (
// //     <div className="mt-12">
// //       <h2 className="text-3xl font-bold text-red-700 mb-4">My Donation History</h2>

// //       <div className="grid md:grid-cols-3 gap-6">
// //         {history.map((h: any, i: number) => (
// //           <div key={i} className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
// //             <p className="text-xl font-bold">+ {h.units} units</p>
// //             <p className="text-gray-700 mt-1">{new Date(h.date).toLocaleDateString()}</p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // /* ----------------------------------------------------------
// //     OTHER SECTIONS (GUIDE, COMPATIBILITY, IMPACT)
// // ----------------------------------------------------------*/

// // function BloodDonationGuide() {
// //   return (
// //     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
// //       <h2 className="text-2xl font-bold text-red-700 mb-4">Blood Donation Frequency Guide</h2>

// //       <div className="grid md:grid-cols-2 gap-6">
// //         {[
// //           { type: "Whole Blood", wait: 56, year: 6 },
// //           { type: "Plasma", wait: 2, year: 24 },
// //           { type: "Platelets", wait: 2, year: 24 },
// //           { type: "Red Cells", wait: 112, year: 3 },
// //         ].map((item, i) => (
// //           <div key={i} className="p-5 border rounded-xl shadow">
// //             <h3 className="text-xl font-bold text-red-700">{item.type}</h3>
// //             <p>Can donate every {item.wait} days</p>
// //             <p className="text-sm text-gray-600">Yearly limit: {item.year} times</p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function CompatibilityChart() {
// //   const types = [
// //     { type: "O-", donate: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] },
// //     { type: "O+", donate: ["O+", "A+", "B+", "AB+"] },
// //     { type: "A-", donate: ["A-", "A+", "AB-", "AB+"] },
// //     { type: "A+", donate: ["A+", "AB+"] },
// //     { type: "B-", donate: ["B-", "B+", "AB-", "AB+"] },
// //     { type: "B+", donate: ["B+", "AB+"] },
// //     { type: "AB-", donate: ["AB-", "AB+"] },
// //     { type: "AB+", donate: ["AB+"] },
// //   ];

// //   return (
// //     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
// //       <h2 className="text-2xl font-bold text-red-700 mb-4">Blood Compatibility Chart</h2>

// //       <div className="grid md:grid-cols-2 gap-6">
// //         {types.map((b, i) => (
// //           <div key={i} className="p-5 border rounded-xl shadow">
// //             <h3 className="text-xl font-bold text-red-700 mb-2">{b.type}</h3>

// //             <p className="text-gray-700">Donates to:</p>

// //             <div className="flex flex-wrap gap-2 mt-1">
// //               {b.donate.map((d, j) => (
// //                 <span key={j} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
// //                   {d}
// //                 </span>
// //               ))}
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function ImpactStories() {
// //   const stories = [
// //     { title: "Sarah's Second Chance" },
// //     { title: "Newborn Battle Survivor" },
// //     { title: "Accident Hero Recovery" },
// //   ];

// //   return (
// //     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
// //       <h2 className="text-2xl font-bold text-red-700 mb-4">Stories of Impact</h2>

// //       <div className="grid md:grid-cols-3 gap-6">
// //         {stories.map((story, i) => (
// //           <div key={i} className="rounded-xl overflow-hidden shadow bg-red-50 p-4">
// //             <h3 className="font-bold text-red-700">{story.title}</h3>
// //             <p className="text-gray-600 text-sm mt-1">Your donation made a real difference</p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function UrgentRequests({ requests }: any) {
// //   return (
// //     <div className="mt-12">
// //       <h2 className="text-3xl font-bold text-red-700 mb-4">Nearby Hospitals Requesting Blood</h2>

// //       <div className="grid md:grid-cols-3 gap-6">
// //         {requests.map((req: any, i: number) => (
// //           <div
// //             key={i}
// //             className="bg-white rounded-xl shadow p-5 border-l-4 border-red-600"
// //           >
// //             <h3 className="text-xl font-bold text-red-700">{req.hospital}</h3>

// //             <p className="text-gray-600 mt-1">{req.locationKm} km away</p>

// //             <div className="flex justify-between mt-3">
// //               <span className="font-bold text-red-700">{req.bloodType}</span>
// //               <span className="font-bold">{req.unitsNeeded} units</span>
// //             </div>

// //             <p className="text-sm text-gray-600 mt-2">Urgency: {req.urgency}</p>

// //             <Link
// //               href={`/donor/schedule-donation?requestId=${req._id}&hospital=${encodeURIComponent(
// //                 req.hospital
// //               )}&units=${req.unitsNeeded}&bloodType=${req.bloodType}`}
// //               className="w-full"
// //             >
// //               <button className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg">
// //                 Schedule Donation
// //               </button>
// //             </Link>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }
// // "use client";

// // import Link from "next/link";
// // import { useEffect, useState, useRef } from "react";
// // import { jwtDecode } from "jwt-decode";
// // import {
// //   Heart,
// //   MapPin,
// //   CheckCircle,
// //   Play,
// //   Calendar,
// //   Clock,
// // } from "lucide-react";
// // import { io } from "socket.io-client";

// // export default function DonorDashboard() {
// //   const [history, setHistory] = useState<any[]>([]);
// //   const [requests, setRequests] = useState<any[]>([]);
// //   const [schedules, setSchedules] = useState<any[]>([]);
// //   const [donorId, setDonorId] = useState<string | null>(null);

// //   const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
// //   const [available, setAvailable] = useState<boolean>(false);

// //   const [showVideo, setShowVideo] = useState(true); // 🔥 Auto-play video ON login

// //   const socketRef = useRef<any>(null);

// //   /* ----------------------------------------------------------
// //       LOAD DONOR ID
// //   ----------------------------------------------------------*/
// //   useEffect(() => {
// //     const token = localStorage.getItem("token");
// //     if (token) {
// //       const decoded: any = jwtDecode(token);
// //       setDonorId(decoded.userId);
// //     }
// //   }, []);

// //   /* ----------------------------------------------------------
// //       SOCKET – LISTEN FOR HOSPITAL RESPONSE
// //   ----------------------------------------------------------*/
// //   useEffect(() => {
// //     if (!donorId) return;

// //     const socket = io("http://localhost:5000");
// //     socketRef.current = socket;

// //     socket.emit("register", donorId);

// //     socket.on("schedule_status_updated", (data) => {
// //       setSchedules((prev) =>
// //         prev.map((s) =>
// //           s._id === data.scheduleId ? { ...s, status: data.status } : s
// //         )
// //       );
// //       alert(`Your donation schedule was ${data.status.toUpperCase()}`);
// //     });

// //     return () => socket.disconnect();
// //   }, [donorId]);

// //   /* ----------------------------------------------------------
// //       FETCH HISTORY
// //   ----------------------------------------------------------*/
// //   useEffect(() => {
// //     if (!donorId) return;
// //     fetch(`http://localhost:5000/donor/history/${donorId}`)
// //       .then((res) => res.json())
// //       .then((data) => setHistory(data.donations || []));
// //   }, [donorId]);

// //   /* ----------------------------------------------------------
// //       FETCH SCHEDULED DONATIONS
// //   ----------------------------------------------------------*/
// //   useEffect(() => {
// //     if (!donorId) return;
// //     fetch(`http://localhost:5000/schedule/donor/${donorId}`)
// //       .then((res) => res.json())
// //       .then((data) => setSchedules(data.schedules || []));
// //   }, [donorId]);

// //   /* ----------------------------------------------------------
// //       FETCH REQUESTS
// //   ----------------------------------------------------------*/
// //   useEffect(() => {
// //     fetch("http://localhost:5000/donor/requests")
// //       .then((res) => res.json())
// //       .then((data) => setRequests(data.requests || []));
// //   }, []);

// //   /* ----------------------------------------------------------
// //       FIXED LOCATION POPUP FUNCTION
// //   ----------------------------------------------------------*/
// //   const getLocation = () => {
// //     if (!navigator.geolocation) {
// //       alert("❌ Your browser does not support location");
// //       return;
// //     }

// //     navigator.geolocation.getCurrentPosition(
// //       (pos) => {
// //         setLocation({
// //           lat: pos.coords.latitude,
// //           lng: pos.coords.longitude,
// //         });
// //         alert("📍 Location captured successfully!");
// //       },
// //       (err) => {
// //         if (err.code === 1) {
// //           alert("⚠ Please allow location access in browser popup.");
// //         } else {
// //           alert("❌ Unable to fetch location.");
// //         }
// //       },
// //       {
// //         enableHighAccuracy: true, // FORCE POPUP
// //         timeout: 8000,
// //         maximumAge: 0,
// //       }
// //     );
// //   };

// //   /* ----------------------------------------------------------
// //       MARK AVAILABLE ONLY AFTER LOCATION
// //   ----------------------------------------------------------*/
// //   const markAvailable = async () => {
// //     if (!location) return alert("⚠ Please share your location first!");

// //     await fetch("http://localhost:5000/donor/availability", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         donorId,
// //         available: true,
// //         latitude: location.lat,
// //         longitude: location.lng,
// //       }),
// //     });

// //     setAvailable(true);
// //   };

// //   const markUnavailable = async () => {
// //     await fetch("http://localhost:5000/donor/availability", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ donorId, available: false }),
// //     });

// //     setAvailable(false);
// //   };

// //   /* ----------------------------------------------------------
// //       UI SECTION
// //   ----------------------------------------------------------*/
// //   return (
// //     <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">

// //       {/* HEADER */}
// //       <header className="bg-red-600 text-white p-6 shadow-lg flex justify-between items-center sticky top-0 z-20">
// //         <div className="flex items-center gap-3 text-2xl font-bold">
// //           <Heart className="w-7 h-7 fill-white" />
// //           Pulse Bank
// //         </div>

// //         <button
// //           onClick={() => {
// //             localStorage.removeItem("token");
// //             window.location.href = "/";
// //           }}
// //           className="p-2 hover:bg-red-500 rounded-lg"
// //         >
// //           Logout
// //         </button>
// //       </header>

// //       {/* BODY */}
// //       <div className="max-w-7xl mx-auto p-6 space-y-12">

// //         {/* HERO CARD */}
// //         <HeroCard
// //           history={history}
// //           location={location}
// //           getLocation={getLocation}
// //           available={available}
// //           markAvailable={markAvailable}
// //           markUnavailable={markUnavailable}
// //         />

// //         {/* VIDEO SECTION (AUTO-PLAY ON LOGIN) */}
// //         <VideoSection showVideo={showVideo} setShowVideo={setShowVideo} />

// //         <BloodDonationGuide />
// //         <CompatibilityChart />
// //         <ImpactStories />

// //         <UrgentRequests requests={requests} />
// //         <ScheduledRequests schedules={schedules} />
// //         <DonationHistory history={history} />
// //       </div>
// //     </main>
// //   );
// // }

// // /* ----------------------------------------------------------
// //     HERO CARD
// // ----------------------------------------------------------*/
// // function HeroCard({ history, location, getLocation, available, markAvailable, markUnavailable }: any) {
// //   return (
// //     <div className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-red-600 grid md:grid-cols-2">
// //       <div className="p-10">
// //         <h2 className="text-3xl font-bold text-red-700">Welcome Back, Life Saver!</h2>

// //         <div className="mt-4">
// //           <p><b>{history.length}</b> total donations</p>
// //           <p><b>{history.length * 400}</b> ml contributed</p>
// //         </div>

// //         <div className="mt-6 flex gap-4">
// //           <button onClick={getLocation} className="bg-blue-600 text-white px-5 py-3 rounded-lg flex items-center gap-2">
// //             <MapPin /> Share Location
// //           </button>

// //           {!available ? (
// //             <button onClick={markAvailable} className="bg-green-600 text-white px-5 py-3 rounded-lg flex gap-2 items-center">
// //               <CheckCircle /> Mark Available
// //             </button>
// //           ) : (
// //             <button onClick={markUnavailable} className="bg-gray-600 text-white px-5 py-3 rounded-lg flex gap-2 items-center">
// //               Disable Availability
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       <div className="bg-gray-900 flex items-center justify-center">
// //         <Heart className="text-gray-400 w-20 h-20" />
// //       </div>
// //     </div>
// //   );
// // }

// // /* ----------------------------------------------------------
// //     VIDEO - AUTO OPEN ON LOGIN
// // ----------------------------------------------------------*/
// // function VideoSection({ showVideo, setShowVideo }: any) {
// //   return showVideo ? (
// //     <div className="mt-8 shadow-xl rounded-xl border overflow-hidden">
// //       <iframe
// //         className="w-full aspect-video"
// //         src="https://www.youtube.com/embed/_JlmwDqaYA0?autoplay=1" // AUTO-PLAY ENABLED
// //       ></iframe>

// //       <button
// //         onClick={() => setShowVideo(false)}
// //         className="bg-red-600 w-full text-white py-2"
// //       >
// //         Close Video
// //       </button>
// //     </div>
// //   ) : null;
// // }

// // /* ----------------------------------------------------------
// //     OTHER SECTIONS
// // ----------------------------------------------------------*/

// // function ScheduledRequests({ schedules }: any) {
// //   if (!schedules.length) return null;
// //   return (
// //     <div className="mt-12">
// //       <h2 className="text-3xl font-bold text-red-700 mb-4">My Scheduled Donations</h2>

// //       <div className="grid md:grid-cols-2 gap-6">
// //         {schedules.map((s: any, i: number) => (
// //           <div key={i} className="bg-white p-5 rounded-xl shadow border-l-4 border-orange-500">
// //             <h3 className="text-xl font-bold text-red-700">Hospital: {s.requestId?.hospital}</h3>

// //             <p className="mt-2 flex gap-2"><Calendar /> {s.date}</p>
// //             <p className="flex gap-2"><Clock /> {s.time}</p>

// //             <p className="mt-3 font-semibold">
// //               Status: <span className="bg-red-100 px-3 py-1 rounded-lg">{s.status.toUpperCase()}</span>
// //             </p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function DonationHistory({ history }: any) {
// //   if (!history.length) return null;

// //   return (
// //     <div className="mt-12">
// //       <h2 className="text-3xl font-bold text-red-700 mb-4">My Donation History</h2>

// //       <div className="grid md:grid-cols-3 gap-6">
// //         {history.map((h: any, i: number) => (
// //           <div key={i} className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
// //             <p className="text-xl font-bold">+ {h.units} units</p>
// //             <p>{new Date(h.date).toLocaleDateString()}</p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function ImpactStories() {
// //   return (
// //     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
// //       <h2 className="text-2xl font-bold text-red-700 mb-4">Stories of Impact</h2>

// //       <div className="grid md:grid-cols-3 gap-6">
// //         {["Sarah's Second Chance", "Newborn Battle Survivor", "Accident Hero Recovery"].map((title, i) => (
// //           <div key={i} className="p-4 rounded-xl shadow bg-red-50">
// //             <h3 className="font-bold text-red-700">{title}</h3>
// //             <p className="text-gray-600 text-sm">Your donation made a difference ❤️</p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function UrgentRequests({ requests }: any) {
// //   return (
// //     <div className="mt-12">
// //       <h2 className="text-3xl font-bold text-red-700 mb-4">Nearby Hospitals Requesting Blood</h2>

// //       <div className="grid md:grid-cols-3 gap-6">
// //         {requests.map((req: any, i: number) => (
// //           <div key={i} className="bg-white rounded-xl shadow p-5 border-l-4 border-red-600">
// //             <h3 className="text-xl font-bold text-red-700">{req.hospital}</h3>

// //             <p className="text-gray-600 mt-1">{req.locationKm} km away</p>

// //             <div className="flex justify-between mt-3">
// //               <span className="font-bold">{req.bloodType}</span>
// //               <span className="font-bold">{req.unitsNeeded} units</span>
// //             </div>

// //             <Link
// //               href={`/donor/schedule-donation?requestId=${req._id}&hospital=${encodeURIComponent(
// //                 req.hospital
// //               )}&units=${req.unitsNeeded}&bloodType=${req.bloodType}`}
// //             >
// //               <button className="w-full mt-4 bg-red-600 text-white py-3 rounded-lg">
// //                 Schedule Donation
// //               </button>
// //             </Link>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // /* ----------------------------------------------------------
// //     BLOOD GUIDE + COMPATIBILITY CHART
// // ----------------------------------------------------------*/

// // function BloodDonationGuide() {
// //   return (
// //     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
// //       <h2 className="text-2xl font-bold text-red-700 mb-4">Blood Donation Frequency Guide</h2>

// //       <div className="grid md:grid-cols-2 gap-6">
// //         {[
// //           { type: "Whole Blood", wait: 56, year: 6 },
// //           { type: "Plasma", wait: 2, year: 24 },
// //           { type: "Platelets", wait: 2, year: 24 },
// //           { type: "Red Cells", wait: 112, year: 3 },
// //         ].map((item, i) => (
// //           <div key={i} className="p-5 border rounded-xl shadow">
// //             <h3 className="font-bold text-red-700">{item.type}</h3>
// //             <p>Every {item.wait} days</p>
// //             <p className="text-gray-500 text-sm">Annual limit: {item.year}</p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function CompatibilityChart() {
// //   const types = [
// //     { type: "O-", donate: ["Everyone"] },
// //     { type: "O+", donate: ["O+", "A+", "B+", "AB+"] },
// //     { type: "A-", donate: ["A-", "A+", "AB-", "AB+"] },
// //     { type: "A+", donate: ["A+", "AB+"] },
// //     { type: "B-", donate: ["B-", "B+", "AB-", "AB+"] },
// //     { type: "B+", donate: ["B+", "AB+"] },
// //     { type: "AB-", donate: ["AB-", "AB+"] },
// //     { type: "AB+", donate: ["AB+"] },
// //   ];

// //   return (
// //     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
// //       <h2 className="text-2xl font-bold text-red-700 mb-4">Blood Compatibility Chart</h2>

// //       <div className="grid md:grid-cols-2 gap-6">
// //         {types.map((b, i) => (
// //           <div key={i} className="p-5 border rounded-xl shadow">
// //             <h3 className="font-bold text-red-700 mb-2">{b.type}</h3>
// //             <p>Donates to:</p>
// //             <div className="flex flex-wrap gap-2 mt-1">
// //               {b.donate.map((d, j) => (
// //                 <span key={j} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
// //                   {d}
// //                 </span>
// //               ))}
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import Link from "next/link";
// import { useEffect, useState, useRef } from "react";
// import { jwtDecode } from "jwt-decode";
// import {
//   Heart,
//   MapPin,
//   CheckCircle,
//   Play,
//   Calendar,
//   Clock,
// } from "lucide-react";
// import { io } from "socket.io-client";

// export default function DonorDashboard() {
//   const [history, setHistory] = useState<any[]>([]);
//   const [requests, setRequests] = useState<any[]>([]);
//   const [schedules, setSchedules] = useState<any[]>([]);
//   const [donorId, setDonorId] = useState<string | null>(null);

//   const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [available, setAvailable] = useState<boolean>(false);

//   const [showVideo, setShowVideo] = useState(true); // autoplay

//   const socketRef = useRef<any>(null);

//   /* ----------------------------------------------
//         LOAD DONOR ID
//   ----------------------------------------------*/
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       const decoded: any = jwtDecode(token);
//       setDonorId(decoded.userId);
//     }
//   }, []);

//   /* ----------------------------------------------
//         SOCKET.IO — HOSPITAL RESPONSE LISTENER
//   ----------------------------------------------*/
//   useEffect(() => {
//     if (!donorId) return;

//     const socket = io("http://localhost:5000");
//     socketRef.current = socket;

//     socket.emit("register", donorId);

//     socket.on("schedule_status_updated", (data) => {
//       setSchedules((prev) =>
//         prev.map((s) =>
//           s._id === data.scheduleId ? { ...s, status: data.status } : s
//         )
//       );

//       alert(`Your donation schedule was ${data.status.toUpperCase()}`);
//     });

//     return () => socket.disconnect();
//   }, [donorId]);

//   /* ----------------------------------------------
//         FETCH DONATION HISTORY
//   ----------------------------------------------*/
//   useEffect(() => {
//     if (!donorId) return;

//     fetch(`http://localhost:5000/donor/history/${donorId}`)
//       .then((res) => res.json())
//       .then((data) => setHistory(data.donations || []));
//   }, [donorId]);

//   /* ----------------------------------------------
//         FETCH DONOR SCHEDULES
//   ----------------------------------------------*/
//   useEffect(() => {
//     if (!donorId) return;

//     fetch(`http://localhost:5000/schedule/donor/${donorId}`)
//       .then((res) => res.json())
//       .then((data) => setSchedules(data.schedules || []));
//   }, [donorId]);

//   /* ----------------------------------------------
//         FETCH ACTIVE REQUESTS
//   ----------------------------------------------*/
//   useEffect(() => {
//     fetch("http://localhost:5000/donor/requests")
//       .then((res) => res.json())
//       .then((data) => setRequests(data.requests || []));
//   }, []);

//   /* ----------------------------------------------
//         FIXED LOCATION POPUP — MANUAL ONLY
//   ----------------------------------------------*/
//   const getLocation = () => {
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLocation({
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         });
//         alert("📍 Location captured successfully!");
//       },
//       (err) => {
//         if (err.code === 1) {
//           alert("⚠ Please ALLOW location access in the popup.");
//         } else {
//           alert("❌ Unable to fetch location.");
//         }
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 8000,
//         maximumAge: 0,
//       }
//     );
//   };

//   /* ----------------------------------------------
//         AVAILABLE ONLY AFTER LOCATION
//   ----------------------------------------------*/
//   const markAvailable = async () => {
//     if (!location) return alert("⚠ Please click Share Location first!");

//     await fetch("http://localhost:5000/donor/availability", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         donorId,
//         available: true,
//         latitude: location.lat,
//         longitude: location.lng,
//       }),
//     });

//     setAvailable(true);
//     alert("You are now available for hospitals!");
//   };

//   const markUnavailable = async () => {
//     await fetch("http://localhost:5000/donor/availability", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ donorId, available: false }),
//     });

//     setAvailable(false);
//   };

//   /* ----------------------------------------------
//         UI SECTION — NO UI CHANGES DONE
//   ----------------------------------------------*/
//   return (
//     <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">

//       {/* HEADER */}
//       <header className="bg-red-600 text-white p-6 shadow-lg flex justify-between items-center sticky top-0">
//         <div className="flex items-center gap-3 text-2xl font-bold">
//           <Heart className="w-7 h-7 fill-white" /> Pulse Bank
//         </div>

//         <button
//           onClick={() => {
//             localStorage.removeItem("token");
//             window.location.href = "/";
//           }}
//           className="p-2 hover:bg-red-500 rounded-lg"
//         >
//           Logout
//         </button>
//       </header>

//       {/* BODY */}
//       <div className="max-w-7xl mx-auto p-6 space-y-12">

//         {/* HERO */}
//         <HeroCard
//           history={history}
//           location={location}
//           getLocation={getLocation}
//           available={available}
//           markAvailable={markAvailable}
//           markUnavailable={markUnavailable}
//         />

//         {/* VIDEO — AUTOPLAY */}
//         <VideoSection showVideo={showVideo} setShowVideo={setShowVideo} />

//         <BloodDonationGuide />
//         <CompatibilityChart />
//         <ImpactStories />

//         <UrgentRequests requests={requests} />
//         <ScheduledRequests schedules={schedules} />
//         <DonationHistory history={history} />
//       </div>
//     </main>
//   );
// }

// /* ----------------------------------------------------------

//         </div>

//         <div className="mt-6 flex gap-4">
//           <button onClick={getLocation} className="bg-blue-600 text-white px-5 py-3 rounded-lg flex items-center gap-2">
//             <MapPin /> Share Location
//           </button>

//           {!available ? (
//             <button onClick={markAvailable} className="bg-green-600 text-white px-5 py-3 rounded-lg flex items-center gap-2">
//               <CheckCircle /> Mark Available
//             </button>
//           ) : (
//             <button onClick={markUnavailable} className="bg-gray-600 text-white px-5 py-3 rounded-lg">
//               Disable Availability
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="bg-gray-900 flex items-center justify-center">
//         <Heart className="text-gray-400 w-20 h-20" />
//       </div>
//     </div>
//   );
// }

// /* ----------------------------------------------------------
//     VIDEO SECTION — AUTO PLAY ENABLED
// ----------------------------------------------------------*/
// function VideoSection({ showVideo, setShowVideo }: any) {
//   return showVideo ? (
//     <div className="mt-8 shadow-xl rounded-xl border overflow-hidden">
//       <iframe
//         className="w-full aspect-video"
//         src="https://www.youtube.com/embed/_JlmwDqaYA0?autoplay=1"
//       ></iframe>

//       <button
//         onClick={() => setShowVideo(false)}
//         className="bg-red-600 w-full text-white py-2"
//       >
//         Close Video
//       </button>
//     </div>
//   ) : null;
// }

// /* ----------------------------------------------------------
//     OTHER SECTIONS (UNCHANGED)
// ----------------------------------------------------------*/

// function ScheduledRequests({ schedules }: any) {
//   if (!schedules.length) return null;
//   return (
//     <div className="mt-12">
//       <h2 className="text-3xl font-bold text-red-700 mb-4">My Scheduled Donations</h2>

//       <div className="grid md:grid-cols-2 gap-6">
//         {schedules.map((s: any, i: number) => (
//           <div key={i} className="bg-white p-5 rounded-xl shadow border-l-4 border-orange-500">
//             <h3 className="text-xl font-bold text-red-700">Hospital: {s.requestId?.hospital}</h3>

//             <p className="mt-2 flex gap-2"><Calendar /> {s.date}</p>
//             <p className="flex gap-2"><Clock /> {s.time}</p>

//             <p className="mt-3 font-semibold">
//               Status: <span className="bg-red-100 px-3 py-1 rounded-lg">{s.status.toUpperCase()}</span>
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function DonationHistory({ history }: any) {
//   if (!history.length) return null;
//   return (
//     <div className="mt-12">
//       <h2 className="text-3xl font-bold text-red-700 mb-4">My Donation History</h2>

//       <div className="grid md:grid-cols-3 gap-6">
//         {history.map((h: any, i: number) => (
//           <div key={i} className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
//             <p className="text-xl font-bold">+ {h.units} units</p>
//             <p>{new Date(h.date).toLocaleDateString()}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function ImpactStories() {
//   return (
//     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
//       <h2 className="text-2xl font-bold text-red-700 mb-4">Stories of Impact</h2>

//       <div className="grid md:grid-cols-3 gap-6">
//         {["Sarah's Second Chance", "Newborn Battle Survivor", "Accident Hero Recovery"].map((title, i) => (
//           <div key={i} className="p-4 rounded-xl shadow bg-red-50">
//             <h3 className="font-bold text-red-700">{title}</h3>
//             <p className="text-gray-600 text-sm">Your donation made a difference ❤️</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function UrgentRequests({ requests }: any) {
//   return (
//     <div className="mt-12">
//       <h2 className="text-3xl font-bold text-red-700 mb-4">Nearby Hospitals Requesting Blood</h2>

//       <div className="grid md:grid-cols-3 gap-6">
//         {requests.map((req: any, i) => (
//           <div key={i} className="bg-white rounded-xl shadow p-5 border-l-4 border-red-600">
//             <h3 className="text-xl font-bold text-red-700">{req.hospital}</h3>

//             <p className="text-gray-600 mt-1">{req.locationKm} km away</p>

//             <div className="flex justify-between mt-3">
//               <span className="font-bold">{req.bloodType}</span>
//               <span className="font-bold">{req.unitsNeeded} units</span>
//             </div>

//             <Link
//               href={`/donor/schedule-donation?requestId=${req._id}&hospital=${encodeURIComponent(
//                 req.hospital
//               )}&units=${req.unitsNeeded}&bloodType=${req.bloodType}`}
//             >
//               <button className="w-full mt-4 bg-red-600 text-white py-3 rounded-lg">
//                 Schedule Donation
//               </button>
//             </Link>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function BloodDonationGuide() {
//   return (
//     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
//       <h2 className="text-2xl font-bold text-red-700 mb-4">Blood Donation Frequency Guide</h2>

//       <div className="grid md:grid-cols-2 gap-6">
//         {[{ type: "Whole Blood", wait: 56, year: 6 },
//           { type: "Plasma", wait: 2, year: 24 },
//           { type: "Platelets", wait: 2, year: 24 },
//           { type: "Red Cells", wait: 112, year: 3 }].map((i, index) => (
//           <div key={index} className="p-5 border rounded-xl shadow">
//             <h3 className="font-bold text-red-700">{i.type}</h3>
//             <p>Every {i.wait} days</p>
//             <p className="text-gray-500 text-sm">Annual limit: {i.year}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function CompatibilityChart() {
//   const types = [
//     { type: "O-", donate: ["Everyone"] },
//     { type: "O+", donate: ["O+", "A+", "B+", "AB+"] },
//     { type: "A-", donate: ["A-", "A+", "AB-", "AB+"] },
//     { type: "A+", donate: ["A+", "AB+"] },
//     { type: "B-", donate: ["B-", "B+", "AB-", "AB+"] },
//     { type: "B+", donate: ["B+", "AB+"] },
//     { type: "AB-", donate: ["AB-", "AB+"] },
//     { type: "AB+", donate: ["AB+"] },
//   ];

//   return (
//     <div className="mt-10 p-6 bg-white rounded-xl shadow border">
//       <h2 className="text-2xl font-bold text-red-700 mb-4">Blood Compatibility Chart</h2>

//       <div className="grid md:grid-cols-2 gap-6">
//         {types.map((b, i) => (
//           <div key={i} className="p-5 border rounded-xl shadow">
//             <h3 className="font-bold text-red-700 mb-2">{b.type}</h3>
//             <p>Donates to:</p>

//             <div className="flex flex-wrap gap-2 mt-1">
//               {b.donate.map((d, j) => (
//                 <span
//                   key={j}
//                   className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
//                 >
//                   {d}
//                 </span>
//               ))}
//             </div>

//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Heart,
  Droplet,
  MapPin,
  CheckCircle,
  Play,
  Calendar,
  Clock,
  FileText,
  Gift,
  LogOut,
  X,
  Droplets,
  Hospital,
  Baby,
  Target,
  Zap,
  Star,
  Ambulance,
  AlertCircle,
} from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

export default function DonorDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [hospitalRequests, setHospitalRequests] = useState<any[]>([]);
  const [recipientRequests, setRecipientRequests] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [donorId, setDonorId] = useState<string | null>(null);
  const [donorName, setDonorName] = useState("Donor");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorImage, setDonorImage] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [available, setAvailable] = useState<boolean>(false);
  const [locationSharing, setLocationSharing] = useState<boolean>(false);
  const [sleepTime, setSleepTime] = useState<number>(20);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);

  // Auto-play video ON login, user asked this. Use true initially.
  const [showVideo, setShowVideo] = useState<boolean>(true);

  // Donation confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const socketRef = useSocket();

  // Motivational quotes for blood donors
  const motivationalQuotes = [
    "🩸 Your donation saves up to 3 lives. Be a hero today!",
    "🩸 One donation, three lives. You have the power to help.",
    "🩸 Blood donation is a gift of love. Give today, save a life tomorrow.",
    "🩸 Donate blood. It's the simplest way to make a difference.",
    "🩸 Every drop counts. Your blood donation matters more than you know.",
    "🩸 Be someone's type O positive. Donate blood today.",
    "🩸 A patient without blood is a patient without hope. Donate now.",
    "🩸 Your generosity flows through us. Thank you for donating!",
    "🩸 Blood donation is the greatest gift of all. Keep giving.",
    "🩸 Donate blood and become a real-life superhero."
  ];

  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ----------------------------------------------------------
      REFRESH ALL DATA
  ----------------------------------------------------------*/
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Fetch history and schedules
    if (donorId) {
      try {
        const historyRes = await fetch(`http://localhost:5000/donor/history/${donorId}`);
        const historyData = await historyRes.json();
        setHistory(historyData.donations || []);

        const schedulesRes = await fetch(`http://localhost:5000/schedule/donor/${donorId}`);
        const schedulesData = await schedulesRes.json();
        setSchedules(schedulesData.schedules || []);
      } catch (err) {
        console.error("Refresh error:", err);
      }
    }
    // Fetch all requests
    await loadRequests();
    setIsRefreshing(false);
  };

  /* ----------------------------------------------------------
      LOAD DONOR ID (from token)
  ----------------------------------------------------------*/
  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setDonorId(decoded.userId);
      } catch (e) {
        console.error("Invalid token", e);
      }
    }
    if (stored) {
      const user = JSON.parse(stored);
      console.log("[Dashboard] Loading user from localStorage:", user);
      console.log("[Dashboard] Profile image:", user.profileImage);
      setDonorName(user.fullName || "Donor");
      setDonorEmail(user.email || "");
      setDonorPhone(user.phone || "");
      setDonorImage(user.profileImage || "");
      // Load availability status
      setAvailable(user.available || false);
      setSleepTime(user.sleepTime || 20);
      
      // Check if location sharing was auto-disabled due to sleep time expiry
      if (user.locationSharingStoppedAt) {
        const stoppedTime = new Date(user.locationSharingStoppedAt).getTime();
        const sleepDuration = (user.sleepTime || 20) * 60 * 1000; // Convert to milliseconds
        const currentTime = new Date().getTime();
        
        if (currentTime - stoppedTime > sleepDuration) {
          // Sleep time has expired, clear location
          setLocationSharing(false);
          setLocation(null);
          // Clear from localStorage and backend
          user.locationSharingStoppedAt = null;
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          // Still within sleep time
          setLocationSharing(true);
        }
      } else {
        setLocationSharing(user.locationSharing || false);
      }
    }
  }, []);

  // Keep donor info (including avatar) in sync with profile page updates
  useEffect(() => {
    const onUserUpdated = (event: any) => {
      const updated = event?.detail || {};
      setDonorName(updated.fullName || "Donor");
      setDonorEmail(updated.email || "");
      setDonorPhone(updated.phone || "");
      setDonorImage(updated.profileImage || "");
    };

    window.addEventListener("user-updated", onUserUpdated as EventListener);
    return () => window.removeEventListener("user-updated", onUserUpdated as EventListener);
  }, []);

  // Also sync when localStorage changes (e.g., profile updated in another tab)
  useEffect(() => {
    const syncFromStorage = () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      try {
        const parsed = JSON.parse(storedUser);
        setDonorName(parsed.fullName || "Donor");
        setDonorEmail(parsed.email || "");
        setDonorPhone(parsed.phone || "");
        setDonorImage(parsed.profileImage || "");
      } catch (e) {
        console.error("Unable to parse stored user", e);
      }
    };

    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  /* Rotate motivational quotes every 8 seconds */
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % motivationalQuotes.length);
    }, 8000);
    return () => clearInterval(quoteInterval);
  }, [motivationalQuotes.length]);

  /* ----------------------------------------------------------
      SOCKET – LISTEN FOR REAL-TIME UPDATES
  ----------------------------------------------------------*/
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("register", donorId);

    socket.on("schedule_status_updated", (data: any) => {
      console.log("[Socket] Schedule status updated:", data);
      setSchedules((prev) =>
        prev.map((s) => (s._id === data.scheduleId ? { ...s, status: data.status } : s))
      );
      loadSchedules(); // Reload all schedules and requests
      alert(`Your donation schedule was ${data.status.toUpperCase()}`);
    });

    // Listen for new requests created by hospitals and auto-refresh
    socket.on("request_created", (payload: any) => {
      if (!payload || !payload._id) return;
      setRequests((prev) => (prev.some((r: any) => r._id === payload._id) ? prev : [payload, ...prev]));

      // Insert into hospitalRequests or recipientRequests depending on flag
      if (payload.isRecipientRequest) {
        setRecipientRequests((prev) => (prev.some((r: any) => r._id === payload._id) ? prev : [payload, ...prev]));
      } else if (payload.hospital && payload.hospital !== "") {
        setHospitalRequests((prev) => (prev.some((r: any) => r._id === payload._id) ? prev : [payload, ...prev]));
      }

      console.log("New request created:", payload);
    });

    // Listen for availability changes from other donors (optional)
    socket.on("availability_changed", (payload: any) => {
      console.log("Donor availability updated:", payload);
    });

    // Listen for request fulfilled (when hospital marks donation completed)
    socket.on("request_fulfilled", (payload: any) => {
      // Remove fulfilled request from active requests
      setRequests((prev) => prev.filter((r: any) => r._id !== payload.requestId));
      setHospitalRequests((prev) => prev.filter((r: any) => r._id !== payload.requestId));
      setRecipientRequests((prev) => prev.filter((r: any) => r._id !== payload.requestId));
      
      // Add to history
      setHistory((prev) => [...prev, {
        _id: payload.requestId,
        units: payload.unitsNeeded,
        bloodType: payload.bloodType,
        date: new Date(),
      }]);
    });

    // Listen for donation confirmation/rejection status updates
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
      socket.off("schedule_status_updated");
      socket.off("request_created");
      socket.off("availability_changed");
      socket.off("request_fulfilled");
      socket.off("request_confirmed");
      socket.off("donation_completed");
    };
  }, [donorId, socketRef]);

  /* ----------------------------------------------------------
      FETCH HISTORY
  ----------------------------------------------------------*/
  useEffect(() => {
    if (!donorId) return;
    fetch(`http://localhost:5000/donor/history/${donorId}`)
      .then((res) => res.json())
      .then((data) => setHistory(data.donations || []))
      .catch((err) => console.error("history fetch error", err));
  }, [donorId]);

  /* ----------------------------------------------------------
      FETCH SCHEDULES (with deduplication)
  ----------------------------------------------------------*/
  const loadRequests = async () => {
    try {
      const reqRes = await fetch("http://localhost:5000/request/all");
      const reqData = await reqRes.json();
      const all = reqData.requests || [];
      
      // Calculate distance from donor location to hospital location
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10; // Round to 1 decimal place
      };
      
      // Add calculated distance if donor location exists
      const withDistances = all.map((r: any) => {
        if (location && r.location && r.location.latitude && r.location.longitude) {
          const distance = calculateDistance(
            location.lat,
            location.lng,
            r.location.latitude,
            r.location.longitude
          );
          return { ...r, calculatedDistance: distance };
        }
        return r;
      });
      
      const hospitals = withDistances.filter((r: any) => r.hospital && r.hospital !== "" && !r.isRecipientRequest);
      const recipients = withDistances.filter((r: any) => r.isRecipientRequest || !r.hospital || r.hospital === "");
      
      // Deduplicate hospitals by hospital name (keep only the first occurrence)
      const uniqueHospitals = Array.from(
        new Map(hospitals.map((h: any) => [h.hospital, h])).values()
      );
      
      setHospitalRequests(uniqueHospitals);
      setRecipientRequests(recipients);
      setRequests(withDistances);
      console.log("[Dashboard] Loaded requests - Hospitals:", uniqueHospitals.length, "Recipients:", recipients.length);
    } catch (err) {
      console.error("Request fetch error:", err);
    }
  };

  const loadSchedules = async () => {
    if (!donorId) return;
    try {
      const res = await fetch(`http://localhost:5000/schedule/donor/${donorId}`);
      const data = await res.json();
      const allSchedules = data.schedules || [];
      // Remove duplicates based on requestId
      const uniqueSchedules = Array.from(
        new Map(
          allSchedules.map((s: any) => [
            s.requestId?._id || s.requestId || s._id,
            s,
          ])
        ).values()
      );
      setSchedules(uniqueSchedules);
      console.log("[Dashboard] Loaded schedules:", uniqueSchedules);
      // Reload requests after schedules to show updated request status
      loadRequests();
    } catch (err) {
      console.error("schedules fetch err", err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [donorId]);

  // Auto-refresh schedules when page loads (in case coming back from schedule page)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSchedules();
    }, 500);
    return () => clearTimeout(timer);
  }, [donorId]);

  // Auto-request location on page load if not already shared
  useEffect(() => {
    if (!location && donorId) {
      const timer = setTimeout(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLocation(newLocation);
            console.log("[Donor Dashboard] Location auto-requested:", pos.coords);
          },
          (err) => {
            console.log("[Donor Dashboard] Location permission denied or error:", err);
            // Still load requests even if location fails - they'll show without distance filter
            loadRequests();
          },
          { enableHighAccuracy: true, timeout: 15000 }
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [donorId]);

  // Reload requests whenever location changes to update distance calculations
  useEffect(() => {
    if (location) {
      loadRequests();
    }
  }, [location]);

  /* ----------------------------------------------------------
      FETCH URGENT REQUESTS & CALCULATE DISTANCES
  ----------------------------------------------------------*/
  // Handled by loadRequests() function and its useEffect hook

  /* ----------------------------------------------------------
      getLocation (explicit click -> forces browser permission popup)
      - we DO NOT auto-mark available here.
  ----------------------------------------------------------*/
  const requestLocation = () => {
    if (!navigator.geolocation) return alert("Your browser does not support location");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        console.log("[Donor Dashboard] Location shared:", newLocation);
        setLocation(newLocation);
        setLocationSharing(true);
        // Save to localStorage
        const stored = localStorage.getItem("user");
        if (stored) {
          const user = JSON.parse(stored);
          user.locationSharing = true;
          user.locationSharingStoppedAt = null;
          localStorage.setItem("user", JSON.stringify(user));
        }
        // Force reload requests immediately
        loadRequests();
        alert("Location captured and sharing enabled");
      },
      (err) => {
        console.error("[Donor Dashboard] Geolocation error:", err);
        if (err.code === 1) alert("Please allow location access");
        else alert("Unable to fetch location");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  /* ----------------------------------------------------------
      markAvailable: only marks available after user clicked "Share Location" (so location exists)
  ----------------------------------------------------------*/
  const markAvailable = async () => {
    if (!donorId) return alert("⚠ Not logged in");
    if (!location) return alert("⚠ Please share your location first!");

    try {
      const res = await fetch("http://localhost:5000/donor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorId,
          available: true,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAvailable(true);
        // Save to localStorage
        const stored = localStorage.getItem("user");
        if (stored) {
          const user = JSON.parse(stored);
          user.available = true;
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        alert("Error: " + (data.message || "Could not mark available"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error while marking availability");
    }
  };

  const markUnavailable = async () => {
    if (!donorId) return alert("⚠ Not logged in");
    try {
      const res = await fetch("http://localhost:5000/donor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorId, available: false }),
      });
      const data = await res.json();
      if (data.success) {
        setAvailable(false);
        // Save to localStorage
        const stored = localStorage.getItem("user");
        if (stored) {
          const user = JSON.parse(stored);
          user.available = false;
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        alert("Error: " + (data.message || "Could not mark unavailable"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error while marking unavailable");
    }
  };

  const stopLocationSharing = () => {
    setLocationSharing(false);
    setLocation(null);
    
    // Save to localStorage
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      user.locationSharing = false;
      user.locationSharingStoppedAt = null;
      localStorage.setItem("user", JSON.stringify(user));
    }
    alert("Location sharing stopped");
  };

  /* ----------------------------------------------------------
      DONATION CONFIRMATION HANDLERS
  ----------------------------------------------------------*/
  const handleOpenConfirmModal = (request: any) => {
    setSelectedRequest(request);
    setShowConfirmModal(true);
  };

  const handleConfirmDonation = async () => {
    if (!selectedRequest) return;
    
    // Call API to confirm donation
    setConfirmLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/request/${selectedRequest._id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "Confirmed",
          confirmedBy: donorId,
          notes: "Donor confirmed and will proceed to schedule donation.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Send emails to hospital, donor, and recipient
        try {
          await fetch("http://localhost:5000/email/send-donation-scheduled", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requestId: selectedRequest._id,
              donorId: donorId,
              donorName: donorName,
              donorEmail: donorEmail,
              hospital: selectedRequest.hospital,
              bloodType: selectedRequest.bloodType,
              units: selectedRequest.unitsNeeded,
              recipientName: selectedRequest.recipientName,
              recipientEmail: selectedRequest.recipientEmail,
              isRecipientRequest: selectedRequest.isRecipientRequest,
            }),
          });
        } catch (emailErr) {
          console.error("Error sending emails:", emailErr);
        }

        // Close modal and navigate to schedule page
        setShowConfirmModal(false);
        window.location.href = `/donor/schedule-donation?requestId=${selectedRequest._id}&hospital=${encodeURIComponent(
          selectedRequest.hospital || ""
        )}&units=${selectedRequest.unitsNeeded}&bloodType=${selectedRequest.bloodType}`;
      } else {
        alert("Error confirming donation: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error confirming donation:", err);
      alert("Network error while confirming donation");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRejectDonation = async (notes?: string) => {
    if (!selectedRequest) return;

    setConfirmLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/request/${selectedRequest._id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "Rejected",
          confirmedBy: donorId,
          notes: notes || "Donor rejected donation request.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state to reflect rejection
        setHospitalRequests((prev) =>
          prev.map((r) =>
            r._id === selectedRequest._id
              ? { ...r, confirmationStatus: "Rejected" }
              : r
          )
        );
        setRecipientRequests((prev) =>
          prev.map((r) =>
            r._id === selectedRequest._id
              ? { ...r, confirmationStatus: "Rejected" }
              : r
          )
        );
        setShowConfirmModal(false);
        alert("Donation rejected. Hospital has been notified.");
      } else {
        alert("Error rejecting donation: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error rejecting donation:", err);
      alert("Network error while rejecting donation");
    } finally {
      setConfirmLoading(false);
    }
  };

  /* ----------------------------------------------------------
      UI
  ----------------------------------------------------------*/
  return (
    <main className="min-h-screen bg-linear-to-br from-white via-red-50 to-white">
      {/* HEADER */}
      <header className="bg-red-600 text-white p-6 shadow-lg flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <Heart className="w-7 h-7 fill-white" />
          {donorName}
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
                <p className="font-bold text-lg text-red-700">{donorName}</p>
                <p className="text-sm text-gray-600 mt-1">{donorEmail}</p>
                <p className="text-sm text-gray-600">{donorPhone}</p>
              </div>
              
              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/donor/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-gray-800 transition border-l-4 border-transparent hover:border-red-600"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FileText className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Edit Profile</span>
                </Link>
                <Link
                  href="/donor/history"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-gray-800 transition border-l-4 border-transparent hover:border-orange-600"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">View History</span>
                </Link>
                <Link
                  href="/donor/perks"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 text-gray-800 transition border-l-4 border-transparent hover:border-yellow-600"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Gift className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium">View Perks</span>
                </Link>
                <button
                  onClick={() => {
                    // Save location sharing stop time if location is active
                    if (locationSharing) {
                      const stored = localStorage.getItem("user");
                      if (stored) {
                        const user = JSON.parse(stored);
                        user.locationSharingStoppedAt = new Date().toISOString();
                        user.sleepTime = sleepTime;
                        localStorage.setItem("user", JSON.stringify(user));
                      }
                    }
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
      </header>

      {/* BODY */}
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* HERO */}
        <HeroCard
          donorName={donorName}
          profileImage={donorImage}
          getLocation={requestLocation}
          stopLocationSharing={stopLocationSharing}
          locationSharing={locationSharing}
          available={available}
          markAvailable={markAvailable}
          markUnavailable={markUnavailable}
          currentQuote={motivationalQuotes[currentQuoteIndex]}
        />

        {/* VIDEO - AUTO PLAY on login */}
        <VideoSection showVideo={showVideo} setShowVideo={setShowVideo} />

        {/* NEARBY HOSPITAL REQUESTS MAP SECTION */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-8 h-8 text-red-600" />
              <h2 className="text-3xl font-bold text-red-700">Nearby Hospital Requests</h2>
            </div>

            {hospitalRequests.length > 0 ? (
              <>
                {location ? (
                  <HospitalRequestsMap hospitalRequests={hospitalRequests} donorLocation={location} />
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <p className="text-blue-800 font-semibold">📍 Share your location to see distance and map view</p>
                      <p className="text-sm text-blue-700 mt-1">We found {hospitalRequests.length} hospital request(s). Share your location to view on map and calculate distances.</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-sm font-semibold text-red-800 mb-3">Available Requests:</p>
                      {hospitalRequests.map((req: any) => (
                        <div key={req._id} className="mb-3 p-3 bg-white rounded border-l-4 border-red-500">
                          <p className="font-semibold text-red-700">{req.hospital || "Hospital"}</p>
                          <p className="text-sm text-gray-600">Blood Type: <span className="font-bold text-red-600">{req.bloodType}</span></p>
                          <p className="text-sm text-gray-600">Units Needed: <span className="font-bold">{req.unitsNeeded}</span></p>
                          <p className="text-sm text-gray-600">Urgency: <span className="font-bold">{req.urgency}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-red-50 rounded-xl">
                <MapPin className="w-12 h-12 text-red-300 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">No hospital requests found</p>
                <p className="text-sm text-gray-500 mt-2">Check back later for new blood requests from hospitals</p>
              </div>
            )}
          </div>
        </div>

        {/* STATISTICS SECTION */}
        <ScheduleStatistics schedules={schedules} />

        {/* OTHER SECTIONS */}
        <BloodDonationGuide />
        <CompatibilityChart />
        <ImpactStories />
        {/* UrgentRequests hidden - using HospitalRequestsMap instead */}
        <ScheduledRequests schedules={schedules} />
        <DonationHistory history={history} />
      </div>

      {/* DONATION CONFIRMATION MODAL */}
      <DonationConfirmationModal
        isOpen={showConfirmModal}
        request={selectedRequest}
        onConfirm={handleConfirmDonation}
        onReject={handleRejectDonation}
        isLoading={confirmLoading}
      />
    </main>
  );
}

/* ----------------------------------------------------------
   COMPONENTS - same structure and style you had
----------------------------------------------------------*/

function HeroCard({ donorName, profileImage, getLocation, stopLocationSharing, locationSharing, available, markAvailable, markUnavailable, currentQuote }: any) {
  console.log("[HeroCard] Rendering with profileImage:", profileImage);
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-red-600 grid md:grid-cols-2">
      <div className="p-10">
        <h2 className="text-3xl font-bold text-red-700">Welcome back{donorName ? `, ${donorName.split(" ")[0]}` : ""}!</h2>
        <p className="text-gray-700 mt-2 text-lg italic font-semibold text-red-600 min-h-[60px] flex items-center">{currentQuote}</p>

        <div className="mt-6 flex flex-col gap-4">
          {/* Location Sharing Toggle */}
          <div className="flex gap-2">
            {!locationSharing ? (
              <button onClick={getLocation} className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold hover:shadow-lg transition">
                <MapPin className="w-5 h-5" /> Share Location
              </button>
            ) : (
              <button onClick={stopLocationSharing} className="bg-linear-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold hover:shadow-lg transition">
                <MapPin className="w-5 h-5" /> Stop Sharing
              </button>
            )}
          </div>

          {/* Availability Toggle */}
          <div className="flex gap-2">
            {!available ? (
              <button onClick={markAvailable} className="bg-linear-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg flex gap-2 items-center font-semibold hover:shadow-lg transition">
                <CheckCircle className="w-5 h-5" /> Mark Available
              </button>
            ) : (
              <button onClick={markUnavailable} className="bg-linear-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg flex gap-2 items-center font-semibold hover:shadow-lg transition">
                <X className="w-5 h-5" /> Unavailable
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 via-red-100 to-red-200 flex items-center justify-center p-4 min-h-[280px]">
        {profileImage ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={profileImage}
              alt="Donor profile"
              className="max-w-full max-h-[250px] rounded-lg shadow-2xl object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Heart className="text-red-500 w-20 h-20" />
            <p className="text-red-600 text-sm font-medium">Upload your photo</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------
   VIDEO SECTION - Beautiful design with gradient background
----------------------------------------------------------*/
function VideoSection({ showVideo, setShowVideo }: any) {
  return showVideo ? (
    <div className="mt-10 relative">
      {/* Gradient background container */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-400 to-red-500 rounded-2xl blur-lg opacity-50 -z-10"></div>
      
      <div className="relative bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-2xl overflow-hidden border-2 border-red-200 p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎬</div>
            <div>
              <h3 className="text-2xl font-bold text-red-700">Donor Education Video</h3>
              <p className="text-sm text-gray-600">Learn about blood donation & impact</p>
            </div>
          </div>
          <button 
            onClick={() => setShowVideo(false)} 
            className="text-red-600 hover:text-red-800 text-2xl transition"
            title="Close video"
          >
            ✕
          </button>
        </div>

        {/* Video container with beautiful frame */}
        <div className="relative rounded-xl overflow-hidden bg-black shadow-lg">
          <iframe
            title="Intro video"
            className="w-full aspect-video"
            src="https://www.youtube.com/embed/_JlmwDqaYA0?autoplay=1&rel=0&modestbranding=1"
            allow="autoplay; encrypted-media"
          ></iframe>
        </div>

        {/* Close button */}
        <button 
          onClick={() => setShowVideo(false)} 
          className="w-full mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
        >
          Close Video
        </button>
      </div>
    </div>
  ) : null;
}

/* ----------------------------------------------------------
   Remaining components: ScheduledRequests, DonationHistory, ImpactStories, UrgentRequests,
   BloodDonationGuide, CompatibilityChart
   (Use the exact implementations from your existing file — I'm copying the same)
----------------------------------------------------------*/

function ScheduledRequests({ schedules }: any) {
  const activeSchedules = (schedules || []).filter((s: any) => s.status && s.status.toLowerCase() !== "completed" && s.status.toLowerCase() !== "cancelled");
  if (!activeSchedules.length) return null;
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-red-700 mb-4">My Scheduled Donations</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {activeSchedules.map((s: any, i: number) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow border-l-4 border-orange-500">
            <h3 className="text-xl font-bold text-red-700">Hospital: {s.requestId?.hospital}</h3>

            <p className="mt-2 flex gap-2"><Calendar /> {s.date}</p>
            <p className="flex gap-2"><Clock /> {s.time}</p>

            <p className="mt-3 font-semibold">
              Status: <span className="bg-red-100 px-3 py-1 rounded-lg">{s.status.toUpperCase()}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonationHistory({ history }: any) {
  if (!history.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-red-700 mb-4">My Donation History</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {history.map((h: any, i: number) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
            <p className="text-xl font-bold">+ {h.units} units</p>
            <p>{new Date(h.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactStories() {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Helper function to get icon component based on icon name
  const getIconComponent = (iconName: string, size: string = "w-5 h-5") => {
    const iconProps = `${size} text-white`;
    switch(iconName) {
      case "droplet": return <Droplets className={iconProps} />;
      case "hospital": return <Hospital className={iconProps} />;
      case "baby": return <Baby className={iconProps} />;
      case "target": return <Target className={iconProps} />;
      case "zap": return <Zap className={iconProps} />;
      case "star": return <Star className={iconProps} />;
      case "heart": return <Heart className={iconProps} />;
      case "ambulance": return <Ambulance className={iconProps} />;
      default: return <Heart className={iconProps} />;
    }
  };

  const bloodDonationNews = [
    {
      title: "Life-Saving Donation Saves 3 Lives",
      outcome: "One blood donation can save up to 3 lives. A single donation in Delhi today helped 3 emergency patients.",
      icon: "droplet",
      impact: "+3 lives saved",
      date: "Today",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=400&fit=crop" // Blood donation
    },
    {
      title: "Critical Surgery Averted",
      outcome: "A young accident victim received emergency transfusion from our donors. Now recovering well at Apollo Hospital.",
      icon: "hospital",
      impact: "1 life saved",
      date: "Yesterday",
      image: "https://images.unsplash.com/photo-1631217b5f58-d699e5edd3a5?w=500&h=400&fit=crop" // Hospital
    },
    {
      title: "Newborn Gets Second Chance",
      outcome: "A premature baby in NICU received platelet transfusion thanks to donors. Mother says 'They gave us hope'.",
      icon: "baby",
      impact: "1 child saved",
      date: "2 days ago",
      image: "https://images.unsplash.com/photo-1516627145497-ae3dbe626c3d?w=500&h=400&fit=crop" // Baby/healthcare
    },
    {
      title: "Blood Camp Success",
      outcome: "200 donors participated in blood drive at Mumbai Corporate Park. 280 units collected for hospitals in need.",
      icon: "target",
      impact: "+280 units",
      date: "3 days ago",
      image: "https://images.unsplash.com/photo-1631217b5f58-d699e5edd3a5?w=500&h=400&fit=crop" // Community event
    },
    {
      title: "Cancer Patient Gets Help",
      outcome: "Leukemia patient undergoing chemotherapy received 2 units of whole blood. Treatment proceeding smoothly.",
      icon: "zap",
      impact: "1 patient sustained",
      date: "4 days ago",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=400&fit=crop" // Medical
    },
    {
      title: "Rare Blood Type Found",
      outcome: "O- negative donor's blood matched rare case. Thalassemia patient received critical transfusion in Chennai.",
      icon: "star",
      impact: "1 critical match",
      date: "5 days ago",
      image: "https://images.unsplash.com/photo-1624507898257-dae5d0ed8202?w=500&h=400&fit=crop" // Laboratory
    }
  ];

  // Filter only stories with valid images
  const validNews = bloodDonationNews.filter(story => story.image && story.image.trim() !== "");
  
  if (validNews.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-red-700 mb-6">🩸 Donor Impact Stories</h2>
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Impact stories coming soon...</p>
        </div>
      </div>
    );
  }

  const currentNews = validNews[currentNewsIndex % validNews.length];

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % bloodDonationNews.length);
        setFadeIn(true);
      }, 300);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-10 p-8 bg-gradient-to-r from-red-50 via-red-100 to-red-50 rounded-2xl shadow-xl border-2 border-red-200">
      {/* Header with title and progress indicators */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-red-700 flex items-center gap-3">
          <span className="text-4xl animate-pulse">📰</span> Live Donation Impact
        </h2>
        <div className="flex gap-2">
          {bloodDonationNews.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFadeIn(false);
                setTimeout(() => {
                  setCurrentNewsIndex(i);
                  setFadeIn(true);
                }, 100);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentNewsIndex ? "bg-red-600 w-8" : "bg-red-200 w-2 hover:bg-red-300"
              }`}
              title={`Go to news ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main news card with image and content */}
      <div className={`transition-opacity duration-300 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-red-100">
          {/* Content section - Full width without image */}
          <div className="p-8 space-y-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-red-700 mb-2">{currentNews.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    {getIconComponent(currentNews.icon, "w-4 h-4")}
                    {currentNews.date}
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">
                    {currentNews.impact}
                  </span>
                </div>
              </div>
            </div>

            {/* News content */}
            <p className="text-gray-700 text-base leading-relaxed">{currentNews.outcome}</p>

            {/* Key Insight section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-l-4 border-orange-400">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-orange-600">💡 Key Insight:</span> {currentNews.outcome.split('.')[0]}.
              </p>
            </div>
          </div>
        </div>

        {/* Fun fact below card */}
        <div className="mt-4 bg-white rounded-lg p-4 border-l-4 border-blue-400 shadow-md">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-blue-600">ℹ️ Did you know?</span> Every 2 seconds someone in the world needs blood. Your donation can save up to 3 lives, and you can donate again in just 56 days!
          </p>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="flex justify-between items-center mt-6 gap-4">
        <button
          onClick={() => {
            setFadeIn(false);
            setTimeout(() => {
              setCurrentNewsIndex((prev) => (prev - 1 + validNews.length) % validNews.length);
              setFadeIn(true);
            }, 100);
          }}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition"
          title="Previous news"
        >
          ← Prev
        </button>
        <span className="text-gray-600 font-semibold text-sm">
          {currentNewsIndex + 1} / {validNews.length}
        </span>
        <button
          onClick={() => {
            setFadeIn(false);
            setTimeout(() => {
              setCurrentNewsIndex((prev) => (prev + 1) % validNews.length);
              setFadeIn(true);
            }, 100);
          }}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition"
          title="Next news"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function UrgentRequests({ hospitalRequests, recipientRequests, onRequestClick, location }: any) {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Nearby Urgent Requests
        </h2>
      </div>

      {/* Hospital-created requests */}
      <div className="mt-6 bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <Droplet className="w-8 h-8 text-red-600" />
          <h3 className="text-3xl font-bold text-red-700">Hospital Requests</h3>
        </div>

        {(hospitalRequests || []).filter((req: any) => !req.confirmationStatus || req.confirmationStatus === "Pending" || req.confirmationStatus === "Confirmed").length === 0 ? (
          <div className="text-center py-12">
            <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No hospital requests nearby</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(hospitalRequests || []).filter((req: any) => !req.confirmationStatus || req.confirmationStatus === "Pending" || req.confirmationStatus === "Confirmed").map((req: any, i: number) => {
              const distanceDisplay = req.calculatedDistance 
                ? `${req.calculatedDistance} km away`
                : (req.locationKm ?? "N/A") + " km away";
              return (
                <div key={`h-${i}`} className="p-6 border-2 border-red-100 rounded-xl hover:shadow-lg transition bg-gradient-to-r from-red-50 to-white">
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 items-start mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Hospital</p>
                      <p className="font-bold text-gray-900">{req.hospital || "Hospital"}</p>
                      <p className="text-sm text-gray-600 mt-1">{distanceDisplay}</p>
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        req.urgency === "critical" ? "bg-red-100 text-red-700" :
                        req.urgency === "high" ? "bg-orange-100 text-orange-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {req.urgency?.toUpperCase() || "NORMAL"}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        req.confirmationStatus === "Confirmed" ? "bg-green-100 text-green-700" :
                        req.confirmationStatus === "Rejected" ? "bg-red-100 text-red-700" :
                        req.confirmationStatus === "Successful" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {req.confirmationStatus || "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Map preview when hospital request includes explicit coordinates */}
                  {req.location && req.location.latitude && req.location.longitude ? (
                    <div className="mt-4 h-40 rounded-lg overflow-hidden border-2 border-red-100">
                      <LeafletMap activeDonors={[{ location: req.location, fullName: req.hospital, bloodType: req.bloodType }]} />
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-gray-500">Map not available for this request</div>
                  )}

                  <button
                    onClick={() => onRequestClick(req)}
                    disabled={req.confirmationStatus && !["Pending"].includes(req.confirmationStatus)}
                    className={`w-full mt-4 py-3 rounded-lg transition font-semibold ${
                      req.confirmationStatus && !["Pending"].includes(req.confirmationStatus)
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg"
                    }`}
                  >
                    {req.confirmationStatus === "Confirmed"
                      ? "Proceeding to Schedule"
                      : req.confirmationStatus === "Rejected"
                      ? "Donation Rejected"
                      : req.confirmationStatus === "Successful"
                      ? "✅ Donation Completed"
                      : "Schedule Donation"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipient-created requests */}
      <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-8 h-8 text-purple-600" />
          <h3 className="text-3xl font-bold text-purple-700">Recipient Requests</h3>
        </div>

        {(recipientRequests || []).filter((req: any) => !req.confirmationStatus || req.confirmationStatus === "Pending" || req.confirmationStatus === "Confirmed").length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No recipient requests nearby</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(recipientRequests || []).filter((req: any) => !req.confirmationStatus || req.confirmationStatus === "Pending" || req.confirmationStatus === "Confirmed").map((req: any, i: number) => {
              return (
                <div key={`r-${i}`} className="p-6 border-2 border-purple-100 rounded-xl hover:shadow-lg transition bg-gradient-to-r from-purple-50 to-white">
                  <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4 items-start mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Recipient</p>
                      <p className="font-bold text-gray-900">{req.recipientName || req.requestedBy?.fullName || req.requestedByName || req.requesterName || (typeof req.requestedBy === 'string' ? req.requestedBy : "Recipient")}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Hospital</p>
                      <p className="font-bold text-purple-600">{req.hospital || "N/A"}</p>
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        req.urgency === "critical" ? "bg-red-100 text-red-700" :
                        req.urgency === "high" ? "bg-orange-100 text-orange-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {req.urgency?.toUpperCase() || "NORMAL"}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        req.confirmationStatus === "Confirmed" ? "bg-green-100 text-green-700" :
                        req.confirmationStatus === "Rejected" ? "bg-red-100 text-red-700" :
                        req.confirmationStatus === "Successful" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {req.confirmationStatus || "Pending"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRequestClick(req)}
                    disabled={req.confirmationStatus && !["Pending"].includes(req.confirmationStatus)}
                    className={`w-full mt-4 py-3 rounded-lg transition font-semibold ${
                      req.confirmationStatus && !["Pending"].includes(req.confirmationStatus)
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg"
                    }`}
                  >
                    {req.confirmationStatus === "Confirmed"
                      ? "Proceeding to Schedule"
                      : req.confirmationStatus === "Rejected"
                      ? "Donation Rejected"
                      : req.confirmationStatus === "Successful"
                      ? "✅ Donation Completed"
                      : "Schedule Donation"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------
   SCHEDULE STATISTICS COMPONENT
----------------------------------------------------------*/
function ScheduleStatistics({ schedules }: any) {
  const totalScheduled = schedules?.length || 0;
  const totalUnits = schedules?.reduce((sum: number, s: any) => {
    const units = s.requestId?.unitsNeeded || s.unitsNeeded || 0;
    return sum + units;
  }, 0) || 0;
  
  // Count by status
  const statusCounts = schedules?.reduce((acc: any, s: any) => {
    const status = s.status || "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  console.log("[ScheduleStatistics] Schedules:", schedules);
  console.log("[ScheduleStatistics] Total Scheduled:", totalScheduled);
  console.log("[ScheduleStatistics] Total Units:", totalUnits);
  console.log("[ScheduleStatistics] Status Counts:", statusCounts);
  
  return (
    <div className="mt-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-2xl p-10">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white">🩸 Your Donation Impact</h2>
        <p className="text-white text-opacity-90 mt-2">Track your scheduled donations and their status</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Scheduled Donations Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Scheduled Donations</p>
            <span className="text-3xl">📅</span>
          </div>
          <p className="text-5xl font-bold text-red-700">{totalScheduled}</p>
          <p className="text-gray-600 text-sm mt-2">Donation appointments booked</p>
        </div>
        
        {/* Total Units Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Total Units</p>
            <span className="text-3xl">💉</span>
          </div>
          <p className="text-5xl font-bold text-red-700">{totalUnits}</p>
          <p className="text-gray-600 text-sm mt-2">Units scheduled to donate</p>
        </div>

        {/* Status Overview Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Status Summary</p>
            <span className="text-3xl">📊</span>
          </div>
          <div className="space-y-2">
            {Object.entries(statusCounts).length > 0 ? (
              Object.entries(statusCounts).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-semibold capitalize">{status}:</span>
                  <span className="text-lg font-bold text-red-600">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm">No scheduled donations yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      {totalScheduled > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-white border-opacity-30">
          <p className="text-center text-white font-semibold text-lg">
            🎯 You've scheduled <span className="text-yellow-200">{totalScheduled}</span> life-saving donations totaling <span className="text-yellow-200">{totalUnits} units</span> of blood!
          </p>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------
   BloodDonationGuide + CompatibilityChart (same as earlier)
----------------------------------------------------------*/

function BloodDonationGuide() {
  return (
    <div className="mt-10 p-6 bg-white rounded-xl shadow border">
      <h2 className="text-3xl font-bold text-red-700 mb-2 flex items-center gap-2">
        <span className="text-4xl">🩸</span> Blood Donation Frequency Guide
      </h2>
      <p className="text-gray-600 mb-6 text-sm">Know how often you can donate and make maximum impact on lives</p>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            type: "Whole Blood",
            icon: "🩹",
            wait: 56,
            year: 6,
            benefit: "Helps all blood types",
            recovery: "3-4 weeks",
            color: "from-red-400 to-red-600",
            bg: "bg-red-50"
          },
          {
            type: "Plasma",
            icon: "💛",
            wait: 2,
            year: 24,
            benefit: "Golden component",
            recovery: "24 hours",
            color: "from-yellow-400 to-yellow-600",
            bg: "bg-yellow-50"
          },
          {
            type: "Platelets",
            icon: "💚",
            wait: 2,
            year: 24,
            benefit: "Helps cancer patients",
            recovery: "24 hours",
            color: "from-green-400 to-green-600",
            bg: "bg-green-50"
          },
          {
            type: "Red Cells",
            icon: "❤️",
            wait: 112,
            year: 3,
            benefit: "Critical for anemia",
            recovery: "8 weeks",
            color: "from-pink-400 to-pink-600",
            bg: "bg-pink-50"
          },
        ].map((item, i) => (
          <div key={i} className={`p-6 rounded-2xl shadow-lg border-2 border-${item.color.split(' ')[1]} ${item.bg} hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{item.icon} {item.type}</h3>
                <p className="text-sm text-gray-600 font-semibold">{item.benefit}</p>
              </div>
              <div className={`bg-gradient-to-r ${item.color} text-white rounded-full w-12 h-12 flex items-center justify-center font-bold`}>
                {item.year}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-semibold">Frequency:</span>
                <span className="bg-white px-3 py-1 rounded-lg font-bold text-gray-800">Every {item.wait} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-semibold">Annual:</span>
                <span className="bg-white px-3 py-1 rounded-lg font-bold text-gray-800">{item.year}x per year</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-semibold">Recovery:</span>
                <span className="bg-white px-3 py-1 rounded-lg font-bold text-gray-800">{item.recovery}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompatibilityChart() {
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
      <p className="text-gray-600 mb-6 text-sm">Discover which blood types you can save with your donation</p>

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
          <span className="font-bold text-red-700">💡 Pro Tip:</span> O- blood type donors are the most sought after because they can donate to anyone. If you have a rare blood type, you're a superhero for those who need it!
        </p>
      </div>
    </div>
  );
}

