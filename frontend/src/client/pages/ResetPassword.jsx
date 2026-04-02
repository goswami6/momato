import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';
import { apiResetPassword } from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    setApiError('');
    if (Object.keys(errs).length > 0) return;

    if (!token) {
      setApiError('Invalid or missing reset token. Please request a new reset link.');
      return;
    }

    setLoading(true);
    try {
      await apiResetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4 pt-8 pb-8 md:pt-[100px] md:pb-10">
        <div className="w-full max-w-[440px]">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#267E3E]/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-[#267E3E]" />
            </div>
            <h1 className="text-[22px] font-bold text-[#1C1C1C] mb-2">Password reset!</h1>
            <p className="text-[15px] text-[#696969] mb-6">Your password has been successfully reset. You can now log in with your new password.</p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#EF4F5F] text-white font-semibold text-sm rounded-xl hover:bg-[#e23744] transition-all"
            >
              Go to Login <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4 pt-8 pb-8 md:pt-[100px] md:pb-10">
      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-10">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#EF4F5F]/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} className="text-[#EF4F5F]" />
            </div>
            <h1 className="text-[22px] font-bold text-[#1C1C1C] mb-2">Set new password</h1>
            <p className="text-[14px] text-[#696969]">Your new password must be at least 6 characters.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-[#EF4F5F] text-sm px-4 py-3 rounded-xl">
                {apiError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
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

            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirm: '' }); }}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.confirm ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'}`}
                />
              </div>
              {errors.confirm && <p className="text-xs text-[#EF4F5F] mt-1.5 ml-1">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#EF4F5F] text-white font-semibold text-[15px] rounded-xl hover:bg-[#e23744] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Reset password <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#696969] mt-6">
            <Link to="/login" className="text-[#EF4F5F] font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
