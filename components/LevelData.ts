export interface ProviderBetLimit {
  providerId: number;
  minBet: number;
  maxBet: number;
}

export interface ProviderRebateAssignment {
  providerId: number;
  rebateSetupIds: number[]; // Multiple rebates can be assigned
}

export interface ProviderCashbackAssignment {
  providerId: number;
  cashbackSetupIds: number[]; // Multiple cashbacks can be assigned
}

export interface Level {
  id: number;
  levelName: string;
  levelNameTranslations?: {
    english: string;
    chinese: string;
    malay: string;
  };
  maxWithdrawAmountPerTransaction: number; // DOUBLE
  maxWithdrawAmountPerDay: number; // DOUBLE
  maxWithdrawCountPerDay: number; // INT
  minWithdrawAmount: number;
  minDepositAmount: number;
  depositTurnoverRate: number; // FLOAT (multiplier)
  autoUpgradeAmount: number; // DOUBLE (threshold amount)
  remark?: string; // Optional
  status: 'Active' | 'Inactive';
  autoUpgrade: boolean; // yes/no
  autoDowngrade: boolean; // yes/no
  resetFrequencyType: 'Every Month' | 'Every Week';
  resetFrequencyValue: string; // If Month: "1"-"29", If Week: "Monday"-"Sunday"
  isDefault: boolean;
  image?: string; // File path, optional (100px x 100px)
  createdDate: string;
  providerBetLimits?: ProviderBetLimit[]; // Bet limits for providers
  providerRebateAssignments?: ProviderRebateAssignment[]; // Rebate assignments
  providerCashbackAssignments?: ProviderCashbackAssignment[]; // Cashback assignments
}

export const initialLevels: Level[] = [
  {
    id: 1,
    levelName: 'Bronze',
    levelNameTranslations: {
      english: 'Bronze',
      chinese: '青铜',
      malay: 'Gangsa'
    },
    maxWithdrawAmountPerTransaction: 500,
    maxWithdrawAmountPerDay: 1000,
    maxWithdrawCountPerDay: 3,
    minWithdrawAmount: 100,
    minDepositAmount: 10,
    depositTurnoverRate: 1,
    autoUpgradeAmount: 1000,
    remark: 'Entry level for new players',
    status: 'Active',
    autoUpgrade: true,
    autoDowngrade: true,
    resetFrequencyType: 'Every Week',
    resetFrequencyValue: 'Monday',
    isDefault: true,
    createdDate: '2023-08-15',
    providerBetLimits: [
      { providerId: 6, minBet: 1, maxBet: 500 }, // Pragmatic Play
      { providerId: 16, minBet: 5, maxBet: 1000 }, // Evolution Gaming
      { providerId: 31, minBet: 2, maxBet: 300 } // Betradar
    ],
    providerRebateAssignments: [
      { providerId: 6, rebateSetupIds: [1] }, 
      { providerId: 16, rebateSetupIds: [1] } 
    ],
    providerCashbackAssignments: [
      { providerId: 6, cashbackSetupIds: [1] }, 
      { providerId: 31, cashbackSetupIds: [1] } 
    ]
  },
  {
    id: 2,
    levelName: 'Silver',
    levelNameTranslations: {
      english: 'Silver',
      chinese: '白银',
      malay: 'Perak'
    },
    maxWithdrawAmountPerTransaction: 2000,
    maxWithdrawAmountPerDay: 5000,
    maxWithdrawCountPerDay: 5,
    minWithdrawAmount: 1000,
    minDepositAmount: 100,
    depositTurnoverRate: 1,
    autoUpgradeAmount: 5000,
    remark: 'Intermediate level with higher limits',
    status: 'Active',
    autoUpgrade: true,
    autoDowngrade: true,
    resetFrequencyType: 'Every Month',
    resetFrequencyValue: '1',
    isDefault: true,
    createdDate: '2023-08-15',
    providerBetLimits: [
      { providerId: 7, minBet: 2, maxBet: 1500 }, // Play'n GO
      { providerId: 17, minBet: 10, maxBet: 2000 }, // Playtech
      { providerId: 32, minBet: 5, maxBet: 800 } // SBTech
    ],
    providerRebateAssignments: [
      { providerId: 7, rebateSetupIds: [2] }, 
      { providerId: 17, rebateSetupIds: [1] }, 
      { providerId: 32, rebateSetupIds: [3] } 
    ],
    providerCashbackAssignments: [
      { providerId: 7, cashbackSetupIds: [2] },
      { providerId: 17, cashbackSetupIds: [2] } 
    ]
  },
  {
    id: 3,
    levelName: 'Gold',
    levelNameTranslations: {
      english: 'Gold',
      chinese: '黄金',
      malay: 'Emas'
    },
    maxWithdrawAmountPerTransaction: 10000,
    maxWithdrawAmountPerDay: 25000,
    maxWithdrawCountPerDay: 10,
    minWithdrawAmount: 10000,
    minDepositAmount: 1000,
    depositTurnoverRate: 1,
    autoUpgradeAmount: 25000,
    remark: 'Premium level with maximum privileges',
    status: 'Active',
    autoUpgrade: true,
    autoDowngrade: true,
    resetFrequencyType: 'Every Week',
    resetFrequencyValue: 'Friday',
    isDefault: true,
    createdDate: '2023-08-15',
    providerBetLimits: [
      { providerId: 8, minBet: 5, maxBet: 5000 }, // NetEnt
      { providerId: 18, minBet: 20, maxBet: 10000 }, // Microgaming
      { providerId: 33, minBet: 10, maxBet: 3000 } // BetConstruct
    ],
    providerRebateAssignments: [
      { providerId: 8, rebateSetupIds: [3] }, 
      { providerId: 18, rebateSetupIds: [ 3] }, 
      { providerId: 33, rebateSetupIds: [3] } 
    ],
    providerCashbackAssignments: [
      { providerId: 8, cashbackSetupIds: [3] }, 
      { providerId: 18, cashbackSetupIds: [3] }, 
      { providerId: 33, cashbackSetupIds: [3] } 
    ]
  }
];

// Level colors for badge display
export const levelColors: Record<string, { badgeColor: string; fontColor: string }> = {
  Bronze: { badgeColor: '#f4a261', fontColor: '#8a5522' },
  Silver: { badgeColor: '#d9d9d9', fontColor: '#4a4a4a' },
  Gold: { badgeColor: '#f1c40f', fontColor: '#7f6000' },
};
