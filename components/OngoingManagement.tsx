import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { RefreshCw } from 'lucide-react';
import { Transaction, allTransactions } from './transactionData';
import { User, sampleUsers } from './UserData';
import { initialPromotions } from './PromotionSetupData';
import { providersData } from './ProviderData';
import ProfileContent from './ProfileContent';

export default function OngoingManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>(allTransactions);
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    type: 'ALL',
    setupName: '',
    startTime: ''
  });
  const [hasSearched, setHasSearched] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [cancelRemark, setCancelRemark] = useState('');

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get user by ID
  const getUserById = (userId: string): User | undefined => {
    return sampleUsers.find(u => u.id === userId);
  };

  // Get setup name based on transaction type
  const getSetupName = (tx: Transaction): string => {
    if (tx.type === 'BONUS') {
      if (tx.promotionName) return tx.promotionName;
      if (tx.promotionID) {
        const promo = initialPromotions.find(p => p.id === tx.promotionID);
        return promo?.promoName || '-';
      }
    }
    if (tx.type === 'COMMISSION' && tx.commissionName) return tx.commissionName;
    if (tx.type === 'REBATE' && tx.rebateName) return tx.rebateName;
    if (tx.type === 'CASHBACK' && tx.cashbackName) return tx.cashbackName;
    return '-';
  };

  // Get target type based on transaction type
  const getTargetType = (tx: Transaction): string => {
    if (tx.type === 'BONUS') {
      if (tx.promotionType) return tx.promotionType;
      if (tx.promotionID) {
        const promo = initialPromotions.find(p => p.id === tx.promotionID);
        return promo?.targetType || '-';
      }
    }
    if (tx.type === 'COMMISSION' && tx.commissionTargetType) return tx.commissionTargetType;
    if (tx.type === 'REBATE' && tx.rebateTargetType) return tx.rebateTargetType;
    if (tx.type === 'CASHBACK' && tx.cashbackTargetType) return tx.cashbackTargetType;
    return '-';
  };

  // Get transfer amount
  const getTransferAmount = (tx: Transaction): string => {
    if (tx.type === 'BONUS' && tx.transferAmount) return formatCurrency(tx.transferAmount);
    if (tx.type === 'COMMISSION' && tx.depositAmount) return formatCurrency(tx.depositAmount);
    return '-';
  };

  // Get reward amount
  const getRewardAmount = (tx: Transaction): number => {
    if (tx.type === 'BONUS') return tx.bonusAmount || tx.amount || 0;
    if (tx.type === 'COMMISSION') return tx.commissionAmount || tx.amount || 0;
    if (tx.type === 'REBATE') return tx.rebateAmount || tx.amount || 0;
    if (tx.type === 'CASHBACK') return tx.cashbackAmount || tx.amount || 0;
    return 0;
  };

  // Get target progress
  const getTargetProgress = (tx: Transaction): { current: number; target: number; percentage: number } => {
    let current = 0;
    let target = 0;

    if (tx.type === 'BONUS') {
      current = tx.turnoverCurrent || 0;
      target = tx.turnoverTarget || 0;
    } else if (tx.type === 'COMMISSION') {
      current = tx.commissionCurrent || 0;
      target = tx.commissionTarget || 0;
    } else if (tx.type === 'REBATE') {
      current = tx.rebateCurrent || 0;
      target = tx.rebateTarget || 0;
    } else if (tx.type === 'CASHBACK') {
      current = tx.cashbackCurrent || 0;
      target = tx.cashbackTarget || 0;
    }

    const percentage = target > 0 ? (current / target * 100) : 0;
    return { current, target, percentage };
  };

  // Get provider display
  const getProviderDisplay = (tx: Transaction): string => {
    if (tx.type === 'BONUS' && tx.promotionID) {
      const promotion = initialPromotions.find(p => p.id === tx.promotionID);
      if (promotion && promotion.providerIds && promotion.providerIds.length > 0) {
        const provider = providersData.find(p => p.id === promotion.providerIds[0]);
        return provider ? provider.name : '-';
      }
    }
    return '-';
  };

  // Filter transactions - only show APPROVED transactions from BONUS, COMMISSION, REBATE, CASHBACK
  const filteredTransactions = hasSearched
    ? transactions.filter(tx => {
        // Only show APPROVED transactions of types: BONUS, COMMISSION, REBATE, CASHBACK
        if (tx.status !== 'APPROVED') return false;
        if (!['BONUS', 'COMMISSION', 'REBATE', 'CASHBACK'].includes(tx.type)) return false;

        // Username filter
        if (searchFilters.username) {
          const user = getUserById(tx.userID);
          const username = user?.username?.toLowerCase() || '';
          const name = user?.name?.toLowerCase() || '';
          const searchTerm = searchFilters.username.toLowerCase();
          if (!username.includes(searchTerm) && !name.includes(searchTerm)) {
            return false;
          }
        }

        // Type filter
        if (searchFilters.type !== 'ALL' && tx.type !== searchFilters.type) {
          return false;
        }

        // Setup name filter
        if (searchFilters.setupName) {
          const setupName = getSetupName(tx).toLowerCase();
          if (!setupName.includes(searchFilters.setupName.toLowerCase())) {
            return false;
          }
        }

        // Start time filter
        if (searchFilters.startTime && tx.startTime) {
          const txDate = tx.startTime.split(' ')[0];
          if (txDate !== searchFilters.startTime) return false;
        }

        return true;
      })
    : [];

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleReset = () => {
    setSearchFilters({
      username: '',
      type: 'ALL',
      setupName: '',
      startTime: ''
    });
    setHasSearched(true);
  };

  const handleUserNameClick = (tx: Transaction) => {
    const user = getUserById(tx.userID);
    if (user) {
      setSelectedUser(user);
      setShowProfileModal(true);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setSelectedUser(updatedUser);
  };

  const handleUnlock = (tx: Transaction) => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === tx.id) {
        const updated: Transaction = {
          ...t,
          status: 'COMPLETED',
          completeTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          completeBy: 'CS001'
        };

        // Set current to target based on type
        if (t.type === 'BONUS') {
          updated.turnoverCurrent = t.turnoverTarget;
        } else if (t.type === 'COMMISSION') {
          updated.commissionCurrent = t.commissionTarget;
        } else if (t.type === 'REBATE') {
          updated.rebateCurrent = t.rebateTarget;
        } else if (t.type === 'CASHBACK') {
          updated.cashbackCurrent = t.cashbackTarget;
        }

        return updated;
      }
      return t;
    });
    setTransactions(updatedTransactions);
  };

  const handleCancelClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setCancelRemark('');
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    if (!selectedTransaction) return;

    const updatedTransactions = transactions.map(t => {
      if (t.id === selectedTransaction.id) {
        return {
          ...t,
          status: 'REJECTED' as const,
          rejectTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          rejectBy: 'CS001',
          remark: cancelRemark || 'Transaction cancelled'
        };
      }
      return t;
    });
    setTransactions(updatedTransactions);
    setShowCancelModal(false);
    setSelectedTransaction(null);
    setCancelRemark('');
  };

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">On Going Transactions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
          <Input
            placeholder="Username"
            value={searchFilters.username}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, username: e.target.value }))}
            className="h-9"
          />

          <select
            value={searchFilters.type}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, type: e.target.value }))}
            className="h-9 px-3 text-sm border border-gray-300 rounded-md"
          >
            <option value="ALL">All Types</option>
            <option value="BONUS">BONUS</option>
            <option value="COMMISSION">COMMISSION</option>
            <option value="REBATE">REBATE</option>
            <option value="CASHBACK">CASHBACK</option>
          </select>

          <Input
            placeholder="Setup Name"
            value={searchFilters.setupName}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, setupName: e.target.value }))}
            className="h-9"
          />

          <Input
            type="date"
            placeholder="Start Time"
            value={searchFilters.startTime}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, startTime: e.target.value }))}
            className="h-9"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6"
            >
              SEARCH
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex-1 text-sm text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400 h-8 px-3"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              RESET
            </Button>
          </div>
        </div>
      </div>

      {/* On Going Transactions List */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Setup Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">User Credit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Target Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Provider</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Start Time</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Transfer Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Reward Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Target</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredTransactions.map((tx, index) => {
                  const user = getUserById(tx.userID);
                  const progress = getTargetProgress(tx);
                  const providerDisplay = getProviderDisplay(tx);

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-gray-900 font-medium cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => handleUserNameClick(tx)}
                        >
                          {user?.name || tx.userID}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {user?.username || tx.userID}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {getSetupName(tx)}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {formatCurrency(user?.credit || 0)}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {getTargetType(tx)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`font-semibold ${
                            tx.type === 'BONUS'
                              ? 'bg-purple-100 text-purple-700'
                              : tx.type === 'COMMISSION'
                              ? 'bg-indigo-100 text-indigo-700'
                              : tx.type === 'REBATE'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {providerDisplay}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className="bg-cyan-100 text-cyan-700 font-semibold">
                          On Going
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {tx.startTime || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 font-medium">
                        {getTransferAmount(tx)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-semibold">
                        {formatCurrency(getRewardAmount(tx))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-gray-900 font-medium">
                            {progress.current.toFixed(0)} / {progress.target.toFixed(0)}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnlock(tx)}
                            className="bg-[#4caf50] text-white hover:bg-[#45a049] border-[#4caf50] h-7 px-3 text-xs"
                          >
                            UNLOCK
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gray-400 text-white hover:bg-gray-500 border-gray-400 h-7 px-3 text-xs"
                          >
                            VIEW
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelClick(tx)}
                            className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] h-7 px-3 text-xs"
                          >
                            CANCEL
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={14} className="px-4 py-8 text-center text-gray-500">
                      No ongoing transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#f44336] font-semibold">CANCEL TRANSACTION</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            <p className="text-sm text-gray-700">
              Are you sure you want to cancel this transaction?
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Remark</label>
              <textarea
                value={cancelRemark}
                onChange={(e) => setCancelRemark(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter reason for cancellation..."
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1 bg-[#9e9e9e] text-white hover:bg-[#757575] border-[#9e9e9e]"
              >
                BACK
              </Button>
              <Button
                onClick={handleCancelConfirm}
                className="flex-1 bg-[#f44336] hover:bg-[#d32f2f] text-white"
              >
                CONFIRM CANCEL
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
