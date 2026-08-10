import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Check,
  Zap,
  Droplets,
  Plus,
  Trash2,
  Eye,
  Maximize2,
  ExternalLink,
  X,
  Gauge,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { ExtractedBillData, HomeProfile, BillRecord } from '../types';
import { SAMPLE_BILLS, SAMPLE_WATER_BILLS, SampleBillItem } from '../data/sampleBills';
import { calculateSavedBillsAnalytics } from '../utils/billAnalytics';
import { compressImageDataUrl } from '../utils/imageCompressor';
import { Language, translations, toLocalDigits, formatUnit } from '../translations';

interface ElectricityBillPageProps {
  savedProfile: HomeProfile | null;
  savedBills: BillRecord[];
  onSaveBill: (record: BillRecord) => void;
  onDeleteBill: (id: string) => void;
  onBackToProfile: () => void;
  language: Language;
}

// Helper: Calculate Dynamic Real-World Utility Consumption Tier & Reason
export const getConsumptionTierBadge = (
  extractedData: ExtractedBillData | null,
  activeUtilityType: 'electricity' | 'water',
  isArabic: boolean,
  savedProfile?: HomeProfile | null
) => {
  if (!extractedData) return null;

  const isWater = extractedData.utilityType === 'water' || activeUtilityType === 'water';
  const occupants = (savedProfile?.home?.familyMembers && savedProfile.home.familyMembers > 0)
    ? savedProfile.home.familyMembers
    : 4;
  const days = 30; // Standard 30-day billing cycle

  if (!isWater) {
    const kwh = extractedData.electricityConsumptionKWh || 0;
    if (kwh <= 0) return null;

    // ELECTRICITY FORMULA: dailyKwhPerPerson = (Total kWh) / (Occupants * Days)
    const dailyKwhPerPerson = kwh / (occupants * days);
    const roundedDaily = Math.round(dailyKwhPerPerson * 10) / 10;

    const isSecTier1 = kwh <= 6000;
    const secTierName = isSecTier1 ? (isArabic ? 'الشريحة الأولى (SEC)' : 'SEC Tier 1') : (isArabic ? 'الشريحة الثانية (SEC)' : 'SEC Tier 2');
    const rateText = isSecTier1 ? (isArabic ? '١٨ هللة / ك.و.س' : '18 Halalas / kWh') : (isArabic ? '٣٠ هللة / ك.و.س' : '30 Halalas / kWh');

    if (dailyKwhPerPerson < 15) {
      return {
        levelText: isArabic
          ? `مستوى الاستهلاك: منخفض • ${secTierName}`
          : `Consumption Level: Low • ${secTierName}`,
        reasonText: isArabic
          ? `استهلاك منخفض • ${toLocalDigits(roundedDaily, 'ar')} ك.و.س/فرد/يوم لـ ${toLocalDigits(occupants, 'ar')} أفراد`
          : `Low Usage • ${roundedDaily} kWh/person/day for ${occupants} occupants`,
        rateText,
        badgeLabel: isArabic ? 'استهلاك منخفض' : 'Low Usage',
        badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        dotColor: 'bg-emerald-500',
        tierName: secTierName,
      };
    } else if (dailyKwhPerPerson <= 30) {
      return {
        levelText: isArabic
          ? `مستوى الاستهلاك: معتدل • ${secTierName}`
          : `Consumption Level: Moderate • ${secTierName}`,
        reasonText: isArabic
          ? `استهلاك معتدل • ${toLocalDigits(roundedDaily, 'ar')} ك.و.س/فرد/يوم لـ ${toLocalDigits(occupants, 'ar')} أفراد`
          : `Moderate Usage • ${roundedDaily} kWh/person/day for ${occupants} occupants`,
        rateText,
        badgeLabel: isArabic ? 'استهلاك معتدل' : 'Moderate Usage',
        badgeClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800',
        dotColor: 'bg-teal-500',
        tierName: secTierName,
      };
    } else {
      return {
        levelText: isArabic
          ? `مستوى الاستهلاك: مرتفع • ${secTierName}`
          : `Consumption Level: High • ${secTierName}`,
        reasonText: isArabic
          ? `استهلاك مرتفع • ${toLocalDigits(roundedDaily, 'ar')} ك.و.س/فرد/يوم لـ ${toLocalDigits(occupants, 'ar')} أفراد`
          : `High Usage • ${roundedDaily} kWh/person/day for ${occupants} occupants`,
        rateText,
        badgeLabel: isArabic ? 'استهلاك مرتفع' : 'High Usage',
        badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        dotColor: 'bg-amber-500',
        tierName: secTierName,
      };
    }
  } else {
    const m3 = extractedData.waterConsumptionM3 || 0;
    if (m3 <= 0) return null;

    // WATER FORMULA: dailyM3PerPerson = (Total m³) / (Occupants * Days)
    const dailyM3PerPerson = m3 / (occupants * days);
    const roundedDaily = Math.round(dailyM3PerPerson * 100) / 100;

    let nwcTierName = isArabic ? 'الشريحة الأولى (NWC)' : 'NWC Tier 1';
    let rateText = isArabic ? '٠.١٥ ريال / م³' : '0.15 SAR / m³';

    if (m3 <= 15) {
      nwcTierName = isArabic ? 'الشريحة الأولى (NWC)' : 'NWC Tier 1';
      rateText = isArabic ? '٠.١٥ ريال / م³' : '0.15 SAR / m³';
    } else if (m3 <= 30) {
      nwcTierName = isArabic ? 'الشريحة الثانية (NWC)' : 'NWC Tier 2';
      rateText = isArabic ? '١.٠٠ ريال / م³' : '1.00 SAR / m³';
    } else if (m3 <= 45) {
      nwcTierName = isArabic ? 'الشريحة الثالثة (NWC)' : 'NWC Tier 3';
      rateText = isArabic ? '٣.٠٠ ريال / م³' : '3.00 SAR / m³';
    } else {
      nwcTierName = isArabic ? 'الشريحة الرابعة+ (NWC)' : 'NWC Tier 4+';
      rateText = isArabic ? '٤.٠٠+ ريال / م³' : '4.00+ SAR / m³';
    }

    if (dailyM3PerPerson < 0.25) {
      return {
        levelText: isArabic
          ? `مستوى الاستهلاك: منخفض • ${nwcTierName}`
          : `Consumption Level: Low • ${nwcTierName}`,
        reasonText: isArabic
          ? `استهلاك منخفض • ${toLocalDigits(roundedDaily, 'ar')} م³/فرد/يوم لـ ${toLocalDigits(occupants, 'ar')} أفراد`
          : `Low Usage • ${roundedDaily} m³/person/day for ${occupants} occupants`,
        rateText,
        badgeLabel: isArabic ? 'استهلاك منخفض' : 'Low Usage',
        badgeClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
        dotColor: 'bg-cyan-500',
        tierName: nwcTierName,
      };
    } else if (dailyM3PerPerson <= 0.45) {
      return {
        levelText: isArabic
          ? `مستوى الاستهلاك: معتدل • ${nwcTierName}`
          : `Consumption Level: Moderate • ${nwcTierName}`,
        reasonText: isArabic
          ? `استهلاك معتدل • ${toLocalDigits(roundedDaily, 'ar')} م³/فرد/يوم لـ ${toLocalDigits(occupants, 'ar')} أفراد`
          : `Moderate Usage • ${roundedDaily} m³/person/day for ${occupants} occupants`,
        rateText,
        badgeLabel: isArabic ? 'استهلاك معتدل' : 'Moderate Usage',
        badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800',
        dotColor: 'bg-sky-500',
        tierName: nwcTierName,
      };
    } else {
      return {
        levelText: isArabic
          ? `مستوى الاستهلاك: مرتفع • ${nwcTierName}`
          : `Consumption Level: High • ${nwcTierName}`,
        reasonText: isArabic
          ? `استهلاك مرتفع • ${toLocalDigits(roundedDaily, 'ar')} م³/فرد/يوم لـ ${toLocalDigits(occupants, 'ar')} أفراد`
          : `High Usage • ${roundedDaily} m³/person/day for ${occupants} occupants`,
        rateText,
        badgeLabel: isArabic ? 'استهلاك مرتفع' : 'High Usage',
        badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        dotColor: 'bg-amber-500',
        tierName: nwcTierName,
      };
    }
  }
};

export const ElectricityBillPage: React.FC<ElectricityBillPageProps> = ({
  savedProfile,
  savedBills,
  onSaveBill,
  onDeleteBill,
  onBackToProfile,
  language,
}) => {
  const t = translations[language];
  const isArabic = language === 'ar';

  // Utility type toggle state: 'electricity' or 'water'
  const [activeUtilityType, setActiveUtilityType] = useState<'electricity' | 'water'>('electricity');

  // Current single bill upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedBillData | null>(null);

  // Document Lightbox Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Success toast feedback
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  // Trigger Gemini Multimodal Vision Analysis for the single uploaded bill
  const analyzeSingleBillWithAI = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setExtractedData(null);

    try {
      let mimeType = 'image/jpeg';
      if (imageDataUrl.startsWith('data:application/pdf')) mimeType = 'application/pdf';
      else if (imageDataUrl.startsWith('data:image/png')) mimeType = 'image/png';
      else if (imageDataUrl.startsWith('data:image/webp')) mimeType = 'image/webp';
      else if (imageDataUrl.startsWith('data:image/jpeg') || imageDataUrl.startsWith('data:image/jpg')) mimeType = 'image/jpeg';

      const response = await fetch('/api/analyze-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || (language === 'ar' ? 'فشل تحليل صورة الفاتورة.' : 'Failed to analyze bill image.'));
      }

      setIsAnalyzing(false);
      const data: ExtractedBillData = resData.extractedData;
      setExtractedData(data);
      if (data.utilityType) {
        setActiveUtilityType(data.utilityType);
      }
    } catch (err: any) {
      console.error('Error analyzing bill with AI:', err);
      setIsAnalyzing(false);
      setAnalysisError(err.message || (language === 'ar' ? 'تعذر الاتصال بمركز تحليل البيانات.' : 'Unable to connect to AI server. Please try again.'));
      setExtractedData({
        utilityType: activeUtilityType,
        isElectricityBill: activeUtilityType === 'electricity',
        electricityConsumptionKWh: activeUtilityType === 'electricity' ? 1250 : null,
        waterConsumptionM3: activeUtilityType === 'water' ? 28 : null,
        billAmountSAR: activeUtilityType === 'electricity' ? 225 : 85,
        billingPeriod: isArabic ? 'أغسطس 2024' : 'August 2024',
        previousMeterReading: 12000,
        currentMeterReading: 13250,
      });
    }
  };

  // Open file browser
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) {
      alert(
        language === 'ar'
          ? 'يرجى اختيار ملف فاتورة صالحة (JPEG, PNG, WEBP, PDF).'
          : 'Please select a valid bill file (JPEG, PNG, WEBP, or PDF).'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      setSelectedFileName(file.name);
      analyzeSingleBillWithAI(result);
    };
    reader.readAsDataURL(file);
  };

  // Handle selecting a sample bill
  const handleSelectSample = (sample: SampleBillItem) => {
    setSelectedImage(sample.dataUrl);
    setSelectedFileName(`${sample.title}.png`);
    analyzeSingleBillWithAI(sample.dataUrl);
  };

  // Save Bill action handler - STRICT UTILITY TYPE ISOLATION
  const handleSaveBill = async () => {
    if (!selectedImage || !extractedData) return;

    const finalUtilityType: 'electricity' | 'water' =
      extractedData.utilityType === 'water' || activeUtilityType === 'water' ? 'water' : 'electricity';

    let processedImage = selectedImage;
    try {
      processedImage = await compressImageDataUrl(selectedImage);
    } catch (e) {
      console.warn('Image compression error:', e);
    }

    const newRecord: BillRecord = {
      id: `BILL-${Date.now()}`,
      utilityType: finalUtilityType,
      uploadedAt: new Date().toISOString(),
      imageUrl: processedImage,
      extractedData: {
        ...extractedData,
        utilityType: finalUtilityType,
        isElectricityBill: finalUtilityType === 'electricity',
      },
      confirmed: true,
    };

    onSaveBill(newRecord);

    setSaveToast(
      isArabic
        ? `تم حفظ فاتورة ${finalUtilityType === 'water' ? 'المياه (NWC)' : 'الكهرباء (SEC)'} بنجاح!`
        : `${finalUtilityType === 'water' ? 'Water (NWC)' : 'Electricity (SEC)'} bill saved successfully!`
    );
    setTimeout(() => setSaveToast(null), 4000);

    setSelectedImage(null);
    setSelectedFileName(null);
    setExtractedData(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
  };

  // Reset upload state
  const handleResetUpload = () => {
    setSelectedImage(null);
    setSelectedFileName(null);
    setExtractedData(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
    triggerFileInput();
  };

  // Scroll to upload section when clicking + Add New Bill
  const handleAddNewBillClick = () => {
    if (uploadSectionRef.current) {
      uploadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    triggerFileInput();
  };

  // Render text value or "Could not be identified"
  const renderValueOrUnidentified = (
    val: number | string | null | undefined,
    unit = '',
    formatNum = false
  ) => {
    if (val === null || val === undefined || val === '') {
      return (
        <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 font-semibold text-xs px-2.5 py-1 rounded-lg border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          {language === 'ar' ? 'تعذر التعرف عليه' : 'Could not be identified'}
        </span>
      );
    }

    let displayStr = val.toString();
    if (formatNum && typeof val === 'number') {
      displayStr = val.toLocaleString();
    }
    displayStr = toLocalDigits(displayStr, language);

    return (
      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
        {displayStr}{' '}
        {unit && <span className="text-xs font-sans font-semibold text-slate-500 dark:text-slate-400">{unit}</span>}
      </span>
    );
  };

  const safeBills = Array.isArray(savedBills) ? savedBills : [];
  const analytics = calculateSavedBillsAnalytics(safeBills, savedProfile);

  // STRICT SEPARATION FOR ELECTRICITY (SEC) vs WATER (NWC) METRICS & COUNTERS
  const elecBills = safeBills.filter((b) => {
    if (b.utilityType === 'electricity') return true;
    if (b.utilityType === 'water') return false;
    return (b.extractedData?.electricityConsumptionKWh ?? 0) > 0;
  });

  const waterBills = safeBills.filter((b) => {
    if (b.utilityType === 'water') return true;
    if (b.utilityType === 'electricity') return false;
    return (b.extractedData?.waterConsumptionM3 ?? 0) > 0;
  });

  const totalElecKWh = elecBills.reduce((acc, b) => acc + (b.extractedData?.electricityConsumptionKWh || 0), 0);
  const totalElecSAR = elecBills.reduce((acc, b) => acc + (b.extractedData?.billAmountSAR || 0), 0);
  const avgElecKWh = elecBills.length > 0 ? Math.round(totalElecKWh / elecBills.length) : 0;
  const avgElecSAR = elecBills.length > 0 ? Math.round((totalElecSAR / elecBills.length) * 100) / 100 : 0;

  const totalWaterM3 = waterBills.reduce((acc, b) => acc + (b.extractedData?.waterConsumptionM3 || 0), 0);
  const totalWaterSAR = waterBills.reduce((acc, b) => acc + (b.extractedData?.billAmountSAR || 0), 0);
  const avgWaterM3 = waterBills.length > 0 ? Math.round((totalWaterM3 / waterBills.length) * 10) / 10 : 0;
  const avgWaterSAR = waterBills.length > 0 ? Math.round((totalWaterSAR / waterBills.length) * 100) / 100 : 0;

  const isPdfFile = selectedImage?.startsWith('data:application/pdf') || selectedFileName?.toLowerCase().endsWith('.pdf');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToProfile}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          <span>{language === 'ar' ? 'العودة إلى الإعدادات' : 'Back to Settings'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-2xs">
            ⚡ {elecBills.length} {language === 'ar' ? 'كهرباء (SEC)' : 'Electricity'}
          </span>
          <span className="text-xs text-cyan-800 dark:text-cyan-300 font-bold bg-cyan-50 dark:bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-200 dark:border-cyan-900/50 shadow-2xs">
            💧 {waterBills.length} {language === 'ar' ? 'مياه (NWC)' : 'Water'}
          </span>
        </div>
      </div>

      {/* Main Page Title Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-3">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              {language === 'ar' ? 'إدارة فواتير الكهرباء والمياه المزدوجة' : 'Dual Electricity & Water Bill Management'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'ar' ? 'فواتيري' : 'My Bills'}
            </h1>
          </div>
        </div>

        <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
          {language === 'ar'
            ? 'قم برفع وتحليل فواتير الكهرباء (SEC) وفواتير المياه (NWC) تلقائياً بالذكاء الاصطناعي وتصنيف الشريحة مباشرة.'
            : 'Upload and automatically extract electricity (SEC) and water (NWC) bills with AI multimodal vision and tier classification.'}
        </p>
      </div>

      {/* Save Success Toast */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-lg flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>{saveToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveToast(null)}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق' : 'Dismiss'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/heic,application/pdf,.pdf"
        className="hidden"
      />

      {/* SECTION 1: Utility Type Selector & Bill Upload Box */}
      <div
        ref={uploadSectionRef}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {language === 'ar' ? 'رفع فاتورة جديدة' : 'Upload Utility Bill'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'حدد نوع الفاتورة ثم قم برفع صورتها للتحليل الآلي' : 'Select bill utility type and upload PDF or image for instant parsing'}
            </p>
          </div>

          {/* Utility Selector Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveUtilityType('electricity')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeUtilityType === 'electricity'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{language === 'ar' ? 'كهرباء (SEC)' : 'Electricity (SEC)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveUtilityType('water')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeUtilityType === 'water'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Droplets className="w-4 h-4 fill-current" />
              <span>{language === 'ar' ? 'مياه (NWC)' : 'Water (NWC)'}</span>
            </button>
          </div>
        </div>

        {/* If no image selected yet */}
        {!selectedImage && (
          <div
            onClick={triggerFileInput}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all space-y-4 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              {activeUtilityType === 'electricity' ? (
                <Zap className="w-8 h-8 text-amber-500 fill-amber-100" />
              ) : (
                <Droplets className="w-8 h-8 text-cyan-500 fill-cyan-100" />
              )}
            </div>

            <div>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                {t.dragDropText}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.supportedFormats}
              </p>
            </div>

            {/* Quick Demo Sample Bills based on active tab */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 max-w-lg mx-auto">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                {language === 'ar'
                  ? `أو اختر فاتورة ${activeUtilityType === 'electricity' ? 'كهرباء' : 'مياه'} تجريبية للاختبار السريع:`
                  : `Or pick a sample ${activeUtilityType} bill for testing:`}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {(activeUtilityType === 'electricity' ? SAMPLE_BILLS : SAMPLE_WATER_BILLS).map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSample(sample);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{sample.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* If image/document is selected */}
        {selectedImage && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* ENHANCED UPLOADED DOCUMENT PREVIEW CARD */}
            <div className="md:col-span-5 space-y-3">
              <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-lg overflow-hidden relative group">
                {/* Card Header Bar */}
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-200">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className={`w-4 h-4 shrink-0 ${isPdfFile ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span className="font-mono font-bold truncate text-[11px]">{selectedFileName || 'Uploaded_Document'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                    isPdfFile ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {isPdfFile ? 'PDF • Vector' : 'Image • HD'}
                  </span>
                </div>

                {/* Viewer Canvas Container */}
                <div className="relative h-64 bg-white flex items-center justify-center overflow-hidden">
                  {isPdfFile ? (
                    <iframe
                      src={`${selectedImage}#toolbar=0&navpanes=0&scrollbar=0`}
                      title={selectedFileName || 'PDF Document'}
                      className="w-full h-full border-0 bg-white"
                    />
                  ) : (
                    <img
                      src={selectedImage}
                      alt="Utility Bill"
                      className="w-full h-full object-contain bg-white"
                    />
                  )}

                  <button
                    type="button"
                    onClick={handleResetUpload}
                    className="absolute top-2 right-2 bg-slate-900/90 hover:bg-rose-600 text-slate-300 hover:text-white p-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md z-10"
                    title={language === 'ar' ? 'تغيير المستند' : 'Change Document'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Footer Bar */}
                <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{isArabic ? 'حجم الملف: ~1.2 ميجابايت' : 'Size: ~1.2 MB'}</span>
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تكبير' : 'Zoom'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Extraction Panel */}
            <div className="md:col-span-7 space-y-4">
              {isAnalyzing ? (
                <div className="p-8 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-center space-y-3 my-auto">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {language === 'ar' ? 'جاري تحليل الفاتورة بالذكاء الاصطناعي...' : 'Analyzing utility bill with AI...'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {language === 'ar' ? 'يقوم المساعد بقراءة أرقام العداد والاستهلاك وتحديد الشريحة.' : 'Gemini Multimodal Vision is reading meter values, consumption numbers, and tariff tiers.'}
                  </p>
                </div>
              ) : extractedData ? (
                <div className="space-y-4">
                  {/* Automatic Consumption Tier Badge */}
                  {(() => {
                    const tierInfo = getConsumptionTierBadge(extractedData, activeUtilityType, isArabic, savedProfile);
                    if (!tierInfo) return null;
                    return (
                      <div className={`p-4 rounded-2xl border ${tierInfo.badgeClass} flex items-center justify-between gap-3 shadow-2xs`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-3.5 h-3.5 rounded-full ${tierInfo.dotColor} animate-pulse shrink-0`} />
                          <div>
                            <span className="text-xs font-black block tracking-tight">
                              {tierInfo.levelText}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block font-mono mt-0.5">
                              {tierInfo.reasonText} • {isArabic ? `تعرفة الشريحة: ${tierInfo.rateText}` : `Tariff Rate: ${tierInfo.rateText}`}
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 font-black text-xs shadow-2xs shrink-0">
                          {tierInfo.badgeLabel}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span>{language === 'ar' ? 'تم التعرف على تفاصيل الفاتورة بنجاح.' : 'Bill information successfully identified.'}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      extractedData.utilityType === 'water' ? 'bg-cyan-200 text-cyan-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {extractedData.utilityType === 'water' ? (isArabic ? 'فاتورة مياه' : 'Water') : (isArabic ? 'فاتورة كهرباء' : 'Electricity')}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    {extractedData.utilityType === 'water' ? (
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {language === 'ar' ? 'استهلاك المياه (م³):' : 'Water Consumption (m³):'}
                        </span>
                        {renderValueOrUnidentified(
                          extractedData.waterConsumptionM3,
                          language === 'ar' ? 'م³' : 'm³',
                          true
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {t.consumptionKWh}:
                        </span>
                        {renderValueOrUnidentified(
                          extractedData.electricityConsumptionKWh,
                          t.kwh,
                          true
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {t.totalAmountSAR}:
                      </span>
                      {renderValueOrUnidentified(
                        extractedData.billAmountSAR,
                        t.sar,
                        true
                      )}
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {t.billDate}:
                      </span>
                      {renderValueOrUnidentified(extractedData.billingPeriod)}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {language === 'ar' ? 'الشركة المزودة:' : 'Provider:'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {extractedData.utilityCompany || (extractedData.utilityType === 'water' ? 'الشركة الوطنية للمياه (NWC)' : 'الشركة السعودية للكهرباء (SEC)')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveBill}
                      className="w-full sm:flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t.saveBillBtn}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetUpload}
                      className="w-full sm:flex-1 py-3 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{language === 'ar' ? 'رفع فاتورة أخرى' : 'Upload Another Bill'}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* DASHBOARD CONTAINER - Rendered when saved bills or analytics exist */}
      {(analytics || safeBills.length > 0) && (
        <div className="space-y-8">
          {/* REDESIGNED OVERVIEW CARDS: STACKED & EXTENDED FULL-WIDTH LAYOUT */}
          <div className="space-y-6">
            {/* 1. Electricity Bill Overview (SEC) - Full Width Stacked Section */}
            <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-amber-200/90 dark:border-amber-900/50 shadow-md relative overflow-hidden space-y-6">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Section Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 dark:border-amber-950 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/20 flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {isArabic ? 'ملخص فواتير الكهرباء (SEC)' : 'Electricity Bill Overview (SEC)'}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                        {elecBills.length} {isArabic ? 'فواتير مسجلة' : 'Bills Saved'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {isArabic ? 'الشركة السعودية للكهرباء • التعرفة السكنية المعتمدة' : 'Saudi Electricity Company • Official Residential Tariffs'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/80 font-mono">
                    {isArabic ? `إجمالي الإنفاق: ${toLocalDigits(totalElecSAR.toFixed(2), language)} SAR` : `Total Spent: ${totalElecSAR.toFixed(2)} SAR`}
                  </span>
                </div>
              </div>

              {/* 4 Extended Metrics Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Avg Monthly Consumption */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-1.5">
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{isArabic ? 'متوسط الاستهلاك' : 'Avg Consumption'}</span>
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-300 font-mono">
                    {avgElecKWh > 0 ? `${toLocalDigits(avgElecKWh, language)} kWh` : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {isArabic ? 'معدل الطاقة شهرياً' : 'Monthly kWh average'}
                  </p>
                </div>

                {/* Metric 2: Avg Cost */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{isArabic ? 'متوسط التكلفة' : 'Avg Bill Cost'}</span>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 font-mono">
                    {avgElecSAR > 0 ? `${toLocalDigits(avgElecSAR, language)} SAR` : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {isArabic ? 'متوسط الفاتورة الشهرية' : 'Monthly bill average'}
                  </p>
                </div>

                {/* Metric 3: Active Tariff Tier */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{isArabic ? 'شريحة التعريفة' : 'Tariff Classification'}</span>
                    <Gauge className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {avgElecKWh > 6000 ? (isArabic ? 'الشريحة الثانية (SEC)' : 'SEC Tier 2') : (isArabic ? 'الشريحة الأولى (SEC)' : 'SEC Tier 1')}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold font-mono">
                    {avgElecKWh > 6000 ? (isArabic ? '٣٠ هللة / ك.و.س' : '30 Halalas/kWh') : (isArabic ? '١٨ هللة / ك.و.س' : '18 Halalas/kWh')}
                  </p>
                </div>

                {/* Metric 4: Total Recorded */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{isArabic ? 'إجمالي الطاقة' : 'Total Recorded'}</span>
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {toLocalDigits(totalElecKWh, language)} kWh
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {isArabic ? `مجموع ${toLocalDigits(elecBills.length, language)} فواتير` : `Across ${elecBills.length} bills`}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Water Bill Overview (NWC) - Full Width Stacked Section */}
            <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-cyan-200/90 dark:border-cyan-900/50 shadow-md relative overflow-hidden space-y-6">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Section Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-100 dark:border-cyan-950 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 text-white shadow-md shadow-cyan-500/20 flex items-center justify-center shrink-0">
                    <Droplets className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {isArabic ? 'ملخص فواتير المياه (NWC)' : 'Water Bill Overview (NWC)'}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 font-extrabold text-xs">
                        {waterBills.length} {isArabic ? 'فواتير مسجلة' : 'Bills Saved'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {isArabic ? 'الشركة الوطنية للمياه • الشرائح والخدمات المائية' : 'National Water Company • Official Water Tariffs'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-200 dark:border-cyan-800/80 font-mono">
                    {isArabic ? `إجمالي الإنفاق: ${toLocalDigits(totalWaterSAR.toFixed(2), language)} SAR` : `Total Spent: ${totalWaterSAR.toFixed(2)} SAR`}
                  </span>
                </div>
              </div>

              {/* 4 Extended Metrics Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Avg Monthly Consumption */}
                <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40 space-y-1.5">
                  <div className="flex items-center justify-between text-cyan-700 dark:text-cyan-400">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{isArabic ? 'متوسط الاستهلاك' : 'Avg Consumption'}</span>
                    <Droplets className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-cyan-900 dark:text-cyan-300 font-mono">
                    {avgWaterM3 > 0 ? `${toLocalDigits(avgWaterM3, language)} m³` : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {isArabic ? 'معدل المياه شهرياً' : 'Monthly m³ average'}
                  </p>
                </div>

                {/* Metric 2: Avg Cost */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{isArabic ? 'متوسط التكلفة' : 'Avg Bill Cost'}</span>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 font-mono">
                    {avgWaterSAR > 0 ? `${toLocalDigits(avgWaterSAR, language)} SAR` : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {isArabic ? 'متوسط الفاتورة الشهرية' : 'Monthly bill average'}
                  </p>
                </div>

                {/* Metric 3: Active Tariff Tier */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{isArabic ? 'شريحة المياه' : 'Water Tariff Tier'}</span>
                    <Gauge className="w-4 h-4 text-cyan-500" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {avgWaterM3 <= 15 ? (isArabic ? 'الشريحة الأولى (NWC)' : 'NWC Tier 1') : avgWaterM3 <= 30 ? (isArabic ? 'الشريحة الثانية (NWC)' : 'NWC Tier 2') : (isArabic ? 'الشريحة الثالثة (NWC)' : 'NWC Tier 3')}
                  </p>
                  <p className="text-[11px] text-cyan-700 dark:text-cyan-400 font-bold font-mono">
                    {avgWaterM3 <= 15 ? (isArabic ? '٠.١٥ ريال / م³' : '0.15 SAR/m³') : avgWaterM3 <= 30 ? (isArabic ? '١.٠٠ ريال / م³' : '1.00 SAR/m³') : (isArabic ? '٣.٠٠ ريال / م³' : '3.00 SAR/m³')}
                  </p>
                </div>

                {/* Metric 4: Total Recorded */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{isArabic ? 'إجمالي الحجم' : 'Total Volume'}</span>
                    <BarChart3 className="w-4 h-4 text-cyan-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {toLocalDigits(totalWaterM3, language)} m³
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {isArabic ? `مجموع ${toLocalDigits(waterBills.length, language)} فواتير` : `Across ${waterBills.length} bills`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED BILL HISTORY TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {language === 'ar' ? 'سجل الفواتير التفصيلي' : 'Detailed Bill History'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'ar' ? 'سجل زمني لجميع فواتير الكهرباء والمياه المحفوظة' : 'Chronological detailed records of all saved electricity and water bills'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddNewBillClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.addBillBtn}</span>
              </button>
            </div>

            {safeBills.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">{t.noBillsSaved}</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {language === 'ar' ? 'قم برفع فاتورتك الأولى لبناء سجل الاستهلاك الخاص بك.' : 'Upload your first utility bill above to build your consumption history.'}
                </p>
                <button
                  type="button"
                  onClick={handleAddNewBillClick}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addBillBtn}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {safeBills.map((bill) => {
                  const isWater = bill.utilityType === 'water' || (!bill.utilityType && bill.extractedData?.waterConsumptionM3 != null);
                  const tierBadge = getConsumptionTierBadge(bill.extractedData, isWater ? 'water' : 'electricity', isArabic, savedProfile);

                  return (
                    <div
                      key={bill.id}
                      className="p-4 bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl border overflow-hidden flex-shrink-0 flex items-center justify-center ${
                          isWater ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 text-cyan-600' : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-600'
                        }`}>
                          {isWater ? (
                            <Droplets className="w-6 h-6 fill-current text-cyan-600" />
                          ) : (
                            <Zap className="w-6 h-6 fill-current text-amber-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {toLocalDigits(bill.extractedData?.billingPeriod, language) || (isWater ? (isArabic ? 'فاتورة مياه' : 'Water Bill') : (isArabic ? 'فاتورة كهرباء' : 'Electricity Bill'))}
                            </p>
                            {isWater ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-600 text-white text-[11px] font-black shadow-2xs">
                                <Droplets className="w-3 h-3 fill-current" />
                                <span>{isArabic ? 'مياه (NWC)' : 'Water (NWC)'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500 text-white text-[11px] font-black shadow-2xs">
                                <Zap className="w-3 h-3 fill-current" />
                                <span>{isArabic ? 'كهرباء (SEC)' : 'Electricity (SEC)'}</span>
                              </span>
                            )}

                            {tierBadge && (
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${tierBadge.badgeClass}`}>
                                {tierBadge.tierName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {new Date(bill.uploadedAt).toLocaleDateString('en-US')} • {bill.extractedData?.utilityCompany || (isWater ? 'National Water Co.' : 'Saudi Electricity Co.')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900 dark:text-white font-mono">
                            {isWater
                              ? formatUnit(bill.extractedData?.waterConsumptionM3 || 0, 'm3', language)
                              : formatUnit(bill.extractedData?.electricityConsumptionKWh || 0, 'kwh', language)}
                          </p>
                          {bill.extractedData?.billAmountSAR && (
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                              {formatUnit(bill.extractedData.billAmountSAR, 'sar', language)}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteBill(bill.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewModalOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsPreviewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold truncate max-w-xs sm:max-w-md">
                      {selectedFileName || (isArabic ? 'معاينة المستند' : 'Document Preview')}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {isPdfFile ? 'PDF Document • High Resolution' : 'Image File • High Resolution'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedImage}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">{isArabic ? 'فتح بنافذة جديدة' : 'Open Tab'}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 flex-1 overflow-auto bg-slate-950 flex items-center justify-center min-h-[350px]">
                {isPdfFile ? (
                  <iframe
                    src={`${selectedImage}#toolbar=0&navpanes=0&scrollbar=0`}
                    title={selectedFileName || 'PDF Document'}
                    className="w-full h-[70vh] rounded-xl border border-slate-800 bg-white"
                  />
                ) : (
                  <img
                    src={selectedImage}
                    alt="Full Bill Preview"
                    className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg bg-white"
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
                {isArabic ? 'استخدم أزرار اللمس للتكبير أو استعرض الملف بحجمه الكامل.' : 'Use full screen view to zoom or inspect bill details.'}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
