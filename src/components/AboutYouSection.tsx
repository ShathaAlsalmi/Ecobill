import React from 'react';
import { User, Mail, Phone, Info } from 'lucide-react';
import { Language, translations } from '../translations';

interface AboutYouSectionProps {
  fullName: string;
  setFullName: (val: string) => void;
  contact: string;
  setContact: (val: string) => void;
  errors: { fullName?: string; contact?: string };
  language: Language;
}

export const AboutYouSection: React.FC<AboutYouSectionProps> = ({
  fullName,
  setFullName,
  contact,
  setContact,
  errors,
  language,
}) => {
  const t = translations[language];

  return (
    <div id="section-about-you" className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
          1
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t.aboutYouTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.aboutYouSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {t.fullNameLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-slate-400 dark:text-slate-500`}>
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.fullNamePlaceholder}
              className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border ${
                errors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-200/50'
              } rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-4 transition-all`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email or Phone Field */}
        <div>
          <label htmlFor="contact" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {t.contactLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-slate-400 dark:text-slate-500`}>
              {contact.includes('@') ? (
                <Mail className="w-4 h-4" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
            </div>
            <input
              type="text"
              id="contact"
              name="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t.contactPlaceholder}
              className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border ${
                errors.contact ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-200/50'
              } rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-4 transition-all`}
            />
          </div>

          {errors.contact ? (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {errors.contact}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              {t.contactNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
