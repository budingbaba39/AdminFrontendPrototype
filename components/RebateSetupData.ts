export interface RebateAmountTier {
  validBetMoreThan: number;
  rebatePercentage: number;
}

export interface RebateSetup {
  id: number;
  name: string;
  rebateType: 'Valid Bet';
  minLimit: number;
  maxLimit: number;
  amountTiers: RebateAmountTier[];
  createdDate: string;
}

export const rebateSetupsData: RebateSetup[] = [
  {
    id: 1,
    name: '1% Daily TurnOver Rebate',
    rebateType: 'Valid Bet',
    minLimit: 1,
    maxLimit: 99999,
    amountTiers: [
      { validBetMoreThan: 1, rebatePercentage: 1 },
    ],
    createdDate: '2024-01-15'
  },
  {
    id: 2,
    name: '3% Daily TurnOver Rebate',
    rebateType: 'Valid Bet',
    minLimit: 1,
    maxLimit: 99999,
    amountTiers: [
      { validBetMoreThan: 1, rebatePercentage: 3 },
    ],
    createdDate: '2024-01-20'
  },
  {
    id: 3,
    name: '10% Daily TurnOver Rebate',
    rebateType: 'Valid Bet',
    minLimit: 1,
    maxLimit: 99999,
    amountTiers: [
      { validBetMoreThan: 1, rebatePercentage: 10 },
    ],
    createdDate: '2024-02-01'
  }
];
