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
import { sampleCommissionSetups } from './CommissionSetupData';
import { sampleCommissionSchedules } from './CommissionScheduleData';
import { sampleOtherTransactions, allTransactions, Transaction, getTypeColor, getStatusColor } from './transactionData';

// Filter transactions to only get COMMISSION type records
const getCommissionRecords = () => {
  return allTransactions.filter(transaction => transaction.type === 'COMMISSION');
};

const levelOptions = ['all', 'bronze', 'silver', 'gold'];

// Generate commission options from CommissionSetupData
const commissionOptions = [
  { value: 'all', label: 'All Commissions' },
  ...sampleCommissionSetups.map(commission => ({
    value: commission.name,
    label: commission.name
  }))
];

const commissionTargetTypeOptions = ['all', 'Deposit - Withdraw', 'Deposit - Withdraw - Rebate - Bonus', 'Valid Bet'];

type CommissionStatus = 'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED';

export default function CommissionRecordManagement() {
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    dateFrom: '',
    dateTo: '',
    level: 'all',
    handler: '',
    commissionName: 'all',
    commissionTargetType: 'all'
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [activeStatus, setActiveStatus] = useState<CommissionStatus>('ALL');
  const [transactions, setTransactions] = useState(getCommissionRecords());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<Map<string, User>>(new Map());

  // Bulk actions state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [autoApprove, setAutoApprove] = useState(false);
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});

  // Modal state
  const [currentModal, setCurrentModal] = useState<'remark' | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [remarkText, setRemarkText] = useState('');

  // Helper Functions
  const getUserLevel = (transaction: Transaction): string => {
    const user = sampleUsers.find(u => u.mobile === transaction.mobile || u.id === transaction.username);
    return user?.level || 'bronze';
  };

  const getAutoApprovedAmount = (commissionTargetType: string): number => {
    const schedule = sampleCommissionSchedules.find(s => s.commissionTargetType === commissionTargetType);
    return schedule?.autoApprovedAmount || 0;
  };

  const getCommissionTargetTypeBadgeColor = (targetType: string): string => {
    switch (targetType) {
      case 'Deposit - Withdraw':
        return 'bg-blue-100 text-blue-700';
      case 'Deposit - Withdraw - Rebate - Bonus':
        return 'bg-purple-100 text-purple-700';
      case 'Valid Bet':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter transactions based on search and status
  const filteredTransactions = hasSearched
    ? transactions.filter(transaction => {
        // Status filter
        if (activeStatus !== 'ALL' && transaction.status !== activeStatus) return false;

        // CRITICAL: For PENDING status, only show transactions where commission amount > autoApprovedAmount
        if (activeStatus === 'PENDING' && transaction.status === 'PENDING') {
          const autoApprovedAmount = getAutoApprovedAmount(transaction.commissionTargetType || '');
          // Only show if commission amount exceeds auto-approved threshold
          if (transaction.amount <= autoApprovedAmount) return false;
        }

        // Search filters
        if (searchFilters.username) {
          const user = sampleUsers.find(u => u.id === transaction.username);
          const userName = user?.name || transaction.username;
          if (!userName.toLowerCase().includes(searchFilters.username.toLowerCase()) &&
              !transaction.mobile.includes(searchFilters.username)) return false;
        }
        if (searchFilters.dateFrom && new Date(transaction.completeTime || transaction.submitTime) < new Date(searchFilters.dateFrom)) return false;
        if (searchFilters.dateTo && new Date(transaction.completeTime || transaction.submitTime) > new Date(searchFilters.dateTo + ' 23:59:59')) return false;
        if (searchFilters.level && searchFilters.level !== 'all') {
          const user = sampleUsers.find(u => u.mobile === transaction.mobile || u.id === transaction.username);
          if (!user || user.level !== searchFilters.level) return false;
        }
        if (searchFilters.handler && !transaction.completeBy?.toLowerCase().includes(searchFilters.handler.toLowerCase())) return false;
        if (searchFilters.commissionName && searchFilters.commissionName !== 'all' && transaction.commissionName !== searchFilters.commissionName) return false;
        if (searchFilters.commissionTargetType && searchFilters.commissionTargetType !== 'all' && transaction.commissionTargetType !== searchFilters.commissionTargetType) return false;

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
      const autoApprovedAmount = getAutoApprovedAmount(t.commissionTargetType || '');
      return t.amount > autoApprovedAmount;
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
      commissionName: 'all',
      commissionTargetType: 'all'
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
          username: transaction.username,
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

  const handleRemarkChange = (transactionId: string, value: string) => {
    setRemarkInputs(prev => ({ ...prev, [transactionId]: value }));
  };

  const handleSubmitSingle = (transaction: Transaction) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const remark = remarkInputs[transaction.id] || '';

    setTransactions(prev => prev.map(t =>
      t.id === transaction.id
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

    const newRemarkInputs = { ...remarkInputs };
    delete newRemarkInputs[transaction.id];
    setRemarkInputs(newRemarkInputs);
  };

  const handleSubmitAll = () => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setTransactions(prev => prev.map(t => {
      if (selectedRows.has(t.id)) {
        const remark = remarkInputs[t.id] || '';

        return {
          ...t,
          status: 'COMPLETED' as const,
          completeTime: currentTime,
          completeBy: 'ADMIN001',
          remark: remark
        };
      }
      return t;
    }));

    setSelectedRows(new Set());
    setRemarkInputs({});
    setActiveStatus('COMPLETED');
  };

  const pendingCount = statusCounts.PENDING;

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Commission Record Search & Filter</h2>
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

          <Select value={searchFilters.commissionTargetType} onValueChange={(value) => handleInputChange('commissionTargetType', value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Commission Target Type" />
            </SelectTrigger>
            <SelectContent>
              {commissionTargetTypeOptions.map(type => (
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
            <Select value={searchFilters.commissionName} onValueChange={(value) => handleInputChange('commissionName', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Commission Name" />
              </SelectTrigger>
              <SelectContent>
                {commissionOptions.map(commission => (
                  <SelectItem key={commission.value} value={commission.value}>
                    {commission.label}
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
              {(['ALL', 'PENDING', 'COMPLETED', 'REJECTED'] as CommissionStatus[]).map((status) => (
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

      {/* Commission Record List */}
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
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Commission Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Commission Target Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Commission Percentage</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Commission Max Withdrawal Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Handler</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Submit Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Completed Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Remark</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredTransactions.map((transaction) => {
                  const userLevel = getUserLevel(transaction);

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
                          {sampleUsers.find(u => u.id === transaction.username)?.name || transaction.username}
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
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.commissionName || '-'}</td>
                      <td className="px-3 py-2">
                        <Badge className={`text-xs font-semibold px-2 py-0.5 ${
                          getCommissionTargetTypeBadgeColor(transaction.commissionTargetType || '')
                        }`}>
                          {transaction.commissionTargetType || '-'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">
                        {transaction.commissionPercentage ? `${transaction.commissionPercentage}%` : '-'}
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">
                        {transaction.commissionMaxWithdrawalAmount
                          ? `$${transaction.commissionMaxWithdrawalAmount.toFixed(2)}`
                          : '-'}
                      </td>
                      <td className="px-3 py-2 text-blue-600 text-xs">{transaction.completeBy || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.submitTime}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.completeTime || '-'}</td>
                      <td className="px-3 py-2">
                        <span className="text-green-600 font-semibold text-xs">
                          ${transaction.amount.toFixed(2)}
                        </span>
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
      <Dialog open={currentModal === 'remark'} onOpenChange={() => setCurrentModal(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Remark</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 pt-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><strong>Transaction ID:</strong> {selectedTransaction.id}</div>
                <div><strong>Username:</strong> {selectedTransaction.username}</div>
                <div><strong>Amount:</strong> ${selectedTransaction.amount.toFixed(2)}</div>
              </div>
              <Textarea
                placeholder="Add a remark"
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                className="w-full h-10 min-h-[80px]"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setTransactions(prev => prev.map(t =>
                      t.id === selectedTransaction.id
                        ? { ...t, remark: remarkText }
                        : t
                    ));
                    setCurrentModal(null);
                    setSelectedTransaction(null);
                  }}
                  className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white h-10"
                >
                  SAVE
                </Button>
                <Button
                  onClick={() => setCurrentModal(null)}
                  variant="outline"
                  className="flex-1 h-10"
                >
                  CANCEL
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
