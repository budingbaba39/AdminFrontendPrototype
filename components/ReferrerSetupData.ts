export interface ReferrerSetup {
  id: string;
  name: string;

  // Basic Info
  allowInterTransfer: boolean;

  // Bonus Info
  unlockRateWin: number;
  unlockAmountLose: number;
  minDeposit: number;
  maxTotalPayoutAmount: number;
  bonusRate: number;
  bonusFixedAmount: number;
  bonusRandom: {
    min: number;
    max: number;
  };
  maxWithdrawAmount: number;
  maxWithdrawPercentage: number;
  claimableCreditLessThan: number;

  // Details Info
  validFrom: string;
  validTo: string;
  status: 'Active' | 'Inactive';
  targetType: 'By Deposit' | 'By Register';
  targetMultiplier: number;
  recurring: 'One Time';
  timeFrom: string;
  timeTo: string;
  includeRebate: boolean;
  requireApproval: boolean;

  // Referrer specific
  autoApprovedAmount: number;
  levelIds: number[];

  // Languages
  translations?: {
    english: { name: string; description: string; images: string[] };
    chinese: { name: string; description: string; images: string[] };
    malay: { name: string; description: string; images: string[] };
  };

  createdDate: string;
  createdBy: string;
}

export const initialReferrerSetups: ReferrerSetup[] = [
  {
    id: 'REF001',
    name: 'Bronze Referral Program',
    allowInterTransfer: false,
    unlockRateWin: 60,
    unlockAmountLose: 200,
    minDeposit: 100,
    maxTotalPayoutAmount: 1000,
    bonusRate: 15,
    bonusFixedAmount: 0,
    bonusRandom: { min: 0, max: 0 },
    maxWithdrawAmount: 5000,
    maxWithdrawPercentage: 0,
    claimableCreditLessThan: 10000,
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    status: 'Active',
    targetType: 'By Deposit',
    targetMultiplier: 2,
    recurring: 'One Time',
    timeFrom: '00:00',
    timeTo: '23:59',
    includeRebate: false,
    requireApproval: true,
    autoApprovedAmount: 1000,
    levelIds: [1], // Bronze
    translations: {
      english: { name: 'Refer a Friend and Earn Bonus', description: 'Get rewards when your friends deposit!', images: [] },
      chinese: { name: '推荐朋友并获得奖金', description: '当您的朋友存款时获得奖励！', images: [] },
      malay: { name: 'Rujuk Rakan dan Dapatkan Bonus', description: 'Dapatkan ganjaran apabila rakan anda membuat deposit!', images: [] }
    },
    createdDate: '2024-01-15',
    createdBy: 'Admin'
  },
  {
    id: 'REF002',
    name: 'Silver Registration Bonus',
    allowInterTransfer: false,
    unlockRateWin: 70,
    unlockAmountLose: 300,
    minDeposit: 200,
    maxTotalPayoutAmount: 500,
    bonusRate: 25,
    bonusFixedAmount: 0,
    bonusRandom: { min: 0, max: 0 },
    maxWithdrawAmount: 8000,
    maxWithdrawPercentage: 0,
    claimableCreditLessThan: 20000,
    validFrom: '2024-02-01',
    validTo: '2025-12-31',
    status: 'Active',
    targetType: 'By Register',
    targetMultiplier: 1.5,
    recurring: 'One Time',
    timeFrom: '00:00',
    timeTo: '23:59',
    includeRebate: false,
    requireApproval: true,
    autoApprovedAmount: 500,
    levelIds: [2], // Silver
    translations: {
      english: { name: 'VIP Members Get $150 per Referral', description: 'Premium rewards for VIP referrals!', images: [] },
      chinese: { name: 'VIP会员每推荐获得$150', description: 'VIP推荐的优质奖励！', images: [] },
      malay: { name: 'Ahli VIP Dapat $150 setiap Rujukan', description: 'Ganjaran premium untuk rujukan VIP!', images: [] }
    },
    createdDate: '2024-02-10',
    createdBy: 'Admin'
  },
  {
    id: 'REF003',
    name: 'Gold VIP Referral',
    allowInterTransfer: false,
    unlockRateWin: 50,
    unlockAmountLose: 150,
    minDeposit: 50,
    maxTotalPayoutAmount: 500,
    bonusRate: 10,
    bonusFixedAmount: 0,
    bonusRandom: { min: 0, max: 0 },
    maxWithdrawAmount: 3000,
    maxWithdrawPercentage: 0,
    claimableCreditLessThan: 8000,
    validFrom: '2024-03-01',
    validTo: '2025-06-30',
    status: 'Inactive',
    targetType: 'By Deposit',
    targetMultiplier: 2,
    recurring: 'One Time',
    timeFrom: '00:00',
    timeTo: '23:59',
    includeRebate: true,
    requireApproval: false,
    autoApprovedAmount: 2000,
    levelIds: [3], // Gold
    translations: {
      english: { name: 'Win Random Bonus $25-$200 for Each Referral', description: 'Lucky referral rewards!', images: [] },
      chinese: { name: '每次推荐赢取$25-$200随机奖金', description: '幸运推荐奖励！', images: [] },
      malay: { name: 'Menang Bonus Rawak $25-$200 untuk Setiap Rujukan', description: 'Ganjaran rujukan bertuah!', images: [] }
    },
    createdDate: '2024-03-05',
    createdBy: 'SuperAdmin'
  }
];
