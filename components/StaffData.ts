export interface Staff {
  id: string; // Format: STAFF001, STAFF002, etc.
  username: string;
  name: string;
  password: string; // Visible for demo purposes
  status: 'Active' | 'Inactive' | 'Locked' | 'Deleted';
  role: string; // e.g., "Admin001", "Manager001", "Staff001", "Agent001"
  createdBy: string; // Always "ADMIN001" for demo
  createdDate: string; // ISO date format (YYYY-MM-DD)
  lastLogin: string; // ISO datetime format (YYYY-MM-DD HH:mm:ss)
}

export interface IPLogEntry {
  timestamp: string; // ISO datetime format (YYYY-MM-DD HH:mm:ss)
  ip: string;
  isp: string;
  city: string;
  country: string;
  userAgent: string;
}

// Sample IP Log data (hardcoded - will be same for all staff)
export const sampleIPLog: IPLogEntry[] = [
  {
    timestamp: '2025-01-18 14:32:15',
    ip: '203.122.45.78',
    isp: 'TM Net',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  {
    timestamp: '2025-01-18 10:15:42',
    ip: '192.168.1.105',
    isp: 'Maxis',
    city: 'Petaling Jaya',
    country: 'Malaysia',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  {
    timestamp: '2025-01-17 22:48:33',
    ip: '110.74.192.22',
    isp: 'Celcom',
    city: 'Johor Bahru',
    country: 'Malaysia',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
  },
  {
    timestamp: '2025-01-17 16:20:11',
    ip: '175.143.89.56',
    isp: 'Digi',
    city: 'Penang',
    country: 'Malaysia',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
  },
  {
    timestamp: '2025-01-17 09:05:20',
    ip: '203.122.45.78',
    isp: 'TM Net',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
];

// Initial staff demo data (5 staff members)
export const initialStaffData: Staff[] = [
  {
    id: 'STAFF001',
    username: 'admin.john',
    name: 'John Anderson',
    password: 'Admin@123',
    status: 'Active',
    role: 'Admin001',
    createdBy: 'ADMIN001',
    createdDate: '2024-01-15',
    lastLogin: '2025-01-18 09:30:22'
  },
  {
    id: 'STAFF002',
    username: 'manager.sarah',
    name: 'Sarah Williams',
    password: 'Manager@456',
    status: 'Active',
    role: 'Manager001',
    createdBy: 'ADMIN001',
    createdDate: '2024-02-10',
    lastLogin: '2025-01-18 08:15:10'
  },
  {
    id: 'STAFF003',
    username: 'staff.mike',
    name: 'Mike Johnson',
    password: 'Staff@789',
    status: 'Inactive',
    role: 'Staff001',
    createdBy: 'ADMIN001',
    createdDate: '2024-03-05',
    lastLogin: '2025-01-17 16:45:33'
  },
  {
    id: 'STAFF004',
    username: 'agent.lisa',
    name: 'Lisa Chen',
    password: 'Agent@321',
    status: 'Locked',
    role: 'Agent001',
    createdBy: 'ADMIN001',
    createdDate: '2024-04-20',
    lastLogin: '2025-01-16 11:20:05'
  },
  {
    id: 'STAFF005',
    username: 'admin.david',
    name: 'David Martinez',
    password: 'Admin@654',
    status: 'Deleted',
    role: 'Admin002',
    createdBy: 'ADMIN001',
    createdDate: '2024-05-12',
    lastLogin: '2025-01-10 14:55:18'
  }
];

// Role options for filters and dropdowns
export const roleOptions = [
  'Admin001',
  'Admin002',
  'Manager001',
  'Manager002',
  'Staff001',
  'Staff002',
  'Agent001',
  'Agent002'
];
