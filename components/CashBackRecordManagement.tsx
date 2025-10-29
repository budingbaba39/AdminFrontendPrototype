import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, Copy, RefreshCw } from 'lucide-react';
import { Textarea } from './ui/textarea';
import ProfileContent from './ProfileContent';
import { sampleUsers, User } from './UserData';
import { cashBackSetupsData } from './CashBackSetupData';
import { sampleCashBackSchedules } from './CashBackScheduleData';
import { sampleOtherTransactions, allTransactions, Transaction, getTypeColor, getStatusColor } from './transactionData';

// Filter transactions to only get CASHBACK type records
const getCashbackRecords = () => {
  return allTransactions.filter(transaction => transaction.type === 'CASHBACK');
};

const levelOptions = ['all', 'bronze', 'silver', 'gold'];

// Generate cashback options from CashBackSetupData
const cashbackOptions = [
  { value: 'all', label: 'All CashBacks' },
  ...cashBackSetupsData.map(cashback => ({
    value: cashback.name,
    label: cashback.name
  }))
];

const cashbackTypeOptions = ['all', 'By Net Lose Only', 'By Net Deposit', 'By Total WinLose Only'];

type CashbackStatus = 'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED';

export default function CashBackRecordManagement() {
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    dateFrom: '',
    dateTo: '',
    level: 'all',
    handler: '',
    cashbackName: 'all',
    cashbackType: 'all'
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [activeStatus, setActiveStatus] = useState<CashbackStatus>('ALL');
  const [transactions, setTransactions] = useState(getCashbackRecords());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<Map<string, User>>(new Map());

  // Remark modal state
  const [currentModal, setCurrentModal] = useState<'remark' | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [remarkText, setRemarkText] = useState('');

  // Bulk actions state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [autoApprove, setAutoApprove] = useState(false);
  const [releaseAmountInputs, setReleaseAmountInputs] = useState<Record<string, number>>({});
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});

  // Helper Functions
  const getUserLevel = (transaction: Transaction): string => {
    const user = sampleUsers.find(u => u.mobile === transaction.mobile || u.id === transaction.userID);
    return user?.level || 'bronze';
  };

  const getCashbackSetup = (cashbackName: string) => {
    return cashBackSetupsData.find(c => c.name === cashbackName);
  };

  const getAutoApprovedAmount = (cashbackType: string): number => {
    const schedule = sampleCashBackSchedules.find(s => s.cashbackType === cashbackType);
    return schedule?.autoApprovedAmount || 0;
  };

  const getCashbackTier = (applicableAmount: number, cashbackSetup: any): string => {
    if (!cashbackSetup || !cashbackSetup.amountTiers) return '-';

    const applicableTier = cashbackSetup.amountTiers
      .filter((tier: any) => applicableAmount >= tier.amountMoreThanOrEqual)
      .sort((a: any, b: any) => b.amountMoreThanOrEqual - a.amountMoreThanOrEqual)[0];

    if (!applicableTier) return '-';

    return `>= ${applicableTier.amountMoreThanOrEqual}`;
  };

  const getCashbackRate = (applicableAmount: number, cashbackSetup: any): number | string => {
    if (!cashbackSetup || !cashbackSetup.amountTiers) return 0;

    const applicableTier = cashbackSetup.amountTiers
      .filter((tier: any) => applicableAmount >= tier.amountMoreThanOrEqual)
      .sort((a: any, b: any) => b.amountMoreThanOrEqual - a.amountMoreThanOrEqual)[0];

    if (!applicableTier) return 0;

    return applicableTier.cashbackPercentage;
  };

  const calculateCashbackAmount = (applicableAmount: number, cashbackRate: number | string): number => {
    if (typeof cashbackRate === 'string') return 0;
    return applicableAmount * (cashbackRate / 100);
  };

  const getCashbackMaxLimit = (cashbackSetup: any): string => {
    if (!cashbackSetup) return '-';
    return cashbackSetup.maxLimit ? `$${cashbackSetup.maxLimit.toFixed(2)}` : 'Unlimited';
  };

  // Filter transactions based on search and status
  const filteredTransactions = hasSearched
    ? transactions.filter(transaction => {
        // Exclude APPROVED transactions (they are shown in ON GOING page)
        if (transaction.status === 'APPROVED') return false;

        // Status filter
        if (activeStatus !== 'ALL' && transaction.status !== activeStatus) return false;

        // CRITICAL: For PENDING status, only show transactions where cashback amount > autoApprovedAmount
        if (activeStatus === 'PENDING' && transaction.status === 'PENDING') {
          const cashbackSetup = getCashbackSetup(transaction.cashbackName || '');
          if (cashbackSetup) {
            const cashbackRate = getCashbackRate(transaction.lossAmount || 0, cashbackSetup);
            const cashbackAmount = calculateCashbackAmount(transaction.lossAmount || 0, cashbackRate);
            const autoApprovedAmount = getAutoApprovedAmount(transaction.cashbackType || '');

            // Only show if calculated cashback exceeds auto-approved threshold
            if (cashbackAmount <= autoApprovedAmount) return false;
          }
        }

        // Search filters
        if (searchFilters.username) {
          const user = sampleUsers.find(u => u.id === transaction.userID);
          const userName = user?.name || transaction.userID;
          if (!userName.toLowerCase().includes(searchFilters.username.toLowerCase()) &&
              !transaction.mobile.includes(searchFilters.username)) return false;
        }
        if (searchFilters.dateFrom && new Date(transaction.submitTime) < new Date(searchFilters.dateFrom)) return false;
        if (searchFilters.dateTo && new Date(transaction.submitTime) > new Date(searchFilters.dateTo + ' 23:59:59')) return false;
        if (searchFilters.level && searchFilters.level !== 'all') {
          const user = sampleUsers.find(u => u.mobile === transaction.mobile || u.id === transaction.userID);
          if (!user || user.level !== searchFilters.level) return false;
        }
        if (searchFilters.handler && !transaction.completeBy?.toLowerCase().includes(searchFilters.handler.toLowerCase())) return false;
        if (searchFilters.cashbackName && searchFilters.cashbackName !== 'all' && transaction.cashbackName !== searchFilters.cashbackName) return false;
        if (searchFilters.cashbackType && searchFilters.cashbackType !== 'all' && transaction.cashbackType !== searchFilters.cashbackType) return false;

        return true;
      })
      .sort((a, b) => {
        const dateA = a.completeTime || a.submitTime;
        const dateB = b.completeTime || b.submitTime;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
    : [];

  // Calculate status counts from FILTERED transactions (synchronized with displayed records)
  // Need to recalculate from raw transactions with same filters but different status
  const calculateFilteredCountByStatus = (status: CashbackStatus) => {
    const filtered = transactions.filter(transaction => {
      // Exclude APPROVED transactions (they are shown in ON GOING page)
      if (transaction.status === 'APPROVED') return false;

      // Status filter
      if (status !== 'ALL' && transaction.status !== status) return false;

      // CRITICAL: For PENDING status, only show transactions where cashback amount > autoApprovedAmount
      if (status === 'PENDING' && transaction.status === 'PENDING') {
        const cashbackSetup = getCashbackSetup(transaction.cashbackName || '');
        if (cashbackSetup) {
          const cashbackRate = getCashbackRate(transaction.lossAmount || 0, cashbackSetup);
          const cashbackAmount = calculateCashbackAmount(transaction.lossAmount || 0, cashbackRate);
          const autoApprovedAmount = getAutoApprovedAmount(transaction.cashbackTargetType || '');
          // Only show if calculated cashback exceeds auto-approved threshold
          if (cashbackAmount <= autoApprovedAmount) return false;
        }
      }

      // Search filters
      if (searchFilters.username) {
        const user = sampleUsers.find(u => u.id === transaction.userID);
        const userName = user?.name || transaction.userID;
        if (!userName.toLowerCase().includes(searchFilters.username.toLowerCase()) &&
            !transaction.mobile.includes(searchFilters.username)) return false;
      }
      if (searchFilters.dateFrom && new Date(transaction.submitTime) < new Date(searchFilters.dateFrom)) return false;
      if (searchFilters.dateTo && new Date(transaction.submitTime) > new Date(searchFilters.dateTo + ' 23:59:59')) return false;
      if (searchFilters.level && searchFilters.level !== 'all') {
        const user = sampleUsers.find(u => u.mobile === transaction.mobile || u.id === transaction.userID);
        if (!user || user.level !== searchFilters.level) return false;
      }
      if (searchFilters.handler && !transaction.completeBy?.toLowerCase().includes(searchFilters.handler.toLowerCase())) return false;
      if (searchFilters.cashbackName && searchFilters.cashbackName !== 'all' && transaction.cashbackName !== searchFilters.cashbackName) return false;
      if (searchFilters.cashbackType && searchFilters.cashbackType !== 'all' && transaction.cashbackType !== searchFilters.cashbackType) return false;

      return true;
    });

    return filtered.length;
  };

  const statusCounts = {
    ALL: calculateFilteredCountByStatus('ALL'),
    PENDING: calculateFilteredCountByStatus('PENDING'),
    COMPLETED: calculateFilteredCountByStatus('COMPLETED'),
    REJECTED: calculateFilteredCountByStatus('REJECTED'),
  };

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleReset = () => {
    setSearchFilters({
      username: '',
      dateFrom: '',
      dateTo: '',
      level: 'all',
      handler: '',
      cashbackName: 'all',
      cashbackType: 'all'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleUserNameClick = (transaction: Transaction) => {
    let user = usersData.get(transaction.userID);

    if (!user) {
      const foundUser = sampleUsers.find(
        u => u.mobile === transaction.mobile || u.id === transaction.userID
      );

      if (foundUser) {
        user = { ...foundUser, id: transaction.userID };
      } else {
        user = {
          id: transaction.userID,
          registerDate: transaction.submitTime,
          name: transaction.name || transaction.userID,
          username: transaction.userID,
          mobile: transaction.mobile,
          credit: transaction.currentCredit || 0,
          bankAccount: transaction.bankAccountNumber || '',
          bank: transaction.from || '',
          referrer_code: `REF-${transaction.userID}-XXXX`,
          referrer_by: null,
          agent: 'AGENT001',
          winLoss: 0,
          lastDeposit: transaction.submitTime,
          lastLogin: transaction.submitTime,
          betHistory: 'View',
          status: 'ACTIVE',
          ip: '192.168.1.100',
          depositCount: 0,
          depositTotal: 0,
          withdrawCount: 0,
          withdrawTotal: 0,
          bonusCount: 0,
          bonusTotal: 0,
          manualCount: transaction.type === 'MANUAL' ? 1 : 0,
          manualTotal: transaction.type === 'MANUAL' ? transaction.amount : 0,
          commissionCount: 0,
          commissionTotal: 0,
          level: 'bronze',
          tags: []
        };
      }

      setUsersData(prev => new Map(prev).set(transaction.userID, user!));
    }

    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsersData(prev => new Map(prev).set(updatedUser.id, updatedUser));
    setSelectedUser(updatedUser);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Bulk action handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allPendingIds = filteredTransactions
        .filter(t => t.status === 'PENDING')
        .map(t => t.id);
      setSelectedRows(new Set(allPendingIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (transactionId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedRows(newSelected);
  };

  const handleReleaseAmountChange = (transactionId: string, value: string) => {
    if (value === '') {
      const newInputs = { ...releaseAmountInputs };
      delete newInputs[transactionId];
      setReleaseAmountInputs(newInputs);
    } else {
      const numValue = parseFloat(value);
      setReleaseAmountInputs(prev => ({ ...prev, [transactionId]: numValue }));
    }
  };

  const handleRemarkChange = (transactionId: string, value: string) => {
    setRemarkInputs(prev => ({ ...prev, [transactionId]: value }));
  };

  const handleSubmitSingle = (transaction: Transaction) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const remark = remarkInputs[transaction.id] || '';

    // Check if this is a combined transaction
    const isCombined = transaction.id.includes('_combined');
    const idsToUpdate = isCombined && (transaction as any).originalIds
      ? (transaction as any).originalIds
      : [transaction.id];

    setTransactions(prev => prev.map(t =>
      idsToUpdate.includes(t.id)
        ? {
            ...t,
            status: 'COMPLETED' as const,
            completeTime: currentTime,
            completeBy: 'ADMIN001',
            remark: remark
          }
        : t
    ));

    const newRemarkInputs = { ...remarkInputs };
    delete newRemarkInputs[transaction.id];
    setRemarkInputs(newRemarkInputs);
  };

  const handleCancelSingle = (transaction: Transaction) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const remark = remarkInputs[transaction.id] || 'Cancelled by admin';

    // Check if this is a combined transaction
    const isCombined = transaction.id.includes('_combined');
    const idsToUpdate = isCombined && (transaction as any).originalIds
      ? (transaction as any).originalIds
      : [transaction.id];

    setTransactions(prev => prev.map(t =>
      idsToUpdate.includes(t.id)
        ? {
            ...t,
            status: 'REJECTED' as const,
            completeTime: currentTime,
            completeBy: 'ADMIN001',
            remark: remark
          }
        : t
    ));

    const newRemarkInputs = { ...remarkInputs };
    delete newRemarkInputs[transaction.id];
    setRemarkInputs(newRemarkInputs);
  };

  const handleCompleteSingle = (transaction: Transaction) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Calculate cashback amount from data
    const cashbackAmount = calculateCashbackAmount(
      transaction.lossAmount || 0,
      getCashbackRate(transaction.lossAmount || 0, getCashbackSetup(transaction.cashbackName || ''))
    );

    // If release amount input exists, use it; otherwise default to cashback amount
    const releaseAmount = transaction.id in releaseAmountInputs ? releaseAmountInputs[transaction.id] : cashbackAmount;

    setTransactions(prev => prev.map(t =>
      t.id === transaction.id
        ? {
            ...t,
            status: 'COMPLETED' as const,
            amount: releaseAmount,
            completeTime: currentTime,
            completeBy: 'ADMIN001',
            remark: 'Cashback released'
          }
        : t
    ));

    const newReleaseInputs = { ...releaseAmountInputs };
    delete newReleaseInputs[transaction.id];
    setReleaseAmountInputs(newReleaseInputs);
  };

  const handleUnlock = (transaction: Transaction) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Check if this is a combined transaction
    const isCombined = transaction.id.includes('_combined');
    const idsToUpdate = isCombined && (transaction as any).originalIds
      ? (transaction as any).originalIds
      : [transaction.id];

    setTransactions(prev => prev.map(t =>
      idsToUpdate.includes(t.id)
        ? {
            ...t,
            status: 'COMPLETED' as const,
            completeTime: currentTime,
            completeBy: 'CS001',
            cashbackCurrent: t.cashbackTarget,
            remark: 'Cashback target achieved - Unlocked'
          }
        : t
    ));
  };

  const handleCancelApproved = (transaction: Transaction) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Check if this is a combined transaction
    const isCombined = transaction.id.includes('_combined');
    const idsToUpdate = isCombined && (transaction as any).originalIds
      ? (transaction as any).originalIds
      : [transaction.id];

    setTransactions(prev => prev.map(t =>
      idsToUpdate.includes(t.id)
        ? {
            ...t,
            status: 'REJECTED' as const,
            rejectTime: currentTime,
            rejectBy: 'CS001',
            remark: 'Cashback cancelled'
          }
        : t
    ));
  };

  const handleSubmitAll = () => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setTransactions(prev => prev.map(t => {
      if (selectedRows.has(t.id)) {
        // Calculate cashback amount from data
        const cashbackAmount = calculateCashbackAmount(
          t.lossAmount || 0,
          getCashbackRate(t.lossAmount || 0, getCashbackSetup(t.cashbackName || ''))
        );
        // If release amount input exists, use it; otherwise default to cashback amount
        const releaseAmount = t.id in releaseAmountInputs ? releaseAmountInputs[t.id] : cashbackAmount;
        const remark = remarkInputs[t.id] || '';

        return {
          ...t,
          status: 'COMPLETED' as const,
          amount: releaseAmount,
          completeTime: currentTime,
          completeBy: 'ADMIN001',
          remark: remark
        };
      }
      return t;
    }));

    setSelectedRows(new Set());
    setReleaseAmountInputs({});
    setRemarkInputs({});
  };

  const pendingCount = statusCounts.PENDING;

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">CashBack Record Search & Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <Input
            placeholder="Username / Mobile No"
            value={searchFilters.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="h-9"
          />

          <Input
            type="date"
            placeholder="Date From (Submit Time)"
            value={searchFilters.dateFrom}
            onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            className="h-9"
          />

          <Input
            type="date"
            placeholder="Date To (Submit Time)"
            value={searchFilters.dateTo}
            onChange={(e) => handleInputChange('dateTo', e.target.value)}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <Select value={searchFilters.level} onValueChange={(value) => handleInputChange('level', value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {levelOptions.map(level => (
                <SelectItem key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Handler"
            value={searchFilters.handler}
            onChange={(e) => handleInputChange('handler', e.target.value)}
            className="h-9"
          />

          <Select value={searchFilters.cashbackType} onValueChange={(value) => handleInputChange('cashbackType', value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="CashBack Type" />
            </SelectTrigger>
            <SelectContent>
              {cashbackTypeOptions.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleSearch}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6"
          >
            SEARCH
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3 mb-3 mt-3">
            <Select value={searchFilters.cashbackName} onValueChange={(value) => handleInputChange('cashbackName', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="CashBack Name" />
              </SelectTrigger>
              <SelectContent>
                {cashbackOptions.map(cashback => (
                  <SelectItem key={cashback.value} value={cashback.value}>
                    {cashback.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="border-t pt-3 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-6 items-center">
              <span className="text-sm text-gray-600">
                Record: <span className="font-semibold text-gray-900">{filteredTransactions.length}</span>
              </span>
              <span className="text-sm text-gray-600">
                Total: <span className="font-semibold text-gray-900">${totalAmount.toFixed(2)}</span>
              </span>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="text-sm text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400 h-8 px-3"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                RESET
              </Button>
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-[#3949ab] hover:text-[#2c3582] underline font-medium flex items-center gap-1"
            >
              ADVANCED
              {showAdvancedFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter Bar */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="relative">
            <div className="flex bg-gray-100 rounded-lg p-1 relative">
              <div
                className="absolute top-1 bottom-1 bg-[#3949ab] rounded-md transition-all duration-300 ease-in-out shadow-sm"
                style={{
                  width: `calc(${100 / 4}% - 0.25rem)`,
                  left: `calc(${(['ALL', 'PENDING', 'COMPLETED', 'REJECTED'].indexOf(activeStatus) * 100) / 4}% + 0.125rem)`,
                }}
              />
              {(['ALL', 'PENDING', 'COMPLETED', 'REJECTED'] as CashbackStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 relative z-10 ${
                    activeStatus === status
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

      {/* Bulk Actions for PENDING Tab */}
      {hasSearched && activeStatus === 'PENDING' && pendingCount > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                />
                <span className="text-sm font-medium text-gray-700">Auto Approve</span>
              </label>

              <span className="text-sm text-gray-600">
                Selected: <span className="font-semibold">{selectedRows.size}</span> / {pendingCount}
              </span>
            </div>

            <Button
              onClick={handleSubmitAll}
              disabled={selectedRows.size === 0}
              className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              SUBMIT ALL ({selectedRows.size})
            </Button>
          </div>
        </div>
      )}

      {/* CashBack Record List */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {activeStatus === 'PENDING' && (
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 uppercase">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === pendingCount && pendingCount > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                      />
                    </th>
                  )}
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Username</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Level</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Tier</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Rate (%)</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Max Limit</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Handler</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Submit Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Completed Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Loss Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Release Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Remark</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredTransactions.map((transaction) => {
                  const userLevel = getUserLevel(transaction);
                  const cashbackSetup = getCashbackSetup(transaction.cashbackName || '');
                  const cashbackTier = getCashbackTier(transaction.lossAmount || 0, cashbackSetup);
                  const cashbackRate = getCashbackRate(transaction.lossAmount || 0, cashbackSetup);
                  const cashbackAmount = calculateCashbackAmount(transaction.lossAmount || 0, cashbackRate);
                  const maxLimit = getCashbackMaxLimit(cashbackSetup);

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      {activeStatus === 'PENDING' && (
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(transaction.id)}
                            onChange={(e) => handleRowSelect(transaction.id, e.target.checked)}
                            className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                          />
                        </td>
                      )}
                      <td className="px-3 py-2">
                        <span
                          className="text-gray-900 font-medium cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => handleUserNameClick(transaction)}
                        >
                          {sampleUsers.find(u => u.id === transaction.userID)?.name || transaction.userID}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Badge className={`text-xs font-semibold px-2 py-0.5 ${
                          userLevel === 'gold' ? 'bg-yellow-500 text-white' :
                          userLevel === 'silver' ? 'bg-gray-400 text-white' :
                          'bg-amber-700 text-white'
                        }`}>
                          {userLevel.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.cashbackName || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.cashbackType || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{cashbackTier}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">
                        {typeof cashbackRate === 'string' ? cashbackRate : `${cashbackRate}%`}
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{maxLimit}</td>
                      <td className="px-3 py-2 text-blue-600 text-xs">{transaction.completeBy || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.submitTime}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.completeTime || '-'}</td>
                      <td className="px-3 py-2 text-red-600 font-semibold text-xs">
                        ${(transaction.lossAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-green-600 font-semibold text-xs">
                        ${cashbackAmount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        {transaction.status === 'PENDING' ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={releaseAmountInputs[transaction.id] || ''}
                            onChange={(e) => handleReleaseAmountChange(transaction.id, e.target.value)}
                            className="h-7 w-28 text-xs"
                          />
                        ) : (
                          <span className="text-green-600 font-semibold text-xs">
                            ${transaction.amount.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {transaction.status === 'PENDING' ? (
                          <Input
                            type="text"
                            value={remarkInputs[transaction.id] || transaction.remark || ''}
                            onChange={(e) => setRemarkInputs({ ...remarkInputs, [transaction.id]: e.target.value })}
                            className="h-7 w-28 text-xs"
                          />
                        ) : (
                          <span className="text-gray-900 text-xs max-w-40 truncate block" title={transaction.remark}>
                            {transaction.remark || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Badge className={`${getStatusColor(transaction.status)} text-xs font-semibold px-2 py-1`}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {transaction.status === 'PENDING' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSubmitSingle(transaction)}
                                className="bg-[#4caf50] text-white hover:bg-[#45a049] border-[#4caf50] text-xs h-6 px-2"
                              >
                                SUBMIT
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelSingle(transaction)}
                                className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] text-xs h-6 px-2"
                              >
                                CANCEL
                              </Button>
                            </>
                          ) : transaction.status === 'APPROVED' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnlock(transaction)}
                                className="bg-[#4caf50] text-white hover:bg-[#45a049] border-[#4caf50] text-xs h-6 px-2"
                              >
                                UNLOCK
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelApproved(transaction)}
                                className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] text-xs h-6 px-2"
                              >
                                CANCEL
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setRemarkText(transaction.remark || '');
                                setCurrentModal('remark');
                              }}
                              className="bg-[#3949ab] text-white hover:bg-[#2c3582] border-[#3949ab] text-xs h-6 px-2"
                            >
                              REMARK
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Remark Modal */}
      <Dialog open={currentModal === 'remark'} onOpenChange={(open) => !open && setCurrentModal(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Remark</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Transaction ID:</span>
                  <p className="text-gray-600">{selectedTransaction.id}</p>
                </div>
                <div>
                  <span className="font-semibold">Username:</span>
                  <p className="text-gray-600">{selectedTransaction.userID}</p>
                </div>
                <div>
                  <span className="font-semibold">Amount:</span>
                  <p className="text-gray-600">${selectedTransaction.amount.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Remark:</label>
                <Textarea
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  rows={4}
                  className="w-full h-10 min-h-[80px]"
                  placeholder="Enter remark..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setCurrentModal(null)}
                  className="text-xs h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setTransactions(prev => prev.map(t =>
                      t.id === selectedTransaction.id ? { ...t, remark: remarkText } : t
                    ));
                    setCurrentModal(null);
                  }}
                  className="bg-[#4caf50] hover:bg-[#45a049] text-white text-xs h-10"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
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
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}