export interface Bank {
  id: number;
  bankName: string;
  bankType: 'Online Transfer' | 'QR'; // 'Online Transfer' | 'QR' (future: other types)
  accountName?: string;
  accountNo?: string;
  accountQRImage?: string; // Optional file path/URL
  description?: string;
  maxCountPerDay: number;
  maxAmountPerDay: number;
  bankInSlip: 'REQUIRED' | 'OPTIONAL' | 'DISABLE';
  bankInTime: 'REQUIRED' | 'DISABLE';
  status: 'Active' | 'Inactive';
  createdDate: string;
}

export const banksData: Bank[] = [
  // Citizen Bank
  {
    id: 1,
    bankName: 'Citizen Bank',
    bankType: 'Online Transfer',
    accountName: 'UNIQUE WEAR',
    accountNo: '1620100005302301',
    description: 'Primary deposit account for retail transactions',
    maxCountPerDay: 75,
    maxAmountPerDay: 150000,
    bankInSlip: 'REQUIRED',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2024-01-15'
  },
  {
    id: 2,
    bankName: 'Citizen Bank',
    bankType: 'Online Transfer',
    accountName: 'SUNIL RICE AND OIL MILL',
    accountNo: '1670100000433201',
    description: 'High-volume processing account for wholesale operations',
    maxCountPerDay: 95,
    maxAmountPerDay: 180000,
    bankInSlip: 'OPTIONAL',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2024-02-20'
  },
  {
    id: 3,
    bankName: 'Citizen Bank',
    bankType: 'Online Transfer',
    accountName: 'DHANIRAM TAMANG WHOLESALE KIRANA PASAL',
    accountNo: '0340100003703201',
    description: 'Business account for wholesale transaction processing',
    maxCountPerDay: 65,
    maxAmountPerDay: 120000,
    bankInSlip: 'DISABLE',
    bankInTime: 'REQUIRED',
    status: 'Inactive',
    createdDate: '2024-03-10'
  },
  // Garima Bikas Bank
  {
    id: 4,
    bankName: 'Garima Bikas Bank',
    bankType: 'Online Transfer',
    accountName: 'PLP COLLECTION',
    accountNo: '08401000047300001',
    description: 'Collections and payment processing account',
    maxCountPerDay: 85,
    maxAmountPerDay: 175000,
    bankInSlip: 'REQUIRED',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2024-04-05'
  },
  {
    id: 5,
    bankName: 'Garima Bikas Bank',
    bankType: 'Online Transfer',
    accountName: 'RAMESH ELECTRONIC MOBILE PASAL',
    accountNo: '01301000005360001',
    description: 'Electronic goods transaction account',
    maxCountPerDay: 55,
    maxAmountPerDay: 95000,
    bankInSlip: 'OPTIONAL',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2024-05-12'
  },
  {
    id: 6,
    bankName: 'Garima Bikas Bank',
    bankType: 'Online Transfer',
    accountName: 'RITA COSMETIC PASAL',
    accountNo: '02001000013290001',
    description: 'Retail cosmetic sales processing account',
    maxCountPerDay: 70,
    maxAmountPerDay: 110000,
    bankInSlip: 'DISABLE',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2024-06-18'
  },
  // Global IME Bank Limited
  {
    id: 7,
    bankName: 'Global IME Bank Limited',
    bankType: 'Online Transfer',
    accountName: 'SYAPURI DOOR DRIVING TRAINING CENTER',
    accountNo: '0310100025052',
    description: 'Training center fee collection account',
    maxCountPerDay: 50,
    maxAmountPerDay: 85000,
    bankInSlip: 'REQUIRED',
    bankInTime: 'REQUIRED',
    status: 'Inactive',
    createdDate: '2024-07-22'
  },
  {
    id: 8,
    bankName: 'Global IME Bank Limited',
    bankType: 'Online Transfer',
    accountName: 'MAHENDRA ORDER AND SUPPLIERS',
    accountNo: '0430100002167',
    description: 'Supply chain and ordering payment account',
    maxCountPerDay: 90,
    maxAmountPerDay: 165000,
    bankInSlip: 'OPTIONAL',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2024-08-30'
  },
  {
    id: 9,
    bankName: 'Global IME Bank Limited',
    bankType: 'Online Transfer',
    accountName: 'DAUJIBHAI ENTERPRISES',
    accountNo: '101104311136',
    description: 'Enterprise business transaction account',
    maxCountPerDay: 80,
    maxAmountPerDay: 145000,
    bankInSlip: 'DISABLE',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2024-09-14'
  },
  // Jyoti Bikas Bank
  {
    id: 10,
    bankName: 'Jyoti Bikas Bank',
    bankType: 'Online Transfer',
    accountName: 'RITA COSMETIC PASAL',
    accountNo: '03801000037900001',
    description: 'Secondary retail account for cosmetic sales',
    maxCountPerDay: 60,
    maxAmountPerDay: 100000,
    bankInSlip: 'REQUIRED',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2025-01-08'
  },
  {
    id: 11,
    bankName: 'Jyoti Bikas Bank',
    bankType: 'Online Transfer',
    accountName: 'BIMALA FRESH HOUSE',
    accountNo: '161184624330101003',
    description: 'Fresh products and groceries transaction account',
    maxCountPerDay: 45,
    maxAmountPerDay: 75000,
    bankInSlip: 'OPTIONAL',
    bankInTime: 'REQUIRED',
    status: 'Inactive',
    createdDate: '2025-02-16'
  },
  {
    id: 12,
    bankName: 'Jyoti Bikas Bank',
    bankType: 'Online Transfer',
    accountName: 'UNIQUE WEAR',
    accountNo: '161142104330101003',
    description: 'Fashion retail payment processing account',
    maxCountPerDay: 72,
    maxAmountPerDay: 135000,
    bankInSlip: 'DISABLE',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2025-03-25'
  },
  // Laxmi Sunrise Bank Limited
  {
    id: 13,
    bankName: 'Laxmi Sunrise Bank Limited',
    bankType: 'Online Transfer',
    accountName: 'BIBEK KIRANA PASAL',
    accountNo: '115153193103',
    description: 'General store daily transaction account',
    maxCountPerDay: 88,
    maxAmountPerDay: 155000,
    bankInSlip: 'REQUIRED',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2025-04-03'
  },
  {
    id: 14,
    bankName: 'Laxmi Sunrise Bank Limited',
    bankType: 'Online Transfer',
    accountName: 'ARIK MOBILE CENTER',
    accountNo: '053013000503001',
    description: 'Mobile and electronics sales account',
    maxCountPerDay: 58,
    maxAmountPerDay: 98000,
    bankInSlip: 'OPTIONAL',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2025-05-11'
  },
  {
    id: 15,
    bankName: 'Laxmi Sunrise Bank Limited',
    bankType: 'Online Transfer',
    accountName: 'HALESI SUPPLIERS AND STORE',
    accountNo: '053013000358001',
    description: 'Supplier payment and store operations account',
    maxCountPerDay: 78,
    maxAmountPerDay: 142000,
    bankInSlip: 'DISABLE',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2025-06-19'
  },
  // Machhapuchhre Bank Ltd
  {
    id: 16,
    bankName: 'Machhapuchhre Bank Ltd',
    bankType: 'Online Transfer',
    accountName: 'UNIQUE RICE AND OIL MILL',
    accountNo: '1250094325200001',
    description: 'Mill operations and wholesale account',
    maxCountPerDay: 92,
    maxAmountPerDay: 190000,
    bankInSlip: 'REQUIRED',
    bankInTime: 'DISABLE',
    status: 'Inactive',
    createdDate: '2025-07-27'
  },
  {
    id: 17,
    bankName: 'Machhapuchhre Bank Ltd',
    bankType: 'Online Transfer',
    accountName: 'HALESI SUPPLIERS AND STORE',
    accountNo: '1250094325200002',
    description: 'Alternative supplier transaction account',
    maxCountPerDay: 68,
    maxAmountPerDay: 125000,
    bankInSlip: 'OPTIONAL',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2025-08-04'
  },
  {
    id: 18,
    bankName: 'Machhapuchhre Bank Ltd',
    bankType: 'Online Transfer',
    accountName: 'ARIK MOBILE CENTER',
    accountNo: '1250098651000005',
    description: 'Mobile center backup processing account',
    maxCountPerDay: 52,
    maxAmountPerDay: 88000,
    bankInSlip: 'DISABLE',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2025-09-12'
  },
  // Muktinath Bikas Bank Ltd
  {
    id: 19,
    bankName: 'Muktinath Bikas Bank Ltd',
    bankType: 'Online Transfer',
    accountName: 'AYUSHI KIRANA PASAL',
    accountNo: '00301300023360001',
    description: 'Neighborhood store transaction account',
    maxCountPerDay: 62,
    maxAmountPerDay: 105000,
    bankInSlip: 'REQUIRED',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2025-01-20'
  },
  {
    id: 20,
    bankName: 'Muktinath Bikas Bank Ltd',
    bankType: 'Online Transfer',
    accountName: 'WHOLESALE ELECTRONIC MOBILE PASAL',
    accountNo: '01001300025980001',
    description: 'Wholesale electronics high-volume account',
    maxCountPerDay: 100,
    maxAmountPerDay: 200000,
    bankInSlip: 'OPTIONAL',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2025-02-28'
  },
  {
    id: 21,
    bankName: 'Muktinath Bikas Bank Ltd',
    bankType: 'Online Transfer',
    accountName: 'UNIQUE WEAR',
    accountNo: '163000003510001',
    description: 'Fashion retail secondary account',
    maxCountPerDay: 66,
    maxAmountPerDay: 115000,
    bankInSlip: 'DISABLE',
    bankInTime: 'REQUIRED',
    status: 'Inactive',
    createdDate: '2025-03-15'
  },
  // NIC Asia Bank
  {
    id: 22,
    bankName: 'NIC Asia Bank',
    bankType: 'Online Transfer',
    accountName: 'SUNIL RICE MILL',
    accountNo: '04511010003202',
    description: 'Rice mill bulk transaction account',
    maxCountPerDay: 82,
    maxAmountPerDay: 160000,
    bankInSlip: 'REQUIRED',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2025-04-22'
  },
  {
    id: 23,
    bankName: 'NIC Asia Bank',
    bankType: 'Online Transfer',
    accountName: 'NABIN GENERAL STORE',
    accountNo: '0010500327420',
    description: 'General store daily operations account',
    maxCountPerDay: 48,
    maxAmountPerDay: 82000,
    bankInSlip: 'OPTIONAL',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2025-05-30'
  },
  {
    id: 24,
    bankName: 'NIC Asia Bank',
    bankType: 'Online Transfer',
    accountName: 'ARIK MOBILE CENTER',
    accountNo: '01615070000005',
    description: 'Mobile center main processing account',
    maxCountPerDay: 76,
    maxAmountPerDay: 138000,
    bankInSlip: 'DISABLE',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2025-07-08'
  },
  // QR Types
  {
    id: 25,
    bankName: 'QR Payment Gateway A',
    bankType: 'QR',
    accountName: '',
    accountNo: '',
    accountQRImage: 'qr-a.png',
    description: 'QR payment option A for quick scans',
    maxCountPerDay: 0,
    maxAmountPerDay: 0,
    bankInSlip: 'DISABLE',
    bankInTime: 'DISABLE',
    status: 'Active',
    createdDate: '2025-10-01'
  },
  {
    id: 26,
    bankName: 'QR Payment Gateway B',
    bankType: 'QR',
    accountName: '',
    accountNo: '',
    accountQRImage: 'qr-b.png',
    description: 'QR payment option B for mobile transactions',
    maxCountPerDay: 0,
    maxAmountPerDay: 0,
    bankInSlip: 'OPTIONAL',
    bankInTime: 'REQUIRED',
    status: 'Active',
    createdDate: '2025-10-02'
  },
  {
    id: 27,
    bankName: 'QR Payment Gateway C',
    bankType: 'QR',
    accountName: 'QR Account C',
    accountNo: 'QR123456',
    accountQRImage: 'qr-c.png',
    description: 'QR payment option C with basic account details',
    maxCountPerDay: 50,
    maxAmountPerDay: 50000,
    bankInSlip: 'REQUIRED',
    bankInTime: 'DISABLE',
    status: 'Inactive',
    createdDate: '2025-10-03'
  }
];