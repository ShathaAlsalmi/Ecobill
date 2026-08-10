import React from 'react';
import {
  Zap,
  Plus,
  Minus,
  Trash2,
  Info,
  AirVent,
  Tv,
  WashingMachine,
  Sparkles,
  Flame,
  Lightbulb,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Appliance } from '../types';
import { COMMON_APPLIANCES, getPresetForType } from '../data/appliancePresets';
import { Language, translations, getTranslatedApplianceType, toLocalDigits } from '../translations';

interface AppliancesSectionProps {
  appliances: Appliance[];
  setAppliances: React.Dispatch<React.SetStateAction<Appliance[]>>;
  errors: { appliances?: string };
  language: Language;
}

// Icon helper function based on type name
export const renderApplianceIcon = (type: string, className = 'w-5 h-5') => {
  switch (type) {
    case 'Air Conditioner':
      return <AirVent className={`${className} text-sky-600`} />;
    case 'Refrigerator':
      return <Layers className={`${className} text-cyan-600`} />;
    case 'Television':
      return <Tv className={`${className} text-indigo-600`} />;
    case 'Washing Machine':
      return <WashingMachine className={`${className} text-blue-600`} />;
    case 'Dishwasher':
      return <Sparkles className={`${className} text-teal-600`} />;
    case 'Water Heater':
      return <Flame className={`${className} text-amber-600`} />;
    case 'Lighting':
      return <Lightbulb className={`${className} text-yellow-500`} />;
    default:
      return <Zap className={`${className} text-emerald-600`} />;
  }
};

export const AppliancesSection: React.FC<AppliancesSectionProps> = ({
  appliances,
  setAppliances,
  errors,
  language,
}) => {
  const t = translations[language];

  // Sync appliance count when top number input changes
  const handleCountChange = (newCount: number) => {
    const target = Math.max(1, Math.min(20, newCount));
    if (target > appliances.length) {
      const addedCount = target - appliances.length;
      const newItems: Appliance[] = [];
      for (let i = 0; i < addedCount; i++) {
        // cycle through preset options for reasonable defaults
        const defaultPreset = COMMON_APPLIANCES[(appliances.length + i) % COMMON_APPLIANCES.length];
        newItems.push({
          id: `appliance-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: defaultPreset.type,
          units: 1,
          hoursPerDay: defaultPreset.defaultHours,
          estimatedWattage: defaultPreset.defaultWattage,
        });
      }
      setAppliances([...appliances, ...newItems]);
    } else if (target < appliances.length) {
      setAppliances(appliances.slice(0, target));
    }
  };

  const handleAddAppliance = () => {
    const defaultPreset = COMMON_APPLIANCES[appliances.length % COMMON_APPLIANCES.length];
    const newItem: Appliance = {
      id: `appliance-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: defaultPreset.type,
      units: 1,
      hoursPerDay: defaultPreset.defaultHours,
      estimatedWattage: defaultPreset.defaultWattage,
    };
    setAppliances([...appliances, newItem]);
  };

  const handleRemoveAppliance = (id: string) => {
    if (appliances.length <= 1) return; // Keep at least 1
    setAppliances(appliances.filter((a) => a.id !== id));
  };

  const handleUpdateAppliance = (id: string, key: keyof Appliance, value: any) => {
    setAppliances((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const updated = { ...app, [key]: value };

        // If type changed, update default wattage if user hasn't overridden
        if (key === 'type') {
          const preset = getPresetForType(value as string);
          updated.estimatedWattage = preset.defaultWattage;
          if (updated.hoursPerDay === 0 || updated.hoursPerDay === getPresetForType(app.type).defaultHours) {
            updated.hoursPerDay = preset.defaultHours;
          }
        }
        return updated;
      })
    );
  };

  return (
    <div id="section-appliances" className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
              {t.appliancesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.appliancesSubtitle}
            </p>
          </div>
        </div>

        {/* Dynamic appliance total counter */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl self-start sm:self-auto" dir="ltr">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mr-1">
            {t.totalDevices}
          </span>
          <button
            type="button"
            onClick={() => handleCountChange(Math.max(1, appliances.length - 1))}
            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer shrink-0"
            title={language === 'ar' ? 'تقليل عدد الأجهزة' : 'Decrease total devices'}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center font-bold text-emerald-700 dark:text-emerald-400 text-sm font-mono">
            {toLocalDigits(appliances.length, language)}
          </span>
          <button
            type="button"
            onClick={() => handleCountChange(Math.min(20, appliances.length + 1))}
            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer shrink-0"
            title={language === 'ar' ? 'زيادة عدد الأجهزة' : 'Increase total devices'}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {errors.appliances && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{errors.appliances}</span>
        </div>
      )}

      {/* Dynamic Appliance List */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {appliances.map((appliance, index) => {
            const currentPreset = getPresetForType(appliance.type);

            return (
              <motion.div
                key={appliance.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 relative hover:border-emerald-300 dark:hover:border-emerald-500 transition-all group"
              >
                {/* Header row inside item */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {renderApplianceIcon(appliance.type, 'w-5 h-5')}
                    </div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {t.applianceNumber} #{index + 1}
                    </span>
                  </div>

                  {appliances.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAppliance(appliance.id)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                      title={t.removeAppliance}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{t.removeAppliance}</span>
                    </button>
                  )}
                </div>

                {/* Form fields grid for each appliance */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
                  {/* Appliance Type Dropdown */}
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.applianceType}
                    </label>
                    <select
                      value={appliance.type}
                      onChange={(e) => handleUpdateAppliance(appliance.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      {COMMON_APPLIANCES.map((preset) => (
                        <option key={preset.type} value={preset.type} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {getTranslatedApplianceType(preset.type, language)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Units Count */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.numberOfUnits}
                    </label>
                    <div className="relative flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500" dir="ltr">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateAppliance(
                            appliance.id,
                            'units',
                            Math.max(1, appliance.units - 1)
                          )
                        }
                        className="w-8 h-9 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors border-r border-slate-200 dark:border-slate-600 shrink-0"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={toLocalDigits(appliance.units, language)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d٠١٢٣٤٥٦٧٨٩]/g, '');
                          const western = raw.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                          const val = parseInt(western, 10);
                          handleUpdateAppliance(
                            appliance.id,
                            'units',
                            isNaN(val) ? 1 : Math.max(1, Math.min(50, val))
                          );
                        }}
                        className="w-full text-center text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none bg-transparent py-2 px-1 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateAppliance(
                            appliance.id,
                            'units',
                            Math.min(50, appliance.units + 1)
                          )
                        }
                        className="w-8 h-9 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors border-l border-slate-200 dark:border-slate-600 shrink-0"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Avg Usage Hours per Day */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span>{t.usageHoursPerDay}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">{toLocalDigits(appliance.hoursPerDay, language)} {language === 'ar' ? 'س/يوم' : 'hrs/day'}</span>
                    </label>
                    <div className="relative flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500" dir="ltr">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateAppliance(
                            appliance.id,
                            'hoursPerDay',
                            Math.max(0.5, Math.round((appliance.hoursPerDay - 0.5) * 2) / 2)
                          )
                        }
                        className="w-8 h-9 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors border-r border-slate-200 dark:border-slate-600 shrink-0"
                      >
                        -
                      </button>
                      <div className="relative flex-1 flex items-center justify-center px-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-1 shrink-0" />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={toLocalDigits(appliance.hoursPerDay, language)}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d.٠١٢٣٤٥٦٧٨٩]/g, '');
                            const western = raw.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                            const val = parseFloat(western);
                            handleUpdateAppliance(
                              appliance.id,
                              'hoursPerDay',
                              isNaN(val) ? 1 : Math.max(0.1, Math.min(24, val))
                            );
                          }}
                          className="w-full text-center text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none bg-transparent py-2 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateAppliance(
                            appliance.id,
                            'hoursPerDay',
                            Math.min(24, Math.round((appliance.hoursPerDay + 0.5) * 2) / 2)
                          )
                        }
                        className="w-8 h-9 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors border-l border-slate-200 dark:border-slate-600 shrink-0"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footnote preset info tag */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="italic">
                    {language === 'ar' ? 'قدرة افتراضية معتمدة على مواصفات الجهاز' : currentPreset.description}
                  </span>
                  <span className="font-mono bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800 font-medium">
                    ~{appliance.estimatedWattage * appliance.units}W {t.powerDraw}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Appliance Action Button */}
      <div className="mt-5 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleAddAppliance}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800 font-semibold text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>{t.addAnotherAppliance}</span>
        </button>

        <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{t.applianceNote}</span>
        </div>
      </div>
    </div>
  );
};
