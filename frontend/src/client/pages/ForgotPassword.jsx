import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { apiForgotPassword } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return; }

    setLoading(true);
    try {
      const data = await apiForgotPassword(email);
      setSent(true);
      if (data.resetToken) setResetToken(data.resetToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4 pt-8 pb-8 md:pt-[100px] md:pb-10">
        <div className="w-full max-w-[440px]">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#267E3E]/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-[#267E3E]" />
            </div>
            <h1 className="text-[22px] font-bold text-[#1C1C1C] mb-2">Check your email</h1>
            <p className="text-[15px] text-[#696969] mb-6">
              If an account exists for <span className="font-semibold text-[#1C1C1C]">{email}</span>, we've sent password reset instructions.
            </p>

            {/* Dev-mode: show direct reset link */}
            {resetToken && (
              <Link
                to={`/reset-password?token=${resetToken}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#EF4F5F] text-white font-semibold text-sm rounded-xl hover:bg-[#e23744] transition-all mb-4"
              >
                Reset Password <ArrowRight size={16} />
              </Link>
            )}

            <p className="text-sm text-[#696969]">
              <Link to="/login" className="text-[#EF4F5F] font-semibold hover:underline inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4 pt-8 pb-8 md:pt-[100px] md:pb-10">
      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-10">
          {/* Back link */}
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-[#696969] hover:text-[#1C1C1C] transition-colors mb-6">
            <ArrowLeft size={16} /> Back to login
          </Link>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#EF4F5F]/10 flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-[#EF4F5F]" />
            </div>
            <h1 className="text-[22px] font-bold text-[#1C1C1C] mb-2">Forgot password?</h1>
            <p className="text-[14px] text-[#696969]">No worries, we'll send you reset instructions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-[#EF4F5F] text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${error ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'}`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#EF4F5F] text-white font-semibold text-[15px] rounded-xl hover:bg-[#e23744] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Send reset link <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
