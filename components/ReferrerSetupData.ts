export interface ReferrerSetup {
  id: string;
  levelId: number;
  name: string;
  targetType: 'By Deposit' | 'By Register';
  recurring: 'One Time';
  status: 'Active' | 'Inactive';
  autoApprovedAmount: number;
  maxPayoutPerDownline: number;
  promoId: string;
  createdDate: string;
  createdBy: string;
}

export const initialReferrerSetups: ReferrerSetup[] = [
  {
    id: 'REF001',
    levelId: 1,
    name: 'Bronze Referral Program',
    targetType: 'By Deposit',
    recurring: 'One Time',
    status: 'Active',
    autoApprovedAmount: 1000,
    maxPayoutPerDownline: 1000,
    promoId: 'PROMO004',
    createdDate: '2024-01-15',
    createdBy: 'Admin'
  }
];
