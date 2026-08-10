export interface Appliance {
  id: string;
  type: string;
  customName?: string;
  units: number;
  hoursPerDay: number;
  estimatedWattage: number; // In Watts
}

export interface UserInfo {
  fullName: string;
  contact: string; // Email or Phone Number
}

export interface HomeDetails {
  familyMembers: number;
  homeSizeM2: number;
  city?: string;
  floors?: number;
}

export interface HomeProfile {
  id: string;
  createdAt: string;
  user: UserInfo;
  home: HomeDetails;
  appliancesCount: number;
  appliances: Appliance[];
  estimatedDailyKWh: number;
  estimatedMonthlyKWh: number;
}

export type ApplianceTypeKey =
  | 'Air Conditioner'
  | 'Refrigerator'
  | 'Television'
  | 'Washing Machine'
  | 'Dishwasher'
  | 'Water Heater'
  | 'Lighting'
  | 'Other';

export interface AppliancePreset {
  type: ApplianceTypeKey;
  iconName: string;
  defaultWattage: number;
  defaultHours: number;
  description: string;
}

export interface ExtractedBillData {
  utilityType?: 'electricity' | 'water';
  isElectricityBill?: boolean;
  electricityConsumptionKWh: number | null;
  waterConsumptionM3?: number | null;
  billAmountSAR: number | null;
  billingPeriod: string | null;
  issueDate?: string | null;
  previousMeterReading: number | null;
  currentMeterReading: number | null;
  utilityCompany?: string | null;
  confidence?: {
    billing_period?: number;
    consumption_kwh?: number;
    consumption_m3?: number;
    bill_amount_sar?: number;
    previous_meter_reading?: number;
    current_meter_reading?: number;
  } | null;
  confidenceNotes?: string | null;
}

export interface BillRecord {
  id: string;
  uploadedAt: string;
  imageUrl: string;
  utilityType?: 'electricity' | 'water';
  extractedData: ExtractedBillData;
  confirmed: boolean;
}

export interface MonthBillSlot {
  monthIndex: 1 | 2 | 3;
  monthLabel: string;
  imageUrl: string | null;
  fileName: string | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  extractedData: ExtractedBillData | null;
}

export interface RecommendedActionItem {
  id: string;
  stepNumber: number;
  stepTitle: string;
  stepTitleAr?: string;
  actionWhat: string;
  actionWhatAr?: string;
  actionWhy: string;
  actionWhyAr?: string;
  estimatedSavingsKWh: number;
  estimatedReductionPercent: number;
  estimatedSavingsSAR: number;
  category: string;
  applianceType?: string;
}

export interface ThreeMonthAnalysisResult {
  averageKWh: number | null;
  averageSAR: number | null;
  averageDailyKWh: number | null;
  latestBillAmountSAR: number | null;
  latestBillingPeriod: string | null;
  trend: 'Increasing' | 'Decreasing' | 'Relatively Stable' | 'Insufficient Data';
  trendPercentage: number | null;
  trendExplanation: string;
  highestMonth: { label: string; period: string | null; kWh: number; sar: number | null } | null;
  lowestMonth: { label: string; period: string | null; kWh: number; sar: number | null } | null;
  classification: 'Low' | 'Moderate' | 'High';
  benchmarkKWh: number;
  currentConsumptionKWh: number;
  recommendedTargetKWh: number;
  expectedNewConsumptionKWh: number;
  potentialReductionPercent: number;
  savedKWhPerMonth: number;
  savedSARPerMonth: number | null;
  progressTowardTargetPercent: number;
  goalStatus: 'On track' | 'Above target' | 'Below target';
  recommendedActions: RecommendedActionItem[];
}

