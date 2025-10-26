import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { RefreshCw } from 'lucide-react';
import { Transaction, allTransactions } from './transactionData';
import { User, sampleUsers } from './UserData';
import ProfileContent from './ProfileContent';

export default function CommissionOngoingManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>(allTransactions);
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    commissionName: '',
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

  // Get user credit
  const getUserCredit = (username: string): number => {
    const user = sampleUsers.find(u => u.id === username || u.name === username);
    return user?.credit || 0;
  };

  // Get target type badge color
  const getTargetTypeBadgeColor = (targetType: string): string => {
    switch (targetType) {
      case 'Deposit - Withdraw':
        return 'bg-blue-100 text-blue-800';
      case 'Deposit - Withdraw - Rebate - Bonus':
        return 'bg-purple-100 text-purple-800';
      case 'Valid Bet':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter transactions
  const filteredTransactions = hasSearched
    ? transactions.filter(tx => {
        // Only show APPROVED COMMISSION transactions
        if (tx.type !== 'COMMISSION' || tx.status !== 'APPROVED') return false;

        // Username filter
        if (searchFilters.username) {
          const user = sampleUsers.find(u => u.id === tx.userID);
          const userName = user?.name || tx.userID;
          const username = user?.username || tx.userID;
          if (!userName.toLowerCase().includes(searchFilters.username.toLowerCase()) &&
              !username.toLowerCase().includes(searchFilters.username.toLowerCase())) {
            return false;
          }
        }

        // Commission Name filter
        if (searchFilters.commissionName && tx.commissionName) {
          if (!tx.commissionName.toLowerCase().includes(searchFilters.commissionName.toLowerCase())) {
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
      commissionName: '',
      startTime: ''
    });
    setHasSearched(true);
  };

  const handleUserNameClick = (tx: Transaction) => {
    const user = sampleUsers.find(u => u.id === tx.userID || u.name === tx.name);
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
        return {
          ...t,
          status: 'COMPLETED' as const,
          completeTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          completeBy: 'CS001',
          commissionCurrent: t.commissionTarget
        };
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
          remark: cancelRemark || 'Commission cancelled'
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
          <h2 className="text-xl font-semibold text-gray-900">Commission Ongoing</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <Input
            placeholder="Username"
            value={searchFilters.username}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, username: e.target.value }))}
            className="h-9"
          />

          <Input
            placeholder="Commission Name"
            value={searchFilters.commissionName}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, commissionName: e.target.value }))}
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

      {/* Commission Ongoing List */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Commission Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">User Credit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Target Type</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Start Time</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Commission Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Target</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredTransactions.map((tx) => {
                  const progressPercentage = tx.commissionTarget ? (tx.commissionCurrent! / tx.commissionTarget * 100) : 0;

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className="text-gray-900 font-medium cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => handleUserNameClick(tx)}
                        >
                          {sampleUsers.find(u => u.id === tx.userID)?.name || tx.userID}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {sampleUsers.find(u => u.id === tx.userID)?.username || tx.userID}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {tx.commissionName || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {formatCurrency(getUserCredit(tx.userID))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs font-semibold px-2 py-0.5 ${getTargetTypeBadgeColor(tx.commissionTargetType || '')}`}>
                          {tx.commissionTargetType || '-'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className="bg-cyan-100 text-cyan-700 font-semibold">
                          APPROVED
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {tx.startTime || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-semibold">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-gray-900 font-medium">
                            {tx.commissionCurrent?.toFixed(0) || 0} / {tx.commissionTarget?.toFixed(0) || 0}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
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
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No approved commissions found
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
            <DialogTitle className="text-[#f44336] font-semibold">CANCEL COMMISSION</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            <p className="text-sm text-gray-700">
              Are you sure you want to cancel this commission?
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
