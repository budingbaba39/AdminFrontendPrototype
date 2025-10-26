// Commission Amount Tier interface
export interface CommissionAmountTier {
  threshold: number; // The "More Than" amount
  amount: number; // Fixed amount (if used)
  percentage: number; // Percentage value (if used)
}

export interface CommissionSetup {
  id: string; // Format: COMM001, COMM002, etc.
  name: string;
  targetType: 'Deposit - Withdraw' | 'Deposit - Withdraw - Rebate - Bonus' | 'Valid Bet';
  targetMultiplier: number; // 1x, 2x, 3x
  claimableCreditLessThan: number; // Maximum claimable credit to be eligible

  // NEW FIELDS for Info Tab
  allowInterTransfer: boolean;
  status: 'Active' | 'Inactive';

  // Commission Type - determines what type of commission to use in Amount Settings
  commissionType: 'Percentage' | 'Amount';

  // NEW FIELDS for Details Tab
  unlockRateWin: number; // Unlock Rate (%) <=
  unlockAmountLose: number; // Unlock Amount <=
  maxPayoutPerDownline: number;
  maxPayoutAmount: number;
  maxWithdrawAmount: number;
  maxWithdrawPercentage: number;

  // Amount Settings - Tiered configuration
  amountTiers: CommissionAmountTier[];

  // NEW FIELD for Languages Tab
  translations?: {
    english: { name: string; description: string; images: string[] };
    chinese: { name: string; description: string; images: string[] };
    malay: { name: string; description: string; images: string[] };
  };

  // Eligibility (move to Eligibility tab)
  levelIds: number[];
  providerIds?: number[]; // ONLY for 'Valid Bet'

  createdDate: string;
  createdBy: string;
}

// Sample commission setup data
export const sampleCommissionSetups: CommissionSetup[] = [
  {
    id: 'COMM001',
    name: 'Deposit-Withdraw Commission',
    targetType: 'Deposit - Withdraw',
    targetMultiplier: 2,
    claimableCreditLessThan: 10000,
    allowInterTransfer: false,
    status: 'Active',
    commissionType: 'Percentage',
    unlockRateWin: 50,
    unlockAmountLose: 1000,
    maxPayoutPerDownline: 5000,
    maxPayoutAmount: 10000,
    maxWithdrawAmount: 3000,
    maxWithdrawPercentage: 80,
    amountTiers: [
      { threshold: 1000, amount: 0, percentage: 5 },
      { threshold: 5000, amount: 0, percentage: 8 },
      { threshold: 10000, amount: 0, percentage: 10 }
    ],
    translations: {
      english: {
        name: 'Deposit-Withdraw Commission',
        description: '<p>Earn <strong>commission on deposit-withdraw activity</strong>!</p><p>Perfect for Bronze members to earn from their downline deposit and withdrawal transactions.</p><ul><li>5-10% commission based on activity</li><li>2x turnover requirement</li><li>Up to $10,000 max payout</li></ul>',
        images: []
      },
      chinese: {
        name: '存提款佣金',
        description: '<p>从存提款活动中赚取<strong>佣金</strong>！</p><p>非常适合铜级会员从其下线的存款和取款交易中赚取收入。</p><ul><li>根据活动 5-10% 佣金</li><li>2倍流水要求</li><li>最高支付 $10,000</li></ul>',
        images: []
      },
      malay: {
        name: 'Komisen Deposit-Withdraw',
        description: '<p>Dapatkan <strong>komisen daripada aktiviti deposit-pengeluaran</strong>!</p><p>Sesuai untuk ahli Gangsa mendapat pendapatan daripada transaksi deposit dan pengeluaran downline mereka.</p><ul><li>Komisen 5-10% berdasarkan aktiviti</li><li>Keperluan pusing ganti 2x</li><li>Sehingga $10,000 bayaran maksimum</li></ul>',
        images: []
      }
    },
    levelIds: [1], // Bronze
    createdDate: '2025-01-15 10:00',
    createdBy: 'ADMIN001'
  },
  {
    id: 'COMM002',
    name: 'Full Activity Commission',
    targetType: 'Deposit - Withdraw - Rebate - Bonus',
    targetMultiplier: 1,
    claimableCreditLessThan: 5000,
    allowInterTransfer: true,
    status: 'Active',
    commissionType: 'Percentage',
    unlockRateWin: 60,
    unlockAmountLose: 1500,
    maxPayoutPerDownline: 8000,
    maxPayoutAmount: 15000,
    maxWithdrawAmount: 5000,
    maxWithdrawPercentage: 85,
    amountTiers: [
      { threshold: 2000, amount: 0, percentage: 8 },
      { threshold: 8000, amount: 0, percentage: 12 },
      { threshold: 15000, amount: 0, percentage: 15 }
    ],
    translations: {
      english: {
        name: 'Full Activity Commission',
        description: '<p><strong>Comprehensive commission</strong> on all downline activities!</p><p>Designed for Silver and Gold members to maximize earnings from deposits, withdrawals, rebates, and bonuses.</p><ul><li>8-15% commission on full activity</li><li>1x turnover requirement</li><li>Up to $15,000 max payout</li><li>Inter-transfer allowed</li></ul>',
        images: []
      },
      chinese: {
        name: '全活动佣金',
        description: '<p>从所有下线活动中获得<strong>全面佣金</strong>！</p><p>专为银卡和金卡会员设计，从存款、取款、返水和奖金中最大化收益。</p><ul><li>全活动 8-15% 佣金</li><li>1倍流水要求</li><li>最高支付 $15,000</li><li>允许内部转账</li></ul>',
        images: []
      },
      malay: {
        name: 'Komisen Aktiviti Penuh',
        description: '<p><strong>Komisen menyeluruh</strong> untuk semua aktiviti downline!</p><p>Direka untuk ahli Silver dan Gold memaksimumkan pendapatan daripada deposit, pengeluaran, rebat, dan bonus.</p><ul><li>Komisen 8-15% untuk aktiviti penuh</li><li>Keperluan pusing ganti 1x</li><li>Sehingga $15,000 bayaran maksimum</li><li>Pemindahan antara dibenarkan</li></ul>',
        images: []
      }
    },
    levelIds: [2, 3], // Silver and Gold
    createdDate: '2025-02-10 14:30',
    createdBy: 'ADMIN001'
  },
  {
    id: 'COMM003',
    name: 'Valid Bet Commission',
    targetType: 'Valid Bet',
    targetMultiplier: 3,
    claimableCreditLessThan: 15000,
    allowInterTransfer: false,
    status: 'Active',
    commissionType: 'Amount',
    unlockRateWin: 70,
    unlockAmountLose: 2000,
    maxPayoutPerDownline: 10000,
    maxPayoutAmount: 20000,
    maxWithdrawAmount: 8000,
    maxWithdrawPercentage: 90,
    amountTiers: [
      { threshold: 3000, amount: 1000, percentage: 0 },
      { threshold: 10000, amount: 2000, percentage: 0 },
      { threshold: 20000, amount: 3000, percentage: 0 }
    ],
    translations: {
      english: {
        name: 'Valid Bet Commission',
        description: '<p><strong>PREMIUM VIP COMMISSION</strong> - Fixed rewards on valid bets!</p><p>Our most exclusive commission program for all tier members based on valid betting activity.</p><ul><li>Fixed amount $1,000-$3,000 based on betting volume</li><li>3x turnover requirement</li><li>Up to $20,000 max payout</li><li>Multiple provider support</li></ul><p><em>🏆 High-roller Commission Benefit</em></p>',
        images: []
      },
      chinese: {
        name: '有效投注佣金',
        description: '<p><strong>高级VIP佣金</strong> - 有效投注的固定奖励！</p><p>我们最独家的佣金计划，适用于所有级别会员，基于有效投注活动。</p><ul><li>根据投注量固定金额 $1,000-$3,000</li><li>3倍流水要求</li><li>最高支付 $20,000</li><li>多供应商支持</li></ul><p><em>🏆 豪客佣金福利</em></p>',
        images: []
      },
      malay: {
        name: 'Komisen Pertaruhan Sah',
        description: '<p><strong>KOMISEN VIP PREMIUM</strong> - Ganjaran tetap untuk pertaruhan sah!</p><p>Program komisen paling eksklusif kami untuk semua ahli peringkat berdasarkan aktiviti pertaruhan sah.</p><ul><li>Jumlah tetap $1,000-$3,000 berdasarkan volum pertaruhan</li><li>Keperluan pusing ganti 3x</li><li>Sehingga $20,000 bayaran maksimum</li><li>Sokongan berbilang pembekal</li></ul><p><em>🏆 Faedah Komisen High-roller</em></p>',
        images: []
      }
    },
    levelIds: [],
    providerIds: [6, 16, 31, 32, 33], // Pragmatic Play, Evolution Gaming, PG Soft, Spadegaming, Habanero
    createdDate: '2025-03-05 09:15',
    createdBy: 'ADMIN001'
  }
];
