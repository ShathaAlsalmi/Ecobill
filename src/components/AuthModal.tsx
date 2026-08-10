import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Leaf, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Language, translations } from '../translations';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';

export interface AuthUserData {
  fullName?: string;
  email: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userData: AuthUserData) => void;
  onDemoLogin?: () => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onDemoLogin,
  language = 'en',
}) => {
  const t = translations[language];
  const isArabic = language === 'ar';

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Firebase Sign Up handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(isArabic ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setError(isArabic ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      onAuthSuccess({
        fullName: fullName.trim() || email.split('@')[0],
        email: userCredential.user.email || email.trim(),
      });
      onClose();
    } catch (err: any) {
      if (
        err?.code === 'auth/email-already-in-use' ||
        err?.message?.toLowerCase().includes('already-in-use') ||
        err?.message?.toLowerCase().includes('already exists')
      ) {
        setError('User already exists. Please sign in');
      } else if (err?.code === 'auth/weak-password') {
        setError(isArabic ? 'كلمة المرور ضعيفة جداً (يجب أن تتكون من 6 خانات على الأقل)' : 'Password is too weak (must be at least 6 characters)');
      } else {
        setError(err?.message || (isArabic ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred during sign up'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Log In handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(isArabic ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      onAuthSuccess({
        fullName: fullName.trim() || email.split('@')[0],
        email: userCredential.user.email || email.trim(),
      });
      onClose();
    } catch (err: any) {
      setError('Email or password is incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xl overflow-hidden">
        {/* Dynamic Animated Blurry Gradient Background Blobs */}
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-emerald-500/30 dark:bg-emerald-500/20 rounded-full blur-3xl animate-blob-1 pointer-events-none" />
        <div className="absolute top-1/2 -right-16 w-80 h-80 bg-teal-500/30 dark:bg-teal-500/20 rounded-full blur-3xl animate-blob-2 pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-96 h-96 bg-sky-900/40 dark:bg-sky-900/30 rounded-full blur-3xl animate-blob-3 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 max-w-sm w-full shadow-2xl border border-slate-200/90 dark:border-slate-800 relative overflow-hidden my-auto max-h-[95vh] overflow-y-auto"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Top Decorative Background Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-100/50 dark:bg-emerald-950/30 blur-2xl rounded-full -z-10 pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 rtl:right-auto rtl:left-3 p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* EcoBill Brand Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20">
              <Leaf className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight block leading-none">
                Eco<span className="text-emerald-600 dark:text-emerald-400">Bill</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-0.5">
                {t.brandTagline}
              </span>
            </div>
          </div>

          {/* Modal Titles */}
          <div className="mb-3 space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {mode === 'signup' ? t.authTitleSignUp : t.authTitleLogin}
            </h2>
            {mode === 'login' && (
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {t.authSubtitleLogin}
              </p>
            )}
          </div>

          {/* Form Error Message */}
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 dark:bg-rose-950/60 border border-red-200 dark:border-rose-800 text-red-700 dark:text-rose-300 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={mode === 'signup' ? handleSignUp : handleLogin} className="space-y-2.5">
            {/* Full Name field (Sign Up mode only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-0.5">
                  {t.labelFullName}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-2.5 rtl:pl-0 rtl:pr-2.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required={mode === 'signup'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.placeholderFullName}
                    className="w-full pl-8 rtl:pl-2.5 rtl:pr-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address field */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-0.5">
                {t.labelEmail}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-2.5 rtl:pl-0 rtl:pr-2.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholderEmail}
                  className="w-full pl-8 rtl:pl-2.5 rtl:pr-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-0.5">
                {t.labelPassword}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-2.5 rtl:pl-0 rtl:pr-2.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.placeholderPassword}
                  className="w-full pl-8 rtl:pl-2.5 rtl:pr-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 group"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signup' ? t.btnSignUp : t.btnLogin}</span>
                  <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </form>

          {/* Divider Line with "OR / أو" */}
          <div className="relative my-2.5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative px-2 bg-white dark:bg-slate-900 text-[10px] font-extrabold text-slate-400 dark:text-slate-500">
              {isArabic ? 'أو' : 'OR'}
            </div>
          </div>

          {/* Secondary Outlined Demo Login Button */}
          <button
            type="button"
            onClick={() => {
              if (onDemoLogin) {
                onDemoLogin();
                onClose();
              } else {
                onAuthSuccess({
                  fullName: isArabic ? 'سارة العتيبي' : 'Sara Al-Otaibi',
                  email: 'demo@ecobill.sa',
                });
                onClose();
              }
            }}
            className="w-full py-2 px-3 bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center text-center"
          >
            {isArabic ? 'المتابعة كعرض تجريبي' : 'Sign In as Demo'}
          </button>

          {/* Mode Switcher Toggle */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              {mode === 'signup' ? t.alreadyHaveAccount : t.dontHaveAccount}
            </span>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(mode === 'signup' ? 'login' : 'signup');
              }}
              className="font-extrabold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer"
            >
              {mode === 'signup' ? t.switchToLogin : t.switchToSignUp}
            </button>
          </div>

          {/* Security badge */}
          <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{t.secureData}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
