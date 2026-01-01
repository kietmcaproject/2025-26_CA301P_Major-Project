"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MapPin, Zap, Users, ArrowRight } from "lucide-react"

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-white to-red-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-red-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-600 fill-red-600" />
            <span className="text-2xl font-bold text-red-600">Pulse Bank</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="/about" className="text-gray-700 hover:text-red-600 transition">
              About
            </a>
            <a href="/impact" className="text-gray-700 hover:text-red-600 transition">
              Impact
            </a>
            <a href="#features" className="text-gray-700 hover:text-red-600 transition">
              Features
            </a>
          </div>
          <div className="flex gap-4">
            <Link href="/auth" className="px-6 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition">
              Login
            </Link>
            <Link
              href="/auth"
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
            Save Lives Through Smart Blood Donation
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Connect with <span className="text-red-600">Life Savers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto text-balance">
            AI-powered matching connects blood donors with recipients instantly. Find compatible donors near you and
            save lives in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth?type=hospital"
              className="px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              I'm a Hospital <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth?type=donor"
              className="px-8 py-4 bg-white text-red-600 font-semibold rounded-lg border-2 border-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              I Want to Donate <Heart className="w-5 h-5" />
            </Link>
            <Link
              href="/auth?type=recipient"
              className="px-8 py-4 bg-white text-red-600 font-semibold rounded-lg border-2 border-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              I Need Blood <Zap className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Pulse Bank?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                id: "ai",
                icon: <Zap className="w-8 h-8" />,
                title: "AI-Powered Matching",
                desc: "Smart algorithm matches donors with recipients based on blood type, location, and urgency",
              },
              {
                id: "location",
                icon: <MapPin className="w-8 h-8" />,
                title: "Real-Time Location",
                desc: "Find donors near you using GPS. Instant donor availability at your fingertips",
              },
              {
                id: "community",
                icon: <Users className="w-8 h-8" />,
                title: "Community Impact",
                desc: "Join thousands of life savers. Track your donations and celebrate your impact",
              },
            ].map((feature) => (
              <div
                key={feature.id}
                className="p-8 rounded-xl border border-red-200 bg-white hover:shadow-lg hover:border-red-400 transition cursor-pointer"
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition ${
                    hoveredCard === feature.id ? "bg-red-600 text-white" : "bg-red-100 text-red-600"
                  }`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-5xl font-bold mb-2">50K+</div>
            <p className="text-red-100">Active Donors</p>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">12K+</div>
            <p className="text-red-100">Lives Saved</p>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">2.5M</div>
            <p className="text-red-100">Units Matched</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-12 text-center border-2 border-red-200">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-700 mb-8">
            Join the Pulse Bank community and help save lives. Every donation counts.
          </p>
          <Link
            href="/auth"
            className="inline-block px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-red-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-red-600 fill-red-600" />
              <span className="text-xl font-bold text-red-600">Pulse Bank</span>
            </div>
            <p className="text-gray-600 text-sm">Connecting hearts to save lives through AI-powered blood donation.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-red-600">
                  For Hospitals
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-600">
                  For Donors
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-600">
                  For Recipients
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-red-600">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-600">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-600">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-red-600">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-600">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-600">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2025 Pulse Bank. All rights reserved. Saving lives through technology.</p>
        </div>
      </footer>
    </main>
  )
}
