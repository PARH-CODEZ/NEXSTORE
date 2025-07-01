'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
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
}) => (
  <div className="mb-4">
    <div className="relative">
      <input
        type={showToggle ? (showValue ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:ring-orange-200 focus:border-orange-500'
        }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label={showValue ? 'Hide password' : 'Show password'}
        >
          {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
    {error && (
      <div className="flex items-center mt-1 text-red-600 text-xs">
        <AlertCircle size={14} className="mr-1" />
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
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <button
        className="fixed top-4 right-4 z-50 text-gray-600 hover:text-black text-2xl font-bold focus:outline-none"
        onClick={handleClose}
        aria-label="Close"
      >
        &times;
      </button>

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">NEXSTORE ADMIN LOGIN</h1>
            <div className="w-90 h-1 bg-red-600 mx-auto mt-1 rounded"></div>
          </div>

          {/* Form Container */}
          <div className="border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">ADMIN LOGIN</h2>

            {errors.general && (
              <div className="mb-4 text-red-600 text-center font-semibold">{errors.general}</div>
            )}

            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ENTER EMAIL 
              </label>

              <InputField
                type="text"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />

              <label className="block text-sm font-medium text-gray-700 mb-2">PASSWORD</label>

              <InputField
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                showToggle
                showValue={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />

              <button
                type="submit"
                className="w-full mb-[20px] bg-red-600 hover:bg-red-500 text-black py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                CONTINUE
              </button>
            </form>

            
            
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
