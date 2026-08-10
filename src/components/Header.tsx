import React from 'react';
import { Leaf, ShieldCheck, ArrowRight, Play, Zap, Sparkles, TrendingDown, Layers, FileText } from 'lucide-react';
import { Language, translations } from '../translations';

interface HeaderProps {
  language?: Language;
  onGetStarted?: () => void;
  onViewDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language = 'en',
  onGetStarted,
  onViewDemo,
}) => {
  const t = translations[language];
  const isArabic = language === 'ar';

  return (
    <section className="relative text-center pt-6 pb-8 px-4 sm:px-6 max-w-4xl mx-auto overflow-hidden">
      {/* Background Decorative Mint Glow Circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-100/40 blur-3xl rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-12 right-10 w-64 h-64 bg-teal-100/30 blur-2xl rounded-full -z-10 pointer-events-none" />

      {/* 1. Pill Badge Tagline with Pulsing Green Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-extrabold tracking-wide mb-6 shadow-2xs hover:bg-emerald-100/60 transition-colors">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
        </span>
        <span className="font-mono tracking-tight">{t.heroBadgeTagline}</span>
      </div>

      {/* 2. Prominent Main Heading (H1) */}
      <h1 id="app-title" className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
        {isArabic ? (
          <>
            افهم استهلاك الطاقة، <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">واتخذ قرارات أذكى.</span>
          </>
        ) : (
          <>
            The smart workspace for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">home energy optimization</span>
          </>
        )}
      </h1>

      {/* 3. Subtitle with clear supporting subtext */}
      <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium mt-4 sm:mt-5">
        {t.heroSubtitleLong}
      </p>

      {/* 4. Single Prominent Call-To-Action (CTA) Button */}
      <div className="flex items-center justify-center mt-8">
        {/* Primary CTA: Solid EcoBill Emerald Green Pill Button */}
        <button
          type="button"
          onClick={() => {
            if (onGetStarted) {
              onGetStarted();
            }
          }}
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <span>{t.btnGetStarted}</span>
          <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Trust & Security Badge */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{t.secureData}</span>
      </div>

      {/* 5. Modern Hero Visual Container Showcase */}
      <div className="mt-10 max-w-3xl mx-auto p-4 sm:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-none text-left">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                {isArabic ? 'منصة إيكوبيل الذكية للطاقة' : 'EcoBill Smart Energy Workspace'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                {isArabic ? 'محاكاة وإدارة متكاملة لاستهلاك المنزل' : 'Integrated Home Energy Tracking & 3D Twin'}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold">
            <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400 fill-current" />
            {isArabic ? 'توفير حتى 30%' : 'Save up to 30%'}
          </span>
        </div>

        {/* Feature Pills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                {isArabic ? 'تتبع فواتير OCR' : 'Instant OCR Scanner'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isArabic ? 'قراءة تلقائية لفاتورة الكهرباء' : 'Auto bill extraction'}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                {isArabic ? 'محاكاة 3D تفاعلية' : '3D Digital Twin'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isArabic ? 'اختبار السيناريوهات مباشرة' : 'Live what-if studio'}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                {isArabic ? 'توصيات التوفير' : 'AI Optimization'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isArabic ? 'تخفيض التكلفة الشهرية' : 'Targeted bill reduction'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
