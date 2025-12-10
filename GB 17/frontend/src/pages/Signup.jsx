import React, { useState } from 'react';
import { Eye, EyeOff, Code, Mail, Lock, User, ArrowRight, Github, Chrome, Check, Zap, Users, Trophy } from 'lucide-react';
import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom'


const SignupPageSideBySide = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Password strength calculation
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    setPasswordStrength({ score, feedback });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 1) return 'Weak';
    if (passwordStrength.score <= 3) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast.info('Please agree to the terms and conditions');
      return;
    }

    try{
      const res = await fetch('http://localhost:8000/auth/signup',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({
          name:formData.fullName,
          email:formData.email,
          password:formData.password,
          agreeToTerms:formData.agreeToTerms,
          subscribeNewsletter:formData.subscribeNewsletter
        })
      });
  
      if(!res.ok){
        throw new Error('Something went wrong while signing up')
      }
      toast.success('SignUp Successfull. Redirecting...')
      navigate('/login')
    }catch(err){
      console.log(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Side - Benefits */}
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
              Join the coding revolution
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Start your journey with AI-powered learning, real-time feedback, and a community of passionate developers.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Why developers choose CodeClash:</h3>
            {[
              { icon: Zap, title: "AI-Powered Insights", desc: "Get instant feedback and optimization suggestions" },
              { icon: Users, title: "Learn Together", desc: "Join study groups and collaborative coding sessions" },
              { icon: Trophy, title: "Compete & Win", desc: "Participate in contests and climb the leaderboards" }
            ].map(({ icon: Icon, title, desc }, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">{title}</h4>
                  <p className="text-slate-300 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-cyan-400">50K+</div>
              <div className="text-slate-300">developers already improving their skills</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
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

          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
              <p className="text-slate-400">Join thousands of developers</p>
            </div>

            {/* Signup Form */}

            {/* Social Signup Options */}
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl transition-all duration-200 text-white">
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-400">Or create with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
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

            {/* Password Field */}
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
                  placeholder="Create a password"
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-1 bg-slate-700 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400">{getPasswordStrengthText()}</span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-xs text-slate-400">
                      Missing: {passwordStrength.feedback.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-2"
                  required
                />
                <span className="text-sm text-slate-300 leading-relaxed">
                  I agree to the{' '}
                  <a href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Privacy Policy
                  </a>
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="subscribeNewsletter"
                  checked={formData.subscribeNewsletter}
                  onChange={handleInputChange}
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-sm text-slate-300 leading-relaxed">
                  Send me coding tips, challenges, and product updates
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="group w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25"
            >
              <span>Create Account</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPageSideBySide;
