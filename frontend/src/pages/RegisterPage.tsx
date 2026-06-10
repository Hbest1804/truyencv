import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

interface FieldError {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FieldError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field: 'email' | 'username' | 'password' | 'confirmPassword') => (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FieldError]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldError = {};
    if (!form.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email không hợp lệ';
    if (!form.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    setSuccessMessage('');
    try {
      const result = await register(form.email, form.password, form.username || undefined);
      if (result.needsEmailConfirmation) {
        setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
      } else {
        setSuccessMessage('Đăng ký thành công! Chuyển hướng đến trang chủ...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
        setErrors({ general: 'Email này đã được đăng ký. Vui lòng đăng nhập.' });
      } else {
        setErrors({ general: msg || 'Đăng ký thất bại. Vui lòng thử lại.' });
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center pt-32 pb-24 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-secondary/10 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 blur-lg opacity-60 pointer-events-none" />
        
        <div
          className="relative rounded-2xl overflow-hidden p-8"
          style={{
            background: 'rgba(11, 15, 25, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <Link to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-3">
              <span className="font-display font-extrabold text-white text-xl">A</span>
            </Link>
            <h2 className="text-2xl font-display font-bold text-white">Đăng ký</h2>
            <p className="text-sm text-on-surface-variant mt-1.5">
              Tham gia thế giới truyện cùng Truyện HT!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Success Message */}
            <AnimatePresence mode="wait">
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-400">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* General Error */}
            <AnimatePresence mode="wait">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{errors.general}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                Tên hiển thị <span className="normal-case text-on-surface-variant/60">(tùy chọn)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  type="text"
                  placeholder="Người đọc bí ẩn"
                  value={form.username}
                  onChange={handleChange('username')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-on-surface-variant outline-none transition-all border border-white/8 bg-surface-container focus:border-secondary/50 focus:shadow-[0_0_0_2px_rgba(6,182,212,0.1)]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-on-surface-variant outline-none transition-all ${errors.email
                    ? 'border border-red-500/60 bg-red-500/5 focus:border-red-500'
                    : 'border border-white/8 bg-surface-container focus:border-secondary/50 focus:shadow-[0_0_0_2px_rgba(6,182,212,0.1)]'
                    }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1 ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={handleChange('password')}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-on-surface-variant outline-none transition-all ${errors.password
                    ? 'border border-red-500/60 bg-red-500/5 focus:border-red-500'
                    : 'border border-white/8 bg-surface-container focus:border-secondary/50 focus:shadow-[0_0_0_2px_rgba(6,182,212,0.1)]'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-on-surface-variant outline-none transition-all ${errors.confirmPassword
                    ? 'border border-red-500/60 bg-red-500/5 focus:border-red-500'
                    : 'border border-white/8 bg-surface-container focus:border-secondary/50 focus:shadow-[0_0_0_2px_rgba(6,182,212,0.1)]'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400 mt-1 ml-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: isLoading ? 'rgba(168,85,247,0.5)' : 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                boxShadow: isLoading ? 'none' : '0 0 20px rgba(168,85,247,0.3)',
              }}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang đăng ký...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Đăng ký</>
              )}
            </button>

            <p className="text-center text-xs text-on-surface-variant pt-2">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-secondary hover:underline font-semibold">
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
