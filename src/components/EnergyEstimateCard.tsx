import React from 'react';
import { Zap, TrendingUp, Sparkles, Leaf } from 'lucide-react';
import { Appliance } from '../types';
import { calculateDailyKWh } from '../data/appliancePresets';

interface EnergyEstimateCardProps {
  appliances: Appliance[];
  familyMembers: number;
  homeSizeM2: number;
}

export const EnergyEstimateCard: React.FC<EnergyEstimateCardProps> = ({
  appliances,
  familyMembers,
  homeSizeM2,
}) => {
  const dailyKWh = calculateDailyKWh(appliances);
  const monthlyKWh = Math.round(dailyKWh * 30);
  const estimatedCostMonthlyUSD = Math.round(monthlyKWh * 0.14); // Average ~ $0.14 per kWh

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left side info */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Energy Baseline Preview</span>
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Estimated Energy Footprint
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-sm">
            Calculated in real-time based on your {appliances.length} configured appliance devices &amp; {homeSizeM2 || 0} m² home profile.
          </p>
        </div>

        {/* Right side metric grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 border-t md:border-t-0 md:border-l border-slate-700/80 pt-4 md:pt-0 md:pl-6">
          {/* Daily kWh */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/70 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Daily Usage
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 fill-emerald-400" />
              {dailyKWh} <span className="text-xs text-slate-300 font-medium">kWh</span>
            </div>
          </div>

          {/* Monthly kWh */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/70 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Monthly Est.
            </span>
            <div className="text-xl sm:text-2xl font-black text-teal-300 mt-0.5">
              {monthlyKWh} <span className="text-xs text-slate-300 font-medium">kWh</span>
            </div>
          </div>

          {/* Est. Cost */}
          <div className="col-span-2 sm:col-span-1 bg-emerald-950/50 backdrop-blur border border-emerald-500/30 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              Est. Bill
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
              ~${estimatedCostMonthlyUSD} <span className="text-xs text-emerald-200/80 font-normal">/mo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
