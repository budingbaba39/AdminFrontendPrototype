export interface Gateway {
  id: number;
  gatewayId: string; // GW001, GW002, etc.
  gatewayType: 'Bank Transfer'; // future: other types
  bankId: number; // Foreign key to Bank from BankData.ts
  bankInSlip: 'REQUIRED' | 'OPTIONAL' | 'DISABLE';
  bankInTime: 'REQUIRED' | 'DISABLE';
  status: 'Active' | 'Inactive';
  createdDate: string;
}

export const gatewaysData: Gateway[] = [
  {
    id: 1,
    gatewayId: 'GW001',
    gatewayType: 'Bank Transfer',
    bankId: 1, // Citizen Bank - UNIQUE WEAR
    bankInSlip: 'REQUIRED',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2024-01-15'
  },
  {
    id: 2,
    gatewayId: 'GW002',
    gatewayType: 'Bank Transfer',
    bankId: 7, // Global IME Bank Limited - SYAPURI DOOR
    bankInSlip: 'OPTIONAL',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2024-01-20'
  },
  {
    id: 3,
    gatewayId: 'GW003',
    gatewayType: 'Bank Transfer',
    bankId: 13, // Laxmi Sunrise Bank Limited - BIBEK KIRANA
    bankInSlip: 'REQUIRED',
    bankInTime: 'DISABLE',
    status: 'Inactive',
    createdDate: '2024-02-05'
  },
  {
    id: 4,
    gatewayId: 'GW004',
    gatewayType: 'Bank Transfer',
    bankId: 19, // Muktinath Bikas Bank Ltd - AYUSHI KIRANA
    bankInSlip: 'DISABLE',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2024-02-10'
  },
  {
    id: 5,
    gatewayId: 'GW005',
    gatewayType: 'Bank Transfer',
    bankId: 22, // NIC Asia Bank - SUNIL RICE MILL
    bankInSlip: 'OPTIONAL',
    bankInTime: 'DISABLE',
    status: 'Inactive',
    createdDate: '2024-02-15'
  }
];
