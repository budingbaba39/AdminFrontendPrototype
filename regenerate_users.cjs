const fs = require('fs');

// Read transaction data
const transactionDataContent = fs.readFileSync('./components/transactionData.ts', 'utf8');

// Extract all transactions
const extractTransactions = (content) => {
  const transactions = [];
  const regex = /{\s*id: '([^']+)',\s*type: '([^']+)',\s*username: '([^']+)',\s*name: '([^']+)',\s*mobile: '([^']+)',\s*bankAccountName: '([^']*)',\s*bankAccountNumber: '([^']*)',\s*method: '([^']*)',\s*from: '([^']*)',\s*(?:depositFee|withdrawalFee)?: (-?[\d.]+),\s*amount: (-?[\d.]+),\s*status: '([^']+)',\s*submitTime: '([^']+)',(?:\s*processTime: '([^']*)',)?(?:\s*completeTime: '([^']*)',)?(?:\s*rejectTime: '([^']*)',)?(?:\s*processBy: '([^']*)',)?(?:\s*completeBy: '([^']*)',)?(?:\s*rejectBy: '([^']*)',)?\s*currentCredit: (-?[\d.]+),/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    transactions.push({
      id: match[1],
      type: match[2],
      username: match[3],
      name: match[4],
      mobile: match[5],
      bankAccountName: match[6],
      bankAccountNumber: match[7],
      method: match[8],
      from: match[9],
      amount: parseFloat(match[11]),
      status: match[12],
      submitTime: match[13],
      completeTime: match[15] || match[13],
      currentCredit: parseFloat(match[20])
    });
  }

  return transactions;
};

const transactions = extractTransactions(transactionDataContent);
console.log(`Extracted ${transactions.length} transactions`);

// Group by mobile (unique identifier)
const userMap = new Map();

transactions.forEach(t => {
  if (!userMap.has(t.mobile)) {
    userMap.set(t.mobile, {
      username: t.username,
      name: t.name,
      mobile: t.mobile,
      bankAccount: t.bankAccountNumber || '1234567890123456',
      bank: t.from && !t.from.includes('System') ? t.from : 'MAYBANK',
      transactions: []
    });
  }
  userMap.get(t.mobile).transactions.push(t);
});

console.log(`Found ${userMap.size} unique users`);

// Read original UserData to get first 12 users
const userData = fs.readFileSync('./components/UserData.ts', 'utf8');
const originalUsersMatch = userData.match(/export const sampleUsers: User\[\] = \[([\s\S]*?)^  },\n  {[\s\S]*?$/m);

// Generate new users array
const newUsers = [];
let userIndex = 13;

for (const [mobile, userData] of userMap) {
  const { username, name, bankAccount, bank, transactions: userTxns } = userData;

  // Calculate stats
  const deposits = userTxns.filter(t => t.type === 'DEPOSIT' || t.type === 'STAFF DEPOSIT');
  const withdrawals = userTxns.filter(t => t.type === 'WITHDRAW' || t.type === 'STAFF WITHDRAW');
  const bonuses = userTxns.filter(t => t.type === 'BONUS');
  const manuals = userTxns.filter(t => t.type === 'MANUAL');
  const commissions = userTxns.filter(t => t.type === 'COMMISSION');

  const depositTotal = deposits.reduce((sum, t) => sum + t.amount, 0);
  const withdrawTotal = withdrawals.reduce((sum, t) => sum + t.amount, 0);
  const bonusTotal = bonuses.reduce((sum, t) => sum + t.amount, 0);
  const manualTotal = manuals.reduce((sum, t) => sum + t.amount, 0);
  const commissionTotal = commissions.reduce((sum, t) => sum + t.amount, 0);

  // Determine level
  let level = 'bronze';
  if (depositTotal >= 2000) level = 'gold';
  else if (depositTotal >= 500) level = 'silver';

  // Determine tags
  const tags = [];
  if (depositTotal > 2000) tags.push('VIP');
  if (bonuses.length >= 3) tags.push('BONUSHUNTER');
  if (depositTotal > 5000) tags.push('HighValue');

  // Get latest transaction
  const latestTxn = userTxns.sort((a, b) => new Date(b.completeTime) - new Date(a.completeTime))[0];
  const lastDeposit = deposits.length > 0 ? deposits.sort((a, b) => new Date(b.completeTime) - new Date(a.completeTime))[0].completeTime : '2023-08-01';

  // Find ongoing promotion
  const ongoingPromo = bonuses.find(b => b.status === 'APPROVED');

  newUsers.push({
    id: username,
    registerDate: '2023-08-01',
    name,
    mobile,
    credit: latestTxn.currentCredit,
    bankAccount,
    bank,
    referrer: 'DIRECT',
    agent: 'AGENT001',
    winLoss: 0,
    lastDeposit,
    lastLogin: latestTxn.completeTime,
    betHistory: 'View',
    status: 'ACTIVE',
    ip: '192.168.1.100',
    depositCount: deposits.length,
    depositTotal,
    withdrawCount: withdrawals.length,
    withdrawTotal,
    bonusCount: bonuses.length,
    bonusTotal,
    manualCount: manuals.length,
    manualTotal,
    commissionCount: commissions.length,
    commissionTotal,
    level,
    tags,
    ongoingPromotionID: ongoingPromo ? 'PROMO001' : undefined
  });
}

console.log(`Generated ${newUsers.length} new users`);

// Format users as TypeScript
const formatUser = (user) => {
  return `  {
    id: '${user.id}',
    registerDate: '${user.registerDate}',
    name: '${user.name}',
    mobile: '${user.mobile}',
    credit: ${user.credit.toFixed(2)},
    bankAccount: '${user.bankAccount}',
    bank: '${user.bank}',
    referrer: '${user.referrer}',
    agent: '${user.agent}',
    winLoss: ${user.winLoss},
    lastDeposit: '${user.lastDeposit}',
    lastLogin: '${user.lastLogin}',
    betHistory: '${user.betHistory}',
    status: '${user.status}',
    ip: '${user.ip}',
    depositCount: ${user.depositCount},
    depositTotal: ${user.depositTotal.toFixed(2)},
    withdrawCount: ${user.withdrawCount},
    withdrawTotal: ${user.withdrawTotal.toFixed(2)},
    bonusCount: ${user.bonusCount},
    bonusTotal: ${user.bonusTotal.toFixed(2)},
    manualCount: ${user.manualCount},
    manualTotal: ${user.manualTotal.toFixed(2)},
    commissionCount: ${user.commissionCount},
    commissionTotal: ${user.commissionTotal.toFixed(2)},
    level: '${user.level}',
    tags: [${user.tags.map(t => `'${t}'`).join(', ')}]${user.ongoingPromotionID ? `,\n    ongoingPromotionID: '${user.ongoingPromotionID}'` : ''}
  }`;
};

const newUsersCode = newUsers.map(formatUser).join(',\n');

// Read first 12 users from original file
const first12UsersMatch = userData.match(/export const sampleUsers: User\[\] = \[([\s\S]*?)\n  },\n  {\n    id: '165478067'/);
let first12Users = '';
if (first12UsersMatch) {
  first12Users = first12UsersMatch[1] + '\n  },';
}

// Create new UserData.ts
const newUserDataContent = `// User interface and data
export interface User {
  id: string;
  registerDate: string;
  name: string;
  mobile: string;
  credit: number;
  bankAccount: string;
  bank: string;
  referrer: string;
  agent: string;
  winLoss: number;
  lastDeposit: string;
  lastLogin: string;
  betHistory: string;
  status: 'ACTIVE' | 'INACTIVE';
  ip: string;
  depositCount: number;
  depositTotal: number;
  withdrawCount: number;
  withdrawTotal: number;
  bonusCount: number;
  bonusTotal: number;
  manualCount: number;
  manualTotal: number;
  commissionCount: number;
  commissionTotal: number;
  level?: string;
  tags?: string[];
  ongoingPromotionID?: string; // Current ongoing promotion (user can only have one at a time)
}

// Sample user data
export const sampleUsers: User[] = [
${first12Users}
${newUsersCode}
];
`;

fs.writeFileSync('./components/UserData.ts', newUserDataContent);
console.log('UserData.ts regenerated successfully!');
console.log(`Total users: ${12 + newUsers.length}`);
