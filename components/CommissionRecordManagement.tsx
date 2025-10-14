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

// Filter transactions to only get COMMISSION type records that are COMPLETED
const getCommissionRecords = () => {
  return sampleOtherTransactions.filter(transaction =>
    transaction.type === 'COMMISSION' && transaction.status === 'COMPLETED'
  );
};

const levelOptions = ['all', 'bronze', 'silver', 'gold'];
const commissionOptions = [
  { value: 'all', label: 'All Commissions' },
  { value: 'COM001', label: 'Referral Commission - COM001' },
  { value: 'COM002', label: 'Agent Commission - COM002' },
  { value: 'COM003', label: 'VIP Commission - COM003' },
  { value: 'COM004', label: 'Downline Commission - COM004' },
];

export default function CommissionRecordManagement() {
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
    commissionType: '',
    commissionName: 'all'
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [transactions, setTransactions] = useState(getCommissionRecords());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentModal, setCurrentModal] = useState<'remark' | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<Map<string, User>>(new Map());

  // Filter transactions based on search criteria
  const filteredTransactions = hasSearched
    ? transactions.filter(transaction => {
        // Search filters
        if (searchFilters.transactionId && !transaction.id.toLowerCase().includes(searchFilters.transactionId.toLowerCase())) return false;
        if (searchFilters.username && !transaction.username.toLowerCase().includes(searchFilters.username.toLowerCase()) &&
            !transaction.mobile.includes(searchFilters.username)) return false;
        if (searchFilters.dateFrom && new Date(transaction.completeTime || transaction.submitTime) < new Date(searchFilters.dateFrom)) return false;
        if (searchFilters.dateTo && new Date(transaction.completeTime || transaction.submitTime) > new Date(searchFilters.dateTo + ' 23:59:59')) return false;
        if (searchFilters.level && searchFilters.level !== 'all') {
          const user = sampleUsers.find(u => u.mobile === transaction.mobile || u.id === transaction.username);
          if (!user || user.level !== searchFilters.level) return false;
        }
        if (searchFilters.handler && !transaction.completeBy?.toLowerCase().includes(searchFilters.handler.toLowerCase())) return false;
        if (searchFilters.minAmount && transaction.amount < parseFloat(searchFilters.minAmount)) return false;
        if (searchFilters.maxAmount && transaction.amount > parseFloat(searchFilters.maxAmount)) return false;
        if (searchFilters.remark && !transaction.remark?.toLowerCase().includes(searchFilters.remark.toLowerCase())) return false;
        if (searchFilters.commissionType && !transaction.commissionType?.toLowerCase().includes(searchFilters.commissionType.toLowerCase())) return false;
        if (searchFilters.commissionName && searchFilters.commissionName !== 'all' && transaction.commissionName !== searchFilters.commissionName) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort by complete time (latest first)
        const dateA = a.completeTime || a.submitTime;
        const dateB = b.completeTime || b.submitTime;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
    : [];

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
      commissionType: '',
      commissionName: 'all'
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsersData(prev => new Map(prev).set(updatedUser.id, updatedUser));
    setSelectedUser(updatedUser);
  };

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Commission Record Search & Filter</h2>
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
              placeholder="Commission Type"
              value={searchFilters.commissionType}
              onChange={(e) => handleInputChange('commissionType', e.target.value)}
              className="h-9"
            />
          </div>
        )}

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
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

      {/* Commission Record List */}
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
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Commission Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Commission Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Completed Time</th>
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
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.commissionType || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.commissionName || '-'}</td>
                      <td className="px-3 py-2">
                        <span className="font-semibold text-xs text-green-600">
                          ${transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-900 text-xs">{transaction.completeTime || '-'}</td>
                      <td className="px-3 py-2 text-blue-600 text-xs">{transaction.completeBy || '-'}</td>
                      <td className="px-3 py-2 text-gray-900 text-xs max-w-32 truncate" title={transaction.remark}>
                        {transaction.remark || '-'}
                      </td>
                      <td className="px-3 py-2">
                        <Badge className={`${getStatusColor(transaction.status)} text-xs font-semibold px-2 py-1`}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
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