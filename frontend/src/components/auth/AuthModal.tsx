import { useState, useRef, useEffect, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

type Tab = 'login' | 'register';

interface FormState {
  email: string;
  password: string;
  username: string;
  confirmPassword: string;
}

interface FieldError {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
  general?: string;
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [form, setForm] = useState<FormState>({ email: '', password: '', username: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FieldError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => emailRef.current?.focus(), 300);
      setForm({ email: '', password: '', username: '', confirmPassword: '' });
      setErrors({});
      setSuccessMessage('');
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setSuccessMessage('');
    }
  }, [activeTab, isOpen]);

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FieldError]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateLogin = (): boolean => {
    const newErrors: FieldError = {};
    if (!form.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email không hợp lệ';
    if (!form.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = (): boolean => {
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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setErrors({});
    try {
      await login(form.email, form.password);
      onClose();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials') || msg.toLowerCase().includes('email not confirmed')) {
        setErrors({ general: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.' });
      } else {
        setErrors({ general: msg || 'Đăng nhập thất bại. Vui lòng thử lại.' });
      }
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setErrors({});
    try {
      const result = await register(form.email, form.password, form.username || undefined);
      if (result.needsEmailConfirmation) {
        setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
      } else {
        onClose();
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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.93, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 28 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
          >
            <div
              className="relative w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              {/* Glow decoration */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 blur-lg opacity-60 pointer-events-none" />

              <div className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(11, 15, 25, 0.95)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                }}
              >
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    id="auth-modal-close"
                    className="absolute top-4 right-4 p-2 rounded-full text-on-surface-variant hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Logo + Title */}
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-3">
                      <span className="font-display font-extrabold text-white text-xl">A</span>
                    </div>
                    <h2 className="text-xl font-display font-bold text-white">Truyện HT</h2>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {activeTab === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="flex bg-surface-container rounded-xl p-1 gap-1">
                    {(['login', 'register'] as Tab[]).map(tab => (
                      <button
                        key={tab}
                        id={`auth-tab-${tab}`}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab
                          ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-white/10'
                          : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {tab === 'login' ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        {tab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form area */}
                <div className="px-6 pb-6">
                  {/* Success Message */}
                  <AnimatePresence mode="wait">
                    {successMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2.5 p-3 rounded-xl mb-4"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                      >
                        <CheckCircle className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                        <p className="text-sm text-tertiary">{successMessage}</p>
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
                        className="flex items-start gap-2.5 p-3 rounded-xl mb-4"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400">{errors.general}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {activeTab === 'login' ? (
                      <motion.form
                        key="login-form"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleLogin}
                        className="space-y-3"
                        id="login-form"
                        noValidate
                      >
                        {/* Email */}
                        <div>
                          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                            <input
                              ref={emailRef}
                              id="login-email"
                              type="email"
                              autoComplete="email"
                              placeholder="you@example.com"
                              value={form.email}
                              onChange={handleChange('email')}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-on-surface-variant outline-none transition-all ${errors.email
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
                              id="login-password"
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="current-password"
                              placeholder="••••••••"
                              value={form.password}
                              onChange={handleChange('password')}
                              className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder-on-surface-variant outline-none transition-all ${errors.password
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

                        {/* Submit */}
                        <button
                          id="login-submit"
                          type="submit"
                          disabled={isLoading}
                          className="w-full mt-1 py-2.5 px-4 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            background: isLoading ? 'rgba(168,85,247,0.5)' : 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                            boxShadow: isLoading ? 'none' : '0 0 20px rgba(168,85,247,0.3)',
                          }}
                        >
                          {isLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Đang đăng nhập...</>
                          ) : (
                            <><LogIn className="w-4 h-4" /> Đăng nhập</>
                          )}
                        </button>

                        <p className="text-center text-xs text-on-surface-variant pt-1">
                          Chưa có tài khoản?{' '}
                          <button type="button" onClick={() => setActiveTab('register')} className="text-secondary hover:underline font-semibold">
                            Đăng ký ngay
                          </button>
                        </p>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="register-form"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleRegister}
                        className="space-y-3"
                        id="register-form"
                        noValidate
                      >
                        {/* Username */}
                        <div>
                          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                            Tên hiển thị <span className="normal-case text-on-surface-variant/60">(tùy chọn)</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                            <input
                              id="register-username"
                              type="text"
                              autoComplete="username"
                              placeholder="Kiến trúc sư ẩn danh"
                              value={form.username}
                              onChange={handleChange('username')}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-on-surface-variant outline-none transition-all border border-white/8 bg-surface-container focus:border-secondary/50 focus:shadow-[0_0_0_2px_rgba(6,182,212,0.1)]"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                            <input
                              id="register-email"
                              type="email"
                              autoComplete="email"
                              placeholder="you@example.com"
                              value={form.email}
                              onChange={handleChange('email')}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-on-surface-variant outline-none transition-all ${errors.email
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
                              id="register-password"
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              placeholder="Ít nhất 6 ký tự"
                              value={form.password}
                              onChange={handleChange('password')}
                              className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder-on-surface-variant outline-none transition-all ${errors.password
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
                              id="register-confirm-password"
                              type={showConfirmPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              placeholder="Nhập lại mật khẩu"
                              value={form.confirmPassword}
                              onChange={handleChange('confirmPassword')}
                              className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder-on-surface-variant outline-none transition-all ${errors.confirmPassword
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
                          id="register-submit"
                          type="submit"
                          disabled={isLoading}
                          className="w-full mt-1 py-2.5 px-4 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            background: isLoading ? 'rgba(168,85,247,0.5)' : 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                            boxShadow: isLoading ? 'none' : '0 0 20px rgba(168,85,247,0.3)',
                          }}
                        >
                          {isLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Đang đăng ký...</>
                          ) : (
                            <><UserPlus className="w-4 h-4" /> Tạo tài khoản</>
                          )}
                        </button>

                        <p className="text-center text-xs text-on-surface-variant pt-1">
                          Đã có tài khoản?{' '}
                          <button type="button" onClick={() => setActiveTab('login')} className="text-secondary hover:underline font-semibold">
                            Đăng nhập
                          </button>
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

