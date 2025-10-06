export interface Bank {
  id: number;
  bankName: string;
  bankType: string; // 'Bank Transfer' (future: other types)
  accountName: string;
  accountNo: string;
  accountQRImage?: string; // Optional file path/URL
  description: string;
  maxCountPerDay: number;
  maxAmountPerDay: number;
}

export const banksData: Bank[] = [
  // Citizen Bank
  {
    id: 1,
    bankName: 'Citizen Bank',
    bankType: 'Bank Transfer',
    accountName: 'UNIQUE WEAR',
    accountNo: '1620100005302301',
    description: 'Primary deposit account for retail transactions',
    maxCountPerDay: 75,
    maxAmountPerDay: 150000
  },
  {
    id: 2,
    bankName: 'Citizen Bank',
    bankType: 'Bank Transfer',
    accountName: 'SUNIL RICE AND OIL MILL',
    accountNo: '1670100000433201',
    description: 'High-volume processing account for wholesale operations',
    maxCountPerDay: 95,
    maxAmountPerDay: 180000
  },
  {
    id: 3,
    bankName: 'Citizen Bank',
    bankType: 'Bank Transfer',
    accountName: 'DHANIRAM TAMANG WHOLESALE KIRANA PASAL',
    accountNo: '0340100003703201',
    description: 'Business account for wholesale transaction processing',
    maxCountPerDay: 65,
    maxAmountPerDay: 120000
  },
  // Garima Bikas Bank
  {
    id: 4,
    bankName: 'Garima Bikas Bank',
    bankType: 'Bank Transfer',
    accountName: 'PLP COLLECTION',
    accountNo: '08401000047300001',
    description: 'Collections and payment processing account',
    maxCountPerDay: 85,
    maxAmountPerDay: 175000
  },
  {
    id: 5,
    bankName: 'Garima Bikas Bank',
    bankType: 'Bank Transfer',
    accountName: 'RAMESH ELECTRONIC MOBILE PASAL',
    accountNo: '01301000005360001',
    description: 'Electronic goods transaction account',
    maxCountPerDay: 55,
    maxAmountPerDay: 95000
  },
  {
    id: 6,
    bankName: 'Garima Bikas Bank',
    bankType: 'Bank Transfer',
    accountName: 'RITA COSMETIC PASAL',
    accountNo: '02001000013290001',
    description: 'Retail cosmetic sales processing account',
    maxCountPerDay: 70,
    maxAmountPerDay: 110000
  },
  // Global IME Bank Limited
  {
    id: 7,
    bankName: 'Global IME Bank Limited',
    bankType: 'Bank Transfer',
    accountName: 'SYAPURI DOOR DRIVING TRAINING CENTER',
    accountNo: '0310100025052',
    description: 'Training center fee collection account',
    maxCountPerDay: 50,
    maxAmountPerDay: 85000
  },
  {
    id: 8,
    bankName: 'Global IME Bank Limited',
    bankType: 'Bank Transfer',
    accountName: 'MAHENDRA ORDER AND SUPPLIERS',
    accountNo: '0430100002167',
    description: 'Supply chain and ordering payment account',
    maxCountPerDay: 90,
    maxAmountPerDay: 165000
  },
  {
    id: 9,
    bankName: 'Global IME Bank Limited',
    bankType: 'Bank Transfer',
    accountName: 'DAUJIBHAI ENTERPRISES',
    accountNo: '101104311136',
    description: 'Enterprise business transaction account',
    maxCountPerDay: 80,
    maxAmountPerDay: 145000
  },
  // Jyoti Bikas Bank
  {
    id: 10,
    bankName: 'Jyoti Bikas Bank',
    bankType: 'Bank Transfer',
    accountName: 'RITA COSMETIC PASAL',
    accountNo: '03801000037900001',
    description: 'Secondary retail account for cosmetic sales',
    maxCountPerDay: 60,
    maxAmountPerDay: 100000
  },
  {
    id: 11,
    bankName: 'Jyoti Bikas Bank',
    bankType: 'Bank Transfer',
    accountName: 'BIMALA FRESH HOUSE',
    accountNo: '161184624330101003',
    description: 'Fresh products and groceries transaction account',
    maxCountPerDay: 45,
    maxAmountPerDay: 75000
  },
  {
    id: 12,
    bankName: 'Jyoti Bikas Bank',
    bankType: 'Bank Transfer',
    accountName: 'UNIQUE WEAR',
    accountNo: '161142104330101003',
    description: 'Fashion retail payment processing account',
    maxCountPerDay: 72,
    maxAmountPerDay: 135000
  },
  // Laxmi Sunrise Bank Limited
  {
    id: 13,
    bankName: 'Laxmi Sunrise Bank Limited',
    bankType: 'Bank Transfer',
    accountName: 'BIBEK KIRANA PASAL',
    accountNo: '115153193103',
    description: 'General store daily transaction account',
    maxCountPerDay: 88,
    maxAmountPerDay: 155000
  },
  {
    id: 14,
    bankName: 'Laxmi Sunrise Bank Limited',
    bankType: 'Bank Transfer',
    accountName: 'ARIK MOBILE CENTER',
    accountNo: '053013000503001',
    description: 'Mobile and electronics sales account',
    maxCountPerDay: 58,
    maxAmountPerDay: 98000
  },
  {
    id: 15,
    bankName: 'Laxmi Sunrise Bank Limited',
    bankType: 'Bank Transfer',
    accountName: 'HALESI SUPPLIERS AND STORE',
    accountNo: '053013000358001',
    description: 'Supplier payment and store operations account',
    maxCountPerDay: 78,
    maxAmountPerDay: 142000
  },
  // Machhapuchhre Bank Ltd
  {
    id: 16,
    bankName: 'Machhapuchhre Bank Ltd',
    bankType: 'Bank Transfer',
    accountName: 'UNIQUE RICE AND OIL MILL',
    accountNo: '1250094325200001',
    description: 'Mill operations and wholesale account',
    maxCountPerDay: 92,
    maxAmountPerDay: 190000
  },
  {
    id: 17,
    bankName: 'Machhapuchhre Bank Ltd',
    bankType: 'Bank Transfer',
    accountName: 'HALESI SUPPLIERS AND STORE',
    accountNo: '1250094325200002',
    description: 'Alternative supplier transaction account',
    maxCountPerDay: 68,
    maxAmountPerDay: 125000
  },
  {
    id: 18,
    bankName: 'Machhapuchhre Bank Ltd',
    bankType: 'Bank Transfer',
    accountName: 'ARIK MOBILE CENTER',
    accountNo: '1250098651000005',
    description: 'Mobile center backup processing account',
    maxCountPerDay: 52,
    maxAmountPerDay: 88000
  },
  // Muktinath Bikas Bank Ltd
  {
    id: 19,
    bankName: 'Muktinath Bikas Bank Ltd',
    bankType: 'Bank Transfer',
    accountName: 'AYUSHI KIRANA PASAL',
    accountNo: '00301300023360001',
    description: 'Neighborhood store transaction account',
    maxCountPerDay: 62,
    maxAmountPerDay: 105000
  },
  {
    id: 20,
    bankName: 'Muktinath Bikas Bank Ltd',
    bankType: 'Bank Transfer',
    accountName: 'WHOLESALE ELECTRONIC MOBILE PASAL',
    accountNo: '01001300025980001',
    description: 'Wholesale electronics high-volume account',
    maxCountPerDay: 100,
    maxAmountPerDay: 200000
  },
  {
    id: 21,
    bankName: 'Muktinath Bikas Bank Ltd',
    bankType: 'Bank Transfer',
    accountName: 'UNIQUE WEAR',
    accountNo: '163000003510001',
    description: 'Fashion retail secondary account',
    maxCountPerDay: 66,
    maxAmountPerDay: 115000
  },
  // NIC Asia Bank
  {
    id: 22,
    bankName: 'NIC Asia Bank',
    bankType: 'Bank Transfer',
    accountName: 'SUNIL RICE MILL',
    accountNo: '04511010003202',
    description: 'Rice mill bulk transaction account',
    maxCountPerDay: 82,
    maxAmountPerDay: 160000
  },
  {
    id: 23,
    bankName: 'NIC Asia Bank',
    bankType: 'Bank Transfer',
    accountName: 'NABIN GENERAL STORE',
    accountNo: '0010500327420',
    description: 'General store daily operations account',
    maxCountPerDay: 48,
    maxAmountPerDay: 82000
  },
  {
    id: 24,
    bankName: 'NIC Asia Bank',
    bankType: 'Bank Transfer',
    accountName: 'ARIK MOBILE CENTER',
    accountNo: '01615070000005',
    description: 'Mobile center main processing account',
    maxCountPerDay: 76,
    maxAmountPerDay: 138000
  }
];
