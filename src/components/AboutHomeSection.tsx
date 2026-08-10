import React, { useState } from 'react';
import { Home, Users, Maximize2, Info, Plus, Minus, MapPin, Layers, Sparkles } from 'lucide-react';
import { Language, translations, toLocalDigits } from '../translations';

export const SAUDI_CITIES = [
  { id: 'Riyadh', nameEn: 'Riyadh', nameAr: 'الرياض' },
  { id: 'Jeddah', nameEn: 'Jeddah', nameAr: 'جدة' },
  { id: 'Makkah', nameEn: 'Makkah', nameAr: 'مكة المكرمة' },
  { id: 'Madinah', nameEn: 'Madinah', nameAr: 'المدينة المنورة' },
  { id: 'Dammam', nameEn: 'Dammam', nameAr: 'الدمام' },
  { id: 'Khobar', nameEn: 'Khobar', nameAr: 'الخبر' },
  { id: 'Tabuk', nameEn: 'Tabuk', nameAr: 'تبوك' },
  { id: 'Abha', nameEn: 'Abha', nameAr: 'أبها' },
  { id: 'Taif', nameEn: 'Taif', nameAr: 'الطائف' },
  { id: 'Jubail', nameEn: 'Jubail', nameAr: 'الجبيل' },
  { id: 'Buraidah', nameEn: 'Buraidah', nameAr: 'بريدة' },
  { id: 'Khamis Mushait', nameEn: 'Khamis Mushait', nameAr: 'خميس مشيط' },
  { id: 'Hail', nameEn: 'Ha\'il', nameAr: 'حائل' },
  { id: 'Arar', nameEn: 'Northern Borders (Arar)', nameAr: 'الحدود الشمالية (عرعر)' },
  { id: 'Jazan', nameEn: 'Jazan', nameAr: 'جازان' },
  { id: 'Najran', nameEn: 'Najran', nameAr: 'نجران' },
  { id: 'Baha', nameEn: 'Al-Baha', nameAr: 'الباحة' },
  { id: 'Sakaka', nameEn: 'Al-Jouf (Sakaka)', nameAr: 'الجوف (سكاكا)' },
];

interface AboutHomeSectionProps {
  familyMembers: number;
  setFamilyMembers: (val: number) => void;
  homeSizeM2: number;
  setHomeSizeM2: (val: number) => void;
  city: string;
  setCity: (val: string) => void;
  floors?: number;
  setFloors?: (val: number) => void;
  onOpenWizard?: () => void;
  errors: { familyMembers?: string; homeSizeM2?: string };
  language: Language;
}

export const AboutHomeSection: React.FC<AboutHomeSectionProps> = ({
  familyMembers,
  setFamilyMembers,
  homeSizeM2,
  setHomeSizeM2,
  city,
  setCity,
  floors: propFloors,
  setFloors: propSetFloors,
  onOpenWizard,
  errors,
  language,
}) => {
  const t = translations[language];

  const [localFloors, setLocalFloors] = useState<number>(1);
  const floors = propFloors !== undefined ? propFloors : localFloors;
  const setFloors = propSetFloors || setLocalFloors;

  return (
    <div id="section-about-home" className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Home className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {t.aboutHomeTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.aboutHomeSubtitle}
            </p>
          </div>
        </div>

        {onOpenWizard && (
          <button
            type="button"
            onClick={onOpenWizard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'ar' ? 'معالج الإعداد السريع' : 'Launch Setup Wizard'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* City Selection Dropdown */}
        <div>
          <label htmlFor="city" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {(t as Record<string, string>).cityLabel || 'City / Residence'} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400`}>
              <MapPin className="w-4 h-4" />
            </div>
            <select
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-200 rounded-xl text-slate-800 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-4 transition-all cursor-pointer`}
            >
              {SAUDI_CITIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {language === 'ar' ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {(t as Record<string, string>).cityNote || 'Used for regional energy benchmarking'}
          </p>
        </div>

        {/* Family Members */}
        <div>
          <label htmlFor="familyMembers" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {t.familyMembersLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2" dir="ltr">
            <button
              type="button"
              onClick={() => setFamilyMembers(Math.max(1, familyMembers - 1))}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
              title={language === 'ar' ? 'تقليل أفراد الأسرة' : 'Decrease family members'}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                id="familyMembers"
                name="familyMembers"
                readOnly
                value={`${toLocalDigits(familyMembers, language)} ${familyMembers === 1 ? (language === 'ar' ? 'فرد' : 'Member') : (language === 'ar' ? 'أفراد' : 'Members')}`}
                className="w-full py-2.5 px-3 bg-slate-50/50 dark:bg-slate-800/50 border text-center font-bold text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setFamilyMembers(familyMembers + 1)}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
              title={language === 'ar' ? 'زيادة أفراد الأسرة' : 'Increase family members'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {errors.familyMembers ? (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {errors.familyMembers}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {t.familyMembersNote}
            </p>
          )}
        </div>

        {/* Home Size in m² */}
        <div>
          <label htmlFor="homeSizeM2" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {t.homeSizeLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2" dir="ltr">
            <button
              type="button"
              onClick={() => setHomeSizeM2(Math.max(10, homeSizeM2 - 10))}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
              title={language === 'ar' ? 'تقليل المساحة' : 'Decrease area'}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                id="homeSizeM2"
                name="homeSizeM2"
                value={homeSizeM2 ? `${toLocalDigits(homeSizeM2, language)} ${language === 'ar' ? 'م²' : 'm²'}` : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d٠١٢٣٤٥٦٧٨٩]/g, '');
                  const western = raw.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                  const val = parseInt(western, 10);
                  setHomeSizeM2(isNaN(val) ? 0 : Math.max(0, val));
                }}
                placeholder={t.homeSizePlaceholder}
                className={`w-full py-2.5 px-3 bg-slate-50/50 dark:bg-slate-800/50 border text-center font-bold text-slate-800 dark:text-slate-100 ${
                  errors.homeSizeM2 ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-emerald-500/30'
                } rounded-xl text-xs sm:text-sm focus:outline-none font-mono`}
              />
            </div>
            <button
              type="button"
              onClick={() => setHomeSizeM2(Math.min(1500, homeSizeM2 + 10))}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
              title={language === 'ar' ? 'زيادة المساحة' : 'Increase area'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {errors.homeSizeM2 ? (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {errors.homeSizeM2}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {t.homeSizeNote}
            </p>
          )}
        </div>

        {/* Floor Selection Numeric Stepper (+ / -) */}
        <div>
          <label htmlFor="floorsStepper" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {(t as Record<string, string>).floorsLabel || (language === 'ar' ? 'عدد الطوابق / الأدوار' : 'Number of Floors')} <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2" dir="ltr">
            <button
              type="button"
              onClick={() => setFloors(Math.max(1, floors - 1))}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
              title={language === 'ar' ? 'تقليل عدد الطوابق' : 'Decrease floors'}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                id="floorsStepper"
                name="floorsStepper"
                readOnly
                value={`${toLocalDigits(floors, language)} ${floors === 1 ? ((t as Record<string, string>).floorSingle || (language === 'ar' ? 'طابق' : 'Floor')) : ((t as Record<string, string>).floorsPlural || (language === 'ar' ? 'طوابق' : 'Floors'))}`}
                className="w-full py-2.5 px-3 bg-slate-50/50 dark:bg-slate-800/50 border text-center font-bold text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setFloors(Math.min(10, floors + 1))}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
              title={language === 'ar' ? 'زيادة عدد الطوابق' : 'Increase floors'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {(t as Record<string, string>).floorsNote || (language === 'ar' ? 'عدد الأدوار أو الطوابق المبنية في عقارك السكني' : 'Number of floors or levels in your home')}
          </p>
        </div>
      </div>
    </div>
  );
};
