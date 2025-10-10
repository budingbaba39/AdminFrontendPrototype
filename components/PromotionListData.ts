export interface Promotion {
  id: string;

  // Basic Info
  promoName: string;
  promoType: 'Deposit' | 'Free';
  allowInterTransfer: boolean;

  // Bonus Info
  unlockRateWin: number; // percentage (0-100)
  unlockAmountLose: number;
  minTimeOfDeposit: number;
  minDeposit: number;
  maxClaimBonus: number;
  bonusRate: number; // percentage
  bonusFixedAmount: number;
  bonusRandom: {
    min: number;
    max: number;
  };
  maxWithdraw: number;

  // Details Info
  validFrom: string; // date string (YYYY-MM-DD)
  validTo: string; // date string (YYYY-MM-DD)
  status: 'Active' | 'Inactive';
  targetType: 'Valid Bet' | 'By Balance WinOver';
  targetMultiplier: number;
  recurring: 'Immediate' | 'One Time' | 'Recurring';
  resetFrequency?: 'Everyday' | 'Every Week' | 'Every Month'; // only if recurring
  resetFrequencyMonth?: string; // e.g., "January", "February"
  resetFrequencyDay?: number | string; // number for month (1-31), string for week day
  timeFrom: string; // time string (HH:mm in 24-hour format)
  timeTo: string; // time string (HH:mm in 24-hour format)
  includeRebate: boolean;
  requireApproval: boolean;

  // Relationships
  levelIds: number[]; // array of level IDs that can access this promotion
  providerIds: number[]; // array of provider IDs

  // Languages
  translations?: {
    english: { title: string; name: string; description: string; images: string[] };
    chinese: { title: string; name: string; description: string; images: string[] };
    malay: { title: string; name: string; description: string; images: string[] };
  };

  // Display
  memberApplied: number; // count of members who claimed (random number for prototype)
  createdDate: string;
}

export const initialPromotions: Promotion[] = [
  {
    id: 'PROMO001',
    promoName: '20%x3 Slot Daily Reload Bonus',
    promoType: 'Deposit',
    allowInterTransfer: true,
    unlockRateWin: 50,
    unlockAmountLose: 100,
    minTimeOfDeposit: 1,
    minDeposit: 50,
    maxClaimBonus: 500,
    bonusRate: 20,
    bonusFixedAmount: 0,
    bonusRandom: {
      min: 0,
      max: 0
    },
    maxWithdraw: 1000,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: 'Active',
    targetType: 'Valid Bet',
    targetMultiplier: 3,
    recurring: 'One Time',
    timeFrom: '00:00',
    timeTo: '23:59',
    includeRebate: true,
    requireApproval: false,
    levelIds: [1, 2, 3], // All levels
    providerIds: [6, 16, 31], // Pragmatic Play, Evolution Gaming, Betradar
    translations: {
      english: { title: '20%x3 Slot Daily Reload Bonus', name: '20% Bonus with 3x Turnover for Slot Daily Reload', description: '', images: [] },
      chinese: { title: '20%x3 老虎机每日充值奖金', name: '老虎机每日充值20%奖金（3倍流水）', description: '', images: [] },
      malay: { title: 'Bonus Reload Harian Slot 20%x3', name: 'Bonus 20% dengan Pusing Ganti 3x untuk Reload Harian Slot', description: '', images: [] }
    },
    memberApplied: 342,
    createdDate: '2024-01-01'
  },
  {
    id: 'PROMO002',
    promoName: '10%x1 Daily Sport Bonus',
    promoType: 'Deposit',
    allowInterTransfer: true,
    unlockRateWin: 30,
    unlockAmountLose: 50,
    minTimeOfDeposit: 0,
    minDeposit: 0,
    maxClaimBonus: 100,
    bonusRate: 10,
    bonusFixedAmount: 0,
    bonusRandom: {
      min: 0,
      max: 0
    },
    maxWithdraw: 200,
    validFrom: '2024-06-01',
    validTo: '2024-06-30',
    status: 'Active',
    targetType: 'By Balance WinOver',
    targetMultiplier: 1,
    recurring: 'Recurring',
    resetFrequency: 'Everyday',
    resetFrequencyDay: 'Monday',
    timeFrom: '00:00',
    timeTo: '23:59',
    includeRebate: false,
    requireApproval: true,
    levelIds: [1, 2, 3], // All levels
    providerIds: [31,32,33,34,35], // PG Soft, Spadegaming
    translations: {
      english: { title: '10%x1 Daily Sport Bonus', name: '10% Bonus with 1x Turnover for Daily Sport', description: '', images: [] },
      chinese: { title: '10%x1 每日体育奖金', name: '每日体育10%奖金（1倍流水）', description: '', images: [] },
      malay: { title: 'Bonus Sukan Harian 10%x1', name: 'Bonus 10% dengan Pusing Ganti 1x untuk Sukan Harian', description: '', images: [] }
    },
    memberApplied: 178,
    createdDate: '2024-05-15'
  },
  {
    id: 'PROMO003',
    promoName: '6%x1 UnlimitedReloadBonus',
    promoType: 'Deposit',
    allowInterTransfer: true,
    unlockRateWin: 75,
    unlockAmountLose: 500,
    minTimeOfDeposit: 3,
    minDeposit: 200,
    maxClaimBonus: 2000,
    bonusRate: 6,
    bonusFixedAmount: 0,
    bonusRandom: {
      min: 0,
      max: 0
    },
    maxWithdraw: 10000,
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    status: 'Active',
    targetType: 'Valid Bet',
    targetMultiplier: 1,
    recurring: 'Recurring',
    resetFrequency: 'Everyday',
    resetFrequencyDay: 'Monday',
    timeFrom: '00:00',
    timeTo: '23:59',
    includeRebate: true,
    requireApproval: false,
    levelIds: [3], // Only Gold level
    providerIds: [16, 17, 18], // Evolution Gaming, Pragmatic Play Live, Ezugi
    translations: {
      english: { title: '6%x1 Unlimited Reload Bonus', name: '6% Bonus with 1x Turnover for Unlimited Reload', description: '', images: [] },
      chinese: { title: '6%x1 无限充值奖金', name: '无限充值6%奖金（1倍流水）', description: '', images: [] },
      malay: { title: 'Bonus Reload Tanpa Had 6%x1', name: 'Bonus 6% dengan Pusing Ganti 1x untuk Reload Tanpa Had', description: '', images: [] }
    },
    memberApplied: 89,
    createdDate: '2024-01-01'
  }
];
