import React, { useState, useEffect, useRef, useCallback, Component, ReactNode, ErrorInfo } from 'react';
import * as THREE from 'three';
import { 
  Leaf, 
  Sun, 
  Zap, 
  Thermometer, 
  Lightbulb, 
  DollarSign, 
  Sliders, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Award, 
  ChevronUp, 
  ChevronDown,
  Home,
  X,
  Settings,
  CheckCircle2,
  Layers,
  Plus,
  Minus,
  Tv,
  Activity,
  ShieldCheck,
  Droplet,
  Droplets,
  Sprout,
  AlertTriangle,
  Waves,
  Wrench,
  Bath
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, toLocalDigits, formatUnit, unitsMap } from '../translations';

interface DigitalTwinErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface DigitalTwinErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class DigitalTwinErrorBoundary extends React.Component<DigitalTwinErrorBoundaryProps, DigitalTwinErrorBoundaryState> {
  state: DigitalTwinErrorBoundaryState = { hasError: false };
  props: DigitalTwinErrorBoundaryProps;

  constructor(props: DigitalTwinErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): DigitalTwinErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Digital Twin 3D Canvas Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="w-full h-full min-h-[400px] bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center rounded-2xl">
          <div className="max-w-md bg-slate-800 p-6 rounded-2xl border border-emerald-500/30 shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">3D Interactive Mode Fallback</h3>
            <p className="text-xs text-slate-300">
              The 3D graphics canvas caught a rendering error and safely transferred to 2D mode. All energy simulation parameters remain active.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Interface for component props
export interface DigitalTwin3DProps {
  language?: Language;
  initialHomeArea?: number | string;
  initialHomeSize?: '100' | '250' | '400' | number | string;
  initialAcCount?: number;
  initialRoomCount?: number;
  initialBuildingStories?: number | '1' | '2';
  initialHasSolar?: boolean;
  initialAcTemp?: number;
  initialLedToggle?: boolean;
  initialSolarToggle?: boolean;
  initialWaterHeaterToggle?: boolean;
  isDarkMode?: boolean;
  onStateChange?: (state: DigitalTwinState) => void;
  onExit?: () => void;
  className?: string;
}

export interface DigitalTwinState {
  homeArea: number;
  homeSize: string; // e.g. "250 m²" for backward compatibility
  acCount: number;
  roomCount: number;
  buildingStories: number;
  hasSolar: boolean;
  acTemp: number; // 20 to 26 °C
  ledToggle: boolean;
  ledBrightness: number; // 10 to 100 %
  solarToggle: boolean;
  waterHeaterToggle: boolean; // Eco timer schedule
  timeOfDay: number; // 0 to 24 hours
  ambientTemp: number; // 28 to 45 °C outdoor heat
  projectedMonthlyKwh: number;
  projectedMonthlyBillSar: number;
  carbonReductionKg: number;
  efficiencyScore: number;
  projectedMonthlyM3?: number;
  projectedWaterBillSar?: number;
  totalCombinedUtilitiesSar?: number;
}

// Web Audio API Synthesizer for UI sound feedback
const playSound = (type: 'click' | 'toggle' | 'slider' | 'reward' | 'mode', muted: boolean) => {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'toggle') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'slider') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'reward') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, now + idx * 0.06);
        g.gain.setValueAtTime(0.06, now + idx * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);
        o.start(now + idx * 0.06);
        o.stop(now + idx * 0.06 + 0.18);
      });
    }
  } catch {
    // Ignore audio errors if blocked by browser policy
  }
};

export default function DigitalTwin3D({
  language = 'en',
  initialHomeArea,
  initialHomeSize = '250',
  initialAcCount = 4,
  initialRoomCount = 4,
  initialBuildingStories = 1,
  initialHasSolar = true,
  initialAcTemp = 24,
  initialLedToggle = true,
  initialSolarToggle = true,
  initialWaterHeaterToggle = true,
  isDarkMode: isDarkModeProp,
  onStateChange,
  onExit,
  className = ''
}: DigitalTwin3DProps) {
  const isArabic = language === 'ar';

  // Dynamic Site Dark/Light Mode state
  const [isDarkSiteMode, setIsDarkSiteMode] = useState<boolean>(() => {
    if (isDarkModeProp !== undefined) return isDarkModeProp;
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDarkModeProp !== undefined) {
      setIsDarkSiteMode(isDarkModeProp);
    }
  }, [isDarkModeProp]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const checkDark = () => {
      setIsDarkSiteMode(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(() => {
      checkDark();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Parse initial numeric values safely
  const parsedInitialArea = Math.max(40, Math.min(2000, 
    initialHomeArea !== undefined ? Number(initialHomeArea) || 250 :
    initialHomeSize !== undefined ? Number(initialHomeSize) || 250 : 250
  ));

  const parsedInitialStories = Number(initialBuildingStories) === 2 ? 2 : 1;

  // Wizard Setup State (Manual Number Inputs)
  const [wizardStep, setWizardStep] = useState<'setup' | 'studio'>('setup');
  const [homeArea, setHomeArea] = useState<number>(parsedInitialArea);
  const [acCount, setAcCount] = useState<number>(Math.max(1, Math.min(20, initialAcCount)));
  const [roomCount, setRoomCount] = useState<number>(Math.max(1, Math.min(20, initialRoomCount)));
  const [buildingStories, setBuildingStories] = useState<1 | 2>(parsedInitialStories);
  const [hasSolar, setHasSolar] = useState<boolean>(initialHasSolar);
  const [waterHeaterCount, setWaterHeaterCount] = useState<number>(2);

  // Studio Simulation Controls State
  const [acTemp, setAcTemp] = useState<number>(initialAcTemp);
  const [ledToggle, setLedToggle] = useState<boolean>(initialLedToggle);
  const [ledBrightness, setLedBrightness] = useState<number>(80);
  const [solarToggle, setSolarToggle] = useState<boolean>(initialSolarToggle);
  const [waterHeaterToggle, setWaterHeaterToggle] = useState<boolean>(initialWaterHeaterToggle);
  
  // Appliance Interactive Daily Runtime Sliders
  const [waterHeaterHours, setWaterHeaterHours] = useState<number>(3); // 0-24 Hrs/day (Default: 3)
  const [tvHours, setTvHours] = useState<number>(6); // 0-24 Hrs/day (Default: 6)
  const [wmHours, setWmHours] = useState<number>(2); // 0-12 Hrs/day (Default: 2)
  const fridgePowerKw = 0.18; // Fixed 180W continuous base load (24/7)

  // Interactive Water Fixtures & Plumbing Controls State
  const [faucetMinutesPerDay, setFaucetMinutesPerDay] = useState<number>(30); // 5 to 120 mins
  const [faucetAerator, setFaucetAerator] = useState<boolean>(true); // true = Low-Flow (4 L/min), false = Standard (8 L/min)
  const [showerMinutesPerDay, setShowerMinutesPerDay] = useState<number>(15); // 5 to 60 mins
  const [showerFlowRestrictor, setShowerFlowRestrictor] = useState<boolean>(true); // true = Eco (7 L/min), false = High-Flow (14 L/min)
  const [sprinklerActive, setSprinklerActive] = useState<boolean>(true);
  const [sprinklerMinutesPerDay, setSprinklerMinutesPerDay] = useState<number>(20); // 0 to 90 mins
  const [leakageSimToggle, setLeakageSimToggle] = useState<boolean>(false); // Invisible pipe leak simulation
  const [activeControlTab, setActiveControlTab] = useState<'electricity' | 'plumbing'>('electricity');
  
  // Environment state
  const [timeOfDay] = useState<number>(14); // 14:00 (Peak afternoon)
  const [ambientTemp] = useState<number>(38); // 38°C outdoor temp

  // UI state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<'iso' | 'front' | 'roof' | 'top'>('iso');
  const [isCameraDropdownOpen, setIsCameraDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);
  const [presetNotification, setPresetNotification] = useState<string | null>(null);
  const [webglError, setWebglError] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCameraDropdownOpen(false);
      }
    };
    if (isCameraDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCameraDropdownOpen]);

  // Canvas / Three.js refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // 3D Objects refs for animation updates
  const acFansRef = useRef<THREE.Mesh[]>([]);
  const interiorLightsRef = useRef<THREE.PointLight[]>([]);
  const solarPanelsMeshRef = useRef<THREE.Group | null>(null);
  const waterHeaterLightRef = useRef<THREE.Mesh | null>(null);
  const sprinklerSprayGroupRef = useRef<THREE.Group | null>(null);
  const sprinklerSprayHeadsRef = useRef<THREE.Mesh[]>([]);
  const leakWaterGroupRef = useRef<THREE.Group | null>(null);

  // Interaction controls
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 26 });
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Sync solar toggle if user changes solar preference in wizard
  useEffect(() => {
    setSolarToggle(hasSolar);
  }, [hasSolar]);

  // ----------------------------------------------------
  // REAL-TIME ACCURATE SAUDI ENERGY & FINANCIAL CALCULATIONS
  // ----------------------------------------------------
  // Solar output calculation (Peak ~7.5 kW based on time of day)
  const calculateSolarGenKw = useCallback(() => {
    if (!solarToggle) return 0;
    if (timeOfDay < 6 || timeOfDay > 18) return 0;
    const hourOffset = timeOfDay - 12;
    const sunIntensity = Math.max(0, Math.cos((hourOffset / 6) * (Math.PI / 2)));
    return Number((7.5 * sunIntensity * Math.min(2.0, homeArea / 200)).toFixed(2));
  }, [solarToggle, timeOfDay, homeArea]);

  // AC Power Consumption (kW)
  const calculateAcPowerKw = useCallback(() => {
    const deltaT = Math.max(2, ambientTemp - acTemp);
    const unitLoad = 0.8 + (deltaT * 0.12);
    return Number((unitLoad * acCount).toFixed(2));
  }, [acTemp, ambientTemp, acCount]);

  // Lighting Power (kW)
  const calculateLightingKw = useCallback(() => {
    if (!ledToggle) return 0;
    return Number((0.25 * (ledBrightness / 100) * (roomCount / 4)).toFixed(2));
  }, [ledToggle, ledBrightness, roomCount]);

  // Water Heater Power (kW) based on count
  const calculateWaterHeaterKw = useCallback(() => {
    if (waterHeaterCount === 0) return 0;
    return Number((waterHeaterCount * 1.2 * (waterHeaterToggle ? 0.75 : 1.0)).toFixed(2));
  }, [waterHeaterCount, waterHeaterToggle]);

  // Base Load based on Home Area (m²)
  const baseLoadKw = Number((0.25 + (homeArea / 300) * 0.4).toFixed(2));

  const solarGenKw = calculateSolarGenKw();
  const acPowerKw = calculateAcPowerKw();
  const lightingKw = calculateLightingKw();
  const waterHeaterKw = calculateWaterHeaterKw();

  // Additional Appliance kW loads
  const tvPowerKw = 0.12; // 120W
  const wmPowerKw = 0.60; // 600W

  // Monthly Projected kWh Calculation
  const dailyAcKwh = acPowerKw * 8;
  const dailyLightingKwh = lightingKw * 6;
  const dailyWaterHeaterKwh = waterHeaterKw * waterHeaterHours;
  const dailyTvKwh = tvPowerKw * tvHours;
  const dailyWmKwh = wmPowerKw * wmHours;
  const dailyFridgeKwh = fridgePowerKw * 24; // Continuous 180W 24/7 base load
  const dailyBaseKwh = baseLoadKw * 24;
  const dailySolarKwh = solarGenKw * 5;

  const dailyGrossKwh = dailyAcKwh + dailyLightingKwh + dailyWaterHeaterKwh + dailyTvKwh + dailyWmKwh + dailyFridgeKwh + dailyBaseKwh;
  const monthlyGrossKwh = Math.round(dailyGrossKwh * 30);
  const monthlySolarKwh = Math.round(dailySolarKwh * 30);
  const projectedMonthlyKwh = Math.max(100, monthlyGrossKwh - monthlySolarKwh);

  // Saudi Electricity Company (SEC) Residential Tariff Billing Formula:
  // - 1 to 6,000 kWh / month: 0.18 SAR / kWh
  // - > 6,000 kWh / month: 0.30 SAR / kWh
  const calculateSaudiBillSar = (kwh: number) => {
    if (kwh <= 6000) {
      return kwh * 0.18;
    } else {
      return (6000 * 0.18) + ((kwh - 6000) * 0.30);
    }
  };

  const projectedMonthlyBillSar = calculateSaudiBillSar(projectedMonthlyKwh);

  // Water Consumption & National Water Company (NWC) Saudi Tariff Billing Formula:
  // - Tier 1 (0 to 15 m³): 0.15 SAR / m³
  // - Tier 2 (16 to 30 m³): 1.00 SAR / m³
  // - Tier 3 (31 to 45 m³): 3.00 SAR / m³
  // - Tier 4 (46 to 60 m³): 4.00 SAR / m³
  // - Tier 5 (> 60 m³): 6.00 SAR / m³
  // - Wastewater Sewage Fee: +50% of water tariff
  const calculateWaterMetrics = useCallback(() => {
    const occupantFactor = Math.max(1, Math.round(roomCount * 0.75));
    const faucetLitersDaily = faucetMinutesPerDay * (faucetAerator ? 4 : 8) * occupantFactor;
    const showerLitersDaily = showerMinutesPerDay * (showerFlowRestrictor ? 7 : 14) * occupantFactor;
    const sprinklerLitersDaily = sprinklerActive ? (sprinklerMinutesPerDay * 20) : 0;
    const leakageLitersDaily = leakageSimToggle ? (15 * 24) : 0; // 360 L/day
    const baseDomesticLitersDaily = 120 * occupantFactor; // toilets, laundry, kitchen base

    const dailyTotalLiters = faucetLitersDaily + showerLitersDaily + sprinklerLitersDaily + leakageLitersDaily + baseDomesticLitersDaily;
    const monthlyTotalLiters = dailyTotalLiters * 30;
    const monthlyM3 = Number((monthlyTotalLiters / 1000).toFixed(1));

    let waterCharge = 0;
    if (monthlyM3 <= 15) {
      waterCharge = monthlyM3 * 0.15;
    } else if (monthlyM3 <= 30) {
      waterCharge = (15 * 0.15) + ((monthlyM3 - 15) * 1.00);
    } else if (monthlyM3 <= 45) {
      waterCharge = (15 * 0.15) + (15 * 1.00) + ((monthlyM3 - 30) * 3.00);
    } else if (monthlyM3 <= 60) {
      waterCharge = (15 * 0.15) + (15 * 1.00) + (15 * 3.00) + ((monthlyM3 - 45) * 4.00);
    } else {
      waterCharge = (15 * 0.15) + (15 * 1.00) + (15 * 3.00) + (15 * 4.00) + ((monthlyM3 - 60) * 6.00);
    }
    const sewageFee = waterCharge * 0.50;
    const waterBillSar = Number((waterCharge + sewageFee).toFixed(2));

    return {
      dailyTotalLiters,
      monthlyM3,
      waterBillSar,
      leakageWastedLiters: leakageLitersDaily,
      faucetLitersDaily,
      showerLitersDaily,
      sprinklerLitersDaily
    };
  }, [faucetMinutesPerDay, faucetAerator, showerMinutesPerDay, showerFlowRestrictor, sprinklerActive, sprinklerMinutesPerDay, leakageSimToggle, roomCount]);

  const {
    dailyTotalLiters,
    monthlyM3: projectedMonthlyM3,
    waterBillSar: projectedWaterBillSar,
    leakageWastedLiters,
    faucetLitersDaily,
    showerLitersDaily,
    sprinklerLitersDaily
  } = calculateWaterMetrics();

  const totalCombinedUtilitiesSar = Number((projectedMonthlyBillSar + projectedWaterBillSar).toFixed(2));

  // Carbon Savings vs baseline (0.7 kg CO2 per kWh saved)
  const unoptimizedBaselineKwh = Math.round(homeArea * 10);
  const kwhSavedVsBaseline = Math.max(0, unoptimizedBaselineKwh - projectedMonthlyKwh);
  const carbonReductionKg = Math.round(kwhSavedVsBaseline * 0.70);

  // Efficiency Score Calculation (0-100%) incorporating both electricity and water efficiency
  const calculateEfficiencyScore = useCallback(() => {
    let score = 35;
    if (acTemp >= 25) score += 18;
    else if (acTemp >= 23) score += 10;
    else if (acTemp >= 21) score += 5;
    if (solarToggle) score += 15;
    if (waterHeaterToggle) score += 8;
    // Water efficiency score components
    if (faucetAerator) score += 8;
    if (showerFlowRestrictor) score += 8;
    if (!leakageSimToggle) score += 8;
    return Math.min(100, score);
  }, [acTemp, solarToggle, waterHeaterToggle, faucetAerator, showerFlowRestrictor, leakageSimToggle]);

  const efficiencyScore = calculateEfficiencyScore();

  const getEfficiencyGrade = (score: number) => {
    if (score >= 85) return { grade: 'A+', label: 'Eco Platinum', color: 'text-white bg-emerald-600 border-emerald-700 shadow-xs' };
    if (score >= 70) return { grade: 'A', label: 'Eco Gold', color: 'text-white bg-emerald-500 border-emerald-600 shadow-xs' };
    if (score >= 50) return { grade: 'B', label: 'Balanced', color: 'text-slate-900 bg-amber-400 border-amber-500 shadow-xs' };
    return { grade: 'C', label: 'High Load', color: 'text-white bg-rose-500 border-rose-600 shadow-xs' };
  };

  const efficiencyBadge = getEfficiencyGrade(efficiencyScore);

  // Notify parent component when state changes safely
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    if (onStateChangeRef.current) {
      onStateChangeRef.current({
        homeArea,
        homeSize: `${homeArea} m²`,
        acCount,
        roomCount,
        buildingStories,
        hasSolar,
        acTemp,
        ledToggle,
        ledBrightness,
        solarToggle,
        waterHeaterToggle,
        timeOfDay,
        ambientTemp,
        projectedMonthlyKwh,
        projectedMonthlyBillSar,
        carbonReductionKg,
        efficiencyScore,
        projectedMonthlyM3,
        projectedWaterBillSar,
        totalCombinedUtilitiesSar
      });
    }
  }, [
    homeArea, acCount, roomCount, buildingStories, hasSolar, acTemp, ledToggle, ledBrightness, solarToggle, waterHeaterToggle, timeOfDay, ambientTemp, projectedMonthlyKwh, projectedMonthlyBillSar, carbonReductionKg, efficiencyScore, projectedMonthlyM3, projectedWaterBillSar, totalCombinedUtilitiesSar
  ]);

  // Dynamically update Three.js objects when light/solar/water heater toggles change
  useEffect(() => {
    const intensity = ledToggle ? (ledBrightness / 100) * 1.5 : 0;
    interiorLightsRef.current.forEach((light) => {
      if (light) light.intensity = intensity;
    });
  }, [ledToggle, ledBrightness]);

  useEffect(() => {
    if (solarPanelsMeshRef.current) {
      solarPanelsMeshRef.current.visible = solarToggle;
    }
  }, [solarToggle]);

  useEffect(() => {
    if (waterHeaterLightRef.current && waterHeaterLightRef.current.material) {
      (waterHeaterLightRef.current.material as THREE.MeshBasicMaterial).color.setHex(
        waterHeaterToggle ? 0x10b981 : 0xf59e0b
      );
    }
  }, [waterHeaterToggle]);

  useEffect(() => {
    if (sprinklerSprayGroupRef.current) {
      sprinklerSprayGroupRef.current.visible = sprinklerActive && sprinklerMinutesPerDay > 0;
    }
  }, [sprinklerActive, sprinklerMinutesPerDay]);

  useEffect(() => {
    if (leakWaterGroupRef.current) {
      leakWaterGroupRef.current.visible = leakageSimToggle;
    }
  }, [leakageSimToggle]);

  // Apply Eco Presets
  const applyEcoPreset = (preset: 'max' | 'balanced' | 'comfort') => {
    playSound('reward', isMuted);
    if (preset === 'max') {
      setAcTemp(25);
      setLedToggle(true);
      setLedBrightness(50);
      setSolarToggle(true);
      setWaterHeaterToggle(true);
      setWaterHeaterHours(2);
      setTvHours(4);
      setWmHours(1);
      // Water eco parameters
      setFaucetMinutesPerDay(20);
      setFaucetAerator(true);
      setShowerMinutesPerDay(10);
      setShowerFlowRestrictor(true);
      setSprinklerActive(true);
      setSprinklerMinutesPerDay(10);
      setLeakageSimToggle(false);
      setPresetNotification(isArabic ? '🌿 تم تطبيق النمط البيئي الأقصى (توفير ممتاز للكهرباء والماء)' : '🌿 Max Eco Mode Applied! (Maximum Electricity & Water SAR Savings)');
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      } catch {
        // Safe ignore if canvas context is restricted
      }
    } else if (preset === 'balanced') {
      setAcTemp(24);
      setLedToggle(true);
      setLedBrightness(75);
      setSolarToggle(true);
      setWaterHeaterToggle(true);
      setWaterHeaterHours(3);
      setTvHours(6);
      setWmHours(2);
      // Water balanced parameters
      setFaucetMinutesPerDay(30);
      setFaucetAerator(true);
      setShowerMinutesPerDay(15);
      setShowerFlowRestrictor(true);
      setSprinklerActive(true);
      setSprinklerMinutesPerDay(20);
      setLeakageSimToggle(false);
      setPresetNotification(isArabic ? '⚡ تم تطبيق النمط المتوازن للكهرباء والماء' : '⚡ Balanced SEC & NWC Target Mode Applied!');
    } else {
      setAcTemp(20);
      setLedToggle(true);
      setLedBrightness(100);
      setWaterHeaterToggle(false);
      setWaterHeaterHours(6);
      setTvHours(8);
      setWmHours(3);
      // Water high usage parameters
      setFaucetMinutesPerDay(45);
      setFaucetAerator(false);
      setShowerMinutesPerDay(25);
      setShowerFlowRestrictor(false);
      setSprinklerActive(true);
      setSprinklerMinutesPerDay(40);
      setPresetNotification(isArabic ? '❄️ نمط الراحة الفعّال (استهلاك أعلى)' : '❄️ Comfort Mode Active (Higher Utility Load)');
    }
    setTimeout(() => setPresetNotification(null), 3000);
  };

  // ----------------------------------------------------
  // THREE.JS 3D SCENE SETUP & ANIMATION LOOP
  // ----------------------------------------------------
  useEffect(() => {
    if (wizardStep !== 'studio' || !mountRef.current) return;

    const domEl = mountRef.current;
    const width = domEl.clientWidth;
    const height = domEl.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const skyBgColor = isDarkSiteMode ? 0x020617 : 0xf8fafc;
    scene.background = new THREE.Color(skyBgColor);
    scene.fog = new THREE.FogExp2(skyBgColor, isDarkSiteMode ? 0.012 : 0.008);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const updateCameraPosition = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0, 1.8, 0);
    };
    updateCameraPosition();

    // 3. Renderer (Wrapped with WebGL pre-check and try/catch for sandbox/headless resilience)
    if (rendererRef.current) {
      try {
        rendererRef.current.dispose();
      } catch {
        // Safe disposal ignore
      }
      rendererRef.current = null;
    }

    // Pre-flight check if WebGL is supported in current iframe/sandbox
    const isWebGLSupported = (): boolean => {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        return !!gl;
      } catch {
        return false;
      }
    };

    if (!isWebGLSupported()) {
      console.warn('WebGL Context Creation Disabled in this sandbox - Switching to 2D Schematic Digital Twin');
      setWebglError(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, failIfMajorPerformanceCaveat: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = isDarkSiteMode ? 1.25 : 1.15;

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        console.warn('WebGL context lost - switching to interactive 2D Digital Twin view');
        setWebglError(true);
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

      domEl.innerHTML = '';
      domEl.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      setWebglError(false);
    } catch (err) {
      console.warn('WebGL Context Creation Error - Falling back to Interactive 2D Digital Twin:', err);
      setWebglError(true);
      return;
    }

    // 4. Enhanced Realistic Sunlight / Moonlight & Environmental Lighting
    const ambientLight = new THREE.AmbientLight(
      isDarkSiteMode ? 0x38bdf8 : 0xfffbeb, 
      isDarkSiteMode ? 0.85 : 0.7
    );
    scene.add(ambientLight);

    // Sky to Ground Hemisphere Bounce Light for natural ambient depth
    const hemiLight = new THREE.HemisphereLight(
      isDarkSiteMode ? 0x38bdf8 : 0xbae6fd, 
      isDarkSiteMode ? 0x1e293b : 0x15803d, 
      isDarkSiteMode ? 0.75 : 0.65
    );
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // Sun / Moon Directional Light
    const dirLight = new THREE.DirectionalLight(
      isDarkSiteMode ? 0xf8fafc : 0xfff7ed, 
      isDarkSiteMode ? 1.8 : 2.2
    );
    dirLight.position.set(22, 34, 18);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    const shadowDim = 24;
    dirLight.shadow.camera.left = -shadowDim;
    dirLight.shadow.camera.right = shadowDim;
    dirLight.shadow.camera.top = shadowDim;
    dirLight.shadow.camera.bottom = -shadowDim;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(
      isDarkSiteMode ? 0x38bdf8 : 0x38bdf8, 
      isDarkSiteMode ? 0.7 : 0.35
    );
    fillLight.position.set(-18, 12, -18);
    scene.add(fillLight);

    // Dynamic Footprint Scaling according to Home Area (m²)
    const areaScale = Math.max(0.7, Math.min(1.8, Math.sqrt(homeArea / 250)));
    const houseWidth = 11.0 * areaScale;
    const houseDepth = 9.0 * areaScale;
    const isTwoStory = buildingStories === 2;

    // Plot Dimensions
    const plotWidth = Math.max(28, houseWidth + 15);
    const plotDepth = Math.max(24, houseDepth + 13);

    // ----------------------------------------------------
    // SURROUNDING CITY / NEIGHBORHOOD BACKGROUND BLOCKS
    // ----------------------------------------------------
    const neighborhoodGroup = new THREE.Group();
    scene.add(neighborhoodGroup);

    // Outer Asphalt Road Ring surrounding property plot
    const roadWidth = plotWidth + 8;
    const roadDepth = plotDepth + 8;
    const roadMesh = new THREE.Mesh(
      new THREE.BoxGeometry(roadWidth, 0.05, roadDepth),
      new THREE.MeshStandardMaterial({ color: isDarkSiteMode ? 0x1e293b : 0x1e293b, roughness: 0.85 })
    );
    roadMesh.position.y = -0.26;
    roadMesh.receiveShadow = true;
    neighborhoodGroup.add(roadMesh);

    // Distant Building Blocks (Neighborhood Context outside property plot)
    const buildingMatLight = new THREE.MeshStandardMaterial({ color: isDarkSiteMode ? 0x334155 : 0xe2e8f0, roughness: isDarkSiteMode ? 0.6 : 0.6 });
    const buildingMatDark = new THREE.MeshStandardMaterial({ color: isDarkSiteMode ? 0x1e293b : 0x94a3b8, roughness: isDarkSiteMode ? 0.6 : 0.5 });
    const buildingMatAccent = new THREE.MeshStandardMaterial({ color: isDarkSiteMode ? 0x475569 : 0x475569, roughness: isDarkSiteMode ? 0.5 : 0.4 });
    const windowStripMat = new THREE.MeshBasicMaterial({ color: isDarkSiteMode ? 0xfef08a : 0x38bdf8, transparent: true, opacity: isDarkSiteMode ? 0.85 : 0.5 });

    const backgroundBuildingConfigs = [
      // North / Back Neighborhood
      { x: -18, z: -26, w: 9, h: 11, d: 8, mat: buildingMatLight },
      { x: -5, z: -28, w: 11, h: 14, d: 9, mat: buildingMatDark },
      { x: 12, z: -27, w: 8, h: 9, d: 8, mat: buildingMatAccent },
      { x: 24, z: -25, w: 10, h: 12, d: 7, mat: buildingMatLight },
      // South / Front Neighborhood (Distant across street)
      { x: -22, z: 27, w: 10, h: 8, d: 8, mat: buildingMatDark },
      { x: -8, z: 30, w: 9, h: 10, d: 7, mat: buildingMatLight },
      { x: 15, z: 28, w: 12, h: 13, d: 8, mat: buildingMatAccent },
      // West / Left Neighborhood
      { x: -28, z: -12, w: 8, h: 12, d: 11, mat: buildingMatLight },
      { x: -29, z: 5, w: 7, h: 9, d: 10, mat: buildingMatDark },
      { x: -27, z: 18, w: 8, h: 10, d: 8, mat: buildingMatAccent },
      // East / Right Neighborhood
      { x: 28, z: -10, w: 8, h: 10, d: 12, mat: buildingMatDark },
      { x: 30, z: 6, w: 9, h: 13, d: 9, mat: buildingMatLight },
      { x: 27, z: 19, w: 7, h: 8, d: 8, mat: buildingMatAccent },
    ];

    backgroundBuildingConfigs.forEach((b) => {
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), b.mat);
      bMesh.position.set(b.x, b.h / 2 - 0.25, b.z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      neighborhoodGroup.add(bMesh);

      // Window Glass Bands
      const winCount = Math.floor(b.h / 3);
      for (let w = 1; w <= winCount; w++) {
        const winBand = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.05, 0.4, b.d + 0.05), windowStripMat);
        winBand.position.set(b.x, w * 2.8 - 0.25, b.z);
        neighborhoodGroup.add(winBand);
      }
    });

    // ----------------------------------------------------
    // MANICURED GARDEN LAWN, EXPANSIVE TERRAIN & PATHWAY
    // ----------------------------------------------------
    const gardenGroup = new THREE.Group();
    scene.add(gardenGroup);

    // 0. Full Expansive Green Grass / Emerald Floor Terrain Plane beneath entire 3D canvas
    const terrainGeo = new THREE.BoxGeometry(350, 0.2, 350);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: isDarkSiteMode ? 0x1b4332 : 0x2e7d32, // Vibrant natural green grass floor (#2e7d32)
      roughness: 0.85,
      metalness: 0.01,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.position.y = -0.36;
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // 1. Manicured Green Grass Lawn Base for Home Plot
    const lawnGeo = new THREE.BoxGeometry(plotWidth, 0.25, plotDepth);
    const lawnMat = new THREE.MeshStandardMaterial({ 
      color: isDarkSiteMode ? 0x2d6a4f : 0x388e3c, // Vibrant manicured emerald lawn (#388e3c)
      roughness: 0.7, 
      metalness: 0.02 
    });
    const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
    lawnMesh.position.y = -0.125;
    lawnMesh.receiveShadow = true;
    gardenGroup.add(lawnMesh);

    // 2. Dark Soil / Mulch Flowerbed Border surrounding house foundation
    const bedGeo = new THREE.BoxGeometry(houseWidth + 1.8, 0.06, houseDepth + 1.8);
    const soilBedMat = new THREE.MeshStandardMaterial({ color: isDarkSiteMode ? 0x1c1917 : 0x3d271d, roughness: 0.95 });
    const bedMesh = new THREE.Mesh(bedGeo, soilBedMat);
    bedMesh.position.set(0, 0.03, 0);
    bedMesh.receiveShadow = true;
    gardenGroup.add(bedMesh);

    // 3. Clean Stone Entrance Pathway leading to main entrance
    const pathZLen = plotDepth / 2 - houseDepth / 2 - 0.2;
    const pathZCenter = houseDepth / 2 + pathZLen / 2;

    const mainPathMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.05, pathZLen),
      new THREE.MeshStandardMaterial({ color: isDarkSiteMode ? 0x334155 : 0xcbd5e1, roughness: 0.5, metalness: 0.05 })
    );
    mainPathMesh.position.set(0, 0.065, pathZCenter);
    mainPathMesh.receiveShadow = true;
    gardenGroup.add(mainPathMesh);

    // Stone Paver Stepping Tiles along Pathway
    const paverCount = Math.floor(pathZLen / 0.9);
    const paverMat = new THREE.MeshStandardMaterial({ color: isDarkSiteMode ? 0x1e293b : 0x64748b, roughness: 0.4 });
    for (let p = 0; p < paverCount; p++) {
      const pTile = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.025, 0.35), paverMat);
      pTile.position.set(0, 0.105, houseDepth / 2 + 0.4 + p * 0.9);
      pTile.receiveShadow = true;
      gardenGroup.add(pTile);
    }

    // 4. Styled Perimeter Fence / Boundary Wall (حاير/سور)
    const wallH = 1.35;
    const wallThickness = 0.35;
    const wallPanelMat = new THREE.MeshStandardMaterial({ color: isDarkSiteMode ? 0x334155 : 0x475569, metalness: 0.4, roughness: 0.3 });
    const pillarMat = new THREE.MeshStandardMaterial({ color: isDarkSiteMode ? 0x1e293b : 0x0f172a, roughness: 0.3 });

    // Fence Boundary Coordinates
    const minX = -plotWidth / 2 + wallThickness / 2;
    const maxX = plotWidth / 2 - wallThickness / 2;
    const minZ = -plotDepth / 2 + wallThickness / 2;
    const maxZ = plotDepth / 2 - wallThickness / 2;

    // Back Fence (North)
    const fenceBackWall = new THREE.Mesh(new THREE.BoxGeometry(plotWidth, wallH, wallThickness), wallPanelMat);
    fenceBackWall.position.set(0, wallH / 2, minZ);
    fenceBackWall.castShadow = true;
    fenceBackWall.receiveShadow = true;
    gardenGroup.add(fenceBackWall);

    // Left Fence (West)
    const fenceLeftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallH, plotDepth), wallPanelMat);
    fenceLeftWall.position.set(minX, wallH / 2, 0);
    fenceLeftWall.castShadow = true;
    fenceLeftWall.receiveShadow = true;
    gardenGroup.add(fenceLeftWall);

    // Right Fence (East)
    const fenceRightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallH, plotDepth), wallPanelMat);
    fenceRightWall.position.set(maxX, wallH / 2, 0);
    fenceRightWall.castShadow = true;
    fenceRightWall.receiveShadow = true;
    gardenGroup.add(fenceRightWall);

    // Front Fence (South - with open entrance gate in middle)
    const gateWidth = 3.6;
    const sideFrontW = (plotWidth - gateWidth) / 2;

    const fenceFrontLeftWall = new THREE.Mesh(new THREE.BoxGeometry(sideFrontW, wallH, wallThickness), wallPanelMat);
    fenceFrontLeftWall.position.set(-plotWidth / 2 + sideFrontW / 2, wallH / 2, maxZ);
    fenceFrontLeftWall.castShadow = true;
    fenceFrontLeftWall.receiveShadow = true;
    gardenGroup.add(fenceFrontLeftWall);

    const fenceFrontRightWall = new THREE.Mesh(new THREE.BoxGeometry(sideFrontW, wallH, wallThickness), wallPanelMat);
    fenceFrontRightWall.position.set(plotWidth / 2 - sideFrontW / 2, wallH / 2, maxZ);
    fenceFrontRightWall.castShadow = true;
    fenceFrontRightWall.receiveShadow = true;
    gardenGroup.add(fenceFrontRightWall);

    // Gate Entry Pillars with Top Light Caps & Smart Home Emissive Accent Lights
    [-gateWidth / 2, gateWidth / 2].forEach((gx) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, wallH + 0.3, 0.7), pillarMat);
      pillar.position.set(gx, (wallH + 0.3) / 2, maxZ);
      pillar.castShadow = true;
      gardenGroup.add(pillar);

      const capLight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0xfef08a, 
          emissive: 0xfde047, 
          emissiveIntensity: isDarkSiteMode ? 1.0 : 0.4 
        })
      );
      capLight.position.set(gx, wallH + 0.35, maxZ);
      gardenGroup.add(capLight);

      if (isDarkSiteMode) {
        const pL = new THREE.PointLight(0xfde047, 0.8, 6);
        pL.position.set(gx, wallH + 0.45, maxZ);
        gardenGroup.add(pL);
      }
    });

    // Pathway Smart Home Bollard Accent Lights (Active in Night/Dark mode)
    if (isDarkSiteMode) {
      const bollardGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12);
      const bollardMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
      const lampMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });

      for (let p = 0; p < paverCount; p += 2) {
        const sideX = (p % 4 === 0) ? -1.35 : 1.35;
        const zPos = houseDepth / 2 + 0.4 + p * 0.9;
        const bollard = new THREE.Mesh(bollardGeo, bollardMat);
        bollard.position.set(sideX, 0.175, zPos);
        gardenGroup.add(bollard);

        const lampCap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), lampMat);
        lampCap.position.set(sideX, 0.35, zPos);
        gardenGroup.add(lampCap);

        const pL = new THREE.PointLight(0xfde047, 0.6, 4);
        pL.position.set(sideX, 0.4, zPos);
        gardenGroup.add(pL);
      }
    }

    // Corner Pillars
    [
      [minX, minZ], [maxX, minZ], [minX, maxZ], [maxX, maxZ]
    ].forEach(([cx, cz]) => {
      const cPillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, wallH + 0.2, 0.6), pillarMat);
      cPillar.position.set(cx, (wallH + 0.2) / 2, cz);
      cPillar.castShadow = true;
      gardenGroup.add(cPillar);
    });

    // 5. Low-Poly 3D Trees in Garden
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.9 });
    const foliageDarkMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.75 });
    const foliageLightMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 });

    const treePositions = [
      { x: minX + 2.5, z: minZ + 2.5, scale: 1.1 },
      { x: maxX - 2.5, z: minZ + 2.5, scale: 1.2 },
      { x: minX + 3.0, z: maxZ - 3.0, scale: 1.0 },
      { x: maxX - 3.0, z: maxZ - 3.0, scale: 1.15 },
      { x: minX + 2.0, z: 0, scale: 0.95 },
      { x: maxX - 2.0, z: -2.0, scale: 1.05 },
    ];

    treePositions.forEach((pos) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(pos.x, 0, pos.z);
      treeGroup.scale.setScalar(pos.scale);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 2.4, 8), trunkMat);
      trunk.position.y = 1.2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Multi-layered foliage cones
      const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.2, 8), foliageDarkMat);
      foliage1.position.y = 2.8;
      foliage1.castShadow = true;
      treeGroup.add(foliage1);

      const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 8), foliageLightMat);
      foliage2.position.y = 3.6;
      foliage2.castShadow = true;
      treeGroup.add(foliage2);

      gardenGroup.add(treeGroup);
    });

    // 6. Round Green Bush Shrubs along Flowerbed & Walkway
    const shrubPositions = [
      { x: -houseWidth / 2 - 0.6, z: houseDepth / 2 + 0.6 },
      { x: houseWidth / 2 + 0.6, z: houseDepth / 2 + 0.6 },
      { x: -houseWidth / 2 - 0.6, z: -houseDepth / 2 - 0.6 },
      { x: houseWidth / 2 + 0.6, z: -houseDepth / 2 - 0.6 },
      { x: -1.6, z: houseDepth / 2 + 1.2 },
      { x: 1.6, z: houseDepth / 2 + 1.2 },
      { x: -1.6, z: houseDepth / 2 + 2.8 },
      { x: 1.6, z: houseDepth / 2 + 2.8 },
    ];

    shrubPositions.forEach((sp) => {
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), foliageLightMat);
      shrub.scale.set(1.1, 0.8, 1.1);
      shrub.position.set(sp.x, 0.4, sp.z);
      shrub.castShadow = true;
      gardenGroup.add(shrub);
    });

    // ----------------------------------------------------
    // DYNAMIC 3D ARCHITECTURAL FLOOR PLAN MODEL GENERATION
    // ----------------------------------------------------
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    // Architectural Materials
    const wallMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x38bdf8, 
      transparent: true, 
      opacity: 0.32, 
      roughness: 0.05, 
      transmission: 0.9, 
      ior: 1.5, 
      depthWrite: false 
    });
    const innerWallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    const accentWallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    
    // Flooring Materials for distinct room zones
    const livingFloorMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.05 }); // Light Oak
    const bedroomFloorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.35 }); // Walnut Wood
    const kitchenFloorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.1 }); // Slate Tile
    const bathFloorMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.15 }); // Teal Tile
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });

    // Glass & Solar Materials
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      roughness: 0.05,
      transmission: 0.92,
      ior: 1.5,
    });
    const solarSiliconMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
    });
    const solarFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });

    // Furniture Materials
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 }); // Royal Blue
    const woodFurnitureMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 }); // Teak
    const bedMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 }); // White Linens
    const acBodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    // 1. Foundation Slab
    const slabGeo = new THREE.BoxGeometry(houseWidth + 0.4, 0.25, houseDepth + 0.4);
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.set(0, 0.125, 0);
    slabMesh.receiveShadow = true;
    houseGroup.add(slabMesh);

    // ----------------------------------------------------
    // DYNAMIC ROOM DIVISION & GRID MESH GENERATION
    // ----------------------------------------------------
    const allRoomCenters: { x: number; y: number; z: number; width: number; depth: number; isUpper?: boolean }[] = [];
    interiorLightsRef.current = [];
    const lightIntensity = ledToggle ? (ledBrightness / 100) * 1.5 : 0;

    const level1RoomCount = isTwoStory ? Math.max(1, Math.ceil(roomCount / 2)) : roomCount;
    const level2RoomCount = isTwoStory ? Math.max(0, Math.floor(roomCount / 2)) : 0;

    // --- LEVEL 1 (GROUND FLOOR) GRID COMPUTATION ---
    const cols1 = Math.max(1, Math.ceil(Math.sqrt(level1RoomCount)));
    const rows1 = Math.max(1, Math.ceil(level1RoomCount / cols1));

    const roomW1 = houseWidth / cols1;
    const roomD1 = houseDepth / rows1;
    const floorY1 = 0.26;

    const floorMaterials = [
      livingFloorMat,
      kitchenFloorMat,
      bedroomFloorMat,
      bathFloorMat,
    ];

    // 2. Ground Floor Tiles
    for (let i = 0; i < level1RoomCount; i++) {
      const c = i % cols1;
      const r = Math.floor(i / cols1);

      const x = -houseWidth / 2 + (c + 0.5) * roomW1;
      const z = -houseDepth / 2 + (r + 0.5) * roomD1;
      allRoomCenters.push({ x, y: floorY1, z, width: roomW1, depth: roomD1, isUpper: false });

      const tileMat = floorMaterials[i % floorMaterials.length];
      const tileGeo = new THREE.BoxGeometry(roomW1 - 0.08, 0.05, roomD1 - 0.08);
      const tileMesh = new THREE.Mesh(tileGeo, tileMat);
      tileMesh.position.set(x, floorY1, z);
      tileMesh.receiveShadow = true;
      houseGroup.add(tileMesh);
    }

    // 3. Open Architectural Cutaway View Walls (3 See-Through Perimeter Walls, Front Open)
    const wallHeight = 2.0; // Cutaway height for room visibility
    const wallThick = 0.22;

    // Rear See-Through Wall (Full Width)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(houseWidth, wallHeight, wallThick), wallMat);
    backWall.position.set(0, wallHeight / 2, -houseDepth / 2 + wallThick / 2);
    backWall.castShadow = true;
    houseGroup.add(backWall);

    // Left See-Through Wall (Full Depth)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, houseDepth), wallMat);
    leftWall.position.set(-houseWidth / 2 + wallThick / 2, wallHeight / 2, 0);
    leftWall.castShadow = true;
    houseGroup.add(leftWall);

    // Right See-Through Wall (Full Depth)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, houseDepth), wallMat);
    rightWall.position.set(houseWidth / 2 - wallThick / 2, wallHeight / 2, 0);
    rightWall.castShadow = true;
    houseGroup.add(rightWall);

    // Front Exterior Base Ledge Threshold
    const frontLedge = new THREE.Mesh(new THREE.BoxGeometry(houseWidth, 0.15, wallThick), accentWallMat);
    frontLedge.position.set(0, 0.075, houseDepth / 2 - wallThick / 2);
    houseGroup.add(frontLedge);

    // Front Entrance Step / Porch Platform elevated along Y-axis to eliminate Z-fighting flicker
    const frontStepGeo = new THREE.BoxGeometry(2.8, 0.12, 0.8);
    const frontStepMat = new THREE.MeshStandardMaterial({ color: isDarkSiteMode ? 0x475569 : 0xe2e8f0, roughness: 0.3 });
    const frontStepMesh = new THREE.Mesh(frontStepGeo, frontStepMat);
    frontStepMesh.position.set(0, 0.13, houseDepth / 2 + 0.3);
    frontStepMesh.receiveShadow = true;
    frontStepMesh.castShadow = true;
    houseGroup.add(frontStepMesh);

    // 4. Ground Floor Interior Partition Walls with Open Passages
    const pThick = 0.16;

    // Column Partitions (Vertical along Z)
    for (let c = 1; c < cols1; c++) {
      const wallX = -houseWidth / 2 + c * roomW1;
      for (let r = 0; r < rows1; r++) {
        const segCenterZ = -houseDepth / 2 + (r + 0.5) * roomD1;
        const doorW = Math.min(0.9, roomD1 * 0.35);
        const pieceLen = Math.max(0.2, (roomD1 - doorW) / 2);

        const p1 = new THREE.Mesh(new THREE.BoxGeometry(pThick, wallHeight * 0.85, pieceLen), innerWallMat);
        p1.position.set(wallX, (wallHeight * 0.85) / 2, segCenterZ - doorW / 2 - pieceLen / 2);
        p1.castShadow = true;
        houseGroup.add(p1);

        const p2 = new THREE.Mesh(new THREE.BoxGeometry(pThick, wallHeight * 0.85, pieceLen), innerWallMat);
        p2.position.set(wallX, (wallHeight * 0.85) / 2, segCenterZ + doorW / 2 + pieceLen / 2);
        p2.castShadow = true;
        houseGroup.add(p2);
      }
    }

    // Row Partitions (Horizontal along X)
    for (let r = 1; r < rows1; r++) {
      const wallZ = -houseDepth / 2 + r * roomD1;
      for (let c = 0; c < cols1; c++) {
        const segCenterX = -houseWidth / 2 + (c + 0.5) * roomW1;
        const doorW = Math.min(0.9, roomW1 * 0.35);
        const pieceLen = Math.max(0.2, (roomW1 - doorW) / 2);

        const p1 = new THREE.Mesh(new THREE.BoxGeometry(pieceLen, wallHeight * 0.85, pThick), innerWallMat);
        p1.position.set(segCenterX - doorW / 2 - pieceLen / 2, (wallHeight * 0.85) / 2, wallZ);
        p1.castShadow = true;
        houseGroup.add(p1);

        const p2 = new THREE.Mesh(new THREE.BoxGeometry(pieceLen, wallHeight * 0.85, pThick), innerWallMat);
        p2.position.set(segCenterX + doorW / 2 + pieceLen / 2, (wallHeight * 0.85) / 2, wallZ);
        p2.castShadow = true;
        houseGroup.add(p2);
      }
    }

    // 8. Dynamic Second Level Construction (if buildingStories === 2)
    let roofY = 2.2;
    if (isTwoStory) {
      roofY = 4.8;

      // Second Level Floor Slab
      const uSlab = new THREE.Mesh(new THREE.BoxGeometry(houseWidth * 0.95, 0.2, houseDepth * 0.95), slabMat);
      uSlab.position.set(0, 2.1, 0);
      houseGroup.add(uSlab);

      // Second Level Rear & Side See-Through Walls
      const uWallHeight = 2.0;
      const uBackWall = new THREE.Mesh(new THREE.BoxGeometry(houseWidth * 0.95, uWallHeight, wallThick), wallMat);
      uBackWall.position.set(0, 2.1 + uWallHeight / 2, -houseDepth / 2 + wallThick / 2);
      houseGroup.add(uBackWall);

      const uLeftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, uWallHeight, houseDepth * 0.95), wallMat);
      uLeftWall.position.set(-houseWidth * 0.475 + wallThick / 2, 2.1 + uWallHeight / 2, 0);
      houseGroup.add(uLeftWall);

      const uRightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, uWallHeight, houseDepth * 0.95), wallMat);
      uRightWall.position.set(houseWidth * 0.475 - wallThick / 2, 2.1 + uWallHeight / 2, 0);
      houseGroup.add(uRightWall);

      // Level 2 Grid computation
      if (level2RoomCount > 0) {
        const cols2 = Math.max(1, Math.ceil(Math.sqrt(level2RoomCount)));
        const rows2 = Math.max(1, Math.ceil(level2RoomCount / cols2));

        const roomW2 = (houseWidth * 0.95) / cols2;
        const roomD2 = (houseDepth * 0.95) / rows2;
        const floorY2 = 2.22;

        for (let j = 0; j < level2RoomCount; j++) {
          const c = j % cols2;
          const r = Math.floor(j / cols2);

          const x = -houseWidth * 0.475 + (c + 0.5) * roomW2;
          const z = -houseDepth * 0.475 + (r + 0.5) * roomD2;
          allRoomCenters.push({ x, y: floorY2, z, width: roomW2, depth: roomD2, isUpper: true });

          const tileMat = floorMaterials[(j + 2) % floorMaterials.length];
          const tileGeo = new THREE.BoxGeometry(roomW2 - 0.08, 0.05, roomD2 - 0.08);
          const tileMesh = new THREE.Mesh(tileGeo, tileMat);
          tileMesh.position.set(x, floorY2, z);
          tileMesh.receiveShadow = true;
          houseGroup.add(tileMesh);
        }

        // Level 2 Column Partitions
        for (let c = 1; c < cols2; c++) {
          const wallX = -houseWidth * 0.475 + c * roomW2;
          for (let r = 0; r < rows2; r++) {
            const segCenterZ = -houseDepth * 0.475 + (r + 0.5) * roomD2;
            const doorW = Math.min(0.9, roomD2 * 0.35);
            const pieceLen = Math.max(0.2, (roomD2 - doorW) / 2);

            const p1 = new THREE.Mesh(new THREE.BoxGeometry(pThick, uWallHeight * 0.85, pieceLen), innerWallMat);
            p1.position.set(wallX, 2.1 + (uWallHeight * 0.85) / 2, segCenterZ - doorW / 2 - pieceLen / 2);
            p1.castShadow = true;
            houseGroup.add(p1);

            const p2 = new THREE.Mesh(new THREE.BoxGeometry(pThick, uWallHeight * 0.85, pieceLen), innerWallMat);
            p2.position.set(wallX, 2.1 + (uWallHeight * 0.85) / 2, segCenterZ + doorW / 2 + pieceLen / 2);
            p2.castShadow = true;
            houseGroup.add(p2);
          }
        }

        // Level 2 Row Partitions
        for (let r = 1; r < rows2; r++) {
          const wallZ = -houseDepth * 0.475 + r * roomD2;
          for (let c = 0; c < cols2; c++) {
            const segCenterX = -houseWidth * 0.475 + (c + 0.5) * roomW2;
            const doorW = Math.min(0.9, roomW2 * 0.35);
            const pieceLen = Math.max(0.2, (roomW2 - doorW) / 2);

            const p1 = new THREE.Mesh(new THREE.BoxGeometry(pieceLen, uWallHeight * 0.85, pThick), innerWallMat);
            p1.position.set(segCenterX - doorW / 2 - pieceLen / 2, 2.1 + (uWallHeight * 0.85) / 2, wallZ);
            p1.castShadow = true;
            houseGroup.add(p1);

            const p2 = new THREE.Mesh(new THREE.BoxGeometry(pieceLen, uWallHeight * 0.85, pThick), innerWallMat);
            p2.position.set(segCenterX + doorW / 2 + pieceLen / 2, 2.1 + (uWallHeight * 0.85) / 2, wallZ);
            p2.castShadow = true;
            houseGroup.add(p2);
          }
        }
      }

      // Staircase Connector
      const stairs = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.0, 1.8), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 }));
      stairs.position.set(-houseWidth * 0.02, 1.1, -houseDepth * 0.15);
      stairs.rotation.x = Math.PI / 8;
      houseGroup.add(stairs);
    }

    // 5. Stylized 3D Interior Furniture Silhouettes for all Rooms
    const furnitureGroup = new THREE.Group();
    houseGroup.add(furnitureGroup);

    allRoomCenters.forEach((room, idx) => {
      const fScale = Math.min(1.0, Math.min(room.width / 5.0, room.depth / 4.0));
      const baseY = room.y;

      const type = idx % 4;
      if (type === 0) {
        // Living Room Furniture
        const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.0 * fScale, 0.35 * fScale, 0.8 * fScale), sofaMat);
        sofa.position.set(room.x, baseY + 0.2 * fScale, room.z + room.depth * 0.15);
        sofa.castShadow = true;
        furnitureGroup.add(sofa);

        const table = new THREE.Mesh(new THREE.BoxGeometry(1.0 * fScale, 0.3 * fScale, 0.6 * fScale), woodFurnitureMat);
        table.position.set(room.x, baseY + 0.18 * fScale, room.z - room.depth * 0.05);
        table.castShadow = true;
        furnitureGroup.add(table);

        const tv = new THREE.Mesh(new THREE.BoxGeometry(1.2 * fScale, 0.7 * fScale, 0.06 * fScale), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 }));
        tv.position.set(room.x, baseY + 0.8 * fScale, room.z - room.depth * 0.35);
        furnitureGroup.add(tv);
      } else if (type === 1) {
        // Kitchen / Dining Furniture
        const counter = new THREE.Mesh(new THREE.BoxGeometry(1.8 * fScale, 0.75 * fScale, 0.6 * fScale), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.3, roughness: 0.2 }));
        counter.position.set(room.x + room.width * 0.15, baseY + 0.38 * fScale, room.z + room.depth * 0.15);
        counter.castShadow = true;
        furnitureGroup.add(counter);

        const dTable = new THREE.Mesh(new THREE.BoxGeometry(1.2 * fScale, 0.65 * fScale, 0.7 * fScale), woodFurnitureMat);
        dTable.position.set(room.x - room.width * 0.15, baseY + 0.33 * fScale, room.z - room.depth * 0.15);
        dTable.castShadow = true;
        furnitureGroup.add(dTable);
      } else if (type === 2) {
        // Master Bedroom
        const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.5 * fScale, 0.3 * fScale, 1.7 * fScale), woodFurnitureMat);
        bedFrame.position.set(room.x, baseY + 0.18 * fScale, room.z);
        bedFrame.castShadow = true;
        furnitureGroup.add(bedFrame);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.4 * fScale, 0.2 * fScale, 1.6 * fScale), bedMat);
        mattress.position.set(room.x, baseY + 0.38 * fScale, room.z);
        furnitureGroup.add(mattress);
      } else {
        // Bedroom / Study
        const twinBed = new THREE.Mesh(new THREE.BoxGeometry(1.1 * fScale, 0.3 * fScale, 1.5 * fScale), bedMat);
        twinBed.position.set(room.x + room.width * 0.15, baseY + 0.2 * fScale, room.z);
        twinBed.castShadow = true;
        furnitureGroup.add(twinBed);

        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.0 * fScale, 0.6 * fScale, 0.5 * fScale), woodFurnitureMat);
        desk.position.set(room.x - room.width * 0.15, baseY + 0.3 * fScale, room.z - room.depth * 0.15);
        furnitureGroup.add(desk);
      }
    });

    // 6. Wall-Mounted Indoor AC Unit Models in rooms
    const indoorAcGroup = new THREE.Group();
    houseGroup.add(indoorAcGroup);

    for (let a = 0; a < acCount; a++) {
      const room = allRoomCenters[a % allRoomCenters.length];
      if (!room) continue;

      const acY = room.isUpper ? 3.7 : 1.7;
      const acScale = Math.min(1.0, Math.min(room.width / 4.0, 1.0));

      const acChassis = new THREE.Mesh(new THREE.BoxGeometry(1.0 * acScale, 0.3 * acScale, 0.2 * acScale), acBodyMat);
      acChassis.position.set(room.x, acY, room.z - room.depth * 0.42);
      acChassis.castShadow = true;
      indoorAcGroup.add(acChassis);

      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.85 * acScale, 0.04 * acScale, 0.02 * acScale), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
      vent.position.set(room.x, acY - 0.1 * acScale, room.z - room.depth * 0.42 + 0.1 * acScale);
      indoorAcGroup.add(vent);

      const airFlow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8 * acScale, 0.5 * acScale),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
      );
      airFlow.rotation.x = Math.PI / 4;
      airFlow.position.set(room.x, acY - 0.3 * acScale, room.z - room.depth * 0.42 + 0.2 * acScale);
      indoorAcGroup.add(airFlow);
    }

    // 7. Dynamic Ceiling Lights per Room
    allRoomCenters.forEach((room) => {
      const lightY = room.isUpper ? 4.2 : 1.9;

      const fixture = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0xfef08a, 
          emissive: 0xfef08a, 
          emissiveIntensity: isDarkSiteMode ? 0.95 : (ledToggle ? 0.8 : 0) 
        })
      );
      fixture.position.set(room.x, lightY + 0.05, room.z);
      houseGroup.add(fixture);

      const pLightInt = isDarkSiteMode ? Math.max(1.2, lightIntensity * 1.3) : lightIntensity;
      const pLight = new THREE.PointLight(0xfef08a, pLightInt, 9);
      pLight.position.set(room.x, lightY, room.z);
      houseGroup.add(pLight);
      interiorLightsRef.current.push(pLight);
    });

    // 9. Full Roof Structure Cover (Semi-Transparent / See-Through over full top footprint)
    const seeThroughRoofMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      roughness: 0.1,
      transmission: 0.8,
      ior: 1.4,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const fullRoofWidth = houseWidth + 0.3;
    const fullRoofDepth = houseDepth + 0.3;
    const roofCover = new THREE.Mesh(new THREE.BoxGeometry(fullRoofWidth, 0.12, fullRoofDepth), seeThroughRoofMat);
    roofCover.position.set(0, roofY + 0.06, 0);
    roofCover.receiveShadow = true;
    houseGroup.add(roofCover);

    // Subtle parapet boundary trim around full roof perimeter
    const parapetMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const parapetBack = new THREE.Mesh(new THREE.BoxGeometry(fullRoofWidth, 0.2, 0.1), parapetMat);
    parapetBack.position.set(0, roofY + 0.16, -fullRoofDepth / 2 + 0.05);
    houseGroup.add(parapetBack);

    const parapetLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, fullRoofDepth), parapetMat);
    parapetLeft.position.set(-fullRoofWidth / 2 + 0.05, roofY + 0.16, 0);
    houseGroup.add(parapetLeft);

    const parapetRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, fullRoofDepth), parapetMat);
    parapetRight.position.set(fullRoofWidth / 2 - 0.05, roofY + 0.16, 0);
    houseGroup.add(parapetRight);

    // 10. Rooftop Solar Panel PV Array Mounted Neatly on Full Rooftop
    const solarGroup = new THREE.Group();
    solarPanelsMeshRef.current = solarGroup;
    houseGroup.add(solarGroup);
    solarGroup.visible = solarToggle;

    const panelCols = Math.min(6, Math.max(2, Math.floor(houseWidth / 2.2)));
    const panelRows = 2;

    for (let c = 0; c < panelCols; c++) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, houseDepth * 0.7), solarFrameMat);
      rail.position.set(-panelCols * 0.85 + c * 1.7 + 0.85, roofY + 0.16, 0);
      solarGroup.add(rail);
    }

    for (let r = 0; r < panelRows; r++) {
      for (let c = 0; c < panelCols; c++) {
        const panelMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.95), solarSiliconMat);
        const zPos = (r === 0 ? -1 : 1) * (houseDepth * 0.2);
        panelMesh.position.set(
          -panelCols * 0.85 + c * 1.7 + 0.85,
          roofY + 0.22,
          zPos
        );
        panelMesh.rotation.x = Math.PI / 20;
        panelMesh.castShadow = true;
        solarGroup.add(panelMesh);
      }
    }

    // 11. Outdoor AC Condenser Units (Mounted neatly on exterior sides)
    acFansRef.current = [];
    const acUnitGroup = new THREE.Group();
    houseGroup.add(acUnitGroup);

    for (let i = 0; i < acCount; i++) {
      const isUpper = isTwoStory && i >= Math.ceil(acCount / 2);
      const indexOnLevel = isUpper ? i - Math.ceil(acCount / 2) : i;
      const levelTotal = isUpper ? Math.floor(acCount / 2) : Math.ceil(acCount / 2);

      const side = (indexOnLevel % 2 === 0) ? -1 : 1;
      const posX = side * (houseWidth / 2 + 0.42);
      const posY = isUpper ? 3.2 : 0.85;
      const spacing = houseDepth / (levelTotal + 1);
      const posZ = -houseDepth / 2 + spacing * (Math.floor(indexOnLevel / 2) + 1);

      const acBoxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.85, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 })
      );
      acBoxMesh.position.set(posX, posY, posZ);
      acBoxMesh.castShadow = true;
      acUnitGroup.add(acBoxMesh);

      const fanMesh = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.45, 0.45), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
      fanMesh.position.set(posX + (side > 0 ? -0.36 : 0.36), posY, posZ);
      acUnitGroup.add(fanMesh);
      acFansRef.current.push(fanMesh);
    }

    // 12. Garden Sprinklers & Outdoor Irrigation Visual Indicators
    const sprinklerGroup = new THREE.Group();
    sprinklerSprayGroupRef.current = sprinklerGroup;
    sprinklerSprayHeadsRef.current = [];
    gardenGroup.add(sprinklerGroup);

    const sprinklerPositions = [
      { x: -houseWidth / 2 - 2.2, z: houseDepth / 2 - 1.5 },
      { x: houseWidth / 2 + 2.2, z: houseDepth / 2 - 1.5 },
      { x: -houseWidth / 2 - 2.2, z: -houseDepth / 2 + 1.5 },
      { x: houseWidth / 2 + 2.2, z: -houseDepth / 2 + 1.5 }
    ];

    const collarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.1 });
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const sprayMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
    const mistRingMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.35, side: THREE.DoubleSide });

    sprinklerPositions.forEach((sp) => {
      // Stationary Black / Metallic Nozzle Base Fixtures (Fixed and anchored on lawn)
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 12), collarMat);
      collar.position.set(sp.x, 0.04, sp.z);
      sprinklerGroup.add(collar);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.18, 12), stemMat);
      stem.position.set(sp.x, 0.11, sp.z);
      sprinklerGroup.add(stem);

      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.05, 8), tipMat);
      tip.position.set(sp.x, 0.21, sp.z);
      sprinklerGroup.add(tip);

      // Localized Fine Water Spray Fan Arc
      const sprayCone = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.7, 16, 1, true), sprayMat);
      sprayCone.position.set(sp.x, 0.5, sp.z);
      sprayCone.rotation.x = Math.PI;
      sprinklerGroup.add(sprayCone);
      sprinklerSprayHeadsRef.current.push(sprayCone);

      // Wet lawn water ring around base
      const ripple = new THREE.Mesh(new THREE.RingGeometry(0.2, 1.2, 16), mistRingMat);
      ripple.position.set(sp.x, 0.02, sp.z);
      ripple.rotation.x = -Math.PI / 2;
      sprinklerGroup.add(ripple);
    });
    sprinklerGroup.visible = sprinklerActive && sprinklerMinutesPerDay > 0;

    // 13. Pipe Leakage Visual Beacon & Water Puddle
    const leakGroup = new THREE.Group();
    leakWaterGroupRef.current = leakGroup;
    houseGroup.add(leakGroup);

    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(1.0, 20),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.0, metalness: 0.9, transparent: true, opacity: 0.75 })
    );
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(-houseWidth * 0.25, 0.27, houseDepth * 0.25);
    leakGroup.add(puddle);

    const leakBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    leakBeacon.position.set(-houseWidth * 0.25, 1.4, houseDepth * 0.25);
    leakGroup.add(leakBeacon);

    leakGroup.visible = leakageSimToggle;

    waterHeaterLightRef.current = null;

    // ----------------------------------------------------
    // MOUSE ORBIT CONTROLS & EVENT LISTENERS
    // ----------------------------------------------------
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - deltaY * 0.008));

      updateCameraPosition();
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(16, Math.min(50, cameraAngleRef.current.radius + e.deltaY * 0.02));
      updateCameraPosition();
    };

    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Window Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ----------------------------------------------------
    // ANIMATION LOOP
    // ----------------------------------------------------
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (autoRotateRef.current && !isDraggingRef.current) {
        cameraAngleRef.current.theta += 0.003;
        updateCameraPosition();
      }

      acFansRef.current.forEach((fan) => {
        if (fan) {
          fan.rotation.x += 0.25;
        }
      });

      if (sprinklerSprayGroupRef.current && sprinklerSprayGroupRef.current.visible) {
        sprinklerSprayHeadsRef.current.forEach((sprayMesh) => {
          if (sprayMesh) {
            sprayMesh.rotation.y += 0.035;
          }
        });
      }

      if (leakWaterGroupRef.current && leakWaterGroupRef.current.visible) {
        const timeVal = Date.now() * 0.006;
        const beacon = leakWaterGroupRef.current.children[1];
        if (beacon) {
          beacon.position.y = 1.4 + Math.sin(timeVal) * 0.15;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        try {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        } catch (err) {
          console.warn('Render skipped due to context loss:', err);
          setWebglError(true);
        }
      }
    };

    animate();

    // Cleanup
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('wheel', handleWheel);
      if (rendererRef.current) {
        try {
          rendererRef.current.dispose();
        } catch {
          // Safe disposal ignore
        }
        rendererRef.current = null;
      }
    };
  }, [wizardStep, homeArea, acCount, roomCount, buildingStories, isDarkSiteMode]);

  // Handle Preset View Angles
  const handleCameraViewChange = (view: 'iso' | 'front' | 'roof' | 'top') => {
    setCameraView(view);
    playSound('click', isMuted);
    if (view === 'iso') {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 26 };
    } else if (view === 'front') {
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 2.3, radius: 24 };
    } else if (view === 'roof') {
      cameraAngleRef.current = { theta: Math.PI / 3, phi: Math.PI / 4, radius: 20 };
    } else if (view === 'top') {
      cameraAngleRef.current = { theta: 0, phi: 0.1, radius: 32 };
    }
    if (cameraRef.current) {
      const { theta, phi, radius } = cameraAngleRef.current;
      cameraRef.current.position.x = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.position.y = radius * Math.cos(phi);
      cameraRef.current.position.z = radius * Math.sin(phi) * Math.sin(theta);
      cameraRef.current.lookAt(0, 1.8, 0);
    }
  };

  // ----------------------------------------------------
  // RENDER STEP 1: INITIAL 3D HOME SETUP WIZARD (MANUAL NUMBER INPUTS)
  // ----------------------------------------------------
  if (wizardStep === 'setup') {
    return (
      <div className={`w-full min-h-[650px] h-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-y-auto select-none rounded-2xl border border-emerald-200/80 dark:border-slate-800 shadow-xl ${className}`}>
        
        {/* Soft Ambient Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-slate-50 to-emerald-100/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pointer-events-none" />
        
        {/* Wizard Card Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-200 dark:border-slate-800 shadow-xl rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 my-auto">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-sm">
                <Leaf className="w-7 h-7 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  EcoBill
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    3D Setup Wizard
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isArabic 
                    ? 'إدخال مواصفات المنزل لتوليد التوأم الرقمي' 
                    : 'Enter exact numeric values to generate your 3D Digital Twin'}
                </p>
              </div>
            </div>

            {onExit && (
              <button
                onClick={onExit}
                className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title={isArabic ? 'خروج' : 'Exit Setup'}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Form Options Grid with Direct Manual Number Inputs & Building Stories Choice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            
            {/* INPUT 1: BUILDING FLOORS / STORIES (INTERACTIVE NUMERIC STEPPER) */}
            <div className="flex flex-col justify-between p-4 overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 gap-2">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isArabic ? '١. عدد الطوابق' : '1. Number of Floors'}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {toLocalDigits(buildingStories, language)} {buildingStories === 1 ? (isArabic ? 'طابق' : 'Floor') : (isArabic ? 'طوابق' : 'Floors')}
                </span>
              </label>

              <div className="flex items-center gap-2 pt-1" dir="ltr">
                <button
                  type="button"
                  onClick={() => {
                    setBuildingStories(Math.max(1, buildingStories - 1) as 1 | 2);
                    playSound('click', isMuted);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'تقليل عدد الطوابق' : 'Decrease floors'}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="relative flex-1 min-w-[80px]">
                  <input
                    type="text"
                    readOnly
                    value={`${toLocalDigits(buildingStories, language)} ${buildingStories === 1 ? (isArabic ? 'طابق' : 'Floor') : (isArabic ? 'طوابق' : 'Floors')}`}
                    className="w-full py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl shadow-2xs focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBuildingStories(Math.min(10, buildingStories + 1) as any);
                    playSound('click', isMuted);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'زيادة عدد الطوابق' : 'Increase floors'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">
                <span>{isArabic ? 'خيارات:' : 'Presets:'}</span>
                <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setBuildingStories(num as any);
                        playSound('click', isMuted);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        buildingStories === num 
                          ? 'bg-emerald-600 text-white shadow-2xs' 
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      {toLocalDigits(num, language)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MANUAL INPUT 2: HOME AREA (m²) */}
            <div className="flex flex-col justify-between p-4 overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 gap-2">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isArabic ? '٢. مساحة المنزل' : '2. Home Area'}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatUnit(homeArea, 'm2', language)}
                </span>
              </label>

              <div className="flex items-center gap-2 pt-1" dir="ltr">
                <button
                  type="button"
                  onClick={() => {
                    setHomeArea(Math.max(40, homeArea - 10));
                    playSound('click', isMuted);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'تقليل المساحة' : 'Decrease area'}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="relative flex-1 min-w-[80px]">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={`${toLocalDigits(homeArea || '', language)} ${unitsMap[language].m2}`}
                    onChange={(e) => {
                      const rawVal = e.target.value.replace(/[^\d٠١٢٣٤٥٦٧٨٩]/g, '');
                      const westernDigits = rawVal.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                      const val = parseInt(westernDigits, 10);
                      setHomeArea(isNaN(val) ? 0 : Math.min(2000, val));
                    }}
                    placeholder={isArabic ? 'مثال: ٢٨٠ م²' : 'e.g., 280 m²'}
                    className="w-full py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setHomeArea(Math.min(2000, homeArea + 10));
                    playSound('click', isMuted);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'زيادة المساحة' : 'Increase area'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Preset Chips */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">
                <span>{isArabic ? 'خيارات:' : 'Presets:'}</span>
                <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
                  {[100, 250, 400, 600].map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => {
                        setHomeArea(area);
                        playSound('click', isMuted);
                      }}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        homeArea === area 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      {formatUnit(area, 'm2', language)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MANUAL INPUT 3: EXACT NUMBER OF ROOMS */}
            <div className="flex flex-col justify-between p-4 overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 gap-2">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isArabic ? '٣. عدد الغرف' : '3. Number of Rooms'}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatUnit(roomCount, 'rms', language)}
                </span>
              </label>

              <div className="flex items-center gap-2 pt-1" dir="ltr">
                <button
                  type="button"
                  onClick={() => {
                    setRoomCount(Math.max(1, roomCount - 1));
                    playSound('click', isMuted);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'تقليل الغرف' : 'Decrease rooms'}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="relative flex-1 min-w-[80px]">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={`${toLocalDigits(roomCount || '', language)} ${unitsMap[language].rms}`}
                    onChange={(e) => {
                      const rawVal = e.target.value.replace(/[^\d٠١٢٣٤٥٦٧٨٩]/g, '');
                      const westernDigits = rawVal.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                      const val = parseInt(westernDigits, 10);
                      setRoomCount(isNaN(val) ? 1 : Math.max(1, Math.min(20, val)));
                    }}
                    placeholder={isArabic ? 'مثال: ٥' : 'e.g., 5'}
                    className="w-full py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRoomCount(Math.min(20, roomCount + 1));
                    playSound('click', isMuted);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'زيادة الغرف' : 'Increase rooms'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">
                <span>{isArabic ? 'خيارات:' : 'Presets:'}</span>
                <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
                  {[2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setRoomCount(num);
                        playSound('click', isMuted);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        roomCount === num 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      {toLocalDigits(num, language)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MANUAL INPUT 4: EXACT NUMBER OF AC UNITS */}
            <div className="flex flex-col justify-between p-4 overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 gap-2">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isArabic ? '٤. عدد المكيفات' : '4. AC Units Count'}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatUnit(acCount, 'acs', language)}
                </span>
              </label>

              <div className="flex items-center gap-2 pt-1" dir="ltr">
                <button
                  type="button"
                  onClick={() => {
                    setAcCount(Math.max(1, acCount - 1));
                    playSound('click', isMuted);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'تقليل المكيفات' : 'Decrease ACs'}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="relative flex-1 min-w-[80px]">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={`${toLocalDigits(acCount || '', language)} ${unitsMap[language].acs}`}
                    onChange={(e) => {
                      const rawVal = e.target.value.replace(/[^\d٠١٢٣٤٥٦٧٨٩]/g, '');
                      const westernDigits = rawVal.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                      const val = parseInt(westernDigits, 10);
                      setAcCount(isNaN(val) ? 1 : Math.max(1, Math.min(20, val)));
                    }}
                    placeholder={isArabic ? 'مثال: ٤' : 'e.g., 4'}
                    className="w-full py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAcCount(Math.min(20, acCount + 1));
                    playSound('click', isMuted);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'زيادة المكيفات' : 'Increase ACs'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* AC Presets */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">
                <span>{isArabic ? 'خيارات:' : 'Presets:'}</span>
                <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
                  {[2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setAcCount(num);
                        playSound('click', isMuted);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        acCount === num 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      {formatUnit(num, 'acs', language)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TOGGLE INPUT 5: ROOFTOP SOLAR PANELS */}
            <div className="flex flex-col justify-between p-4 overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 gap-2">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isArabic ? '٥. طاقة شمسية؟' : '5. Solar PV?'}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {hasSolar ? (isArabic ? 'مفعل' : 'Active') : (isArabic ? 'غير مفعل' : 'Off')}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setHasSolar(true);
                    playSound('click', isMuted);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                    hasSolar 
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-extrabold text-xs' 
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 font-medium text-xs'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isArabic ? 'نعم' : 'Yes'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHasSolar(false);
                    playSound('click', isMuted);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                    !hasSolar 
                      ? 'bg-slate-800 dark:bg-slate-900 text-white border-slate-900 shadow-sm font-extrabold text-xs' 
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 font-medium text-xs'
                  }`}
                >
                  <span>{isArabic ? 'لا' : 'No'}</span>
                </button>
              </div>
            </div>

            {/* INPUT 6: WATER HEATERS COUNT (INTERACTIVE COUNTER 0 TO 6 UNITS, DEFAULT: 2) */}
            <div className="flex flex-col justify-between p-4 overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 gap-2">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isArabic ? '٦. عدد السخانات' : '6. WATER HEATERS COUNT'}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {toLocalDigits(waterHeaterCount, language)} {isArabic ? 'سخان' : 'Units'}
                </span>
              </label>

              <div className="flex items-center gap-2 pt-1" dir="ltr">
                <button
                  type="button"
                  onClick={() => {
                    setWaterHeaterCount(Math.max(0, waterHeaterCount - 1));
                    playSound('click', isMuted);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'تقليل السخانات' : 'Decrease water heaters'}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="relative flex-1 min-w-[80px]">
                  <input
                    type="text"
                    readOnly
                    value={`${toLocalDigits(waterHeaterCount, language)} ${isArabic ? 'سخان' : 'Units'}`}
                    className="w-full py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl shadow-2xs focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setWaterHeaterCount(Math.min(6, waterHeaterCount + 1));
                    playSound('click', isMuted);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'زيادة السخانات' : 'Increase water heaters'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">
                <span>{isArabic ? 'خيارات:' : 'Presets:'}</span>
                <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
                  {[0, 1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setWaterHeaterCount(num);
                        playSound('click', isMuted);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        waterHeaterCount === num 
                          ? 'bg-emerald-600 text-white shadow-2xs' 
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      {toLocalDigits(num, language)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Model Summary Notice */}
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <span className="font-semibold">
              🏛️ {isArabic ? 'مخرج النموذج ثلاثي الأبعاد:' : '3D Model Output:'} <strong className="font-bold">
                {buildingStories === 2 
                  ? (isArabic ? 'فيلا من طابقين' : '2-Story Villa Structure') 
                  : (isArabic ? 'منزل من طابق واحد' : '1-Story Single Level Home')}
              </strong> ({formatUnit(homeArea, 'm2', language)}، {formatUnit(roomCount, 'rms', language)}، {formatUnit(acCount, 'acs', language)})
            </span>
          </div>

          {/* GENERATE CTA BUTTON */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              💡 {isArabic ? `تعرفة السعودية للكهرباء السكنية (${toLocalDigits('0.18', language)} ${unitsMap[language].sarKwh})` : 'SEC Residential Tariff standard (0.18 SAR/kWh) applied dynamically'}
            </div>

            <button
              onClick={() => {
                playSound('reward', isMuted);
                setWizardStep('studio');
                confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
              }}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-emerald-200" />
              <span>{isArabic ? 'إنشاء التوأم الرقمي' : 'Generate My 3D Twin'}</span>
            </button>
          </div>

        </div>

      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER STEP 2: DYNAMIC 3D STUDIO & SIMULATION VIEW
  // ----------------------------------------------------
  return (
    <DigitalTwinErrorBoundary>
      <div className={`relative w-full h-screen max-h-[900px] bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden select-none rounded-2xl border border-emerald-200/80 dark:border-slate-800 shadow-xl ${className}`}>
      
      {/* ---------------------------------------------------- */}
      {/* 1. REAL-TIME RESPONSIVE TOP HUD BAR                  */}
      {/* ---------------------------------------------------- */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2.5 md:p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-emerald-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        
        {/* Brand Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-xs shrink-0">
            <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                EcoBill Twin 3D
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                LIVE SIM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {formatUnit(homeArea, 'm2', language)} • {formatUnit(acCount, 'acs', language)} • {formatUnit(roomCount, 'rms', language)} {solarToggle ? (isArabic ? '• طاقة شمسية' : '• Solar PV') : ''}
            </p>
          </div>
        </div>

        {/* Dynamic Metric Display Cards */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
          
          {/* 1. ELECTRICITY COST (SEC) */}
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60 shadow-xs flex items-center gap-2 min-w-[135px]">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                {isArabic ? 'كهرباء (SEC)' : 'Elec. Bill'}
              </div>
              <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono flex items-baseline gap-0.5">
                {formatUnit(projectedMonthlyBillSar.toFixed(2), 'sarMonth', language)}
              </div>
              <div className="text-[9px] font-medium text-slate-400">
                {formatUnit(projectedMonthlyKwh, 'kwhMonth', language)}
              </div>
            </div>
          </div>

          {/* 2. WATER COST & CONSUMPTION (NWC) */}
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-900/60 shadow-xs flex items-center gap-2 min-w-[140px]">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shrink-0">
              <Droplets className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                {isArabic ? 'مياه (NWC)' : 'Water Bill'}
              </div>
              <div className="text-sm font-extrabold text-sky-600 dark:text-sky-400 font-mono flex items-baseline gap-0.5">
                {toLocalDigits(projectedWaterBillSar.toFixed(2), language)} <span className="text-[9px] font-semibold">{unitsMap[language].sarMonth || 'SAR/mo'}</span>
              </div>
              <div className="text-[9px] font-medium text-slate-400">
                {toLocalDigits(projectedMonthlyM3, language)} {isArabic ? 'م³' : 'm³'} ({toLocalDigits(Math.round(projectedMonthlyM3 * 264.172), language)} Gal)
              </div>
            </div>
          </div>

          {/* 3. TOTAL COMBINED UTILITIES COST */}
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 shadow-xs flex items-center gap-2 min-w-[145px]">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-extrabold">
                {isArabic ? 'إجمالي المرافق' : 'Total Combined'}
              </div>
              <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 font-mono flex items-baseline gap-0.5">
                {toLocalDigits(totalCombinedUtilitiesSar.toFixed(2), language)} <span className="text-[9px] font-semibold">{unitsMap[language].sarMonth || 'SAR/mo'}</span>
              </div>
              <div className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                {isArabic ? 'كهرباء + مياه مدمجة' : 'Elec + Water Combined'}
              </div>
            </div>
          </div>

          {/* 4. CO2 SAVED kg/mo */}
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2 min-w-[115px]">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <Leaf className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                {isArabic ? 'توفير الكربون' : 'CO2 Saved'}
              </div>
              <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 font-mono flex items-baseline gap-0.5">
                {toLocalDigits(carbonReductionKg, language)} <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">{isArabic ? 'كجم' : 'kg'}</span>
              </div>
            </div>
          </div>

          {/* 5. ECO RATING BADGE */}
          <div className={`px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-2 border ${efficiencyBadge.color}`}>
            <Award className="w-3.5 h-3.5 shrink-0" />
            <div>
              <div className="text-[9px] uppercase tracking-wider font-bold opacity-90">
                {isArabic ? 'التقييم' : 'Rating'}
              </div>
              <div className="text-xs font-black font-mono flex items-center gap-0.5">
                <span>{efficiencyBadge.grade}</span>
                <span className="text-[10px] font-semibold opacity-95">({toLocalDigits(efficiencyScore, language)}%)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Controls & Camera Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Directions View Dropdown Menu */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsCameraDropdownOpen(!isCameraDropdownOpen);
                playSound('click', isMuted);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
              title={isArabic ? 'اختر اتجاه الكاميرا' : 'Select Camera View Angle'}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{isArabic ? 'الاتجاهات' : 'Directions'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isCameraDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Collapsible Dropdown Options */}
            {isCameraDropdownOpen && (
              <div className={`absolute top-full mt-2 ${isArabic ? 'left-0' : 'right-0'} min-w-[160px] p-1.5 rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col gap-1 z-50 transition-all`}>
                {[
                  { id: 'iso', label: isArabic ? 'منظور ثلاثي' : 'Isometric' },
                  { id: 'front', label: isArabic ? 'الواجهة الأمامية' : 'Front View' },
                  { id: 'roof', label: isArabic ? 'الألواح الشمسية' : 'Solar Roof' },
                  { id: 'top', label: isArabic ? 'المخطط العلوي' : 'Top View' },
                ].map((v) => {
                  const isSelected = cameraView === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        handleCameraViewChange(v.id as 'iso' | 'front' | 'roof' | 'top');
                        setIsCameraDropdownOpen(false);
                      }}
                      className={`w-full ${isArabic ? 'text-right' : 'text-left'} px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{v.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Orbit Auto-Rotation Toggle Switch */}
          <button
            type="button"
            onClick={() => {
              setAutoRotate(!autoRotate);
              playSound('click', isMuted);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap ${
              autoRotate 
                ? 'bg-emerald-600 border-emerald-500 text-white dark:bg-emerald-600 dark:border-emerald-500 shadow-emerald-500/20' 
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isArabic ? 'تبديل الدوران التلقائي' : 'Toggle 3D Orbit Auto Rotation'}
          >
            <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${autoRotate ? 'animate-spin text-white' : 'text-slate-500 dark:text-slate-400'}`} />
            <span>{autoRotate ? (isArabic ? 'دوران تلقائي' : 'Orbiting') : (isArabic ? 'دوران' : 'Orbit')}</span>
          </button>

          <button
            onClick={() => setWizardStep('setup')}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            title={isArabic ? 'تعديل مواصفات المنزل' : 'Edit 3D Home Specs'}
          >
            <Settings className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">{isArabic ? 'تعديل المواصفات' : 'Edit Specs'}</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            title={isMuted ? (isArabic ? 'تشغيل الصوت' : 'Unmute Sound') : (isArabic ? 'كتم الصوت' : 'Mute Sound')}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              title={isArabic ? 'إنهاء المحاكاة' : 'Exit Simulation'}
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isArabic ? 'خروج' : 'Exit'}</span>
            </button>
          )}
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. THREE.JS 3D CANVAS MOUNT POINT / 2D FALLBACK      */}
      {/* ---------------------------------------------------- */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing bg-slate-50 relative" 
        style={{ touchAction: 'none' }}
      >
        {webglError && (
          <div className="absolute inset-0 z-10 bg-slate-900/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-white text-center overflow-y-auto">
            <div className="max-w-xl w-full bg-slate-800/90 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Home className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Interactive 2D Digital Twin Active
                </div>
                <h2 className="text-xl font-extrabold text-white">
                  EcoBill Schematic Digital Twin
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Hardware 3D acceleration is restricted in this frame. Live interactive energy simulation is running in 2D Schematic Mode.
                </p>
              </div>

              {/* Live Interactive 2D Floorplan & Load Visualizer */}
              <div className="w-full bg-slate-950/80 rounded-2xl border border-slate-700 p-4 text-left grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Sun className="w-4 h-4 text-amber-400" /> Solar PV Panel Array
                  </span>
                  <span className={`font-mono font-extrabold px-2 py-0.5 rounded ${solarToggle ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                    {solarToggle ? `${calculateSolarGenKw()} kW` : 'OFF'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Thermometer className="w-4 h-4 text-cyan-400" /> AC HVAC ({acCount} Units)
                  </span>
                  <span className="font-mono font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {acTemp}°C ({calculateAcPowerKw()} kW)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Lightbulb className="w-4 h-4 text-amber-300" /> LED Lighting ({roomCount} Rooms)
                  </span>
                  <span className={`font-mono font-extrabold px-2 py-0.5 rounded ${ledToggle ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}`}>
                    {ledToggle ? `${ledBrightness}% (${calculateLightingKw()} kW)` : 'OFF'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Zap className="w-4 h-4 text-emerald-400" /> Smart Water Heater
                  </span>
                  <span className={`font-mono font-extrabold px-2 py-0.5 rounded ${waterHeaterToggle ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'}`}>
                    {waterHeaterToggle ? 'Eco Solar' : 'Standard'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWebglError(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Retry 3D Mode Initialization
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Notification */}
      {presetNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-600 text-white border border-emerald-700 text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          {presetNotification}
        </div>
      )}



      {/* ---------------------------------------------------- */}
      {/* 3. COMPACT WHAT-IF SIMULATION CONTROLS (BOTTOM HUD)  */}
      {/* ---------------------------------------------------- */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-2xl ${
        hudCollapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
      }`}>
        
        {/* HUD Drawer Header, Dual Utility Tab Switches & Collapse Toggle */}
        <div 
          onClick={() => setHudCollapsed(!hudCollapsed)}
          className="px-3 py-2 bg-slate-50/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all"
        >
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            
            {/* Dual Utility Tab Controls */}
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900/80 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setActiveControlTab('electricity');
                  playSound('click', isMuted);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeControlTab === 'electricity'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isArabic ? 'الكهرباء والإضاءة (SEC)' : 'Electricity Controls'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveControlTab('plumbing');
                  playSound('click', isMuted);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeControlTab === 'plumbing'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>{isArabic ? 'السباكة والري (NWC)' : 'Plumbing & Water'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Presets */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => applyEcoPreset('max')}
                className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold hover:bg-emerald-700 transition-all cursor-pointer"
              >
                {isArabic ? 'توفير أقصى' : 'Max Eco'}
              </button>
              <button
                onClick={() => applyEcoPreset('balanced')}
                className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-extrabold hover:bg-emerald-200 transition-all cursor-pointer"
              >
                {isArabic ? 'متوازن' : 'Balanced'}
              </button>
              <button
                onClick={() => applyEcoPreset('comfort')}
                className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-extrabold hover:bg-slate-300 transition-all cursor-pointer"
              >
                {isArabic ? 'راحة' : 'Comfort'}
              </button>
            </div>

            <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              {hudCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 7-Card Grid (Responsive, Dark Mode Optimized) */}
        <div className="p-2 sm:p-2.5 max-w-7xl mx-auto overflow-x-auto">
          {activeControlTab === 'electricity' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 min-w-[700px] lg:min-w-0">
            
            {/* CARD 1: AC TEMPERATURE CONTROL */}
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="p-1 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                    <Thermometer className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'حرارة المكيف' : 'AC Temp'}</span>
                </div>
                <span className="text-[10px] font-black font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded-md border border-sky-100 dark:border-sky-800">
                  {toLocalDigits(acTemp, language)}°C
                </span>
              </div>

              <div className="flex items-center gap-1 my-0.5">
                <button
                  onClick={() => {
                    setAcTemp(Math.max(20, acTemp - 1));
                    playSound('slider', isMuted);
                  }}
                  className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  -
                </button>

                <input
                  type="range"
                  min="20"
                  max="26"
                  step="1"
                  value={acTemp}
                  onChange={(e) => {
                    setAcTemp(parseInt(e.target.value));
                    playSound('slider', isMuted);
                  }}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />

                <button
                  onClick={() => {
                    setAcTemp(Math.min(26, acTemp + 1));
                    playSound('slider', isMuted);
                  }}
                  className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  +
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                <span>{toLocalDigits(acCount, language)} {isArabic ? 'مكيفات' : 'ACs'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{toLocalDigits(acPowerKw, language)} kW</span>
              </div>
            </div>

            {/* CARD 2: WATER HEATER DAILY RUNTIME SLIDER */}
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'السخان' : 'Water Heater'}</span>
                </div>
                <span className="text-[10px] font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800">
                  {toLocalDigits(waterHeaterHours, language)} h/d
                </span>
              </div>

              <div className="flex items-center gap-1 my-0.5">
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={waterHeaterHours}
                  onChange={(e) => {
                    setWaterHeaterHours(parseInt(e.target.value));
                    playSound('slider', isMuted);
                  }}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                <span>{toLocalDigits(waterHeaterCount, language)} {isArabic ? 'وحدات' : 'Units'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">~{Math.round(calculateSaudiBillSar(dailyWaterHeaterKwh * 30))} SAR/m</span>
              </div>
            </div>

            {/* CARD 3: TV / ENTERTAINMENT DAILY RUNTIME SLIDER */}
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="p-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    <Tv className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'التلفزيون' : 'TV / Media'}</span>
                </div>
                <span className="text-[10px] font-black font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1 py-0.5 rounded-md border border-purple-100 dark:border-purple-800">
                  {toLocalDigits(tvHours, language)} h/d
                </span>
              </div>

              <div className="flex items-center gap-1 my-0.5">
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={tvHours}
                  onChange={(e) => {
                    setTvHours(parseInt(e.target.value));
                    playSound('slider', isMuted);
                  }}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                <span>0.12 kW</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(tvPowerKw * tvHours).toFixed(1)} kWh/d</span>
              </div>
            </div>

            {/* CARD 4: WASHING MACHINE DAILY RUNTIME SLIDER */}
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'الغسالة' : 'Washing Machine'}</span>
                </div>
                <span className="text-[10px] font-black font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded-md border border-blue-100 dark:border-blue-800">
                  {toLocalDigits(wmHours, language)} h/d
                </span>
              </div>

              <div className="flex items-center gap-1 my-0.5">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={wmHours}
                  onChange={(e) => {
                    setWmHours(parseInt(e.target.value));
                    playSound('slider', isMuted);
                  }}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                <span>0.60 kW</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(wmPowerKw * wmHours).toFixed(1)} kWh/d</span>
              </div>
            </div>

            {/* CARD 5: REFRIGERATOR BASE LOAD INDICATOR (LOCKED 24/7) */}
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'الثلاجة' : 'Refrigerator'}</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
                  🔒 24/7 Base
                </span>
              </div>

              <div className="my-0.5 py-1 px-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px]">
                <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{isArabic ? 'قدرة ثابته' : 'Continuous'}:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">180W (0.18 kW)</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                <span>{isArabic ? 'تشغيل دائم' : 'Always Active'}</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">4.3 kWh/d</span>
              </div>
            </div>

            {/* CARD 6: LED LIGHTING CONTROL */}
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className={`p-1 rounded-md border ${ledToggle ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600'}`}>
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'إضاءة LED' : 'LED Lights'}</span>
                </div>

                <button
                  onClick={() => {
                    setLedToggle(!ledToggle);
                    playSound('toggle', isMuted);
                  }}
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold transition-all border cursor-pointer ${
                    ledToggle ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {ledToggle ? (isArabic ? 'تشغيل' : 'ON') : (isArabic ? 'إيقاف' : 'OFF')}
                </button>
              </div>

              <div className="flex items-center gap-1 my-0.5">
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  disabled={!ledToggle}
                  value={ledBrightness}
                  onChange={(e) => {
                    setLedBrightness(parseInt(e.target.value));
                    playSound('slider', isMuted);
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                <span>{toLocalDigits(roomCount, language)} {isArabic ? 'غرف' : 'Rms'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{toLocalDigits(lightingKw, language)} kW</span>
              </div>
            </div>

            {/* CARD 7: SOLAR PV SYSTEM TOGGLE */}
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className={`p-1 rounded-md border ${solarToggle ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600'}`}>
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'الطاقة الشمسية' : 'Solar PV'}</span>
                </div>

                <button
                  onClick={() => {
                    setSolarToggle(!solarToggle);
                    playSound('toggle', isMuted);
                  }}
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold transition-all border cursor-pointer ${
                    solarToggle ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {solarToggle ? (isArabic ? 'مفعل' : 'ACTIVE') : (isArabic ? 'إيقاف' : 'OFF')}
                </button>
              </div>

              <div className="text-[10px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800 flex items-center justify-between my-0.5">
                <span>{isArabic ? 'التوليد:' : 'Gen:'}</span>
                <span>+{toLocalDigits(solarGenKw, language)} kW</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                <span>{isArabic ? 'سطحي' : 'Rooftop'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{toLocalDigits(monthlySolarKwh, language)} kWh/m</span>
              </div>
            </div>

          </div>
          ) : (
            /* PLUMBING & WATER CONTROLS GRID (4 CARDS) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 max-w-5xl mx-auto">
              
              {/* PLUMBING CARD 1: FAUCETS & AERATOR */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-1.5 hover:border-sky-300 dark:hover:border-sky-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                      <Droplet className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'الصنابير والمغاسل' : 'Faucets & Sinks'}</span>
                  </div>
                  <button
                    onClick={() => {
                      setFaucetAerator(!faucetAerator);
                      playSound('toggle', isMuted);
                    }}
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold transition-all border cursor-pointer ${
                      faucetAerator ? 'bg-sky-600 text-white border-sky-700' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {faucetAerator ? (isArabic ? 'مرشد (4ل/د)' : 'ECO (4L/m)') : (isArabic ? 'عادي (8ل/د)' : 'STD (8L/m)')}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>{isArabic ? 'وقت التشغيل:' : 'Runtime:'}</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{toLocalDigits(faucetMinutesPerDay, language)} {isArabic ? 'دقيقة/يوم' : 'min/day'}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={faucetMinutesPerDay}
                    onChange={(e) => setFaucetMinutesPerDay(Number(e.target.value))}
                    className="w-full accent-sky-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="text-[10px] font-mono font-extrabold text-sky-700 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-950/60 px-1.5 py-0.5 rounded-lg border border-sky-100 dark:border-sky-800 flex items-center justify-between">
                  <span>{isArabic ? 'الاستهلاك:' : 'Daily:'}</span>
                  <span>{toLocalDigits(Math.round(faucetLitersDaily), language)} {isArabic ? 'ليتر/يوم' : 'L/day'}</span>
                </div>
              </div>

              {/* PLUMBING CARD 2: SHOWERS & RESTRICTORS */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-1.5 hover:border-sky-300 dark:hover:border-sky-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                      <Bath className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'رأس الدش' : 'Shower Heads'}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowerFlowRestrictor(!showerFlowRestrictor);
                      playSound('toggle', isMuted);
                    }}
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold transition-all border cursor-pointer ${
                      showerFlowRestrictor ? 'bg-sky-600 text-white border-sky-700' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {showerFlowRestrictor ? (isArabic ? 'مرشد (7ل/د)' : 'ECO (7L/m)') : (isArabic ? 'عالي (14ل/د)' : 'HIGH (14L/m)')}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>{isArabic ? 'مد الاستحمام:' : 'Shower Time:'}</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{toLocalDigits(showerMinutesPerDay, language)} {isArabic ? 'دقيقة' : 'min'}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={showerMinutesPerDay}
                    onChange={(e) => setShowerMinutesPerDay(Number(e.target.value))}
                    className="w-full accent-sky-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="text-[10px] font-mono font-extrabold text-sky-700 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-950/60 px-1.5 py-0.5 rounded-lg border border-sky-100 dark:border-sky-800 flex items-center justify-between">
                  <span>{isArabic ? 'الاستهلاك:' : 'Daily:'}</span>
                  <span>{toLocalDigits(Math.round(showerLitersDaily), language)} {isArabic ? 'ليتر/يوم' : 'L/day'}</span>
                </div>
              </div>

              {/* PLUMBING CARD 3: GARDEN SPRINKLERS & IRRIGATION */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-1.5 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1 rounded-md border ${sprinklerActive ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600'}`}>
                      <Sprout className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'رشاشات الحديقة' : 'Garden Sprinklers'}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSprinklerActive(!sprinklerActive);
                      playSound('toggle', isMuted);
                    }}
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold transition-all border cursor-pointer ${
                      sprinklerActive ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {sprinklerActive ? (isArabic ? 'مفعل' : 'ON') : (isArabic ? 'إيقاف' : 'OFF')}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>{isArabic ? 'وقت الري:' : 'Irrigation:'}</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{toLocalDigits(sprinklerMinutesPerDay, language)} {isArabic ? 'د/يوم' : 'm/day'}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    disabled={!sprinklerActive}
                    value={sprinklerMinutesPerDay}
                    onChange={(e) => setSprinklerMinutesPerDay(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer disabled:opacity-40"
                  />
                </div>

                <div className="text-[10px] font-mono font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
                  <span>{isArabic ? 'الري اليومي:' : 'Daily:'}</span>
                  <span>{toLocalDigits(Math.round(sprinklerLitersDaily), language)} {isArabic ? 'ليتر' : 'L/day'}</span>
                </div>
              </div>

              {/* PLUMBING CARD 4: LEAKAGE SIMULATION & DETECTOR */}
              <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border shadow-xs flex flex-col justify-between gap-1.5 transition-all ${
                leakageSimToggle 
                  ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 ring-1 ring-rose-400' 
                  : 'border-slate-200/90 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1 rounded-md border ${leakageSimToggle ? 'bg-rose-600 text-white border-rose-700 animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600'}`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{isArabic ? 'تسريب أنابيب مخفي' : 'Pipe Leak Simulator'}</span>
                  </div>
                  <button
                    onClick={() => {
                      setLeakageSimToggle(!leakageSimToggle);
                      playSound('toggle', isMuted);
                    }}
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold transition-all border cursor-pointer ${
                      leakageSimToggle ? 'bg-rose-600 text-white border-rose-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {leakageSimToggle ? (isArabic ? 'تسريب نشط!' : 'LEAKING!') : (isArabic ? 'سليم' : 'NORMAL')}
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {leakageSimToggle ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      <Wrench className="w-3 h-3 shrink-0" />
                      {isArabic ? 'تنبيه: تسريب 15 ليتر/ساعة ويهدر الماء!' : 'ALERT: 15L/hr leak detected wasting water!'}
                    </span>
                  ) : (
                    <span>{isArabic ? 'محاكاة تسريب مخفي لاختبار كشف الهدر' : 'Simulate hidden pipe leak to test NWC losses'}</span>
                  )}
                </div>

                <div className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-lg border flex items-center justify-between ${
                  leakageSimToggle
                    ? 'text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800'
                    : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                  <span>{isArabic ? 'الهدر:' : 'Waste:'}</span>
                  <span>{leakageSimToggle ? `+${toLocalDigits(leakageWastedLiters, language)} ${isArabic ? 'ليتر/يوم' : 'L/day'}` : (isArabic ? 'صفر' : '0 L')}</span>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
      </div>
    </DigitalTwinErrorBoundary>
  );
}
