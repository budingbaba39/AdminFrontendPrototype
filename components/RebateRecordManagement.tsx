import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, Copy, RefreshCw } from 'lucide-react';
import { Textarea } from './ui/textarea';
import ProfileContent from './ProfileContent';
import { sampleOtherTransactions, Transaction, getTypeColor, getStatusColor } from './transactionData';
import { sampleUsers, User } from './UserData';
import { rebateSetupsData } from './RebateSetupData';
import { sampleRebateSchedules } from './RebateScheduleData';

// Filter transactions to only get REBATE type records
const getRebateRecords = () => {
  return sampleOtherTransactions.filter(transaction => transaction.type === 'REBATE');
};

const levelOptions = ['all', 'bronze', 'silver', 'gold'];

// Generate rebate options from RebateSetupData
const rebateOptions = [
  { value: 'all', label: 'All Rebates' },
  ...rebateSetupsData.map(rebate => ({
    value: rebate.name,
    label: rebate.name
  }))
];

type RebateStatus = 'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED';

export default function RebateRecordManagement() {
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    dateFrom: '',
    dateTo: '',
    level: 'all',
    handler: '',
    rebateName: 'all'
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [activeStatus, setActiveStatus] = useState<RebateStatus>('ALL');
  const [transactions, setTransactions] = useState(getRebateRecords());
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
  const [givenRebateInputs, setGivenRebateInputs] = useState<Record<string, number>>({});
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});

  // Helper Functions
  const getUserLevel = (transaction: Transaction): string => {
    const user = sampleUsers.find(u => u.mobile === transaction.mobile || u.id === transaction.username);
    return user?.level || 'bronze';
  };

  const getRebateSetup = (rebateName: string) => {
    return rebateSetupsData.find(r => r.name === rebateName);
  };

  const getAutoApprovedAmount = (rebateType: string): number => {
    const schedule = sampleRebateSchedules.find(s => s.rebateType === rebateType);
    return schedule?.autoApprovedAmount || 0;
  };

  const getRebateTier = (validBetAmount: number, rebateSetup: any): string => {
    if (!rebateSetup || !rebateSetup.amountTiers) return '-';

    const applicableTier = rebateSetup.amountTiers
      .filter((tier: any) => validBetAmount >= tier.validBetMoreThan)
      .sort((a: any, b: any) => b.validBetMoreThan - a.validBetMoreThan)[0];

    if (!applicableTier) return '-';

    return `>= ${applicableTier.validBetMoreThan}`;
  };

  const getRebateRate = (validBetAmount: number, rebateSetup: any): number | string => {
    if (!rebateSetup || !rebateSetup.amountTiers) return 0;

    const applicableTier = rebateSetup.amountTiers
      .filter((tier: any) => validBetAmount >= tier.validBetMoreThan)
      .sort((a: any, b: any) => b.validBetMoreThan - a.validBetMoreThan)[0];

    if (!applicableTier) return 0;

    return applicableTier.rebatePercentage;
  };

  const calculateRebateAmount = (validBetAmount: number, rebateRate: number | string): number => {
    if (typeof rebateRate === 'string') return 0;
    return validBetAmount * (rebateRate / 100);
  };

  const getRebateMaxLimit = (rebateSetup: any): string => {
    if (!rebateSetup) return '-';
    return rebateSetup.maxLimit ? `$${rebateSetup.maxLimit.toFixed(2)}` : 'Unlimited';
  };

  // Filter transactions based on search and status
  const filteredTransactions = hasSearched
    ? transactions.filter(transaction => {
        // Status filter
        if (activeStatus !== 'ALL' && transaction.status !== activeStatus) return false;

        // CRITICAL: For PENDING status, only show transactions where rebate amount > autoApprovedAmount
        if (activeStatus === 'PENDING' && transaction.status === 'PENDING') {
          const rebateSetup = getRebateSetup(transaction.rebateName || '');
          if (rebateSetup) {
            const rebateRate = getRebateRate(transaction.lossAmount || 0, rebateSetup);
            const rebateAmount = calculateRebateAmount(transaction.lossAmount || 0, rebateRate);
            const autoApprovedAmount = getAutoApprovedAmount(transaction.rebateType || '');

            // Only show if calculated rebate exceeds auto-approved threshold
            if (rebateAmount <= autoApprovedAmount) return false;
          }
        }

        // Search filters
        if (searchFilters.username && !transaction.username.toLowerCase().includes(searchFilters.username.toLowerCase()) &&
            !transaction.mobile.includes(searchFilters.username)) return false;
        if (searchFilters.dateFrom && new Date(transaction.completeTime || transaction.submitTime) < new Date(searchFilters.dateFrom)) return false;
        if (searchFilters.dateTo && new Date(transaction.completeTime || transaction.submitTime) > new Date(searchFilters.dateTo + ' 23:59:59')) return false;
        if (searchFilters.level && searchFilters.level !== 'all') {
          const user = sampleUsers.find(u => u.mobile === transaction.mobile || u.id === transaction.username);
          if (!user || user.level !== searchFilters.level) return false;
        }
        if (searchFilters.handler && !transaction.completeBy?.toLowerCase().includes(searchFilters.handler.toLowerCase())) return false;
        if (searchFilters.rebateName && searchFilters.rebateName !== 'all' && transaction.rebateName !== searchFilters.rebateName) return false;

        return true;
      })
      .sort((a, b) => {
        const dateA = a.completeTime || a.submitTime;
        const dateB = b.completeTime || b.submitTime;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
    : [];

  // Calculate status counts (PENDING count only includes those > autoApprovedAmount)
  const statusCounts = {
    ALL: transactions.length,
    PENDING: transactions.filter(t => {
      if (t.status !== 'PENDING') return false;
      const rebateSetup = getRebateSetup(t.rebateName || '');
      if (rebateSetup) {
        const rebateRate = getRebateRate(t.lossAmount || 0, rebateSetup);
        const rebateAmount = calculateRebateAmount(t.lossAmount || 0, rebateRate);
        const autoApprovedAmount = getAutoApprovedAmount(t.rebateType || '');
        return rebateAmount > autoApprovedAmount;
      }
      return true;
    }).length,
    COMPLETED: transactions.filter(t => t.status === 'COMPLETED').length,
    REJECTED: transactions.filter(t => t.status === 'REJECTED').length,
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
      rebateName: 'all'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleUserNameClick = (transaction: Transaction) => {
    let user = usersData.get(transaction.username);

    if (!user) {
      const foundUser = sampleUsers.find(
        u => u.mobile === transaction.mobile || u.id === transaction.username
      );

      if (foundUser) {
        user = { ...foundUser, id: transaction.username };
      } else {
        user = {
          id: transaction.username,
          registerDate: transaction.submitTime,
          name: transaction.name || transaction.username,
          mobile: transaction.mobile,
          credit: transaction.currentCredit || 0,
          bankAccount: transaction.bankAccountNumber || '',
          bank: transaction.from || '',
          referrer_code: `REF-${transaction.username}-XXXX`,
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

      setUsersData(prev => new Map(prev).set(transaction.username, user!));
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

  const handleGivenRebateChange = (transactionId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setGivenRebateInputs(prev => ({ ...prev, [transactionId]: numValue }));
  };

  const handleRemarkChange = (transactionId: string, value: string) => {
    setRemarkInputs(prev => ({ ...prev, [transactionId]: value }));
  };

  const handleSubmitSingle = (transaction: Transaction) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const releaseAmount = givenRebateInputs[transaction.id] !== undefined
      ? givenRebateInputs[transaction.id]
      : calculateRebateAmount(
          transaction.lossAmount || 0,
          getRebateRate(transaction.lossAmount || 0, getRebateSetup(transaction.rebateName || ''))
        );

    const remark = remarkInputs[transaction.id] || '';

    setTransactions(prev => prev.map(t =>
      t.id === transaction.id
        ? {
            ...t,
            status: 'COMPLETED' as const,
            amount: releaseAmount,
            completeTime: currentTime,
            completeBy: 'ADMIN001',
            remark: remark
          }
        : t
    ));

    const newGivenInputs = { ...givenRebateInputs };
    const newRemarkInputs = { ...remarkInputs };
    delete newGivenInputs[transaction.id];
    delete newRemarkInputs[transaction.id];
    setGivenRebateInputs(newGivenInputs);
    setRemarkInputs(newRemarkInputs);
  };

  const handleCancelSingle = (transaction: Transaction) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const remark = remarkInputs[transaction.id] || 'Cancelled by admin';

    setTransactions(prev => prev.map(t =>
      t.id === transaction.id
        ? {
            ...t,
            status: 'REJECTED' as const,
            completeTime: currentTime,
            completeBy: 'ADMIN001',
            remark: remark
          }
        : t
    ));

    const newGivenInputs = { ...givenRebateInputs };
    const newRemarkInputs = { ...remarkInputs };
    delete newGivenInputs[transaction.id];
    delete newRemarkInputs[transaction.id];
    setGivenRebateInputs(newGivenInputs);
    setRemarkInputs(newRemarkInputs);
  };

  const handleSubmitAll = () => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setTransactions(prev => prev.map(t => {
      if (selectedRows.has(t.id)) {
        const releaseAmount = givenRebateInputs[t.id] !== undefined
          ? givenRebateInputs[t.id]
          : calculateRebateAmount(
              t.lossAmount || 0,
              getRebateRate(t.lossAmount || 0, getRebateSetup(t.rebateName || ''))
            );

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
    setGivenRebateInputs({});
    setRemarkInputs({});
    setActiveStatus('COMPLETED');
  };

  const pendingCount = statusCounts.PENDING;

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Rebate Record Search & Filter</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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

          <Button
            onClick={handleSearch}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6"
          >
            SEARCH
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mb-3 mt-3">
            <Select value={searchFilters.rebateName} onValueChange={(value) => handleInputChange('rebateName', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Rebate Name" />
              </SelectTrigger>
              <SelectContent>
                {rebateOptions.map(rebate => (
                  <SelectItem key={rebate.value} value={rebate.value}>
                    {rebate.label}
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
              {(['ALL', 'PENDING', 'COMPLETED', 'REJECTED'] as RebateStatus[]).map((status) => (
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

      {/* Rebate Record List */}
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
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Tier</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Rate (%)</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Max Limit</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Handler</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Submit Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Completed Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Loss Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Release Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Remark</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredTransactions.map((transaction) => {
                  const userLevel = getUserLevel(transaction);
                  const rebateSetup = getRebateSetup(transaction.rebateName || '');
                  const rebateTier = getRebateTier(transaction.lossAmount || 0, rebateSetup);
                  const rebateRate = getRebateRate(transaction.lossAmount || 0, rebateSetup);
                  const rebateAmount = calculateRebateAmount(transaction.lossAmount || 0, rebateRate);
                  const maxLimit = getRebateMaxLimit(rebateSetup);

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
                          {transaction.username}
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
                      <td className="px-3 py-2 text-gray-900 text-xs">{rebateTier}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">
                        {typeof rebateRate === 'string' ? rebateRate : `${rebateRate}%`}
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{maxLimit}</td>
                      <td className="px-3 py-2 text-blue-600 text-xs">{transaction.completeBy || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.submitTime}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.completeTime || '-'}</td>
                      <td className="px-3 py-2 text-red-600 font-semibold text-xs">
                        ${(transaction.lossAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-green-600 font-semibold text-xs">
                        ${rebateAmount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        {activeStatus === 'PENDING' ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={givenRebateInputs[transaction.id] || ''}
                            onChange={(e) => handleGivenRebateChange(transaction.id, e.target.value)}
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
                  <p className="text-gray-600">{selectedTransaction.username}</p>
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