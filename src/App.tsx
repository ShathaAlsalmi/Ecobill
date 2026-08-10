import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  AlertCircle,
  Leaf,
  Globe,
  X,
  Check,
  HelpCircle,
  Shield,
  FileText,
  Layers,
  Zap,
  Tag,
  User,
  LogOut,
  TrendingDown,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';

import { Header } from './components/Header';
import { AboutYouSection } from './components/AboutYouSection';
import { AboutHomeSection } from './components/AboutHomeSection';
import { AppliancesSection } from './components/AppliancesSection';
import { ElectricityBillPage } from './components/ElectricityBillPage';
import { DashboardPage } from './components/DashboardPage';
import { ProfileSuccessView } from './components/ProfileSuccessView';
import DigitalTwin3D from './components/DigitalTwin';
import { BenchmarkingView } from './components/BenchmarkingView';
import { AIAssistantsPage } from './components/AIAssistantsPage';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { AuthModal, AuthUserData } from './components/AuthModal';
import { HomeProfileWizardModal } from './components/HomeProfileWizardModal';
import { auth, signOut, onAuthStateChanged } from './lib/firebase';

import { Appliance, HomeProfile, BillRecord } from './types';
import { calculateDailyKWh } from './data/appliancePresets';
import { MOCK_DEMO_BILLS } from './data/sampleBills';
import { Language, translations } from './translations';
import { safeSaveBillsToLocalStorage, compressImageDataUrl } from './utils/imageCompressor';

const STORAGE_KEY = 'ecobill_home_profile';
const SAVED_BILLS_STORAGE_KEY = 'ecobill_saved_bills';
const LANGUAGE_STORAGE_KEY = 'ecobill_language';
const THEME_STORAGE_KEY = 'ecobill_theme';
const AUTH_STORAGE_KEY = 'ecobill_is_auth';
const USER_STORAGE_KEY = 'ecobill_user_data';

type PageView =
  | 'settings'
  | 'electricity_bill'
  | 'digital_twin'
  | 'benchmarking'
  | 'dashboard'
  | 'ai_assistants';

export default function App() {
  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch {
      // ignore
    }
    return 'light';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Language state ('en' | 'ar')
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const t = translations[language];

  // Active header modals ('product' | 'solutions' | 'pricing' | 'support' | null)
  const [activeModal, setActiveModal] = useState<'product' | 'solutions' | 'pricing' | 'support' | null>(null);

  // Pricing section state on landing page
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<string>('smart');

  // Authentication State (Pre-Firebase Ready)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Navigation active page and nav item (3 primary tabs: settings, electricity_bill, digital_twin, benchmarking, dashboard)
  const [activePage, setActivePage] = useState<PageView>('settings');
  const [activeNavItem, setActiveNavItem] = useState<NavItemKey>('settings');

  // Form state
  const [fullName, setFullName] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<number>(3);
  const [homeSizeM2, setHomeSizeM2] = useState<number>(85);
  const [city, setCity] = useState<string>('Riyadh');
  const [floors, setFloors] = useState<number>(1);

  // Setup Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  // Initial default appliances
  const [appliances, setAppliances] = useState<Appliance[]>([
    {
      id: 'appliance-1',
      type: 'Air Conditioner',
      units: 1,
      hoursPerDay: 8,
      estimatedWattage: 1500,
    },
    {
      id: 'appliance-2',
      type: 'Refrigerator',
      units: 1,
      hoursPerDay: 24,
      estimatedWattage: 180,
    },
    {
      id: 'appliance-3',
      type: 'Television',
      units: 1,
      hoursPerDay: 4,
      estimatedWattage: 110,
    },
    {
      id: 'appliance-4',
      type: 'Washing Machine',
      units: 1,
      hoursPerDay: 1.5,
      estimatedWattage: 600,
    },
  ]);

  // Validation errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    contact?: string;
    familyMembers?: string;
    homeSizeM2?: string;
    appliances?: string;
  }>({});

  // Created profile & bill state
  const [savedProfile, setSavedProfile] = useState<HomeProfile | null>(null);
  const [savedBills, setSavedBills] = useState<BillRecord[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Firebase Auth State Listener & Handlers
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (firebaseUser) {
            setIsAuthenticated(true);
            setCurrentUser((prev) => ({
              email: firebaseUser.email || prev?.email || '',
              fullName: prev?.fullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            }));
          } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        },
        (error) => {
          console.warn('Firebase Auth State listener error:', error);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firebase Auth state error:', err);
    }
  }, []);

  const handleSignUp = (userData: AuthUserData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    if (userData.fullName && !fullName) {
      setFullName(userData.fullName);
    }
    if (userData.email && !contact) {
      setContact(userData.email);
    }
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
    // Redirect to settings on successful sign-up
    setActivePage('settings');
    setActiveNavItem('settings');
  };

  const handleLogin = (userData: AuthUserData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    if (userData.fullName && !fullName) {
      setFullName(userData.fullName);
    }
    if (userData.email && !contact) {
      setContact(userData.email);
    }
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
    // Redirect to settings on successful sign-in
    setActivePage('settings');
    setActiveNavItem('settings');
  };

  const handleDemoLogin = () => {
    const demoUser: AuthUserData = {
      email: 'demo@ecobill.sa',
      fullName: language === 'ar' ? 'عرض تجريبي / Demo User' : 'Demo Resident',
    };
    setCurrentUser(demoUser);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    // Pre-load rich default profile (3 Family Members, 85 m², Riyadh)
    const demoProfile: HomeProfile = {
      id: 'ECO-DEMO-2026',
      createdAt: new Date().toISOString(),
      user: {
        fullName: demoUser.fullName,
        contact: demoUser.email,
      },
      home: {
        familyMembers: 3,
        homeSizeM2: 85,
        city: 'Riyadh',
        floors: 1,
      },
      appliancesCount: 4,
      appliances: [
        { id: 'app-1', type: 'Air Conditioner', units: 2, hoursPerDay: 10, estimatedWattage: 1800 },
        { id: 'app-2', type: 'Water Heater', units: 1, hoursPerDay: 4, estimatedWattage: 1200 },
        { id: 'app-3', type: 'Refrigerator', units: 1, hoursPerDay: 24, estimatedWattage: 180 },
        { id: 'app-4', type: 'Washing Machine', units: 1, hoursPerDay: 2, estimatedWattage: 600 },
      ],
      estimatedDailyKWh: 42,
      estimatedMonthlyKWh: 1260,
    };

    setSavedProfile(demoProfile);
    setSavedBills(MOCK_DEMO_BILLS);

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoUser));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoProfile));
      safeSaveBillsToLocalStorage(SAVED_BILLS_STORAGE_KEY, MOCK_DEMO_BILLS);
    } catch (e) {
      console.error(e);
    }

    setActivePage('settings');
    setActiveNavItem('settings');
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error signing out:', e);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setActivePage('settings');
    setActiveNavItem('settings');
  };

  // Update HTML direction when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEY);
      if (storedProfile) {
        const parsed: HomeProfile = JSON.parse(storedProfile);
        if (parsed && parsed.user && parsed.home && parsed.appliances) {
          setSavedProfile(parsed);
          setFullName(parsed.user.fullName);
          setContact(parsed.user.contact);
          setFamilyMembers(parsed.home.familyMembers);
          setHomeSizeM2(parsed.home.homeSizeM2);
          if (parsed.home.city) setCity(parsed.home.city);
          setAppliances(parsed.appliances);
          setIsSubmitted(true);
        }
      }

      const storedBills = localStorage.getItem(SAVED_BILLS_STORAGE_KEY);
      if (storedBills) {
        const parsedBills: BillRecord[] = JSON.parse(storedBills);
        if (Array.isArray(parsedBills)) {
          setSavedBills(parsedBills);
        }
      }
    } catch (e) {
      console.error('Error reading saved profile/bills:', e);
    }
  }, []);

  // Save new bill
  const handleSaveBill = async (newBill: BillRecord) => {
    let processedBill = newBill;
    if (newBill.imageUrl) {
      try {
        const compressedImage = await compressImageDataUrl(newBill.imageUrl);
        processedBill = { ...newBill, imageUrl: compressedImage };
      } catch (e) {
        console.warn('Image compression skipped:', e);
      }
    }

    setSavedBills((prev) => {
      const updated = [...prev, processedBill];
      safeSaveBillsToLocalStorage(SAVED_BILLS_STORAGE_KEY, updated);
      return updated;
    });
  };

  // Delete bill
  const handleDeleteBill = (id: string) => {
    setSavedBills((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      safeSaveBillsToLocalStorage(SAVED_BILLS_STORAGE_KEY, updated);
      return updated;
    });
  };

  // Bottom taskbar selection logic (3 primary tabs: settings, electricity_bill, dashboard)
  const handleSelectNavItem = (item: NavItemKey) => {
    setActiveNavItem(item);
    setActivePage(item);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  // Toggle language between English and Arabic
  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  // Form validation handler
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = language === 'ar' ? 'الرجاء إدخال الاسم الكامل (حرفين على الأقل)' : 'Please enter your full name (at least 2 characters)';
    }

    if (!contact.trim()) {
      newErrors.contact = language === 'ar' ? 'الرجاء إدخال بريد إلكتروني أو رقم هاتف صحيح' : 'Please enter a valid email or phone number';
    } else {
      const isEmail = contact.includes('@') && contact.includes('.');
      const isPhone = /^[0-9+\s\-()]{7,}$/.test(contact.trim());
      if (!isEmail && !isPhone) {
        newErrors.contact = language === 'ar' ? 'الرجاء إدخال بريد إلكتروني أو رقم هاتف صحيح' : 'Please enter a valid email address or phone number';
      }
    }

    if (!familyMembers || familyMembers < 1) {
      newErrors.familyMembers = language === 'ar' ? 'يلزم تحديد فرد واحد على الأقل' : 'At least 1 family member is required';
    }

    if (!homeSizeM2 || homeSizeM2 <= 0) {
      newErrors.homeSizeM2 = language === 'ar' ? 'الرجاء تحديد مساحة منزل صحيحة بالمتر المربع' : 'Please specify a valid home size in m²';
    }

    if (!appliances || appliances.length === 0) {
      newErrors.appliances = language === 'ar' ? 'الرجاء تكوين جهاز كهربائي واحد على الأقل' : 'Please configure at least one household appliance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission handler for Home Profile Setup Wizard Modal
  const handleWizardSubmit = () => {
    const dailyKWh = calculateDailyKWh(appliances);
    const monthlyKWh = Math.round(dailyKWh * 30);

    const newProfile: HomeProfile = {
      id: savedProfile?.id || `ECO-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: savedProfile?.createdAt || new Date().toISOString(),
      user: {
        fullName: fullName.trim() || currentUser?.fullName || (language === 'ar' ? 'مستخدم إيكوبيل' : 'EcoBill Resident'),
        contact: contact.trim() || currentUser?.email || 'resident@ecobill.sa',
      },
      home: {
        familyMembers,
        homeSizeM2,
        city,
        floors,
      },
      appliancesCount: appliances.length,
      appliances,
      estimatedDailyKWh: dailyKWh,
      estimatedMonthlyKWh: monthlyKWh,
    };

    setSavedProfile(newProfile);
    setIsSubmitted(true);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch (err) {
      console.error('Failed to save profile to localStorage:', err);
    }

    setIsWizardOpen(false);
    setActivePage('electricity_bill');
    setActiveNavItem('electricity_bill');
  };

  // Submission handler for Settings page
  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector('.border-rose-400');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const dailyKWh = calculateDailyKWh(appliances);
      const monthlyKWh = Math.round(dailyKWh * 30);

      const newProfile: HomeProfile = {
        id: savedProfile?.id || `ECO-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: savedProfile?.createdAt || new Date().toISOString(),
        user: {
          fullName: fullName.trim(),
          contact: contact.trim(),
        },
        home: {
          familyMembers,
          homeSizeM2,
          city,
          floors,
        },
        appliancesCount: appliances.length,
        appliances,
        estimatedDailyKWh: dailyKWh,
        estimatedMonthlyKWh: monthlyKWh,
      };

      setSavedProfile(newProfile);
      setIsSubmitted(true);
      setIsSubmitting(false);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }

      setActivePage('electricity_bill');
      setActiveNavItem('electricity_bill');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200 relative overflow-x-hidden">
      {/* Animated Blurry Background for Landing / Auth Views */}
      {!isAuthenticated && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/25 dark:bg-emerald-500/15 rounded-full blur-3xl animate-blob-1" />
          <div className="absolute top-1/3 -right-24 w-96 h-96 bg-teal-500/25 dark:bg-teal-500/15 rounded-full blur-3xl animate-blob-2" />
          <div className="absolute -bottom-24 left-1/3 w-[500px] h-[500px] bg-sky-900/30 dark:bg-slate-800/40 rounded-full blur-3xl animate-blob-3" />
        </div>
      )}
      {/* Top Header Bar */}
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Side: Hamburger Menu Button (if authenticated) & Logo */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                type="button"
                id="btn-hamburger-menu"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer flex items-center justify-center shadow-2xs shrink-0"
                title={language === 'ar' ? 'فتح القائمة الجانبية' : 'Open Sidebar Navigation'}
                aria-label={language === 'ar' ? 'فتح القائمة الجانبية' : 'Open Sidebar Navigation'}
              >
                <Menu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </button>
            )}

            {/* EcoBill Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
              onClick={() => {
                if (isAuthenticated) {
                  handleSelectNavItem('settings');
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
                <Leaf className="w-5 fill-current text-white" />
              </div>
              <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">
                Eco<span className="text-emerald-600 dark:text-emerald-400">Bill</span>
              </span>
            </div>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Theme Toggle on Landing */}
                <button
                  type="button"
                  id="btn-theme-toggle"
                  onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                  title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                >
                  {theme === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                  <span className="hidden sm:inline">
                    {theme === 'light'
                      ? language === 'ar'
                        ? 'مضيء'
                        : 'Light'
                      : language === 'ar'
                      ? 'داكن'
                      : 'Dark'}
                  </span>
                </button>

                {/* Language Switcher */}
                <button
                  type="button"
                  id="btn-language-toggle"
                  onClick={handleToggleLanguage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                  title={language === 'ar' ? 'تغيير اللغة' : 'Switch Language'}
                >
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'العربية' : 'English'}</span>
                  <span className="sm:hidden">{language === 'ar' ? 'ع' : 'EN'}</span>
                </button>
              </div>
            ) : (
              /* Authenticated Mode Header Actions Sequence:
                 1. Dark/Light Theme Toggle
                 2. Language Switcher
                 3. Log Out Button
              */
              <div className="flex items-center gap-2">
                {/* 1. Theme Toggle */}
                <button
                  type="button"
                  id="btn-theme-toggle"
                  onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                  title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                >
                  {theme === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                  <span className="hidden sm:inline">
                    {theme === 'light'
                      ? language === 'ar'
                        ? 'مضيء'
                        : 'Light'
                      : language === 'ar'
                      ? 'داكن'
                      : 'Dark'}
                  </span>
                </button>

                {/* 2. Language Switcher */}
                <button
                  type="button"
                  id="btn-language-toggle"
                  onClick={handleToggleLanguage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                  title={language === 'ar' ? 'تغيير اللغة' : 'Switch Language'}
                >
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'العربية' : 'English'}</span>
                  <span className="sm:hidden">{language === 'ar' ? 'ع' : 'EN'}</span>
                </button>

                {/* 3. Log Out Button */}
                <button
                  type="button"
                  onClick={handleLogOut}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold transition-all cursor-pointer"
                  title={t.btnLogOut}
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t.btnLogOut}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main App Content View */}
      {!isAuthenticated ? (
        /* STANDALONE LANDING PAGE (HERO VIEW) */
        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-12">
          {/* Hero Section */}
          <Header
            language={language}
            onGetStarted={() => setIsAuthModalOpen(true)}
          />

          {/* Interactive Modern Feature Showcase Grid */}
          <section className="py-8 max-w-4xl mx-auto">
            <div className="text-center mb-8 space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                {language === 'ar' ? '• مميزات المنظومة الذكية •' : '• SMART ENERGY PLATFORM •'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'ar'
                  ? 'حلول شاملة لإدارة واستطاعة كهرباء المنزل'
                  : 'Complete Home Energy Optimization Suite'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/90 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-3 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'ماسح فواتير OCR الذكي' : 'Instant OCR Bill Reader'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {language === 'ar'
                    ? 'رفع فاتورة شركة الكهرباء واستخراج بيانات الاستهلاك والتعرفة والشرائح تلقائياً خلال ثوانٍ.'
                    : 'Upload electricity utility bills to automatically parse kWh consumption and tier breakdown in seconds.'}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/90 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-3 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-black">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'التوأم الرقمي 3D' : '3D Home Digital Twin'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {language === 'ar'
                    ? 'محاكاة تفاعلية ثلاثية الأبعاد لاختبار تأثير التكييف والعزل الشمسي وضبط الحرارة على الفاتورة.'
                    : 'Interactive 3D simulation model to test HVAC settings, thermal insulation, and solar savings live.'}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/90 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-3 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-black">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'توصيات تخفيض الاستهلاك' : 'Targeted Cost Savings'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {language === 'ar'
                    ? 'خطوات عملانية مخصصة لتقليل القمم والاستهلاك الشهري حتى ٣٠٪ مع مقارنة أداء مدينتك.'
                    : 'Custom action plans to eliminate power waste and reduce monthly utility costs by up to 30%.'}
                </p>
              </div>
            </div>
          </section>

          {/* LANDING PAGE - SUBSCRIPTION PLANS / PRICING TIERS SECTION */}
          <section id="pricing-section" className="py-12 max-w-5xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="text-center mb-10 space-y-3">
              <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                {language === 'ar' ? '• خطط الاشتراك والأسعار •' : '• SUBSCRIPTION PLANS & PRICING •'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'ar'
                  ? 'اختر الخطة المناسبة لمنزلك'
                  : 'Flexible Plans Built for Every Home'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-medium">
                {language === 'ar'
                  ? 'وفر حتى ٣٠٪ من فاتورة الكهرباء مع التحليلات المتقدمة والتوأم الرقمي تفاعلي.'
                  : 'Start optimizing your utility spend today. Upgrade anytime with no long-term contracts.'}
              </p>

              {/* Monthly vs Annual Toggle */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <span className={`text-xs font-extrabold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {language === 'ar' ? 'دفع شهري' : 'Monthly'}
                </span>
                <button
                  type="button"
                  onClick={() => setBillingCycle((prev) => (prev === 'monthly' ? 'annual' : 'monthly'))}
                  className="w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-700 p-1 relative transition-colors cursor-pointer"
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-emerald-600 shadow-md transform transition-transform ${
                      billingCycle === 'annual' ? (language === 'ar' ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-extrabold ${billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {language === 'ar' ? 'دفع سنوي' : 'Annual Billing'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-black uppercase">
                    {language === 'ar' ? 'وفر 20%' : 'SAVE 20%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              {/* TIER 1: FREE STARTER */}
              <div className={`p-6 rounded-3xl bg-white dark:bg-slate-800/90 border transition-all flex flex-col justify-between ${
                selectedPlan === 'free' 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl' 
                  : 'border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-md'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {language === 'ar' ? 'المبتدئ' : 'Free Starter'}
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                      / {language === 'ar' ? 'شهر' : 'month'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {language === 'ar' ? 'ممتاز لتتبع الفاتورة الفردية والتجربة الأساسية' : 'Ideal for single bill analysis and basic tracking'}
                  </p>

                  <div className="border-t border-slate-100 dark:border-slate-700 my-6 pt-6 space-y-3 text-xs font-medium text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'رفع وقراءة فواتير OCR (٣ شهرياً)' : 'OCR bill scanner (3/mo)'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'التوأم الرقمي الأساسي 3D' : 'Basic 3D Digital Twin'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'تحليلات الاستهلاك القياسية' : 'Standard consumption analytics'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('free');
                    if (!isAuthenticated) {
                      setIsAuthModalOpen(true);
                    } else {
                      handleSelectNavItem('settings');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-extrabold text-sm transition-all cursor-pointer text-center"
                >
                  {selectedPlan === 'free' ? (language === 'ar' ? 'الخطة الحالية' : 'Current Plan') : (language === 'ar' ? 'ابدأ مجاناً' : 'Get Started Free')}
                </button>
              </div>

              {/* TIER 2: SMART HOMEOWNER (POPULAR / HIGHLIGHTED) */}
              <div className={`p-6 rounded-3xl bg-white dark:bg-slate-800/90 border relative transition-all flex flex-col justify-between ring-2 ring-emerald-500 shadow-xl shadow-emerald-600/10 ${
                selectedPlan === 'smart' 
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' 
                  : 'border-emerald-500/80 hover:border-emerald-500'
              }`}>
                {/* Popular Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  {language === 'ar' ? '• الأكثر شعبية •' : '• MOST POPULAR •'}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {language === 'ar' ? 'صاحب المنزل الذكي' : 'Smart Homeowner'}
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {billingCycle === 'annual' ? '$7.99' : '$9.99'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                      / {language === 'ar' ? 'شهر (٣٥ ر.س)' : 'month (35 SAR)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {language === 'ar' ? 'تحكم كامل مع أدوات المحاكاة التفاعلية وسخانات المياه' : 'Complete simulation studio & water heater optimization'}
                  </p>

                  <div className="border-t border-slate-100 dark:border-slate-700 my-6 pt-6 space-y-3 text-xs font-medium text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-bold">{language === 'ar' ? 'ماسح فواتير بلا حدود' : 'Unlimited OCR bill scans'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'التوأم الرقمي الكامل + أدوات ما إذا' : 'Full interactive 3D Twin & What-If controls'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'تحسين استهلاك سخانات المياه والمكيفات' : 'Water heater & AC load optimization'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'توصيات الذكاء الاصطناعي الفورية' : 'Priority AI energy insights'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('smart');
                    if (!isAuthenticated) {
                      setIsAuthModalOpen(true);
                    } else {
                      handleSelectNavItem('settings');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all cursor-pointer text-center shadow-lg shadow-emerald-600/25"
                >
                  {selectedPlan === 'smart' ? (language === 'ar' ? 'الخطة المحددة' : 'Selected Plan') : (language === 'ar' ? 'ترقية الخطة' : 'Select Plan')}
                </button>
              </div>

              {/* TIER 3: ENERGY PRO / VILLA */}
              <div className={`p-6 rounded-3xl bg-white dark:bg-slate-800/90 border transition-all flex flex-col justify-between ${
                selectedPlan === 'pro' 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl' 
                  : 'border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-md'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {language === 'ar' ? 'المباني والفيلا الاحترافية' : 'Energy Pro / Villa'}
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {billingCycle === 'annual' ? '$19.99' : '$24.99'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                      / {language === 'ar' ? 'شهر (٨٩ ر.س)' : 'month (89 SAR)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {language === 'ar' ? 'للفلل المتعددة، حاسبة الطاقة الشمسية، وتقارير التدقيق' : 'Multi-property, solar PV ROI engine, and auditor reports'}
                  </p>

                  <div className="border-t border-slate-100 dark:border-slate-700 my-6 pt-6 space-y-3 text-xs font-medium text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'إدارة عقارات ومنازل متعددة' : 'Multi-property management'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'حاسبة عائد الطاقة الشمسية (Solar ROI)' : 'Solar PV ROI & generation calculator'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'جداول التشغيل التلقائي الذكي' : 'Custom automation schedules'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'تصدير تقارير تدقيق الطاقة' : 'Dedicated auditor report exports'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('pro');
                    if (!isAuthenticated) {
                      setIsAuthModalOpen(true);
                    } else {
                      handleSelectNavItem('settings');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-extrabold text-sm transition-all cursor-pointer text-center"
                >
                  {selectedPlan === 'pro' ? (language === 'ar' ? 'الخطة المحددة' : 'Selected Plan') : (language === 'ar' ? 'انتقل للمحترف' : 'Go Pro')}
                </button>
              </div>

            </div>
          </section>
        </main>
      ) : (
        /* AUTHENTICATED WORKSPACE VIEW WITH COLLAPSIBLE SIDEBAR DRAWER */
        <div className="w-full">
          {/* Collapsible Sidebar Drawer System */}
          <Sidebar
            activeNavItem={activeNavItem}
            onSelectNavItem={handleSelectNavItem}
            language={language}
            savedBillsCount={savedBills.length}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            currentUser={currentUser}
          />

          {/* Main Content Area */}
          <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-w-0">
            <AnimatePresence mode="wait">
              {activePage === 'settings' ? (
                /* Page 1: Settings Page */
                <motion.div
                  key="page-settings"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <form onSubmit={handleSubmitProfile} className="space-y-6 max-w-3xl mx-auto" noValidate>
                    {/* Section 1: About You */}
                    <AboutYouSection
                      fullName={fullName}
                      setFullName={setFullName}
                      contact={contact}
                      setContact={setContact}
                      errors={errors}
                      language={language}
                    />

                    {/* Section 2: About Your Home */}
                    <AboutHomeSection
                      familyMembers={familyMembers}
                      setFamilyMembers={setFamilyMembers}
                      homeSizeM2={homeSizeM2}
                      setHomeSizeM2={setHomeSizeM2}
                      city={city}
                      setCity={setCity}
                      floors={floors}
                      setFloors={setFloors}
                      onOpenWizard={() => setIsWizardOpen(true)}
                      errors={errors}
                      language={language}
                    />

                    {/* Section 3: Your Appliances */}
                    <AppliancesSection
                      appliances={appliances}
                      setAppliances={setAppliances}
                      errors={errors}
                      language={language}
                    />

                    {/* Errors summary if any */}
                    {Object.keys(errors).length > 0 && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold mb-1">
                            {language === 'ar' ? 'يرجى مراجعة الحقول المطلوبة:' : 'Please check required fields:'}
                          </p>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {Object.values(errors).map((err, idx) => (
                              <li key={idx}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Save Settings Button */}
                    <div className="pt-2 text-center">
                      <button
                        type="submit"
                        id="btn-save-settings"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 transition-all transform active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>{t.savingBtn}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 text-emerald-300 group-hover:rotate-12 transition-transform" />
                            <span>{t.saveProfileBtn}</span>
                            <ArrowRight className={`w-5 h-5 text-white group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : activePage === 'electricity_bill' ? (
                /* Page 2: Electricity Bill Upload */
                <motion.div
                  key="page-electricity-bill"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <ElectricityBillPage
                    savedProfile={savedProfile}
                    savedBills={savedBills}
                    onSaveBill={handleSaveBill}
                    onDeleteBill={handleDeleteBill}
                    onBackToProfile={() => handleSelectNavItem('settings')}
                    language={language}
                  />
                </motion.div>
              ) : activePage === 'digital_twin' ? (
                /* Page 3: Digital Twin 3D Simulation Page */
                <motion.div
                  key="page-digital-twin"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <DigitalTwin3D
                    language={language}
                    initialHomeArea={homeSizeM2}
                    initialHomeSize={homeSizeM2}
                    initialAcCount={
                      appliances.find((a) => a.type.toLowerCase().includes('air') || a.type.toLowerCase().includes('ac'))?.units || 4
                    }
                    initialRoomCount={Math.max(2, Math.round(homeSizeM2 / 30))}
                    initialHasSolar={true}
                    isDarkMode={theme === 'dark'}
                    onExit={() => handleSelectNavItem('settings')}
                  />
                </motion.div>
              ) : activePage === 'benchmarking' ? (
                /* Page 4: Benchmarking View */
                <motion.div
                  key="page-benchmarking"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <BenchmarkingView
                    savedProfile={savedProfile}
                    savedBills={savedBills}
                    language={language}
                  />
                </motion.div>
              ) : activePage === 'ai_assistants' ? (
                /* Page 5: Unified AI Assistants Hub */
                <motion.div
                  key="page-ai-assistants"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <AIAssistantsPage
                    language={language}
                    userName={currentUser?.fullName || savedProfile?.user.fullName || (language === 'ar' ? 'ليان' : 'Layan')}
                    city={city}
                    familyMembers={familyMembers}
                    consumptionKWh={savedProfile?.estimatedMonthlyKWh || 1260}
                    consumptionM3={35}
                    billAmountSAR={savedBills.length > 0 ? savedBills[savedBills.length - 1].amountSAR : null}
                    billingPeriod={savedBills.length > 0 ? savedBills[savedBills.length - 1].billingPeriod : null}
                  />
                </motion.div>
              ) : (
                /* Page 7: Separate Dashboard Page */
                <motion.div
                  key="page-dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <DashboardPage
                    savedProfile={savedProfile}
                    savedBills={savedBills}
                    onAddNewBill={() => handleSelectNavItem('electricity_bill')}
                    onNavigateToProfile={() => handleSelectNavItem('settings')}
                    language={language}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800 pt-6 pb-8">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <Leaf className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t.brandName} • {t.brandTagline}</span>
        </div>
      </footer>

      {/* Interactive Authentication Modal (Pre-Firebase Ready) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData) => handleSignUp(userData)}
        onDemoLogin={handleDemoLogin}
        language={language}
      />

      {/* Header Navigation Modals (Product, Solutions, Pricing, Support) */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200/90 dark:border-slate-800 relative overflow-hidden"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {activeModal === 'product' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'مميزات منصة إيكوبيل' : 'EcoBill Product Capabilities'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {language === 'ar'
                      ? 'منظومة متكاملة لإدارة واستطاعة الطاقة المنزلية تعتمد على تقنيات الذكاء الاصطناعي:'
                      : 'An integrated home energy intelligence suite powered by AI and 3D simulation:'}
                  </p>
                  <div className="space-y-2 pt-2">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/80 flex items-start gap-3">
                      <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'ماسح فواتير الكهرباء الذكي' : 'Instant OCR Bill Scanner'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{language === 'ar' ? 'قراءة وتحليل فاتورة شركة الكهرباء تلقائياً' : 'Automated utility bill extraction and analysis'}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/80 flex items-start gap-3">
                      <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'التوأم الرقمي 3D للمنزل' : '3D Home Energy Digital Twin'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{language === 'ar' ? 'اختبار سيناريوهات العزل والحرارة والتكييف' : 'Interactive what-if scenario testing for HVAC & insulation'}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/80 flex items-start gap-3">
                      <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'توصيات التوفير المخصصة' : 'Targeted Cost Reduction'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{language === 'ar' ? 'خطوات عملية لخفض الفاتورة حتى 30%' : 'Actionable steps to cut monthly electricity spend'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'solutions' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'حلول إيكوبيل للمنازل' : 'EcoBill Household Solutions'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {language === 'ar'
                      ? 'مصممة خصيصاً للظروف المناخية ونماذج الاستهلاك في المملكة العربية السعودية والخليج:'
                      : 'Tailored specifically for climate conditions and power consumption models in Saudi Arabia & GCC:'}
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'مقارنة الاستهلاك مع متوسط المدينة والمساحة (GASTAT)' : 'Benchmarking against city & home size benchmarks (GASTAT)'}</span>
                    </li>
                    <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'تحليل تعرفة الكهرباء والشرائح التماثلية' : 'Tiered electricity tariff optimization & breakdown'}</span>
                    </li>
                    <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'تقييم كفاءة المكيفات والعزل الحراري' : 'HVAC efficiency evaluation & thermal insulation audit'}</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeModal === 'pricing' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'خطط الأسعار' : 'EcoBill Pricing Plans'}
                  </h3>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center">
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                      {language === 'ar' ? 'الخطة المنزلية الأساسية' : 'Household Homeowner Plan'}
                    </div>
                    <div className="text-3xl font-black text-emerald-900 dark:text-emerald-200 my-1">
                      {language === 'ar' ? 'مجاناً ١٠٠٪' : '100% Free'}
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      {language === 'ar' ? 'متاحة لجميع أصحاب المنازل مجاناً وبدون رسوم مخفية' : 'Available for all homeowners with zero hidden fees'}
                    </p>
                  </div>
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        if (!isAuthenticated) {
                          setIsAuthModalOpen(true);
                        } else {
                          handleSelectNavItem('settings');
                        }
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                    >
                      {language === 'ar' ? 'ابدأ الاستخدام الآن' : 'Start Using Now'}
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'support' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'الدعم والتعليمات' : 'Help & Support'}
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/80">
                      <div className="font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'كيف يحسب النظام استهلاك الطاقة؟' : 'How is energy baseline calculated?'}</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5">{language === 'ar' ? 'يعتمد على قدرات الأجهزة والساعات والمساحة وعدد الأفراد.' : 'Based on device wattages, operating hours, home area, and family size.'}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/80">
                      <div className="font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'هل بيانات منزلك آمنة؟' : 'Is household data confidential?'}</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5">{language === 'ar' ? 'جميع البيانات محفوظة محلياً ومشفرة بالكامل.' : '100% private & secure data processed locally on your device.'}</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Home Profile Setup Wizard Pop-up Modal */}
      <HomeProfileWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        city={city}
        setCity={setCity}
        homeSizeM2={homeSizeM2}
        setHomeSizeM2={setHomeSizeM2}
        familyMembers={familyMembers}
        setFamilyMembers={setFamilyMembers}
        floors={floors}
        setFloors={setFloors}
        onSubmitProfile={handleWizardSubmit}
        language={language}
      />
    </div>
  );
}
