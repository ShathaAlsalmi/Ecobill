import { AppliancePreset, ApplianceTypeKey } from '../types';

export const COMMON_APPLIANCES: AppliancePreset[] = [
  {
    type: 'Air Conditioner',
    iconName: 'AirVent',
    defaultWattage: 1500,
    defaultHours: 8,
    description: 'High power consumption during summer & cooling periods',
  },
  {
    type: 'Refrigerator',
    iconName: 'Refrigerator',
    defaultWattage: 180,
    defaultHours: 24,
    description: 'Runs continuously 24/7 with active compressor cycles',
  },
  {
    type: 'Television',
    iconName: 'Tv',
    defaultWattage: 110,
    defaultHours: 4,
    description: 'Smart LED TV screen and entertainment systems',
  },
  {
    type: 'Washing Machine',
    iconName: 'WashingMachine',
    defaultWattage: 600,
    defaultHours: 1,
    description: 'Laundry cycles, spin dryer & motor operations',
  },
  {
    type: 'Dishwasher',
    iconName: 'Sparkles',
    defaultWattage: 1200,
    defaultHours: 1.5,
    description: 'Water heating and drying cycle energy demand',
  },
  {
    type: 'Water Heater',
    iconName: 'Flame',
    defaultWattage: 2200,
    defaultHours: 2,
    description: 'Instant electric shower or central water storage heater',
  },
  {
    type: 'Lighting',
    iconName: 'Lightbulb',
    defaultWattage: 60,
    defaultHours: 6,
    description: 'LED or incandescent bulbs across living spaces',
  },
  {
    type: 'Other',
    iconName: 'Zap',
    defaultWattage: 300,
    defaultHours: 3,
    description: 'Computers, microwave, coffee maker or small appliances',
  },
];

export function getPresetForType(type: string): AppliancePreset {
  const found = COMMON_APPLIANCES.find((a) => a.type === type);
  if (found) return found;
  return {
    type: 'Other',
    iconName: 'Zap',
    defaultWattage: 300,
    defaultHours: 3,
    description: 'General electrical device',
  };
}

export function calculateDailyKWh(appliances: Array<{ units: number; hoursPerDay: number; estimatedWattage: number }>): number {
  const totalWatts = appliances.reduce((sum, item) => {
    return sum + (item.units * item.hoursPerDay * item.estimatedWattage);
  }, 0);
  return Number((totalWatts / 1000).toFixed(2));
}
