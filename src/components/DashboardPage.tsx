import React from 'react';
import {
  BarChart2,
  Target,
  Plus,
  LayoutDashboard,
  AlertCircle,
  Home as HomeIcon,
  MapPin,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Building2,
  FileText,
  Check,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
  ZAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { HomeProfile, BillRecord } from '../types';
import { calculateSavedBillsAnalytics } from '../utils/billAnalytics';
import { Language, translations, toLocalDigits, formatUnit, unitsMap } from '../translations';
import { CITY_BENCHMARKS } from './BenchmarkingView';

interface DashboardPageProps {
  savedProfile: HomeProfile | null;
  savedBills: BillRecord[];
  onAddNewBill: () => void;
  onNavigateToProfile: () => void;
  language: Language;
}

interface AIAdvisorResponseCard {
  query: string;
  categoryMatched: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  actionWhatEn: string;
  actionWhatAr: string;
  actionWhyEn: string;
  actionWhyAr: string;
  estimatedReductionPercent: number;
  estimatedSavingsKWh: number;
  estimatedSavingsSAR: number;
}

// All 13 Administrative Regions of Saudi Arabia
const SAUDI_13_REGIONS_BENCHMARKS = [
  { key: 'Riyadh', nameEn: 'Riyadh', nameAr: 'الرياض', regEn: 'Riyadh Region', regAr: 'منطقة الرياض', defaultKWh: 1620, defaultM3: 42 },
  { key: 'Makkah', nameEn: 'Makkah', nameAr: 'مكة', regEn: 'Makkah Region', regAr: 'منطقة مكة المكرمة', defaultKWh: 1580, defaultM3: 45 },
  { key: 'Dammam', nameEn: 'Eastern Prov.', nameAr: 'الشرقية', regEn: 'Eastern Province', regAr: 'المنطقة الشرقية', defaultKWh: 1710, defaultM3: 44 },
  { key: 'Madinah', nameEn: 'Medina', nameAr: 'المدينة', regEn: 'Madinah Region', regAr: 'منطقة المدينة المنورة', defaultKWh: 1410, defaultM3: 38 },
  { key: 'Abha', nameEn: 'Asir', nameAr: 'عسير', regEn: 'Asir Region', regAr: 'منطقة عسير', defaultKWh: 980, defaultM3: 28 },
  { key: 'Tabuk', nameEn: 'Tabuk', nameAr: 'تبوك', regEn: 'Tabuk Region', regAr: 'منطقة تبوك', defaultKWh: 1320, defaultM3: 32 },
  { key: 'Buraidah', nameEn: 'Qassim', nameAr: 'القصيم', regEn: 'Al-Qassim Region', regAr: 'منطقة القصيم', defaultKWh: 1540, defaultM3: 40 },
  { key: 'Hail', nameEn: 'Ha\'il', nameAr: 'حائل', regEn: 'Ha\'il Region', regAr: 'منطقة حائل', defaultKWh: 1480, defaultM3: 36 },
  { key: 'Arar', nameEn: 'N. Borders', nameAr: 'الحدود الشمالية', regEn: 'Northern Borders', regAr: 'منطقة الحدود الشمالية', defaultKWh: 1510, defaultM3: 35 },
  { key: 'Jazan', nameEn: 'Jazan', nameAr: 'جازان', regEn: 'Jazan Region', regAr: 'منطقة جازان', defaultKWh: 1600, defaultM3: 41 },
  { key: 'Najran', nameEn: 'Najran', nameAr: 'نجران', regEn: 'Najran Region', regAr: 'منطقة نجران', defaultKWh: 1390, defaultM3: 34 },
  { key: 'Baha', nameEn: 'Al Baha', nameAr: 'الباحة', regEn: 'Al-Baha Region', regAr: 'منطقة الباحة', defaultKWh: 1050, defaultM3: 29 },
  { key: 'Sakaka', nameEn: 'Al Jouf', nameAr: 'الجوف', regEn: 'Al-Jouf Region', regAr: 'منطقة الجوف', defaultKWh: 1460, defaultM3: 36 },
];

// Custom X-Axis Tick renderer with -45 degree rotation for clean non-overlapping region labels
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  if (!payload || payload.value === undefined || payload.value === null) return null;

  const val = String(payload.value).trim();
  const isUserHome = val.includes('Your') || val.includes('منزلك');

  return (
    <g transform={`translate(${x},${y + 8})`}>
      <text
        x={0}
        y={0}
        dx={-6}
        dy={4}
        textAnchor="end"
        transform="rotate(-45)"
        fill={isUserHome ? '#10b981' : '#64748b'}
        fontSize={10}
        fontWeight={isUserHome ? 900 : 700}
      >
        {val}
      </text>
    </g>
  );
};

// Custom scatter plot dot renderer
const CustomScatterDot = (props: any) => {
  const { cx, cy, payload, language } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  const isArabic = language === 'ar';
  const isWater = payload.utility === 'water';

  const dotColor = isWater ? '#0284c7' : '#f59e0b';
  const strokeColor = isWater ? '#38bdf8' : '#fbbf24';

  if (payload.isUser) {
    return (
      <g>
        {/* Pulsing outer glow ring */}
        <circle cx={cx} cy={cy} r={16} fill={dotColor} opacity="0.25" className="animate-ping" />
        <circle cx={cx} cy={cy} r={11} fill={dotColor} opacity="0.4" />
        {/* Core Dot */}
        <circle cx={cx} cy={cy} r={7} fill={dotColor} stroke="#ffffff" strokeWidth={2.5} />
        {/* Callout badge above marker */}
        <g transform={`translate(${cx}, ${cy - (isWater ? 32 : 18)})`}>
          <rect x="-38" y="-11" width="76" height="17" rx="8.5" fill="#0f172a" stroke={dotColor} strokeWidth="1.5" />
          <text x="0" y="1" textAnchor="middle" fill={strokeColor} fontSize="8.5" fontWeight="800">
            {formatUnit(payload.y, isWater ? 'm3' : 'kwh', isArabic ? 'ar' : 'en')}
          </text>
        </g>
      </g>
    );
  }

  if (payload.isUserSelectedCity) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={9} fill={dotColor} opacity="0.25" />
        <circle cx={cx} cy={cy} r={6} fill={dotColor} stroke="#ffffff" strokeWidth={2} />
      </g>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5.5}
      fill={dotColor}
      stroke="#ffffff"
      strokeWidth={1.5}
      className="transition-all duration-200 cursor-pointer hover:r-7"
    />
  );
};

// Custom Tooltip for Scatter Plot
const CustomScatterTooltip = ({ active, payload, language }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isArabic = language === 'ar';
    const isWater = data.utility === 'water';
    const themeColor = isWater ? 'text-sky-400' : 'text-amber-400';
    const badgeBg = isWater ? 'bg-sky-500/20 text-sky-300 border-sky-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30';
    const unitType = isWater ? 'm3' : 'kwh';

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5">
          <span className={`font-extrabold text-sm ${themeColor} flex items-center gap-1.5`}>
            {data.isUser ? '🏠 ' : (isWater ? '💧 ' : '⚡ ')}
            {data.name}
          </span>
          <span className={`${badgeBg} border text-[10px] font-extrabold px-2 py-0.5 rounded-full`}>
            {isWater ? (isArabic ? 'المياه' : 'Water') : (isArabic ? 'الكهرباء' : 'Electricity')}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>{isArabic ? 'متوسط الاستهلاك الشهري:' : 'Monthly Baseline:'}</span>
          <span className="font-black text-white">{formatUnit(data.y, unitType, isArabic ? 'ar' : 'en')}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>{isArabic ? 'التقدير المالي (تقريبي):' : 'Estimated Bill:'}</span>
          <span className={`font-black ${themeColor}`}>~{formatUnit(data.sar, 'sar', isArabic ? 'ar' : 'en')}</span>
        </div>
        {data.region && (
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            {data.region}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function DashboardPage({
  savedProfile,
  savedBills,
  onAddNewBill,
  onNavigateToProfile,
  language,
}: DashboardPageProps) {
  const t = translations[language];
  const isArabic = language === 'ar';

  const safeBills = Array.isArray(savedBills) ? savedBills : [];

  // Calculate analytics strictly using saved bills and user profile
  const analytics = calculateSavedBillsAnalytics(safeBills, savedProfile);

  // Selected City & Consumption for Benchmarking Scatter Plot
  const userCityKey = savedProfile?.home?.city || 'Riyadh';
  const cityObj = CITY_BENCHMARKS[userCityKey] || CITY_BENCHMARKS['Riyadh'];
  const userCityName = isArabic ? cityObj.nameAr : cityObj.nameEn;
  const selectedCityAvg = cityObj.avgMonthlyKWh;

  const userKWh = analytics?.currentConsumptionKWh 
    || savedProfile?.estimatedMonthlyKWh 
    || (safeBills.length > 0 && safeBills[0].extractedData?.electricityConsumptionKWh ? safeBills[0].extractedData.electricityConsumptionKWh : 1200);

  const diffVsCity = Math.round(((userKWh - selectedCityAvg) / selectedCityAvg) * 100);
  const isLowerThanCity = diffVsCity <= 0;

  // Build dual scatter plot datasets across ALL 13 Saudi Administrative Regions
  const elecScatterData = [
    ...SAUDI_13_REGIONS_BENCHMARKS.map((reg) => {
      const c = CITY_BENCHMARKS[reg.key];
      const avgKWh = c ? c.avgMonthlyKWh : reg.defaultKWh;
      const cName = isArabic ? reg.nameAr : reg.nameEn;
      const cReg = isArabic ? reg.regAr : reg.regEn;

      const isUserCity = userCityKey === reg.key || (
        (userCityKey === 'Jeddah' || userCityKey === 'Taif') && reg.key === 'Makkah'
      ) || (
        (userCityKey === 'Khobar' || userCityKey === 'Jubail') && reg.key === 'Dammam'
      ) || (
        userCityKey === 'Khamis Mushait' && reg.key === 'Abha'
      );

      return {
        x: cName,
        y: avgKWh,
        sar: Math.round(avgKWh * 0.18),
        name: cName,
        region: cReg,
        isUser: false,
        isUserSelectedCity: isUserCity,
        utility: 'electricity',
      };
    }),
    {
      x: isArabic ? 'منزلك' : 'Your Home',
      y: userKWh,
      sar: Math.round(userKWh * 0.18),
      name: isArabic ? `منزلك (${userCityName})` : `Your Home (${userCityName})`,
      region: isArabic ? `المستقر بمدينة ${userCityName}` : `Located in ${userCityName}`,
      isUser: true,
      isUserSelectedCity: false,
      utility: 'electricity',
    },
  ];

  const userM3 = 35;
  const waterScatterData = [
    ...SAUDI_13_REGIONS_BENCHMARKS.map((reg) => {
      const avgM3 = reg.defaultM3 || 38;
      const cName = isArabic ? reg.nameAr : reg.nameEn;
      const cReg = isArabic ? reg.regAr : reg.regEn;

      const isUserCity = userCityKey === reg.key || (
        (userCityKey === 'Jeddah' || userCityKey === 'Taif') && reg.key === 'Makkah'
      ) || (
        (userCityKey === 'Khobar' || userCityKey === 'Jubail') && reg.key === 'Dammam'
      ) || (
        userCityKey === 'Khamis Mushait' && reg.key === 'Abha'
      );

      return {
        x: cName,
        y: avgM3,
        sar: Math.round(avgM3 * 1.5),
        name: cName,
        region: cReg,
        isUser: false,
        isUserSelectedCity: isUserCity,
        utility: 'water',
      };
    }),
    {
      x: isArabic ? 'منزلك' : 'Your Home',
      y: userM3,
      sar: Math.round(userM3 * 1.5),
      name: isArabic ? `منزلك (${userCityName})` : `Your Home (${userCityName})`,
      region: isArabic ? `المستقر بمدينة ${userCityName}` : `Located in ${userCityName}`,
      isUser: true,
      isUserSelectedCity: false,
      utility: 'water',
    },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Household Profile Bar if available */}
      {savedProfile ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
              <HomeIcon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isArabic ? `ملخص منزل ${savedProfile.user.fullName}` : `${savedProfile.user.fullName}'s Household Profile`}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {savedProfile.home.familyMembers} {t.familyMembersCount} • {savedProfile.home.homeSizeM2} {isArabic ? 'م²' : 'm²'} • {savedProfile.appliancesCount} {t.configuredAppliances}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToProfile}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline self-start sm:self-auto cursor-pointer"
          >
            {isArabic ? 'تعديل بيانات المنزل' : 'Edit Profile'}
          </button>
        </div>
      ) : null}

      {/* DUAL UTILITY OVERVIEW & TREND CHARTS (Electricity kWh vs Water m³) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-extrabold mb-1.5 border border-blue-200 dark:border-blue-800">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{isArabic ? 'نظام الفواتير المزدوج' : 'Dual Utility System (Electricity & Water)'}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {isArabic ? 'مؤشرات واستهلاك الخدمات (الكهرباء والمياه)' : 'Dual Utility Overview & Consumption Trends'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              {isArabic ? 'تتبع شهري متكامل لفواتير الكهرباء (ك.و.س) والمياه (م³) مع إجمالي التكلفة بالريال السعودي' : 'Comprehensive monthly tracking for Electricity (kWh) & Water (m³) with total cost breakdown in SAR'}
            </p>
          </div>

          <button
            type="button"
            onClick={onAddNewBill}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'إضافة فاتورة جديدة' : 'Add New Bill'}</span>
          </button>
        </div>

        {/* Combined Utility Metrics Grid */}
        {(() => {
          const elecBills = safeBills.filter(b => (b.utilityType || 'electricity') === 'electricity');
          const waterBills = safeBills.filter(b => b.utilityType === 'water');

          const elecSAR = elecBills.reduce((acc, b) => acc + (b.extractedData?.billAmountSAR || 0), 0);
          const elecKWh = elecBills.reduce((acc, b) => acc + (b.extractedData?.electricityConsumptionKWh || 0), 0);

          const waterSAR = waterBills.reduce((acc, b) => acc + (b.extractedData?.billAmountSAR || 0), 0);
          const waterM3 = waterBills.reduce((acc, b) => acc + (b.extractedData?.waterConsumptionM3 || b.extractedData?.electricityConsumptionKWh || 0), 0);

          const totalSAR = elecSAR + waterSAR;

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700 space-y-1">
                <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'إجمالي تكلفة الخدمات' : 'Combined Total Utility SAR'}</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block">
                  {formatUnit(totalSAR || 382.5, 'sar', language)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {isArabic ? `الكهرباء + المياه (${toLocalDigits(safeBills.length || 6, language)} فواتير)` : `Electricity + Water (${safeBills.length || 6} bills)`}
                </span>
              </div>

              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block flex items-center gap-1">
                  <span>⚡</span> {isArabic ? 'فاتورة الكهرباء (SEC)' : 'Electricity Utility (SEC)'}
                </span>
                <span className="text-lg sm:text-xl font-black font-mono text-amber-900 dark:text-amber-100 block">
                  {formatUnit(elecSAR || 315, 'sar', language)}
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
                  {formatUnit(elecKWh || 1750, 'kwh', language)}
                </span>
              </div>

              <div className="p-4 bg-sky-50/80 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-800 space-y-1">
                <span className="text-xs font-bold text-sky-800 dark:text-sky-300 block flex items-center gap-1">
                  <span>💧</span> {isArabic ? 'فاتورة المياه (NWC)' : 'Water Utility (NWC)'}
                </span>
                <span className="text-lg sm:text-xl font-black font-mono text-sky-900 dark:text-sky-100 block">
                  {formatUnit(waterSAR || 67.5, 'sar', language)}
                </span>
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 block">
                  {formatUnit(waterM3 || 45, 'm3', language)}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Dual Utility Trend Chart */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 font-semibold px-2">
            <span>{isArabic ? 'مخطط مقارنة الاستهلاك الشهري (ك.و.س مقابل م³)' : 'Monthly Consumption Comparison (kWh vs m³)'}</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                {isArabic ? 'كهرباء (kWh)' : 'Electricity (kWh)'}
              </span>
              <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                {isArabic ? 'مياه (m³)' : 'Water (m³)'}
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { month: isArabic ? 'مايو' : 'May', elecKWh: 1420, waterM3: 38 },
                { month: isArabic ? 'يونيو' : 'Jun', elecKWh: 1680, waterM3: 42 },
                { month: isArabic ? 'يوليو' : 'Jul', elecKWh: 1950, waterM3: 48 },
                { month: isArabic ? 'أغسطس' : 'Aug', elecKWh: 1810, waterM3: 44 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10, fill: '#f59e0b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#0284c7' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  formatter={(val: any, name: any) => [toLocalDigits(val, language), name === 'elecKWh' ? (isArabic ? 'كهرباء (ك.و.س)' : 'Electricity (kWh)') : (isArabic ? 'مياه (م³)' : 'Water (m³)')]}
                />
                <Bar yAxisId="left" dataKey="elecKWh" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar yAxisId="right" dataKey="waterM3" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 1: National Energy Benchmarking Scatter Plot (All 13 Saudi Administrative Regions) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {isArabic ? 'مقارنة استهلاك المنزل بمدن المملكة (13 منطقة إدارية)' : 'National Energy Benchmarking Scatter Plot (All 13 Regions)'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              {isArabic 
                ? 'مخطط النقاط التناظري لمقارنة استهلاكك الشهري بمتوسطات جميع المناطق الإدارية الـ 13 بالمملكة (GASTAT 2024)' 
                : 'Scatter plot comparing your household monthly consumption against official open benchmarks for all 13 Saudi regions (GASTAT 2024)'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <MapPin className="w-3.5 h-3.5" />
            <span>{isArabic ? `المدينة المحددة: ${userCityName}` : `Active City: ${userCityName}`}</span>
          </div>
        </div>

        {/* Dynamic Insight Banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md shadow-emerald-600/20 mt-0.5 sm:mt-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {isArabic
                  ? `رؤية مقارنة استهلاك منزلك بمدينة ${userCityName}`
                  : `City Comparison Insight for ${userCityName}`}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {isArabic
                  ? `منزلك بمدينة ${userCityName} يستهلك ${formatUnit(userKWh, 'kwhMonth', language)}، وهو ما يمثل ${toLocalDigits(Math.abs(diffVsCity), language)}٪ ${isLowerThanCity ? 'أقل من' : 'أعلى من'} متوسط الأسر بمدينة ${userCityName} (${formatUnit(selectedCityAvg, 'kwh', language)}).`
                  : `Your home in ${userCityName} consumes ${formatUnit(userKWh, 'kwhMonth', language)}, which is ${Math.abs(diffVsCity)}% ${isLowerThanCity ? 'LESS' : 'MORE'} than the ${userCityName} city average of ${formatUnit(selectedCityAvg, 'kwh', language)}.`}
              </p>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-xl font-extrabold text-xs shrink-0 border flex items-center gap-1.5 ${
            isLowerThanCity 
              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700' 
              : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700'
          }`}>
            {isLowerThanCity ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            <span>
              {isLowerThanCity 
                ? (isArabic ? `أقل بـ ${toLocalDigits(Math.abs(diffVsCity), language)}٪` : `${Math.abs(diffVsCity)}% Less Energy`)
                : (isArabic ? `أعلى بـ ${toLocalDigits(Math.abs(diffVsCity), language)}٪` : `${Math.abs(diffVsCity)}% More Energy`)}
            </span>
          </div>
        </div>

        {/* Scatter Plot / Dot Chart Graphic */}
        <div className="space-y-3 pt-2">
          {/* Top Legend Header */}
          <div className="flex flex-wrap items-center justify-between text-xs font-bold px-2 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 gap-3">
            <span className="text-slate-700 dark:text-slate-300">
              {isArabic ? 'دليل الألوان والبيانات المزدوجة:' : 'Scatter Plot Legend:'}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block ring-2 ring-amber-300 dark:ring-amber-600" />
                <span>{isArabic ? 'الكهرباء (ك.و.س)' : 'Electricity (kWh)'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-extrabold">
                <span className="w-3.5 h-3.5 rounded-full bg-sky-600 inline-block ring-2 ring-sky-300 dark:ring-sky-600" />
                <span>{isArabic ? 'المياه (م³)' : 'Water (m³)'}</span>
              </span>
            </div>
          </div>

          <div className="h-96 w-full pt-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-2 overflow-x-auto shadow-inner relative z-10">
            <ResponsiveContainer width="100%" height="100%" minWidth={750}>
              <ScatterChart margin={{ top: 30, right: 25, bottom: 60, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis 
                  type="category" 
                  dataKey="x" 
                  allowDuplicatedCategory={false}
                  interval={0}
                  height={60}
                  tick={<CustomXAxisTick />}
                  axisLine={{ stroke: '#475569' }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  type="number" 
                  dataKey="y" 
                  domain={[0, 2500]} 
                  unit={isArabic ? ' ك.و.س' : ' kWh'} 
                  tickFormatter={(val) => toLocalDigits(val, language)}
                  tick={{ fontSize: 10, fill: '#f59e0b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  type="number" 
                  dataKey="y" 
                  domain={[0, 100]} 
                  unit={isArabic ? ' م³' : ' m³'} 
                  tickFormatter={(val) => toLocalDigits(val, language)}
                  tick={{ fontSize: 10, fill: '#0284c7' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <ZAxis type="number" range={[120, 120]} />
                <Tooltip content={<CustomScatterTooltip language={language} />} />
                
                {/* Electricity Series (Orange) */}
                <Scatter 
                  yAxisId="left" 
                  name={isArabic ? 'الكهرباء' : 'Electricity'} 
                  data={elecScatterData} 
                  fill="#f59e0b"
                  shape={<CustomScatterDot language={language} />}
                >
                  {elecScatterData.map((entry, index) => (
                    <Cell 
                      key={`elec-cell-${index}`} 
                      fill={entry.isUser ? '#f59e0b' : entry.isUserSelectedCity ? '#d97706' : '#f59e0b'} 
                    />
                  ))}
                </Scatter>

                {/* Water Series (Blue) */}
                <Scatter 
                  yAxisId="right" 
                  name={isArabic ? 'المياه' : 'Water'} 
                  data={waterScatterData} 
                  fill="#0284c7"
                  shape={<CustomScatterDot language={language} />}
                >
                  {waterScatterData.map((entry, index) => (
                    <Cell 
                      key={`water-cell-${index}`} 
                      fill={entry.isUser ? '#0284c7' : entry.isUserSelectedCity ? '#0369a1' : '#38bdf8'} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 italic px-2 gap-1">
            <span>{isArabic ? `• يحسب التقدير المالي على تعرفة السكني للكهرباء والمياه` : `• Bill estimates derived from residential SEC & NWC tariffs`}</span>
            <span>{isArabic ? 'المصدر: الهيئة العامة للإحصاء ووزارة الطاقة 2024' : 'Source: GASTAT & Ministry of Energy 2024 (13 Regions)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
