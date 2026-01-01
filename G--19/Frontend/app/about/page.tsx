// "use client"

// import { Heart, TrendingUp, Globe, Zap } from "lucide-react"
// import Link from "next/link"

// export default function AboutPage() {
//   return (
//     <main className="min-h-screen bg-gradient-to-b from-white via-white to-red-50">
//       {/* Navigation */}
//       <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-red-200 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <Heart className="w-8 h-8 text-red-600 fill-red-600" />
//             <span className="text-2xl font-bold text-red-600">Pulse Bank</span>
//           </div>
//           <div className="hidden md:flex gap-8">
//             <Link href="/" className="text-gray-700 hover:text-red-600 transition">
//               Home
//             </Link>
//             <Link href="/about" className="text-red-600 font-semibold">
//               About
//             </Link>
//             <Link href="/impact" className="text-gray-700 hover:text-red-600 transition">
//               Impact
//             </Link>
//           </div>
//           <div className="flex gap-4">
//             <Link href="/auth" className="px-6 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition">
//               Login
//             </Link>
//           </div>
//         </div>
//       </nav>

//       <div className="pt-32 pb-20">
//         {/* Hero Section */}
//         <section className="px-4 sm:px-6 lg:px-8 mb-20">
//           <div className="max-w-5xl mx-auto">
//             <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">About Pulse Bank</h1>
//             <p className="text-xl text-gray-600 mb-8 text-balance">
//               We're revolutionizing blood donation through AI-powered technology. Our mission is to save lives by
//               connecting blood donors with recipients in real-time, eliminating delays and ensuring critical blood types
//               reach those who need them most.
//             </p>
//           </div>
//         </section>

//         {/* Mission Vision Values */}
//         <section className="px-4 sm:px-6 lg:px-8 mb-20">
//           <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
//             <div className="bg-white rounded-xl p-8 border-2 border-red-200 shadow-lg hover:shadow-xl transition">
//               <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
//                 <Heart className="w-8 h-8 text-red-600 fill-red-600" />
//               </div>
//               <h3 className="text-2xl font-bold mb-4 text-red-700">Our Mission</h3>
//               <p className="text-gray-700">
//                 To make blood donation seamless, fast, and transparent. We connect the right donor with the right
//                 recipient at the right time, saving precious lives every single day.
//               </p>
//             </div>

//             <div className="bg-white rounded-xl p-8 border-2 border-red-200 shadow-lg hover:shadow-xl transition">
//               <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
//                 <Globe className="w-8 h-8 text-red-600" />
//               </div>
//               <h3 className="text-2xl font-bold mb-4 text-red-700">Our Vision</h3>
//               <p className="text-gray-700">
//                 A world where no one dies from lack of blood. Where every hospital can access blood instantly, and every
//                 donor can make a measurable impact on lives around them.
//               </p>
//             </div>

//             <div className="bg-white rounded-xl p-8 border-2 border-red-200 shadow-lg hover:shadow-xl transition">
//               <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
//                 <Zap className="w-8 h-8 text-red-600" />
//               </div>
//               <h3 className="text-2xl font-bold mb-4 text-red-700">Our Values</h3>
//               <p className="text-gray-700">
//                 Compassion, transparency, and innovation drive us. We believe in the power of community and technology
//                 to create real change in healthcare.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* Why We Started */}
//         <section className="px-4 sm:px-6 lg:px-8 mb-20 bg-red-50 py-20">
//           <div className="max-w-4xl mx-auto">
//             <h2 className="text-4xl font-bold mb-8 text-red-700">Why We Started Pulse Bank</h2>
//             <div className="space-y-6 text-gray-700">
//               <p>
//                 Every two seconds, someone needs blood. Whether it's due to an accident, surgery, or chronic illness,
//                 blood transfusions are a critical lifeline. Yet many patients die not because blood isn't available, but
//                 because the right blood type couldn't be found in time.
//               </p>
//               <p>
//                 Traditional blood bank systems rely on manual processes, outdated databases, and geographic limitations.
//                 Donors don't know where their blood is needed most. Hospitals spend hours searching for compatible blood
//                 types. Recipients wait in critical condition while precious time ticks away.
//               </p>
//               <p>
//                 We founded Pulse Bank to change this. Using artificial intelligence, geolocation technology, and a
//                 community-first approach, we've created a platform that makes blood donation instant, efficient, and
//                 deeply meaningful.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* Team & Leadership */}
//         <section className="px-4 sm:px-6 lg:px-8 mb-20">
//           <div className="max-w-6xl mx-auto">
//             <h2 className="text-4xl font-bold mb-12 text-center">Our Leadership</h2>
//             <div className="grid md:grid-cols-3 gap-8">
//               {[
//                 {
//                   name: "Dr. Sarah Chen",
//                   role: "Founder & CEO",
//                   bio: "Medical doctor with 15 years of experience in emergency medicine.",
//                   color: "red",
//                 },
//                 {
//                   name: "James Rodriguez",
//                   role: "CTO & Co-Founder",
//                   bio: "AI researcher and healthcare tech entrepreneur. Built 3 successful startups.",
//                   color: "red",
//                 },
//                 {
//                   name: "Dr. Aisha Patel",
//                   role: "Chief Medical Officer",
//                   bio: "Hematologist and blood bank specialist. 20+ years in transfusion medicine.",
//                   color: "red",
//                 },
//               ].map((member, idx) => (
//                 <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
//                   <div className="h-48 bg-gradient-to-br from-red-400 to-red-600" />
//                   <div className="p-6">
//                     <h3 className="text-xl font-bold mb-1">{member.name}</h3>
//                     <p className="text-red-600 font-semibold text-sm mb-3">{member.role}</p>
//                     <p className="text-gray-600 text-sm">{member.bio}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* Technology & Innovation */}
//         <section className="px-4 sm:px-6 lg:px-8 mb-20">
//           <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-12 border-2 border-red-200">
//             <h2 className="text-4xl font-bold mb-8 text-red-700">Our Technology</h2>
//             <div className="grid md:grid-cols-2 gap-8">
//               <div>
//                 <h3 className="text-2xl font-bold mb-4 text-red-600">AI-Powered Matching</h3>
//                 <ul className="space-y-3 text-gray-700">
//                   <li className="flex gap-3">
//                     <TrendingUp className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                     <span>Blood type compatibility analysis</span>
//                   </li>
//                   <li className="flex gap-3">
//                     <TrendingUp className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                     <span>Real-time location-based matching</span>
//                   </li>
//                   <li className="flex gap-3">
//                     <TrendingUp className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                     <span>Urgency level assessment</span>
//                   </li>
//                   <li className="flex gap-3">
//                     <TrendingUp className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                     <span>Donor availability prediction</span>
//                   </li>
//                 </ul>
//               </div>
//               <div>
//                 <h3 className="text-2xl font-bold mb-4 text-red-600">Real-Time Infrastructure</h3>
//                 <ul className="space-y-3 text-gray-700">
//                   <li className="flex gap-3">
//                     <Zap className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                     <span>Instant donor notifications</span>
//                   </li>
//                   <li className="flex gap-3">
//                     <Zap className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                     <span>Live GPS tracking</span>
//                   </li>
//                   <li className="flex gap-3">
//                     <Zap className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                     <span>Mobile-first platform</span>
//                   </li>
//                   <li className="flex gap-3">
//                     <Zap className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                     <span>24/7 AI chatbot support</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Call to Action */}
//         <section className="px-4 sm:px-6 lg:px-8">
//           <div className="max-w-4xl mx-auto bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-12 text-white text-center">
//             <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
//             <p className="text-xl mb-8 text-red-100">
//               Whether you want to donate, need blood, or manage a hospital, there's a place for you in the Pulse Bank
//               community.
//             </p>
//             <Link
//               href="/auth"
//               className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition"
//             >
//               Get Started Today
//             </Link>
//           </div>
//         </section>
//       </div>

//       {/* Footer */}
//       <footer className="bg-white border-t border-red-200 py-12 px-4 sm:px-6 lg:px-8 mt-20">
//         <div className="max-w-6xl mx-auto text-center text-gray-600">
//           <p>&copy; 2025 Pulse Bank. Saving lives through technology.</p>
//         </div>
//       </footer>
//     </main>
//   )
// }
"use client"

import { Heart, TrendingUp, Globe, Zap } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
            <Link href="/" className="text-gray-700 hover:text-red-600 transition">
              Home
            </Link>
            <Link href="/about" className="text-red-600 font-semibold">
              About
            </Link>
            <Link href="/impact" className="text-gray-700 hover:text-red-600 transition">
              Impact
            </Link>
          </div>
          <div className="flex gap-4">
            <Link href="/auth" className="px-6 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">About Pulse Bank</h1>
            <p className="text-xl text-gray-600 mb-8 text-balance">
              We're revolutionizing blood donation through AI-powered technology. Our mission is to save lives by
              connecting blood donors with recipients in real-time, eliminating delays and ensuring critical blood types
              reach those who need them most.
            </p>
          </div>
        </section>

        {/* Mission Vision Values */}
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border-2 border-red-200 shadow-lg hover:shadow-xl transition">
              <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-red-600 fill-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-700">Our Mission</h3>
              <p className="text-gray-700">
                To make blood donation seamless, fast, and transparent. We connect the right donor with the right
                recipient at the right time, saving precious lives every single day.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-red-200 shadow-lg hover:shadow-xl transition">
              <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-700">Our Vision</h3>
              <p className="text-gray-700">
                A world where no one dies from lack of blood. Where every hospital can access blood instantly, and every
                donor can make a measurable impact on lives around them.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-red-200 shadow-lg hover:shadow-xl transition">
              <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-700">Our Values</h3>
              <p className="text-gray-700">
                Compassion, transparency, and innovation drive us. We believe in the power of community and technology
                to create real change in healthcare.
              </p>
            </div>
          </div>
        </section>

        {/* Why We Started */}
        <section className="px-4 sm:px-6 lg:px-8 mb-20 bg-red-50 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-red-700">Why We Started Pulse Bank</h2>
            <div className="space-y-6 text-gray-700">
              <p>
                Every two seconds, someone needs blood. Whether it's due to an accident, surgery, or chronic illness,
                blood transfusions are a critical lifeline. Yet many patients die not because blood isn't available, but
                because the right blood type couldn't be found in time.
              </p>
              <p>
                Traditional blood bank systems rely on manual processes, outdated databases, and geographic limitations.
                Donors don't know where their blood is needed most. Hospitals spend hours searching for compatible blood
                types. Recipients wait in critical condition while precious time ticks away.
              </p>
              <p>
                We founded Pulse Bank to change this. Using artificial intelligence, geolocation technology, and a
                community-first approach, we've created a platform that makes blood donation instant, efficient, and
                deeply meaningful.
              </p>
            </div>
          </div>
        </section>

        {/* Team & Leadership */}
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Our Leadership</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Dr. Sarah Chen",
                  role: "Founder & CEO",
                  bio: "Medical doctor with 15 years of experience in emergency medicine.",
                  color: "red",
                },
                {
                  name: "James Rodriguez",
                  role: "CTO & Co-Founder",
                  bio: "AI researcher and healthcare tech entrepreneur. Built 3 successful startups.",
                  color: "red",
                },
                {
                  name: "Dr. Aisha Patel",
                  role: "Chief Medical Officer",
                  bio: "Hematologist and blood bank specialist. 20+ years in transfusion medicine.",
                  color: "red",
                },
              ].map((member, idx) => (
                <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                  <div className="h-48 bg-gradient-to-br from-red-400 to-red-600" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-red-600 font-semibold text-sm mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology & Innovation */}
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-12 border-2 border-red-200">
            <h2 className="text-4xl font-bold mb-8 text-red-700">Our Technology</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-red-600">AI-Powered Matching</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <TrendingUp className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Blood type compatibility analysis</span>
                  </li>
                  <li className="flex gap-3">
                    <TrendingUp className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Real-time location-based matching</span>
                  </li>
                  <li className="flex gap-3">
                    <TrendingUp className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Urgency level assessment</span>
                  </li>
                  <li className="flex gap-3">
                    <TrendingUp className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Donor availability prediction</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-red-600">Real-Time Infrastructure</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <Zap className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Instant donor notifications</span>
                  </li>
                  <li className="flex gap-3">
                    <Zap className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Live GPS tracking</span>
                  </li>
                  <li className="flex gap-3">
                    <Zap className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Mobile-first platform</span>
                  </li>
                  <li className="flex gap-3">
                    <Zap className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>24/7 AI chatbot support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-xl mb-8 text-red-100">
              Whether you want to donate, need blood, or manage a hospital, there's a place for you in the Pulse Bank
              community.
            </p>
            <Link
              href="/auth"
              className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition"
            >
              Get Started Today
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-red-200 py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2025 Pulse Bank. Saving lives through technology.</p>
        </div>
      </footer>
    </main>
  )
}
