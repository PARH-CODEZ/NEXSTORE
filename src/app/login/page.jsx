'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { RecaptchaVerifier } from 'firebase/auth';
// import { auth } from '@/lib/firebaseConfig';
// import { signInWithPhoneNumber } from 'firebase/auth';
// import sendOtpToPhone from '@/lib/sendOtpToPhone';
// import Footer from './Footer'; // Uncomment this when you have the Footer component
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/userSlice'; 
import { toast } from 'react-toastify';


const InputField = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  showToggle = false,
  showValue = false,
  onToggle
}) => (
  <div className="mb-4">
    <div className="relative">
      <input
        type={showToggle ? (showValue ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all ${error
          ? 'border-red-500 focus:ring-red-200'
          : 'border-gray-300 focus:ring-orange-200 focus:border-orange-500'
          }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

const Login = () => {
 const dispatch = useDispatch();

  const router = useRouter(); 
  const [currentStep, setCurrentStep] = useState('initial'); //[ initial, signin, signup, password]
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

   const handleClose = () => {
    router.push('/'); // 🔁 Redirects to homepage
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const input = email.trim();
    const newErrors = {};

    if (!input) {
      newErrors.email = 'Enter your email or mobile phone number';
    } else if (!validateEmail(input) && !validatePhone(input)) {
      newErrors.email = 'Enter a valid email or mobile phone number';
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Set the respective state for email or phone
    if (validateEmail(input)) {
      setEmail(input);
      setPhone('');
    } else {
      setPhone(input);
      setEmail('');
    }

    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validateEmail(input) ? { email: input } : { phone: input }),
        redirect: 'manual',
      });

      if (res.redirected || res.status === 302) {
        window.location.href = res.url || '/seller-login';
        return;
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Server error');

      if (data.exists && data.isCustomer) {
        setCurrentStep('signin');
      } else if (!data.exists) {
        setCurrentStep('signup');
      } else {
        setErrors({ email: 'This account is not a customer account.' });
      }
    } catch (err) {
      setErrors({ email: err.message });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!password) {
      newErrors.password = 'Enter your password';
    } else if (password.length < 6) {
      newErrors.password = 'Your password is incorrect';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('/api/auth/login-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, password }),
      });
      const data = await response.json();
      dispatch(setUser(data.user));
      router.push('/');
    } catch (error) {
      setErrors({ password: 'Server error, try again later' });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Enter your name';
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    }
    if (!phone.trim()) {
      newErrors.phone = 'Enter your mobile number';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }

    if (!password) {
      newErrors.password = 'Enter your password';
    } else if (password.length < 6) {
      newErrors.password = 'Passwords must be at least 6 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Type your password again';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords must match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Check if phone/email already registered
    const res = await fetch('/api/auth/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone }),
    });

    if (!res.ok) {
      alert('Server error, try again later.');
      return;
    }

    const data = await res.json();

    if (data.exists) {
      setErrors({ phone: 'Already registered' });
      return;
    }

    // Directly create the user without OTP
    try {
      const registerRes = await fetch('/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setErrors({ general: registerData.error || 'Signup failed' });
        return;
      }

      toast.success('Account created successfully!'); 
      resetForm();          
      setCurrentStep('initial'); 

    } catch (err) {
      console.error(err);
      alert('Signup failed. Try again.');
    }
  };

  // const handleOtpSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!otp || otp.length !== 6) {
  //     setErrors({ otp: 'Enter a valid 6‑digit OTP' });
  //     return;
  //   }

  //   try {
  //     // 1. Ask Firebase to verify the code
  //     await window.confirmationResult.confirm(otp);

  //     // 2. Create user in SQL DB
  //     const res = await fetch('/api/auth/register-user', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ name, email, phone, password }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) {
  //       setErrors({ otp: data.error || 'Signup failed' });
  //       return;
  //     }

  //     alert('Account created successfully!');
  //     resetForm();             // back to initial step
  //     setCurrentStep('signin'); // or redirect
  //   } catch (err) {
  //     console.error(err);
  //     setErrors({ otp: 'Invalid or expired OTP' });
  //   }
  // };

  const resetForm = () => {
    setCurrentStep('initial');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Initial Step - Email/Phone Entry
  if (currentStep === 'initial') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <button
          className="fixed top-4 right-4 z-50 text-gray-600 hover:text-black text-2xl font-bold focus:outline-none"
          onClick={handleClose} 
        >
          &times;
        </button>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">NEXSTORE</h1>
              <div className="w-20 h-1 bg-orange-400 mx-auto mt-1 rounded"></div>
            </div>

            {/* Form Container */}
            <div className="border border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-medium mb-4">SIGN IN OR CREATE ACCOUNT</h2>

              <form onSubmit={handleEmailSubmit}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ENTER MOBILE NUMBER OR EMAIL
                </label>

                <InputField
                  type="text"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />

                <button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  CONTINUE
                </button>
              </form>

              <div className="mt-4 text-xs text-gray-600">
                By continuing, you agree to Nexstore's{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Conditions of Use
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Privacy Notice
                </a>
                .
              </div>

              <div className="mt-6 pt-6 border-t border-gray-300">
                <h3 className="text-sm font-medium text-gray-700 mb-2">BUYING FOR WORK?</h3>
                <a href="/seller-login" className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                  Create a free seller account
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-xs text-gray-500 space-x-4">
              <a href="#" className="hover:text-blue-600">Conditions of Use</a>
              <a href="#" className="hover:text-blue-600">Privacy Notice</a>
              <a href="#" className="hover:text-blue-600">Help</a>
            </div>
            <div className="text-center mt-2 text-xs text-gray-500">
              © 2025, Nexstore.com, Inc. or its affiliates
            </div>
          </div>
        </div>
      
      </div>
    );
  }

  // Sign In Step
  if (currentStep === 'signin') {
    return (
      
      <div className="min-h-screen bg-white flex flex-col">
        <button
          className="fixed top-4 right-4 z-50 text-gray-600 hover:text-black text-2xl font-bold focus:outline-none"
          onClick={handleClose}
        >
          &times;
        </button>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">NEXSTORE</h1>
              <div className="w-20 h-1 bg-orange-400 mx-auto mt-1 rounded"></div>
            </div>

            {/* Form Container */}
            <div className="border border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-medium mb-4">SIGN IN</h2>

              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{email || phone}</span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    CHANGE
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignIn}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PASSWORD
                </label>

                <InputField
                  type="password"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  showToggle={true}
                  showValue={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />

                <button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  SIGN IN
                </button>
              </form>

              <div className="mt-4 text-xs text-gray-600">
                By continuing, you agree to Nexstore's{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Conditions of Use
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Privacy Notice
                </a>
                .
              </div>

              <div className="mt-4">
                <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* New to NEXSTORE */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">NEW TO NEXSTORE?</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep('signup')}
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-black py-2 px-4 rounded-md text-sm font-medium transition-colors border border-gray-300"
              >
                CREATE YOUR NEXSTORE ACCOUNT
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-xs text-gray-500 space-x-4">
              <a href="#" className="hover:text-blue-600">CONDITIONS OF USE</a>
              <a href="#" className="hover:text-blue-600">PRIVACY NOTICE</a>
              <a href="#" className="hover:text-blue-600">HELP</a>
            </div>
            <div className="text-center mt-2 text-xs text-gray-500">
              © 2025, NEXSTORE.COM, INC. OR ITS AFFILIATES
            </div>
          </div>
        </div>
       
      </div>
    );
  }

  // Sign Up Step - Fixed the entire signup form
  if (currentStep === 'signup') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <button
          className="fixed top-4 right-4 z-50 text-gray-600 hover:text-black text-2xl font-bold focus:outline-none"
          onClick={handleClose} 
        >
          &times;
        </button>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">NEXSTORE</h1>
              <div className="w-20 h-1 bg-orange-400 mx-auto mt-1 rounded"></div>
            </div>

            {/* Form Container */}
            <div className="border border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-medium mb-4">CREATE ACCOUNT</h2>

              <form onSubmit={handleSignUp}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YOUR NAME
                </label>
                <InputField
                  type="text"
                  placeholder="First and last name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EMAIL
                </label>
                <InputField
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MOBILE NUMBER
                </label>
                <InputField
                  type="tel"
                  placeholder="Mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PASSWORD
                </label>
                <InputField
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  showToggle={true}
                  showValue={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CONFIRM PASSWORD
                </label>
                <InputField
                  type="password"
                  placeholder="Type your password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  showToggle={true}
                  showValue={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                {errors.general && (
                  <div className="mb-4 text-red-600 text-sm">
                    {errors.general}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  CREATE YOUR NEXSTORE ACCOUNT
                </button>
              </form>

              <div className="mt-4 text-xs text-gray-600">
                By creating an account, you agree to Nexstore's{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Conditions of Use
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Privacy Notice
                </a>
                .
              </div>

              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentStep('signin')}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-xs text-gray-500 space-x-4">
              <a href="#" className="hover:text-blue-600">CONDITIONS OF USE</a>
              <a href="#" className="hover:text-blue-600">PRIVACY NOTICE</a>
              <a href="#" className="hover:text-blue-600">HELP</a>
            </div>
            <div className="text-center mt-2 text-xs text-gray-500">
              © 2025, NEXSTORE.COM, INC. OR ITS AFFILIATES
            </div>
          </div>
        </div>
      
      </div>
    );
  }

  // Default return (shouldn't reach here)
  return null;
};

export default Login;