import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
  ArrowRight,
  HelpCircle,
  Image as ImageIcon,
  Check,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExtractedBillData, BillRecord } from '../types';
import { SAMPLE_BILLS, SampleBillItem } from '../data/sampleBills';

interface BillUploadSectionProps {
  onBillConfirmed?: (billRecord: BillRecord) => void;
  savedBillRecord?: BillRecord | null;
}

export const BillUploadSection: React.FC<BillUploadSectionProps> = ({
  onBillConfirmed,
  savedBillRecord,
}) => {
  // State for image file / URL
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    savedBillRecord?.imageUrl || null
  );
  const [selectedFileName, setSelectedFileName] = useState<string | null>(
    savedBillRecord ? 'Uploaded Electricity Bill' : null
  );

  // Analysis & Loading state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedBillData | null>(
    savedBillRecord?.extractedData || null
  );

  // Confirmation state
  const [isConfirmed, setIsConfirmed] = useState<boolean>(
    savedBillRecord?.confirmed || false
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core trigger: Automatic AI Analysis immediately after image selection
  const analyzeImageWithAI = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setExtractedData(null);
    setIsConfirmed(false);

    try {
      // Determine mimeType
      let mimeType = 'image/jpeg';
      if (imageDataUrl.startsWith('data:application/pdf')) mimeType = 'application/pdf';
      else if (imageDataUrl.startsWith('data:image/png')) mimeType = 'image/png';
      else if (imageDataUrl.startsWith('data:image/webp')) mimeType = 'image/webp';
      else if (imageDataUrl.startsWith('data:image/svg+xml')) mimeType = 'image/svg+xml';
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
        throw new Error(resData.error || 'Server failed to analyze the image.');
      }

      setExtractedData(resData.extractedData);
    } catch (err: any) {
      console.error('Error in analyzeImageWithAI:', err);
      setAnalysisError(
        err.message || 'Unable to connect to AI vision server. Please try again.'
      );
      // Even on network error, ensure extractedData structure with nulls
      setExtractedData({
        electricityConsumptionKWh: null,
        billAmountSAR: null,
        billingPeriod: null,
        previousMeterReading: null,
        currentMeterReading: null,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler for user picking a local bill file (image or PDF)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) {
      setAnalysisError('Please select a valid bill file (JPEG, PNG, WEBP, or PDF).');
      return;
    }

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImageUrl(result);
      // Trigger automatic AI analysis immediately!
      analyzeImageWithAI(result);
    };
    reader.readAsDataURL(file);
  };

  // Handler for drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isImage || isPdf) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setSelectedImageUrl(result);
        analyzeImageWithAI(result);
      };
      reader.readAsDataURL(file);
    } else {
      setAnalysisError('Please select a valid bill file (JPEG, PNG, WEBP, or PDF).');
    }
  };

  // Handler for sample bills
  const handleSelectSample = (sample: SampleBillItem) => {
    setSelectedImageUrl(sample.dataUrl);
    setSelectedFileName(`${sample.title}.png`);
    analyzeImageWithAI(sample.dataUrl);
  };

  // Reset & Upload Another Bill
  const handleUploadAnother = () => {
    setSelectedImageUrl(null);
    setSelectedFileName(null);
    setExtractedData(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setIsConfirmed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Confirm & Continue handler
  const handleConfirm = () => {
    if (!selectedImageUrl || !extractedData) return;

    setIsConfirmed(true);
    const record: BillRecord = {
      id: `BILL-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      imageUrl: selectedImageUrl,
      extractedData,
      confirmed: true,
    };

    if (onBillConfirmed) {
      onBillConfirmed(record);
    }
  };

  // Utility to render field values or "Could not be identified"
  const renderFieldValue = (
    val: number | string | null | undefined,
    unit = '',
    formatNumber = false
  ) => {
    if (val === null || val === undefined || val === '') {
      return (
        <span className="inline-flex items-center gap-1.5 text-slate-400 font-normal italic text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          Could not be identified
        </span>
      );
    }

    let formatted = val.toString();
    if (formatNumber && typeof val === 'number') {
      formatted = val.toLocaleString();
    }

    return (
      <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
        {formatted} {unit && <span className="text-xs font-sans font-semibold text-slate-500">{unit}</span>}
      </span>
    );
  };

  return (
    <div id="section-bill-upload" className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              Electricity Bill Upload
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Automatic Multimodal AI
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Upload your bill image and EcoBill will instantly extract consumption &amp; meter data
            </p>
          </div>
        </div>

        {selectedImageUrl && !isAnalyzing && (
          <button
            type="button"
            onClick={handleUploadAnother}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Upload Another Bill
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/heic,application/pdf,.pdf"
        className="hidden"
      />

      {/* Upload Drop Zone / Image Display */}
      {!selectedImageUrl ? (
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform text-emerald-600">
              <Upload className="w-8 h-8 text-emerald-600" />
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">
              Click to <span className="text-emerald-600">Upload Electricity Bill</span> or drag and drop
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Supports PNG, JPG, WEBP, or PDF files of your official bill or tax invoice
            </p>

            <button
              type="button"
              id="btn-upload-bill-file"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Select Bill File (Image or PDF)</span>
            </button>
          </div>

          {/* Quick Sample Bills for Hackathon Demonstration */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Quick Test Samples (Instant Demo):
              </span>
              <span className="text-[11px] text-slate-400">Click any bill to auto-analyze</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_BILLS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {sample.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{sample.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview + AI Analysis State */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Bill Thumbnail Preview */}
            <div className="md:col-span-5 bg-slate-900 rounded-2xl p-3 border border-slate-800 relative group overflow-hidden">
              <div className="relative aspect-[3/4] w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
                {selectedImageUrl?.startsWith('data:application/pdf') || selectedFileName?.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full h-full min-h-[220px] bg-slate-900 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-3 border border-slate-800">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 max-w-[180px] truncate">{selectedFileName || 'PDF Document'}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-rose-500/30 text-rose-300">
                      PDF Document
                    </span>
                  </div>
                ) : (
                  <img
                    src={selectedImageUrl}
                    alt="Electricity Bill"
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Laser scan animation overlay while analyzing */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
                    <motion.div
                      animate={{ y: ['-100%', '100%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399]"
                    />
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mb-3 animate-pulse">
                      <Sparkles className="w-6 h-6 text-emerald-300" />
                    </div>
                    <p className="text-xs font-bold text-emerald-300 text-center tracking-wide">
                      AI Multimodal Scanner Active
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="truncate max-w-[200px]">{selectedFileName}</span>
                <button
                  type="button"
                  onClick={handleUploadAnother}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Change Image
                </button>
              </div>
            </div>

            {/* Analysis Result Box */}
            <div className="md:col-span-7 space-y-4">
              {/* 1. Loading State */}
              {isAnalyzing && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Analyzing your electricity bill with AI...
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Gemini vision model is extracting kWh, SAR amount, billing period, and meter readings.
                    </p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {analysisError && !isAnalyzing && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Analysis Warning:</p>
                    <p className="mt-0.5">{analysisError}</p>
                  </div>
                </div>
              )}

              {/* 2. Display Extracted Information */}
              {!isAnalyzing && extractedData && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          AI Multimodal Analysis Complete
                        </h4>
                        <p className="text-xs text-slate-500">
                          Data extracted directly from your bill image
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-200/60 px-2.5 py-1 rounded-full">
                      Gemini Vision
                    </span>
                  </div>

                  {/* 5 Extracted Fields Table/Grid */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3">
                    {/* Electricity Consumption (kWh) */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block">
                          Electricity Consumption
                        </span>
                        <span className="text-[11px] text-slate-400">Total kWh used</span>
                      </div>
                      <div className="text-right">
                        {renderFieldValue(
                          extractedData.electricityConsumptionKWh,
                          'kWh',
                          true
                        )}
                      </div>
                    </div>

                    {/* Bill Amount (SAR) */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block">
                          Bill Amount
                        </span>
                        <span className="text-[11px] text-slate-400">Total monetary charge</span>
                      </div>
                      <div className="text-right">
                        {renderFieldValue(extractedData.billAmountSAR, 'SAR', true)}
                      </div>
                    </div>

                    {/* Billing Period */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block">
                          Billing Period
                        </span>
                        <span className="text-[11px] text-slate-400">Invoice cycle dates</span>
                      </div>
                      <div className="text-right">
                        {renderFieldValue(extractedData.billingPeriod)}
                      </div>
                    </div>

                    {/* Previous Meter Reading */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block">
                          Previous Meter Reading
                        </span>
                        <span className="text-[11px] text-slate-400">Start index</span>
                      </div>
                      <div className="text-right">
                        {renderFieldValue(
                          extractedData.previousMeterReading,
                          '',
                          true
                        )}
                      </div>
                    </div>

                    {/* Current Meter Reading */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block">
                          Current Meter Reading
                        </span>
                        <span className="text-[11px] text-slate-400">End index</span>
                      </div>
                      <div className="text-right">
                        {renderFieldValue(
                          extractedData.currentMeterReading,
                          '',
                          true
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Review Statement Required */}
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Please review the information before continuing.</span>
                  </div>

                  {/* 4. Action Buttons: Confirm & Continue OR Upload Another Bill */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      id="btn-confirm-bill-data"
                      onClick={handleConfirm}
                      disabled={isConfirmed}
                      className={`w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                        isConfirmed
                          ? 'bg-emerald-700 text-white cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98]'
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Bill Confirmed &amp; Linked</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm &amp; Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleUploadAnother}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                      <span>Upload Another Bill</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
