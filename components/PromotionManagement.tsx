import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, Copy, RefreshCw } from 'lucide-react';
import { Textarea } from './ui/textarea';
import ProfileContent from './ProfileContent';
import { sampleOtherTransactions, Transaction, TransactionStatus, getTypeColor, getStatusColor } from './transactionData';
import { initialPromotions } from './PromotionListData';
import { User, sampleUsers } from './UserData';

// Filter transactions to only get BONUS types
const getBonusTransactions = () => {
  return sampleOtherTransactions.filter(transaction => transaction.type === 'BONUS');
};

const levelOptions = ['all', 'bronze', 'silver', 'gold'];
const statusOptions = ['all', 'pending', 'processing', 'approved', 'completed', 'rejected'];

// Generate promotion options dynamically from initialPromotions
const promotionOptions = [
  { value: 'all', label: 'All Promotions' },
  ...initialPromotions.map(promo => ({
    value: promo.id,
    label: `${promo.promoName} - ID: ${promo.id}`
  }))
];

export default function PromotionManagement() {
  const [searchFilters, setSearchFilters] = useState({
    transactionId: '',
    username: '',
    dateFrom: '',
    dateTo: '',
    level: 'all',
    status: 'all',
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
  const [activeStatusFilter, setActiveStatusFilter] = useState<TransactionStatus>('ALL');
  const [viewMode, setViewMode] = useState<'all' | 'me'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentModal, setCurrentModal] = useState<'process' | 'handle' | 'remark' | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [decisionStatus, setDecisionStatus] = useState('APPROVED');
  const [rejectionRemark, setRejectionRemark] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<Map<string, User>>(new Map());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRemark, setCancelRemark] = useState('');

  // Current user for demo permissions
  const currentUser = 'CS001';

  // Apply view mode filter
  const viewFilteredTransactions = viewMode === 'me'
    ? transactions.filter(t => t.processBy === currentUser || !t.processBy)
    : transactions;

  // Filter transactions based on search criteria
  const filteredTransactions = hasSearched
    ? viewFilteredTransactions.filter(transaction => {
        // Search filters
        if (searchFilters.transactionId && !transaction.id.toLowerCase().includes(searchFilters.transactionId.toLowerCase())) return false;
        if (searchFilters.username && !transaction.username.toLowerCase().includes(searchFilters.username.toLowerCase()) &&
            !transaction.mobile.includes(searchFilters.username)) return false;
        if (searchFilters.dateFrom && new Date(transaction.submitTime) < new Date(searchFilters.dateFrom)) return false;
        if (searchFilters.dateTo && new Date(transaction.submitTime) > new Date(searchFilters.dateTo + ' 23:59:59')) return false;
        if (searchFilters.level && searchFilters.level !== 'all') {
          const user = sampleUsers.find(u => u.mobile === transaction.mobile || u.id === transaction.username);
          if (!user || user.level !== searchFilters.level) return false;
        }
        if (searchFilters.status && searchFilters.status !== 'all' && transaction.status !== searchFilters.status.toUpperCase()) return false;
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
      .filter(t => activeStatusFilter === 'ALL' || t.status === activeStatusFilter)
      .sort((a, b) => {
        // Sort by status-specific dates
        let dateA: string;
        let dateB: string;
        if (a.status === 'COMPLETED' || a.status === 'REJECTED') {
          dateA = a.completeTime || a.rejectTime || a.submitTime;
        } else if (a.status === 'PROCESSING') {
          dateA = a.processTime || a.submitTime;
        } else {
          dateA = a.submitTime;
        }
        if (b.status === 'COMPLETED' || b.status === 'REJECTED') {
          dateB = b.completeTime || b.rejectTime || b.submitTime;
        } else if (b.status === 'PROCESSING') {
          dateB = b.processTime || b.submitTime;
        } else {
          dateB = b.submitTime;
        }
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
    : [];

  // Calculate status counts
  const statusCounts = {
    'ALL': viewFilteredTransactions.length,
    'PENDING': viewFilteredTransactions.filter(t => t.status === 'PENDING').length,
    'PROCESSING': viewFilteredTransactions.filter(t => t.status === 'PROCESSING').length,
    'COMPLETED': viewFilteredTransactions.filter(t => t.status === 'COMPLETED').length,
    'REJECTED': viewFilteredTransactions.filter(t => t.status === 'REJECTED').length,
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
      status: 'all',
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
    let user = usersData.get(transaction.username);

    if (!user) {
      // First, try to find the user in sampleUsers by mobile or username
      const foundUser = sampleUsers.find(
        u => u.mobile === transaction.mobile || u.id === transaction.username
      );

      if (foundUser) {
        // Use the found user data (override id with transaction.username for keying)
        user = { ...foundUser, id: transaction.username };
      } else {
        // Fallback: create basic user with default level/tags (shouldn't happen with complete sampleUsers)
        user = {
          id: transaction.username,
          registerDate: transaction.submitTime,
          name: transaction.name || transaction.username,
          mobile: transaction.mobile,
          credit: transaction.currentCredit || 0,
          bankAccount: transaction.bankAccountNumber || '',
          bank: transaction.from || '',
          referrer: 'DIRECT',
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };


  const canEditTransaction = (transaction: Transaction) => {
    if (viewMode === 'me') return true;
    return !transaction.processBy || transaction.processBy === currentUser;
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsersData(prev => new Map(prev).set(updatedUser.id, updatedUser));
    setSelectedUser(updatedUser);
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
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="relative">
          <div className="flex bg-gray-100 rounded-lg p-1 relative">
            <div
              className="absolute top-1 bottom-1 bg-[#3949ab] rounded-md transition-all duration-300 ease-in-out shadow-sm"
              style={{
                width: `calc(${100 / 5}% - 0.25rem)`,
                left: `calc(${(['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'].indexOf(activeStatusFilter) * 100) / 5}% + 0.125rem)`,
              }}
            />
            {(['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'] as TransactionStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setActiveStatusFilter(status);
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 relative z-10 ${
                  activeStatusFilter === status
                    ? 'text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()} ({statusCounts[status] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

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
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-900 uppercase">Transfer Amount</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-900 uppercase">Bonus</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Target</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Submit Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Processing Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">C/R Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Handler</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Remark</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredTransactions.map((transaction) => {
                  // Calculate bonus amount
                  const calculateBonus = () => {
                    if (transaction.bonusAmount) return transaction.bonusAmount;

                    const promotion = initialPromotions.find(p => p.id === transaction.promotionID);
                    if (!promotion) return 0;

                    const transferAmount = transaction.transferAmount || transaction.amount;

                    if (promotion.bonusRate > 0) {
                      const bonus = transferAmount * (promotion.bonusRate / 100);
                      return Math.min(bonus, promotion.maxClaimBonus);
                    } else if (promotion.bonusFixedAmount > 0) {
                      return promotion.bonusFixedAmount;
                    } else if (promotion.bonusRandom.max > 0) {
                      return (promotion.bonusRandom.min + promotion.bonusRandom.max) / 2;
                    }
                    return 0;
                  };

                  const bonusAmount = calculateBonus();
                  const transferAmount = transaction.transferAmount || transaction.amount;

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
                          {transaction.name || transaction.username}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.username}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.mobile}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{promotionType}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{promotionName}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.promotionID || '-'}</td>
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
                      <td className="px-3 py-2">
                        <span className="text-xs text-gray-900">
                          {transaction.status === 'PENDING' || transaction.status === 'PROCESSING'
                            ? `0/${transaction.turnoverTarget || 0}`
                            : transaction.status === 'APPROVED'
                            ? `${transaction.turnoverCurrent || 0}/${transaction.turnoverTarget || 0}`
                            : transaction.status === 'COMPLETED'
                            ? `${transaction.turnoverTarget || 0}/${transaction.turnoverTarget || 0}`
                            : '0/0'
                          }
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.submitTime}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.processTime || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.completeTime || transaction.rejectTime || '-'}</td>
                      <td className="px-3 py-2 text-blue-600 text-xs">{transaction.processBy || transaction.completeBy || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs max-w-32 truncate" title={transaction.remark}>
                        {transaction.remark || '-'}
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
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setCurrentModal('process');
                              }}
                              disabled={!canEditTransaction(transaction)}
                              className={`text-xs h-6 px-2 border-0 ${
                                canEditTransaction(transaction)
                                  ? 'bg-[rgba(78,174,68,1)] text-white hover:bg-[#1D5B15]'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              PROCESS
                            </Button>
                          ) : transaction.status === 'PROCESSING' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setCurrentModal('handle');
                              }}
                              disabled={!canEditTransaction(transaction)}
                              className={`text-xs h-6 px-2 ${
                                canEditTransaction(transaction)
                                  ? 'bg-orange-500 text-white hover:bg-orange-600 border-orange-500'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              HANDLE
                            </Button>
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
                                onClick={() => handleCancelClick(transaction)}
                                className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] text-xs h-6 px-2"
                              >
                                CANCEL
                              </Button>
                            </>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setRemarkText(transaction.remark || '');
                              setCurrentModal('remark');
                            }}
                            disabled={!canEditTransaction(transaction)}
                            className={`text-xs h-6 px-2 ${
                              canEditTransaction(transaction)
                                ? 'bg-[#3949ab] text-white hover:bg-[#2c3582] border-[#3949ab]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            REMARK
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
      )}



      {/* Process Modal */}
      <Dialog open={currentModal === 'process'} onOpenChange={() => setCurrentModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Bonus</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><strong>Transaction ID:</strong> {selectedTransaction.id}</div>
                <div><strong>Name:</strong> {selectedTransaction.name}</div>
                <div><strong>Username:</strong> {selectedTransaction.username}</div>
                <div><strong>Type:</strong> {selectedTransaction.type}</div>
                <div><strong>Amount:</strong> ${selectedTransaction.amount.toFixed(2)}</div>
              </div>
              <Button
                onClick={() => {
                  setTransactions(prev => prev.map(t =>
                    t.id === selectedTransaction.id
                      ? { ...t, status: 'PROCESSING', processTime: new Date().toISOString().slice(0, 16).replace('T', ' '), processBy: currentUser }
                      : t
                  ));
                  setCurrentModal('handle');
                }}
                className="w-full bg-[#4caf50] hover:bg-[#45a049] text-white h-12 text-base font-semibold"
              >
                START PROCESSING
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Handle Modal */}
      <Dialog open={currentModal === 'handle'} onOpenChange={() => setCurrentModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Decision</DialogTitle>
            <DialogDescription>
              Make the final decision to approve or reject this transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Name</label>
                  <Input value={initialPromotions.find(p => p.id === selectedTransaction.promotionID)?.promoName || '-'} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promotion ID</label>
                  <Input value={selectedTransaction.promotionID || '-'} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <Input value={selectedTransaction.type} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <Input value={`$${selectedTransaction.amount.toFixed(2)}`} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select value={decisionStatus} onValueChange={(value) => setDecisionStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPROVED">APPROVED</SelectItem>
                      <SelectItem value="REJECTED">REJECTED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {decisionStatus === 'REJECTED' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Remark</label>
                    <Textarea
                      placeholder="Please provide a reason for rejection"
                      value={rejectionRemark}
                      onChange={(e) => setRejectionRemark(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (!selectedTransaction) return;

                    if (decisionStatus === 'APPROVED') {
                      // Calculate bonus and turnover for APPROVED status
                      const promotion = initialPromotions.find(p => p.id === selectedTransaction.promotionID);
                      const transferAmount = selectedTransaction.transferAmount || selectedTransaction.amount;

                      let bonusAmount = 0;
                      if (promotion) {
                        if (promotion.bonusRate > 0) {
                          const bonus = transferAmount * (promotion.bonusRate / 100);
                          bonusAmount = Math.min(bonus, promotion.maxClaimBonus);
                        } else if (promotion.bonusFixedAmount > 0) {
                          bonusAmount = promotion.bonusFixedAmount;
                        } else if (promotion.bonusRandom.max > 0) {
                          bonusAmount = (promotion.bonusRandom.min + promotion.bonusRandom.max) / 2;
                        }
                      }

                      // Calculate turnover target: (transferAmount + bonusAmount) * targetMultiplier
                      const turnoverMultiplier = promotion?.targetMultiplier || 5;
                      const turnoverTarget = (transferAmount + bonusAmount) * turnoverMultiplier;

                      setTransactions(prev => prev.map(t =>
                        t.id === selectedTransaction.id
                          ? {
                              ...t,
                              status: 'APPROVED' as any,
                              processTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                              processBy: currentUser,
                              startTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                              transferAmount: transferAmount,
                              bonusAmount: bonusAmount,
                              turnoverCurrent: 0,
                              turnoverTarget: turnoverTarget
                            }
                          : t
                      ));
                    } else {
                      // REJECTED status
                      setTransactions(prev => prev.map(t =>
                        t.id === selectedTransaction.id
                          ? {
                              ...t,
                              status: 'REJECTED' as any,
                              rejectTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                              rejectBy: currentUser,
                              remark: rejectionRemark
                            }
                          : t
                      ));
                    }

                    setDecisionStatus('APPROVED');
                    setRejectionRemark('');
                    setCurrentModal(null);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  SUBMIT
                </Button>
                <Button
                  onClick={() => {
                    setDecisionStatus('APPROVED');
                    setRejectionRemark('');
                    setCurrentModal(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  CANCEL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Remark Modal */}
      <Dialog open={currentModal === 'remark'} onOpenChange={() => setCurrentModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Remark</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><strong>Transaction ID:</strong> {selectedTransaction.id}</div>
                <div><strong>Username:</strong> {selectedTransaction.username}</div>
                <div><strong>Amount:</strong> ${selectedTransaction.amount.toFixed(2)}</div>
              </div>
              <Textarea
                placeholder="Add a remark"
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                className="min-h-[80px]"
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
                  className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
                >
                  SAVE
                </Button>
                <Button
                  onClick={() => setCurrentModal(null)}
                  variant="outline"
                  className="flex-1"
                >
                  CANCEL
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
                <div><strong>Username:</strong> {selectedTransaction.username}</div>
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