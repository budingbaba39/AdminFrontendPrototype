export interface CashBackAmountTier {
  amountMoreThanOrEqual: number;
  cashbackPercentage: number;
}

export interface CashBackSetup {
  id: number;
  name: string;
  cashbackType: 'By Net Lose Only' | 'By Net Deposit' | 'By Total WinLose Only';
  minLimit: number;
  maxLimit: number;
  amountTiers: CashBackAmountTier[];
  createdDate: string;
}

export const cashBackSetupsData: CashBackSetup[] = [
  {
    id: 1,
    name: 'Bronze CashBack',
    cashbackType: 'By Net Lose Only',
    minLimit: 1,
    maxLimit: 99999,
    amountTiers: [
      { amountMoreThanOrEqual: 100, cashbackPercentage: 5 },
      { amountMoreThanOrEqual: 500, cashbackPercentage: 8 },
      { amountMoreThanOrEqual: 1000, cashbackPercentage: 10 }
    ],
    createdDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Silver CashBack',
    cashbackType: 'By Net Deposit',
    minLimit: 1,
    maxLimit: 99999,
    amountTiers: [
      { amountMoreThanOrEqual: 100, cashbackPercentage: 8 },
      { amountMoreThanOrEqual: 1000, cashbackPercentage: 10 },
      { amountMoreThanOrEqual: 3000, cashbackPercentage: 12 },
      { amountMoreThanOrEqual: 5000, cashbackPercentage: 13 }
    ],
    createdDate: '2024-01-20'
  },
  {
    id: 3,
    name: 'Gold CashBack',
    cashbackType: 'By Total WinLose Only',
    minLimit: 1,
    maxLimit: 99999,
    amountTiers: [
      { amountMoreThanOrEqual: 500, cashbackPercentage: 10 },
      { amountMoreThanOrEqual: 1000, cashbackPercentage: 13 },
      { amountMoreThanOrEqual: 3000, cashbackPercentage: 15 },
    ],
    createdDate: '2024-02-01'
  }
];
