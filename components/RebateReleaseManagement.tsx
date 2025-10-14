import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent } from './ui/dialog';
import { Badge } from './ui/badge';
import { RefreshCw } from 'lucide-react';
import ProfileContent from './ProfileContent';
import { sampleUsers, User } from './UserData';
import { rebateSetupsData } from './RebateSetupData';
import { allTransactions, Transaction } from './transactionData';

// Filter transactions to only get REBATE type records with PENDING status
const getPendingRebateRecords = () => {
  return allTransactions.filter(transaction =>
    transaction.type === 'REBATE' && transaction.status === 'PENDING'
  );
};

const rebateTypeOptions = ['all', 'Valid Bet'];

export default function RebateReleaseManagement() {
  const [searchFilters, setSearchFilters] = useState({
    dateFrom: '',
    dateTo: '',
    rebateType: 'all'
  });

  const [hasGenerated, setHasGenerated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<Map<string, User>>(new Map());

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

  // Filter transactions based on search filters
  const filteredTransactions = transactions.filter(transaction => {
    // Only show PENDING transactions
    if (transaction.status !== 'PENDING') return false;

    // Date filters (by submitTime)
    if (searchFilters.dateFrom && new Date(transaction.submitTime) < new Date(searchFilters.dateFrom)) return false;
    if (searchFilters.dateTo && new Date(transaction.submitTime) > new Date(searchFilters.dateTo + ' 23:59:59')) return false;
    if (searchFilters.rebateType && searchFilters.rebateType !== 'all' && transaction.rebateType !== searchFilters.rebateType) return false;

    return true;
  })
  .sort((a, b) => {
    const dateA = a.submitTime;
    const dateB = b.submitTime;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const totalAmount = filteredTransactions.reduce((sum, transaction) => {
    const rebateSetup = getRebateSetup(transaction.rebateName || '');
    const rebateRate = getRebateRate(transaction.lossAmount || 0, rebateSetup);
    const rebateAmount = calculateRebateAmount(transaction.lossAmount || 0, rebateRate);
    return sum + rebateAmount;
  }, 0);

  const handleGenerate = () => {
    setHasGenerated(true);
    setTransactions(getPendingRebateRecords());
  };

  const handleReset = () => {
    setSearchFilters({
      dateFrom: '',
      dateTo: '',
      rebateType: 'all'
    });
    setHasGenerated(false);
    setSelectedRows(new Set());
    setGivenRebateInputs({});
    setRemarkInputs({});
    setTransactions([]);
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

    // Remove from selected rows
    const newSelected = new Set(selectedRows);
    newSelected.delete(transaction.id);
    setSelectedRows(newSelected);
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

    // Remove from selected rows
    const newSelected = new Set(selectedRows);
    newSelected.delete(transaction.id);
    setSelectedRows(newSelected);
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
  };

  const pendingCount = filteredTransactions.length;

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Rebate Release Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
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

          <Select value={searchFilters.rebateType} onValueChange={(value) => handleInputChange('rebateType', value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Rebate Type" />
            </SelectTrigger>
            <SelectContent>
              {rebateTypeOptions.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleGenerate}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6"
          >
            GENERATE
          </Button>
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

      {/* Rebate Release List */}
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
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Tier</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Rate (%)</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Max Limit</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Handler</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Submit Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Completed Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Valid Bet Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Release Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Remark</th>
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
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.rebateName || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.rebateType || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{rebateTier}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">
                        {typeof rebateRate === 'string' ? rebateRate : `${rebateRate}%`}
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{maxLimit}</td>
                      <td className="px-3 py-2 text-blue-600 text-xs">{transaction.completeBy || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.submitTime}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.completeTime || '-'}</td>
                      <td className="px-3 py-2 text-green-600 font-semibold text-xs">
                        ${(transaction.lossAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-green-600 font-semibold text-xs">
                        ${rebateAmount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={givenRebateInputs[transaction.id] || ''}
                          onChange={(e) => handleGivenRebateChange(transaction.id, e.target.value)}
                          className="h-7 w-28 text-xs"
                        />
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
