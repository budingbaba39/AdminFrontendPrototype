import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent } from './ui/dialog';
import { Badge } from './ui/badge';
import { RefreshCw } from 'lucide-react';
import ProfileContent from './ProfileContent';
import { sampleUsers, User } from './UserData';
import { sampleCommissionSetups } from './CommissionSetupData';
import { sampleCommissionSchedules } from './CommissionScheduleData';
import { sampleCommissionTransactions, Transaction } from './transactionData';

// Filter transactions to only get COMMISSION type records with PENDING status
const getPendingCommissionRecords = () => {
  return sampleCommissionTransactions.filter(transaction =>
    transaction.type === 'COMMISSION' && transaction.status === 'PENDING'
  );
};

export default function CommissionReleaseManagement() {
  const [searchFilters, setSearchFilters] = useState({
    dateFrom: '',
    dateTo: '',
    setupName: 'all'
  });

  const [hasGenerated, setHasGenerated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<Map<string, User>>(new Map());

  // Bulk actions state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [autoApprove, setAutoApprove] = useState(false);
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});

  // Helper Functions
  const getUserLevel = (transaction: Transaction): string => {
    const user = sampleUsers.find(u => u.mobile === transaction.mobile || u.id === transaction.userID);
    return user?.level || 'bronze';
  };

  const getCommissionSetup = (commissionName: string) => {
    return sampleCommissionSetups.find(c => c.name === commissionName);
  };

  const getCommissionSchedule = (commissionTargetType: string) => {
    return sampleCommissionSchedules.find(s => s.commissionTargetType === commissionTargetType);
  };

  // Helper function to group transactions by user and target type for Period feature
  const groupTransactionsByPeriod = (transactions: Transaction[]) => {
    // Only group if BOTH dateFrom AND dateTo are selected
    if (!searchFilters.dateFrom || !searchFilters.dateTo) {
      return transactions; // No date range selected, return as-is
    }

    // Group by userID + targetType ONLY (remove date from grouping to allow multi-day combination)
    const grouped = transactions.reduce((acc, transaction) => {
      const targetType = transaction.commissionTargetType || 'Unknown';
      const userID = transaction.userID;

      // Create unique key: userID_targetType (NO DATE)
      const key = `${userID}_${targetType}`;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);

    // Combine transactions in each group (across multiple days)
    const combinedTransactions = Object.values(grouped).map(group => {
      // Sum all amounts across all days
      const totalAmount = group.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalCommissionAmount = group.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
      const totalDepositAmount = group.reduce((sum, t) => sum + (t.depositAmount || 0), 0);
      const totalWithdrawAmount = group.reduce((sum, t) => sum + (t.withdrawAmount || 0), 0);
      const totalValidBetAmount = group.reduce((sum, t) => sum + (t.validBetAmount || 0), 0);

      // Find earliest and latest dates
      const dates = group.map(t => t.submitTime.split(' ')[0]);
      const uniqueDates = [...new Set(dates)].sort();
      const earliestDate = uniqueDates[0];
      const latestDate = uniqueDates[uniqueDates.length - 1];

      // Find earliest and latest submit times
      const times = group.map(t => new Date(t.submitTime));
      const earliestTime = new Date(Math.min(...times.map(t => t.getTime())));
      const latestTime = new Date(Math.max(...times.map(t => t.getTime())));

      // Use earliest transaction as base
      const earliestTransaction = group.reduce((earliest, current) => {
        return new Date(current.submitTime) < new Date(earliest.submitTime)
          ? current
          : earliest;
      });

      // Format submit time display
      const formatDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      // Display format based on whether it spans multiple days
      let submitTimeDisplay;
      if (group.length > 1 && earliestDate !== latestDate) {
        submitTimeDisplay = `${formatDateTime(earliestTime)} - ${formatDateTime(latestTime)}`;
      } else if (group.length > 1 && earliestDate === latestDate) {
        submitTimeDisplay = `${formatDateTime(earliestTime)} - ${formatDateTime(latestTime)}`;
      } else {
        submitTimeDisplay = earliestTransaction.submitTime;
      }

      // Return combined transaction
      return {
        ...earliestTransaction,
        amount: totalAmount,
        commissionAmount: totalCommissionAmount,
        depositAmount: totalDepositAmount,
        withdrawAmount: totalWithdrawAmount,
        validBetAmount: totalValidBetAmount,
        id: `${earliestTransaction.id}_combined_${group.length}`,
        submitTime: submitTimeDisplay,
        remark: '',
        originalIds: group.map(t => t.id),
        combinedCount: group.length,
        dateRange: earliestDate !== latestDate ? `${earliestDate} to ${latestDate}` : earliestDate
      };
    });

    return combinedTransactions;
  };

  // Filter transactions based on search filters and auto-approved amount
  const baseFilteredTransactions = transactions.filter(transaction => {
    // Only show PENDING transactions
    if (transaction.status !== 'PENDING') return false;

    // Date filters (by submitTime)
    if (searchFilters.dateFrom && new Date(transaction.submitTime) < new Date(searchFilters.dateFrom)) return false;
    if (searchFilters.dateTo && new Date(transaction.submitTime) > new Date(searchFilters.dateTo + ' 23:59:59')) return false;
    if (searchFilters.setupName && searchFilters.setupName !== 'all' && transaction.commissionName !== searchFilters.setupName) return false;

    // Only show transactions where amount > autoApprovedAmount
    const schedule = sampleCommissionSchedules.find(s => s.setupName === transaction.commissionName);
    if (schedule && transaction.amount <= schedule.autoApprovedAmount) return false;

    return true;
  })
  .sort((a, b) => {
    const dateA = a.submitTime;
    const dateB = b.submitTime;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // Apply period grouping AFTER initial filtering
  const filteredTransactions = groupTransactionsByPeriod(baseFilteredTransactions);

  const totalAmount = filteredTransactions.reduce((sum, transaction) => {
    return sum + (transaction.amount || 0);
  }, 0);

  const handleGenerate = () => {
    setHasGenerated(true);
    setTransactions(getPendingCommissionRecords());
  };

  const handleReset = () => {
    setSearchFilters({
      dateFrom: '',
      dateTo: '',
      setupName: 'all'
    });
    setHasGenerated(false);
    setSelectedRows(new Set());
    setRemarkInputs({});
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
          referrer_code: `REF-${sampleUsers.find(u => u.id === transaction.userID)?.name || transaction.userID}-XXXX`,
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

  // Bulk action handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allPendingIds = filteredTransactions.map(t => t.id);
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

    // Find commission setup to calculate target
    const setup = sampleCommissionSetups.find(s => s.name === transaction.commissionName);
    const commissionTarget = setup ? transaction.amount * setup.targetMultiplier * 10 : 0;

    // Check if this is a combined transaction
    const isCombined = transaction.id.includes('_combined');
    const idsToUpdate = isCombined && (transaction as any).originalIds
      ? (transaction as any).originalIds
      : [transaction.id];

    setTransactions(prev => prev.map(t =>
      idsToUpdate.includes(t.id)
        ? {
            ...t,
            status: 'APPROVED' as const,
            startTime: currentTime,
            completeBy: 'ADMIN001',
            remark: remark,
            commissionCurrent: 0,
            commissionTarget: commissionTarget,
            is_auto_approved: autoApprove,
            approved_by: 'ADMIN001',
            approved_at: currentTime
          }
        : t
    ));

    const newRemarkInputs = { ...remarkInputs };
    delete newRemarkInputs[transaction.id];
    setRemarkInputs(newRemarkInputs);

    // Remove from selected rows
    const newSelected = new Set(selectedRows);
    newSelected.delete(transaction.id);
    setSelectedRows(newSelected);
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
            rejectTime: currentTime,
            rejectBy: 'ADMIN001',
            remark: remark
          }
        : t
    ));

    const newRemarkInputs = { ...remarkInputs };
    delete newRemarkInputs[transaction.id];
    setRemarkInputs(newRemarkInputs);

    // Remove from selected rows
    const newSelected = new Set(selectedRows);
    newSelected.delete(transaction.id);
    setSelectedRows(newSelected);
  };

  const handleSubmitAll = () => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setTransactions(prev => prev.map(t => {
      if (selectedRows.has(t.id)) {
        const remark = remarkInputs[t.id] || '';

        // Find commission setup to calculate target
        const setup = sampleCommissionSetups.find(s => s.name === t.commissionName);
        const commissionTarget = setup ? t.amount * setup.targetMultiplier * 10 : 0;

        return {
          ...t,
          status: 'APPROVED' as const,
          startTime: currentTime,
          completeBy: 'ADMIN001',
          remark: remark,
          commissionCurrent: 0,
          commissionTarget: commissionTarget,
          is_auto_approved: autoApprove,
          approved_by: 'ADMIN001',
          approved_at: currentTime
        };
      }
      return t;
    }));

    setSelectedRows(new Set());
    setRemarkInputs({});
  };

  const pendingCount = filteredTransactions.length;

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Commission Release Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Date From (Submit Time)</label>
            <Input
              type="date"
              value={searchFilters.dateFrom}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Date To (Submit Time)</label>
            <Input
              type="date"
              value={searchFilters.dateTo}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Setup Name</label>
            <Select value={searchFilters.setupName} onValueChange={(value) => handleInputChange('setupName', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Setup Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Setups</SelectItem>
                {sampleCommissionSetups.map(setup => (
                  <SelectItem key={setup.id} value={setup.name}>
                    {setup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 opacity-0">Action</label>
            <Button
              onClick={handleGenerate}
              className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6 w-full"
            >
              GENERATE
            </Button>
          </div>
        </div>

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
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {pendingCount > 0 && (
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

      {/* Commission Release List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 uppercase">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === pendingCount && pendingCount > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                    />
                  </th>
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
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredTransactions.map((transaction) => {
                  const userLevel = getUserLevel(transaction);
                  const commissionSetup = getCommissionSetup(transaction.commissionName || '');

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(transaction.id)}
                          onChange={(e) => handleRowSelect(transaction.id, e.target.checked)}
                          className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                        />
                      </td>
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
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.commissionName || '-'}</td>
                      <td className="px-3 py-2">
                        <Badge className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5">
                          {transaction.commissionTargetType || '-'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs font-semibold">
                        {transaction.commissionPercentage ? `${transaction.commissionPercentage}%` : '-'}
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">
                        ${(transaction.commissionMaxWithdrawalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-blue-600 text-xs">{transaction.completeBy || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.submitTime}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.completeTime || '-'}</td>
                      <td className="px-3 py-2 text-green-600 font-semibold text-xs">
                        ${(transaction.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="text"
                          value={remarkInputs[transaction.id] || ''}
                          onChange={(e) => handleRemarkChange(transaction.id, e.target.value)}
                          className="h-7 w-28 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSubmitSingle(transaction)}
                            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-7 text-xs px-3"
                          >
                            SUBMIT
                          </Button>
                          <Button
                            onClick={() => handleCancelSingle(transaction)}
                            className="bg-[#f44336] hover:bg-[#d32f2f] text-white h-7 text-xs px-3"
                          >
                            CANCEL
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      </div>

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
