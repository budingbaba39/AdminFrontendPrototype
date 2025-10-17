export interface ReferrerSetup {
  id: string;
  name: string;
  targetType: 'By Deposit' | 'By Register';
  recurring: 'One Time';
  status: 'Active' | 'Inactive';
  autoApprovedAmount: number;
  maxPayoutPerDownline: number;
  promoId: string;
  levelId?: number; // Single level selection
  createdDate: string;
  createdBy: string;
}

export const initialReferrerSetups: ReferrerSetup[] = [
  {
    id: 'REF001',
    name: 'Bronze Referral Program',
    targetType: 'By Deposit',
    recurring: 'One Time',
    status: 'Active',
    autoApprovedAmount: 1000,
    maxPayoutPerDownline: 1000,
    promoId: 'PROMO004',
    levelId: 1, // Bronze
    createdDate: '2024-01-15',
    createdBy: 'Admin'
  },
  {
    id: 'REF002',
    name: 'Silver Registration Bonus',
    targetType: 'By Register',
    recurring: 'One Time',
    status: 'Active',
    autoApprovedAmount: 500,
    maxPayoutPerDownline: 800,
    promoId: 'PROMO005',
    levelId: 2, // Silver
    createdDate: '2024-02-10',
    createdBy: 'Admin'
  },
  {
    id: 'REF003',
    name: 'Gold VIP Referral',
    targetType: 'By Deposit',
    recurring: 'One Time',
    status: 'Inactive',
    autoApprovedAmount: 2000,
    maxPayoutPerDownline: 2500,
    promoId: 'PROMO006',
    levelId: 3, // Gold
    createdDate: '2024-03-05',
    createdBy: 'SuperAdmin'
  }
];
