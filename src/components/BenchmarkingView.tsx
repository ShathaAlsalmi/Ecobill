import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Award, 
  Zap, 
  Droplet,
  Droplets,
  Building2, 
  ThermometerSnowflake, 
  TrendingDown, 
  TrendingUp, 
  MapPin, 
  ShieldCheck,
  Sparkles,
  Target
} from 'lucide-react';
import { BillRecord, HomeProfile } from '../types';
import { Language, toLocalDigits, formatUnit, unitsMap } from '../translations';

export interface CityBenchmarkInfo {
  id: string;
  nameEn: string;
  nameAr: string;
  regionEn: string;
  regionAr: string;
  avgMonthlyKWh: number;
  avgMonthlyM3: number;
}

export const CITY_BENCHMARKS: Record<string, CityBenchmarkInfo> = {
  Riyadh: {
    id: 'Riyadh',
    nameEn: 'Riyadh',
    nameAr: 'الرياض',
    regionEn: 'Riyadh Region',
    regionAr: 'منطقة الرياض',
    avgMonthlyKWh: 1620,
    avgMonthlyM3: 35,
  },
  Jeddah: {
    id: 'Jeddah',
    nameEn: 'Jeddah',
    nameAr: 'جدة',
    regionEn: 'Makkah Region',
    regionAr: 'منطقة مكة المكرمة',
    avgMonthlyKWh: 1580,
    avgMonthlyM3: 38,
  },
  Makkah: {
    id: 'Makkah',
    nameEn: 'Makkah',
    nameAr: 'مكة المكرمة',
    regionEn: 'Makkah Region',
    regionAr: 'منطقة مكة المكرمة',
    avgMonthlyKWh: 1580,
    avgMonthlyM3: 36,
  },
  Madinah: {
    id: 'Madinah',
    nameEn: 'Madinah',
    nameAr: 'المدينة المنورة',
    regionEn: 'Medina Region',
    regionAr: 'منطقة المدينة المنورة',
    avgMonthlyKWh: 1410,
    avgMonthlyM3: 33,
  },
  Dammam: {
    id: 'Dammam',
    nameEn: 'Dammam',
    nameAr: 'الدمام',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    avgMonthlyKWh: 1710,
    avgMonthlyM3: 37,
  },
  Khobar: {
    id: 'Khobar',
    nameEn: 'Khobar',
    nameAr: 'الخبر',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    avgMonthlyKWh: 1710,
    avgMonthlyM3: 37,
  },
  Tabuk: {
    id: 'Tabuk',
    nameEn: 'Tabuk',
    nameAr: 'تبوك',
    regionEn: 'Tabuk Region',
    regionAr: 'منطقة تبوك',
    avgMonthlyKWh: 1320,
    avgMonthlyM3: 30,
  },
  Abha: {
    id: 'Abha',
    nameEn: 'Abha',
    nameAr: 'أبها',
    regionEn: 'Asir Region',
    regionAr: 'منطقة عسير',
    avgMonthlyKWh: 980,
    avgMonthlyM3: 25,
  },
  Taif: {
    id: 'Taif',
    nameEn: 'Taif',
    nameAr: 'الطائف',
    regionEn: 'Makkah Region',
    regionAr: 'منطقة مكة المكرمة',
    avgMonthlyKWh: 1290,
    avgMonthlyM3: 29,
  },
  Jubail: {
    id: 'Jubail',
    nameEn: 'Jubail',
    nameAr: 'الجبيل',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    avgMonthlyKWh: 1710,
    avgMonthlyM3: 36,
  },
  Buraidah: {
    id: 'Buraidah',
    nameEn: 'Buraidah',
    nameAr: 'بريدة',
    regionEn: 'Al-Qassim Region',
    regionAr: 'منطقة القصيم',
    avgMonthlyKWh: 1540,
    avgMonthlyM3: 34,
  },
  'Khamis Mushait': {
    id: 'Khamis Mushait',
    nameEn: 'Khamis Mushait',
    nameAr: 'خميس مشيط',
    regionEn: 'Asir Region',
    regionAr: 'منطقة عسير',
    avgMonthlyKWh: 980,
    avgMonthlyM3: 26,
  },
  Hail: {
    id: 'Hail',
    nameEn: 'Ha\'il',
    nameAr: 'حائل',
    regionEn: 'Ha\'il Region',
    regionAr: 'منطقة حائل',
    avgMonthlyKWh: 1480,
    avgMonthlyM3: 31,
  },
  Arar: {
    id: 'Arar',
    nameEn: 'Northern Borders (Arar)',
    nameAr: 'الحدود الشمالية (عرعر)',
    regionEn: 'Northern Borders Region',
    regionAr: 'منطقة الحدود الشمالية',
    avgMonthlyKWh: 1510,
    avgMonthlyM3: 32,
  },
  Jazan: {
    id: 'Jazan',
    nameEn: 'Jazan',
    nameAr: 'جازان',
    regionEn: 'Jazan Region',
    regionAr: 'منطقة جازان',
    avgMonthlyKWh: 1600,
    avgMonthlyM3: 34,
  },
  Najran: {
    id: 'Najran',
    nameEn: 'Najran',
    nameAr: 'نجران',
    regionEn: 'Najran Region',
    regionAr: 'منطقة نجران',
    avgMonthlyKWh: 1390,
    avgMonthlyM3: 28,
  },
  Baha: {
    id: 'Baha',
    nameEn: 'Al-Baha',
    nameAr: 'الباحة',
    regionEn: 'Al-Baha Region',
    regionAr: 'منطقة الباحة',
    avgMonthlyKWh: 1050,
    avgMonthlyM3: 26,
  },
  Sakaka: {
    id: 'Sakaka',
    nameEn: 'Al-Jouf (Sakaka)',
    nameAr: 'الجوف (سكاكا)',
    regionEn: 'Al-Jouf Region',
    regionAr: 'منطقة الجوف',
    avgMonthlyKWh: 1460,
    avgMonthlyM3: 31,
  },
};

export const SAUDI_BENCHMARK_DATA = {
  metadata: {
    sourcesEn: [
      "GASTAT (General Authority for Statistics) - Environment, Water & Energy Survey",
      "Ministry of Energy & NWC (National Water Company) Sales 2024",
      "SEC & NWC Residential Tariff Tiers"
    ],
    sourcesAr: [
      "الهيئة العامة للإحصاء (GASTAT) - مسح البيئة والمياه والطاقة",
      "وزارة الطاقة والشركة الوطنية للمياه (NWC) - إحصائيات 2024",
      "الشركة السعودية للكهرباء والشركة الوطنية للمياه - شرائح التعرفة السكنية"
    ]
  },
  electricity: {
    nationalBaseline: 1433,
    acConsumptionShare: 73,
    ecoHeroTarget: 900,
    secTier1LimitKWh: 6000,
    secTier1Rate: 0.18,
    efficiencyTiers: {
      ecoHero: {
        maxVal: 900,
        labelEn: "Excellent (Eco Hero)",
        labelAr: "ممتاز (بطل الكفاءة)",
        descEn: "Inverter ACs, thermal insulation, LED lights",
        descAr: "مكيفات إنفرتر، عزل حراري للمبنى، وإضاءة LED"
      },
      average: {
        maxVal: 1800,
        labelEn: "Average (Standard)",
        labelAr: "متوسط (اعتيادي)",
        descEn: "Standard household consumption",
        descAr: "استهلاك أسر سكنية اعتيادي"
      },
      highWaste: {
        maxVal: 9999,
        labelEn: "High Energy Waste",
        labelAr: "هدر مرتفع بالطاقة",
        descEn: "ACs set at 20°C, lack of thermal insulation",
        descAr: "ضبط التكييف عند 20°م، وغياب العزل الحراري"
      }
    }
  },
  water: {
    nationalBaseline: 32,
    waterImpactShare: 65,
    ecoHeroTarget: 20,
    nwcTier1LimitM3: 15,
    nwcTier1Rate: 0.15,
    efficiencyTiers: {
      ecoHero: {
        maxVal: 20,
        labelEn: "Excellent (Eco Hero)",
        labelAr: "ممتاز (بطل الترشيد)",
        descEn: "Aerators installed, smart irrigation, water-efficient fixtures",
        descAr: "مرشدات مياه مثبتة، ري ذكي للحدائق، وأدوات صحية موفرة"
      },
      average: {
        maxVal: 40,
        labelEn: "Average (Standard)",
        labelAr: "متوسط (اعتيادي)",
        descEn: "Standard household water consumption",
        descAr: "استهلاك مياه سكني اعتيادي"
      },
      highWaste: {
        maxVal: 9999,
        labelEn: "High Water Waste",
        labelAr: "هدر مرتفع بالمياه",
        descEn: "Unrepaired leaks, continuous lawn hose spraying",
        descAr: "تسريبات غير معالجة، ري عشوائي، وتجاوز للشرائح الدنيا"
      }
    }
  }
};

interface BenchmarkingViewProps {
  savedProfile: HomeProfile | null;
  savedBills: BillRecord[];
  language?: Language;
}

export const BenchmarkingView: React.FC<BenchmarkingViewProps> = ({
  savedProfile,
  savedBills,
  language = 'en'
}) => {
  const lang: Language = language === 'ar' ? 'ar' : 'en';
  const isArabic = lang === 'ar';

  // Utility Switcher State: Electricity vs. Water
  const [activeUtility, setActiveUtility] = useState<'electricity' | 'water'>('electricity');

  // Electricity Bill/Profile Extracted Baseline
  const latestElecBillKWh = savedBills.length > 0 && savedBills.find(b => b.extractedData?.electricityConsumptionKWh)?.extractedData?.electricityConsumptionKWh;
  const initialElecKWh = latestElecBillKWh || savedProfile?.estimatedMonthlyKWh || 1280;
  const [userKWh, setUserKWh] = useState<number>(initialElecKWh);

  // Water Bill Baseline
  const latestWaterBillM3 = savedBills.length > 0 && savedBills.find(b => b.extractedData?.waterConsumptionM3)?.extractedData?.waterConsumptionM3;
  const initialWaterM3 = latestWaterBillM3 || 28;
  const [userM3, setUserM3] = useState<number>(initialWaterM3);

  // Selected city from profile or default to Riyadh
  const initialCityKey = savedProfile?.home?.city || 'Riyadh';
  const [selectedCityKey, setSelectedCityKey] = useState<string>(initialCityKey);

  useEffect(() => {
    if (savedProfile?.home?.city && CITY_BENCHMARKS[savedProfile.home.city]) {
      setSelectedCityKey(savedProfile.home.city);
    }
  }, [savedProfile?.home?.city]);

  const currentCityInfo = CITY_BENCHMARKS[selectedCityKey] || CITY_BENCHMARKS['Riyadh'];
  const cityName = isArabic ? currentCityInfo.nameAr : currentCityInfo.nameEn;
  const regionName = isArabic ? currentCityInfo.regionAr : currentCityInfo.regionEn;

  // Compute Electricity Efficiency Score (0 to 100)
  const calculateElecScore = (kwh: number): number => {
    if (kwh <= 700) return 100;
    if (kwh <= 1433) {
      const ratio = (kwh - 700) / (1433 - 700);
      return Math.round(100 - ratio * 25);
    }
    if (kwh <= 1800) {
      const ratio = (kwh - 1433) / (1800 - 1433);
      return Math.round(75 - ratio * 23);
    }
    const overflowRatio = Math.min(1, (kwh - 1800) / 2200);
    return Math.max(12, Math.round(50 - overflowRatio * 38));
  };

  // Compute Water Efficiency Score (0 to 100)
  const calculateWaterScore = (m3: number): number => {
    if (m3 <= 15) return 100;
    if (m3 <= 32) {
      const ratio = (m3 - 15) / (32 - 15);
      return Math.round(100 - ratio * 25);
    }
    if (m3 <= 45) {
      const ratio = (m3 - 32) / (45 - 32);
      return Math.round(75 - ratio * 25);
    }
    const overflowRatio = Math.min(1, (m3 - 45) / 45);
    return Math.max(12, Math.round(50 - overflowRatio * 38));
  };

  // Active Utility Derived Variables
  const isElectricity = activeUtility === 'electricity';
  const userVal = isElectricity ? userKWh : userM3;
  const cityAvgVal = isElectricity ? currentCityInfo.avgMonthlyKWh : currentCityInfo.avgMonthlyM3;
  const nationalAvgVal = isElectricity ? SAUDI_BENCHMARK_DATA.electricity.nationalBaseline : SAUDI_BENCHMARK_DATA.water.nationalBaseline;
  const ecoTargetVal = isElectricity ? SAUDI_BENCHMARK_DATA.electricity.ecoHeroTarget : SAUDI_BENCHMARK_DATA.water.ecoHeroTarget;
  const score = isElectricity ? calculateElecScore(userKWh) : calculateWaterScore(userM3);

  const unitLabel = isElectricity ? (isArabic ? 'ك.و.س' : 'kWh') : (isArabic ? 'م³' : 'm³');
  const unitRateLabel = isElectricity ? (isArabic ? 'ك.و.س/شهرياً' : 'kWh/month') : (isArabic ? 'م³/شهرياً' : 'm³/month');

  // Percentile ranking calculation based on City Benchmark
  const getPercentileRank = (val: number, benchmarkVal: number) => {
    const ratio = val / benchmarkVal;
    if (ratio <= 0.6) {
      return {
        percentile: 90,
        text: `Top 10% Most Efficient Homes in ${cityName}`,
        textAr: `ضمن أفضل 10٪ من المنازل الأكثر كفاءة في ${cityName}`,
        color: "text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800"
      };
    }
    if (ratio <= 0.8) {
      return {
        percentile: 80,
        text: `Top 20% Most Efficient Homes in ${cityName}`,
        textAr: `ضمن أفضل 20٪ من المنازل الأكثر كفاءة في ${cityName}`,
        color: "text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800"
      };
    }
    if (ratio <= 1.0) {
      return {
        percentile: 65,
        text: `More Efficient than Peer Average in ${cityName}`,
        textAr: `أكثر كفاءة من متوسط الأسر في ${cityName}`,
        color: "text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800"
      };
    }
    if (ratio <= 1.25) {
      return {
        percentile: 45,
        text: `Standard Consumption Level in ${cityName}`,
        textAr: `مستوى الاستهلاك الطبيعي في ${cityName}`,
        color: "text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800"
      };
    }
    return {
      percentile: 15,
      text: `Higher Consumption than Most Homes in ${cityName}`,
      textAr: `استهلاك أعلى من غالبية منازل ${cityName}`,
      color: "text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800"
    };
  };

  const rank = getPercentileRank(userVal, cityAvgVal);

  // Percentage difference vs City avg
  const diffVsCity = Math.round(((userVal - cityAvgVal) / cityAvgVal) * 100);
  const isLowerThanCity = diffVsCity <= 0;

  // Percentage difference vs national avg
  const diffVsNational = Math.round(((userVal - nationalAvgVal) / nationalAvgVal) * 100);
  const isLowerThanNational = diffVsNational <= 0;

  // Electricity AC Estimate
  const acKWhEstimate = Math.round(userKWh * (SAUDI_BENCHMARK_DATA.electricity.acConsumptionShare / 100));
  const acSarEstimate = (acKWhEstimate * SAUDI_BENCHMARK_DATA.electricity.secTier1Rate).toFixed(0);

  // Water Distribution Estimate
  const waterIrrigationEstimate = (userM3 * (SAUDI_BENCHMARK_DATA.water.waterImpactShare / 100)).toFixed(1);

  // Maximum scale reference for visual bar chart
  const barChartMaxScale = isElectricity ? 2200 : 60;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 font-sans text-slate-800 dark:text-slate-100">
      
      {/* ---------------------------------------------------- */}
      {/* 1. TOP UTILITY SWITCHER TABS (ELECTRICITY VS. WATER)  */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {isArabic ? 'مقارنة استهلاك المدن السعودية (GASTAT Benchmarking)' : 'Saudi City Benchmarking'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isArabic 
                ? 'مقارنة استهلاك منزلك مباشرة مع متوسط الأسر بالمدن الرئيسية بالمملكة' 
                : 'Directly compare your household utility usage against Saudi regional city benchmarks'}
            </p>
          </div>
        </div>

        {/* Dual Utility Toggle Control */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveUtility('electricity')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              isElectricity
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-200" />
            <span>{isArabic ? 'الكهرباء (SEC)' : 'Electricity (SEC)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveUtility('water')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              !isElectricity
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Droplet className="w-4 h-4 text-sky-200" />
            <span>{isArabic ? 'المياه (NWC)' : 'Water (NWC)'}</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PAGE HEADER WITH ACCENT                              */}
      {/* ---------------------------------------------------- */}
      <div className={`bg-gradient-to-br text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border ${
        isElectricity 
          ? 'from-slate-900 via-slate-800 to-emerald-950 border-slate-700/60' 
          : 'from-slate-900 via-slate-800 to-sky-950 border-slate-700/60'
      }`}>
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isElectricity ? 'bg-emerald-500/10' : 'bg-sky-500/10'
        }`} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${
              isElectricity 
                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' 
                : 'bg-sky-500/20 border-sky-400/30 text-sky-300'
            }`}>
              <Award className="w-3.5 h-3.5" />
              <span>
                {isArabic 
                  ? `البيانات المفتوحة لل مدن السعودية (${isElectricity ? 'الكهرباء' : 'المياه'})` 
                  : `Saudi City Open Data Benchmark (${isElectricity ? 'Electricity' : 'Water'})`}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-2">
              <span>
                {isElectricity 
                  ? (isArabic ? 'تقييم كفاءة الكهرباء بمدينة' : 'City Electricity Benchmarking:') 
                  : (isArabic ? 'تقييم كفاءة المياه بمدينة' : 'City Water Benchmarking:')}
              </span>
              <span className={`underline underline-offset-4 ${isElectricity ? 'text-emerald-400 decoration-emerald-500/50' : 'text-sky-400 decoration-sky-500/50'}`}>
                {cityName}
              </span>
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {isElectricity
                ? (isArabic 
                    ? `مقارنة ديناميكية لاستهلاك الكهرباء بمنزلك مباشرة مع متوسط الأسر في مدينة ${cityName} (${regionName}) المستندة إلى مسوح الهيئة العامة للإحصاء (GASTAT).`
                    : `Dynamic comparison of your household electricity direct against average peer homes in ${cityName} (${regionName}) based on official GASTAT data.`)
                : (isArabic 
                    ? `مقارنة ديناميكية لاستهلاك المياه بمنزلك مباشرة مع متوسط الأسر في مدينة ${cityName} (${regionName}) المستندة إلى مسوح الهيئة العامة للإحصاء والشركة الوطنية للمياه.`
                    : `Dynamic comparison of your household water usage direct against average peer homes in ${cityName} (${regionName}) based on official GASTAT & NWC baselines.`)}
            </p>

            {/* City Selector Toolbar Header */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className={`w-4 h-4 ${isElectricity ? 'text-emerald-400' : 'text-sky-400'}`} />
                {isArabic ? 'اختر المدينة:' : 'Select City Benchmark:'}
              </span>
              <select
                value={selectedCityKey}
                onChange={(e) => setSelectedCityKey(e.target.value)}
                className={`bg-slate-800/90 border text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 cursor-pointer shadow-sm ${
                  isElectricity 
                    ? 'text-emerald-300 border-emerald-500/40 focus:ring-emerald-400' 
                    : 'text-sky-300 border-sky-500/40 focus:ring-sky-400'
                }`}
              >
                {Object.values(CITY_BENCHMARKS).map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {isArabic ? c.nameAr : c.nameEn} ({isElectricity ? `${toLocalDigits(c.avgMonthlyKWh, lang)} ${isArabic ? 'ك.و.س' : 'kWh'}` : `${toLocalDigits(c.avgMonthlyM3, lang)} ${isArabic ? 'م³' : 'm³'}`})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Monthly Consumption Control Box */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 min-w-[240px] flex flex-col justify-between">
            <div className={`text-xs font-semibold mb-1 ${isElectricity ? 'text-emerald-200' : 'text-sky-200'}`}>
              {isElectricity 
                ? (isArabic ? 'استهلاك الكهرباء الشهري الحالي:' : 'Your Monthly Electricity Usage:')
                : (isArabic ? 'استهلاك المياه الشهري الحالي:' : 'Your Monthly Water Usage:')}
            </div>
            <div className="flex items-baseline gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={toLocalDigits(userVal, lang)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d٠١٢٣٤٥٦٧٨٩]/g, '');
                  const western = raw.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                  const parsed = Math.max(1, parseInt(western, 10) || 0);
                  if (isElectricity) setUserKWh(parsed);
                  else setUserM3(parsed);
                }}
                className={`w-28 text-2xl font-black bg-slate-900/80 border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 font-mono ${
                  isElectricity 
                    ? 'text-emerald-400 border-emerald-500/40 focus:ring-emerald-400' 
                    : 'text-sky-400 border-sky-500/40 focus:ring-sky-400'
                }`}
              />
              <span className="text-sm font-extrabold text-slate-200">{unitLabel}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {isElectricity
                ? (latestElecBillKWh 
                    ? (isArabic ? 'مستخرج تلقائياً من الفاتورة المرفوعة' : 'Auto-synced from latest uploaded bill')
                    : (isArabic ? 'يمكنك تغيير القيمة للتجربة' : 'Adjust value to benchmark custom consumption'))
                : (latestWaterBillM3
                    ? (isArabic ? 'مستخرج تلقائياً من فاتورة المياه' : 'Auto-synced from latest water bill')
                    : (isArabic ? 'يمكنك تغيير القيمة للتجربة' : 'Adjust value to benchmark custom consumption'))}
            </p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. SECTOR CONTEXT HEADER CARD (MINISTRY & GASTAT DATA) */}
      {/* ---------------------------------------------------- */}
      <div className={`border rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
        isElectricity 
          ? 'bg-emerald-900/10 dark:bg-emerald-950/40 border-emerald-500/20 dark:border-emerald-800/60' 
          : 'bg-sky-900/10 dark:bg-sky-950/40 border-sky-500/20 dark:border-sky-800/60'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center flex-shrink-0 shadow-md ${
            isElectricity 
              ? 'bg-emerald-600 dark:bg-emerald-500 shadow-emerald-600/20' 
              : 'bg-sky-600 dark:bg-sky-500 shadow-sky-600/20'
          }`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isElectricity 
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800' 
                  : 'text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 border-sky-200 dark:border-sky-800'
              }`}>
                {isArabic ? `البيانات الخاصة بمدينة ${cityName}` : `City Benchmark Data: ${cityName}`}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {regionName}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isElectricity
                ? (isArabic 
                    ? `متوسط استهلاك الكهرباء للمنازل في مدينة ${cityName} هو ${toLocalDigits(cityAvgVal, lang)} ${unitLabel}/شهرياً` 
                    : `Average household electricity consumption in ${cityName} is ${toLocalDigits(cityAvgVal, lang)} ${unitLabel}/month`)
                : (isArabic 
                    ? `متوسط استهلاك المياه للمنازل في مدينة ${cityName} هو ${toLocalDigits(cityAvgVal, lang)} ${unitLabel}/شهرياً` 
                    : `Average household water usage in ${cityName} is ${toLocalDigits(cityAvgVal, lang)} ${unitLabel}/month`)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {isElectricity
                ? (isArabic
                    ? `يستند معيار مدينة ${cityName} إلى المسوح المناخية والسكانية الصادرة عن الهيئة العامة للإحصاء (GASTAT) لمنازل الأسر بالمملكة.`
                    : `The ${cityName} benchmark is mapped from GASTAT energy survey baselines for household demographics and regional climate conditions.`)
                : (isArabic
                    ? `يستند معيار المياه لمدينة ${cityName} إلى مسوح المياه والبيئة الصادرة عن الهيئة العامة للإحصاء والشركة الوطنية للمياه (NWC).`
                    : `The ${cityName} water benchmark is mapped from GASTAT & NWC household water survey baselines across Saudi regions.`)}
            </p>
          </div>
        </div>
        <div className={`flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 ${
          isElectricity ? 'border-emerald-200/60 dark:border-emerald-800/60' : 'border-sky-200/60 dark:border-sky-800/60'
        }`}>
          <span className={`text-2xl font-black font-mono ${isElectricity ? 'text-emerald-700 dark:text-emerald-400' : 'text-sky-700 dark:text-sky-400'}`}>
            {toLocalDigits(cityAvgVal, lang)}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {unitRateLabel} ({cityName})
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. DYNAMIC EFFICIENCY SCORE & RANKING BADGE          */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Score Radial Gauge */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-lg shadow-slate-100 dark:shadow-none relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 dark:text-slate-400 font-bold mb-4">
            <span>{isArabic ? 'مؤشر الكفاءة' : 'EFFICIENCY INDEX'}</span>
            <span className={isElectricity ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-sky-600 dark:text-sky-400 font-extrabold'}>
              ECO-SCORE
            </span>
          </div>

          {/* Radial Circle Representation */}
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`${
                  score >= 75 
                    ? (isElectricity ? 'stroke-emerald-500' : 'stroke-sky-500') 
                    : score >= 50 
                    ? 'stroke-amber-500' 
                    : 'stroke-rose-500'
                } transition-all duration-1000 ease-out`}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{toLocalDigits(score, lang)}</span>
              <span className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">{isArabic ? ' / ١٠٠' : '/ 100'}</span>
            </div>
          </div>

          {/* Rank Badge */}
          <div className={`mt-4 w-full py-2.5 px-4 rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 ${rank.color}`}>
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{isArabic ? rank.textAr : rank.text}</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-300 mt-4 leading-relaxed font-medium">
            {isElectricity ? (
              score >= 75 
                ? (isArabic ? `ممتاز! استهلاك الكهرباء بمنزلك يتميز بكفاءة عالية تتفوق على متوسط مدينة ${cityName}.` : `Outstanding! Your electric consumption demonstrates high efficiency compared to average homes in ${cityName}.`)
                : score >= 50
                ? (isArabic ? `مستوى استهلاك متوسط في ${cityName}. يمكنك رفع الكفاءة بتقليل هدر التكييف وتنظيم الحرارة.` : `Standard range in ${cityName}. Optimizing thermostat settings can push you into top tier.`)
                : (isArabic ? `استهلاك كهرباء مرتفع عن معيار ${cityName}! ينصح بتركيب عوازل وضبط التكييف عند 24 درجة مئوية.` : `High waste alert for ${cityName}! Consider setting ACs to 24°C and inspecting insulation.`)
            ) : (
              score >= 75 
                ? (isArabic ? `ممتاز! استهلاك المياه بمنزلك يتميز بكفاءة عالية تتفوق على متوسط منازل مدينة ${cityName}.` : `Outstanding! Your household water usage is highly efficient compared to peer homes in ${cityName}.`)
                : score >= 50
                ? (isArabic ? `مستوى استهلاك مياه ضمن المتوسط بمدينة ${cityName}. ينصح بتركيب المرشدات الموفرة لتجاوز الأهداف.` : `Standard water usage range in ${cityName}. Installing aerators can push you into the top eco tier.`)
                : (isArabic ? `استهلاك مياه مرتفع عن معيار ${cityName}! افحص التسريبات الأرضية وقم بتركيب الأدوات الصحية الموفرة.` : `High water consumption alert for ${cityName}! Check underground leaks and install aerators.`)
            )}
          </p>
        </div>

        {/* Dynamic Comparison Cards */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Comparison to City & National Benchmarks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-100 dark:shadow-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${isElectricity ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'}`} />
                  {isArabic ? `مقارنة الاستهلاك المباشرة مع مدينة ${cityName}` : `Direct Comparison with ${cityName}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isArabic ? `استناداً إلى مسح الهيئة العامة للإحصاء بـ (${regionName})` : `Based on GASTAT Open Data for ${regionName}`}
                </p>
              </div>

              {/* City Switcher dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
                <select
                  value={selectedCityKey}
                  onChange={(e) => setSelectedCityKey(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                >
                  {Object.values(CITY_BENCHMARKS).map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {isArabic ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Benchmark Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* City Specific Comparison Card */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isElectricity 
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60' 
                  : 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-200/80 dark:border-sky-800/60'
              }`}>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>{isArabic ? `متوسط أسر ${cityName}` : `Average homes in ${cityName}`}</span>
                  <span className={`font-extrabold ${isElectricity ? 'text-emerald-800 dark:text-emerald-300' : 'text-sky-800 dark:text-sky-300'}`}>
                    {toLocalDigits(cityAvgVal, lang)} {unitLabel}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{toLocalDigits(userVal, lang)} {unitLabel}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
                    isLowerThanCity ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                  }`}>
                    {isLowerThanCity ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    <span>{toLocalDigits(Math.abs(diffVsCity), lang)}% {isLowerThanCity ? (isArabic ? 'أقل' : 'LESS') : (isArabic ? 'أعلى' : 'MORE')}</span>
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-snug">
                  {isLowerThanCity 
                    ? (isArabic 
                        ? `أنت تستهلك ${toLocalDigits(Math.abs(diffVsCity), lang)}٪ أقل من متوسط المنازل المماثلة في ${cityName}!` 
                        : `You consume ${Math.abs(diffVsCity)}% LESS than peer homes in ${cityName}!`)
                    : (isArabic 
                        ? `أنت تستهلك ${toLocalDigits(Math.abs(diffVsCity), lang)}٪ أعلى من متوسط المنازل المماثلة في ${cityName}` 
                        : `You consume ${Math.abs(diffVsCity)}% MORE than peer homes in ${cityName}`)}
                </p>
              </div>

              {/* National Baseline Comparison Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 font-semibold">
                  <span>{isArabic ? 'المتوسط الوطني بالمملكة' : 'KSA National Average'}</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-200">{toLocalDigits(nationalAvgVal, lang)} {unitLabel}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{toLocalDigits(userVal, lang)} {unitLabel}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
                    isLowerThanNational ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {isLowerThanNational ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    <span>{toLocalDigits(Math.abs(diffVsNational), lang)}% {isLowerThanNational ? (isArabic ? 'أقل' : 'LESS') : (isArabic ? 'أعلى' : 'MORE')}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug font-medium">
                  {isArabic 
                    ? `المعدل السكني العام لمنازل المملكة هو ${toLocalDigits(nationalAvgVal, lang)} ${unitLabel}/شهرياً`
                    : `National household average across KSA is ${toLocalDigits(nationalAvgVal, lang)} ${unitLabel}/month`}
                </p>
              </div>

            </div>

          </div>

          {/* REGIONAL IMPACT CARD (SUMMER AC vs WATER DISTRIBUTION) */}
          {isElectricity ? (
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                    <ThermometerSnowflake className="w-4 h-4 text-emerald-400" />
                    <span>{isArabic ? `أثر التكييف الصيفي بمدينة ${cityName}` : `Summer AC Impact in ${cityName}`}</span>
                  </div>
                  <h4 className="text-xl font-extrabold text-white">
                    {isArabic ? `التكييف يستهلك ${toLocalDigits(73, lang)}٪ من فاتورة الصيف` : 'AC Accounts for 73% of Summer Electricity'}
                  </h4>
                  <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                    {isArabic
                      ? `بناءً على دراسات الشركة السعودية للكهرباء (SEC)، يقدر استهلاك التكييف المباشر في منزلكم بـ ${cityName} بنحو ${toLocalDigits(acKWhEstimate, lang)} ك.و.س (~${toLocalDigits(acSarEstimate, lang)} ر.س/شهرياً).`
                      : `According to SEC studies, AC units directly account for ~73% of summer bills in ${cityName}. For your home, this equals ~${toLocalDigits(acKWhEstimate, lang)} kWh (~${toLocalDigits(acSarEstimate, lang)} SAR/month).`}
                  </p>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/30 p-4 rounded-2xl text-center min-w-[130px] flex-shrink-0">
                  <div className="text-4xl font-black text-emerald-300 font-mono">{toLocalDigits(73, lang)}%</div>
                  <div className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mt-1">
                    {isArabic ? 'من فاتورة الصيف' : 'Summer Bill Share'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-cyan-950 text-white rounded-3xl p-6 shadow-xl border border-sky-800/40 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                    <Droplets className="w-4 h-4 text-sky-400" />
                    <span>{isArabic ? `أثر توزيع استهلاك المياه بمدينة ${cityName}` : `Water Distribution Impact in ${cityName}`}</span>
                  </div>
                  <h4 className="text-xl font-extrabold text-white">
                    {isArabic ? `الدش والري المباشر يستهلكان ${toLocalDigits(65, lang)}٪ من المياه` : 'Showers & Lawn Irrigation Account for 65% of Water Use'}
                  </h4>
                  <p className="text-xs text-sky-200 leading-relaxed font-medium">
                    {isArabic
                      ? `بناءً على مسوح الشركة الوطنية للمياه (NWC)، يمثل استهلاك الدش والري الخارجي نحو 65٪ من الاستهلاك الصيفي بمدينة ${cityName}. يعادل ذلك لمنزلك نحو ${toLocalDigits(waterIrrigationEstimate, lang)} م³/شهرياً.`
                      : `According to NWC survey baselines, shower fixtures and lawn/garden irrigation account for ~65% of summer residential water usage in ${cityName}. For your home, this equals ~${toLocalDigits(waterIrrigationEstimate, lang)} m³/month.`}
                  </p>
                </div>

                <div className="bg-sky-500/20 border border-sky-400/30 p-4 rounded-2xl text-center min-w-[130px] flex-shrink-0">
                  <div className="text-4xl font-black text-sky-300 font-mono">{toLocalDigits(65, lang)}%</div>
                  <div className="text-[10px] font-bold text-sky-100 uppercase tracking-wider mt-1">
                    {isArabic ? 'حصة الاستهلاك الرئيسي' : 'Water Use Share'}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* 4. VISUAL COMPARATIVE BAR CHART                      */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-100 dark:shadow-none space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isElectricity 
                ? (isArabic ? `مقارنة بيانية: استهلاك الكهرباء مقابل متوسط مدينة ${cityName}` : `Comparative Electricity Analysis: ${cityName}`)
                : (isArabic ? `مقارنة بيانية: استهلاك المياه مقابل متوسط مدينة ${cityName}` : `Comparative Water Analysis: ${cityName}`)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isArabic 
                ? `توضيح استهلاكك الشهري مقارنةً بمتوسط ${cityName}، والشرائح الوطنية المعتمدة` 
                : `Visual breakdown comparing your home against average homes in ${cityName} (${toLocalDigits(cityAvgVal, lang)} ${unitLabel})`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <span className={`w-3 h-3 rounded-full inline-block ${isElectricity ? 'bg-emerald-500' : 'bg-sky-500'}`} />
              {isArabic ? 'منزلك' : 'Your Home'}
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <span className="w-3 h-3 rounded-full bg-slate-600 dark:bg-slate-400 inline-block" />
              {isArabic ? `متوسط ${cityName}` : `Avg ${cityName}`}
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
              {isArabic ? 'الهدف الأخضر' : 'Eco Target'}
            </span>
          </div>
        </div>

        {/* Custom Responsive Visual Bar Chart */}
        <div className="space-y-5 pt-2">
          
          {/* Bar 1: User's Consumption */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-2">
                {isElectricity 
                  ? <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  : <Droplet className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                {isElectricity 
                  ? (isArabic ? 'استهلاك منزلك الشهري للكهرباء' : 'Your Monthly Household Consumption')
                  : (isArabic ? 'استهلاك منزلك الشهري للمياه' : 'Your Monthly Household Water Usage')}
              </span>
              <span className={`font-black ${isElectricity ? 'text-emerald-700 dark:text-emerald-400' : 'text-sky-700 dark:text-sky-400'}`}>
                {toLocalDigits(userVal, lang)} {unitLabel}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-xl overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
              <div 
                className={`h-full rounded-lg transition-all duration-700 flex items-center justify-end px-2 ${
                  isElectricity ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : 'bg-gradient-to-r from-sky-600 to-cyan-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(8, (userVal / barChartMaxScale) * 100))}%` }}
              >
                <span className="text-[10px] font-bold text-white tracking-wider">{toLocalDigits(userVal, lang)} {unitLabel}</span>
              </div>
            </div>
          </div>

          {/* Bar 2: Selected City Average */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isElectricity ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'}`} />
                {isArabic ? `متوسط منازل مدينة ${cityName}` : `Average Homes in ${cityName} (${regionName})`}
              </span>
              <span className="text-slate-700 dark:text-slate-200 font-black">{toLocalDigits(cityAvgVal, lang)} {unitLabel}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-xl overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
              <div 
                className="bg-slate-600 dark:bg-slate-500 h-full rounded-lg transition-all duration-700 flex items-center justify-end px-2"
                style={{ width: `${Math.min(100, Math.max(8, (cityAvgVal / barChartMaxScale) * 100))}%` }}
              >
                <span className="text-[10px] font-bold text-white tracking-wider">{toLocalDigits(cityAvgVal, lang)} {unitLabel}</span>
              </div>
            </div>
          </div>

          {/* Bar 3: National Baseline Average */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                {isArabic ? 'المتوسط الوطني بالمملكة (GASTAT)' : 'National KSA Baseline Average'}
              </span>
              <span className="text-slate-700 dark:text-slate-200 font-black">{toLocalDigits(nationalAvgVal, lang)} {unitLabel}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-xl overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
              <div 
                className="bg-slate-400 dark:bg-slate-600 h-full rounded-lg transition-all duration-700 flex items-center justify-end px-2"
                style={{ width: `${Math.min(100, Math.max(8, (nationalAvgVal / barChartMaxScale) * 100))}%` }}
              >
                <span className="text-[10px] font-bold text-white tracking-wider">{toLocalDigits(nationalAvgVal, lang)} {unitLabel}</span>
              </div>
            </div>
          </div>

          {/* Bar 4: Eco Target / Hero Tier */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {isElectricity 
                  ? (isArabic ? `هدف الكفاءة الخضراء (< ${toLocalDigits(ecoTargetVal, lang)} ك.و.س)` : `SEC Eco Hero Target (< ${toLocalDigits(ecoTargetVal, lang)} kWh)`)
                  : (isArabic ? `هدف الترشيد المائي (< ${toLocalDigits(ecoTargetVal, lang)} م³)` : `NWC Eco Target (< ${toLocalDigits(ecoTargetVal, lang)} m³)`)}
              </span>
              <span className="text-teal-700 dark:text-teal-400 font-black">{toLocalDigits(ecoTargetVal, lang)} {unitLabel}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-xl overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
              <div 
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-lg transition-all duration-700 flex items-center justify-end px-2"
                style={{ width: `${Math.min(100, Math.max(8, (ecoTargetVal / barChartMaxScale) * 100))}%` }}
              >
                <span className="text-[10px] font-bold text-white tracking-wider">{toLocalDigits(ecoTargetVal, lang)} {unitLabel}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* 5. EFFICIENCY TIERS LEGEND & RECOMMENDATION SUMMARY  */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tier 1: Eco Hero */}
        <div className={`p-5 rounded-2xl border transition-all ${
          (isElectricity && userKWh <= 900) || (!isElectricity && userM3 <= 20)
            ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-400' 
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
        }`}>
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
            {isElectricity
              ? (isArabic ? SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.ecoHero.labelAr : SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.ecoHero.labelEn)
              : (isArabic ? SAUDI_BENCHMARK_DATA.water.efficiencyTiers.ecoHero.labelAr : SAUDI_BENCHMARK_DATA.water.efficiencyTiers.ecoHero.labelEn)}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 font-mono">
            {toLocalDigits(0, lang)} - {toLocalDigits(isElectricity ? 900 : 20, lang)} {unitRateLabel}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {isElectricity
              ? (isArabic ? SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.ecoHero.descAr : SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.ecoHero.descEn)
              : (isArabic ? SAUDI_BENCHMARK_DATA.water.efficiencyTiers.ecoHero.descAr : SAUDI_BENCHMARK_DATA.water.efficiencyTiers.ecoHero.descEn)}
          </p>
        </div>

        {/* Tier 2: Average */}
        <div className={`p-5 rounded-2xl border transition-all ${
          (isElectricity && userKWh > 900 && userKWh <= 1800) || (!isElectricity && userM3 > 20 && userM3 <= 40)
            ? 'bg-amber-50/80 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400' 
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
        }`}>
          <div className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
            {isElectricity
              ? (isArabic ? SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.average.labelAr : SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.average.labelEn)
              : (isArabic ? SAUDI_BENCHMARK_DATA.water.efficiencyTiers.average.labelAr : SAUDI_BENCHMARK_DATA.water.efficiencyTiers.average.labelEn)}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 font-mono">
            {toLocalDigits(isElectricity ? 901 : 21, lang)} - {toLocalDigits(isElectricity ? 1800 : 40, lang)} {unitRateLabel}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {isElectricity
              ? (isArabic ? SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.average.descAr : SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.average.descEn)
              : (isArabic ? SAUDI_BENCHMARK_DATA.water.efficiencyTiers.average.descAr : SAUDI_BENCHMARK_DATA.water.efficiencyTiers.average.descEn)}
          </p>
        </div>

        {/* Tier 3: High Waste */}
        <div className={`p-5 rounded-2xl border transition-all ${
          (isElectricity && userKWh > 1800) || (!isElectricity && userM3 > 40)
            ? 'bg-rose-50/80 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400' 
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
        }`}>
          <div className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1">
            {isElectricity
              ? (isArabic ? SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.highWaste.labelAr : SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.highWaste.labelEn)
              : (isArabic ? SAUDI_BENCHMARK_DATA.water.efficiencyTiers.highWaste.labelAr : SAUDI_BENCHMARK_DATA.water.efficiencyTiers.highWaste.labelEn)}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 font-mono">
            &gt; {toLocalDigits(isElectricity ? 1800 : 40, lang)} {unitRateLabel}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {isElectricity
              ? (isArabic ? SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.highWaste.descAr : SAUDI_BENCHMARK_DATA.electricity.efficiencyTiers.highWaste.descEn)
              : (isArabic ? SAUDI_BENCHMARK_DATA.water.efficiencyTiers.highWaste.descAr : SAUDI_BENCHMARK_DATA.water.efficiencyTiers.highWaste.descEn)}
          </p>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* VERIFIED SOURCES FOOTER CITATION                     */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isArabic ? 'المصادر المعتمدة المفتوحة لبيانات المدن:' : 'Official Open Data Sources for City Benchmarking:'}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          {(isArabic ? SAUDI_BENCHMARK_DATA.metadata.sourcesAr : SAUDI_BENCHMARK_DATA.metadata.sourcesEn).join(" • ")}
        </p>
      </div>

    </div>
  );
};
