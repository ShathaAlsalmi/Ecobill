import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Circle,
  Zap,
  Droplets,
  TrendingDown,
  ListTodo,
  Bot,
  User as UserIcon,
  Check,
} from 'lucide-react';
import { Language, toLocalDigits, formatUnit } from '../translations';

export interface PlanTaskItem {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  utilityType: 'electricity' | 'water';
  estimatedSavingSAR: number;
  unitSaving: number; // kWh or m³
  reductionPercent: number; // e.g. 12%
  actionDescAr: string;
  actionDescEn: string;
  completed: boolean;
  source: 'preset' | 'ai_chat' | 'user';
  addedAt: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  textAr: string;
  textEn: string;
  timestamp: string;
  suggestedTask?: {
    titleAr: string;
    titleEn: string;
    categoryAr: string;
    categoryEn: string;
    utilityType: 'electricity' | 'water';
    estimatedSavingSAR: number;
    unitSaving: number;
    reductionPercent: number;
    actionDescAr: string;
    actionDescEn: string;
  };
}

interface AdvisorAgentProps {
  language: Language;
  userName?: string;
  city?: string;
  familyMembers?: number;
  activeUtilityType?: 'electricity' | 'water';
  onUtilityTypeChange?: (utility: 'electricity' | 'water') => void;
}

export const AdvisorAgent: React.FC<AdvisorAgentProps> = ({
  language,
  userName = 'Layan',
  city = 'Riyadh',
  activeUtilityType = 'electricity',
  onUtilityTypeChange,
}) => {
  const isArabic = language === 'ar';
  const [activeUtility, setActiveUtility] = useState<'electricity' | 'water'>(activeUtilityType);

  useEffect(() => {
    setActiveUtility(activeUtilityType);
  }, [activeUtilityType]);

  const handleUtilitySwitch = (type: 'electricity' | 'water') => {
    setActiveUtility(type);
    if (onUtilityTypeChange) {
      onUtilityTypeChange(type);
    }
  };

  // Dynamic Monthly Action Plan items state
  const [tasks, setTasks] = useState<PlanTaskItem[]>([
    // Electricity (SEC) - 8 Categorized Actionable Cards
    {
      id: 'task-e1',
      titleAr: 'ضبط حرارة المكيف عند 24°م ونظافة الفلاتر',
      titleEn: 'AC Thermostat Calibration & Filter Maintenance',
      categoryAr: 'التبريد والتكييف',
      categoryEn: 'AC Optimization',
      utilityType: 'electricity',
      estimatedSavingSAR: 85,
      unitSaving: 472,
      reductionPercent: 14,
      actionDescAr: 'ضبط حرارة التكييف على 24°م بانتظام وتنظيف الفلاتر شهرياً لتقليل جهد الضواغط وخفض الاستهلاك.',
      actionDescEn: 'Maintain 24°C thermostat setting and clean filters monthly to slash compressor thermal load.',
      completed: true,
      source: 'preset',
      addedAt: '2026-08-01',
    },
    {
      id: 'task-e2',
      titleAr: 'عزل النوافذ والستائر الحرارية ومانع تسرب الأبواب',
      titleEn: 'Thermal Window Film & Door Draft Sealing',
      categoryAr: 'العزل الحراري',
      categoryEn: 'Thermal Insulation',
      utilityType: 'electricity',
      estimatedSavingSAR: 65,
      unitSaving: 361,
      reductionPercent: 11,
      actionDescAr: 'تركيب مانع التسرب السفلي للأبواب والأفلام الحرارية للنوافذ لتقليل التبادل الحراري بـ 30%.',
      actionDescEn: 'Install rubber door bottom sweeps and thermal window tint to prevent cool air leakage and heat gain.',
      completed: false,
      source: 'preset',
      addedAt: '2026-08-02',
    },
    {
      id: 'task-e3',
      titleAr: 'استغلال الطاقة الشمسية السطحية (Solar PV ROI)',
      titleEn: 'Rooftop Solar PV System Installation ROI',
      categoryAr: 'عائد الطاقة الشمسية',
      categoryEn: 'Solar ROI',
      utilityType: 'electricity',
      estimatedSavingSAR: 140,
      unitSaving: 777,
      reductionPercent: 24,
      actionDescAr: 'تركيب منظومة أผواح شمسية بقدرة 5 كيلوواط للربط مع شبكة الكهرباء واستبدال الشريحة المرتفعة.',
      actionDescEn: 'Install a 5kW rooftop solar panel system connected to grid to displace high SEC tier consumption.',
      completed: false,
      source: 'preset',
      addedAt: '2026-08-03',
    },
    {
      id: 'task-e4',
      titleAr: 'مؤقتات ذكية لمقابس التلفزيون والأجهزة',
      titleEn: 'Smart Timer Plugs for Standby Electronics',
      categoryAr: 'المقابس الذكية',
      categoryEn: 'Smart Timers',
      utilityType: 'electricity',
      estimatedSavingSAR: 30,
      unitSaving: 166,
      reductionPercent: 5,
      actionDescAr: 'قطع التغذية الذاتية عن الشاشات والمنصات ليلاً باستخدام مقابس التوقيت الذكي لمنع الحمل الخفي.',
      actionDescEn: 'Automate zero-vampire power schedules for media centers and consoles using smart timer plugs.',
      completed: false,
      source: 'preset',
      addedAt: '2026-08-04',
    },
    {
      id: 'task-e5',
      titleAr: 'ترقية كامل إضاءة البيت إلى LED عالية الكفاءة',
      titleEn: 'Complete Household LED Lighting Retrofit',
      categoryAr: 'ترقية الإضاءة',
      categoryEn: 'LED Upgrade',
      utilityType: 'electricity',
      estimatedSavingSAR: 40,
      unitSaving: 222,
      reductionPercent: 7,
      actionDescAr: 'استبدال لمبات الهالوجين الساخنة بلمبات LED كفاءة A+ لتقليل الحمل الحراري والكهربائي.',
      actionDescEn: 'Retrofit halogen and fluorescent bulbs with A-rated LED lamps to reduce lighting heat and energy.',
      completed: true,
      source: 'preset',
      addedAt: '2026-08-05',
    },
    {
      id: 'task-e6',
      titleAr: 'إعدادات الثلاجة والمطبخ الاقتصادية',
      titleEn: 'Eco Refrigerator & Kitchen Power Bounds',
      categoryAr: 'المطبخ والأجهزة',
      categoryEn: 'Kitchen Appliances',
      utilityType: 'electricity',
      estimatedSavingSAR: 35,
      unitSaving: 194,
      reductionPercent: 6,
      actionDescAr: 'ترك مسافة 10 سم خلف الثلاجة وضبط التبريد على الدرجة المتوسطة لمنع عمل المحرك المتواصل.',
      actionDescEn: 'Maintain 10cm ventilation space behind fridge and calibrate eco cooling thresholds.',
      completed: true,
      source: 'preset',
      addedAt: '2026-08-06',
    },
    {
      id: 'task-e7',
      titleAr: 'جدولة السخان الكهربائي أثناء الشتاء والصيف',
      titleEn: 'Water Heater Eco Timer Schedule',
      categoryAr: 'السخانات الذكية',
      categoryEn: 'Water Heater Schedule',
      utilityType: 'electricity',
      estimatedSavingSAR: 55,
      unitSaving: 305,
      reductionPercent: 9,
      actionDescAr: 'تشغيل السخان عبر تايمر ذكي لمدة ساعتين قبل الاستخدام فقط بدلاً من العمل المستمر 24/7.',
      actionDescEn: 'Operate water heater on a 2-hour pre-use timer schedule instead of leaving it powered 24/7.',
      completed: false,
      source: 'preset',
      addedAt: '2026-08-07',
    },
    {
      id: 'task-e8',
      titleAr: 'جدولة الغسالة والمجفف خارج أوقات الذروة',
      titleEn: 'Off-Peak Laundry & Heat Shift',
      categoryAr: 'جدولة الأحمال',
      categoryEn: 'Load Shift',
      utilityType: 'electricity',
      estimatedSavingSAR: 45,
      unitSaving: 250,
      reductionPercent: 8,
      actionDescAr: 'تشغيل دورات الغسيل العالية في الفترات المسائية المعتدلة لتجنب رفع حرارة البيت نهاراً.',
      actionDescEn: 'Run high-wattage washing machine and dryer loads during cool evening hours.',
      completed: false,
      source: 'preset',
      addedAt: '2026-08-08',
    },

    // Water (NWC) - 8 Categorized Actionable Cards
    {
      id: 'task-w1',
      titleAr: 'تركيب مرشدات تدفق المياه المعتمدة',
      titleEn: 'Certified Water Flow Aerator Installation',
      categoryAr: 'مرشدات المياه',
      categoryEn: 'Water Aerators',
      utilityType: 'water',
      estimatedSavingSAR: 45,
      unitSaving: 14,
      reductionPercent: 16,
      actionDescAr: 'تثبيت مرشدات كفاءة الطاقة والمياه المعتمدة لتقليل التدفق من 12 لتر/دقيقة إلى 5 لتر/دقيقة.',
      actionDescEn: 'Fit certified flow aerators on all faucets to restrict flow from 12L/min down to 5L/min effortlessly.',
      completed: true,
      source: 'preset',
      addedAt: '2026-08-01',
    },
    {
      id: 'task-w2',
      titleAr: 'فحص عزل وتسريب الخزان الأرضي والعلوي',
      titleEn: 'Ground & Roof Tank Seal & Leak Audit',
      categoryAr: 'فحوصات الخزانات',
      categoryEn: 'Tank Leak Audit',
      utilityType: 'water',
      estimatedSavingSAR: 60,
      unitSaving: 19,
      reductionPercent: 20,
      actionDescAr: 'فحص العوامات والصمامات لمنع الفائض الخفي الذي يتسبب بالقفز لشريحة المياه العليا.',
      actionDescEn: 'Audit tank float valves and seals to eliminate invisible underground seepage and overflows.',
      completed: false,
      source: 'preset',
      addedAt: '2026-08-02',
    },
    {
      id: 'task-w3',
      titleAr: 'نظام الري بالتنقيط والمؤقت الذكي للحديقة',
      titleEn: 'Smart Timer Drip Irrigation',
      categoryAr: 'الري والحدائق',
      categoryEn: 'Smart Drip Irrigation',
      utilityType: 'water',
      estimatedSavingSAR: 50,
      unitSaving: 15,
      reductionPercent: 15,
      actionDescAr: 'جدولة الري بالتنقيط في الساعات الصباحية المبكرة لمنع تبخير المياه في حرارة الصيف.',
      actionDescEn: 'Shift garden watering to early morning drip irrigation cycles to stop heat evaporation losses.',
      completed: false,
      source: 'preset',
      addedAt: '2026-08-03',
    },
    {
      id: 'task-w4',
      titleAr: 'رؤوس الدش الموفرة ومؤقت الاستحمام 5 دقائق',
      titleEn: 'Eco Showerheads & 5-Min Shower Timers',
      categoryAr: 'الدش الاقتصادي',
      categoryEn: 'Eco Showerheads',
      utilityType: 'water',
      estimatedSavingSAR: 40,
      unitSaving: 12,
      reductionPercent: 12,
      actionDescAr: 'استبدال رؤوس الدش التقليدية برؤوس توفير تدفق 7 لتر/دقيقة وتقليل وقت الاستحمام إلى 5 دقائق.',
      actionDescEn: 'Replace standard showerheads with 7L/min restricted nozzles and adopt 5-minute shower habits.',
      completed: true,
      source: 'preset',
      addedAt: '2026-08-04',
    },
    {
      id: 'task-w5',
      titleAr: 'تركيب صمامات السيفون المزدوجة الموفرة',
      titleEn: 'Dual-Flush Toilet Converter Valves',
      categoryAr: 'صنابير ومرافق المياه',
      categoryEn: 'Toilet Valves',
      utilityType: 'water',
      estimatedSavingSAR: 35,
      unitSaving: 10,
      reductionPercent: 10,
      actionDescAr: 'ترقية صناديق الطرد لتوفير خيار التدفق النصفي والتخلص من هدر المياه الكبير عند كل استخدام.',
      actionDescEn: 'Convert single-flush toilets to dual-volume mechanisms to cut flushing volume by 40%.',
      completed: false,
      source: 'preset',
      addedAt: '2026-08-05',
    },
    {
      id: 'task-w6',
      titleAr: 'تشغيل غسالة الملابس بحمولة كاملة فقط',
      titleEn: 'Full-Load Only Laundry Cycles',
      categoryAr: 'الأجهزة والمطابخ',
      categoryEn: 'Laundry Efficiency',
      utilityType: 'water',
      estimatedSavingSAR: 25,
      unitSaving: 8,
      reductionPercent: 8,
      actionDescAr: 'تجميع الملابس وتطوير عادة تشغيل الغسالة بملء السعة لتوفير عشرات الليترات أسبوعياً.',
      actionDescEn: 'Consolidate laundry batches to run full drum capacity only, saving tens of liters weekly.',
      completed: true,
      source: 'preset',
      addedAt: '2026-08-06',
    },
    {
      id: 'task-w7',
      titleAr: 'تركيب منظم ضغط شبكة المياه المنزلية',
      titleEn: 'Smart Main Pressure Reducing Valve',
      categoryAr: 'ضغط الشبكة',
      categoryEn: 'Pressure Regulation',
      utilityType: 'water',
      estimatedSavingSAR: 30,
      unitSaving: 9,
      reductionPercent: 9,
      actionDescAr: 'ضبط ضغط محبس المياه عند 2.5 بار لتقليل الإجهاد الهيدروليكي على المواسير والصنابير.',
      actionDescEn: 'Calibrate main line pressure regulator to 2.5 bar to eliminate hydraulic strain and splash waste.',
      completed: false,
      source: 'preset',
      addedAt: '2026-08-07',
    },
    {
      id: 'task-w8',
      titleAr: 'عزل أنابيب المياه ومضخة التدوير الذكية',
      titleEn: 'Pipe Thermal Lagging & Smart Recirculation',
      categoryAr: 'عزل المواسير',
      categoryEn: 'Pipe Lagging',
      utilityType: 'water',
      estimatedSavingSAR: 20,
      unitSaving: 6,
      reductionPercent: 6,
      actionDescAr: 'عزل مواسير المياه الساخنة لتقليل فترة انتظار وصول الماء الساخن وتجنب تصريف المياه الباردة.',
      actionDescEn: 'Insulate hot water pipes to prevent cold water drainage while waiting for hot water.',
      completed: false,
      source: 'preset',
      addedAt: '2026-08-08',
    },
  ]);

  // Form for custom task
  const [newCustomTaskTitle, setNewCustomTaskTitle] = useState('');
  const [newCustomTaskSavingSAR, setNewCustomTaskSavingSAR] = useState(25);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      textAr: `أهلاً بك يا ${userName}! أنا مستشار الترشيد الذكي لخدمات المنزل في مدينة ${city}. يمكنني إجابتك على أي استفسار حول تخفيض فاتورة الكهرباء والمياه، وإضافة خطط ترشيد فورية إلى جدول عملك الشهري.`,
      textEn: `Welcome ${userName}! I am your AI Efficiency Advisor for household utilities in ${city}. Ask me any question to lower your electricity or water bill, and I will automatically add action steps directly to your Monthly Efficiency Plan.`,
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

  const filteredTasks = tasks.filter((t) => t.utilityType === activeUtility);

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const totalCount = filteredTasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalAchievedSavingsSAR = filteredTasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.estimatedSavingSAR, 0);

  const totalPotentialSavingsSAR = filteredTasks.reduce(
    (sum, t) => sum + t.estimatedSavingSAR,
    0
  );

  const toggleTaskCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTaskTitle.trim()) return;

    const newTask: PlanTaskItem = {
      id: `custom-${Date.now()}`,
      titleAr: newCustomTaskTitle,
      titleEn: newCustomTaskTitle,
      categoryAr: activeUtility === 'electricity' ? 'مخصص' : 'مخصص مياه',
      categoryEn: 'Custom Action',
      utilityType: activeUtility,
      estimatedSavingSAR: Number(newCustomTaskSavingSAR) || 20,
      unitSaving: activeUtility === 'electricity' ? 110 : 7,
      reductionPercent: 5,
      actionDescAr: `تطبيق الإجراء المخصص: ${newCustomTaskTitle}`,
      actionDescEn: `Execute custom step: ${newCustomTaskTitle}`,
      completed: false,
      source: 'user',
      addedAt: new Date().toISOString().split('T')[0],
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewCustomTaskTitle('');
  };

  // Preset Questions
  const quickQuestionsElec = [
    {
      qAr: 'كيف أخفض تكلفة التكييف في الصيف؟',
      qEn: 'How do I cut AC electricity costs during summer?',
      answerAr: 'لتقليل استهلاك المكيف بنسبة تصل إلى 30%: 1) اضبط درجة الحرارة عند 24° مئوية بدلاً من 18°. 2) نظّف الفلاتر شهرياً. 3) أغلق الفجوات تحت الأبواب والنوافذ.',
      answerEn: 'To cut AC power by up to 30%: 1) Set thermostat at 24°C instead of 18°C. 2) Clean filters monthly. 3) Seal door & window gaps.',
      suggestedTask: {
        titleAr: 'ضبط درجة حرارة المكيف عند 24° مئوية وإغلاق الفجوات',
        titleEn: 'Keep AC at 24°C and seal room gaps',
        categoryAr: 'التبريد والتكييف',
        categoryEn: 'Cooling',
        utilityType: 'electricity' as const,
        estimatedSavingSAR: 65,
        unitSaving: 360,
        reductionPercent: 11,
        actionDescAr: 'الالتزام بدرجة 24°م وإغلاق أبواب الغرف المكيفة لمنع تسرب الهواء البارد وحفظ عمل الضواغط.',
        actionDescEn: 'Maintain 24°C bounds and keep air-conditioned room doors closed to eliminate thermal loss.',
      },
    },
    {
      qAr: 'كيف أتجنب الانتقال لشريحة SEC الثانية (30 هللة)؟',
      qEn: 'How to avoid jumping to SEC Tier 2 (0.30 SAR)?',
      answerAr: 'تتغير التعرفة من 18 هللة إلى 30 هللة عند تجاوز 6,000 ك.و.س شهرياً. ينصح بتشغيل الأجهزة كثيفة الاستهلاك (كالمجفف والغسالة) في الساعات المعتدلة، واستخدام الإضاءة والمقابس الذكية.',
      answerEn: 'SEC tariff shifts from 0.18 SAR to 0.30 SAR above 6,000 kWh/mo. Shift heavy loads to cooler hours and schedule LED/smart plug timers.',
      suggestedTask: {
        titleAr: 'جدولة تشغيل الأجهزة العالية خارج أوقات الذروة الحرارية',
        titleEn: 'Schedule high-power appliance cycles off-peak',
        categoryAr: 'جدولة الاستهلاك',
        categoryEn: 'Load Scheduling',
        utilityType: 'electricity' as const,
        estimatedSavingSAR: 80,
        unitSaving: 440,
        reductionPercent: 14,
        actionDescAr: 'تشغيل أجهزة التغسيل والكي في الأوقات الليلة والمعتدلة لمنع تضخم الحمل الحراري اليومي.',
        actionDescEn: 'Run high-wattage laundry and dishwashing equipment during cooler off-peak hours.',
      },
    },
  ];

  const quickQuestionsWater = [
    {
      qAr: 'كيف أكشف تسريبات الخزانات الأرضية والمياه؟',
      qEn: 'How do I detect hidden water leaks in underground tanks?',
      answerAr: 'افحص الخزان الأرضي بإغلاق المأخذ الرئيسي وتدوين قراءة العداد لمدة 4 ساعات. إذا تحرك العداد، يوجد تسريب خفي يحتاج تركيب مستشعر وعزل معتمد.',
      answerEn: 'Check the ground tank by shutting the main outlet and observing the meter for 4 hours. If it moves, a underground leak exists requiring sensor installation.',
      suggestedTask: {
        titleAr: 'إجراء اختبار الـ 4 ساعات لقياس تسريب الخزان الأرضي',
        titleEn: 'Conduct 4-hour static meter test for ground tank leak detection',
        categoryAr: 'تسريبات ومرافق',
        categoryEn: 'Leaks',
        utilityType: 'water' as const,
        estimatedSavingSAR: 50,
        unitSaving: 15,
        reductionPercent: 16,
        actionDescAr: 'إغلاق المحبس الرئيسي ومراقبة قراءة العداد للتأكد من خلو الشبكة والخزانات من التسريبات الخفية.',
        actionDescEn: 'Shut main line valves and monitor meter stillness for 4 hours to confirm zero leakage.',
      },
    },
    {
      qAr: 'ما هي فوائد مرشدات تدفق المياه على الفاتورة؟',
      qEn: 'What are the savings from water aerators on taps & showers?',
      answerAr: 'تركيب المرشدات المعتمدة من كفاءة يقلل معدل التدفق من 12 ليتر/دقيقة إلى 5 ليتر/دقيقة دون إضعاف الضغط، مما يقلل فاتورة المياه الوطنية بنسبة 35%.',
      answerEn: 'Certified water aerators reduce tap flow from 12 L/min down to 5 L/min without sacrificing pressure, lowering NWC bills by 35%.',
      suggestedTask: {
        titleAr: 'تركيب مرشدات تدفق مياه معتمدة في كافة المغاسل',
        titleEn: 'Install certified water aerators across all faucets',
        categoryAr: 'مرشدات المياه',
        categoryEn: 'Aerators',
        utilityType: 'water' as const,
        estimatedSavingSAR: 35,
        unitSaving: 11,
        reductionPercent: 12,
        actionDescAr: 'تثبيت الأقراص المعتمدة من هيئة كفاءة في دورات المياه والمطبخ للترشيد المباشر.',
        actionDescEn: 'Fit certified flow regulators on kitchen and bathroom outlets for immediate savings.',
      },
    },
  ];

  const quickQuestions = activeUtility === 'electricity' ? quickQuestionsElec : quickQuestionsWater;

  const handleSendQuestion = (text: string, presetTask?: ChatMessage['suggestedTask']) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      textAr: text,
      textEn: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let replyAr = '';
    let replyEn = '';
    let autoTask = presetTask;

    if (!autoTask) {
      if (activeUtility === 'electricity') {
        replyAr = `تحليل المستشار الذكي: توصية مخصصة بناءً على استهلاكك (${city}): يفضل جدولة تشغيل الأجهزة ذات الحمل الحراري العالي وضبط منظم الحرارة الذكي للحد من القفز للشريحة الأعلى. تم إضافة خطوة العمل الموصى بها تلقائياً لجدول الترشيد الشهري.`;
        replyEn = `AI Advisor Analysis for ${city}: Based on your profile, scheduling heavy load appliances and utilizing smart temperature bounds will keep your consumption in Tier 1. Recommended step has been appended to your Monthly Plan.`;
        autoTask = {
          titleAr: `تطبيق التوصية الذكية: ${text.slice(0, 45)}...`,
          titleEn: `Smart Recommendation: ${text.slice(0, 45)}...`,
          categoryAr: 'استشارة الذكاء الاصطناعي',
          categoryEn: 'AI Advisor Tip',
          utilityType: 'electricity',
          estimatedSavingSAR: 30,
          unitSaving: 165,
          reductionPercent: 7,
          actionDescAr: `تطبيق الخطوة الموصى بها من المحادثة الذكية: ${text}`,
          actionDescEn: `Execute smart AI advice: ${text}`,
        };
      } else {
        replyAr = `تحليل المستشار الذكي للمياه: فحص تسريبات الخزانات وتثبيت صمامات الترشيد في دورات المياه يضمن البقاء ضمن الشريحة الاقتصادية لشركة المياه الوطنية (NWC). تم إضافة التوصية لجدولك الشهري.`;
        replyEn = `NWC Water Advisor Analysis: Inspecting tank floats and fitting shower regulators secures your usage within lower NWC tariff tiers. Added directly to your Monthly Action Plan.`;
        autoTask = {
          titleAr: `تطبيق خطوة الترشيد المائي: ${text.slice(0, 45)}...`,
          titleEn: `Water Efficiency Action: ${text.slice(0, 45)}...`,
          categoryAr: 'استشارة المياه الذكية',
          categoryEn: 'Water AI Tip',
          utilityType: 'water',
          estimatedSavingSAR: 35,
          unitSaving: 11,
          reductionPercent: 10,
          actionDescAr: `تطبيق الخطوة الموصى بها مائياً: ${text}`,
          actionDescEn: `Execute smart water advice: ${text}`,
        };
      }
    } else {
      const match = quickQuestions.find((q) => q.qAr === text || q.qEn === text);
      if (match) {
        replyAr = match.answerAr;
        replyEn = match.answerEn;
      } else {
        replyAr = isArabic ? 'توصية ترشيد مخصصة تم إضافتها لجدول عملك.' : 'Custom efficiency advice appended to your monthly plan.';
        replyEn = replyAr;
      }
    }

    const agentMsg: ChatMessage = {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      textAr: replyAr,
      textEn: replyEn,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedTask: autoTask,
    };

    setChatMessages((prev) => [...prev, userMsg, agentMsg]);
    setChatInput('');

    if (autoTask && !tasks.some((t) => t.titleAr === autoTask?.titleAr || t.titleEn === autoTask?.titleEn)) {
      const newPlanItem: PlanTaskItem = {
        id: `ai-appended-${Date.now()}`,
        titleAr: autoTask.titleAr,
        titleEn: autoTask.titleEn,
        categoryAr: autoTask.categoryAr,
        categoryEn: autoTask.categoryEn,
        utilityType: autoTask.utilityType,
        estimatedSavingSAR: autoTask.estimatedSavingSAR,
        unitSaving: autoTask.unitSaving,
        reductionPercent: autoTask.reductionPercent,
        actionDescAr: autoTask.actionDescAr,
        actionDescEn: autoTask.actionDescEn,
        completed: false,
        source: 'ai_chat',
        addedAt: new Date().toISOString().split('T')[0],
      };
      setTasks((prev) => [newPlanItem, ...prev]);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Main Card Container */}
      <div id="printable-advisor-plan" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-8 transition-colors">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{isArabic ? 'الخطة الشهرية للترشيد' : 'Monthly Efficiency Action Plan'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                {activeUtility === 'electricity' ? (isArabic ? 'الكهرباء' : 'Electricity') : (isArabic ? 'المياه' : 'Water')}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isArabic
                ? 'خطوات عمل تطبيقية مصممة خصيصاً لمنزلك لخفض الاستهلاك وتحقيق التوفير المالي المستهدف.'
                : 'Custom action steps designed for your household to slash usage and achieve target savings.'}
            </p>
          </div>

          {/* Action Plan Progress Summary Widget & PDF export */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5 text-right rtl:text-left">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                  {isArabic ? 'التوفير المحقق' : 'Achieved Monthly Saving'}
                </span>
                <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                  {formatUnit(totalAchievedSavingsSAR, 'sar', language)}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    / {formatUnit(totalPotentialSavingsSAR, 'sar', language)}
                  </span>
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black font-mono text-sm border border-emerald-500/20">
                {progressPercentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-bold">
            <span>{isArabic ? 'نسبة إنجاز خطوات الخطة' : 'Monthly Completion Status'}</span>
            <span>
              {toLocalDigits(completedCount, language)} / {toLocalDigits(totalCount, language)}{' '}
              {isArabic ? 'خطوة مكتملة' : 'steps completed'}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* RESTORED STEP CARDS LIST (STEP NUMBER, TITLE, CATEGORY, IMPACT BOX)  */}
        {/* -------------------------------------------------------------------- */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
              {isArabic
                ? 'لا توجد خطوات حالياً في الخطة. اسأل المستشار الذكي أدناه لإضافة خطوات!'
                : 'No active steps in plan. Ask the AI Advisor below to generate recommendations!'}
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
                  task.completed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left Side: Step Number & Title, Category Badge, Recommended Action text */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleTaskCompleted(task.id)}
                        className="mt-1 text-emerald-600 dark:text-emerald-400 cursor-pointer shrink-0 hover:scale-110 transition-transform"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white dark:text-slate-900" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>
                      <div className="space-y-1.5 min-w-0">
                        <h3 className={`text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                          {isArabic
                            ? `الخطوة ${toLocalDigits(index + 1, 'ar')} — ${task.titleAr}`
                            : `Step ${index + 1} — ${task.titleEn}`}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold border border-slate-200 dark:border-slate-700">
                            {isArabic ? `الفئة: ${task.categoryAr}` : `Category: ${task.categoryEn}`}
                          </span>
                          {task.source === 'ai_chat' && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black flex items-center gap-1 border border-purple-200 dark:border-purple-800">
                              <Sparkles className="w-3 h-3" />
                              {isArabic ? 'مولد بالذكاء الاصطناعي' : 'AI Generated'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recommended Action block */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                      <span className="font-extrabold text-slate-900 dark:text-white block">
                        {isArabic ? '💡 الإجراء الموصى به:' : '💡 Recommended Action:'}
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {isArabic ? task.actionDescAr : task.actionDescEn}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Estimated Impact Box (3 Metrics) & Delete Action */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 shrink-0 w-full lg:w-72">
                    <div className="w-full p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                        <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{isArabic ? 'الأثر التقديري' : 'Estimated Impact'}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60 text-center">
                        {/* 1) Reduction % */}
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 block uppercase">
                            {isArabic ? 'نسبة الخفض' : 'REDUCTION'}
                          </span>
                          <span className="text-sm font-black font-mono text-slate-900 dark:text-white block">
                            ~{toLocalDigits(task.reductionPercent || 8, language)}%
                          </span>
                        </div>

                        {/* 2) Energy/Water Saved */}
                        <div className="space-y-0.5 border-x border-emerald-200/60 dark:border-emerald-800/60 px-1">
                          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 block uppercase">
                            {isArabic ? 'توفير الوحدة' : 'UNITS SAVED'}
                          </span>
                          <span className="text-xs font-black font-mono text-slate-900 dark:text-white block truncate">
                            ~{toLocalDigits(task.unitSaving, language)} {activeUtility === 'electricity' ? (isArabic ? 'ك.و.س' : 'kWh') : (isArabic ? 'م³' : 'm³')}
                          </span>
                        </div>

                        {/* 3) Cost Saved */}
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 block uppercase">
                            {isArabic ? 'توفير مالي' : 'COST SAVING'}
                          </span>
                          <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-300 block truncate">
                            ~{formatUnit(task.estimatedSavingSAR, 'sar', language)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 cursor-pointer print:hidden self-end"
                      title={isArabic ? 'حذف الخطوة' : 'Delete Step'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
          {isArabic
            ? 'ملاحظة: الحسابات التقديرية بناءً على ملف المنزل وبيانات الفاتورة.'
            : 'Estimated calculations based on household profile and bill data.'}
        </div>

        {/* Add Custom Step Form */}
        <form onSubmit={handleAddCustomTask} className="flex flex-col sm:flex-row gap-2 pt-2 print:hidden">
          <input
            type="text"
            value={newCustomTaskTitle}
            onChange={(e) => setNewCustomTaskTitle(e.target.value)}
            placeholder={
              isArabic
                ? 'أضف خطوة ترشيد مخصصة للخطة الشهرية (مثلاً: إغلاق ستائر الصالة)...'
                : 'Add a custom monthly action item (e.g. Close living room curtains)...'
            }
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 dark:text-white"
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" dir="ltr">
              <span className="text-slate-400 font-bold text-[11px]">{isArabic ? 'وفر:' : 'SAR:'}</span>
              <button
                type="button"
                onClick={() => setNewCustomTaskSavingSAR(Math.max(5, newCustomTaskSavingSAR - 5))}
                className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center font-bold text-xs font-mono text-emerald-600 dark:text-emerald-400">
                {toLocalDigits(newCustomTaskSavingSAR, language)}
              </span>
              <button
                type="button"
                onClick={() => setNewCustomTaskSavingSAR(newCustomTaskSavingSAR + 5)}
                className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isArabic ? 'إضافة' : 'Add Item'}</span>
            </button>
          </div>
        </form>

        {/* -------------------------------------------------------------------- */}
        {/* INTERACTIVE AI CHAT SECTION                                          */}
        {/* -------------------------------------------------------------------- */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-500" />
              <span>{isArabic ? 'محادثة المستشار الذكي' : 'AI Advisor Chat'}</span>
            </h3>
            <span className="text-[11px] font-extrabold text-emerald-400 bg-teal-950/50 px-2.5 py-1 rounded-full border border-teal-500/40">
              {isArabic ? 'تضيف الخطوات تلقائياً للخطة' : 'Auto-appends steps to plan'}
            </span>
          </div>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 font-bold self-center">
              {isArabic ? 'أسئلة مقترحة:' : 'Quick Prompts:'}
            </span>
            {quickQuestions.map((qq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendQuestion(isArabic ? qq.qAr : qq.qEn, qq.suggestedTask)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isArabic ? qq.qAr : qq.qEn}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-4 sm:p-5 space-y-4 max-h-[350px] overflow-y-auto border border-slate-800">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'agent' && (
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{isArabic ? msg.textAr : msg.textEn}</p>
                  
                  {msg.suggestedTask && (
                    <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          {isArabic
                            ? `تمت إضافة الخطوة للخطة: "${msg.suggestedTask.titleAr}"`
                            : `Added step to plan: "${msg.suggestedTask.titleEn}"`}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 shrink-0">
                        +{msg.suggestedTask.estimatedSavingSAR} SAR/mo
                      </span>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block text-right rtl:text-left font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion(chatInput)}
              placeholder={
                isArabic
                  ? 'اكتب سؤالك لمستشار الترشيد (مثلاً: كيف أمنع هدر المياه في الخزانات؟)...'
                  : 'Ask the AI Advisor a custom efficiency question...'
              }
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
            <button
              type="button"
              onClick={() => handleSendQuestion(chatInput)}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>{isArabic ? 'إرسال' : 'Send'}</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
