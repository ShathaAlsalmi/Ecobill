import { BillRecord, HomeProfile, ThreeMonthAnalysisResult, RecommendedActionItem } from '../types';

export function calculateSavedBillsAnalytics(
  savedBills: BillRecord[],
  profile: HomeProfile | null
): ThreeMonthAnalysisResult | null {
  if (!savedBills || !Array.isArray(savedBills)) {
    return null;
  }

  // Extract valid bills with non-null consumption
  const validBills = savedBills.filter(
    (b) => b && b.extractedData && b.extractedData.electricityConsumptionKWh !== null
  );

  if (validBills.length === 0) {
    return null;
  }

  // 1. Average Monthly Consumption & Bill Amount (SAR)
  const validConsumption = validBills
    .map((b) => b.extractedData.electricityConsumptionKWh!)
    .filter((val) => typeof val === 'number' && !isNaN(val));

  const validSAR = validBills
    .map((b) => b.extractedData.billAmountSAR)
    .filter((val): val is number => val !== null && typeof val === 'number' && !isNaN(val));

  const averageKWh =
    validConsumption.length > 0
      ? Math.round(validConsumption.reduce((acc, curr) => acc + curr, 0) / validConsumption.length)
      : null;

  const averageSAR =
    validSAR.length > 0
      ? Math.round((validSAR.reduce((acc, curr) => acc + curr, 0) / validSAR.length) * 100) / 100
      : null;

  // 2. Trend Calculation (compare the most recent bill with the previous bill)
  let trend: 'Increasing' | 'Decreasing' | 'Relatively Stable' | 'Insufficient Data' =
    'Insufficient Data';
  let trendPercentage: number | null = null;
  let trendExplanation = 'More bills are needed to calculate consumption trend.';

  if (validBills.length >= 2) {
    const previousBill = validBills[validBills.length - 2].extractedData.electricityConsumptionKWh!;
    const recentBill = validBills[validBills.length - 1].extractedData.electricityConsumptionKWh!;
    
    if (previousBill > 0) {
      const rawRatio = (recentBill - previousBill) / previousBill;
      trendPercentage = Math.round(rawRatio * 1000) / 10; // e.g. +12.5 or -8.3
      const absDiffKWh = Math.abs(recentBill - previousBill);

      if (rawRatio > 0.04) {
        trend = 'Increasing';
        trendExplanation = `Your consumption increased by ${trendPercentage}% (+${absDiffKWh} kWh) compared to the previous saved bill.`;
      } else if (rawRatio < -0.04) {
        trend = 'Decreasing';
        trendExplanation = `Your consumption decreased by ${Math.abs(trendPercentage)}% (-${absDiffKWh} kWh) compared to the previous saved bill.`;
      } else {
        trend = 'Relatively Stable';
        if (trendPercentage === 0) {
          trendExplanation = 'Your consumption remained identical to the previous saved bill.';
        } else if (trendPercentage > 0) {
          trendExplanation = `Your consumption slightly increased by ${trendPercentage}% (+${absDiffKWh} kWh).`;
        } else {
          trendExplanation = `Your consumption slightly decreased by ${Math.abs(trendPercentage)}% (-${absDiffKWh} kWh).`;
        }
      }
    } else {
      trend = 'Relatively Stable';
      trendExplanation = 'Previous bill recorded 0 kWh consumption.';
    }
  } else if (validBills.length === 1) {
    trend = 'Relatively Stable';
    trendExplanation = 'Add more bills to calculate your consumption trend across billing periods.';
  }

  // 3. Highest and Lowest Consumption Months
  let highestMonth: ThreeMonthAnalysisResult['highestMonth'] = null;
  let lowestMonth: ThreeMonthAnalysisResult['lowestMonth'] = null;

  if (validBills.length > 0) {
    const sorted = [...validBills].sort(
      (a, b) =>
        (b.extractedData.electricityConsumptionKWh || 0) -
        (a.extractedData.electricityConsumptionKWh || 0)
    );

    const maxBill = sorted[0];
    const minBill = sorted[sorted.length - 1];

    highestMonth = {
      label: maxBill.extractedData.billingPeriod || `Bill #${maxBill.id.slice(-4)}`,
      period: maxBill.extractedData.billingPeriod || `Added ${new Date(maxBill.uploadedAt).toLocaleDateString()}`,
      kWh: maxBill.extractedData.electricityConsumptionKWh!,
      sar: maxBill.extractedData.billAmountSAR,
    };

    lowestMonth = {
      label: minBill.extractedData.billingPeriod || `Bill #${minBill.id.slice(-4)}`,
      period: minBill.extractedData.billingPeriod || `Added ${new Date(minBill.uploadedAt).toLocaleDateString()}`,
      kWh: minBill.extractedData.electricityConsumptionKWh!,
      sar: minBill.extractedData.billAmountSAR,
    };
  }

  // 4. Benchmark & Classification (Application Code Calculation)
  const familyMembers = profile?.home.familyMembers || 4;
  const homeSizeM2 = profile?.home.homeSizeM2 || 180;
  const appliances = profile?.appliances || [];

  // Saudi household benchmark calculation
  const benchmarkKWh = Math.round(familyMembers * 220 + homeSizeM2 * 3.5);

  let classification: 'Low' | 'Moderate' | 'High' = 'Moderate';

  if (averageKWh) {
    const ratio = averageKWh / benchmarkKWh;
    if (ratio < 0.85) {
      classification = 'Low';
    } else if (ratio <= 1.25) {
      classification = 'Moderate';
    } else {
      classification = 'High';
    }
  }

  // 5. Recommended Actions (Structured Step-by-Step Monthly Plan)
  const mostRecentBill = validBills.length > 0 ? validBills[validBills.length - 1] : null;
  const currentConsumptionKWh =
    mostRecentBill &&
    mostRecentBill.extractedData &&
    typeof mostRecentBill.extractedData.electricityConsumptionKWh === 'number'
      ? mostRecentBill.extractedData.electricityConsumptionKWh
      : averageKWh || profile?.estimatedMonthlyKWh || 1200;

  // Calculate tariff rate (SAR / kWh) upfront for step SAR savings calculations
  let tariffRate = 0.30; // standard SEC residential tariff Tier 2 (0.18 for <=6000 kWh, 0.30 for >6000 kWh)
  if (averageSAR && averageKWh && averageKWh > 0) {
    tariffRate = averageSAR / averageKWh;
  } else if (currentConsumptionKWh <= 6000) {
    tariffRate = 0.18;
  }

  const recommendedActions: RecommendedActionItem[] = [];

  // Find user appliances
  const acAppliance = appliances.find((a) => a.type.toLowerCase().includes('air conditioner'));
  const waterHeaterAppliance = appliances.find((a) => a.type.toLowerCase().includes('water heater'));
  const fridgeAppliance = appliances.find((a) => a.type.toLowerCase().includes('refrigerator'));
  const washingAppliance = appliances.find((a) => a.type.toLowerCase().includes('washing'));

  // Step 1 — Air Conditioning Optimization
  const acUnits = acAppliance?.units || Math.max(1, Math.round(homeSizeM2 / 60));
  const acHours = acAppliance?.hoursPerDay || 8;
  const acReductionPct = acAppliance ? 6 : 5;
  const acSavingsKWh = Math.round(currentConsumptionKWh * (acReductionPct / 100));
  const acSavingsSAR = Math.max(1, Math.round(acSavingsKWh * tariffRate));

  recommendedActions.push({
    id: 'step-1-ac',
    stepNumber: 1,
    stepTitle: 'Step 1 — Air Conditioning',
    stepTitleAr: 'الخطوة ١ — تكييف الهواء',
    actionWhat: acAppliance
      ? `Set thermostat to 24°C on your ${acUnits} AC unit(s) (~${acHours} hrs/day usage), clean filters monthly, and activate auto-shutoff timers in unoccupied rooms.`
      : `Maintain thermostat setting at 24°C, clean air filters bi-weekly, and turn off cooling when leaving rooms in your ${homeSizeM2} m² residence.`,
    actionWhatAr: acAppliance
      ? `اضبط ثرموستات وحدات التكييف الـ ${acUnits} على 24° مئوية (~${acHours} ساعات/يوم)، ونظف الفلاتر شهرياً وفعّل مؤقت الإيقاف التلقائي في الغرف الشاغرة.`
      : `حافظ على إعداد الثرموستات عند 24° مئوية، ونظف فلاتر الهواء كل أسبوعين، وافصل التبريد عند مغادرة الغرف في منزلك بمساحة ${homeSizeM2} م².`,
    actionWhy: 'Air conditioning represents over 60% of summer electricity consumption in Saudi households. Setting temperatures to 24°C optimizes compressor duty cycles.',
    actionWhyAr: 'يمثل التكييف أكثر من 60% من استهلاك الكهرباء الصيفي في المنازل السعودية. ضبط الحرارة على 24° مئوية يحسن دورات تشغيل الضغط.',
    estimatedReductionPercent: acReductionPct,
    estimatedSavingsKWh: acSavingsKWh,
    estimatedSavingsSAR: acSavingsSAR,
    category: 'Air Conditioning',
  });

  // Step 2 — Water Heating & High-Consumption Appliances
  const applianceNames: string[] = [];
  if (waterHeaterAppliance) applianceNames.push('Water Heater');
  if (fridgeAppliance) applianceNames.push('Refrigerator');
  if (washingAppliance) applianceNames.push('Washing Machine');

  const highApplianceText =
    applianceNames.length > 0
      ? applianceNames.join(', ')
      : 'water heater, refrigerator, and laundry equipment';

  const highApplianceReductionPct = 4;
  const highApplianceSavingsKWh = Math.round(
    currentConsumptionKWh * (highApplianceReductionPct / 100)
  );
  const highApplianceSavingsSAR = Math.max(1, Math.round(highApplianceSavingsKWh * tariffRate));

  recommendedActions.push({
    id: 'step-2-water-heating',
    stepNumber: 2,
    stepTitle: 'Step 2 — Water Heating & Laundry',
    stepTitleAr: 'الخطوة ٢ — تسخين المياه والغسيل',
    actionWhat: waterHeaterAppliance
      ? `Configure smart timer switches for your water heater to operate 2 hours before peak use instead of continuous 24-hour heating, and run washing machine with full cold-water loads.`
      : `Install digital timers on water heaters to operate 2 hours before peak use instead of 24/7 heating, and run laundry equipment with full loads for your ${familyMembers}-person household.`,
    actionWhatAr: waterHeaterAppliance
      ? `قم بتشغيل مؤقت ذكي لسخان المياه ليعمل ساعتين قبل الاستخدام بدلاً من التسخين المستمر، وشغّل غسالة الملابس بحمولات كاملة بماء بارد.`
      : `اضبط مؤقتات رقمية على سخانات المياه لتعمل ساعتين قبل الاستخدام بدلاً من التسخين على مدار 24 ساعة، وشغّل الغسالة بحمولات كاملة لأسرتك المكونة من ${familyMembers} أفراد.`,
    actionWhy: `Continuous heating elements and unoptimized motor cycles in ${highApplianceText} create heavy continuous baseline power draws.`,
    actionWhyAr: 'عناصر التسخين المستمر والمحركات غير المحسنة تستهلك طاقة أساسية عالية دون انقطاع.',
    estimatedReductionPercent: highApplianceReductionPct,
    estimatedSavingsKWh: highApplianceSavingsKWh,
    estimatedSavingsSAR: highApplianceSavingsSAR,
    category: 'Water Heating',
  });

  // Step 3 — Lighting Optimization
  const lightingReductionPct = 3;
  const lightingSavingsKWh = Math.round(currentConsumptionKWh * (lightingReductionPct / 100));
  const lightingSavingsSAR = Math.max(1, Math.round(lightingSavingsKWh * tariffRate));

  recommendedActions.push({
    id: 'step-3-lighting',
    stepNumber: 3,
    stepTitle: 'Step 3 — Lighting Optimization',
    stepTitleAr: 'الخطوة ٣ — تحسين الإضاءة',
    actionWhat: `Replace halogen and incandescent bulbs with high-efficiency LED fixtures across your ${homeSizeM2} m² home, clean lamp covers, and maximize natural morning daylight.`,
    actionWhatAr: `استبدل مصابيح الهالوجين والمتوهجة بمصابيح LED عالية الكفاءة في جميع أنحاء منزلك بمساحة ${homeSizeM2} م²، ونظف أغطية الإضاءة، واستفد من الضوء الطبيعي.`,
    actionWhy: 'LED lighting consumes up to 80% less power than conventional bulbs and radiates significantly less heat, indirectly reducing air conditioning loads.',
    actionWhyAr: 'تستهلك إضاءة LED طاقة أقل بنسبة تصل إلى 80% مقارنة بالمصابيح التقليدية وتصدر حرارة أقل بكثير مما يقلل أحمال التكييف.',
    estimatedReductionPercent: lightingReductionPct,
    estimatedSavingsKWh: lightingSavingsKWh,
    estimatedSavingsSAR: lightingSavingsSAR,
    category: 'Lighting Optimization',
  });

  // Step 4 — Smart Home & Automation
  const smartReductionPct = 3;
  const smartSavingsKWh = Math.round(currentConsumptionKWh * (smartReductionPct / 100));
  const smartSavingsSAR = Math.max(1, Math.round(smartSavingsKWh * tariffRate));

  recommendedActions.push({
    id: 'step-4-smarthome',
    stepNumber: 4,
    stepTitle: 'Step 4 — Smart Home & Automation',
    stepTitleAr: 'الخطوة ٤ — المنزل الذكي والأتمتة',
    actionWhat: `Install smart power strips, occupancy motion sensors in hallways/bathrooms, and programmable smart plugs to schedule automatically and eliminate phantom standby power.`,
    actionWhatAr: `قم بتركيب توصيلات كهربائية ذكية ومستشعرات حركة في الممرات والمقابس الذكية المبرمجة لإلغاء استهلاك الاستعداد الوهمي.`,
    actionWhy: 'Phantom loads from idling entertainment electronics, chargers, and unmanaged devices continuously drain 3%–5% of total household electricity 24 hours a day.',
    actionWhyAr: 'الأحمال الوهمية من الأجهزة الإلكترونية والأجهزة الخاملة تستهلك بانتظام 3%–5% من إجمالي كهرباء المنزل على مدار 24 ساعة.',
    estimatedReductionPercent: smartReductionPct,
    estimatedSavingsKWh: smartSavingsKWh,
    estimatedSavingsSAR: smartSavingsSAR,
    category: 'Smart Home / Automation',
  });

  // Step 5 — Thermal Insulation & Sealing
  const insulationReductionPct = 3;
  const insulationSavingsKWh = Math.round(currentConsumptionKWh * (insulationReductionPct / 100));
  const insulationSavingsSAR = Math.max(1, Math.round(insulationSavingsKWh * tariffRate));

  recommendedActions.push({
    id: 'step-5-insulation',
    stepNumber: 5,
    stepTitle: 'Step 5 — Insulation & Weather Stripping',
    stepTitleAr: 'الخطوة ٥ — العزل وسد الفجوات',
    actionWhat: `Apply weatherstripping seals to exterior doors and window frames, install solar heat-reflective films, and draw heavy thermal curtains over sun-exposed windows.`,
    actionWhatAr: `ضع شرائط مانعة للتسرب على الأبواب الخارجية وإطارات النوافذ، وركّب أفلام عاكسة للحرارة الشمسية، وأغلق الستائر الحرارية على النوافذ المعرضة للشمس.`,
    actionWhy: 'Air infiltration and solar radiation through uninsulated windows increase indoor temperature, forcing cooling systems to work harder during afternoon hours.',
    actionWhyAr: 'تسرب الهواء والإشعاع الشمسي عبر النوافذ غير المعزولة يرفع الحرارة الداخلية مما يجبر أجهزة التبريد على العمل بجهد أكبر.',
    estimatedReductionPercent: insulationReductionPct,
    estimatedSavingsKWh: insulationSavingsKWh,
    estimatedSavingsSAR: insulationSavingsSAR,
    category: 'Insulation & Sealing',
  });

  // Step 6 — Refrigerator & Kitchen Efficiency
  const kitchenReductionPct = 2;
  const kitchenSavingsKWh = Math.round(currentConsumptionKWh * (kitchenReductionPct / 100));
  const kitchenSavingsSAR = Math.max(1, Math.round(kitchenSavingsKWh * tariffRate));

  recommendedActions.push({
    id: 'step-6-kitchen',
    stepNumber: 6,
    stepTitle: 'Step 6 — Refrigerator & Kitchen Efficiency',
    stepTitleAr: 'الخطوة ٦ — كفاءة الثلاجة والمطبخ',
    actionWhat: `Set refrigerator temperature to 3°C–5°C and freezer to -18°C, vacuum condenser coils twice annually, and ensure at least 10 cm wall clearance for optimal cooling.`,
    actionWhatAr: `اضبط درجة حرارة الثلاجة بين 3–5 درجات مئوية والمجمد على -18 درجة مئوية، ونظف مكثف الثلاجة مرتين سنوياً، واترك مسافة 10 سم عن الجدار.`,
    actionWhy: 'Refrigerators run 24/7; blocked rear coils or worn door gaskets force compressor motors to run continuously without auto-pacing.',
    actionWhyAr: 'تعمل الثلاجات على مدار الساعة؛ الاتساخ خلف الثلاجة أو تلف الموانع المطاطية يجبر المحرك على العمل المستمر.',
    estimatedReductionPercent: kitchenReductionPct,
    estimatedSavingsKWh: kitchenSavingsKWh,
    estimatedSavingsSAR: kitchenSavingsSAR,
    category: 'Kitchen & Appliances',
  });

  // Additional Step 7 if household is large (>200 m² or >= 5 family members)
  if (homeSizeM2 > 200 || familyMembers >= 5) {
    const extraReductionPct = 2;
    const extraSavingsKWh = Math.round(currentConsumptionKWh * (extraReductionPct / 100));
    const extraSavingsSAR = Math.max(1, Math.round(extraSavingsKWh * tariffRate));
    recommendedActions.push({
      id: 'step-7-peakload',
      stepNumber: 7,
      stepTitle: 'Step 7 — Load Shifting & Solar Readiness',
      stepTitleAr: 'الخطوة ٧ — إدارة الأحمال والجاهزية للطاقة الشمسية',
      actionWhat: `Shift high-wattage appliance usage (ovens, dishwashers) to off-peak morning hours and assess rooftop solar PV readiness for your ${homeSizeM2} m² property.`,
      actionWhatAr: `انقل استخدام الأجهزة عالية الاستهلاك (كالأفران وغسالات الأطباق) إلى ساعات الصباح الخفيفة وقيّم جاهزية السطح للطاقة الشمسية لمنزلك بمساحة ${homeSizeM2} م².`,
      actionWhy: 'Staggering heavy power loads prevents peak demand pressure and optimizes overall energy efficiency in larger residential properties.',
      actionWhyAr: 'توزيع الأحمال الكهربائية الكبيرة يمنع ضغط الذروة ويحسن كفاءة الطاقة العامة.',
      estimatedReductionPercent: extraReductionPct,
      estimatedSavingsKWh: extraSavingsKWh,
      estimatedSavingsSAR: extraSavingsSAR,
      category: 'Peak Load Management',
    });
  }

  // 6. Potential Savings & Target Calculations (Application Code Math)
  const potentialReductionPercent = recommendedActions.reduce(
    (acc, step) => acc + step.estimatedReductionPercent,
    0
  );

  const savedKWhPerMonth = recommendedActions.reduce(
    (acc, step) => acc + step.estimatedSavingsKWh,
    0
  );

  const savedSARPerMonth = recommendedActions.reduce(
    (acc, step) => acc + step.estimatedSavingsSAR,
    0
  );

  const expectedNewConsumptionKWh = Math.max(0, currentConsumptionKWh - savedKWhPerMonth);
  const recommendedTargetKWh = expectedNewConsumptionKWh;

  // Progress toward target percentage calculation
  const progressTowardTargetPercent = Math.min(
    100,
    Math.max(0, Math.round((recommendedTargetKWh / currentConsumptionKWh) * 100))
  );

  // Goal status calculation: comparing current consumption against recommended target
  let goalStatus: 'On track' | 'Above target' | 'Below target' = 'On track';
  if (currentConsumptionKWh <= recommendedTargetKWh) {
    goalStatus = 'Below target';
  } else if (currentConsumptionKWh <= Math.round(recommendedTargetKWh * 1.05)) {
    goalStatus = 'On track';
  } else {
    goalStatus = 'Above target';
  }

  const averageDailyKWh =
    currentConsumptionKWh > 0 ? Math.round((currentConsumptionKWh / 30) * 10) / 10 : null;

  const latestBillAmountSAR = mostRecentBill?.extractedData.billAmountSAR ?? averageSAR;
  const latestBillingPeriod = mostRecentBill?.extractedData.billingPeriod ?? null;

  return {
    averageKWh,
    averageSAR,
    averageDailyKWh,
    latestBillAmountSAR,
    latestBillingPeriod,
    trend,
    trendPercentage,
    trendExplanation,
    highestMonth,
    lowestMonth,
    classification,
    benchmarkKWh,
    currentConsumptionKWh,
    recommendedTargetKWh,
    expectedNewConsumptionKWh,
    potentialReductionPercent,
    savedKWhPerMonth,
    savedSARPerMonth,
    progressTowardTargetPercent,
    goalStatus,
    recommendedActions,
  };
}
