export type Language = 'en' | 'ar';

export const unitsMap = {
  en: {
    kwh: 'kWh',
    kwhDay: 'kWh/day',
    kwhMonth: 'kWh/month',
    m3: 'm³',
    m3Month: 'm³/month',
    m2: 'm²',
    sar: 'SAR',
    sarMonth: 'SAR/month',
    sarKwh: 'SAR/kWh',
    sarM3: 'SAR/m³',
    rms: 'Rms',
    acs: 'ACs',
    units: 'Units',
    qty: 'qty',
    hrsDay: 'hrs/day',
  },
  ar: {
    kwh: 'ك.و.س',
    kwhDay: 'ك.و.س/يوم',
    kwhMonth: 'ك.و.س/شهر',
    m3: 'م³',
    m3Month: 'م³/شهر',
    m2: 'م²',
    sar: 'ر.س',
    sarMonth: 'ر.س/شهر',
    sarKwh: 'ر.س/ك.و.س',
    sarM3: 'ر.س/م³',
    rms: 'غرف',
    acs: 'مكيفات',
    units: 'وحدات',
    qty: 'وحدة',
    hrsDay: 'ساعات/يوم',
  }
};

export function cleanNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return '';
    if (Number.isInteger(value)) return String(value);
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    return String(rounded);
  }
  const str = String(value).trim();
  if (!str) return '';
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    const num = Number(str);
    if (!isNaN(num) && isFinite(num)) {
      if (Number.isInteger(num)) return String(num);
      const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
      return String(rounded);
    }
  }
  return str;
}

export function toLocalDigits(value: number | string | null | undefined, _lang?: Language): string {
  if (value === null || value === undefined) return '';
  return cleanNumber(value);
}

export type UnitType = 'kwh' | 'kwhDay' | 'kwhMonth' | 'm3' | 'm3Month' | 'm2' | 'sar' | 'sarMonth' | 'sarKwh' | 'sarM3' | 'rms' | 'acs' | 'units' | 'hrsDay' | 'qty';

export function formatUnit(value: number | string, unitKey: UnitType, lang: Language): string {
  const numStr = toLocalDigits(value, lang);
  const unitText = unitsMap[lang][unitKey] || '';
  return `${numStr} ${unitText}`.trim();
}

export const translations = {
  en: {
    // Top Bar & Navigation
    brandName: 'EcoBill',
    brandTagline: 'Smart Electricity Management',
    navProduct: 'Product',
    navSolutions: 'Solutions',
    navPricing: 'Pricing',
    navSupport: 'Support',
    btnGetStarted: 'Get Started',
    btnGetStartedFree: 'Get Started Free',
    btnViewDemo: 'View Demo',
    authTitleSignUp: 'Create Your EcoBill Account',
    authTitleLogin: 'Welcome Back to EcoBill',
    authSubtitleSignUp: 'Get instant access to AI energy tracking and 3D digital twin simulation.',
    authSubtitleLogin: 'Sign in to access your saved home profile and bill insights.',
    labelFullName: 'Full Name',
    labelEmail: 'Email Address',
    labelPassword: 'Password',
    placeholderFullName: 'e.g. Sarah Jenkins',
    placeholderEmail: 'name@example.com',
    placeholderPassword: '••••••••',
    btnSignUp: 'Sign Up & Get Started',
    btnLogin: 'Sign In & Continue',
    btnLogOut: 'Log Out',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    switchToLogin: 'Sign In',
    switchToSignUp: 'Sign Up',
    navDashboard: 'Dashboard',
    navElectricityBill: '2. My Bills',
    navSettings: '1. Settings',
    navDigitalTwin: '3. Digital Twin',
    navBenchmarking: '4. Benchmarking',

    // Header & Hero
    heroTitle: 'EcoBill',
    heroBadgeTagline: '• SMART ENERGY MANAGEMENT • BUILT FOR HOMES',
    heroTagline: 'Understand your energy. Make smarter decisions.',
    heroSubtitle: 'Personalized energy insights for your home.',
    heroMainHeading: 'The smart workspace for home energy optimization',
    heroSubtitleLong: 'AI-powered energy insights, automatic bill OCR tracking, and interactive 3D digital twin simulation to optimize your home power consumption and save up to 30% monthly.',
    secureData: '100% Private & Secure Household Data',

    // Settings Page
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage your profile, household configuration, and preferences.',
    aboutYouTitle: 'About You',
    aboutYouSubtitle: 'Personalize your account and contact details',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g. Sarah Jenkins',
    contactLabel: 'Email or Phone Number',
    contactPlaceholder: 'e.g. sarah@example.com or +1 555-0192',
    contactNote: 'Used to send your monthly energy saving reports',

    aboutHomeTitle: 'About Your Home',
    aboutHomeSubtitle: 'Household dimensions directly affect HVAC & baseline loads',
    familyMembersLabel: 'Number of Family Members',
    familyMembersNote: 'People residing under the same roof',
    homeSizeLabel: 'Home Size (m²)',
    homeSizePlaceholder: 'e.g. 95',
    homeSizeNote: 'Total interior living area in square meters',
    cityLabel: 'City / Residence',
    cityNote: 'Used for regional energy benchmarking and GASTAT comparison',
    floorsLabel: 'Number of Floors',
    floorsNote: 'Number of floors or levels in your home',
    floorSingle: 'Floor',
    floorsPlural: 'Floors',

    // Digital Twin Simulation Studio
    digitalTwinTitle: '3D Home Energy Digital Twin',
    digitalTwinSubtitle: 'Interactive 3D Simulation & What-If Energy Studio',
    resetView: 'Reset View',
    toggleRoof: 'Toggle Roof',
    dayNightMode: 'Day/Night',
    presetScenarios: 'Preset Scenarios',
    ecoModeScenario: 'Eco Savings (-30%)',
    summerPeakScenario: 'Saudi Summer Peak',
    heavyACScenario: 'High AC Load',
    normalBaselineScenario: 'Default Baseline',
    studioControlPanel: 'Energy Simulation Studio',
    acTempControl: 'AC Setpoint Temperature',
    acHoursControl: 'AC Daily Operating Hours',
    lightingTypeControl: 'Lighting Type',
    lightingLed: 'LED Efficient',
    lightingHalogen: 'Standard Halogen',
    insulationControl: 'Thermal Wall & Window Insulation',
    insulationGood: 'Thermal Insulated (Double Glass)',
    insulationPoor: 'Uninsulated',
    liveSimulatedOutput: 'Live Simulated Impact',
    simulatedDailyKWh: 'Simulated Daily',
    simulatedMonthlyKWh: 'Simulated Monthly',
    simulatedCostSAR: 'Simulated Monthly Cost',
    savingsVsBaseline: 'Estimated Net Monthly Savings',

    appliancesTitle: 'Your Electrical Appliances',
    appliancesSubtitle: 'List key household devices to calculate your digital twin baseline',
    totalDevices: 'Total Devices:',
    applianceNumber: 'Appliance',
    applianceType: 'Appliance Type',
    numberOfUnits: 'Number of Units',
    usageHoursPerDay: 'Usage Hours/Day',
    addAnotherAppliance: 'Add Another Appliance',
    removeAppliance: 'Remove',
    applianceNote: 'You can update appliances anytime later in settings',
    powerDraw: 'power draw',
    qty: 'qty',

    saveProfileBtn: 'Save Settings',
    savingBtn: 'Saving Settings...',
    profileSavedSuccess: 'Settings saved successfully!',

    // Profile Success View
    setupComplete: 'Setup Complete',
    profileCreated: 'Home Profile Created!',
    welcomeMessage: 'Welcome aboard, {name}. Your household energy digital twin parameters have been safely initialized.',
    editProfileData: 'Edit Profile Data',
    passportTitle: 'Profile Information',
    householdId: 'Household ID',
    profileVerified: 'Profile Verified',
    resident: 'Resident',
    property: 'Property',
    area: 'Area',
    familyMembersCount: 'Family Members',
    estConsumption: 'Est. Consumption',
    perDay: '/ day',
    monthlyBaseline: 'monthly baseline',
    configuredAppliances: 'Configured Appliances',
    unitsCount: 'units',
    unitCount: 'unit',
    hrsDay: 'hrs/day',
    nextStageReady: 'Next Stage Ready',
    nextStageSub: 'Your profile parameters are saved in state for upcoming Bill Upload & What-If simulations.',
    updateParameters: 'Update Parameters',

    // Electricity Bill Page
    billPageTitle: 'My Bills',
    billPageSubtitle: 'Upload and manage your electricity (SEC) and water (NWC) bills',
    addBillBtn: 'Add New Bill',
    uploadBillCardTitle: 'Upload Bill',
    uploadBillCardSub: 'Upload a PDF or image of your bill to extract consumption data',
    dragDropText: 'Drag and drop your bill file here, or click to browse',
    supportedFormats: 'Supports PDF, JPG, PNG (Max 10MB)',
    ocrParser: 'Simulated Bill OCR Parser',
    billDate: 'Bill Date',
    consumptionKWh: 'Consumption (kWh)',
    totalAmountSAR: 'Total Amount (SAR)',
    notesLabel: 'Notes / Location',
    saveBillBtn: 'Save Bill Record',
    noBillsSaved: 'No bills saved yet',
    myBillsTitle: 'My Saved Bills',
    deleteConfirm: 'Are you sure you want to delete this bill?',

    // Dashboard Page
    dashboardTitle: 'Dashboard',
    consumptionHistoryTitle: 'My Consumption History',
    consumptionHistorySub: 'Electricity consumption (kWh) over your saved electricity bills',
    noBillsDashboard: 'No saved bills found. Upload your first bill to view your history chart and personalized savings plan.',
    uploadFirstBillBtn: '+ Upload First Bill',
    recommendedPlanTitle: 'Recommended Monthly Plan',
    personalizedActionsTitle: 'Personalized Actions & Smart Recommendations',
    actionStepsTitle: 'Action Steps & Recommendations',
    estimatedImpactTitle: 'Estimated Impact',
    estReduction: 'ESTIMATED REDUCTION (%)',
    estEnergySaving: 'ESTIMATED ENERGY SAVING (kWh/month)',
    estCostSaving: 'ESTIMATED COST SAVING (SAR/month)',
    currentConsumption: 'Current Consumption',
    recommendedTarget: 'Recommended Target',
    potentialReduction: 'Potential Reduction',
    monthlyGoalProgress: 'Monthly Goal Progress Indicator',
    progressTowardTarget: 'Progress Toward Target',

    // Appliance Type Names
    applianceAirConditioner: 'Air Conditioner',
    applianceRefrigerator: 'Refrigerator',
    applianceTelevision: 'Television',
    applianceWashingMachine: 'Washing Machine',
    applianceDishwasher: 'Dishwasher',
    applianceWaterHeater: 'Water Heater',
    applianceLighting: 'Lighting',
    applianceOther: 'Other',

    // General
    kWhMonth: 'kWh/month',
    sarMonth: 'SAR/month',
    kwh: 'kWh',
    sar: 'SAR',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  ar: {
    // Top Bar & Navigation
    brandName: 'EcoBill',
    brandTagline: 'الإدارة الذكية للكهرباء',
    navProduct: 'المنتج',
    navSolutions: 'الحلول',
    navPricing: 'الأسعار',
    navSupport: 'الدعم',
    btnGetStarted: 'ابدأ الآن',
    btnGetStartedFree: 'ابدأ مجاناً',
    btnViewDemo: 'عرض توضيحي',
    authTitleSignUp: 'إنشاء حساب جديد في إيكوبيل',
    authTitleLogin: 'مرحباً بك مجدداً في إيكوبيل',
    authSubtitleSignUp: 'احصل على وصول مباشر لتحليلات الطاقة والمحاكاة ثلاثية الأبعاد.',
    authSubtitleLogin: 'سجّل دخولك للوصول إلى بيانات منزلك وتحليلات الاستهلاك.',
    labelFullName: 'الاسم الكامل',
    labelEmail: 'البريد الإلكتروني',
    labelPassword: 'كلمة المرور',
    placeholderFullName: 'مثال: محمد العتيبي',
    placeholderEmail: 'name@example.com',
    placeholderPassword: '••••••••',
    btnSignUp: 'إنشاء حساب والبدء',
    btnLogin: 'تسجيل الدخول والمتابعة',
    btnLogOut: 'تسجيل الخروج',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    switchToLogin: 'تسجيل الدخول',
    switchToSignUp: 'إنشاء حساب',
    navDashboard: 'لوحة التحكم',
    navElectricityBill: '٢. فواتيري',
    navSettings: '١. الإعدادات',
    navDigitalTwin: '3. التوأم الرقمي',
    navBenchmarking: '4. مقارنة الأداء',

    // Header & Hero
    heroTitle: 'EcoBill',
    heroBadgeTagline: '• إدارة الطاقة الذكية • مصمم للمنازل',
    heroTagline: 'افهم استهلاك الطاقة. واتخذ قرارات أذكى.',
    heroSubtitle: 'رؤى وتحليلات مخصصة لاستطاعة واستهلاك منزلك.',
    heroMainHeading: 'افهم استهلاك الطاقة، واتخذ قرارات أذكى.',
    heroSubtitleLong: 'تحليلات الذكاء الاصطناعي، تتبع الفواتير تلقائياً، ومحاكاة تفاعلية ثلاثية الأبعاد للتوأم الرقمي لتقليل استهلاك الكهرباء وتوفير حتى 30% شهرياً.',
    secureData: 'بيانات منزلية آمنة وخاصة 100%',

    // Settings Page
    settingsTitle: 'الإعدادات',
    settingsSubtitle: 'إدارة الملف الشخصي، إعدادات المنزل، وتفضيلات النظام.',
    aboutYouTitle: 'معلوماتك الشخصية',
    aboutYouSubtitle: 'تخصيص بيانات الحساب والتواصل الخاصة بك',
    fullNameLabel: 'الاسم الكامل',
    fullNamePlaceholder: 'مثال: سارة أحمد',
    contactLabel: 'البريد الإلكتروني أو رقم الهاتف',
    contactPlaceholder: 'مثال: sarah@example.com أو 0501234567',
    contactNote: 'تستخدم لإرسال تقارير التوفير الشهيرة للطاقة',

    aboutHomeTitle: 'تفاصيل المنزل',
    aboutHomeSubtitle: 'تؤثر مساحة المنزل وعدد الأفراد مباشرة على استهلاك التكييف والأحمال الأساسية',
    familyMembersLabel: 'عدد أفراد الأسرة',
    familyMembersNote: 'الأفراد المقيمون بنفس المنزل',
    homeSizeLabel: 'مساحة المنزل (م²)',
    homeSizePlaceholder: 'مثال: 95',
    homeSizeNote: 'إجمالي المساحة الداخلية بالمتر المربع',
    cityLabel: 'المدينة أو مكان الإقامة',
    cityNote: 'تستخدم لمقارنة استهلاك الطاقة مع متوسط المدينة والهيئة العامة للإحصاء',
    floorsLabel: 'عدد الطوابق / الأدوار',
    floorsNote: 'عدد الأدوار أو الطوابق المبنية في عقارك السكني',
    floorSingle: 'طابق',
    floorsPlural: 'طوابق',

    // Digital Twin Simulation Studio
    digitalTwinTitle: 'التوأم الرقمي للطاقة المنزلية (ثلاثي الأبعاد)',
    digitalTwinSubtitle: 'محاكاة تفاعلية ثلاثية الأبعاد ومختبر سيناريوهات استهلاك الطاقة',
    resetView: 'إعادة ضبط المنظور',
    toggleRoof: 'إظهار / إخفاء السقف',
    dayNightMode: 'النهار / الليل',
    presetScenarios: 'السيناريوهات الجاهزة',
    ecoModeScenario: 'وضع التوفير الفائق (-30%)',
    summerPeakScenario: 'ذروة الصيف السعودي',
    heavyACScenario: 'حمل تكييف مرتفع',
    normalBaselineScenario: 'الاستهلاك القياسي المعتاد',
    studioControlPanel: 'استوديو محاكاة الطاقة',
    acTempControl: 'درجة حرارة ضبط المكيفات',
    acHoursControl: 'ساعات التشغيل اليومية للمكيفات',
    lightingTypeControl: 'نوع الإضاءة المستخدمة',
    lightingLed: 'إضاءة LED موفرة للطاقة',
    lightingHalogen: 'إضاءة هالوجين تقليدية',
    insulationControl: 'العزل الحراري للجدران والنوافذ',
    insulationGood: 'معزول حرارياً (زجاج مزدوج)',
    insulationPoor: 'غير معزول حرارياً',
    liveSimulatedOutput: 'نتائج المحاكاة المباشرة',
    simulatedDailyKWh: 'الاستهلاك اليومي المحاكى',
    simulatedMonthlyKWh: 'الاستهلاك الشهري المحاكى',
    simulatedCostSAR: 'التكلفة الشهرية المحاكاة',
    savingsVsBaseline: 'صافي التوفير الشهري المتوقع',

    appliancesTitle: 'الأجهزة الكهربائية بالمنزل',
    appliancesSubtitle: 'حدد الأجهزة الكهربائية الرئيسية لحساب الاستهلاك التقديري بدقة',
    totalDevices: 'إجمالي الأجهزة:',
    applianceNumber: 'جهاز رقم',
    applianceType: 'نوع الجهاز',
    numberOfUnits: 'عدد الوحدات',
    usageHoursPerDay: 'ساعات الاستخدام/يوم',
    addAnotherAppliance: 'إضافة جهاز آخر',
    removeAppliance: 'حذف',
    applianceNote: 'يمكنك تحديث قائمة الأجهزة في أي وقت من الإعدادات',
    powerDraw: 'سحب الطاقة',
    qty: 'وحدة',

    saveProfileBtn: 'حفظ الإعدادات',
    savingBtn: 'جاري حفظ الإعدادات...',
    profileSavedSuccess: 'تم حفظ الإعدادات بنجاح!',

    // Profile Success View
    setupComplete: 'اكتمل الإعداد',
    profileCreated: 'تم إنشاء ملف المنزل بنجاح!',
    welcomeMessage: 'مرحباً بك، {name}. تم تهيئة بيانات استهلاك الطاقة المنزلي بنجاح.',
    editProfileData: 'تعديل بيانات الملف',
    passportTitle: 'معلومات الحساب',
    householdId: 'معرف المنزل',
    profileVerified: 'ملف موثق',
    resident: 'الساكن',
    property: 'المنزل',
    area: 'المساحة',
    familyMembersCount: 'أفراد الأسرة',
    estConsumption: 'الاستهلاك التقديري',
    perDay: '/ يوم',
    monthlyBaseline: 'الاستهلاك الشهري الأساسي',
    configuredAppliances: 'الأجهزة المهيأة',
    unitsCount: 'وحدات',
    unitCount: 'وحدة',
    hrsDay: 'ساعات/يوم',
    nextStageReady: 'المرحلة التالية جاهزة',
    nextStageSub: 'تم حفظ بياناتك للتحليل ورفع الفواتير وشبه المحاكاة.',
    updateParameters: 'تحديث البيانات',

    // Electricity Bill Page
    billPageTitle: 'فواتيري',
    billPageSubtitle: 'رفع وإدارة فواتير الكهرباء والمياه الخاصة بك',
    addBillBtn: 'إضافة فاتورة جديدة',
    uploadBillCardTitle: 'رفع فاتورة جديدة',
    uploadBillCardSub: 'قم برفع ملف PDF أو صورة للفاتورة لاستخراج بيانات الاستهلاك تلقائياً',
    dragDropText: 'اسحب وأسقط ملف الفاتورة هنا، أو انقر للاختيار',
    supportedFormats: 'يدعم ملفات PDF, JPG, PNG (بحد أقصى 10 ميجابايت)',
    ocrParser: 'محلل الفواتير التلقائي',
    billDate: 'تاريخ الفاتورة',
    consumptionKWh: 'الاستهلاك (ك.و.س)',
    totalAmountSAR: 'المبلغ الإجمالي (ر.س)',
    notesLabel: 'ملاحظات وتفاصيل الموقع',
    saveBillBtn: 'حفظ الفاتورة',
    noBillsSaved: 'لم يتم حفظ أي فواتير بعد',
    myBillsTitle: 'فواتيري المسجلة',
    deleteConfirm: 'هل أنت تأكد من رغبتك في حذف هذه الفاتورة؟',

    // Dashboard Page
    dashboardTitle: 'لوحة التحكم',
    consumptionHistoryTitle: 'سجل استهلاكي الشهري',
    consumptionHistorySub: 'استهلاك الكهرباء بالكيلوواط/ساعة عبر الفواتير المحفوظة',
    noBillsDashboard: 'لا توجد فواتير محفوظة. قم برفع فاتورتك الأولى لعرض الرسم البياني وخطة التوفير المخصصة.',
    uploadFirstBillBtn: '+ رفع الفاتورة الأولى',
    recommendedPlanTitle: 'الخطة الشهرية الموصى بها',
    personalizedActionsTitle: 'الإجراءات والتوصيات المخصصة',
    actionStepsTitle: 'خطوات العمل والتوصيات',
    estimatedImpactTitle: 'الأثر التقديري',
    estReduction: 'نسبة الخفض التقديرية (٪)',
    estEnergySaving: 'التوفير التقديري بالطاقة (ك.و.س/شهر)',
    estCostSaving: 'التوفير المالي التقديري (ر.س/شهر)',
    currentConsumption: 'الاستهلاك الحالي',
    recommendedTarget: 'الهدف الموصى به',
    potentialReduction: 'نسبة التخفيض المحتملة',
    monthlyGoalProgress: 'مؤشر التقدم نحو الهدف الشهري',
    progressTowardTarget: 'التقدم نحو الهدف',

    // Appliance Type Names
    applianceAirConditioner: 'مكيف هواء',
    applianceRefrigerator: 'ثلاجة',
    applianceTelevision: 'تلفزيون',
    applianceWashingMachine: 'غسالة ملابس',
    applianceDishwasher: 'غسالة أطباق',
    applianceWaterHeater: 'سخان مياه',
    applianceLighting: 'إضاءة',
    applianceOther: 'أخرى',

    // General
    kWhMonth: 'ك.و.س/شهر',
    sarMonth: 'ر.س/شهر',
    kwh: 'ك.و.س',
    sar: 'ر.س',
    edit: 'تعديل',
    delete: 'حذف',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
  },
};

export function getTranslatedApplianceType(type: string, lang: Language): string {
  const t = translations[lang];
  switch (type) {
    case 'Air Conditioner':
      return t.applianceAirConditioner;
    case 'Refrigerator':
      return t.applianceRefrigerator;
    case 'Television':
      return t.applianceTelevision;
    case 'Washing Machine':
      return t.applianceWashingMachine;
    case 'Dishwasher':
      return t.applianceDishwasher;
    case 'Water Heater':
      return t.applianceWaterHeater;
    case 'Lighting':
      return t.applianceLighting;
    default:
      return t.applianceOther;
  }
}
