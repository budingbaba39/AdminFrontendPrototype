export interface ReferrerBonus {
  id: string;
  username: string; // The referrer who receives the bonus (e.g., USR006)
  referee: string; // The user who was referred and triggered this bonus (e.g., USR018)
  amount: number;
  confirmedAmount: number; // Same as amount (hardcoded)
  referrerSetupId: string; // Use this to lookup referrer setup details
  submitTime: string;
  completeTime?: string;
  rejectTime?: string;
  handler?: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  remark?: string;
}

// Sample data with 6 PENDING, 3 COMPLETED, 1 REJECTED
// Note: username is the referrer who receives the bonus, referee is who signed up
// Note: User details (name, mobile) are looked up from UserData
// Note: Referrer setup details are looked up from ReferrerSetupData using referrerSetupId
export const referrerBonusList: ReferrerBonus[] = [
  // PENDING records (6)
  {
    id: 'RB001',
    username: 'USR002', // Referrer who gets bonus (LISA BETA)
    referee: 'USR007', // User who signed up (ALEX GOLF)
    amount: 1500.00,
    confirmedAmount: 1500.00,
    referrerSetupId: 'REF001',
    submitTime: '2025-10-10 14:30:00',
    status: 'PENDING'
  },
  {
    id: 'RB002',
    username: 'USR004', // Referrer who gets bonus (SARAH DELTA)
    referee: 'USR008', // User who signed up (RACHEL HOTEL)
    amount: 1200.00,
    confirmedAmount: 1200.00,
    referrerSetupId: 'REF002',
    submitTime: '2025-10-11 09:15:00',
    status: 'PENDING'
  },
  {
    id: 'RB003',
    username: 'USR002', // Referrer who gets bonus (LISA BETA)
    referee: 'USR011', // User who signed up (KEVIN KILO)
    amount: 1800.00,
    confirmedAmount: 1800.00,
    referrerSetupId: 'REF001',
    submitTime: '2025-10-12 16:45:00',
    status: 'PENDING'
  },
  {
    id: 'RB004',
    username: 'USR001', // Referrer who gets bonus (JOHN ALPHA)
    referee: 'USR015', // User who signed up (MICHAEL KILO)
    amount: 1350.00,
    confirmedAmount: 1350.00,
    referrerSetupId: 'REF003',
    submitTime: '2025-10-13 11:20:00',
    status: 'PENDING'
  },
  {
    id: 'RB005',
    username: 'USR006', // Referrer who gets bonus (EMMA FOXTROT)
    referee: 'USR017', // User who signed up (DAVID MIKE)
    amount: 2000.00,
    confirmedAmount: 2000.00,
    referrerSetupId: 'REF001',
    submitTime: '2025-10-13 15:30:00',
    status: 'PENDING'
  },
  {
    id: 'RB006',
    username: 'USR006', // Referrer who gets bonus (EMMA FOXTROT)
    referee: 'USR018', // User who signed up (OLIVIA NOVEMBER)
    amount: 1650.00,
    confirmedAmount: 1650.00,
    referrerSetupId: 'REF002',
    submitTime: '2025-10-14 10:00:00',
    status: 'PENDING'
  },
  // COMPLETED records (3)
  {
    id: 'RB007',
    username: 'USR006', // Referrer who gets bonus (EMMA FOXTROT)
    referee: 'USR010', // User who signed up (NINA JULIET)
    amount: 850.00,
    confirmedAmount: 850.00,
    referrerSetupId: 'REF001',
    submitTime: '2025-10-08 13:45:00',
    completeTime: '2025-10-09 10:30:00',
    handler: 'ADMIN001',
    status: 'COMPLETED'
  },
  {
    id: 'RB008',
    username: 'USR001', // Referrer who gets bonus (JOHN ALPHA)
    referee: 'USR016', // User who signed up (SOPHIA LIMA)
    amount: 500.00,
    confirmedAmount: 500.00,
    referrerSetupId: 'REF002',
    submitTime: '2025-10-07 14:20:00',
    completeTime: '2025-10-08 09:15:00',
    handler: 'ADMIN001',
    status: 'COMPLETED'
  },
  {
    id: 'RB009',
    username: 'USR001', // Referrer who gets bonus (JOHN ALPHA)
    referee: 'USR020', // User who signed up (ISABELLA PAPA)
    amount: 1100.00,
    confirmedAmount: 1100.00,
    referrerSetupId: 'REF003',
    submitTime: '2025-10-06 16:30:00',
    completeTime: '2025-10-07 11:45:00',
    handler: 'ADMIN001',
    status: 'COMPLETED',
    remark: 'Approved as per referrer program'
  },
  // REJECTED record (1)
  {
    id: 'RB010',
    username: 'USR004', // Referrer who gets bonus (SARAH DELTA)
    referee: 'USR019', // User who signed up (ETHAN OSCAR)
    amount: 750.00,
    confirmedAmount: 750.00,
    referrerSetupId: 'REF001',
    submitTime: '2025-10-05 12:00:00',
    rejectTime: '2025-10-06 14:20:00',
    handler: 'ADMIN001',
    status: 'REJECTED',
    remark: 'Duplicate claim detected'
  }
];
