import React from 'react';
import { ArrowRight, Code, Users, Trophy, Zap, CheckCircle, Star, Play } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Code,
      title: "Multi-Language Support",
      description: "Code in Java, Python, C++, JavaScript and 10+ other languages with real-time execution."
    },
    {
      icon: Zap,
      title: "AI-Powered Tips",
      description: "Get intelligent feedback, optimization suggestions, and debugging help powered by AI."
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Learn together with peer reviews, discussions, and team challenges."
    },
    {
      icon: Trophy,
      title: "Competitive Coding",
      description: "Participate in contests, climb leaderboards, and showcase your skills."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Coders" },
    { number: "1M+", label: "Problems Solved" },
    { number: "15+", label: "Languages" },
    { number: "99.9%", label: "Uptime" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content: "CodeClash helped me improve my coding skills with instant feedback and AI suggestions. The platform is intuitive and challenging.",
      rating: 5
    },
    {
      name: "Alex Kumar",
      role: "Software Engineer",
      content: "The best coding practice platform I've used. Real-time execution and detailed insights make learning efficient and fun.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Programming Instructor",
      content: "Perfect for my students. The multi-language support and AI-powered feedback save me hours of manual code review.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Master Coding with
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                CodeClash
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Practice coding problems, get AI-powered feedback, and compete with developers worldwide.
              Support for 15+ programming languages with real-time execution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 flex items-center space-x-2">
                <span>Start Coding Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="group px-8 py-4 border-2 border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ number, label }, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{number}</div>
                <div className="text-slate-400 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Excel at Coding
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with comprehensive coding challenges 
              to accelerate your programming journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, description }, index) => (
              <div key={index} className="group p-6 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Code, Execute, Learn
                <span className="block text-cyan-400">In Real-Time</span>
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Write code in your favorite language, get instant execution results, 
                and receive AI-powered optimization suggestions to improve your skills.
              </p>
              
              <div className="space-y-4">
                {[
                  "Real-time code execution with detailed output",
                  "AI-powered code analysis and optimization tips",
                  "Support for 15+ programming languages",
                  "Interactive debugging and error resolution"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
              <div className="bg-slate-800 px-6 py-3 border-b border-slate-700 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-400 text-sm ml-4">main.py</span>
              </div>
              <div className="p-6 font-mono text-sm">
                <div className="text-slate-400"># Two Sum Problem</div>
                <div className="text-purple-400">def</div> <div className="text-blue-400 inline">two_sum</div><div className="text-white inline">(nums, target):</div>
                <div className="text-slate-400 ml-4"># AI suggests: Use hashmap for O(n) solution</div>
                <div className="text-white ml-4">num_map = {}</div>
                <div className="text-purple-400 ml-4">for</div> <div className="text-white inline">i, num</div> <div className="text-purple-400 inline">in</div> <div className="text-blue-400 inline">enumerate</div><div className="text-white inline">(nums):</div>
                <div className="text-white ml-8">complement = target - num</div>
                <div className="text-purple-400 ml-8">if</div> <div className="text-white inline">complement</div> <div className="text-purple-400 inline">in</div> <div className="text-white inline">num_map:</div>
                <div className="text-purple-400 ml-12">return</div> <div className="text-white inline">[num_map[complement], i]</div>
                <div className="text-white ml-8">num_map[num] = i</div>
                <div className="text-green-400 mt-4"># Output: [0, 1] ✅ Optimized!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by <span className="text-cyan-400">50,000+</span> Developers
            </h2>
            <p className="text-xl text-slate-300">See what our community has to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ name, role, content, rating }, index) => (
              <div key={index} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">{content}</p>
                <div>
                  <div className="font-semibold text-white">{name}</div>
                  <div className="text-slate-400 text-sm">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Level Up Your
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Coding Skills?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already improving their coding skills with AI-powered insights.
          </p>
          
          <button className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 flex items-center space-x-2 mx-auto">
            <span>Get Started Free</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-slate-400 mt-4">No credit card required • Free tier available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">
                  Code<span className="text-cyan-400">Clash</span>
                </span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                The ultimate platform for coding practice, AI-powered learning, and competitive programming.
              </p>
              <div className="text-slate-500 text-sm">
                © 2024 CodeClash. All rights reserved.
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/problems" className="hover:text-cyan-400 transition-colors">Problems</a></li>
                <li><a href="/playground" className="hover:text-cyan-400 transition-colors">Playground</a></li>
                <li><a href="/contests" className="hover:text-cyan-400 transition-colors">Contests</a></li>
                <li><a href="/leaderboard" className="hover:text-cyan-400 transition-colors">Leaderboard</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/about" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="/careers" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-cyan-400 transition-colors">Contact</a></li>
                <li><a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
