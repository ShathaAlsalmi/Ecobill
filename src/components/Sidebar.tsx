import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  FileText,
  Box,
  BarChart3,
  LayoutDashboard,
  Leaf,
  X,
  ShieldCheck,
  User,
  Coins,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { Language } from '../translations';

export type NavItemKey =
  | 'settings'
  | 'electricity_bill'
  | 'digital_twin'
  | 'benchmarking'
  | 'dashboard'
  | 'ai_assistants';

interface SidebarProps {
  activeNavItem: NavItemKey;
  onSelectNavItem: (item: NavItemKey) => void;
  language: Language;
  savedBillsCount: number;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { fullName?: string; email?: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNavItem,
  onSelectNavItem,
  language,
  savedBillsCount,
  isOpen,
  onClose,
  currentUser,
}) => {
  const isArabic = language === 'ar';

  const navItems: { key: NavItemKey; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    {
      key: 'dashboard',
      label: isArabic ? '١. لوحة التحكم' : '1. Dashboard',
      icon: LayoutDashboard,
    },
    {
      key: 'electricity_bill',
      label: isArabic ? '٢. فواتيري' : '2. My Bills',
      icon: FileText,
      badge: savedBillsCount,
    },
    {
      key: 'digital_twin',
      label: isArabic ? '٣. التوأم الرقمي' : '3. Digital Twin',
      icon: Box,
    },
    {
      key: 'benchmarking',
      label: isArabic ? '٤. المقارنة المرجعية' : '4. Benchmarking',
      icon: BarChart3,
    },
    {
      key: 'ai_assistants',
      label: isArabic ? '٥. الوكلاء الذكيون' : '5. AI Agents',
      icon: Sparkles,
    },
  ];

  const handleNavClick = (key: NavItemKey) => {
    onSelectNavItem(key);
    onClose();
  };

  // Determine slide direction based on RTL vs LTR
  const slideInitial = isArabic ? { x: '100%' } : { x: '-100%' };
  const slideExit = isArabic ? { x: '100%' } : { x: '-100%' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Semi-transparent Dark Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sliding Sidebar Drawer Panel */}
          <motion.div
            initial={slideInitial}
            animate={{ x: 0 }}
            exit={slideExit}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className={`fixed top-0 bottom-0 ${
              isArabic ? 'right-0 border-l' : 'left-0 border-r'
            } w-80 max-w-[85vw] h-full z-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-colors duration-200`}
          >
            {/* Drawer Header: Logo, Interactive Profile Badge, & Close Button */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20 shrink-0">
                  <Leaf className="w-5 fill-current text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight block leading-tight">
                    Eco<span className="text-emerald-600 dark:text-emerald-400">Bill</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavClick('settings')}
                    className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer group max-w-[150px] sm:max-w-[170px]"
                    title={isArabic ? 'الانتقال إلى إعدادات الملف الشخصي' : 'Go to Profile Settings'}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate text-[11px] font-bold">
                      {(() => {
                        const raw = currentUser?.fullName || currentUser?.email || '';
                        if (!raw) return isArabic ? 'ليان' : 'Layan';
                        // Extract first name or clean handle (e.g. layan.abdullah007 -> Layan)
                        const prefix = raw.split('@')[0].split('.')[0].replace(/[0-9]/g, '').trim();
                        if (prefix) {
                          return prefix.charAt(0).toUpperCase() + prefix.slice(1);
                        }
                        return currentUser?.fullName || (isArabic ? 'ليان' : 'Layan');
                      })()}
                    </span>
                  </button>
                </div>
              </div>

              {/* Close Drawer Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title={isArabic ? 'إغلاق القائمة' : 'Close Menu'}
                aria-label={isArabic ? 'إغلاق القائمة' : 'Close Menu'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links List */}
            <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isArabic ? 'القائمة الرئيسية' : 'MAIN NAVIGATION'}
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNavItem === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavClick(item.key)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold border-r-4 rtl:border-r-0 rtl:border-l-4 border-emerald-600 dark:border-emerald-500 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate tracking-tight">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-400 text-slate-900 shadow-2xs shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dedicated Bottom Settings Button */}
            <div className="px-3 pt-2 pb-1 border-t border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                  activeNavItem === 'settings'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold border-r-4 rtl:border-r-0 rtl:border-l-4 border-emerald-600 dark:border-emerald-500 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      activeNavItem === 'settings'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="truncate tracking-tight">{isArabic ? 'الإعدادات' : 'Settings'}</span>
                </div>
              </button>
            </div>

            {/* Sidebar Footer Info Card */}
            <div className="p-4 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs mb-1">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{isArabic ? 'حالة الحساب: نشط' : 'Account Status: Active'}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {isArabic
                  ? 'متصل عبر محرك الذكاء الاصطناعي لحساب الفاتورة'
                  : 'Connected via AI Energy Calculation Engine'}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
