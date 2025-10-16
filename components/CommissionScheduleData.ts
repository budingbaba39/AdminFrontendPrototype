export interface CommissionSchedule {
  id: number;
  type: 'Recurring'; // Always Recurring (like CashBackSchedule)
  commissionTargetType: 'Deposit - Withdraw' | 'Deposit - Withdraw - Rebate - Bonus' | 'Valid Bet';
  status: 'Active' | 'Inactive';
  autoApprovedAmount: number; // Amount <= this gets auto-approved
  maxWithdrawalAmount: number; // Maximum commission withdrawal limit
  resetFrequency?: 'Everyday' | 'Every Week' | 'Every Month';
  resetFrequencyDay?: number | string; // Day of week or month
  createdDate: string;
}

// Sample commission schedule data
export const sampleCommissionSchedules: CommissionSchedule[] = [
  {
    id: 1,
    type: 'Recurring',
    commissionTargetType: 'Deposit - Withdraw',
    status: 'Active',
    autoApprovedAmount: 500,
    maxWithdrawalAmount: 2000,
    resetFrequency: 'Every Week',
    resetFrequencyDay: 'Monday',
    createdDate: '2025-01-15 10:00'
  },
  {
    id: 2,
    type: 'Recurring',
    commissionTargetType: 'Deposit - Withdraw - Rebate - Bonus',
    status: 'Active',
    autoApprovedAmount: 750,
    maxWithdrawalAmount: 3000,
    resetFrequency: 'Every Month',
    resetFrequencyDay: 1,
    createdDate: '2025-02-10 14:30'
  },
  {
    id: 3,
    type: 'Recurring',
    commissionTargetType: 'Valid Bet',
    status: 'Active',
    autoApprovedAmount: 1000,
    maxWithdrawalAmount: 5000,
    resetFrequency: 'Everyday',
    resetFrequencyDay: undefined,
    createdDate: '2025-03-05 09:15'
  }
];
