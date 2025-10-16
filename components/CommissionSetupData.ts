export interface CommissionSetup {
  id: string; // Format: COMM001, COMM002, etc.
  name: string;
  targetType: 'Deposit - Withdraw' | 'Deposit - Withdraw - Rebate - Bonus' | 'Valid Bet';
  commissionPercentage: number; // e.g., 5.5 for 5.5%
  targetMultiplier: number; // 1x, 2x, 3x
  creditLessThan: number; // Maximum credit to be eligible

  // Eligibility (ONLY when targetType === 'Valid Bet')
  levelIds?: number[]; // Array of level IDs
  providerIds?: number[]; // Array of provider IDs

  status: 'Active' | 'Inactive';
  createdDate: string;
  createdBy: string;
}

// Sample commission setup data
export const sampleCommissionSetups: CommissionSetup[] = [
  {
    id: 'COMM001',
    name: 'Deposit-Withdraw Commission',
    targetType: 'Deposit - Withdraw',
    commissionPercentage: 10,
    targetMultiplier: 2,
    creditLessThan: 10000,
    status: 'Active',
    createdDate: '2025-01-15 10:00',
    createdBy: 'ADMIN001'
  },
  {
    id: 'COMM002',
    name: 'Full Activity Commission',
    targetType: 'Deposit - Withdraw - Rebate - Bonus',
    commissionPercentage: 15,
    targetMultiplier: 1,
    creditLessThan: 5000,
    status: 'Active',
    createdDate: '2025-02-10 14:30',
    createdBy: 'ADMIN001'
  },
  {
    id: 'COMM003',
    name: 'Valid Bet Commission',
    targetType: 'Valid Bet',
    commissionPercentage: 20,
    targetMultiplier: 3,
    creditLessThan: 15000,
    // Eligibility for Valid Bet
    levelIds: [1, 2, 3], // Bronze, Silver, Gold
    providerIds: [6, 16, 31, 32, 33], // Pragmatic Play, Evolution Gaming, PG Soft, Spadegaming, Habanero
    status: 'Active',
    createdDate: '2025-03-05 09:15',
    createdBy: 'ADMIN001'
  }
];
