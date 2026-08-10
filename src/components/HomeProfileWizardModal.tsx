import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Home, MapPin, Maximize2, Users, Layers, Sparkles, Check, Plus, Minus, ArrowRight } from 'lucide-react';
import { Language, translations, toLocalDigits } from '../translations';
import { SAUDI_CITIES } from './AboutHomeSection';

interface HomeProfileWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  setCity: (val: string) => void;
  homeSizeM2: number;
  setHomeSizeM2: (val: number) => void;
  familyMembers: number;
  setFamilyMembers: (val: number) => void;
  floors: number;
  setFloors: (val: number) => void;
  onSubmitProfile: () => void;
  language: Language;
}

export const HomeProfileWizardModal: React.FC<HomeProfileWizardModalProps> = ({
  isOpen,
  onClose,
  city,
  setCity,
  homeSizeM2,
  setHomeSizeM2,
  familyMembers,
  setFamilyMembers,
  floors,
  setFloors,
  onSubmitProfile,
  language = 'en',
}) => {
  const isArabic = language === 'ar';
  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitProfile();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200/90 dark:border-slate-800 relative overflow-hidden my-8"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Top Decorative Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/60 dark:bg-emerald-950/30 blur-3xl rounded-full -z-10 pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isArabic ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Wizard Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{isArabic ? 'معالج إعداد المنزل' : 'Home Profile Setup Wizard'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isArabic ? 'إعداد بيانات العقار والمنزل' : 'Household Details Setup'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            {isArabic
              ? 'يرجى إدخال البيانات التالية لتخصيص محاكاة استهلاك الطاقة، وتفعيل التوأم الرقمي ثلاثي الأبعاد والتوصيات الذكية.'
              : 'Please set your home specifications below to calibrate energy benchmarks, 3D digital twin simulation, and customized cost savings.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input 1: City / Location */}
            <div>
              <label htmlFor="wizard-city" className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                {isArabic ? 'المدينة أو مكان الإقامة' : 'City / Location'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isArabic ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  id="wizard-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full ${isArabic ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-200 dark:focus:ring-emerald-950/50 rounded-2xl text-slate-900 dark:text-slate-100 font-extrabold text-sm focus:outline-none focus:ring-4 transition-all cursor-pointer`}
                >
                  {SAUDI_CITIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {isArabic ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {isArabic ? 'تحدد ظروف المناخ والحرارة الموسمية المعتمدة في منطقتك' : 'Calculates seasonal climate benchmarks for your region'}
              </p>
            </div>

            {/* Input 2: Home Area (m²) */}
            <div>
              <label htmlFor="wizard-home-area" className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                {isArabic ? 'مساحة المنزل الإجمالية' : 'Home Area'} <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2" dir="ltr">
                <button
                  type="button"
                  onClick={() => setHomeSizeM2(Math.max(10, homeSizeM2 - 10))}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'تقليل المساحة' : 'Decrease area'}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    id="wizard-home-area"
                    value={homeSizeM2 ? `${toLocalDigits(homeSizeM2, language as Language)} ${isArabic ? 'م²' : 'm²'}` : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d٠١٢٣٤٥٦٧٨٩]/g, '');
                      const western = raw.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                      const val = parseInt(western, 10);
                      setHomeSizeM2(isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    placeholder={isArabic ? 'مثال: 180' : 'e.g. 180'}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-extrabold text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setHomeSizeM2(Math.min(2000, homeSizeM2 + 10))}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'زيادة المساحة' : 'Increase area'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {isArabic ? 'المساحة المبنية التقريبية بالأمتار المربعة' : 'Approximate built area in square meters'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Input 3: Household Members Count */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  {isArabic ? 'عدد أفراد الأسرة' : 'Household Members'} <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2" dir="ltr">
                  <button
                    type="button"
                    onClick={() => setFamilyMembers(Math.max(1, familyMembers - 1))}
                    className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shrink-0"
                    title={isArabic ? 'تقليل' : 'Decrease'}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={`${toLocalDigits(familyMembers, (language || 'en') as Language)} ${familyMembers === 1 ? (isArabic ? 'فرد' : 'Member') : (isArabic ? 'أفراد' : 'Members')}`}
                      className="w-full py-2.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-black text-slate-900 dark:text-slate-100 rounded-2xl text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFamilyMembers(familyMembers + 1)}
                    className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shrink-0"
                    title={isArabic ? 'زيادة' : 'Increase'}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Input 4: Building Floors / Stories Count */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  {isArabic ? 'عدد الطوابق / الأدوار' : 'Building Floors'} <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2" dir="ltr">
                  <button
                    type="button"
                    onClick={() => setFloors(Math.max(1, floors - 1))}
                    className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shrink-0"
                    title={isArabic ? 'تقليل' : 'Decrease'}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={`${toLocalDigits(floors, (language || 'en') as Language)} ${floors === 1 ? (isArabic ? 'طابق' : 'Floor') : (isArabic ? 'طوابق' : 'Floors')}`}
                      className="w-full py-2.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-black text-slate-900 dark:text-slate-100 rounded-2xl text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFloors(Math.min(10, floors + 1))}
                    className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shrink-0"
                    title={isArabic ? 'زيادة' : 'Increase'}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Submit Action Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
                <span>{isArabic ? 'حفظ وتأكيد البيانات' : 'Save & Create Profile'}</span>
                <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
