export interface CashBackSchedule {
  id: number;
  setupName: string;
  type: 'Recurring';
  cashbackType: 'By Net Lose Only' | 'By Net Deposit' | 'By Total WinLose Only';
  status: 'Active' | 'Inactive';
  autoApprovedAmount: number;
  resetFrequency?: 'Everyday' | 'Every Week' | 'Every Month';
  resetFrequencyDay?: string | number;
  createdDate: string;
}

export const sampleCashBackSchedules: CashBackSchedule[] = [
  {
    id: 1,
    setupName: 'Bronze CashBack',
    type: 'Recurring',
    cashbackType: 'By Net Lose Only',
    status: 'Active',
    autoApprovedAmount: 300,
    resetFrequency: 'Everyday',
    createdDate: '2024-01-15'
  },
  {
    id: 2,
    setupName: 'Silver CashBack',
    type: 'Recurring',
    cashbackType: 'By Net Deposit',
    status: 'Active',
    autoApprovedAmount: 300,
    resetFrequency: 'Every Week',
    resetFrequencyDay: 'Monday',
    createdDate: '2024-01-20'
  },
  {
    id: 3,
    setupName: 'Gold CashBack',
    type: 'Recurring',
    cashbackType: 'By Total WinLose Only',
    status: 'Inactive',
    autoApprovedAmount: 300,
    resetFrequency: 'Every Month',
    resetFrequencyDay: 1,
    createdDate: '2024-02-01'
  }
];