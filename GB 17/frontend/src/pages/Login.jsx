import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Code, Mail, Lock, ArrowRight, Github, Chrome, Zap, Users, Trophy } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LoginPageSideBySide = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const navigate = useNavigate();

  useEffect(()=>{
    const email = localStorage.getItem('email')
    if(email){
      navigate('/');
      return;
    }
  })
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    try{
      const res = await fetch('http://localhost:8000/auth/login',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',

        },
        body:JSON.stringify({
          email:formData.email,
          password:formData.password,
          rememberMe:formData.rememberMe
        })
      })

      if(!res.ok){
        throw new Error('Something went wrong while login');
      }

      localStorage.setItem('email',formData.email);
      const resp = res.json();
      sessionStorage.setItem('isLoggedIn',true);
      toast.success(resp.message);
      navigate('/')
      window.location.reload();
    }catch(err){
      console.log(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/20 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Code className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">
                Code<span className="text-cyan-400">Clash</span>
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Master coding with AI-powered insights
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Join 50,000+ developers practicing on our platform with real-time feedback and multi-language support.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: Zap, text: "AI-powered code analysis" },
              { icon: Users, text: "Collaborative learning" },
              { icon: Trophy, text: "Competitive programming" }
            ].map(({ icon: Icon, text }, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">
                  Code<span className="text-cyan-400">Clash</span>
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
              <p className="text-slate-400">Sign in to explore more</p>
            </div>

            {/* Rest of the form - same as above */}
            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl transition-all duration-200 text-white">
                <Chrome className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/50 text-slate-400">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-2"
                  />
                  <span className="text-sm text-slate-300">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="group w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25"
              >
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Don't have an account?{' '}
                <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Sign up for free
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageSideBySide;
