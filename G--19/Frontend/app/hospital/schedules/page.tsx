// // "use client";

// // import { useEffect, useState } from "react";
// // import { CheckCircle, XCircle, Clock, Phone, User2 } from "lucide-react";

// // export default function HospitalSchedulesPage() {
// //   const [schedules, setSchedules] = useState([]);
// //   const [hospitalName, setHospitalName] = useState("");

// //   // Load logged-in hospital details
// //   useEffect(() => {
// //     const user = localStorage.getItem("user");
// //     if (user) {
// //       const parsed = JSON.parse(user);
// //       setHospitalName(parsed.fullName);
// //     }
// //   }, []);

// //   // Fetch schedules for this hospital
// //   const fetchSchedules = async () => {
// //     if (!hospitalName) return;

// //     const res = await fetch(`http://localhost:5000/hospital/schedules/${hospitalName}`);
// //     const data = await res.json();

// //     setSchedules(data.schedules || []);
// //   };

// //   useEffect(() => {
// //     if (hospitalName) fetchSchedules();
// //   }, [hospitalName]);

// //   // Accept / Reject schedule
// //   const updateStatus = async (scheduleId: string, action: string) => {
// //     const res = await fetch("http://localhost:5000/schedule/update-status", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ scheduleId, action }),
// //     });

// //     const data = await res.json();
// //     if (data.success) {
// //       alert(`Schedule ${action.toUpperCase()}!`);
// //       fetchSchedules();
// //     } else {
// //       alert("Error: " + data.message);
// //     }
// //   };

// //   // Mark completed
// //   const markCompleted = async (scheduleId: string) => {
// //     const res = await fetch("http://localhost:5000/schedule/complete", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ scheduleId }),
// //     });

// //     const data = await res.json();
// //     if (data.success) {
// //       alert("Donation marked as COMPLETED!");
// //       fetchSchedules();
// //     }
// //   };

// //   return (
// //     <main className="min-h-screen bg-red-50 p-10">
// //       <h1 className="text-3xl font-bold text-red-700 mb-6">
// //         Scheduled Donations – {hospitalName}
// //       </h1>

// //       <div className="grid md:grid-cols-2 gap-6">
// //         {schedules.map((s: any) => (
// //           <div
// //             key={s._id}
// //             className="bg-white border border-red-200 p-6 rounded-xl shadow"
// //           >
// //             <h2 className="text-xl font-bold text-red-700 flex gap-2 items-center">
// //               <User2 /> {s.donorId?.fullName}
// //             </h2>

// //             <p className="text-gray-700 mt-2 flex gap-2 items-center">
// //               <Clock /> {s.date} at {s.time}
// //             </p>

// //             <p className="text-gray-700 flex gap-2 items-center mt-1">
// //               <Phone /> {s.contact}
// //             </p>

// //             <p className="text-sm text-gray-600 mt-3">
// //               Notes: {s.notes || "None"}
// //             </p>

// //             <p className="text-sm mt-3">
// //               Status: <b className="text-red-600 ml-2">{s.status.toUpperCase()}</b>
// //             </p>

// //             {/* Action Buttons */}
// //             {s.status === "pending" && (
// //               <div className="mt-4 flex gap-4">
// //                 <button
// //                   onClick={() => updateStatus(s._id, "accepted")}
// //                   className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
// //                 >
// //                   <CheckCircle /> Accept
// //                 </button>

// //                 <button
// //                   onClick={() => updateStatus(s._id, "rejected")}
// //                   className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
// //                 >
// //                   <XCircle /> Reject
// //                 </button>
// //               </div>
// //             )}

// //             {s.status === "accepted" && (
// //               <button
// //                 onClick={() => markCompleted(s._id)}
// //                 className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg"
// //               >
// //                 Mark as Completed
// //               </button>
// //             )}
// //           </div>
// //         ))}
// //       </div>
// //     </main>
// //   );
// // }
// "use client";

// import { useEffect, useState } from "react";
// import { CheckCircle, XCircle, Clock, Phone, User2 } from "lucide-react";

// export default function HospitalSchedulesPage() {
//   const [schedules, setSchedules] = useState([]);
//   const [hospitalName, setHospitalName] = useState("");

//   // Load logged-in hospital details
//   useEffect(() => {
//     const user = localStorage.getItem("user");
//     if (user) {
//       const parsed = JSON.parse(user);
//       setHospitalName(parsed.fullName);
//     }
//   }, []);

//   // Fetch schedules
//   const fetchSchedules = async () => {
//     const res = await fetch("http://localhost:5000/hospital/schedules");
//     const data = await res.json();
//     setSchedules(data.schedules || []);
//   };

//   useEffect(() => {
//     if (hospitalName) fetchSchedules();
//   }, [hospitalName]);

//   // Accept / Reject
//   const updateStatus = async (scheduleId: string, action: string) => {
//     const res = await fetch("http://localhost:5000/hospital/update-status", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ scheduleId, action }),
//     });

//     const data = await res.json();
//     if (data.success) {
//       alert(`Schedule ${action.toUpperCase()}!`);
//       fetchSchedules();
//     } else {
//       alert("Error: " + data.message);
//     }
//   };

//   // Mark Completed
//   const markCompleted = async (scheduleId: string) => {
//     const res = await fetch("http://localhost:5000/hospital/complete", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ scheduleId }),
//     });

//     const data = await res.json();
//     if (data.success) {
//       alert("Donation marked as COMPLETED!");
//       fetchSchedules();
//     }
//   };

//   return (
//     <main className="min-h-screen bg-red-50 p-10">
//       <h1 className="text-3xl font-bold text-red-700 mb-6">
//         Scheduled Donations – {hospitalName}
//       </h1>

//       <div className="grid md:grid-cols-2 gap-6">
//         {schedules.map((s: any) => (
//           <div
//             key={s._id}
//             className="bg-white border border-red-200 p-6 rounded-xl shadow"
//           >
//             <h2 className="text-xl font-bold text-red-700 flex gap-2 items-center">
//               <User2 /> {s.donorName}
//             </h2>

//             <p className="text-gray-700 mt-2 flex gap-2 items-center">
//               <Clock /> {s.date} at {s.time}
//             </p>

//             <p className="text-gray-700 flex gap-2 items-center mt-1">
//               <Phone /> {s.contact}
//             </p>

//             <p className="text-sm text-gray-600 mt-3">
//               Notes: {s.notes || "None"}
//             </p>

//             <p className="text-sm mt-3">
//               Status:
//               <b className="text-red-600 ml-2">{s.status.toUpperCase()}</b>
//             </p>

//             {/* Action Buttons */}
//             {s.status === "pending" && (
//               <div className="mt-4 flex gap-4">
//                 <button
//                   onClick={() => updateStatus(s._id, "accepted")}
//                   className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//                 >
//                   <CheckCircle /> Accept
//                 </button>

//                 <button
//                   onClick={() => updateStatus(s._id, "rejected")}
//                   className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//                 >
//                   <XCircle /> Reject
//                 </button>
//               </div>
//             )}

//             {s.status === "accepted" && (
//               <button
//                 onClick={() => markCompleted(s._id)}
//                 className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg"
//               >
//                 Mark as Completed
//               </button>
//             )}
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Phone, User2 } from "lucide-react";

export default function HospitalSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [hospitalName, setHospitalName] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setHospitalName(JSON.parse(user).fullName);
    }
  }, []);

  const fetchSchedules = async () => {
    if (!hospitalName) return;

    const res = await fetch(
      `http://localhost:5000/hospital/schedules?hospital=${hospitalName}`
    );
    const data = await res.json();

    setSchedules(data.schedules || []);
  };

  useEffect(() => {
    if (hospitalName) fetchSchedules();
  }, [hospitalName]);

  const updateStatus = async (id: string, action: string) => {
    const res = await fetch("http://localhost:5000/schedule/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId: id, action }),
    });

    const data = await res.json();
    if (data.success) {
      alert(`Schedule ${action.toUpperCase()}`);
      fetchSchedules();
    }
  };

  return (
    <main className="min-h-screen p-10 bg-red-50">
      <h1 className="text-3xl font-bold text-red-700 mb-6">
        Scheduled Donations – {hospitalName}
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {schedules.map((s: any) => (
          <div key={s._id} className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-700">
              <User2 /> {s.donorName}
            </h2>

            <p className="flex items-center gap-2 mt-2"><Clock /> {s.date} {s.time}</p>
            <p className="flex items-center gap-2"><Phone /> {s.contact}</p>

            <p className="mt-3 font-semibold">Status: {s.status.toUpperCase()}</p>

            {s.status === "pending" && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => updateStatus(s._id, "accepted")}
                  className="bg-green-600 px-4 py-2 text-white rounded flex items-center gap-2"
                >
                  <CheckCircle /> Accept
                </button>

                <button
                  onClick={() => updateStatus(s._id, "rejected")}
                  className="bg-red-600 px-4 py-2 text-white rounded flex items-center gap-2"
                >
                  <XCircle /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
