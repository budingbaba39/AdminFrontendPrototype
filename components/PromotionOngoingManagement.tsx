import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { X, RefreshCw } from 'lucide-react';
import { Transaction, allTransactions } from './transactionData';
import { User, sampleUsers } from './UserData';
import { initialPromotions } from './PromotionListData';
import { providersData } from './ProviderData';
import ProfileContent from './ProfileContent';

export default function PromotionOngoingManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>(allTransactions);
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    provider: [] as number[],
    startTime: ''
  });
  const [hasSearched, setHasSearched] = useState(true);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<string>('all');
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

  // Get providers for display (returns provider objects, not just names)
  const getProvidersForDisplay = (promotionId: string) => {
    const promotion = initialPromotions.find(p => p.id === promotionId);
    if (!promotion) return [];

    return promotion.providerIds.slice(0, 2).map(id => {
      return providersData.find(p => p.id === id);
    }).filter(Boolean);
  };

  // Get filtered providers by category
  const getFilteredProviders = () => {
    if (providerCategoryFilter === 'all') {
      return providersData;
    }
    return providersData.filter(p => p.category === providerCategoryFilter);
  };

  // Filter transactions
  const filteredTransactions = hasSearched
    ? transactions.filter(tx => {
        // Only show APPROVED BONUS transactions
        if (tx.type !== 'BONUS' || tx.status !== 'APPROVED') return false;

        // Username filter
        if (searchFilters.username && !tx.username.toLowerCase().includes(searchFilters.username.toLowerCase()) && !tx.name.toLowerCase().includes(searchFilters.username.toLowerCase())) {
          return false;
        }

        // Provider filter
        if (searchFilters.provider.length > 0 && tx.promotionID) {
          const promotion = initialPromotions.find(p => p.id === tx.promotionID);
          if (promotion) {
            const hasMatchingProvider = promotion.providerIds.some(id => searchFilters.provider.includes(id));
            if (!hasMatchingProvider) return false;
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
      provider: [],
      startTime: ''
    });
    setHasSearched(true);
  };

  const handleProviderToggle = (providerId: number) => {
    setSearchFilters(prev => ({
      ...prev,
      provider: prev.provider.includes(providerId)
        ? prev.provider.filter(id => id !== providerId)
        : [...prev.provider, providerId]
    }));
  };

  const handleSelectAllProviders = () => {
    if (searchFilters.provider.length === providersData.length) {
      setSearchFilters(prev => ({ ...prev, provider: [] }));
    } else {
      setSearchFilters(prev => ({ ...prev, provider: providersData.map(p => p.id) }));
    }
  };

  const handleUserNameClick = (tx: Transaction) => {
    const user = sampleUsers.find(u => u.id === tx.username || u.name === tx.name);
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
          turnoverCurrent: t.turnoverTarget
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
          remark: cancelRemark || 'Promotion cancelled'
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
          <h2 className="text-xl font-semibold text-gray-900">Promotion Ongoing</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <Input
            placeholder="Username"
            value={searchFilters.username}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, username: e.target.value }))}
            className="h-9"
          />

          <div>
            <button
              type="button"
              onClick={() => setShowProviderModal(true)}
              className="w-full h-9 px-3 text-left bg-white rounded-md text-sm border border-gray-300 hover:bg-gray-50"
            >
              {searchFilters.provider.length === 0 ? 'Select providers' : `${searchFilters.provider.length} selected`}
            </button>
            {searchFilters.provider.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {searchFilters.provider.slice(0, 3).map(providerId => {
                  const provider = providersData.find(p => p.id === providerId);
                  return provider ? (
                    <Badge key={providerId} variant="secondary" className="text-xs">
                      {provider.icon} {provider.name}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => handleProviderToggle(providerId)}
                      />
                    </Badge>
                  ) : null;
                })}
                {searchFilters.provider.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{searchFilters.provider.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

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

      {/* Promotion Ongoing List */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Promotion Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">User Credit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Provider</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Start Time</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Transfer Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Bonus</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Target</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredTransactions.map((tx) => {
                  const promotion = initialPromotions.find(p => p.id === tx.promotionID);
                  const providers = getProvidersForDisplay(tx.promotionID || '');
                  const progressPercentage = tx.turnoverTarget ? (tx.turnoverCurrent! / tx.turnoverTarget * 100) : 0;

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className="text-gray-900 font-medium cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => handleUserNameClick(tx)}
                        >
                          {tx.username}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {promotion?.promoName || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {formatCurrency(getUserCredit(tx.username))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {providers.map((provider: any) => (
                            <Badge key={provider.id} variant="secondary" className="text-xs">
                              {provider.icon} {provider.name}
                            </Badge>
                          ))}
                          {promotion && promotion.providerIds.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{promotion.providerIds.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className="bg-cyan-100 text-cyan-700 font-semibold">
                          APPROVED
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {tx.startTime || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 font-medium">
                        {formatCurrency(tx.transferAmount || tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-semibold">
                        {formatCurrency(tx.bonusAmount || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-gray-900 font-medium">
                            {tx.turnoverCurrent?.toFixed(0) || 0} / {tx.turnoverTarget?.toFixed(0) || 0}
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
                      No approved promotions found
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
            <DialogTitle className="text-[#f44336] font-semibold">CANCEL PROMOTION</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            <p className="text-sm text-gray-700">
              Are you sure you want to cancel this promotion?
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

      {/* Provider Selection Modal */}
      <Dialog open={showProviderModal} onOpenChange={setShowProviderModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              Select Providers to Filter
            </DialogTitle>
          </DialogHeader>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap pb-3 border-b">
            <Button
              type="button"
              onClick={() => setProviderCategoryFilter('all')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'all'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </Button>
            <Button
              type="button"
              onClick={() => setProviderCategoryFilter('cricket')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'cricket'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏏 Cricket
            </Button>
            <Button
              type="button"
              onClick={() => setProviderCategoryFilter('slot')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'slot'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎰 Slot
            </Button>
            <Button
              type="button"
              onClick={() => setProviderCategoryFilter('3d-game')}
              className={`h-8 text-xs ${
                providerCategoryFilter === '3d-game'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎮 3D Game
            </Button>
            <Button
              type="button"
              onClick={() => setProviderCategoryFilter('live-casino')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'live-casino'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎲 Live Casino
            </Button>
            <Button
              type="button"
              onClick={() => setProviderCategoryFilter('fishing')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'fishing'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎣 Fishing
            </Button>
            <Button
              type="button"
              onClick={() => setProviderCategoryFilter('esports')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'esports'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎮 Esports
            </Button>
            <Button
              type="button"
              onClick={() => setProviderCategoryFilter('sports')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'sports'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⚽ Sports
            </Button>
          </div>

          {/* Provider Grid */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {getFilteredProviders().map(provider => (
                <label
                  key={provider.id}
                  className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    searchFilters.provider.includes(provider.id)
                      ? 'border-[#3949ab] bg-[#3949ab]/10'
                      : 'border-gray-200 hover:border-[#3949ab]/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={searchFilters.provider.includes(provider.id)}
                    onChange={() => handleProviderToggle(provider.id)}
                    className="sr-only"
                  />
                  <div className="text-2xl mb-1">{provider.icon}</div>
                  <div className="text-xs text-center font-medium text-gray-700">{provider.name}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {searchFilters.provider.length} provider{searchFilters.provider.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleSelectAllProviders}
                variant="outline"
                className="text-xs"
              >
                {searchFilters.provider.length === providersData.length ? 'Clear All' : 'Select All'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowProviderModal(false)}
                className="bg-[#3949ab] hover:bg-[#2c3785] text-white text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
