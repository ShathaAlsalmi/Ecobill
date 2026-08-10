// Helper utility to create realistic SVG Data URIs for sample electricity & water bills
import { BillRecord } from '../types';

export interface SampleBillItem {
  id: string;
  utilityType: 'electricity' | 'water';
  title: string;
  subtitle: string;
  dataUrl: string;
  kwh?: number;
  m3?: number;
  sar: number;
  period: string;
}

export function generateSampleBillSVG(
  billNo: string,
  period: string,
  kwh: string,
  sar: string,
  prevReading: string,
  currReading: string,
  companyName = 'Saudi Electricity Company'
): string {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750" fill="none">
    <rect width="600" height="750" fill="#F8FAFC"/>
    <!-- Header banner -->
    <rect width="600" height="110" fill="#065F46"/>
    <circle cx="50" cy="55" r="28" fill="#10B981" opacity="0.4"/>
    <text x="90" y="52" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${companyName}</text>
    <text x="90" y="75" fill="#A7F3D0" font-family="Arial, sans-serif" font-size="14">ELECTRICITY CONSUMPTION TAX INVOICE</text>
    <text x="460" y="55" fill="#FFFFFF" font-family="monospace" font-size="14" font-weight="bold">BILL #${billNo}</text>
    <text x="460" y="75" fill="#6EE7B7" font-family="Arial, sans-serif" font-size="12">ISSUE DATE: 2024-08-01</text>
    
    <!-- Customer Box -->
    <rect x="30" y="130" width="540" height="85" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <text x="50" y="160" fill="#64748B" font-family="Arial, sans-serif" font-size="12" font-weight="bold">CUSTOMER NAME / ACCOUNT</text>
    <text x="50" y="185" fill="#1E293B" font-family="Arial, sans-serif" font-size="16" font-weight="bold">EcoBill Household #882041</text>
    <text x="350" y="160" fill="#64748B" font-family="Arial, sans-serif" font-size="12" font-weight="bold">BILLING PERIOD</text>
    <text x="350" y="185" fill="#047857" font-family="Arial, sans-serif" font-size="15" font-weight="bold">${period}</text>

    <!-- Meter Readings Table -->
    <rect x="30" y="235" width="540" height="150" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <rect x="30" y="235" width="540" height="40" rx="8" fill="#F1F5F9"/>
    <text x="50" y="260" fill="#334155" font-family="Arial, sans-serif" font-size="13" font-weight="bold">METER DETAILS &amp; READINGS</text>
    
    <text x="50" y="305" fill="#64748B" font-family="Arial, sans-serif" font-size="12">Previous Reading Index:</text>
    <text x="220" y="305" fill="#0F172A" font-family="monospace" font-size="15" font-weight="bold">${prevReading}</text>
    
    <text x="50" y="340" fill="#64748B" font-family="Arial, sans-serif" font-size="12">Current Reading Index:</text>
    <text x="220" y="340" fill="#0F172A" font-family="monospace" font-size="15" font-weight="bold">${currReading}</text>

    <text x="350" y="305" fill="#64748B" font-family="Arial, sans-serif" font-size="12">Meter Multiplier:</text>
    <text x="480" y="305" fill="#0F172A" font-family="monospace" font-size="14">1.0</text>

    <!-- Key Consumption & Amount Highlight Box -->
    <rect x="30" y="405" width="260" height="140" rx="12" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="2"/>
    <text x="50" y="435" fill="#065F46" font-family="Arial, sans-serif" font-size="13" font-weight="bold">NET CONSUMPTION (kWh)</text>
    <text x="50" y="485" fill="#047857" font-family="Arial, sans-serif" font-size="32" font-weight="extrabold">${kwh} kWh</text>

    <rect x="310" y="405" width="260" height="140" rx="12" fill="#FEF3C7" stroke="#FDE68A" stroke-width="2"/>
    <text x="330" y="435" fill="#92400E" font-family="Arial, sans-serif" font-size="13" font-weight="bold">TOTAL AMOUNT DUE (SAR)</text>
    <text x="330" y="485" fill="#B45309" font-family="Arial, sans-serif" font-size="32" font-weight="extrabold">${sar} SAR</text>

    <!-- Breakdown details -->
    <rect x="30" y="565" width="540" height="120" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <text x="50" y="595" fill="#475569" font-family="Arial, sans-serif" font-size="12">Standard Residential Tariff (Tier 1 &amp; 2):</text>
    <text x="450" y="595" fill="#0F172A" font-family="monospace" font-size="13">${(parseFloat(sar || '0') * 0.85).toFixed(2)} SAR</text>
    <text x="50" y="625" fill="#475569" font-family="Arial, sans-serif" font-size="12">VAT (15%):</text>
    <text x="450" y="625" fill="#0F172A" font-family="monospace" font-size="13">${(parseFloat(sar || '0') * 0.15).toFixed(2)} SAR</text>

    <line x1="50" y1="645" x2="550" y2="645" stroke="#CBD5E1" stroke-dasharray="4"/>
    <text x="50" y="668" fill="#0F172A" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Total Inclusive of Tax:</text>
    <text x="450" y="668" fill="#047857" font-family="monospace" font-size="16" font-weight="bold">${sar} SAR</text>

    <!-- Footer -->
    <text x="300" y="720" text-anchor="middle" fill="#94A3B8" font-family="Arial, sans-serif" font-size="11">Official Electricity Tax Invoice Copy • EcoBill Test Reference</text>
  </svg>`;

  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
}

export function generateSampleWaterBillSVG(
  billNo: string,
  period: string,
  m3: string,
  sar: string,
  prevReading: string,
  currReading: string,
  companyName = 'National Water Company (NWC)'
): string {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750" fill="none">
    <rect width="600" height="750" fill="#F8FAFC"/>
    <!-- Header banner -->
    <rect width="600" height="110" fill="#0284C7"/>
    <circle cx="50" cy="55" r="28" fill="#38BDF8" opacity="0.4"/>
    <text x="90" y="52" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="22" font-weight="bold">${companyName}</text>
    <text x="90" y="75" fill="#BAE6FD" font-family="Arial, sans-serif" font-size="14">WATER &amp; SANITATION SERVICES TAX INVOICE</text>
    <text x="460" y="55" fill="#FFFFFF" font-family="monospace" font-size="14" font-weight="bold">BILL #${billNo}</text>
    <text x="460" y="75" fill="#7DD3FC" font-family="Arial, sans-serif" font-size="12">ISSUE DATE: 2024-08-01</text>
    
    <!-- Customer Box -->
    <rect x="30" y="130" width="540" height="85" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <text x="50" y="160" fill="#64748B" font-family="Arial, sans-serif" font-size="12" font-weight="bold">CUSTOMER NAME / ACCOUNT</text>
    <text x="50" y="185" fill="#1E293B" font-family="Arial, sans-serif" font-size="16" font-weight="bold">EcoBill Household #882041</text>
    <text x="350" y="160" fill="#64748B" font-family="Arial, sans-serif" font-size="12" font-weight="bold">BILLING PERIOD</text>
    <text x="350" y="185" fill="#0369A1" font-family="Arial, sans-serif" font-size="15" font-weight="bold">${period}</text>

    <!-- Meter Readings Table -->
    <rect x="30" y="235" width="540" height="150" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <rect x="30" y="235" width="540" height="40" rx="8" fill="#F0F9FF"/>
    <text x="50" y="260" fill="#0369A1" font-family="Arial, sans-serif" font-size="13" font-weight="bold">WATER METER DETAILS &amp; CONSUMPTION (m³)</text>
    
    <text x="50" y="305" fill="#64748B" font-family="Arial, sans-serif" font-size="12">Previous Meter Reading:</text>
    <text x="220" y="305" fill="#0F172A" font-family="monospace" font-size="15" font-weight="bold">${prevReading} m³</text>
    
    <text x="50" y="340" fill="#64748B" font-family="Arial, sans-serif" font-size="12">Current Meter Reading:</text>
    <text x="220" y="340" fill="#0F172A" font-family="monospace" font-size="15" font-weight="bold">${currReading} m³</text>

    <text x="350" y="305" fill="#64748B" font-family="Arial, sans-serif" font-size="12">Sanitation Service:</text>
    <text x="480" y="305" fill="#0F172A" font-family="monospace" font-size="14">Connected</text>

    <!-- Key Consumption & Amount Highlight Box -->
    <rect x="30" y="405" width="260" height="140" rx="12" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="2"/>
    <text x="50" y="435" fill="#0369A1" font-family="Arial, sans-serif" font-size="13" font-weight="bold">NET WATER VOLUME (m³)</text>
    <text x="50" y="485" fill="#0284C7" font-family="Arial, sans-serif" font-size="32" font-weight="extrabold">${m3} m³</text>

    <rect x="310" y="405" width="260" height="140" rx="12" fill="#FEF3C7" stroke="#FDE68A" stroke-width="2"/>
    <text x="330" y="435" fill="#92400E" font-family="Arial, sans-serif" font-size="13" font-weight="bold">المبلغ المستحق / AMOUNT DUE (SAR)</text>
    <text x="330" y="485" fill="#B45309" font-family="Arial, sans-serif" font-size="32" font-weight="extrabold">${sar} SAR</text>

    <!-- Breakdown details -->
    <rect x="30" y="565" width="540" height="120" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <text x="50" y="595" fill="#475569" font-family="Arial, sans-serif" font-size="12">مبلغ الفاتورة الحالية (Current Bill Subtotal):</text>
    <text x="450" y="595" fill="#0F172A" font-family="monospace" font-size="13">18.92 SAR</text>
    <text x="50" y="625" fill="#475569" font-family="Arial, sans-serif" font-size="12">مديونيات سابقة وتعديلات (Previous Balance):</text>
    <text x="450" y="625" fill="#0F172A" font-family="monospace" font-size="13">${(parseFloat(sar || '0') - 18.92).toFixed(2)} SAR</text>

    <line x1="50" y1="645" x2="550" y2="645" stroke="#CBD5E1" stroke-dasharray="4"/>
    <text x="50" y="668" fill="#0F172A" font-family="Arial, sans-serif" font-size="14" font-weight="bold">إجمالي المبلغ المستحق (Total Amount Due):</text>
    <text x="450" y="668" fill="#0284C7" font-family="monospace" font-size="16" font-weight="bold">${sar} SAR</text>

    <!-- Footer -->
    <text x="300" y="720" text-anchor="middle" fill="#94A3B8" font-family="Arial, sans-serif" font-size="11">Official NWC Water Invoice Copy • EcoBill Test Reference</text>
  </svg>`;

  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
}

export const SAMPLE_ELECTRICITY_BILLS: SampleBillItem[] = [
  {
    id: 'elec-month-1-july',
    utilityType: 'electricity',
    title: 'Electricity - July 2024',
    subtitle: '1,280 kWh • 384.00 SAR • 01/07/2024 - 31/07/2024',
    kwh: 1280,
    sar: 384.00,
    period: '01/07/2024 - 31/07/2024',
    dataUrl: generateSampleBillSVG('SEC-77101', '01/07/2024 - 31/07/2024', '1280', '384.00', '41200', '42480', 'Saudi Electricity Co.'),
  },
  {
    id: 'elec-month-2-august',
    utilityType: 'electricity',
    title: 'Electricity - August 2024',
    subtitle: '1,520 kWh • 456.00 SAR • 01/08/2024 - 31/08/2024',
    kwh: 1520,
    sar: 456.00,
    period: '01/08/2024 - 31/08/2024',
    dataUrl: generateSampleBillSVG('SEC-88204', '01/08/2024 - 31/08/2024', '1520', '456.00', '42480', '44000', 'Saudi Electricity Co.'),
  },
  {
    id: 'elec-month-3-september',
    utilityType: 'electricity',
    title: 'Electricity - September 2024',
    subtitle: '1,150 kWh • 345.00 SAR • 01/09/2024 - 30/09/2024',
    kwh: 1150,
    sar: 345.00,
    period: '01/09/2024 - 30/09/2024',
    dataUrl: generateSampleBillSVG('SEC-99312', '01/09/2024 - 30/09/2024', '1150', '345.00', '44000', '45150', 'Saudi Electricity Co.'),
  },
];

export const SAMPLE_WATER_BILLS: SampleBillItem[] = [
  {
    id: 'water-month-1-july',
    utilityType: 'water',
    title: 'Water - July 2024',
    subtitle: '38 m³ • 84.00 SAR • 01/07/2024 - 31/07/2024',
    m3: 38,
    sar: 84.00,
    period: '01/07/2024 - 31/07/2024',
    dataUrl: generateSampleWaterBillSVG('NWC-30112', '01/07/2024 - 31/07/2024', '38', '84.00', '1140', '1178', 'National Water Co. (NWC)'),
  },
  {
    id: 'water-month-2-august',
    utilityType: 'water',
    title: 'Water - August 2024',
    subtitle: '42 m³ • 116.02 SAR • 01/08/2024 - 31/08/2024',
    m3: 42,
    sar: 116.02,
    period: '01/08/2024 - 31/08/2024',
    dataUrl: generateSampleWaterBillSVG('NWC-40221', '01/08/2024 - 31/08/2024', '42', '116.02', '1178', '1220', 'National Water Co. (NWC)'),
  },
  {
    id: 'water-month-3-september',
    utilityType: 'water',
    title: 'Water - September 2024',
    subtitle: '32 m³ • 68.00 SAR • 01/09/2024 - 30/09/2024',
    m3: 32,
    sar: 68.00,
    period: '01/09/2024 - 30/09/2024',
    dataUrl: generateSampleWaterBillSVG('NWC-50334', '01/09/2024 - 30/09/2024', '32', '68.00', '1220', '1252', 'National Water Co. (NWC)'),
  },
];

export const SAMPLE_BILLS: SampleBillItem[] = [
  ...SAMPLE_ELECTRICITY_BILLS,
  ...SAMPLE_WATER_BILLS,
];

// Rich Demo Dataset pre-loaded for Demo Mode
export const MOCK_DEMO_BILLS: BillRecord[] = [
  // 3 Electricity Bills
  {
    id: 'demo-elec-1',
    uploadedAt: new Date(2024, 6, 31).toISOString(),
    imageUrl: SAMPLE_ELECTRICITY_BILLS[0].dataUrl,
    utilityType: 'electricity',
    confirmed: true,
    extractedData: {
      utilityType: 'electricity',
      isElectricityBill: true,
      electricityConsumptionKWh: 1280,
      billAmountSAR: 384.00,
      billingPeriod: '01/07/2024 - 31/07/2024',
      issueDate: '2024-08-01',
      previousMeterReading: 41200,
      currentMeterReading: 42480,
      utilityCompany: 'الشركة السعودية للكهرباء (SEC)',
      confidence: {
        billing_period: 0.98,
        consumption_kwh: 0.99,
        bill_amount_sar: 0.99,
        previous_meter_reading: 0.95,
        current_meter_reading: 0.95,
      },
    },
  },
  {
    id: 'demo-elec-2',
    uploadedAt: new Date(2024, 7, 31).toISOString(),
    imageUrl: SAMPLE_ELECTRICITY_BILLS[1].dataUrl,
    utilityType: 'electricity',
    confirmed: true,
    extractedData: {
      utilityType: 'electricity',
      isElectricityBill: true,
      electricityConsumptionKWh: 1520,
      billAmountSAR: 456.00,
      billingPeriod: '01/08/2024 - 31/08/2024',
      issueDate: '2024-09-01',
      previousMeterReading: 42480,
      currentMeterReading: 44000,
      utilityCompany: 'الشركة السعودية للكهرباء (SEC)',
      confidence: {
        billing_period: 0.98,
        consumption_kwh: 0.99,
        bill_amount_sar: 0.99,
        previous_meter_reading: 0.95,
        current_meter_reading: 0.95,
      },
    },
  },
  {
    id: 'demo-elec-3',
    uploadedAt: new Date(2024, 8, 30).toISOString(),
    imageUrl: SAMPLE_ELECTRICITY_BILLS[2].dataUrl,
    utilityType: 'electricity',
    confirmed: true,
    extractedData: {
      utilityType: 'electricity',
      isElectricityBill: true,
      electricityConsumptionKWh: 1150,
      billAmountSAR: 345.00,
      billingPeriod: '01/09/2024 - 30/09/2024',
      issueDate: '2024-10-01',
      previousMeterReading: 44000,
      currentMeterReading: 45150,
      utilityCompany: 'الشركة السعودية للكهرباء (SEC)',
      confidence: {
        billing_period: 0.98,
        consumption_kwh: 0.99,
        bill_amount_sar: 0.99,
        previous_meter_reading: 0.95,
        current_meter_reading: 0.95,
      },
    },
  },

  // 3 Water Bills
  {
    id: 'demo-water-1',
    uploadedAt: new Date(2024, 6, 31).toISOString(),
    imageUrl: SAMPLE_WATER_BILLS[0].dataUrl,
    utilityType: 'water',
    confirmed: true,
    extractedData: {
      utilityType: 'water',
      isElectricityBill: false,
      electricityConsumptionKWh: null,
      waterConsumptionM3: 38,
      billAmountSAR: 84.00,
      billingPeriod: '01/07/2024 - 31/07/2024',
      issueDate: '2024-08-01',
      previousMeterReading: 1140,
      currentMeterReading: 1178,
      utilityCompany: 'الشركة الوطنية للمياه (NWC)',
      confidence: {
        billing_period: 0.98,
        consumption_m3: 0.98,
        bill_amount_sar: 0.99,
        previous_meter_reading: 0.94,
        current_meter_reading: 0.94,
      },
    },
  },
  {
    id: 'demo-water-2',
    uploadedAt: new Date(2024, 7, 31).toISOString(),
    imageUrl: SAMPLE_WATER_BILLS[1].dataUrl,
    utilityType: 'water',
    confirmed: true,
    extractedData: {
      utilityType: 'water',
      isElectricityBill: false,
      electricityConsumptionKWh: null,
      waterConsumptionM3: 42,
      billAmountSAR: 116.02,
      billingPeriod: '01/08/2024 - 31/08/2024',
      issueDate: '2024-09-01',
      previousMeterReading: 1178,
      currentMeterReading: 1220,
      utilityCompany: 'الشركة الوطنية للمياه (NWC)',
      confidence: {
        billing_period: 0.98,
        consumption_m3: 0.98,
        bill_amount_sar: 0.99,
        previous_meter_reading: 0.94,
        current_meter_reading: 0.94,
      },
    },
  },
  {
    id: 'demo-water-3',
    uploadedAt: new Date(2024, 8, 30).toISOString(),
    imageUrl: SAMPLE_WATER_BILLS[2].dataUrl,
    utilityType: 'water',
    confirmed: true,
    extractedData: {
      utilityType: 'water',
      isElectricityBill: false,
      electricityConsumptionKWh: null,
      waterConsumptionM3: 32,
      billAmountSAR: 68.00,
      billingPeriod: '01/09/2024 - 30/09/2024',
      issueDate: '2024-10-01',
      previousMeterReading: 1220,
      currentMeterReading: 1252,
      utilityCompany: 'الشركة الوطنية للمياه (NWC)',
      confidence: {
        billing_period: 0.98,
        consumption_m3: 0.98,
        bill_amount_sar: 0.99,
        previous_meter_reading: 0.94,
        current_meter_reading: 0.94,
      },
    },
  },
];

