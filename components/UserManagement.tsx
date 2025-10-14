import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, Download, RefreshCw } from 'lucide-react';
import ProfileContent from './ProfileContent';
import { User, sampleUsers, getUserNameById, generateReferralCode } from './UserData';
import { Transaction, allTransactions } from './transactionData';
import ReactSelect from 'react-select';

// Level color mapping to match ProfileManagement
const levelColorMap = {
  bronze: {
    badgeColor: '#f4a261',
    fontColor: '#8a5522'
  },
  silver: {
    badgeColor: '#d9d9d9',
    fontColor: '#4a4a4a'
  },
  gold: {
    badgeColor: '#f1c40f',
    fontColor: '#7f6000'
  }
};

type UserStatus = 'ALL' | 'ACTIVE' | 'INACTIVE';

const tagOptions = [
  'LifetimeDeposit',
  'BONUSHUNTER',
  'FAKE RECEIPT',
  'VIP',
  'SPECIALPROMO',
  'tester',
  'Hunter',
  'VIPBRONZE'
];

const levelOptions = ['-','bronze', 'silver', 'gold'];

export default function UserManagement() {
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    mobileNo: '',
    agent: '',
    bank: '',
    ip: '',
    password: '',
    status: 'ALL' as UserStatus,
    lastVisit: '',
    activity: '',
    level: '',
    tags: [] as string[],
    referredBy: ''
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState<UserStatus>('ALL');
  const [users, setUsers] = useState(sampleUsers);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof sampleUsers[0] | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '000000',
    fullName: '',
    referralCode: '',
    referredBy: null as string | null
  });

  const [referralCodeError, setReferralCodeError] = useState('');
  const [referralCodeValid, setReferralCodeValid] = useState(false);

  // Function to mask credit amount
  const maskCreditAmount = (credit: number) => {
    return "*****";
  };

  // Function to get level colors
  const getLevelColors = (level: string) => {
    return levelColorMap[level as keyof typeof levelColorMap] || {
      badgeColor: '#9ca3af',
      fontColor: '#374151'
    };
  };

  // Filter users based on search and status
  const filteredUsers = hasSearched 
    ? users.filter(user => {
        if (activeStatusFilter === 'ALL') return true;
        return user.status === activeStatusFilter;
      })
    : [];

  // Calculate status counts
  const statusCounts = hasSearched ? {
    ALL: users.length,
    ACTIVE: users.filter(u => u.status === 'ACTIVE').length,
    INACTIVE: users.filter(u => u.status === 'INACTIVE').length,
  } : { ALL: 0, ACTIVE: 0, INACTIVE: 0 };

  const handleSearch = () => {
    setHasSearched(true);
    setActiveStatusFilter('ALL');
  };

  const handleReset = () => {
    setSearchFilters({
      name: '',
      mobileNo: '',
      agent: '',
      bank: '',
      ip: '',
      password: '',
      status: 'ALL' as UserStatus,
      lastVisit: '',
      activity: '',
      level: '',
      tags: [],
      referredBy: ''
    });
    setActiveStatusFilter('ALL');
    setHasSearched(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };


  const handleUserNameClick = (user: typeof sampleUsers[0]) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleUserUpdate = (updatedUser: typeof sampleUsers[0]) => {
    const updatedUsers = users.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    setSelectedUser(updatedUser);
  };

  const handleReferralCodeChange = (code: string) => {
    setNewUser(prev => ({ ...prev, referralCode: code }));
    setReferralCodeError('');
    setReferralCodeValid(false);

    if (!code.trim()) {
      setNewUser(prev => ({ ...prev, referredBy: null }));
      return;
    }

    // Find user by referral code
    const referringUser = users.find(u => u.referrer_code === code.trim());
    if (referringUser) {
      setNewUser(prev => ({ ...prev, referredBy: referringUser.id }));
      setReferralCodeValid(true);
    } else {
      setReferralCodeError('Invalid referral code');
      setNewUser(prev => ({ ...prev, referredBy: null }));
    }
  };

  const handleCreateUser = () => {
    // Validation
    if (!newUser.fullName.trim()) {
      alert('Full Name is required');
      return;
    }

    const userId = `USR${String(users.length + 1).padStart(3, '0')}`;
    const newUserData: User = {
      id: userId,
      registerDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      name: newUser.fullName.toUpperCase(),
      mobile: '60123456789',
      credit: 0.00,
      bankAccount: '0000000000000000',
      bank: 'N/A',
      referrer_code: generateReferralCode(userId),
      referrer_by: newUser.referredBy,
      agent: 'AGENT001',
      winLoss: 0.00,
      lastDeposit: '-',
      lastLogin: '-',
      betHistory: 'View',
      status: 'ACTIVE' as const,
      ip: '192.168.1.105',
      depositCount: 0,
      depositTotal: 0.00,
      withdrawCount: 0,
      withdrawTotal: 0.00,
      bonusCount: 0,
      bonusTotal: 0.00,
      manualCount: 0,
      manualTotal: 0.00,
      commissionCount: 0,
      commissionTotal: 0.00,
      level: '',
      tags: []
    };

    setUsers(prev => [...prev, newUserData]);
    setShowCreateModal(false);
    setNewUser({
      username: '',
      password: '000000',
      fullName: '',
      referralCode: '',
      referredBy: null
    });
    setReferralCodeError('');
    setReferralCodeValid(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'INACTIVE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">User Search & Filter</h2>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white h-9 text-sm font-semibold px-6"
          >
            CREATE
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <Input
            placeholder="Name"
            value={searchFilters.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="h-9"
          />
          
          <Input
            placeholder="Mobile No"
            value={searchFilters.mobileNo}
            onChange={(e) => handleInputChange('mobileNo', e.target.value)}
            className="h-9"
          />
          
          <Input
            placeholder="Agent"
            value={searchFilters.agent}
            onChange={(e) => handleInputChange('agent', e.target.value)}
            className="h-9"
          />
          
          <Input
            placeholder="Bank"
            value={searchFilters.bank}
            onChange={(e) => handleInputChange('bank', e.target.value)}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <Input
            placeholder="IP"
            value={searchFilters.ip}
            onChange={(e) => handleInputChange('ip', e.target.value)}
            className="h-9"
          />
          
          <Input
            placeholder="Password"
            type="password"
            value={searchFilters.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="h-9"
          />
          <Button
            onClick={handleSearch}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6"
          >
            SEARCH
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="text-sm text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400 h-8 px-3"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            RESET
          </Button>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-[#3949ab] hover:text-[#2c3582] underline font-medium flex items-center gap-1 justify-center"
          >
            ADVANCED
            {showAdvancedFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <Select value={searchFilters.lastVisit} onValueChange={(value) => handleInputChange('lastVisit', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Last Visit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3days">3 days ago</SelectItem>
                  <SelectItem value="1week">1 week ago</SelectItem>
                  <SelectItem value="1month">1 month ago</SelectItem>
                  <SelectItem value="3months">3 months ago</SelectItem>
                </SelectContent>
              </Select>

              <Select value={searchFilters.activity} onValueChange={(value) => handleInputChange('activity', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit member</SelectItem>
                  <SelectItem value="nondeposit">Non Deposit member</SelectItem>
                </SelectContent>
              </Select>

              <Select value={searchFilters.level} onValueChange={(value) => handleInputChange('level', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>

              <div>
                <ReactSelect
                  isMulti
                  className="text-sm"
                  menuPortalTarget={document.body}
                  styles={{menuPortal: base => ({ ...base, zIndex: 9999 }),}}
                  options={tagOptions.map(tag => ({ value: tag, label: tag }))}
                  value={tagOptions.filter(tag => searchFilters.tags.includes(tag)).map(tag => ({ value: tag, label: tag }))}
                  onChange={(selected) =>setSearchFilters(prev => ({...prev,tags: selected ? selected.map(s => s.value) : [],}))}
                  placeholder="Select Tags"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <Select value={searchFilters.referredBy} onValueChange={(value) => handleInputChange('referredBy', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Referred By User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Users</SelectItem>
                  {users.filter(u => u.referrer_by !== null).map(u => u.referrer_by).filter((value, index, self) => self.indexOf(value) === index).map(referrerId => {
                    const referrer = users.find(u => u.id === referrerId);
                    return referrer ? (
                      <SelectItem key={referrer.id} value={referrer.id}>
                        {referrer.id} - {referrer.name}
                      </SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => console.log('Export data')}
                className="bg-[#2196f3] hover:bg-[#1976d2] text-white h-9 text-sm font-semibold px-6 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                EXPORT
              </Button>
            </div>

            {/* Status Filter Bar - Only show when advanced is open */}
            {hasSearched && (
              <div className="mt-4 pt-4 border-t">
                <div className="relative">
                  <div className="flex bg-gray-100 rounded-lg p-1 relative">
                    <div 
                      className="absolute top-1 bottom-1 bg-[#3949ab] rounded-md transition-all duration-300 ease-in-out shadow-sm"
                      style={{
                        width: `calc(${100 / 3}% - 0.25rem)`,
                        left: `calc(${(Object.keys(statusCounts).indexOf(activeStatusFilter) * 100) / 3}% + 0.125rem)`,
                      }}
                    />
                    {(Object.keys(statusCounts) as UserStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => setActiveStatusFilter(status)}
                        className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 relative z-10 ${
                          activeStatusFilter === status
                            ? 'text-white'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        {status.charAt(0) + status.slice(1).toLowerCase()} ({statusCounts[status]})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User List */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Register Date</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Mobile</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Credit</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Referral Code</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Referred By</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Action</th>
                  <th colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-gray-900 uppercase border-2 border-blue-300 bg-blue-50">
                    DEPOSIT
                  </th>
                  <th colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-gray-900 uppercase border-2 border-green-300 bg-green-50">
                    WITHDRAW
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Win/Loss</th>
                  <th colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-gray-900 uppercase border-2 border-purple-300 bg-purple-50">
                    BONUS
                  </th>
                  <th colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-gray-900 uppercase border-2 border-orange-300 bg-orange-50">
                    MANUAL
                  </th>
                  <th colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-gray-900 uppercase border-2 border-red-300 bg-red-50">
                    COMMISSION
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Last Deposit</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Last Login</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Bet History</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="px-3 py-1"></th>
                  <th className="px-3 py-1"></th>
                  <th className="px-3 py-1"></th>
                  <th className="px-3 py-1"></th>
                  <th className="px-3 py-1"></th>
                  <th className="px-3 py-1"></th>
                  <th className="px-3 py-1"></th>
                  <th className="px-3 py-1 text-center text-xs font-semibold text-gray-900 uppercase border-l-2 border-r border-blue-300">Count</th>
                  <th className="px-3 py-1 text-center text-xs font-semibold text-gray-900 uppercase border-r-2 border-l border-blue-300">Total</th>
                  <th className="px-3 py-1 text-center text-xs font-semibold text-gray-900 uppercase border-l-2 border-r border-green-300">Count</th>
                  <th className="px-3 py-1 text-center text-xs font-semibold text-gray-900 uppercase border-r-2 border-l border-green-300">Total</th>
                  <th className="px-3 py-1"></th>
                  <th className="px-3 py-1 text-center text-xs font-semibold text-gray-900 uppercase border-l-2 border-r border-purple-300">Count</th>
                  <th className="px-3 py-1 text-center text-xs font-semibold text-gray-900 uppercase border-r-2 border-l border-purple-300">Total</th>
                  <th className="px-3 py-1 text-center text-xs font-semibold text-gray-900 uppercase border-l-2 border-r border-orange-300">Count</th>
                  <th className="px-3 py-1 text-center text-xs font-semibold text-gray-900 uppercase border-r-2 border-l border-orange-300">Total</th>
                  <th className="px-3 py-1 text-center text-xs font-semibold text-gray-900 uppercase border-l-2 border-r border-red-300">Count</th>
                  <th className="px-3 py-1 text-center text-xs font-semibold text-gray-900 uppercase border-r-2 border-l border-red-300">Total</th>
                  <th className="px-3 py-1"></th>
                  <th className="px-3 py-1"></th>
                  <th className="px-3 py-1"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900 text-xs">{user.registerDate}</td>
                    <td className="px-3 py-2 flex items-center flex-wrap gap-1">
                      <span 
                        className="text-gray-900 font-medium cursor-pointer hover:text-blue-600 hover:underline"
                        onClick={() => handleUserNameClick(user)}
                      >
                        {user.name}
                      </span> 
                    </td>
                    <td className="px-3 py-2 text-gray-900 text-xs">{user.mobile}</td>
                    <td className="px-3 py-2">
                      <span className="text-gray-900 font-semibold text-xs">
                        {maskCreditAmount(user.credit)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-900 text-xs font-mono">{user.referrer_code}</td>
                    <td className="px-3 py-2 text-xs">
                      {user.referrer_by ? (
                        <span
                          className="text-blue-600 font-medium cursor-pointer hover:underline"
                          onClick={() => {
                            const referringUser = users.find(u => u.id === user.referrer_by);
                            if (referringUser) handleUserNameClick(referringUser);
                          }}
                        >
                          {getUserNameById(user.referrer_by, users)}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Direct Signup</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#ff9800] text-white hover:bg-[#f57c00] border-[#ff9800] text-xs h-5 px-2"
                        >
                          Log In
                        </Button>
                        <Badge className={`${getStatusColor(user.status)} text-xs font-semibold px-2 py-0.5 text-center`}>
                          {user.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-900 text-center border-l-2 border-r border-blue-300 text-xs">{user.depositCount}</td>
                    <td className="px-3 py-2 text-green-600 font-semibold border-r-2 border-l border-blue-300 text-xs">{user.depositTotal.toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-900 text-center border-l-2 border-r border-green-300 text-xs">{user.withdrawCount}</td>
                    <td className="px-3 py-2 text-red-600 font-semibold border-r-2 border-l border-green-300 text-xs">{user.withdrawTotal.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <span className={`font-semibold text-xs ${user.winLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {user.winLoss >= 0 ? '+' : ''}{user.winLoss.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-900 text-center border-l-2 border-r border-purple-300 text-xs">{user.bonusCount}</td>
                    <td className="px-3 py-2 text-blue-600 font-semibold border-r-2 border-l border-purple-300 text-xs">{user.bonusTotal.toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-900 text-center border-l-2 border-r border-orange-300 text-xs">{user.manualCount}</td>
                    <td className="px-3 py-2 text-orange-600 font-semibold border-r-2 border-l border-orange-300 text-xs">{user.manualTotal.toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-900 text-center border-l-2 border-r border-red-300 text-xs">{user.commissionCount}</td>
                    <td className="px-3 py-2 text-purple-600 font-semibold border-r-2 border-l border-red-300 text-xs">{user.commissionTotal.toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-900 text-xs">{user.lastDeposit}</td>
                    <td className="px-3 py-2 text-gray-900 text-xs">{user.lastLogin}</td>
                    <td className="px-3 py-2">
                      <button className="text-blue-600 hover:text-blue-800 underline text-xs">
                        {user.betHistory}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              Create Account
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Section 1: Account Information */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Account Information</h3>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <Input
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <Input
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Default Password = 000000"
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <Input
                    value={newUser.fullName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full h-10"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Referral Information */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Referral Information</h3>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code (Optional)</label>
                  <Input
                    value={newUser.referralCode}
                    onChange={(e) => handleReferralCodeChange(e.target.value)}
                    placeholder="Enter referral code (e.g., REF-USR001-A7K3)"
                    className={`w-full h-10 ${referralCodeValid ? 'border-green-500 bg-green-50' : referralCodeError ? 'border-red-500' : ''}`}
                  />
                  {referralCodeError && (
                    <p className="text-red-600 text-sm mt-1">{referralCodeError}</p>
                  )}
                  {referralCodeValid && newUser.referredBy && (
                    <p className="text-green-600 text-sm mt-1">
                      ✓ Valid code - Referred by: {getUserNameById(newUser.referredBy, users)} ({newUser.referredBy})
                    </p>
                  )}
                  {!newUser.referralCode && (
                    <p className="text-gray-500 text-sm mt-1">
                      Leave empty for direct signup
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewUser({
                    username: '',
                    password: '000000',
                    fullName: '',
                    referralCode: '',
                    referredBy: null
                  });
                  setReferralCodeError('');
                  setReferralCodeValid(false);
                }}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleCreateUser}
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
              >
                CREATE MEMBER
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="w-[1200px] h-[700px] max-w-none overflow-hidden">
          <div className="overflow-y-auto h-[calc(700px-80px)] p-1">
            {selectedUser && (
              <ProfileContent 
                user={selectedUser} 
                onUserUpdate={handleUserUpdate}
                transactions={allTransactions}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}