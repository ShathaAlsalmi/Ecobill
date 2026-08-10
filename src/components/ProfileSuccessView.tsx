import React from 'react';
import {
  CheckCircle2,
  User,
  Home,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import { HomeProfile } from '../types';
import { renderApplianceIcon } from './AppliancesSection';
import { Language, translations, getTranslatedApplianceType, toLocalDigits } from '../translations';

interface ProfileSuccessViewProps {
  profile: HomeProfile;
  onEditProfile: () => void;
  language: Language;
}

export const ProfileSuccessView: React.FC<ProfileSuccessViewProps> = ({
  profile,
  onEditProfile,
  language,
}) => {
  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Success Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-950/30 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">
          {t.setupComplete}
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.profileCreated}
        </h2>
        <p className="text-emerald-100 text-sm sm:text-base max-w-lg mx-auto mt-2 leading-relaxed">
          {t.welcomeMessage.replace('{name}', profile.user.fullName)}
        </p>

        {/* Action button to edit */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-semibold text-xs sm:text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.editProfileData}</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              {t.passportTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {t.householdId}: <span className="font-mono text-slate-700">{profile.id}</span>
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.profileVerified}</span>
          </div>
        </div>

        {/* 3 Summary Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User Info */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 mb-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>{t.resident}</span>
            </div>
            <p className="font-bold text-slate-800 text-base">{profile.user.fullName}</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{profile.user.contact}</p>
          </div>

          {/* Home Metrics */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 mb-2">
              <Home className="w-4 h-4 text-teal-600" />
              <span>{t.property}</span>
            </div>
            <p className="font-bold text-slate-800 text-base">
              {toLocalDigits(profile.home.homeSizeM2, language)} {language === 'ar' ? 'م²' : 'm²'}
              {profile.home.city && (
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-2 font-semibold inline-block">
                  {profile.home.city}
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">{toLocalDigits(profile.home.familyMembers, language)} {t.familyMembersCount}</p>
          </div>

          {/* Energy Metrics */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-800 mb-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>{t.estConsumption}</span>
            </div>
            <p className="font-extrabold text-emerald-900 text-base">
              {toLocalDigits(profile.estimatedDailyKWh, language)} {t.kwh} <span className="text-xs font-normal text-emerald-700">{t.perDay}</span>
            </p>
            <p className="text-xs text-emerald-700 mt-1 font-medium">
              ~{toLocalDigits(profile.estimatedMonthlyKWh, language)} {t.kwh} {t.monthlyBaseline}
            </p>
          </div>
        </div>

        {/* Configured Appliances List */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            {t.configuredAppliances} ({toLocalDigits(profile.appliances.length, language)})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.appliances.map((app) => (
              <div
                key={app.id}
                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    {renderApplianceIcon(app.type, 'w-4 h-4')}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {getTranslatedApplianceType(app.type, language)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {toLocalDigits(app.units, language)} {app.units > 1 ? t.unitsCount : t.unitCount} • {toLocalDigits(app.hoursPerDay, language)} {t.hrsDay}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {toLocalDigits((Math.round((app.units * app.hoursPerDay * app.estimatedWattage) / 1000 * 10) / 10).toString(), language)} {t.kwh}{language === 'ar' ? '/يوم' : '/d'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Step Teaser Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {t.nextStageReady}
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                {t.nextStageSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="w-full sm:w-auto text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <span>{t.updateParameters}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
