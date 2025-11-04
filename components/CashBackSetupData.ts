// Formula enum for provider eligibility
export type CashBackSetupFormula =
  | 'MORE_THAN'
  | 'MORE_THAN_OR_EQUAL'
  | 'EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL';

// Per-provider cashback settings
export interface ProviderCashBackSetting {
  minBetAmount: number;
  maxBetAmount: number;
}

export interface CashBackAmountTier {
  amountMoreThanOrEqual: number;
  cashbackPercentage: number;
  cashbackAmount: number;
  providerIds?: number[];  // Changed from providerId to providerIds array
  formula?: CashBackSetupFormula | '';
}

export interface CashBackSetup {
  id: string; // Format: CASH001, CASH002, etc.
  name: string;
  cashbackType: 'By Net Lose Only' | 'By Net Deposit' | 'By Total WinLose Only';

  // Info Tab fields
  targetMultiplier: number;
  claimableCreditLessThan: number;
  allowInterTransfer: boolean;
  status: 'Active' | 'Inactive';
  timeFrom: string;
  timeTo: string;

  // Details Tab fields
  unlockRateWin: number;
  unlockAmountLose: number;
  maxTotalPayoutAmount: number;
  maxWithdrawAmount: number;
  maxWithdrawPercentage: number;
  recurring: 'Immediate' | 'One Time' | 'Recurring';
  resetFrequency?: 'Everyday' | 'Every Week' | 'Every Month'; // only if recurring
  resetFrequencyDay?: number | string; // number for month (1-28), string for week day
  includeRebate: boolean;
  requireApproval: boolean;
  cashbackCalculationType: 'Percentage' | 'Amount';

  // Amount Tiers
  amountTiers: CashBackAmountTier[];

  // Languages Tab
  translations?: {
    english: { name: string; description: string; images: string[] };
    chinese: { name: string; description: string; images: string[] };
    malay: { name: string; description: string; images: string[] };
  };

  // Eligibility Tab
  levelIds: number[];
  providerSettings: {
    [providerId: number]: ProviderCashBackSetting;
  };

  createdDate: string;
  createdBy: string;
}

export const cashBackSetupsData: CashBackSetup[] = [
  {
    id: 'CASH001',
    name: 'Bronze CashBack',
    cashbackType: 'By Net Lose Only',
    targetMultiplier: 1,
    claimableCreditLessThan: 5000,
    allowInterTransfer: false,
    status: 'Active',
    timeFrom: '00:00',
    timeTo: '23:59',
    unlockRateWin: 50,
    unlockAmountLose: 500,
    maxTotalPayoutAmount: 10000,
    maxWithdrawAmount: 3000,
    maxWithdrawPercentage: 80,
    recurring: 'Recurring',
    resetFrequency: 'Everyday',
    includeRebate: false,
    requireApproval: false,
    cashbackCalculationType: 'Percentage',
    amountTiers: [
      { amountMoreThanOrEqual: 100, cashbackPercentage: 5, cashbackAmount: 0 },
      { amountMoreThanOrEqual: 500, cashbackPercentage: 8, cashbackAmount: 0 },
      { amountMoreThanOrEqual: 1000, cashbackPercentage: 10, cashbackAmount: 0 }
    ],
    translations: {
      english: {
        name: 'Bronze CashBack',
        description: '<p>Get <strong>cashback on your losses</strong>!</p><p>Perfect for Bronze members to recover from losses.</p><ul><li>5-10% cashback based on loss amount</li><li>Daily calculation</li><li>Instant credit</li></ul>',
        images: []
      },
      chinese: {
        name: '铜级返现',
        description: '<p>从损失中获得<strong>现金返还</strong>！</p><p>非常适合铜级会员从损失中恢复。</p><ul><li>根据损失金额返还 5-10%</li><li>每日计算</li><li>即时存入</li></ul>',
        images: []
      },
      malay: {
        name: 'CashBack Gangsa',
        description: '<p>Dapatkan <strong>pulangan tunai atas kerugian anda</strong>!</p><p>Sesuai untuk ahli Gangsa pulih daripada kerugian.</p><ul><li>Pulangan tunai 5-10% berdasarkan jumlah kerugian</li><li>Pengiraan harian</li><li>Kredit segera</li></ul>',
        images: []
      }
    },
    levelIds: [1],
    providerSettings: {
      6: {
        minBetAmount: 1,
        maxBetAmount: 1000
      },
      16: {
        minBetAmount: 1,
        maxBetAmount: 500
      }
    },
    createdDate: '2024-01-15',
    createdBy: 'ADMIN001'
  },
  {
    id: 'CASH002',
    name: 'Silver CashBack',
    cashbackType: 'By Net Deposit',
    targetMultiplier: 1,
    claimableCreditLessThan: 10000,
    allowInterTransfer: true,
    status: 'Active',
    timeFrom: '00:00',
    timeTo: '23:59',
    unlockRateWin: 60,
    unlockAmountLose: 1000,
    maxTotalPayoutAmount: 15000,
    maxWithdrawAmount: 5000,
    maxWithdrawPercentage: 85,
    recurring: 'One Time',
    includeRebate: false,
    requireApproval: false,
    cashbackCalculationType: 'Amount',
    amountTiers: [
      { amountMoreThanOrEqual: 100, cashbackPercentage: 0, cashbackAmount: 50 },
      { amountMoreThanOrEqual: 1000, cashbackPercentage: 0, cashbackAmount: 150 },
      { amountMoreThanOrEqual: 3000, cashbackPercentage: 0, cashbackAmount: 400 },
      { amountMoreThanOrEqual: 5000, cashbackPercentage: 0, cashbackAmount: 700 }
    ],
    translations: {
      english: {
        name: 'Silver CashBack',
        description: '<p><strong>Fixed cashback</strong> based on your net deposits!</p><p>Designed for Silver members with consistent deposit activity.</p><ul><li>Fixed amount cashback $50-$700</li><li>Based on positive deposit balance</li><li>Priority processing</li></ul>',
        images: []
      },
      chinese: {
        name: '银级返现',
        description: '<p>基于您的净存款的<strong>固定返现</strong>！</p><p>专为有持续存款活动的银卡会员设计。</p><ul><li>固定金额返现 $50-$700</li><li>基于正存款余额</li><li>优先处理</li></ul>',
        images: []
      },
      malay: {
        name: 'CashBack Perak',
        description: '<p><strong>Pulangan tunai tetap</strong> berdasarkan deposit bersih anda!</p><p>Direka untuk ahli Perak dengan aktiviti deposit konsisten.</p><ul><li>Pulangan tunai jumlah tetap $50-$700</li><li>Berdasarkan baki deposit positif</li><li>Pemprosesan keutamaan</li></ul>',
        images: []
      }
    },
    levelIds: [2, 3],
    providerSettings: {
      6: {
        minBetAmount: 10,
        maxBetAmount: 2000
      },
      16: {
        minBetAmount: 10,
        maxBetAmount: 3000
      },
      31: {
        minBetAmount: 5,
        maxBetAmount: 1500
      }
    },
    createdDate: '2024-01-20',
    createdBy: 'ADMIN001'
  },
  {
    id: 'CASH003',
    name: 'Gold CashBack',
    cashbackType: 'By Total WinLose Only',
    targetMultiplier: 1,
    claimableCreditLessThan: 20000,
    allowInterTransfer: true,
    status: 'Active',
    timeFrom: '00:00',
    timeTo: '23:59',
    unlockRateWin: 70,
    unlockAmountLose: 2000,
    maxTotalPayoutAmount: 20000,
    maxWithdrawAmount: 8000,
    maxWithdrawPercentage: 90,
    recurring: 'Recurring',
    resetFrequency: 'Every Week',
    resetFrequencyDay: 'Sunday',
    includeRebate: true,
    requireApproval: true,
    cashbackCalculationType: 'Percentage',
    amountTiers: [
      { amountMoreThanOrEqual: 500, cashbackPercentage: 10, cashbackAmount: 0 },
      { amountMoreThanOrEqual: 1000, cashbackPercentage: 13, cashbackAmount: 0 },
      { amountMoreThanOrEqual: 3000, cashbackPercentage: 15, cashbackAmount: 0 },
    ],
    translations: {
      english: {
        name: 'Gold CashBack',
        description: '<p><strong>ULTIMATE VIP CASHBACK</strong> - Up to 15% on total activity!</p><p>Our most exclusive cashback program for prestigious Gold members.</p><ul><li>10-15% cashback on total win/loss</li><li>Highest limits</li><li>VIP priority</li><li>Manual approval for security</li></ul><p><em>🏆 Exclusive Gold Member Benefit</em></p>',
        images: []
      },
      chinese: {
        name: '金级返现',
        description: '<p><strong>终极VIP返现</strong> - 总活动高达 15%！</p><p>我们最独家的返现计划，专为尊贵的金卡会员提供。</p><ul><li>总输赢 10-15% 返现</li><li>最高限额</li><li>VIP 优先</li><li>人工审批以确保安全</li></ul><p><em>🏆 金卡会员专属福利</em></p>',
        images: []
      },
      malay: {
        name: 'CashBack Emas',
        description: '<p><strong>CASHBACK VIP TERBAIK</strong> - Sehingga 15% pada jumlah aktiviti!</p><p>Program cashback paling eksklusif kami untuk ahli Emas yang berprestij.</p><ul><li>Cashback 10-15% pada jumlah menang/kalah</li><li>Had tertinggi</li><li>Keutamaan VIP</li><li>Kelulusan manual untuk keselamatan</li></ul><p><em>🏆 Faedah Eksklusif Ahli Emas</em></p>',
        images: []
      }
    },
    levelIds: [3],
    providerSettings: {
      6: {
        minBetAmount: 50,
        maxBetAmount: 10000
      },
      16: {
        minBetAmount: 50,
        maxBetAmount: 8000
      },
      31: {
        minBetAmount: 20,
        maxBetAmount: 5000
      },
      32: {
        minBetAmount: 100,
        maxBetAmount: 15000
      }
    },
    createdDate: '2024-02-01',
    createdBy: 'ADMIN001'
  }
];
