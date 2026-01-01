"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, Heart } from "lucide-react"

export default function DonationFrequencyInfo() {
  const donationInfo = [
    {
      type: "Whole Blood",
      minDaysWait: 56,
      description: "Can donate every 8 weeks (56 days)",
      limit: "6 times per year",
      icon: Heart,
    },
    {
      type: "Plasma",
      minDaysWait: 2,
      description: "Can donate every 2-3 days",
      limit: "24 times per year",
      icon: Clock,
    },
    {
      type: "Platelets",
      minDaysWait: 2,
      description: "Can donate every 2-3 days",
      limit: "24 times per year",
      icon: Clock,
    },
    {
      type: "Red Cells",
      minDaysWait: 112,
      description: "Can donate every 16 weeks (112 days)",
      limit: "3 times per year",
      icon: Heart,
    },
  ]

  return (
    <Card className="border-2 border-red-200">
      <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b-2 border-red-200">
        <CardTitle className="text-2xl text-red-700">Blood Donation Frequency Guide</CardTitle>
        <CardDescription>Know when you can donate again and help save more lives</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {donationInfo.map((info, idx) => {
            const Icon = info.icon
            return (
              <div key={idx} className="border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-white p-4 rounded">
                <div className="flex items-start gap-3">
                  <Icon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-700 mb-1">{info.type}</h3>
                    <p className="text-gray-700 text-sm mb-2">{info.description}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold">Minimum wait:</span> {info.minDaysWait} days
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Yearly limit:</span> {info.limit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Important Notes */}
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Important Health Reminders:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Ensure you are 18+ years old and weigh at least 50kg (110 lbs)</li>
                <li>• Maintain good health and adequate hydration</li>
                <li>• Eat a healthy meal before donation</li>
                <li>• Avoid strenuous activities for 24 hours after donation</li>
                <li>• If you feel unwell, reschedule your donation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Personal Donation Calculator */}
        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <h4 className="font-semibold text-green-900 mb-3">Your Next Eligible Donation Date</h4>
          <div className="text-sm text-green-800">
            <p>
              Last donation: <span className="font-bold">2 weeks ago</span>
            </p>
            <p>
              You can donate again in: <span className="font-bold text-red-600">42 days</span>
            </p>
            <p>
              Next eligible date: <span className="font-bold text-red-600">December 26, 2025</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
