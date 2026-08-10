import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests with up to 25MB limit for base64 bill images
  app.use(express.json({ limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Multimodal Gemini Bill Analysis Endpoint
  app.post('/api/analyze-bill', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({
          success: false,
          error: 'Missing imageBase64 in request body.',
        });
      }

      // Ensure clean base64 data without data-URL prefix
      let cleanBase64 = imageBase64;
      let detectedMime = mimeType;

      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        cleanBase64 = parts[1];
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        if (mimeMatch) {
          detectedMime = mimeMatch[1];
        }
      }

      console.log(`[SERVER DEBUG 1] Image payload received successfully. MimeType: ${detectedMime}, Base64 length: ${cleanBase64.length} chars`);

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY is missing in environment variables');
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey || '',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptText = `You are analyzing a utility bill image (Electricity bill, Water bill, or Utility meter image). Carefully inspect the entire image, including Arabic and English text, numbers, tables, headers, digital displays, dial displays, and meter information.

Identify common utility bill or meter fields even if the layout or labels differ (Arabic or English).

1. Determine utility_type: 'electricity' or 'water'.
   - If it mentions electricity, SEC, Saudi Electricity Company, kWh, ك.و.س, الكهرباء, mark utility_type as 'electricity'.
   - If it mentions water, NWC, National Water Company, m³, m3, م³, المياه, الشركة الوطنية للمياه, mark utility_type as 'water'.

2. Recognize concepts such as:
   - Consumption amount: kWh for electricity or m³ (cubic meters) for water / كمية الاستهلاك / كمية المياه / الاستهلاك
   - Total amount / Bill amount / Amount due / المبلغ الإجمالي / صافي الفاتورة / المبلغ المطلوب / SAR / ر.س
   - Billing period / فترة الفاتورة / تاريخ الفاتورة / فترة الاستهلاك
   - Previous meter reading / القراءة السابقة
   - Current meter reading / القراءة الحالية
   - Utility company name (e.g., Saudi Electricity Company SEC or National Water Company NWC)

CRITICAL INSTRUCTION FOR bill_amount_sar:
- Locate the final total bill amount due / Total Amount / المبلغ الإجمالي / صافي الفاتورة / المبلغ المطلوب / المجموع الإجمالي.
- SPECIAL RULES FOR NATIONAL WATER COMPANY (NWC / الشركة الوطنية للمياه) WATER BILLS:
  * 1st Priority: Target the absolute total amount due field: Search explicitly for the label "المبلغ المستحق" (Amount Due) or "إجمالي المبلغ المستحق" in the summary/blue box. Extract the full value (e.g. 116.02 SAR or 116 SAR).
  * 2nd Priority: "إجمالي المبلغ الخاضع للضريبة" + "مديونيات سابقة" / total taxable amount plus prior balances.
  * IGNORE SUB-TOTALS & LINE ITEMS: DO NOT capture line-item sub-totals like "18.92" (which represents current period sub-total before line adjustments/previous balances "مبلغ الفاتورة الحالية" or "بعد الضريبة"). Ignore line item subtotals under 20 SAR when total due is listed on the bill.
- DO NOT confuse the unit tariff rate (e.g. 0.18 SAR / 18 halalas per kWh, 0.30 SAR per kWh, or 0.15 SAR per m3) with the total bill amount due!
- The total bill amount is the final total payable cost in SAR (e.g. 116.02, 185.50, 240.00, 450.00, 1200.00).
- If you see "0.18 SAR" or "18 هللة", that is the unit tariff rate per kWh, NOT the total bill amount. Look for the total amount due section!

Return ONLY valid JSON with this exact schema:
{
  "utility_type": "electricity" or "water",
  "utility_company": string or null,
  "billing_period": string or null,
  "consumption_value": number or null,
  "bill_amount_sar": number or null,
  "previous_meter_reading": number or null,
  "current_meter_reading": number or null,
  "confidence": {
    "billing_period": number (0 to 1),
    "consumption_value": number (0 to 1),
    "bill_amount_sar": number (0 to 1),
    "previous_meter_reading": number (0 to 1),
    "current_meter_reading": number (0 to 1)
  }
}`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          utility_type: {
            type: Type.STRING,
            description: 'Type of utility: electricity or water',
          },
          utility_company: {
            type: Type.STRING,
            nullable: true,
            description: 'Name of the utility company (e.g., SEC or NWC)',
          },
          billing_period: {
            type: Type.STRING,
            nullable: true,
            description: 'Billing period range or month string',
          },
          consumption_value: {
            type: Type.NUMBER,
            nullable: true,
            description: 'Total consumption (kWh for electricity, m3 for water)',
          },
          bill_amount_sar: {
            type: Type.NUMBER,
            nullable: true,
            description: 'Total bill amount or estimated cost in SAR',
          },
          previous_meter_reading: {
            type: Type.NUMBER,
            nullable: true,
            description: 'Previous meter reading value',
          },
          current_meter_reading: {
            type: Type.NUMBER,
            nullable: true,
            description: 'Current meter reading value',
          },
          confidence: {
            type: Type.OBJECT,
            properties: {
              billing_period: { type: Type.NUMBER },
              consumption_value: { type: Type.NUMBER },
              bill_amount_sar: { type: Type.NUMBER },
              previous_meter_reading: { type: Type.NUMBER },
              current_meter_reading: { type: Type.NUMBER },
            },
            required: [
              'billing_period',
              'consumption_value',
              'bill_amount_sar',
              'previous_meter_reading',
              'current_meter_reading',
            ],
          },
        },
        required: [
          'utility_type',
          'utility_company',
          'billing_period',
          'consumption_value',
          'bill_amount_sar',
          'previous_meter_reading',
          'current_meter_reading',
          'confidence',
        ],
      };

      console.log('[SERVER DEBUG 2] Sending image to Gemini Vision API (model: gemini-3.6-flash)...');

      let responseText = '';
      let attempt = 0;
      let parsedJson: any = null;

      while (attempt < 2 && !parsedJson) {
        attempt++;
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: detectedMime,
                  },
                },
                {
                  text: attempt === 1 ? promptText : `${promptText}\n\nSTRICT INSTRUCTION: Output ONLY raw JSON matching the required schema. No markdown formatting or extra text.`,
                },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema as any,
            },
          });

          responseText = response.text ? response.text.trim() : '{}';
          console.log(`[SERVER DEBUG 3] Gemini response received (Attempt ${attempt}). Length: ${responseText.length} chars`);

          parsedJson = JSON.parse(responseText);
          console.log('[SERVER DEBUG 4] JSON parsed successfully from Gemini response:', parsedJson);
        } catch (err: any) {
          console.error(`[SERVER DEBUG ERR] Gemini call/parse error on attempt ${attempt}:`, err?.message || err);
          if (attempt >= 2) throw err;
        }
      }

      // Application Code Validation
      const detectedUtilityType: 'electricity' | 'water' = parsedJson.utility_type === 'water' ? 'water' : 'electricity';
      const isElectricityBill = detectedUtilityType === 'electricity';

      let validConsumption: number | null = null;
      if (typeof parsedJson.consumption_value === 'number' && !isNaN(parsedJson.consumption_value) && parsedJson.consumption_value > 0) {
        validConsumption = parsedJson.consumption_value;
      }

      let validAmount: number | null = null;
      if (typeof parsedJson.bill_amount_sar === 'number' && !isNaN(parsedJson.bill_amount_sar) && parsedJson.bill_amount_sar > 1) {
        validAmount = parsedJson.bill_amount_sar;
      } else if (validConsumption && validConsumption > 0) {
        // Fallback: If Gemini returned tariff rate (e.g. 0.18 or 0.30 or <= 1) instead of total bill, calculate official Saudi bill amount
        if (isElectricityBill) {
          const rawCost = validConsumption <= 6000
            ? validConsumption * 0.18
            : (6000 * 0.18 + (validConsumption - 6000) * 0.30);
          validAmount = Math.round(rawCost * 1.15 * 100) / 100; // Including 15% VAT
        } else {
          let rawCost = 0;
          if (validConsumption <= 15) {
            rawCost = validConsumption * 0.15;
          } else if (validConsumption <= 30) {
            rawCost = 15 * 0.15 + (validConsumption - 15) * 1.00;
          } else if (validConsumption <= 45) {
            rawCost = 15 * 0.15 + 15 * 1.00 + (validConsumption - 30) * 3.00;
          } else {
            rawCost = 15 * 0.15 + 15 * 1.00 + 15 * 3.00 + (validConsumption - 45) * 4.00;
          }
          validAmount = Math.round(rawCost * 1.15 * 100) / 100; // Including 15% VAT
        }
      }

      let validPrevReading: number | null = null;
      if (typeof parsedJson.previous_meter_reading === 'number' && !isNaN(parsedJson.previous_meter_reading)) {
        validPrevReading = parsedJson.previous_meter_reading;
      }

      let validCurrReading: number | null = null;
      if (typeof parsedJson.current_meter_reading === 'number' && !isNaN(parsedJson.current_meter_reading)) {
        validCurrReading = parsedJson.current_meter_reading;
      }

      let validPeriod: string | null = null;
      if (typeof parsedJson.billing_period === 'string' && parsedJson.billing_period.trim().length > 0) {
        validPeriod = parsedJson.billing_period.trim();
      }

      const extractedData = {
        utilityType: detectedUtilityType,
        isElectricityBill,
        utilityCompany: parsedJson.utility_company || (isElectricityBill ? 'الشركة السعودية للكهرباء (SEC)' : 'الشركة الوطنية للمياه (NWC)'),
        electricityConsumptionKWh: isElectricityBill ? validConsumption : null,
        waterConsumptionM3: !isElectricityBill ? validConsumption : null,
        billAmountSAR: validAmount,
        billingPeriod: validPeriod,
        previousMeterReading: validPrevReading,
        currentMeterReading: validCurrReading,
        confidence: parsedJson.confidence || null,
      };

      console.log('[SERVER DEBUG 5] Validated extracted data:', extractedData);

      return res.json({
        success: true,
        extractedData,
      });
    } catch (error: any) {
      console.error('Error in /api/analyze-bill:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to analyze electricity bill with AI.',
        extractedData: {
          isElectricityBill: false,
          electricityConsumptionKWh: null,
          billAmountSAR: null,
          billingPeriod: null,
          previousMeterReading: null,
          currentMeterReading: null,
        },
      });
    }
  });

  // Vite development / production static server configuration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoBill full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
