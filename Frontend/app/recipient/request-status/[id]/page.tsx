"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { REQUEST } from "@/lib/api-endpoints";
import { jwtDecode } from "jwt-decode";
import { Clock, CheckCircle, AlertCircle, Hospital, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RequestStatusPage() {
  const { id: requestId } = useParams();   // Get request ID from URL
  const router = useRouter();

  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // STEP 1 — Decode JWT to get recipientId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setRecipientId(decoded.userId);
    }
  }, []);

  // STEP 2 — Fetch all requests and find this request
  useEffect(() => {
    if (!recipientId) return;

    fetch(REQUEST.getAllRequests)
      .then((res) => res.json())
      .then((data) => {
        const all = data.requests || [];

        // find the request with ID
        const r = all.find((req: any) => req._id === requestId);

        if (!r) {
          alert("Request not found");
          router.push("/recipient/dashboard");
          return;
        }

        // ensure the request belongs to THIS recipient
        if (r.requestedBy !== recipientId) {
          alert("Unauthorized access to request");
          router.push("/recipient/dashboard");
          return;
        }

        setRequest(r);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [recipientId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Fulfilled":
        return "text-green-600";
      case "Pending":
        return "text-orange-600";
      case "Cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading || !request) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading request status...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <Link href="/recipient/dashboard" className="flex items-center gap-2 text-red-600 mb-6 font-semibold">
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">Request Status</h1>

      {/* Main Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-red-600">
        <h2 className="text-xl font-bold mb-2">Blood Request Details</h2>

        <div className="space-y-3 text-gray-700">
          <p>
            <strong>Blood Type:</strong> {request.bloodType}
          </p>

          <p>
            <strong>Units Needed:</strong> {request.unitsNeeded}
          </p>

          <p>
            <strong>Urgency:</strong> {request.urgency}
          </p>

          <p>
            <strong>Status:</strong>
            <span className={`ml-2 font-bold ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </p>

          <p>
            <strong>Requested Distance:</strong> {request.locationKm} km
          </p>

          <p>
            <strong>Assigned Hospital:</strong>{" "}
            {request.hospital ? (
              <span className="font-semibold">{request.hospital}</span>
            ) : (
              <span className="text-gray-500">Not assigned yet</span>
            )}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8 bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-600">
        <h2 className="text-xl font-bold mb-4">Progress Timeline</h2>

        <div className="space-y-4">

          {/* Submitted */}
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600 w-6 h-6" />
            <p className="text-gray-700">Request Submitted</p>
          </div>

          {/* Matching */}
          <div className="flex items-center gap-3">
            <Clock className="text-orange-600 w-6 h-6" />
            <p className="text-gray-700">
              {request.status === "Pending"
                ? "Searching for compatible donors..."
                : "Matching Completed"}
            </p>
          </div>

          {/* Fulfilled */}
          <div className="flex items-center gap-3">
            {request.status === "Fulfilled" ? (
              <CheckCircle className="text-green-600 w-6 h-6" />
            ) : (
              <AlertCircle className="text-gray-400 w-6 h-6" />
            )}
            <p className="text-gray-700">
              {request.status === "Fulfilled"
                ? "Request Fulfilled by Hospital"
                : "Waiting for fulfillment"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
