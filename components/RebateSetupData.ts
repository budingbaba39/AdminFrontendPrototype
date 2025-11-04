// Formula enum for provider eligibility
export type RebateSetupFormula =
  | 'MORE_THAN'
  | 'MORE_THAN_OR_EQUAL'
  | 'EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL';

// Per-provider rebate settings
export interface ProviderRebateSetting {
  minBetAmount: number;
  maxBetAmount: number;
}

// Rebate Amount Tier interface
export interface RebateAmountTier {
  validBetMoreThan: number; // The threshold amount
  rebatePercentage: number; // Rebate percentage
  rebateAmount: number; // Rebate fixed amount
  providerIds?: number[];  // Changed from providerId to providerIds array
  formula?: RebateSetupFormula | '';
}

export interface RebateSetup {
  id: string; // Format: REB001, REB002, etc.
  name: string;
  rebateType: 'Valid Bet';

  // NEW FIELDS for Info Tab
  targetMultiplier: number; // 1x, 2x, 3x
  claimableCreditLessThan: number;
  allowInterTransfer: boolean;
  status: 'Active' | 'Inactive';
  timeFrom: string; // Format: "00:00"
  timeTo: string; // Format: "23:59"

  // NEW FIELDS for Details Tab
  unlockRateWin: number; // Unlock Rate (%) <=
  unlockAmountLose: number; // Unlock Amount <=
  maxTotalPayoutAmount: number;
  maxWithdrawAmount: number;
  maxWithdrawPercentage: number;
  recurring: 'Immediate' | 'One Time' | 'Recurring';
  resetFrequency?: 'Everyday' | 'Every Week' | 'Every Month'; // only if recurring
  resetFrequencyDay?: number | string; // number for month (1-28), string for week day
  includeRebate: boolean;
  requireApproval: boolean;
  rebateCalculationType: 'Percentage' | 'Amount'; // Rebate calculation type

  // Amount Settings - Tiered configuration
  amountTiers: RebateAmountTier[];

  // NEW FIELD for Languages Tab
  translations?: {
    english: { name: string; description: string; images: string[] };
    chinese: { name: string; description: string; images: string[] };
    malay: { name: string; description: string; images: string[] };
  };

  // Eligibility (Eligibility tab)
  levelIds: number[];

  // NEW: Per-Provider Settings (Eligibility tab)
  providerSettings: {
    [providerId: number]: ProviderRebateSetting;
  };

  createdDate: string;
  createdBy: string;
}

// Sample rebate setup data
export const rebateSetupsData: RebateSetup[] = [
  {
    id: 'REB001',
    name: '1% Daily TurnOver Rebate',
    rebateType: 'Valid Bet',
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
    rebateCalculationType: 'Percentage',
    amountTiers: [
      { validBetMoreThan: 1, rebatePercentage: 1, rebateAmount: 0 }
    ],
    translations: {
      english: {
        name: '1% Daily TurnOver Rebate',
        description: '<p>Get <strong>1% cashback</strong> on your daily turnover!</p><p>Play more, earn more with our daily rebate program. Perfect for regular players who want to maximize their gaming experience.</p><ul><li>Minimum bet: $1</li><li>Daily calculation</li><li>Instant credit to your account</li></ul>',
        images: []
      },
      chinese: {
        name: '1% 每日投注回馈',
        description: '<p>获得您每日投注额的 <strong>1% 现金返还</strong>！</p><p>玩得越多，赚得越多。我们的每日返水计划非常适合想要最大化游戏体验的常规玩家。</p><ul><li>最低投注：$1</li><li>每日计算</li><li>即时存入您的账户</li></ul>',
        images: []
      },
      malay: {
        name: 'Rebat Pusing Ganti Harian 1%',
        description: '<p>Dapatkan <strong>pulangan tunai 1%</strong> untuk pusing ganti harian anda!</p><p>Main lebih banyak, dapat lebih banyak dengan program rebat harian kami. Sesuai untuk pemain tetap yang ingin memaksimumkan pengalaman permainan mereka.</p><ul><li>Pertaruhan minimum: $1</li><li>Pengiraan harian</li><li>Kredit segera ke akaun anda</li></ul>',
        images: []
      }
    },
    levelIds: [1], // Bronze
    providerSettings: {
      6: { // Pragmatic Play
        minBetAmount: 1,
        maxBetAmount: 1000
      },
      16: { // Evolution Gaming
        minBetAmount: 1,
        maxBetAmount: 500
      },
      31: { // PG Soft
        minBetAmount: 1,
        maxBetAmount: 1000
      }
    },
    createdDate: '2024-01-15',
    createdBy: 'ADMIN001'
  },
  {
    id: 'REB002',
    name: '3% Daily TurnOver Rebate',
    rebateType: 'Valid Bet',
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
    recurring: 'Recurring',
    resetFrequency: 'Every Week',
    resetFrequencyDay: 'Monday',
    includeRebate: false,
    requireApproval: false,
    rebateCalculationType: 'Amount',
    amountTiers: [
      { validBetMoreThan: 1, rebatePercentage: 0, rebateAmount: 300 }
    ],
    translations: {
      english: {
        name: '3% Daily TurnOver Rebate',
        description: '<p><strong>Triple your rewards</strong> with our premium rebate!</p><p>Designed for our valued Silver and Gold members who enjoy higher stakes and bigger rewards.</p><ul><li>Fixed $300 cashback on qualifying bets</li><li>Higher withdrawal limits</li><li>Priority processing</li><li>Daily automatic crediting</li></ul><p><em>Exclusive for Silver and Gold tier members</em></p>',
        images: []
      },
      chinese: {
        name: '3% 每日投注回馈',
        description: '<p>通过我们的高级返水<strong>三倍您的奖励</strong>！</p><p>专为我们尊贵的银卡和金卡会员设计，享受更高的赌注和更大的奖励。</p><ul><li>符合条件的投注固定返还 $300</li><li>更高的提款限额</li><li>优先处理</li><li>每日自动存入</li></ul><p><em>银卡和金卡会员专享</em></p>',
        images: []
      },
      malay: {
        name: 'Rebat Pusing Ganti Harian 3%',
        description: '<p><strong>Tiga kali ganda ganjaran anda</strong> dengan rebat premium kami!</p><p>Direka untuk ahli Silver dan Gold kami yang gemar pertaruhan lebih tinggi dan ganjaran lebih besar.</p><ul><li>Pulangan tunai tetap $300 untuk pertaruhan layak</li><li>Had pengeluaran lebih tinggi</li><li>Pemprosesan keutamaan</li><li>Kredit automatik harian</li></ul><p><em>Eksklusif untuk ahli peringkat Silver dan Gold</em></p>',
        images: []
      }
    },
    levelIds: [2, 3], // Silver and Gold
    providerSettings: {
      6: { // Pragmatic Play
        minBetAmount: 10,
        maxBetAmount: 2000
      },
      16: { // Evolution Gaming
        minBetAmount: 10,
        maxBetAmount: 1500
      },
      31: { // PG Soft
        minBetAmount: 5,
        maxBetAmount: 1800
      },
      32: { // NetEnt
        minBetAmount: 10,
        maxBetAmount: 2000
      },
      33: { // Microgaming
        minBetAmount: 15,
        maxBetAmount: 2500
      }
    },
    createdDate: '2024-01-20',
    createdBy: 'ADMIN001'
  },
  {
    id: 'REB003',
    name: '10% Daily TurnOver Rebate',
    rebateType: 'Valid Bet',
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
    resetFrequency: 'Every Month',
    resetFrequencyDay: 1,
    includeRebate: true,
    requireApproval: true,
    rebateCalculationType: 'Percentage',
    amountTiers: [
      { validBetMoreThan: 1, rebatePercentage: 10, rebateAmount: 0 }
    ],
    translations: {
      english: {
        name: '10% Daily TurnOver Rebate',
        description: '<p><strong>ULTIMATE VIP REBATE</strong> - Get an incredible 10% cashback!</p><p>Our most exclusive rebate program reserved for our prestigious Gold tier members only.</p><ul><li>Massive 10% cashback on all valid bets</li><li>Highest withdrawal limits available</li><li>VIP priority processing</li><li>Includes existing rebates</li><li>Manual approval for security</li></ul><p><em>🏆 Exclusive Gold Tier Member Benefit</em></p>',
        images: []
      },
      chinese: {
        name: '10% 每日投注回馈',
        description: '<p><strong>终极VIP返水</strong> - 获得令人难以置信的 10% 现金返还！</p><p>我们最独家的返水计划，仅保留给我们尊贵的金卡会员。</p><ul><li>所有有效投注可获得高达 10% 的现金返还</li><li>最高提款限额</li><li>VIP 优先处理</li><li>包含现有返水</li><li>人工审批以确保安全</li></ul><p><em>🏆 金卡会员专属福利</em></p>',
        images: []
      },
      malay: {
        name: 'Rebat Pusing Ganti Harian 10%',
        description: '<p><strong>REBAT VIP TERBAIK</strong> - Dapatkan pulangan tunai luar biasa 10%!</p><p>Program rebat paling eksklusif kami yang dikhaskan untuk ahli peringkat Gold yang berprestij sahaja.</p><ul><li>Pulangan tunai besar-besaran 10% untuk semua pertaruhan sah</li><li>Had pengeluaran tertinggi tersedia</li><li>Pemprosesan keutamaan VIP</li><li>Termasuk rebat sedia ada</li><li>Kelulusan manual untuk keselamatan</li></ul><p><em>🏆 Faedah Eksklusif Ahli Peringkat Gold</em></p>',
        images: []
      }
    },
    levelIds: [3], // Gold only
    providerSettings: {
      6: { // Pragmatic Play
        minBetAmount: 50,
        maxBetAmount: 10000
      },
      16: { // Evolution Gaming
        minBetAmount: 100,
        maxBetAmount: 15000
      },
      31: { // PG Soft
        minBetAmount: 30,
        maxBetAmount: 8000
      },
      32: { // NetEnt
        minBetAmount: 50,
        maxBetAmount: 12000
      },
      33: { // Microgaming
        minBetAmount: 50,
        maxBetAmount: 10000
      }
    },
    createdDate: '2024-02-01',
    createdBy: 'ADMIN001'
  }
];
