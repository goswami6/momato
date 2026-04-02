import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Phone, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState('email'); // 'email' | 'phone'
  const [form, setForm] = useState({ email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const validate = () => {
    const errs = {};
    if (tab === 'email') {
      if (!form.email.trim()) errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
      if (!form.password) errs.password = 'Password is required';
      else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    } else {
      if (!form.phone.trim()) errs.phone = 'Phone number is required';
      else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid 10-digit number';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setApiError('');
    if (Object.keys(errs).length > 0) return;

    if (tab === 'phone') {
      // Simulate OTP send
      if (!otpSent) {
        setOtpSent(true);
        return;
      }
      // OTP verification would go here; for now show message
      setApiError('OTP login coming soon! Please use email login for now.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'owner') navigate('/owner');
      else navigate('/');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      if (el) el.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const el = document.getElementById(`otp-${idx - 1}`);
      if (el) el.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4 pt-8 pb-8 md:pt-[100px] md:pb-10">
      <div className="w-full max-w-[440px]">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-10">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-[26px] font-bold text-[#1C1C1C] mb-2">Welcome back</h1>
            <p className="text-[15px] text-[#696969]">Log in to your momato account</p>
          </div>

          {/* Login method tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setTab('email'); setApiError(''); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'email' ? 'bg-white text-[#1C1C1C] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Mail size={16} /> Email
            </button>
            <button
              type="button"
              onClick={() => { setTab('phone'); setApiError(''); setErrors({}); setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'phone' ? 'bg-white text-[#1C1C1C] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Smartphone size={16} /> Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-[#EF4F5F] text-sm px-4 py-3 rounded-xl">
                {apiError}
              </div>
            )}

            {tab === 'email' ? (
              <>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.email ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-[#EF4F5F] mt-1.5 ml-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-[#1C1C1C]">Password</label>
                    <Link to="/forgot-password" className="text-xs text-[#EF4F5F] font-medium hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                      className={`w-full pl-11 pr-12 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.password ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C] hover:text-[#696969] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-[#EF4F5F] mt-1.5 ml-1">{errors.password}</p>}
                </div>
              </>
            ) : (
              <>
                {/* Phone input */}
                {!otpSent ? (
                  <div>
                    <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                      <div className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-[#696969] font-medium">+91</div>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={form.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d\s]/g, '');
                          if (val.replace(/\s/g, '').length <= 10) {
                            setForm({ ...form, phone: val });
                            setErrors({ ...errors, phone: '' });
                          }
                        }}
                        className={`w-full pl-[5.5rem] pr-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.phone ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'}`}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-[#EF4F5F] mt-1.5 ml-1">{errors.phone}</p>}
                    <p className="text-xs text-gray-400 mt-2 ml-1">We'll send a 6-digit OTP to verify your number</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-[#EF4F5F]/10 flex items-center justify-center mx-auto mb-3">
                        <Smartphone size={24} className="text-[#EF4F5F]" />
                      </div>
                      <p className="text-sm text-[#696969]">
                        OTP sent to <span className="font-semibold text-[#1C1C1C]">+91 {form.phone}</span>
                      </p>
                      <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-[#EF4F5F] font-medium hover:underline mt-1">
                        Change number
                      </button>
                    </div>
                    <label className="block text-sm font-medium text-[#1C1C1C] mb-3 text-center">Enter OTP</label>
                    <div className="flex justify-center gap-2.5">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl outline-none focus:border-[#EF4F5F] transition-colors"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      Didn't receive? <button type="button" className="text-[#EF4F5F] font-medium hover:underline">Resend OTP</button>
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#EF4F5F] text-white font-semibold text-[15px] rounded-xl hover:bg-[#e23744] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : tab === 'phone' && !otpSent ? (
                <>Send OTP <ArrowRight size={18} /></>
              ) : tab === 'phone' && otpSent ? (
                <>Verify & Login <ArrowRight size={18} /></>
              ) : (
                <>Log in <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-[#9C9C9C] font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login */}
          <button className="w-full py-3 rounded-xl border-2 border-gray-200 flex items-center justify-center gap-3 text-[14px] font-semibold text-[#1C1C1C] hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all active:scale-[0.98]">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[#696969] mt-7">
            New to momato?{' '}
            <Link to="/signup" className="text-[#EF4F5F] font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-[#9C9C9C] mt-6 leading-relaxed px-4">
          By logging in, you agree to our{' '}
          <span className="text-[#696969] cursor-pointer hover:underline">Terms of Service</span>,{' '}
          <span className="text-[#696969] cursor-pointer hover:underline">Privacy Policy</span> and{' '}
          <span className="text-[#696969] cursor-pointer hover:underline">Content Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Login;
