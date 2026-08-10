import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Droplets,
  ShieldAlert,
  Layers,
  CheckSquare,
  Square,
  DollarSign,
  MessageSquare,
  Send,
  Bot,
  User,
  Plus,
  Check,
  RotateCcw,
  Calculator,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Language, toLocalDigits, formatUnit } from '../translations';

interface UpgradeItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  costSAR: number;
  monthlySavingSAR: number;
  monthlySavingUnit: number; // kWh for elec, m³ for water
  selected: boolean;
  tagColor?: string;
  paybackMonthsFixed?: string;
}

interface FinancialChatMessage {
  id: string;
  sender: 'user' | 'agent';
  textAr: string;
  textEn: string;
  timestamp: string;
  suggestedUpgrade?: Partial<UpgradeItem>;
}

interface AIFinancialRoiAgentProps {
  consumptionKWh: number;
  consumptionM3?: number;
  utilityType?: 'electricity' | 'water';
  billAmountSAR?: number | null;
  billingPeriod?: string | null;
  language: Language;
}

export const AIFinancialRoiAgent: React.FC<AIFinancialRoiAgentProps> = ({
  consumptionKWh,
  consumptionM3 = 35,
  utilityType = 'electricity',
  language,
}) => {
  const isArabic = language === 'ar';
  const [savingsViewMode, setSavingsViewMode] = useState<'monthly' | 'annual'>('monthly');
  const [activeUtility, setActiveUtility] = useState<'electricity' | 'water'>(utilityType);

  React.useEffect(() => {
    setActiveUtility(utilityType);
  }, [utilityType]);

  // SEC Electricity Tariff Constants
  const TIER1_LIMIT_KWH = 6000;
  const TIER1_RATE = 0.18; // SAR / kWh
  const TIER2_RATE = 0.30; // SAR / kWh

  const validKWh = Math.max(0, consumptionKWh || 0);
  const validM3 = Math.max(0, consumptionM3 || 0);

  // Electricity calculations
  const tier1KWh = Math.min(validKWh, TIER1_LIMIT_KWH);
  const tier2KWh = Math.max(0, validKWh - TIER1_LIMIT_KWH);
  const tier1Cost = tier1KWh * TIER1_RATE;
  const tier2Cost = tier2KWh * TIER2_RATE;
  const calculatedElecCost = tier1Cost + tier2Cost;
  const progressPercentElec = Math.min(100, Math.round((validKWh / TIER1_LIMIT_KWH) * 100));

  // NWC Water Tariff Calculations (SAR / m³)
  // Slab 1: 1 - 15 m³ @ 0.15 SAR/m³
  // Slab 2: 16 - 30 m³ @ 1.00 SAR/m³
  // Slab 3: 31 - 45 m³ @ 3.00 SAR/m³
  // Slab 4: 46 - 60 m³ @ 4.00 SAR/m³
  // Slab 5: > 60 m³ @ 6.00 SAR/m³
  // Plus 50% wastewater surcharge
  const calcWaterSlabs = (m3Val: number) => {
    const s1 = Math.min(m3Val, 15);
    const s2 = Math.min(Math.max(0, m3Val - 15), 15);
    const s3 = Math.min(Math.max(0, m3Val - 30), 15);
    const s4 = Math.min(Math.max(0, m3Val - 45), 15);
    const s5 = Math.max(0, m3Val - 60);

    const costS1 = s1 * 0.15;
    const costS2 = s2 * 1.00;
    const costS3 = s3 * 3.00;
    const costS4 = s4 * 4.00;
    const costS5 = s5 * 6.00;

    const baseWaterCost = costS1 + costS2 + costS3 + costS4 + costS5;
    const wastewaterSurcharge = baseWaterCost * 0.5;
    const totalWaterCost = baseWaterCost + wastewaterSurcharge;

    return { s1, s2, s3, s4, s5, costS1, costS2, costS3, costS4, costS5, baseWaterCost, wastewaterSurcharge, totalWaterCost };
  };

  const waterSlabsData = calcWaterSlabs(validM3);
  const calculatedWaterCost = waterSlabsData.totalWaterCost;
  const progressPercentWater = Math.min(100, Math.round((validM3 / 45) * 100));

  // Tier status checks for Electricity
  const isNearTier2Elec = validKWh >= 4500 && validKWh <= TIER1_LIMIT_KWH;
  const isExceededTier1Elec = validKWh > TIER1_LIMIT_KWH;
  const remainingTier1KWh = Math.max(0, TIER1_LIMIT_KWH - validKWh);

  // Tier status checks for Water
  const isHighWaterTier = validM3 > 30;
  const isCriticalWaterTier = validM3 > 45;

  // Preset Electricity Upgrades
  const electricityPresets: UpgradeItem[] = [
    {
      id: 'ac_inverter',
      titleAr: 'تحديث مكيفات إنفرتر عالية الكفاءة',
      titleEn: 'High-Efficiency Inverter AC Upgrades',
      descAr: 'استبدال وحدات التكييف التقليدية بنماذج الإنفرتر المعتمدة لخفض الاستهلاك بنسبة تصل إلى 40%.',
      descEn: 'Upgrade to variable-speed Inverter AC units to slash cooling power consumption by up to 40%.',
      costSAR: 2800,
      monthlySavingSAR: 195,
      monthlySavingUnit: 1083,
      paybackMonthsFixed: '14.4',
      selected: true,
      tagColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    },
    {
      id: 'smart_thermostat',
      titleAr: 'الترموستات المنزلي الذكي',
      titleEn: 'Smart AC Thermostats',
      descAr: 'أتمتة درجات الحرارة وبرمجة وضع التوفير الذكي 24°م مع الاستشعار التلقائي للتواجد.',
      descEn: 'Automate temperature bounds to 24°C with occupancy sensing and smart scheduling.',
      costSAR: 650,
      monthlySavingSAR: 65,
      monthlySavingUnit: 361,
      paybackMonthsFixed: '10.0',
      selected: true,
      tagColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    },
    {
      id: 'solar_pv',
      titleAr: 'منظومة الطاقة الشمسية السطحية (Solar PV)',
      titleEn: 'Rooftop Solar PV System',
      descAr: 'تركيب أผواح شمسية بقدرة 5 كيلوواط للربط مع شبكة SEC وتغطية الحمل الأهم نهاراً.',
      descEn: 'Install a 5kW rooftop grid-tied solar array to offset daytime peak SEC power draw.',
      costSAR: 12500,
      monthlySavingSAR: 390,
      monthlySavingUnit: 2166,
      paybackMonthsFixed: '32.1',
      selected: false,
      tagColor: 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    },
    {
      id: 'led_lighting',
      titleAr: 'استبدال كامل الإضاءة بلمبات LED',
      titleEn: 'Full LED Lighting Retrofit',
      descAr: 'ترقية جميع مصابيح المنزل لمصابيح LED عالية الكفاءة وتقليل الحمل الحراري.',
      descEn: 'Replace all halogen & incandescent bulbs with certified high-lumen A-grade LEDs.',
      costSAR: 350,
      monthlySavingSAR: 40,
      monthlySavingUnit: 222,
      paybackMonthsFixed: '8.8',
      selected: true,
      tagColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    },
    {
      id: 'thermal_film',
      titleAr: 'العزل الحراري للنوافذ والستائر',
      titleEn: 'Window Thermal Tint & Insulation',
      descAr: 'تركيب أفلام النانو سيراميك الحرارية لمنع اختراق الأشعة فوق البنفسجية وتخفيف حمل المكيف.',
      descEn: 'Apply nano-ceramic heat-blocking tint on window glazing to reduce indoor solar gain.',
      costSAR: 850,
      monthlySavingSAR: 80,
      monthlySavingUnit: 444,
      paybackMonthsFixed: '10.6',
      selected: true,
      tagColor: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700',
    },
    {
      id: 'smart_heater_timer',
      titleAr: 'مؤقت السخان الكهربائي الذكي',
      titleEn: 'Smart Eco Water Heater Timer',
      descAr: 'جدولة تشغيل السخان الكهربائي قبل ساعات الاستخدام فقط لمنع التشغيل المستمر 24 ساعة.',
      descEn: 'Schedule electric water heater operation on demand instead of continuous heating.',
      costSAR: 220,
      monthlySavingSAR: 45,
      monthlySavingUnit: 250,
      paybackMonthsFixed: '4.9',
      selected: false,
      tagColor: 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    },
  ];

  // Preset Water Upgrades
  const waterPresets: UpgradeItem[] = [
    {
      id: 'water_aerators',
      titleAr: 'مرشدات تدفق المياه والصنابير',
      titleEn: 'Water Flow Restrictors / Aerators',
      descAr: 'تركيب مرشدات تدفق معتمدة لترشيد تدفق المياه من 12 إلى 5 لتر/دقيقة دون خفض الضغط.',
      descEn: 'Install certified water-saving aerators on kitchen and shower taps (~30% water saving).',
      costSAR: 60,
      monthlySavingSAR: 35,
      monthlySavingUnit: 12,
      paybackMonthsFixed: '1.7',
      selected: true,
      tagColor: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700',
    },
    {
      id: 'smart_leak_detector',
      titleAr: 'نظام كشف التسريبات الذكي',
      titleEn: 'Smart Leak Detector System',
      descAr: 'كشف تسريبات الخزانات والشبكة فورياً لمنع الهدر الخفي والقفز لشرائح المياه العليا.',
      descEn: 'Real-time pipe & tank leak detection system preventing sudden tier jumps & water loss.',
      costSAR: 480,
      monthlySavingSAR: 80,
      monthlySavingUnit: 26,
      paybackMonthsFixed: '6.0',
      selected: true,
      tagColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    },
    {
      id: 'smart_irrigation',
      titleAr: 'نظام ري الحدائق الذكي',
      titleEn: 'Smart Garden Irrigation System',
      descAr: 'نظام ري تنقيط ذكي مجدول لتقليل تبخر مياه الحدائق وضبط كميات مياه الري.',
      descEn: 'Automated drip irrigation system optimizing schedule & reducing evaporation losses.',
      costSAR: 850,
      monthlySavingSAR: 105,
      monthlySavingUnit: 32,
      paybackMonthsFixed: '8.1',
      selected: true,
      tagColor: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700',
    },
    {
      id: 'greywater_recycling',
      titleAr: 'نظام معالجة وتدوير المياه الرمادية',
      titleEn: 'Greywater Recycling System',
      descAr: 'إعادة تدوير مياه المغاسل والدش المفلترة لاستخدامها في ري الحدائق وسيفونات المراحيض.',
      descEn: 'Filter and repurpose washbasin & shower greywater for garden irrigation and toilet flushing.',
      costSAR: 3600,
      monthlySavingSAR: 185,
      monthlySavingUnit: 52,
      paybackMonthsFixed: '19.5',
      selected: false,
      tagColor: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700',
    },
    {
      id: 'dual_flush_valves',
      titleAr: 'صمامات السيفون المزدوجة الموفرة',
      titleEn: 'Dual-Flush Toilet Converter Valves',
      descAr: 'ترقية سيفونات الطرد لتوفير خيار النصف تدفق وتقليل استهلاك المياه بنسبة 40%.',
      descEn: 'Retrofit single-flush toilets to dual-flush mechanisms to cut flush water volume by 40%.',
      costSAR: 130,
      monthlySavingSAR: 35,
      monthlySavingUnit: 11,
      paybackMonthsFixed: '3.7',
      selected: true,
      tagColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    },
    {
      id: 'pressure_regulator',
      titleAr: 'منظم ضغط شبكة المياه المنزلية',
      titleEn: 'Main Line Water Pressure Regulator',
      descAr: 'تخفيض الضغط العائد من الشبكة الرئيسية إلى 2.5 بار لحماية الأنابيب وتقليل هدر التدفق.',
      descEn: 'Calibrate main water line pressure down to 2.5 bar to eliminate hydraulic pipe stress and splashing.',
      costSAR: 320,
      monthlySavingSAR: 40,
      monthlySavingUnit: 13,
      paybackMonthsFixed: '8.0',
      selected: false,
      tagColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    },
  ];

  const [elecUpgrades, setElecUpgrades] = useState<UpgradeItem[]>(electricityPresets);
  const [waterUpgrades, setWaterUpgrades] = useState<UpgradeItem[]>(waterPresets);

  // Financial Interactive AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<FinancialChatMessage[]>([
    {
      id: 'msg-welcome-fin',
      sender: 'agent',
      textAr: 'أهلاً بك! أنا خبير المستشار المالي وحاسبة العائد على الاستثمار (ROI). يسعدني إجابتك على أي استفسار حول تكاليف الترقيات، فترات استرداد رأس المال، وتحليل شرائح تعرفة الكهرباء (SEC) والمياه (NWC).',
      textEn: 'Welcome! I am your AI Financial & ROI Specialist. Ask me any questions regarding upgrade costs, payback periods, or SEC/NWC tariff optimizations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (chatMessages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages]);

  // Quick Financial Prompt Chips
  const quickFinancialQuestionsElec = [
    {
      qAr: 'ما هو العائد الاستثماري لمكيفات الإنفرتر؟',
      qEn: 'What is the ROI & payback period for Inverter ACs?',
      answerAr: 'مكيفات الإنفرتر تخفض الاستهلاك بنسبة تصل إلى 40%. بتكلفة ترقية ~2,800 ر.س وتوفير شهري 195 ر.س (1,083 ك.و.س)، يسترد المبلغ المستثمر خلال 14.4 شهراً، محققاً وفراً يتجاوز 2,340 ر.س سنوياً.',
      answerEn: 'Inverter AC units cut cooling energy by ~40%. At an upgrade cost of ~2,800 SAR saving 195 SAR/mo (1,083 kWh/mo), you achieve full ROI in 14.4 months with 2,340+ SAR annual net gain.',
      suggestedUpgrade: {
        titleAr: 'تحديث مكيفات إنفرتر عالية الكفاءة',
        titleEn: 'Inverter AC Upgrades',
        descAr: 'استبدال التكييف التقليدي بنماذج الإنفرتر لخفض التكلفة بـ 195 ر.س/شهرياً.',
        descEn: 'Replace legacy ACs with Inverter units saving 195 SAR/month.',
        costSAR: 2800,
        monthlySavingSAR: 195,
        monthlySavingUnit: 1083,
        paybackMonthsFixed: '14.4',
        tagColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
      },
    },
    {
      qAr: 'هل منظومة الطاقة الشمسية السطحية (Solar PV) مجدية مالياً؟',
      qEn: 'Is a rooftop Solar PV system financially feasible in Saudi Arabia?',
      answerAr: 'نعم! منظومة شمسية بقدرة 5 كيلوواط تكلف ~12,500 ر.س وتوفر ~390 ر.س شهرياً (2,166 ك.و.س) من خلال إزاحة الشريحة العالية لـ SEC. يسترد الاستثمار كاملاً خلال 32 شهراً (أقل من 3 سنوات)، وتعمل المنظومة بكفاءة لأكثر من 20 عاماً.',
      answerEn: 'Yes! A 5kW solar system costing ~12,500 SAR yields ~390 SAR/mo savings by eliminating top SEC tariff tiers. Full ROI is reached in ~32 months (<3 yrs), generating pure savings for 20+ years.',
      suggestedUpgrade: {
        titleAr: 'منظومة الطاقة الشمسية السطحية 5 كيلوواط',
        titleEn: 'Rooftop Solar PV 5kW System',
        descAr: 'استغلال الطاقة الشمسية السطحية وتوفير 390 ر.س شهرياً.',
        descEn: 'Harness rooftop solar energy saving 390 SAR/month.',
        costSAR: 12500,
        monthlySavingSAR: 390,
        monthlySavingUnit: 2166,
        paybackMonthsFixed: '32.1',
        tagColor: 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      },
    },
    {
      qAr: 'كيف تتجنب تجاوز الشريحة الأولى في الكهرباء 0.18 ر.س؟',
      qEn: 'How to prevent exceeding SEC Tier 1 limit (6,000 kWh)?',
      answerAr: 'سقف الشريحة الأولى هو 6,000 ك.و.س بسعر 0.18 ر.س. أي كيلوواط إضافي يحسب بـ 0.30 ر.س (+66%). دمج الترموستات الذكي والتظليل الحراري للنوافذ يضمن بقاء الاستهلاك تحت 6,000 ك.و.س وتوفير مئات الريالات.',
      answerEn: 'SEC Tier 1 caps at 6,000 kWh @ 0.18 SAR. Excess kWh jumps to 0.30 SAR (+66%). Combining smart thermostats and thermal window tinting keeps usage below 6,000 kWh and saves hundreds monthly.',
    },
  ];

  const quickFinancialQuestionsWater = [
    {
      qAr: 'ما هو العائد المالي لمرشدات تدفق المياه؟',
      qEn: 'What is the ROI on water flow restrictors & aerators?',
      answerAr: 'تعد مرشدات المياه أعلى الترقيات استرداداً مالياً! بتكلفة ضئيلة (~60 ر.س) لجميع الصنابير، توفر ~35 ر.س شهرياً (12 م³)، وتسترد قيمتها بالكامل خلال أقل من شهرين (1.7 شهر)، وتوفر 420 ر.س سنوياً.',
      answerEn: 'Water aerators offer the fastest ROI! For a tiny ~60 SAR outlay across all taps, you save ~35 SAR/mo (12 m³), recovering your cost in under 2 months (1.7 mos) with 420 SAR annual return.',
      suggestedUpgrade: {
        titleAr: 'مرشدات تدفق المياه والصنابير',
        titleEn: 'Water Flow Restrictors / Aerators',
        descAr: 'توفير 35 ر.س شهرياً واسترداد التكلفة خلال 1.7 شهر.',
        descEn: 'Save 35 SAR/month and reach full ROI in 1.7 months.',
        costSAR: 60,
        monthlySavingSAR: 35,
        monthlySavingUnit: 12,
        paybackMonthsFixed: '1.7',
        tagColor: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700',
      },
    },
    {
      qAr: 'كيف يحميني نظام كشف التسريبات الذكي من قفزات NWC؟',
      qEn: 'How does a smart leak detector save on NWC water bills?',
      answerAr: 'تسريب خفي بسيط بـ 1 م³ يومياً يقفز بفاتورتك من الشريحة الأولى (0.15 ر.س) إلى الشريحة الرابعة (4.00 ر.س/م³) إضافة إلى 50% للصرف الصحي. كاشف التسريبات تكلفته ~480 ر.س ويوفر 80+ ر.س شهرياً واسترداد خلال 6 أشهر.',
      answerEn: 'A silent leak of 1 m³/day pushes consumption from Slab 1 (0.15 SAR) into Slab 4 (4.00 SAR/m³) plus 50% sewage surcharge. A smart detector costs ~480 SAR and saves 80+ SAR/mo with a 6-month payback.',
      suggestedUpgrade: {
        titleAr: 'نظام كشف التسريبات الذكي',
        titleEn: 'Smart Leak Detector System',
        descAr: 'منع قفزات الشرائح العالية وتوفير 80 ر.س شهرياً.',
        descEn: 'Stop high tariff jumps and save 80 SAR/month.',
        costSAR: 480,
        monthlySavingSAR: 80,
        monthlySavingUnit: 26,
        paybackMonthsFixed: '6.0',
        tagColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      },
    },
    {
      qAr: 'هل نظام تدوير المياه الرمادية مجدي في المنزل؟',
      qEn: 'Is a Greywater Recycling System cost-effective?',
      answerAr: 'نظام المياه الرمادية يعيد تدوير مياه الاستحمام والمغاسل لري الحدائق والمراحيض. بتكلفة ~3,600 ر.س وتوفير 185 ر.س شهرياً (52 م³)، يتحقق الاسترداد خلال 19.5 شهراً، مع توفير 2,220 ر.س سنوياً.',
      answerEn: 'Greywater systems filter shower/basin water for gardens and flushing. At ~3,600 SAR cost saving 185 SAR/mo (52 m³), payback is achieved in 19.5 months with 2,220 SAR annual savings.',
    },
  ];

  const quickFinancialQuestions = activeUtility === 'electricity' ? quickFinancialQuestionsElec : quickFinancialQuestionsWater;

  const handleSendFinancialQuestion = (text: string, presetUpgrade?: FinancialChatMessage['suggestedUpgrade']) => {
    if (!text.trim()) return;

    const userMsg: FinancialChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      textAr: text,
      textEn: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let replyAr = '';
    let replyEn = '';
    let autoUpgrade = presetUpgrade;

    if (!autoUpgrade) {
      if (activeUtility === 'electricity') {
        replyAr = `التحليل المالي الذكي للكهرباء: بناءً على نمط استهلاكك الحالي (${validKWh} ك.و.س)، تعرفة SEC الأولى توفر سقفاً بـ 6,000 ك.و.س @ 0.18 ر.س. استثمارك في الترقيات الموفرة يسترد تكلفته في مدة تتراوح بين 8 إلى 14 شهراً. تم إعداد كارت الترقية الموصى به لك.`;
        replyEn = `AI Financial Analysis for Electricity: Based on your current ${validKWh} kWh profile, upgrading to efficient hardware yields rapid ROI within 8-14 months under SEC Tier 1/2 rates. A card has been prepared for your simulation.`;
        autoUpgrade = {
          titleAr: `حاسبة ترقية مخصصة: ${text.slice(0, 35)}...`,
          titleEn: `Custom Upgrade ROI: ${text.slice(0, 35)}...`,
          descAr: `تحليل التكلفة والعائد بناءً على استفسارك المالي: ${text}`,
          descEn: `Cost-benefit simulation based on your inquiry: ${text}`,
          costSAR: 450,
          monthlySavingSAR: 45,
          monthlySavingUnit: 250,
          paybackMonthsFixed: '10.0',
          tagColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
        };
      } else {
        replyAr = `التحليل المالي الذكي للمياه: بالنظر لاستعمالك بـ (${validM3} م³)، السيطرة على التدفق والتسريبات يضمن تجنب شرائح NWC الثالثة والرابعة (3.00 و 4.00 ر.س/م³). جميع مرشدات المياه تسترد قيمتها خلال أقل من 6 أشهر.`;
        replyEn = `AI Financial Analysis for Water: For your ${validM3} m³ usage, installing flow regulators prevents jumping to higher NWC slabs (3.00 & 4.00 SAR/m³). Most water saving devices achieve full payback in <6 months.`;
        autoUpgrade = {
          titleAr: `ترقية ترشيد مالي للمياه: ${text.slice(0, 35)}...`,
          titleEn: `Water ROI Upgrade: ${text.slice(0, 35)}...`,
          descAr: `تحليل التكلفة والعائد بناءً على استفسارك المالي: ${text}`,
          descEn: `Cost-benefit simulation based on your inquiry: ${text}`,
          costSAR: 120,
          monthlySavingSAR: 30,
          monthlySavingUnit: 10,
          paybackMonthsFixed: '4.0',
          tagColor: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700',
        };
      }
    } else {
      const allQuick = [...quickFinancialQuestionsElec, ...quickFinancialQuestionsWater];
      const match = allQuick.find((q) => q.qAr === text || q.qEn === text);
      if (match) {
        replyAr = match.answerAr;
        replyEn = match.answerEn;
      } else {
        replyAr = isArabic ? 'تم إجراء التحليل المالي وحساب فترة الاسترداد.' : 'Financial ROI analysis performed.';
        replyEn = replyAr;
      }
    }

    const agentMsg: FinancialChatMessage = {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      textAr: replyAr,
      textEn: replyEn,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedUpgrade: autoUpgrade,
    };

    setChatMessages((prev) => [...prev, userMsg, agentMsg]);
    setChatInput('');
  };

  const handleAddSuggestedUpgradeToDashboard = (upgrade: Partial<UpgradeItem>) => {
    const newItem: UpgradeItem = {
      id: `custom-upgrade-${Date.now()}`,
      titleAr: upgrade.titleAr || 'ترقية مخصصة',
      titleEn: upgrade.titleEn || 'Custom Upgrade',
      descAr: upgrade.descAr || 'ترقية موفرة للطاقة والمياه',
      descEn: upgrade.descEn || 'Energy and water saving upgrade',
      costSAR: upgrade.costSAR || 300,
      monthlySavingSAR: upgrade.monthlySavingSAR || 30,
      monthlySavingUnit: upgrade.monthlySavingUnit || 10,
      paybackMonthsFixed: upgrade.paybackMonthsFixed || '10.0',
      selected: true,
      tagColor: upgrade.tagColor || 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    };

    if (activeUtility === 'electricity') {
      setElecUpgrades((prev) => [newItem, ...prev]);
    } else {
      setWaterUpgrades((prev) => [newItem, ...prev]);
    }
  };

  const currentUpgrades = activeUtility === 'electricity' ? elecUpgrades : waterUpgrades;

  // Toggle Upgrade Selection
  const toggleUpgradeSelection = (id: string) => {
    if (activeUtility === 'electricity') {
      setElecUpgrades((prev) =>
        prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
      );
    } else {
      setWaterUpgrades((prev) =>
        prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
      );
    }
  };

  // Calculations for Active Utility View
  const selectedCurrentUpgrades = currentUpgrades.filter((item) => item.selected);
  const activeInvestmentCost = selectedCurrentUpgrades.reduce((sum, item) => sum + item.costSAR, 0);
  const activeMonthlySavingSAR = selectedCurrentUpgrades.reduce((sum, item) => sum + item.monthlySavingSAR, 0);
  const activeAnnualSavingSAR = activeMonthlySavingSAR * 12;
  const activePaybackMonths =
    activeMonthlySavingSAR > 0 ? (activeInvestmentCost / activeMonthlySavingSAR).toFixed(1) : '0.0';

  // Achieved Savings Header Card Calculations
  const totalPotentialMonthlySavingsSAR = currentUpgrades.reduce((sum, item) => sum + item.monthlySavingSAR, 0);
  const totalPotentialSavingsSAR = savingsViewMode === 'annual' ? totalPotentialMonthlySavingsSAR * 12 : totalPotentialMonthlySavingsSAR;
  const achievedSavingsSAR = savingsViewMode === 'annual' ? activeAnnualSavingSAR : activeMonthlySavingSAR;
  const savingsPercentage = totalPotentialSavingsSAR > 0 ? Math.round((achievedSavingsSAR / totalPotentialSavingsSAR) * 100) : 0;

  // COMBINED UNIFIED FINANCIAL IMPACT Across BOTH Utilities (Electricity + Water)
  const selectedElecUpgrades = elecUpgrades.filter((item) => item.selected);
  const selectedWaterUpgrades = waterUpgrades.filter((item) => item.selected);

  const combinedElecMonthlySavingsSAR = selectedElecUpgrades.reduce((sum, item) => sum + item.monthlySavingSAR, 0);
  const combinedWaterMonthlySavingsSAR = selectedWaterUpgrades.reduce((sum, item) => sum + item.monthlySavingSAR, 0);
  const totalCombinedMonthlySavingsSAR = combinedElecMonthlySavingsSAR + combinedWaterMonthlySavingsSAR;
  const totalCombinedAnnualSavingsSAR = totalCombinedMonthlySavingsSAR * 12;

  const totalCombinedInvestmentSAR =
    selectedElecUpgrades.reduce((sum, item) => sum + item.costSAR, 0) +
    selectedWaterUpgrades.reduce((sum, item) => sum + item.costSAR, 0);

  const combinedPaybackMonths =
    totalCombinedMonthlySavingsSAR > 0
      ? (totalCombinedInvestmentSAR / totalCombinedMonthlySavingsSAR).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-8">
      <div id="printable-financial-agent" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-8 transition-all">
        {/* ---------------------------------------------------- */}
        {/* 1. HEADER & UTILITY TOGGLE SWITCH                    */}
        {/* ---------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{isArabic ? 'الوكيل المالي والعائد على الاستثمار' : 'Financial ROI Agent'}</span>
              </h2>
              <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 border ${
                activeUtility === 'electricity'
                  ? 'bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-sky-100 dark:bg-sky-950/90 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
              }`}>
                {activeUtility === 'electricity' ? <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> : <Droplets className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />}
                {activeUtility === 'electricity'
                  ? (isArabic ? 'تعرفة الكهرباء (SEC)' : 'SEC Electricity Tariff')
                  : (isArabic ? 'تعرفة المياه (NWC)' : 'NWC Water Tariff')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isArabic
                ? 'حسابات العائد على الاستثمار (ROI) وفترة الاسترداد لترقيات الكهرباء والمياه، مع تحليل الشرائح والوفر المالي المجمع.'
                : 'ROI & Payback period calculators for electricity and water upgrades, tariff slab analytics, and combined utility savings.'}
            </p>
          </div>

          {/* Achieved Savings Progress Summary Widget */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5 text-right rtl:text-left">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                  {isArabic
                    ? savingsViewMode === 'monthly'
                      ? 'التوفير المحقق الشهري'
                      : 'التوفير المحقق السنوي'
                    : savingsViewMode === 'monthly'
                    ? 'ACHIEVED MONTHLY SAVING'
                    : 'ACHIEVED ANNUAL SAVING'}
                </span>
                <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                  {formatUnit(achievedSavingsSAR, 'sar', language)}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    / {formatUnit(totalPotentialSavingsSAR, 'sar', language)}
                  </span>
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black font-mono text-sm border border-emerald-500/20">
                {toLocalDigits(savingsPercentage, language)}%
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 2. DYNAMIC TARIFF SLAB BREAKDOWN (SEC vs NWC)        */}
        {/* ---------------------------------------------------- */}
        {activeUtility === 'electricity' ? (
          /* ELECTRICITY TARIFF BREAKDOWN (SEC) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>{isArabic ? 'تفبيك الشريحة والتعرفة المطبقة للكهرباء (SEC)' : 'SEC Electricity Tariff Tier Breakdown'}</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {isArabic ? 'سقف الشريحة الأولى:' : 'Tier 1 Limit:'} {toLocalDigits(6000, language)}{' '}
                {isArabic ? 'ك.و.س' : 'kWh'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-200">
                  {isArabic ? 'نسبة استهلاك الشريحة الأولى:' : 'Tier 1 Capacity Used:'}
                </span>
                <span
                  className={`font-mono ${
                    progressPercentElec >= 90
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {toLocalDigits(validKWh, language)} / {toLocalDigits(TIER1_LIMIT_KWH, language)}{' '}
                  {isArabic ? 'ك.و.س' : 'kWh'} ({toLocalDigits(progressPercentElec, language)}%)
                </span>
              </div>

              <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isExceededTier1Elec
                      ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600'
                      : isNearTier2Elec
                      ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, progressPercentElec)}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      {isArabic ? 'الشريحة الأولى (1 - 6,000 ك.و.س)' : 'Tier 1 (1 - 6,000 kWh)'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      {toLocalDigits('0.18', language)} {isArabic ? 'ر.س / ك.و.س' : 'SAR / kWh'}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        {isArabic ? 'الكمية المستهلكة:' : 'Consumption:'}
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {formatUnit(tier1KWh, 'kwh', language)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        {isArabic ? 'التكلفة:' : 'Cost SAR:'}
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatUnit(tier1Cost.toFixed(2), 'sar', language)}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-2xs space-y-2 ${
                    tier2KWh > 0
                      ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          tier2KWh > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      {isArabic ? 'الشريحة الثانية (> 6,000 ك.و.س)' : 'Tier 2 (> 6,000 kWh)'}
                    </span>
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                      {toLocalDigits('0.30', language)} {isArabic ? 'ر.س / ك.و.س (+66%)' : 'SAR / kWh (+66%)'}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        {isArabic ? 'الفائض فوق السقف:' : 'Tier Overflow:'}
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {formatUnit(tier2KWh, 'kwh', language)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        {isArabic ? 'تكلفتها المضافة:' : 'Tier 2 Cost:'}
                      </span>
                      <span
                        className={`text-base font-black font-mono ${
                          tier2KWh > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {formatUnit(tier2Cost.toFixed(2), 'sar', language)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {isExceededTier1Elec ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-rose-900 dark:text-rose-200">
                      {isArabic
                        ? `تنبيه الشريحة العليا: تجاوزت سقف الشريحة الأولى بمقدار ${toLocalDigits(tier2KWh, language)} ك.و.س!`
                        : `Warning: You have exceeded Tier 1 by ${toLocalDigits(tier2KWh, language)} kWh!`}
                    </p>
                    <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                      {isArabic
                        ? `يتم احتساب الفائض بسعر الشريحة الثانية (0.30 ر.س/ك.و.س)، وهو أعلى بنسبة 66% من تعرفة الشريحة الأولى.`
                        : `Overflow consumption is billed at Tier 2 rate (0.30 SAR/kWh), 66% higher than base tariff.`}
                    </p>
                  </div>
                </div>
              ) : isNearTier2Elec ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-amber-900 dark:text-amber-200">
                      {isArabic
                        ? `تنبيه اقتراب الشريحة الثانية: متبقي ${toLocalDigits(remainingTier1KWh, language)} ك.و.س قبل الشريحة العالية!`
                        : `Warning: Only ${toLocalDigits(remainingTier1KWh, language)} kWh away from entering Tier 2!`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    {isArabic
                      ? `استهلاكك ضمن الشريحة الأولى (0.18 ر.س/ك.و.س) بفرق ${toLocalDigits(remainingTier1KWh, language)} ك.و.س عن السقف.`
                      : `Great job: Consumption is well within Tier 1 (0.18 SAR/kWh) with ${toLocalDigits(remainingTier1KWh, language)} kWh remaining.`}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* WATER TARIFF BREAKDOWN (NWC SLABS IN m³) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span>{isArabic ? 'تفبيك شرائح استهلاك المياه الوطنية (NWC)' : 'NWC Water Consumption Slabs Breakdown'}</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {isArabic ? 'الوحدة:' : 'Unit:'} {isArabic ? 'متر مكعب (م³)' : 'Cubic Meters (m³)'}
              </span>
            </div>

            <div className="bg-sky-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-sky-200/80 dark:border-slate-700 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-200">
                  {isArabic ? 'استهلاكك المائي الشهري:' : 'Monthly Water Consumption:'}
                </span>
                <span className="font-mono text-sky-700 dark:text-sky-300 font-black text-sm">
                  {formatUnit(validM3, 'm3', language)}
                </span>
              </div>

              {/* Slabs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                {/* Slab 1 */}
                <div className={`p-3 rounded-xl border space-y-1 ${waterSlabsData.s1 > 0 ? 'bg-sky-100/80 dark:bg-sky-950/80 border-sky-300 dark:border-sky-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                  <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 block">
                    {isArabic ? 'الشريحة ١ (١-١٥ م³)' : 'Slab 1 (1-15 m³)'}
                  </span>
                  <span className="text-xs font-black text-sky-700 dark:text-sky-300 block font-mono">
                    {toLocalDigits('0.15', language)} {isArabic ? 'ر.س/م³' : 'SAR/m³'}
                  </span>
                </div>

                {/* Slab 2 */}
                <div className={`p-3 rounded-xl border space-y-1 ${waterSlabsData.s2 > 0 ? 'bg-sky-100/80 dark:bg-sky-950/80 border-sky-300 dark:border-sky-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                  <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 block">
                    {isArabic ? 'الشريحة ٢ (١٦-٣٠ م³)' : 'Slab 2 (16-30 m³)'}
                  </span>
                  <span className="text-xs font-black text-sky-700 dark:text-sky-300 block font-mono">
                    {toLocalDigits('1.00', language)} {isArabic ? 'ر.س/م³' : 'SAR/m³'}
                  </span>
                </div>

                {/* Slab 3 */}
                <div className={`p-3 rounded-xl border space-y-1 ${waterSlabsData.s3 > 0 ? 'bg-amber-100/80 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                  <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 block">
                    {isArabic ? 'الشريحة ٣ (٣١-٤٥ م³)' : 'Slab 3 (31-45 m³)'}
                  </span>
                  <span className="text-xs font-black text-amber-700 dark:text-amber-300 block font-mono">
                    {toLocalDigits('3.00', language)} {isArabic ? 'ر.س/م³' : 'SAR/m³'}
                  </span>
                </div>

                {/* Slab 4 */}
                <div className={`p-3 rounded-xl border space-y-1 ${waterSlabsData.s4 > 0 ? 'bg-rose-100/80 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                  <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 block">
                    {isArabic ? 'الشريحة ٤ (٤٦-٦٠ م³)' : 'Slab 4 (46-60 m³)'}
                  </span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-300 block font-mono">
                    {toLocalDigits('4.00', language)} {isArabic ? 'ر.س/م³' : 'SAR/m³'}
                  </span>
                </div>

                {/* Slab 5 */}
                <div className={`p-3 rounded-xl border space-y-1 col-span-2 sm:col-span-1 ${waterSlabsData.s5 > 0 ? 'bg-rose-200/80 dark:bg-rose-900/80 border-rose-400 dark:border-rose-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                  <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 block">
                    {isArabic ? 'الشريحة ٥ (> ٦٠ م³)' : 'Slab 5 (> 60 m³)'}
                  </span>
                  <span className="text-xs font-black text-rose-800 dark:text-rose-200 block font-mono">
                    {toLocalDigits('6.00', language)} {isArabic ? 'ر.س/م³' : 'SAR/m³'}
                  </span>
                </div>
              </div>

              {/* Wastewater Surcharge Note */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">
                  {isArabic ? 'رسوم الصرف الصحي المضافة (50%):' : 'Wastewater Sanitation Surcharge (50%):'}
                </span>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-300">
                  {formatUnit(waterSlabsData.wastewaterSurcharge.toFixed(2), 'sar', language)}
                </span>
              </div>

              {/* Water Active Alert Banner */}
              {isCriticalWaterTier ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-rose-900 dark:text-rose-200">
                      {isArabic
                        ? `تنبيه شريحة المياه المرتفعة: استهلاكك (${toLocalDigits(validM3, language)} م³) دخل الشريحة الرابعة (4.00 ر.س/م³)!`
                        : `Alert: High Water Tariff Slab! Consumption (${toLocalDigits(validM3, language)} m³) reached Slab 4 (4.00 SAR/m³)!`}
                    </p>
                    <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                      {isArabic
                        ? 'تثبيت مرشدات التدفق وفحص الخزانات يخفض استهلاكك إلى الشريحة الاقتصادية الأولى أو الثانية.'
                        : 'Installing flow restrictors and checking tank float valves will pull your usage down into lower slabs.'}
                    </p>
                  </div>
                </div>
              ) : isHighWaterTier ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-amber-900 dark:text-amber-200">
                      {isArabic
                        ? `تنبيه اقتراب شريحة المياه الثالثة: استهلاكك (${toLocalDigits(validM3, language)} م³) يتجاوز 30 م³ (3.00 ر.س/م³)!`
                        : `Warning: Usage (${toLocalDigits(validM3, language)} m³) exceeds 30 m³ threshold (3.00 SAR/m³)!`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    {isArabic
                      ? `استهلاكك المائي ضمن الشريحة الاقتصادية المعتدلة (${toLocalDigits(validM3, language)} م³).`
                      : `Great job: Water usage (${toLocalDigits(validM3, language)} m³) is within economical slabs.`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 3. PRESET INTERACTIVE ROI & PAYBACK UPGRADE CARDS    */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {activeUtility === 'electricity'
                    ? (isArabic ? 'توصيات ترقيات الكهرباء وحاسبة الاسترداد (ROI)' : 'Electricity Upgrades & ROI Calculator')
                    : (isArabic ? 'توصيات ترقيات المياه وحاسبة الاسترداد (ROI)' : 'Water Upgrades & ROI Calculator')}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isArabic
                  ? 'انقر على أي ترقية لتحديدها أو إلغاء تحديدها ومحاكاة التوفير المباشر في الفواتير.'
                  : 'Click any upgrade to toggle selection and simulate live combined bill savings.'}
              </p>
            </div>

            {/* Toggle Switch: Monthly vs Annual Savings View */}
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setSavingsViewMode('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  savingsViewMode === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {isArabic ? 'توفير شهري' : 'Monthly Savings'}
              </button>
              <button
                type="button"
                onClick={() => setSavingsViewMode('annual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  savingsViewMode === 'annual'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {isArabic ? 'توفير سنوي' : 'Annual Savings'}
              </button>
            </div>
          </div>

          {/* ROI Upgrade Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentUpgrades.map((rec) => {
              const paybackMonths =
                rec.paybackMonthsFixed ||
                (rec.monthlySavingSAR > 0 ? (rec.costSAR / rec.monthlySavingSAR).toFixed(1) : '0.0');
              const annualSavingSAR = rec.monthlySavingSAR * 12;

              const titleText = isArabic ? rec.titleAr : rec.titleEn;
              const descText = isArabic ? rec.descAr : rec.descEn;

              const displaySavings =
                savingsViewMode === 'monthly'
                  ? `${toLocalDigits(rec.monthlySavingSAR, language)} ${isArabic ? 'ر.س/شهر' : 'SAR/mo'}`
                  : `${toLocalDigits(annualSavingSAR, language)} ${isArabic ? 'ر.س/سنة' : 'SAR/yr'}`;

              return (
                <div
                  key={rec.id}
                  onClick={() => toggleUpgradeSelection(rec.id)}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 cursor-pointer relative ${
                    rec.selected
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          rec.tagColor || 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        🟢{' '}
                        {isArabic
                          ? `استرداد كامل خلال ${toLocalDigits(paybackMonths, language)} أشهر`
                          : `Full ROI in ${paybackMonths} Months`}
                      </span>

                      <div className="text-emerald-600 dark:text-emerald-400">
                        {rec.selected ? (
                          <CheckSquare className="w-5 h-5 fill-emerald-600 text-white" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {titleText}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {descText}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {isArabic ? 'التكلفة الأولية:' : 'Upfront Cost:'}
                      </span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                        {formatUnit(rec.costSAR, 'sar', language)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200">
                        {savingsViewMode === 'monthly'
                          ? isArabic
                            ? 'التوفير الشهري:'
                            : 'Monthly Saving:'
                          : isArabic
                          ? 'التوفير السنوي:'
                          : 'Annual Saving:'}
                      </span>
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        {displaySavings}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 4. UNIFIED FINANCIAL IMPACT CARD (COMBINED SAVINGS)   */}
        {/* ---------------------------------------------------- */}
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl border border-emerald-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/60 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-3 py-1 rounded-md border border-emerald-800/80 inline-flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? 'الملخص المالي المجمع' : 'Unified Financial Impact'}</span>
              </span>
              <h3 className="text-lg font-black text-white">
                {isArabic ? 'إجمالي التوفير للخدمات المزدوجة (كهرباء + مياه)' : 'Combined Annual & Monthly Utility Savings'}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-xs text-emerald-200 block">
                {isArabic ? 'الترقيات النشطة:' : 'Active Upgrades Selected:'}
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {toLocalDigits(selectedElecUpgrades.length, language)} {isArabic ? 'كهرباء' : 'Elec'} + {toLocalDigits(selectedWaterUpgrades.length, language)} {isArabic ? 'مياه' : 'Water'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Electricity Monthly Saving */}
            <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-500/30 space-y-1">
              <span className="text-xs text-amber-200 block font-bold flex items-center gap-1">
                {isArabic ? 'توفير الكهرباء الشهري' : 'Monthly Electricity Saving'}
              </span>
              <span className="text-xl font-black text-amber-400 font-mono block">
                {formatUnit(combinedElecMonthlySavingsSAR, 'sar', language)}
                <span className="text-xs font-normal text-amber-300"> / {isArabic ? 'شهر' : 'mo'}</span>
              </span>
            </div>

            {/* Water Monthly Saving */}
            <div className="p-4 bg-sky-950/40 rounded-2xl border border-sky-500/30 space-y-1">
              <span className="text-xs text-sky-200 block font-bold flex items-center gap-1">
                {isArabic ? 'توفير المياه الشهري' : 'Monthly Water Saving'}
              </span>
              <span className="text-xl font-black text-sky-400 font-mono block">
                {formatUnit(combinedWaterMonthlySavingsSAR, 'sar', language)}
                <span className="text-xs font-normal text-sky-300"> / {isArabic ? 'شهر' : 'mo'}</span>
              </span>
            </div>

            {/* Total Combined Annual Savings */}
            <div className="p-4 bg-emerald-950/80 rounded-2xl border border-emerald-400/40 space-y-1">
              <span className="text-xs text-emerald-200 block font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {isArabic ? 'إجمالي التوفير السنوي المجمع' : 'Total Combined Annual Savings'}
              </span>
              <span className="text-2xl font-black text-emerald-300 font-mono block">
                {formatUnit(totalCombinedAnnualSavingsSAR.toFixed(0), 'sar', language)}
                <span className="text-xs font-normal text-emerald-400"> / {isArabic ? 'سنة' : 'year'}</span>
              </span>
            </div>
          </div>

          {/* Explicit Savings Formula Banner */}
          <div className="p-3.5 bg-emerald-950/60 rounded-2xl border border-emerald-500/30 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-2 font-mono">
            <span className="text-slate-300 font-bold font-sans">
              {isArabic ? 'معادلة الأثر المالي المجمع:' : 'Unified Financial Impact Formula:'}
            </span>
            <span className="font-extrabold text-emerald-300 bg-black/30 px-3 py-1 rounded-xl border border-emerald-500/20">
              ({toLocalDigits(combinedElecMonthlySavingsSAR, language)} + {toLocalDigits(combinedWaterMonthlySavingsSAR, language)} {isArabic ? 'ر.س/شهر' : 'SAR/mo'}) × 12 = <span className="text-amber-300">{toLocalDigits(totalCombinedAnnualSavingsSAR, language)} {isArabic ? 'ر.س/سنة' : 'SAR/yr'}</span>
            </span>
          </div>

          {/* Investment & Payback row */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-300 block">{isArabic ? 'إجمالي الاستثمار الأولي المجمع:' : 'Total Combined Upfront Investment:'}</span>
              <span className="text-base font-black text-white font-mono">{formatUnit(totalCombinedInvestmentSAR, 'sar', language)}</span>
            </div>
            <div>
              <span className="text-slate-300 block">{isArabic ? 'فترة استرداد التكلفة التراكمية:' : 'Combined Investment Payback:'}</span>
              <span className="text-base font-black text-emerald-400 font-mono">{toLocalDigits(combinedPaybackMonths, language)} {isArabic ? 'أشهر' : 'Months'}</span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 5. INTERACTIVE FINANCIAL AI CHAT ASSISTANT           */}
        {/* ---------------------------------------------------- */}
        <div className="bg-slate-50 dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 space-y-6 shadow-sm print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isArabic ? 'المساعد المالي الذكي (استشارات ROI والشرائح)' : 'Financial AI Assistant (ROI & Tariffs Chat)'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isArabic
                    ? 'اسأل الذكاء الاصطناعي عن جدوى الترقيات، فترات استرداد التكلفة، أو كيفية تحسين الفاتورة'
                    : 'Ask real-time financial questions regarding payback periods, upgrade feasibility & bill savings'}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0 self-start sm:self-auto">
              {isArabic ? 'متصل وجاهز للتحليل' : 'Connected & Ready'}
            </span>
          </div>

          {/* Quick Financial Prompt Chips */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {isArabic ? 'أسئلة مالية سريعة مقترحة:' : 'Quick Financial Prompts:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {quickFinancialQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendFinancialQuestion(isArabic ? q.qAr : q.qEn, q.suggestedUpgrade)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all text-right shadow-xs flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isArabic ? q.qAr : q.qEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Display Window */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 h-80 overflow-y-auto space-y-4 shadow-inner">
            {chatMessages.map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isAgent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`space-y-2 max-w-[85%] ${isAgent ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isAgent
                          ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tr-none border border-slate-200/80 dark:border-slate-800'
                          : 'bg-emerald-600 text-white rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{isArabic ? msg.textAr : msg.textEn}</p>

                      {/* Suggested Upgrade Card Action inside Chat Reply */}
                      {msg.suggestedUpgrade && (
                        <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-700 pb-1.5">
                            <span>{isArabic ? 'ترقية استثمارية موصى بها' : 'Recommended Upgrade Option'}</span>
                            <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                              {toLocalDigits(msg.suggestedUpgrade.paybackMonthsFixed || '10', language)} {isArabic ? 'شهر استرداد' : 'mo ROI'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {isArabic ? msg.suggestedUpgrade.titleAr : msg.suggestedUpgrade.titleEn}
                          </p>
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300">
                            <span>{isArabic ? 'التكلفة:' : 'Cost:'} {formatUnit(msg.suggestedUpgrade.costSAR || 0, 'sar', language)}</span>
                            <span>{isArabic ? 'التوفير:' : 'Save:'} {formatUnit(msg.suggestedUpgrade.monthlySavingSAR || 0, 'sar', language)}/{isArabic ? 'شهر' : 'mo'}</span>
                          </div>
                          <button
                            onClick={() => handleAddSuggestedUpgradeToDashboard(msg.suggestedUpgrade!)}
                            className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'إضافة الترقية إلى حاسبة ROI مباشرة' : 'Add Card to ROI Calculator'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 px-1 block font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendFinancialQuestion(chatInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                isArabic
                  ? 'اكتب سؤالك المالي هنا (مثال: كم أسترد عند تركيب طاقة شمسية أو ترموستات؟)...'
                  : 'Ask a financial question (e.g. ROI on solar PV or smart thermostats)...'
              }
              className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-emerald-600/20 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
