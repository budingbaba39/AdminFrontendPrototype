import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { User, getUserNameById, sampleUsers } from './UserData';
import { Transaction } from './transactionData';

// Level color mapping
const levelColorMap = {
  bronze: {
    badgeColor: '#f4a261',
    fontColor: '#8a5522'
  },
  silver: {
    badgeColor: '#d9d9d9',
    fontColor: '#4a4a4a'
  },
  gold: {
    badgeColor: '#f1c40f',
    fontColor: '#7f6000'
  }
};

const tagOptions = [
  'LifetimeDeposit',
  'BONUSHUNTER',
  'FAKE RECEIPT',
  'VIP',
  'SPECIALPROMO',
  'tester',
  'Hunter',
  'VIPBRONZE'
];

const levelOptions = ['-', 'bronze', 'silver', 'gold'];

interface Bank {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

interface ProfileManagementProps {
  user: User;
  transactions?: Transaction[];
  onUserUpdate?: (updatedUser: User) => void;
}

type TabType = 'TRANSACTION' | 'BET HISTORY' | 'COMMISSION' | 'CREDIT' | 'BANK' | 'SETTING' | 'GAME' | 'IP' | 'LOG';

// Sample data for various tabs
const sampleTransactionData = [
  { date: '2023-08-25 14:54', id: '#1394795345', type: 'DEPOSIT', description: 'PayEssence Deposit', amount: 10.20, status: 'COMPLETED' },
  { date: '2023-08-25 13:30', id: '#1394795347', type: 'WITHDRAW', description: 'Bank Transfer Withdrawal', amount: -75.00, status: 'PROCESSED' },
  { date: '2023-08-24 09:05', id: '#1394795352', type: 'BONUS', description: 'Welcome BONUS', amount: 88.00, status: 'COMPLETED' },
  { date: '2023-08-24 08:15', id: '#1394795353', type: 'BONUS', description: 'Referral BONUS', amount: 50.00, status: 'PENDING' },
];

const sampleBetData = [
  { round: 'R001', game: 'TURBO', bet: 50.00, win: 100.00, result: 'WIN', time: '2023-08-25 15:30' },
  { round: 'R002', game: 'FA', bet: 25.00, win: 0.00, result: 'LOSE', time: '2023-08-25 14:15' },
  { round: 'R003', game: 'CT', bet: 75.00, win: 150.00, result: 'WIN', time: '2023-08-25 13:45' },
];

const sampleCommissionData = [
  { date: '2023-08-25', downline: 'USER001', amount: 25.50, paid: 'YES' },
  { date: '2023-08-24', downline: 'USER002', amount: 18.75, paid: 'NO' },
  { date: '2023-08-23', downline: 'USER003', amount: 32.10, paid: 'YES' },
];

const sampleIPData = [
  { time: '2023-08-25 16:30', ip: '192.168.1.100', isp: 'TM Net', city: 'Kuala Lumpur', country: 'Malaysia', userAgent: 'Chrome 115.0' },
  { time: '2023-08-25 14:20', ip: '192.168.1.101', isp: 'Maxis', city: 'Petaling Jaya', country: 'Malaysia', userAgent: 'Safari 16.5' },
  { time: '2023-08-24 20:15', ip: '192.168.1.102', isp: 'Digi', city: 'Shah Alam', country: 'Malaysia', userAgent: 'Firefox 116.0' },
];

export default function ProfileManagement({ user, transactions = [], onUserUpdate }: ProfileManagementProps) {
  const [activeTab, setActiveTab] = useState<TabType>('TRANSACTION');
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [tempLevel, setTempLevel] = useState(user.level || '');
  const [tempTags, setTempTags] = useState<string[]>(user.tags || []);

  const [transactionFilter, setTransactionFilter] = useState({
    type: 'ALL',
    startDate: '',
    endDate: ''
  });
  
  const [creditForm, setCreditForm] = useState({
    type: 'MANUAL',
    amount: '',
    transferBank: '(optional)',
    remarks: '',
    promotion: '',
    rebateName: '',
    cashbackName: '',
    commissionName: ''
  });
  
  const [settingForm, setSettingForm] = useState({
    bankName: 'MAYBANK',
    bankAccountName: '',
    bankAccountNo: '',
    lockBank: 'NO',
    withdrawMinBet: '',
    memberMinWithdraw: '',
    memberMaxWithdraw: '',
    withdrawFee: ''
  });

  const [userInfoForm, setUserInfoForm] = useState({
    name: user.name || '',
    password: '000000',
    mobile: user.mobile || '',
    status: 'Active',
    referralCode: user.referrer_code || '',
    referredByName: getUserNameById(user.referrer_by, sampleUsers)
  });

  // Bank-related states
  const [userBanks, setUserBanks] = useState<Bank[]>([]);
  const [editingBank, setEditingBank] = useState<number | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: ''
  });
  const [showAddBank, setShowAddBank] = useState(false);

  // Initialize banks when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser.bankAccount || currentUser.bank || currentUser.name) {
      setUserBanks([
        {
          id: 1,
          bankName: currentUser.bank || 'MAYBANK',
          accountName: currentUser.name || '',
          accountNumber: currentUser.bankAccount || ''
        }
      ]);
    } else {
      setUserBanks([]);
    }
  }, [currentUser]);

  const tabs: TabType[] = ['TRANSACTION', 'BET HISTORY', 'COMMISSION', 'CREDIT', 'BANK', 'SETTING', 'GAME', 'IP', 'LOG'];

  // Function to get level colors
  const getLevelColors = (level: string) => {
    return levelColorMap[level as keyof typeof levelColorMap] || {
      badgeColor: '#9ca3af',
      fontColor: '#374151'
    };
  };

  const handleOpenAssign = () => {
    setTempLevel(currentUser.level || '');
    setTempTags(currentUser.tags || []);
    setShowAssignModal(true);
  };

  const handleAssignSave = () => {
    const updatedUser = {
      ...currentUser,
      level: tempLevel,
      tags: tempTags
    };
    setCurrentUser(updatedUser);
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
    setShowAssignModal(false);
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setTempTags([...tempTags, tag]);
    } else {
      setTempTags(tempTags.filter(t => t !== tag));
    }
  };

  // Bank handlers
  const handleEditBank = (bank: Bank) => {
    setEditingBank(bank.id);
    setBankForm({
      bankName: bank.bankName,
      accountName: bank.accountName,
      accountNumber: bank.accountNumber
    });
  };

  const handleSaveBank = (bankId: number) => {
    setUserBanks(userBanks.map(bank => 
      bank.id === bankId 
        ? { ...bank, ...bankForm }
        : bank
    ));
    setEditingBank(null);
    setBankForm({ bankName: '', accountName: '', accountNumber: '' });
  };

  const handleDeleteBank = (bankId: number) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      setUserBanks(userBanks.filter(bank => bank.id !== bankId));
    }
  };

  const handleAddBank = () => {
    if (bankForm.bankName && bankForm.accountName && bankForm.accountNumber) {
      setUserBanks([...userBanks, {
        id: Date.now(),
        ...bankForm
      }]);
      setBankForm({ bankName: '', accountName: '', accountNumber: '' });
      setShowAddBank(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'TRANSACTION':
        return (
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Select value={transactionFilter.type} onValueChange={(value) => setTransactionFilter(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">ALL</SelectItem>
                    <SelectItem value="DEPOSIT">DEPOSIT</SelectItem>
                    <SelectItem value="STAFF DEPOSIT">STAFF DEPOSIT</SelectItem>
                    <SelectItem value="WITHDRAW">WITHDRAW</SelectItem>
                    <SelectItem value="STAFF WITHDRAW">STAFF WITHDRAW</SelectItem>
                    <SelectItem value="BONUS">BONUS</SelectItem>
                    <SelectItem value="MANUAL">MANUAL</SelectItem>
                    <SelectItem value="REBATE">REBATE</SelectItem>
                    <SelectItem value="CASHBACK">CASHBACK</SelectItem>
                    <SelectItem value="FORFEITED">FORFEITED</SelectItem>
                    <SelectItem value="COMMISSION">COMMISSION</SelectItem>
                    <SelectItem value="LOSSCREDIT">LOSSCREDIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input 
                  type="datetime-local" 
                  value={transactionFilter.startDate}
                  onChange={(e) => setTransactionFilter(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input 
                  type="datetime-local" 
                  value={transactionFilter.endDate}
                  onChange={(e) => setTransactionFilter(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-[#4caf50] hover:bg-[#45a049] text-white">
                  SEARCH
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Total Count</div>
                <div className="text-xl font-bold text-blue-600">{currentUser.depositCount + currentUser.withdrawCount}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-xl font-bold text-green-600">{(currentUser.depositTotal - currentUser.withdrawTotal).toFixed(2)}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Lifetime Deposit</div>
                <div className="text-xl font-bold text-purple-600">{currentUser.depositTotal.toFixed(2)}</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Lifetime Net</div>
                <div className={`text-xl font-bold ${currentUser.winLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentUser.winLoss >= 0 ? '+' : ''}{currentUser.winLoss.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleTransactionData.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm border">{transaction.date}</td>
                      <td className="px-4 py-2 text-sm border">{transaction.id}</td>
                      <td className="px-4 py-2 text-sm border">
                        <Badge className={`${
                          transaction.type === 'DEPOSIT' ? 'bg-green-100 text-green-700' :
                          transaction.type === 'WITHDRAW' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-sm border">{transaction.description}</td>
                      <td className={`px-4 py-2 text-sm font-semibold border ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm border">
                        <Badge className="bg-gray-100 text-gray-700">{transaction.status}</Badge>
                      </td>
                      <td className="px-4 py-2 text-sm border">
                        {transaction.type === 'BONUS' ? (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="px-2 py-1 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                              onClick={() => console.log('Reset R/T clicked for', transaction.id)}
                            >
                              RESET R/T
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="px-2 py-1 text-xs border-orange-300 text-orange-600 hover:bg-orange-50"
                              onClick={() => console.log('Cancel R/T clicked for', transaction.id)}
                            >
                              CANCEL R/T
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="px-2 py-1 text-xs border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => console.log('Cancel clicked for', transaction.id)}
                            >
                              CANCEL
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'BET HISTORY':
        const totalRounds = sampleBetData.length;
        const totalWin = sampleBetData.reduce((sum, bet) => sum + bet.win, 0);
        const totalBet = sampleBetData.reduce((sum, bet) => sum + bet.bet, 0);
        
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">Total Round</div>
                <div className="text-xl font-bold text-blue-600">{totalRounds}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">Total Win</div>
                <div className="text-xl font-bold text-green-600">{totalWin.toFixed(2)}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">Total Bet</div>
                <div className="text-xl font-bold text-purple-600">{totalBet.toFixed(2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  <SelectItem value="TURBO">TURBO</SelectItem>
                  <SelectItem value="FA">FA</SelectItem>
                  <SelectItem value="CT">CT</SelectItem>
                </SelectContent>
              </Select>
              <Input type="datetime-local" placeholder="Start Time" />
              <Input type="datetime-local" placeholder="End Time" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Round</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Game</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Bet</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Win</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Result</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleBetData.map((bet, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm border">{bet.round}</td>
                      <td className="px-4 py-2 text-sm border">{bet.game}</td>
                      <td className="px-4 py-2 text-sm font-semibold text-red-600 border">-{bet.bet.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm font-semibold text-green-600 border">+{bet.win.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm border">
                        <Badge className={bet.result === 'WIN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {bet.result}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-sm border">{bet.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'COMMISSION':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input placeholder="Downline" />
              <Input type="datetime-local" placeholder="Start Time" />
              <Input type="datetime-local" placeholder="End Time" />
              <Button className="bg-[#4caf50] hover:bg-[#45a049] text-white">SEARCH</Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Downline</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleCommissionData.map((commission, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm border">{commission.date}</td>
                      <td className="px-4 py-2 text-sm border">{commission.downline}</td>
                      <td className="px-4 py-2 text-sm font-semibold text-green-600 border">+{commission.amount.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm border">
                        <Badge className={commission.paid === 'YES' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {commission.paid}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'CREDIT':
        const handleConfirm = () => {
          if (creditForm.type === 'BONUS' && !creditForm.promotion) {
            alert('Please select a promotion for BONUS type.');
            return;
          }
          if (creditForm.type === 'REBATE' && !creditForm.rebateName) {
            alert('Please select a rebate name for REBATE type.');
            return;
          }
          if (creditForm.type === 'CASHBACK' && !creditForm.cashbackName) {
            alert('Please select a cashback name for CASHBACK type.');
            return;
          }
          if (creditForm.type === 'COMMISSION' && !creditForm.commissionName) {
            alert('Please select a commission name for COMMISSION type.');
            return;
          }
          console.log('Form submitted:', creditForm);
          // Add your submission logic here (e.g., API call)
        };

        return (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">Credit MYR:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{currentUser.credit.toFixed(2)}</span>
                  <RefreshCw className="w-4 h-4 text-gray-500 cursor-pointer" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">MAIN:</span>
                  <span className="ml-2 font-semibold">{Math.floor(currentUser.credit * 0.7)}</span>
                </div>
                <div>
                  <span className="text-gray-600">TURBO:</span>
                  <span className="ml-2 font-semibold">{Math.floor(currentUser.credit * 0.2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">BSG:</span>
                  <span className="ml-2 font-semibold">{Math.floor(currentUser.credit * 0.1)}</span>
                </div>
              </div>

              {currentUser.ongoingPromotionID && (
                <>
                  {/* Ongoing Promotion */}
                  <div className="pt-3 border-t border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Ongoing Promotion:</span>
                      <span className="text-sm font-bold text-blue-600">{currentUser.ongoingPromotionID}</span>
                    </div>
                  </div>

                  {currentUser.ongoingPromotionID &&
                    transactions &&
                    (() => {
                      // Find the BONUS transaction linked to this user's ongoing promotion
                      console.log('Promo Check:', {
                        userID: currentUser.id,
                        userName: currentUser.name,
                        ongoingPromo: currentUser.ongoingPromotionID,
                        allTransactions: transactions,
                      });

                      const promoTx = transactions.find(
                        (t) =>
                          t.username === currentUser.id &&
                          t.type === 'BONUS' &&
                          t.promotionID === currentUser.ongoingPromotionID
                      );

                      // If not found, don’t show anything
                      if (!promoTx) return null;

                      return (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium text-gray-700">Target:</span>
                          <span className="text-sm font-bold">
                            <span className="text-green-600">{promoTx.turnoverCurrent?.toLocaleString() || 0}</span>
                            <span className="text-gray-500 mx-1">/</span>
                            <span className="text-blue-600">{promoTx.turnoverTarget?.toLocaleString() || 0}</span>
                          </span>
                        </div>
                      );
                    })()}
                </>
              )}
            </div>
      
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Select value={creditForm.type} onValueChange={(value) => setCreditForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">MANUAL</SelectItem>
                    <SelectItem value="STAFF DEPOSIT">STAFF DEPOSIT</SelectItem>
                    <SelectItem value="STAFF WITHDRAW">STAFF WITHDRAW</SelectItem>
                    <SelectItem value="BONUS">BONUS</SelectItem>
                    <SelectItem value="REBATE">REBATE</SelectItem>
                    <SelectItem value="COMMISSION">COMMISSION</SelectItem>
                    <SelectItem value="CASHBACK">CASHBACK</SelectItem>
                    <SelectItem value="LOSSCREDIT">LOSSCREDIT</SelectItem>
                    <SelectItem value="FORFEITED">FORFEITED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
      
              {creditForm.type === 'MANUAL' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <Input 
                      value={creditForm.amount}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="+100.00 / -100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <Input 
                      value={creditForm.remarks}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="(optional)"
                    />
                  </div>
                </>
              )}
      
              {creditForm.type === 'STAFF DEPOSIT' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <Input 
                      value={creditForm.amount}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Bank</label>
                    <Select value={creditForm.transferBank} onValueChange={(value) => setCreditForm(prev => ({ ...prev, transferBank: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Our">(Our)</SelectItem>
                        <SelectItem value="MAYBANK">MAYBANK</SelectItem>
                        <SelectItem value="PUBLIC BANK">PUBLIC BANK</SelectItem>
                        <SelectItem value="CIMB BANK">CIMB BANK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <Input 
                      value={creditForm.remarks}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="(optional)"
                    />
                  </div>
                </>
              )}
      
              {creditForm.type === 'STAFF WITHDRAW' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <Input 
                      value={creditForm.amount}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Bank</label>
                    <Select value={creditForm.transferBank} onValueChange={(value) => setCreditForm(prev => ({ ...prev, transferBank: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Their">(Their)</SelectItem>
                        <SelectItem value="MAYBANK">MAYBANK</SelectItem>
                        <SelectItem value="PUBLIC BANK">PUBLIC BANK</SelectItem>
                        <SelectItem value="CIMB BANK">CIMB BANK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <Input 
                      value={creditForm.remarks}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="(optional)"
                    />
                  </div>
                </>
              )}
      
              {creditForm.type === 'BONUS' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <Input 
                      value={creditForm.amount}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                    <Select value={creditForm.promotion} onValueChange={(value) => setCreditForm(prev => ({ ...prev, promotion: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Promotion (compulsory)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Promotion1">Promotion1</SelectItem>
                        <SelectItem value="Promotion2">Promotion2</SelectItem>
                        <SelectItem value="Promotion3">Promotion3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <Input 
                      value={creditForm.remarks}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="(optional)"
                    />
                  </div>
                </>
              )}
      
              {creditForm.type === 'REBATE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <Input 
                      value={creditForm.amount}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rebate Name</label>
                    <Select value={creditForm.rebateName} onValueChange={(value) => setCreditForm(prev => ({ ...prev, rebateName: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Rebate Name (compulsory)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rebate1">Rebate1</SelectItem>
                        <SelectItem value="Rebate2">Rebate2</SelectItem>
                        <SelectItem value="Rebate3">Rebate3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <Input 
                      value={creditForm.remarks}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="(optional)"
                    />
                  </div>
                </>
              )}
      
              {creditForm.type === 'LOSSCREDIT' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <Input 
                      value={creditForm.amount}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <Input 
                      value={creditForm.remarks}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="(optional)"
                    />
                  </div>
                </>
              )}
      
              {creditForm.type === 'FORFEITED' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <Input 
                      value={creditForm.amount}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <Input 
                      value={creditForm.remarks}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="(optional)"
                    />
                  </div>
                </>
              )}

              {creditForm.type === 'COMMISSION' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <Input 
                      value={creditForm.amount}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                    <Select value={creditForm.promotion} onValueChange={(value) => setCreditForm(prev => ({ ...prev, promotion: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Commission (compulsory)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Commssion1">Commssion1</SelectItem>
                        <SelectItem value="Commssion2">Commssion2</SelectItem>
                        <SelectItem value="Commssion3">Commssion3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <Input 
                      value={creditForm.remarks}
                      onChange={(e) =>
                        setCreditForm((prev) => ({
                          ...prev,
                          remarks: e.target.value,
                        }))
                      }
                      placeholder="(optional)"
                    />
                  </div>
                </>
              )}

              {creditForm.type === 'CASHBACK' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <Input
                      value={creditForm.amount}
                      onChange={(e) =>setCreditForm((prev) => ({...prev, amount: e.target.value,}))}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cashback</label>
                    <Select
                      value={creditForm.cashbackName}
                      onValueChange={(value) =>setCreditForm((prev) => ({...prev, cashbackName: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Cashback (compulsory)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cashback1">Cashback1</SelectItem>
                        <SelectItem value="Cashback2">Cashback2</SelectItem>
                        <SelectItem value="Cashback3">Cashback3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <Input
                      value={creditForm.remarks}
                      onChange={(e) =>setCreditForm((prev) => ({...prev, remarks: e.target.value,
                        }))
                      }
                      placeholder="(optional)"
                    />
                  </div>
                </>
              )}
      
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white" onClick={handleConfirm}>
                  CONFIRM
                </Button>
                <Button className="flex-1 bg-[#f44336] hover:bg-[#d32f2f] text-white">
                  CLOSE
                </Button>
              </div>
            </div>
          </div>
        );

      case 'BANK':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bank Accounts</h3>
              <Button 
                className="bg-[#4caf50] hover:bg-[#45a049] text-white"
                onClick={() => setShowAddBank(true)}
              >
                Add Bank Account
              </Button>
            </div>

            {showAddBank && (
              <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                <h4 className="font-medium mb-3">Add New Bank Account</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <Select 
                      value={bankForm.bankName} 
                      onValueChange={(value) => setBankForm(prev => ({ ...prev, bankName: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAYBANK">MAYBANK</SelectItem>
                        <SelectItem value="PUBLIC BANK">PUBLIC BANK</SelectItem>
                        <SelectItem value="CIMB BANK">CIMB BANK</SelectItem>
                        <SelectItem value="RHB BANK">RHB BANK</SelectItem>
                        <SelectItem value="HONG LEONG BANK">HONG LEONG BANK</SelectItem>
                        <SelectItem value="AMBANK">AMBANK</SelectItem>
                        <SelectItem value="BANK ISLAM">BANK ISLAM</SelectItem>
                        <SelectItem value="AFFIN BANK">AFFIN BANK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <Input 
                      value={bankForm.accountName}
                      onChange={(e) => setBankForm(prev => ({ ...prev, accountName: e.target.value }))}
                      placeholder="Account holder name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <Input 
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Account number"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm"
                    className="bg-[#4caf50] hover:bg-[#45a049] text-white"
                    onClick={handleAddBank}
                  >
                    Add
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddBank(false);
                      setBankForm({ bankName: '', accountName: '', accountNumber: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Bank Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Account Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Account Number</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900 uppercase border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userBanks.length > 0 ? (
                    userBanks.map((bank) => (
                      <tr key={bank.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm border">
                          {editingBank === bank.id ? (
                            <Select 
                              value={bankForm.bankName} 
                              onValueChange={(value) => setBankForm(prev => ({ ...prev, bankName: value }))}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MAYBANK">MAYBANK</SelectItem>
                                <SelectItem value="PUBLIC BANK">PUBLIC BANK</SelectItem>
                                <SelectItem value="CIMB BANK">CIMB BANK</SelectItem>
                                <SelectItem value="RHB BANK">RHB BANK</SelectItem>
                                <SelectItem value="HONG LEONG BANK">HONG LEONG BANK</SelectItem>
                                <SelectItem value="AMBANK">AMBANK</SelectItem>
                                <SelectItem value="BANK ISLAM">BANK ISLAM</SelectItem>
                                <SelectItem value="AFFIN BANK">AFFIN BANK</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="font-medium">{bank.bankName}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm border">
                          {editingBank === bank.id ? (
                            <Input 
                              className="h-8"
                              value={bankForm.accountName}
                              onChange={(e) => setBankForm(prev => ({ ...prev, accountName: e.target.value }))}
                            />
                          ) : (
                            bank.accountName
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm border">
                          {editingBank === bank.id ? (
                            <Input 
                              className="h-8"
                              value={bankForm.accountNumber}
                              onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                            />
                          ) : (
                            <span className="font-mono">{bank.accountNumber}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm border">
                          <div className="flex justify-center gap-2">
                            {editingBank === bank.id ? (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-[#4caf50] hover:bg-[#45a049] text-white px-3 py-1 text-xs"
                                  onClick={() => handleSaveBank(bank.id)}
                                >
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="px-3 py-1 text-xs"
                                  onClick={() => {
                                    setEditingBank(null);
                                    setBankForm({ bankName: '', accountName: '', accountNumber: '' });
                                  }}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-blue-300 text-blue-600 hover:bg-blue-50 px-3 py-1 text-xs"
                                  onClick={() => handleEditBank(bank)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 text-xs"
                                  onClick={() => handleDeleteBank(bank.id)}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500 border">
                        No bank accounts added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'SETTING':
        return (
          <div className="space-y-4">
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lock Bank</label>
                <Select value={settingForm.lockBank} onValueChange={(value) => setSettingForm(prev => ({ ...prev, lockBank: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO">NO</SelectItem>
                    <SelectItem value="YES">YES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Withdraw Min Bet</label>
                <Input 
                  value={settingForm.withdrawMinBet}
                  onChange={(e) => setSettingForm(prev => ({ ...prev, withdrawMinBet: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Min Withdraw</label>
                <Input 
                  value={settingForm.memberMinWithdraw}
                  onChange={(e) => setSettingForm(prev => ({ ...prev, memberMinWithdraw: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Max Withdraw</label>
                <Input 
                  value={settingForm.memberMaxWithdraw}
                  onChange={(e) => setSettingForm(prev => ({ ...prev, memberMaxWithdraw: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Withdraw Fee (%)</label>
                <Input 
                  value={settingForm.withdrawFee}
                  onChange={(e) => setSettingForm(prev => ({ ...prev, withdrawFee: e.target.value }))}
                />
              </div>

              <div className="border-t-2 border-blue-500 my-6"></div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input 
                  value={userInfoForm.name}
                  onChange={(e) => setUserInfoForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input 
                  type="password"
                  value={userInfoForm.password}
                  onChange={(e) => setUserInfoForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
                <Input 
                  value={userInfoForm.mobile}
                  onChange={(e) => setUserInfoForm(prev => ({ ...prev, mobile: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={userInfoForm.status} onValueChange={(value) => setUserInfoForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Referral Code</label>
                <Input
                  value={userInfoForm.referralCode}
                  readOnly
                  className="bg-gray-50 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Share this code with others to refer them</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referred By</label>
                <Input
                  value={userInfoForm.referredByName}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">The user who referred you to this platform</p>
              </div>
              
              <Button className="w-full bg-[#4caf50] hover:bg-[#45a049] text-white">
                SAVE SETTINGS
              </Button>
            </div>
          </div>
        );

      case 'GAME':
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Game</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Username</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Password</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { game: 'CT', username: currentUser.id, password: '-', dateTime: '2023-08-25 10:00' },
                    { game: 'TURBO', username: currentUser.id, password: '-', dateTime: '2023-08-25 10:30' },
                  ].map((gameRecord, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm border">{gameRecord.game}</td>
                      <td className="px-4 py-2 text-sm border">{gameRecord.username}</td>
                      <td className="px-4 py-2 text-sm border">{gameRecord.password}</td>
                      <td className="px-4 py-2 text-sm border">{gameRecord.dateTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'IP':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">IP Address</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">ISP</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">City</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">Country</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase border">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {sampleIPData.map((ipRecord, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm border">{ipRecord.time}</td>
                    <td className="px-4 py-2 text-sm font-mono border">{ipRecord.ip}</td>
                    <td className="px-4 py-2 text-sm border">{ipRecord.isp}</td>
                    <td className="px-4 py-2 text-sm border">{ipRecord.city}</td>
                    <td className="px-4 py-2 text-sm border">{ipRecord.country}</td>
                    <td className="px-4 py-2 text-sm border">{ipRecord.userAgent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'LOG':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">Activity Log</div>
              <div className="text-sm">No log data available</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header with Level and Tags */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-[#3949ab]">
            {currentUser.name}
          </h2>
          {currentUser.level && currentUser.level !== '-' && (
            <Badge 
              style={{ 
                backgroundColor: getLevelColors(currentUser.level).badgeColor, 
                color: getLevelColors(currentUser.level).fontColor 
              }} 
              className="font-semibold"
            >
              {currentUser.level.charAt(0).toUpperCase() + currentUser.level.slice(1)}
            </Badge>
          )}
          {currentUser.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-700">
              {tag}
            </Badge>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={handleOpenAssign}
          >
            +
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex bg-gray-100 rounded-lg p-1 relative">
          <div 
            className="absolute top-1 bottom-1 bg-[#3949ab] rounded-md transition-all duration-300 ease-in-out shadow-sm"
            style={{
              width: `calc(${100 / tabs.length}% - 0.25rem)`,
              left: `calc(${(tabs.indexOf(activeTab) * 100) / tabs.length}% + 0.125rem)`,
            }}
          />
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 relative z-10 ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="p-4">
          {renderTabContent()}
        </div>
      </div>

      {/* Assign Level/Tags Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Level and Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Level</Label>
              <Select value={tempLevel} onValueChange={setTempLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === '-' ? 'None' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Tags</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {tagOptions.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={tempTags.includes(tag)}
                      onCheckedChange={(checked) => handleTagChange(tag, checked as boolean)}
                    />
                    <Label htmlFor={tag}>{tag}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
                onClick={handleAssignSave}
              >
                Save
              </Button>
              <Button 
                className="flex-1 bg-[#f44336] hover:bg-[#d32f2f] text-white"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}