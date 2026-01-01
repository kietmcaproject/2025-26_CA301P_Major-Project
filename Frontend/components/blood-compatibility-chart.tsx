"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function BloodCompatibilityChart() {
  // Blood compatibility data: which blood types can receive from which types
  const compatibilityData = {
    "O-": {
      canDonateTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
      canReceiveFrom: ["O-"],
      description: "Universal Donor",
    },
    "O+": {
      canDonateTo: ["O+", "A+", "B+", "AB+"],
      canReceiveFrom: ["O-", "O+"],
      description: "Common Donor",
    },
    "A-": {
      canDonateTo: ["A-", "A+", "AB-", "AB+"],
      canReceiveFrom: ["O-", "A-"],
      description: "Rh Negative",
    },
    "A+": {
      canDonateTo: ["A+", "AB+"],
      canReceiveFrom: ["O-", "O+", "A-", "A+"],
      description: "Most Common",
    },
    "B-": {
      canDonateTo: ["B-", "B+", "AB-", "AB+"],
      canReceiveFrom: ["O-", "B-"],
      description: "Rh Negative",
    },
    "B+": {
      canDonateTo: ["B+", "AB+"],
      canReceiveFrom: ["O-", "O+", "B-", "B+"],
      description: "Common Type",
    },
    "AB-": {
      canDonateTo: ["AB-", "AB+"],
      canReceiveFrom: ["O-", "A-", "B-", "AB-"],
      description: "Rh Negative",
    },
    "AB+": {
      canDonateTo: ["AB+"],
      canReceiveFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
      description: "Universal Recipient",
    },
  }

  return (
    <div className="w-full space-y-6">
      <Card className="border-2 border-red-200">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b-2 border-red-200">
          <CardTitle className="text-2xl text-red-700">Blood Type Compatibility Chart</CardTitle>
          <CardDescription>Understand who can donate to whom and vice versa</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(compatibilityData).map(([bloodType, data]) => (
              <div key={bloodType} className="border-2 border-red-200 rounded-lg p-4 hover:border-red-400 transition">
                <div className="mb-3">
                  <h3 className="text-2xl font-bold text-red-600">{bloodType}</h3>
                  <p className="text-xs text-gray-600 font-semibold">{data.description}</p>
                </div>

                <div className="space-y-3 text-sm">
                  {/* Can Receive From */}
                  <div className="bg-green-50 rounded p-2">
                    <p className="font-semibold text-green-700 mb-1">Receives from:</p>
                    <div className="flex flex-wrap gap-1">
                      {data.canReceiveFrom.map((type) => (
                        <span key={type} className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Can Donate To */}
                  <div className="bg-blue-50 rounded p-2">
                    <p className="font-semibold text-blue-700 mb-1">Donates to:</p>
                    <div className="flex flex-wrap gap-1">
                      {data.canDonateTo.map((type) => (
                        <span key={type} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Key Information:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• O- is the universal donor (can give to everyone)</li>
              <li>• AB+ is the universal recipient (can receive from everyone)</li>
              <li>• Rh negative (-) can only donate to other negative types safely in most cases</li>
              <li>• Always verify compatibility through medical professionals</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
