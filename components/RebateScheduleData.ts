export interface RebateSchedule {
  id: number;
  rebateType: 'Valid Bet';
  status: 'Active' | 'Inactive';
  type: 'Recurring';
  resetFrequency?: 'Everyday' | 'Every Week' | 'Every Month';
  resetFrequencyDay?: string | number;
  createdDate: string;
  autoApprovedAmount: number;
}

export const sampleRebateSchedules: RebateSchedule[] = [
  {
    id: 1,
    rebateType: 'Valid Bet',
    status: 'Active',
    type: 'Recurring',
    resetFrequency: 'Everyday',
    createdDate: '2024-01-15',
    autoApprovedAmount: 100
  },
];