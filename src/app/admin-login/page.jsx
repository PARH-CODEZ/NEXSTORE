'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Shield, User, Lock, Package, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const InputField = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  showToggle = false,
  showValue = false,
  onToggle,
  icon: Icon,
}) => (
  <div className="mb-5">
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {Icon && <Icon size={16} />}
      </div>
      <input
        type={showToggle ? (showValue ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-4' : 'pl-4'} pr-10 py-3 border-2 rounded-lg text-sm focus:outline-none focus:ring-0 transition-all bg-gray-50/50 backdrop-blur-sm ${error
            ? 'border-red-400 focus:border-red-500 bg-red-50/50'
            : 'border-gray-200 focus:border-blue-400 hover:border-gray-300 focus:bg-white'
          }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showValue ? 'Hide password' : 'Show password'}
        >
          {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
    {error && (
      <div className="flex items-center mt-2 text-red-600 text-xs font-medium">
        <AlertCircle size={12} className="mr-1" />
        {error}
      </div>
    )}
  </div>
);

const AdminLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    router.push('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Enter your email or mobile phone number';
    if (!password) newErrors.password = 'Enter your password';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ general: data.error || 'Invalid credentials' });
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setErrors({ general: 'Server error, try again later' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_75%,rgba(147,51,234,0.1),transparent_50%)]" />
      </div>

      {/* Close Button */}
      <button
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-xl bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl text-gray-600 hover:text-gray-800 focus:outline-none transition-all duration-200 flex items-center justify-center border border-gray-200/50 hover:bg-white"
        onClick={handleClose}
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6 sm:p-8 relative">
            {/* Logo and Brand inside form */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4 shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                NEXSTORE
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-sm border border-blue-200/50">
                <Shield className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">ADMIN PORTAL</span>
              </div>
            </div>

            {/* Form Header */}
            <div className=" mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 uppercase">Welcome Back</h2>
              <p className="text-sm text-gray-600 uppercase">Sign in to access your admin dashboard</p>
            </div>

            {/* Error Alert */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center text-red-700 text-sm font-medium">
                  <AlertCircle size={16} className="mr-2" />
                  {errors.general}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  EMAIL ADDRESS
                </label>
                <InputField
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  icon={User}
                />
              </div>

              {/* Password Field */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PASSWORD
                </label>
                <InputField
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  showToggle
                  showValue={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  icon={Lock}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-[1.01] shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    LOG IN 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

          

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50">
              <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                <Shield className="w-4 h-4" />
                <span className="font-medium uppercase">Secure Admin Access</span>
              </div>
              <p className="text-xs text-blue-600 text-center mt-1">
                Your session is protected with enterprise-grade security
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              © 2024 NEXSTORE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;