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
import { initialPromotions } from './PromotionSetupData';
import { User, sampleUsers } from './UserData';

// Filter transactions to only get BONUS types
const getBonusTransactions = () => {
  return sampleOtherTransactions.filter(transaction => transaction.type === 'BONUS');
};

const levelOptions = ['all', 'bronze', 'silver', 'gold'];

// Generate promotion options dynamically from initialPromotions
const promotionOptions = [
  { value: 'all', label: 'All Promotions' },
  ...initialPromotions.map(promo => ({
    value: promo.id,
    label: `${promo.promoName} - ID: ${promo.id}`
  }))
];

type PromoStatus = 'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export default function PromotionManagement() {
  const [searchFilters, setSearchFilters] = useState({
    transactionId: '',
    username: '',
    dateFrom: '',
    dateTo: '',
    level: 'all',
    handler: '',
    minAmount: '',
    maxAmount: '',
    remark: '',
    promotionType: '',
    promotionId: 'all'
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [transactions, setTransactions] = useState(getBonusTransactions());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<PromoStatus>('ALL');
  const [viewMode, setViewMode] = useState<'all' | 'me'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentModal, setCurrentModal] = useState<'remark' | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<Map<string, User>>(new Map());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRemark, setCancelRemark] = useState('');

  // Input state for PENDING records
  const [releaseAmountInputs, setReleaseAmountInputs] = useState<Record<string, number>>({});
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});

  // Current user for demo permissions
  const currentUser = 'CS001';

  // Apply view mode filter
  const viewFilteredTransactions = viewMode === 'me'
    ? transactions.filter(t => t.processBy === currentUser || !t.processBy)
    : transactions;

  // Filter transactions based on search criteria
  const filteredTransactions = hasSearched
    ? viewFilteredTransactions.filter(transaction => {
        // Exclude APPROVED transactions (they are shown in ON GOING page)
        if (transaction.status === 'APPROVED') return false;

        // Status filter
        if (activeStatusFilter !== 'ALL' && transaction.status !== activeStatusFilter) return false;

        // Search filters
        if (searchFilters.transactionId && !transaction.id.toLowerCase().includes(searchFilters.transactionId.toLowerCase())) return false;
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
        if (searchFilters.handler && !transaction.processBy?.toLowerCase().includes(searchFilters.handler.toLowerCase()) && !transaction.completeBy?.toLowerCase().includes(searchFilters.handler.toLowerCase())) return false;
        if (searchFilters.minAmount && transaction.amount < parseFloat(searchFilters.minAmount)) return false;
        if (searchFilters.maxAmount && transaction.amount > parseFloat(searchFilters.maxAmount)) return false;
        if (searchFilters.remark && !transaction.remark?.toLowerCase().includes(searchFilters.remark.toLowerCase())) return false;
        if (searchFilters.promotionType && transaction.promotionID) {
          const promotion = initialPromotions.find(p => p.id === transaction.promotionID);
          const promoName = promotion?.promoName || '';
          if (!promoName.toLowerCase().includes(searchFilters.promotionType.toLowerCase())) return false;
        }
        if (searchFilters.promotionId && searchFilters.promotionId !== 'all' && transaction.promotionID !== searchFilters.promotionId) return false;

        return true;
      })
      .sort((a, b) => {
        const dateA = a.completeTime || a.rejectTime || a.submitTime;
        const dateB = b.completeTime || b.rejectTime || b.submitTime;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
    : [];

  // Calculate status counts
  const calculateFilteredCountByStatus = (status: PromoStatus) => {
    const filtered = viewFilteredTransactions.filter(transaction => {
      if (transaction.status === 'APPROVED') return false;
      if (status !== 'ALL' && transaction.status !== status) return false;

      // Apply same search filters
      if (searchFilters.transactionId && !transaction.id.toLowerCase().includes(searchFilters.transactionId.toLowerCase())) return false;
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
      if (searchFilters.handler && !transaction.processBy?.toLowerCase().includes(searchFilters.handler.toLowerCase()) && !transaction.completeBy?.toLowerCase().includes(searchFilters.handler.toLowerCase())) return false;
      if (searchFilters.minAmount && transaction.amount < parseFloat(searchFilters.minAmount)) return false;
      if (searchFilters.maxAmount && transaction.amount > parseFloat(searchFilters.maxAmount)) return false;
      if (searchFilters.remark && !transaction.remark?.toLowerCase().includes(searchFilters.remark.toLowerCase())) return false;
      if (searchFilters.promotionType && transaction.promotionID) {
        const promotion = initialPromotions.find(p => p.id === transaction.promotionID);
        const promoName = promotion?.promoName || '';
        if (!promoName.toLowerCase().includes(searchFilters.promotionType.toLowerCase())) return false;
      }
      if (searchFilters.promotionId && searchFilters.promotionId !== 'all' && transaction.promotionID !== searchFilters.promotionId) return false;

      return true;
    });

    return filtered.length;
  };

  const statusCounts = {
    ALL: calculateFilteredCountByStatus('ALL'),
    PENDING: calculateFilteredCountByStatus('PENDING'),
    PROCESSING: calculateFilteredCountByStatus('PROCESSING'),
    COMPLETED: calculateFilteredCountByStatus('COMPLETED'),
    REJECTED: calculateFilteredCountByStatus('REJECTED'),
  };

  // Calculate total amount
  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleReset = () => {
    setSearchFilters({
      transactionId: '',
      username: '',
      dateFrom: '',
      dateTo: '',
      level: 'all',
      handler: '',
      minAmount: '',
      maxAmount: '',
      remark: '',
      promotionType: '',
      promotionId: 'all'
    });
    setActiveStatusFilter('ALL');
    setViewMode('all');
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsersData(prev => new Map(prev).set(updatedUser.id, updatedUser));
    setSelectedUser(updatedUser);
  };

  const handleReleaseAmountChange = (transactionId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setReleaseAmountInputs(prev => ({ ...prev, [transactionId]: numValue }));
  };

  const handleRemarkChange = (transactionId: string, value: string) => {
    setRemarkInputs(prev => ({ ...prev, [transactionId]: value }));
  };

  const handleProcess = (transaction: Transaction) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Get release amount and remark from inputs
    const bonusAmount = transaction.bonusAmount || 0;
    const releaseAmount = releaseAmountInputs[transaction.id] || bonusAmount;
    const remark = remarkInputs[transaction.id] || '';

    setTransactions(prev => prev.map(t =>
      t.id === transaction.id
        ? {
            ...t,
            status: 'PROCESSING' as const,
            processTime: currentTime,
            processBy: currentUser,
            amount: releaseAmount,
            remark: remark
          }
        : t
    ));

    // Clear inputs
    const newReleaseAmountInputs = { ...releaseAmountInputs };
    delete newReleaseAmountInputs[transaction.id];
    setReleaseAmountInputs(newReleaseAmountInputs);

    const newRemarkInputs = { ...remarkInputs };
    delete newRemarkInputs[transaction.id];
    setRemarkInputs(newRemarkInputs);
  };

  const handleApprove = (transaction: Transaction) => {
    // Simulate moving to ONGOING by removing from list (no backend)
    setTransactions(prev => prev.filter(t => t.id !== transaction.id));
  };

  const handleCancelProcessing = (transaction: Transaction) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setTransactions(prev => prev.map(t =>
      t.id === transaction.id
        ? {
            ...t,
            status: 'REJECTED' as const,
            rejectTime: currentTime,
            rejectBy: currentUser,
            remark: t.remark || 'Cancelled from processing'
          }
        : t
    ));
  };

  const handleUnlock = (tx: Transaction) => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === tx.id) {
        return {
          ...t,
          status: 'COMPLETED' as const,
          completeTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          completeBy: currentUser,
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
          rejectBy: currentUser,
          remark: cancelRemark
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
      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Promotion Management Search & Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <Input
            placeholder="Transaction ID"
            value={searchFilters.transactionId}
            onChange={(e) => handleInputChange('transactionId', e.target.value)}
            className="h-9"
          />

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 mt-3">
            <Input
              type="number"
              placeholder="Min Amount"
              value={searchFilters.minAmount}
              onChange={(e) => handleInputChange('minAmount', e.target.value)}
              className="h-9"
            />

            <Input
              type="number"
              placeholder="Max Amount"
              value={searchFilters.maxAmount}
              onChange={(e) => handleInputChange('maxAmount', e.target.value)}
              className="h-9"
            />

            <Input
              placeholder="Remark"
              value={searchFilters.remark}
              onChange={(e) => handleInputChange('remark', e.target.value)}
              className="h-9"
            />

            <Input
              placeholder="Promotion Type"
              value={searchFilters.promotionType}
              onChange={(e) => handleInputChange('promotionType', e.target.value)}
              className="h-9"
            />
          </div>
        )}

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <Select value={searchFilters.promotionId} onValueChange={(value) => handleInputChange('promotionId', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Promotion ID/Name" />
              </SelectTrigger>
              <SelectContent>
                {promotionOptions.map(promo => (
                  <SelectItem key={promo.value} value={promo.value}>
                    {promo.label}
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
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'all'
                      ? 'bg-[#3949ab] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setViewMode('me')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'me'
                      ? 'bg-[#3949ab] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Me
                </button>
              </div>
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
                  width: `calc(${100 / 5}% - 0.25rem)`,
                  left: `calc(${(['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'].indexOf(activeStatusFilter) * 100) / 5}% + 0.125rem)`,
                }}
              />
              {(['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'] as PromoStatus[]).map((status) => (
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

      {/* Transaction List */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 uppercase">Transaction ID</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Username</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Mobile</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Promo Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Promotion Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Promotion ID</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Submit Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Completed Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Handler</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-900 uppercase">Transfer Amount</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-900 uppercase">Bonus</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-900 uppercase">Release Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Remark</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredTransactions.map((transaction) => {
                  // Use data fields directly from transaction
                  const transferAmount = transaction.transferAmount || 0;
                  const bonusAmount = transaction.bonusAmount || 0;

                  // Get promotion details from promotionID
                  const promotion = initialPromotions.find(p => p.id === transaction.promotionID);
                  const promotionType = promotion?.promoType || transaction.promotionType || '-';
                  const promotionName = promotion?.promoName || transaction.promotionName || '-';

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-gray-900 text-xs font-medium">{transaction.id}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(transaction.id)}
                            className="h-5 px-1.5 text-xs bg-[#3949ab] text-white hover:bg-[#2c3582] border-[#3949ab]"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge className={`${getTypeColor(transaction.type)} text-xs font-semibold px-1.5 py-0.5`}>
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="text-gray-900 font-medium cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => handleUserNameClick(transaction)}
                        >
                          {sampleUsers.find(u => u.id === transaction.userID)?.name || transaction.userID}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{sampleUsers.find(u => u.id === transaction.userID)?.username || transaction.userID}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.mobile}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{promotionType}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{promotionName}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.promotionID || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.submitTime}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.completeTime || transaction.rejectTime || '-'}</td>
                      <td className="px-3 py-2 text-blue-600 text-xs">{transaction.processBy || transaction.completeBy || transaction.rejectBy || '-'}</td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-semibold text-xs text-green-600">
                          ${transferAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-semibold text-xs text-blue-600">
                          ${bonusAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {transaction.status === 'PENDING' ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={releaseAmountInputs[transaction.id] || ''}
                            onChange={(e) => handleReleaseAmountChange(transaction.id, e.target.value)}
                            className="h-7 w-28 text-xs"
                          />
                        ) : (
                          <span className="font-semibold text-xs text-green-600">
                            ${transaction.amount.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {transaction.status === 'PENDING' ? (
                          <Input
                            type="text"
                            value={remarkInputs[transaction.id] || ''}
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProcess(transaction)}
                              className="bg-[#ff9800] text-white hover:bg-[#f57c00] border-[#ff9800] text-xs h-6 px-2"
                            >
                              PROCESS
                            </Button>
                          ) : transaction.status === 'PROCESSING' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(transaction)}
                                className="bg-[#4caf50] text-white hover:bg-[#45a049] border-[#4caf50] text-xs h-6 px-2"
                              >
                                APPROVE
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelProcessing(transaction)}
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

      {/* Cancel Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#f44336] font-semibold">CANCEL PROMOTION</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            <p className="text-sm text-gray-700">
              Are you sure you want to cancel this promotion?
            </p>
            {selectedTransaction && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div><strong>Transaction ID:</strong> {selectedTransaction.id}</div>
                <div><strong>Username:</strong> {selectedTransaction.userID}</div>
                <div><strong>Amount:</strong> ${selectedTransaction.amount.toFixed(2)}</div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancel Remark</label>
              <Textarea
                placeholder="Enter reason for cancellation"
                value={cancelRemark}
                onChange={(e) => setCancelRemark(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCancelConfirm}
                className="flex-1 bg-[#f44336] hover:bg-[#d32f2f] text-white"
              >
                CONFIRM CANCEL
              </Button>
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1"
              >
                BACK
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
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
