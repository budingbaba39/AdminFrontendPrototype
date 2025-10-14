import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent,DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, Download, Copy, Paperclip, RefreshCw } from 'lucide-react';
import { Textarea } from './ui/textarea';
import ProfileContent from './ProfileContent';
import { sampleWithdrawalTransactions, Transaction, getTypeColor, getStatusColor } from './transactionData';
import { sampleUsers, User } from './UserData';

// Withdrawal transaction status type
type WithdrawalStatus = 'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

// Filter withdrawal transactions from transactionData.ts
const getWithdrawalTransactions = () => {
  return sampleWithdrawalTransactions.filter(transaction =>
    transaction.type === 'WITHDRAW' || transaction.type === 'STAFF WITHDRAW'
  );
};


const levelOptions = ['all', 'bronze', 'silver', 'gold'];

export default function WithdrawalManagement() {
  const [searchFilters, setSearchFilters] = useState({
    transactionId: '',
    username: '',
    dateFrom: '',
    dateTo: '',
    level: 'all',
    handler: '',
    minAmount: '',
    maxAmount: '',
    userBankAcc: ''
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState<WithdrawalStatus>('ALL');
  const [transactions, setTransactions] = useState(getWithdrawalTransactions());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'me'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentModal, setCurrentModal] = useState<'process' | 'handle' | 'remark' | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [decisionStatus, setDecisionStatus] = useState('APPROVED');
  const [rejectionRemark, setRejectionRemark] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<Map<string, User>>(new Map());

  // Current user for demo
  const currentUser = 'CS001';

  // Filter transactions based on search and status
  const filteredTransactions = hasSearched
    ? transactions.filter(transaction => {
        // Status filter
        if (activeStatusFilter !== 'ALL' && transaction.status !== activeStatusFilter) return false;

        // All/Me filter
        if (viewMode === 'me' && transaction.processBy !== currentUser && transaction.processBy !== null && transaction.processBy !== undefined) return false;

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
        if (searchFilters.handler && !transaction.processBy?.toLowerCase().includes(searchFilters.handler.toLowerCase())) return false;
        if (searchFilters.minAmount && transaction.amount < parseFloat(searchFilters.minAmount)) return false;
        if (searchFilters.maxAmount && transaction.amount > parseFloat(searchFilters.maxAmount)) return false;
        if (searchFilters.userBankAcc && !transaction.bankAccountNumber.includes(searchFilters.userBankAcc)) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort by different dates based on status
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

        // Sort by latest first (descending order)
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
    : [];

  // Calculate status counts
  const statusCounts = hasSearched ? {
    ALL: filteredTransactions.length,
    PENDING: transactions.filter(t => t.status === 'PENDING' && (viewMode === 'all' || t.processBy === currentUser || t.processBy === null || t.processBy === undefined)).length,
    PROCESSING: transactions.filter(t => t.status === 'PROCESSING' && (viewMode === 'all' || t.processBy === currentUser)).length,
    COMPLETED: transactions.filter(t => t.status === 'COMPLETED' && (viewMode === 'all' || t.processBy === currentUser)).length,
    REJECTED: transactions.filter(t => t.status === 'REJECTED' && (viewMode === 'all' || t.processBy === currentUser)).length,
  } : { ALL: 0, PENDING: 0, PROCESSING: 0, COMPLETED: 0, REJECTED: 0 };

  // Calculate total amount
  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  const handleSearch = () => {
    setHasSearched(true);
    setActiveStatusFilter('ALL');
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
      userBankAcc: ''
    });
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



  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Withdrawal Search & Filter</h2>
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

          <Button
            onClick={handleSearch}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6"
          >
            SEARCH
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 mt-3">
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
              placeholder="User Bank Acc No / Remark"
              value={searchFilters.userBankAcc}
              onChange={(e) => handleInputChange('userBankAcc', e.target.value)}
              className="h-9"
            />
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
                  left: `calc(${(Object.keys(statusCounts).indexOf(activeStatusFilter) * 100) / 5}% + 0.125rem)`,
                }}
              />
              {(Object.keys(statusCounts) as WithdrawalStatus[]).map((status) => (
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

      {/* Withdrawal List */}
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
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Method</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Bank Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Bank Account Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Bank Acc No</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Fee</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Attachment</th>
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
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.method}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.from}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.bankAccountName}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.bankAccountNumber}</td>
                      <td className="px-3 py-2 text-red-600 text-xs">${(transaction.withdrawalFee || 0).toFixed(2)}</td>
                      <td className="px-3 py-2 text-green-600 font-semibold text-xs">${transaction.amount.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        {transaction.hasAttachment ? (
                          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-xs">
                            <Paperclip className="w-3 h-3" />
                            View
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.submitTime}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.processTime || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.completeTime || transaction.rejectTime || '-'}</td>
                      <td className="px-3 py-2 text-blue-600 text-xs">{transaction.processBy || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs max-w-32 truncate" title={transaction.remark}>
                        {transaction.remark || '-'}
                      </td>
                      <td className="px-3 py-2">
                        <Badge className={`${getStatusColor(transaction.status)} text-xs font-semibold px-2 py-1`}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          {/* PROCESS button - only show for PENDING status, available for anyone to take */}
                          {transaction.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setCurrentModal('process');
                              }}
                              className="bg-[#4caf50] text-white hover:bg-[#45a049] border-[#4caf50] text-xs h-6 px-2"
                            >
                              PROCESS
                            </Button>
                          )}

                          {/* HANDLE button - only show for PROCESSING status, only enable if assigned to current user */}
                          {transaction.status === 'PROCESSING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setCurrentModal('handle');
                              }}
                              disabled={transaction.processBy !== currentUser}
                              className={`text-xs h-6 px-2 ${
                                transaction.processBy !== currentUser
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
                                  : 'bg-orange-500 text-white hover:bg-orange-600 border-orange-500'
                              }`}
                            >
                              HANDLE
                            </Button>
                          )}

                          {/* REMARK button - always show, always enabled */}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Process Withdrawal</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="text-base"><strong>Transaction ID:</strong> {selectedTransaction.id}</div>
                <div className="text-base"><strong>Name:</strong> {selectedTransaction.name}</div>
                <div className="text-base"><strong>Username:</strong> {selectedTransaction.username}</div>
                <div className="text-base"><strong>Method:</strong> {selectedTransaction.method}</div>
                <div className="text-base"><strong>Type:</strong> {selectedTransaction.type}</div>
                <div className="text-base"><strong>Amount:</strong> ${selectedTransaction.amount.toFixed(2)}</div>
              </div>
              <Button
                onClick={() => {
                  setTransactions(prev => prev.map(t =>
                    t.id === selectedTransaction.id
                      ? { ...t, status: 'PROCESSING' as any, processBy: currentUser, processTime: new Date().toISOString().slice(0, 19).replace('T', ' ') }
                      : t
                  ));
                  setCurrentModal('handle');
                }}
                className="w-full bg-[#4caf50] hover:bg-[#45a049] text-white h-12 text-lg font-semibold"
              >
                START PROCESSING
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Handle Modal */}
      <Dialog open={currentModal === 'handle'} onOpenChange={() => setCurrentModal(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transaction Decision</DialogTitle>
            <DialogDescription>
              Make the final decision to approve or reject this transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="flex gap-6">
              {/* Left side - Transaction details and decision */}
              <div className="flex-1 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Bank Account Name</label>
                    <Input value={selectedTransaction.bankAccountName} readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Bank Account Number</label>
                    <Input value={selectedTransaction.bankAccountNumber} readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Bank Name (To)</label>
                    <Input value={selectedTransaction.from} readOnly className="bg-gray-50" />
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
                      const finalStatus = decisionStatus === 'APPROVED' ? 'COMPLETED' : 'REJECTED';
                      const timeField = decisionStatus === 'APPROVED' ? 'completeTime' : 'rejectTime';
                      setTransactions(prev => prev.map(t =>
                        t.id === selectedTransaction.id
                          ? {
                              ...t,
                              status: finalStatus as any,
                              [timeField]: new Date().toISOString().slice(0, 19).replace('T', ' '),
                              remark: decisionStatus === 'REJECTED' ? rejectionRemark : t.remark
                            }
                          : t
                      ));
                      setDecisionStatus('APPROVED');
                      setRejectionRemark('');
                      setCurrentModal(null);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    SUBMIT
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    UPLOAD
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

              {/* Right side - Attachment */}
              <div className="flex-1 border-l pl-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Attachment</h3>
                  {selectedTransaction.hasAttachment ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                      <div className="space-y-2">
                        <div className="text-gray-600">Transaction Evidence</div>
                        <img
                          src={selectedTransaction.receiptImage || "img"}
                          alt="Transaction Evidence"
                          className="max-w-full h-auto mx-auto border rounded"
                          style={{ maxHeight: '400px' }}
                        />
                        <div className="text-sm text-gray-500">
                          Transaction ID: {selectedTransaction.id}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                      <div className="text-gray-500">No attachment available</div>
                    </div>
                  )}
                </div>
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