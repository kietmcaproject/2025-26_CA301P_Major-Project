"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface DonationConfirmationModalProps {
  isOpen: boolean;
  request: any;
  onConfirm: () => void;
  onReject: (notes?: string) => void;
  isLoading?: boolean;
}

export function DonationConfirmationModal({
  isOpen,
  request,
  onConfirm,
  onReject,
  isLoading = false,
}: DonationConfirmationModalProps) {
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !request) return null;

  const isRecipient = request.isRecipientRequest;
  const requestor = isRecipient ? (request.recipientName || "Recipient") : (request.hospital || "Hospital");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-8">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Confirm Donation?
        </h2>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">From:</span>
            <span className="font-semibold">{requestor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Blood Type:</span>
            <span className="font-semibold text-red-600">{request.bloodType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Units Needed:</span>
            <span className="font-semibold">{request.unitsNeeded}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Distance:</span>
            <span className="font-semibold">{request.locationKm || "N/A"} km</span>
          </div>
        </div>

        {showRejectForm ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are you rejecting? (optional)
            </label>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Enter reason for rejecting..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
          </div>
        ) : null}

        <div className="flex gap-3">
          {showRejectForm ? (
            <>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectNotes("");
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  onReject(rejectNotes);
                  setShowRejectForm(false);
                  setRejectNotes("");
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm
              </button>
            </>
          )}
        </div>

        {isLoading && (
          <p className="text-center text-sm text-gray-600 mt-3">
            Processing...
          </p>
        )}
      </div>
    </div>
  );
}
