import React, { useState, useEffect } from 'react';
import { Coins, Lightbulb, Zap, Droplets, Sparkles } from 'lucide-react';
import { Language } from '../translations';
import { AIFinancialRoiAgent } from './AIFinancialRoiAgent';
import { AdvisorAgent } from './AdvisorAgent';

interface AIAssistantsPageProps {
  language: Language;
  userName?: string;
  city?: string;
  familyMembers?: number;
  consumptionKWh?: number;
  consumptionM3?: number;
  billAmountSAR?: number | null;
  billingPeriod?: string | null;
}

export const AIAssistantsPage: React.FC<AIAssistantsPageProps> = ({
  language,
  userName = 'Layan',
  city = 'Riyadh',
  familyMembers = 3,
  consumptionKWh = 1260,
  consumptionM3 = 35,
  billAmountSAR = null,
  billingPeriod = null,
}) => {
  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'financial' | 'advisor'>('financial');
  const [utilityType, setUtilityType] = useState<'electricity' | 'water'>('electricity');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card & Tab Bar Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6 transition-colors print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isArabic ? 'مركز الوكلاء الذكيين (AI Agents Hub)' : 'AI Agents Hub'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isArabic
                ? 'مركز ذكاء اصطناعي موحد لحساب العائد المالي (ROI) وصياغة خطط الترشيد الشهرية التفاعلية.'
                : 'Unified AI intelligence hub for financial ROI simulation and dynamic monthly efficiency action planning.'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs: [Financial Agent (ROI) | Smart Advisor Agent] */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('financial')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'financial'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4 text-emerald-200" />
              <span>{isArabic ? 'المستشار المالي (ROI)' : 'Financial Agent (ROI)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('advisor')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'advisor'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-emerald-200" />
              <span>{isArabic ? 'مستشار الترشيد (Plan)' : 'Smart Advisor Agent'}</span>
            </button>
          </div>

          {/* Sub-Utility Toggle Selector: [⚡ Electricity (SEC) | 💧 Water (NWC)] */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setUtilityType('electricity')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                utilityType === 'electricity'
                  ? 'bg-slate-900 text-amber-400 dark:bg-slate-950 dark:text-amber-400 border border-amber-500/30 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{isArabic ? 'الكهرباء (SEC)' : 'Electricity (SEC)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setUtilityType('water')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                utilityType === 'water'
                  ? 'bg-slate-900 text-sky-400 dark:bg-slate-950 dark:text-sky-400 border border-sky-500/30 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
              <span>{isArabic ? 'المياه (NWC)' : 'Water (NWC)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Render View */}
      {activeTab === 'financial' ? (
        <AIFinancialRoiAgent
          consumptionKWh={consumptionKWh}
          consumptionM3={consumptionM3}
          utilityType={utilityType}
          billAmountSAR={billAmountSAR}
          billingPeriod={billingPeriod}
          language={language}
        />
      ) : (
        <AdvisorAgent
          language={language}
          userName={userName}
          city={city}
          familyMembers={familyMembers}
          activeUtilityType={utilityType}
          onUtilityTypeChange={setUtilityType}
        />
      )}
    </div>
  );
};
