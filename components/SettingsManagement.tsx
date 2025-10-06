import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

type SettingsTab = 'Transaction' | 'Member' | 'Promotion' | 'Referrer' | 'Payment' | 'System' | 'Rebate' | 'Agent';

export default function SettingsManagement() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Transaction');

  // Transaction Settings State
  const [transactionSettings, setTransactionSettings] = useState({
    memberMinDeposit: '',
    memberMinWithdraw: '',
    memberMaxDeposit: '',
    memberMaxWithdraw: '',
    memberWithdrawDailyLimit: '',
    disableWithdrawTime: '',
    memberWithdrawRollover: '',
    turnoverPercentage: '',
    rebatePercentage: ''
  });

  // Member Settings State
  const [memberSettings, setMemberSettings] = useState({
    lockBankAccount: 'Before Register',
    phoneCountryCode: '+60',
    smsLimitPerDay: ''
  });

  // Promotion Settings State
  const [promotionSettings, setPromotionSettings] = useState({
    clearPromotionPercentage: '',
    clearPromotionIfBalanceLessThan: '',
    allowDepositIfBalanceLessThan: '',
    promotionConfig: '{"SlotGameOnly":1,"DisablePromotionAfterPlay":1}'
  });

  // Referrer Settings State
  const [referrerSettings, setReferrerSettings] = useState({
    referrerCommissionPercentage: '',
    referrerCommissionType: 'Downline First Deposit',
    referrerCommissionMinWithdraw: '',
    referrerCommissionMinWithdrawTurnover: '',
    referrerCommissionMaxWithdraw: '',
    referrerCommissionMaxPromotion: '',
    calculationDays: '',
    calculationTime: ''
  });

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    paymentType: 'Manual Payment',
    bankAccount: ''
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    language: 'English',
    currency: 'MYR',
    timezone: 'Asia/Kuala_Lumpur',
    hideMobileNumber: 'No',
    displayLiveTransactions: false
  });

  // Rebate Settings State
  const [rebateSettings, setRebateSettings] = useState({
    turnoverRebate: '',
    topupRebate: '',
    loseRebateType: 'daily',
    weeklyLoseRebate: '',
    dailyLoseRebate: '',
    monthlyLoseRebate: ''
  });

  // Agent Settings State
  const [agentSettings, setAgentSettings] = useState({
    agentCommissionPercentage: '',
    agentCommissionMinWithdraw: '',
    agentCommissionMinWithdrawTurnover: '',
    agentCommissionMaxWithdraw: '',
    agentCommissionMaxPromotion: '',
    calculationDays: '',
    calculationTime: ''
  });

  const tabs = ['Transaction', 'Member', 'Promotion', 'Referrer', 'Payment', 'System', 'Rebate', 'Agent'];
  
  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings`);
    // Add save logic here
  };

  const renderTransactionSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Transaction Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="memberMinDeposit">Member Min Deposit</Label>
          <Input
            id="memberMinDeposit"
            type="number"
            value={transactionSettings.memberMinDeposit}
            onChange={(e) => setTransactionSettings(prev => ({ ...prev, memberMinDeposit: e.target.value }))}
            placeholder="Enter minimum deposit amount"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="memberMinWithdraw">Member Min Withdraw</Label>
          <Input
            id="memberMinWithdraw"
            type="number"
            value={transactionSettings.memberMinWithdraw}
            onChange={(e) => setTransactionSettings(prev => ({ ...prev, memberMinWithdraw: e.target.value }))}
            placeholder="Enter minimum withdrawal amount"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="memberMaxDeposit">Member Max Deposit</Label>
          <Input
            id="memberMaxDeposit"
            type="number"
            value={transactionSettings.memberMaxDeposit}
            onChange={(e) => setTransactionSettings(prev => ({ ...prev, memberMaxDeposit: e.target.value }))}
            placeholder="Enter maximum deposit amount"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="memberMaxWithdraw">Member Max Withdraw</Label>
          <Input
            id="memberMaxWithdraw"
            type="number"
            value={transactionSettings.memberMaxWithdraw}
            onChange={(e) => setTransactionSettings(prev => ({ ...prev, memberMaxWithdraw: e.target.value }))}
            placeholder="Enter maximum withdrawal amount"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="memberWithdrawDailyLimit">Member Withdraw Daily Count Limit</Label>
          <Input
            id="memberWithdrawDailyLimit"
            type="number"
            value={transactionSettings.memberWithdrawDailyLimit}
            onChange={(e) => setTransactionSettings(prev => ({ ...prev, memberWithdrawDailyLimit: e.target.value }))}
            placeholder="Enter daily withdrawal limit count"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="disableWithdrawTime">Disable Withdraw Time</Label>
          <Input
            id="disableWithdrawTime"
            type="time"
            value={transactionSettings.disableWithdrawTime}
            onChange={(e) => setTransactionSettings(prev => ({ ...prev, disableWithdrawTime: e.target.value }))}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="memberWithdrawRollover">Member Withdraw Rollover (x Deposit)</Label>
          <div className="relative mt-1">
            <Input
              id="memberWithdrawRollover"
              type="number"
              value={transactionSettings.memberWithdrawRollover}
              onChange={(e) => setTransactionSettings(prev => ({ ...prev, memberWithdrawRollover: e.target.value }))}
              placeholder="Enter rollover multiplier"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">x</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="turnoverPercentage">Turnover % (betting turnover)</Label>
          <div className="relative mt-1">
            <Input
              id="turnoverPercentage"
              type="number"
              value={transactionSettings.turnoverPercentage}
              onChange={(e) => setTransactionSettings(prev => ({ ...prev, turnoverPercentage: e.target.value }))}
              placeholder="Enter turnover percentage"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="rebatePercentage">Rebate % (deposit - withdraw - promotion - turnover)</Label>
        <div className="relative mt-1">
          <Input
            id="rebatePercentage"
            type="number"
            value={transactionSettings.rebatePercentage}
            onChange={(e) => setTransactionSettings(prev => ({ ...prev, rebatePercentage: e.target.value }))}
            placeholder="Enter rebate percentage"
            className="pr-8 max-w-md"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={() => handleSave('Transaction')}
          className="bg-[#4caf50] hover:bg-[#45a049] text-white"
        >
          Save Transaction Settings
        </Button>
      </div>
    </div>
  );

  const renderMemberSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Member Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="lockBankAccount">Lock Bank Account</Label>
          <Select value={memberSettings.lockBankAccount} onValueChange={(value) => setMemberSettings(prev => ({ ...prev, lockBankAccount: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Before Register">Before Register</SelectItem>
              <SelectItem value="After Register">After Register</SelectItem>
              <SelectItem value="Before Withdraw">Before Withdraw</SelectItem>
              <SelectItem value="After Withdraw">After Withdraw</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="phoneCountryCode">Phone Country Code</Label>
          <Input
            id="phoneCountryCode"
            value={memberSettings.phoneCountryCode}
            onChange={(e) => setMemberSettings(prev => ({ ...prev, phoneCountryCode: e.target.value }))}
            placeholder="Enter country code"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="smsLimitPerDay">SMS Limit Per Day</Label>
          <Input
            id="smsLimitPerDay"
            type="number"
            value={memberSettings.smsLimitPerDay}
            onChange={(e) => setMemberSettings(prev => ({ ...prev, smsLimitPerDay: e.target.value }))}
            placeholder="Enter SMS daily limit"
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={() => handleSave('Member')}
          className="bg-[#4caf50] hover:bg-[#45a049] text-white"
        >
          Save Member Settings
        </Button>
      </div>
    </div>
  );

  const renderPromotionSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Promotion Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="clearPromotionPercentage">Clear Promotion Percentage</Label>
          <div className="relative mt-1">
            <Input
              id="clearPromotionPercentage"
              type="number"
              value={promotionSettings.clearPromotionPercentage}
              onChange={(e) => setPromotionSettings(prev => ({ ...prev, clearPromotionPercentage: e.target.value }))}
              placeholder="Enter clear promotion percentage"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="clearPromotionIfBalanceLessThan">Clear Promotion If Balance Less Than</Label>
          <Input
            id="clearPromotionIfBalanceLessThan"
            type="number"
            value={promotionSettings.clearPromotionIfBalanceLessThan}
            onChange={(e) => setPromotionSettings(prev => ({ ...prev, clearPromotionIfBalanceLessThan: e.target.value }))}
            placeholder="Enter balance threshold"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="allowDepositIfBalanceLessThan">Allow Deposit If Balance Less Than</Label>
          <Input
            id="allowDepositIfBalanceLessThan"
            type="number"
            value={promotionSettings.allowDepositIfBalanceLessThan}
            onChange={(e) => setPromotionSettings(prev => ({ ...prev, allowDepositIfBalanceLessThan: e.target.value }))}
            placeholder="Enter balance threshold"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="promotionConfig">Promotion Config (Slot game only, disable promotion after play)</Label>
          <Input
            id="promotionConfig"
            value={promotionSettings.promotionConfig}
            onChange={(e) => setPromotionSettings(prev => ({ ...prev, promotionConfig: e.target.value }))}
            placeholder='{"SlotGameOnly":1,"DisablePromotionAfterPlay":1}'
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={() => handleSave('Promotion')}
          className="bg-[#4caf50] hover:bg-[#45a049] text-white"
        >
          Save Promotion Settings
        </Button>
      </div>
    </div>
  );

  const renderReferrerSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Referrer Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="referrerCommissionPercentage">Referrer Commission %</Label>
          <div className="relative mt-1">
            <Input
              id="referrerCommissionPercentage"
              type="number"
              value={referrerSettings.referrerCommissionPercentage}
              onChange={(e) => setReferrerSettings(prev => ({ ...prev, referrerCommissionPercentage: e.target.value }))}
              placeholder="Enter commission percentage"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="referrerCommissionType">Referrer Commission Type</Label>
          <Select value={referrerSettings.referrerCommissionType} onValueChange={(value) => setReferrerSettings(prev => ({ ...prev, referrerCommissionType: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Downline First Deposit">Downline First Deposit</SelectItem>
              <SelectItem value="All Deposits">All Deposits</SelectItem>
              <SelectItem value="Net Profit">Net Profit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="referrerCommissionMinWithdraw">Referrer Commission Min Withdraw</Label>
          <Input
            id="referrerCommissionMinWithdraw"
            type="number"
            value={referrerSettings.referrerCommissionMinWithdraw}
            onChange={(e) => setReferrerSettings(prev => ({ ...prev, referrerCommissionMinWithdraw: e.target.value }))}
            placeholder="Enter minimum withdrawal"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="referrerCommissionMinWithdrawTurnover">Referrer Commission Min Withdraw Turnover</Label>
          <Input
            id="referrerCommissionMinWithdrawTurnover"
            type="number"
            value={referrerSettings.referrerCommissionMinWithdrawTurnover}
            onChange={(e) => setReferrerSettings(prev => ({ ...prev, referrerCommissionMinWithdrawTurnover: e.target.value }))}
            placeholder="Enter minimum turnover"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="referrerCommissionMaxWithdraw">Referrer Commission Max Withdraw</Label>
          <Input
            id="referrerCommissionMaxWithdraw"
            type="number"
            value={referrerSettings.referrerCommissionMaxWithdraw}
            onChange={(e) => setReferrerSettings(prev => ({ ...prev, referrerCommissionMaxWithdraw: e.target.value }))}
            placeholder="Enter maximum withdrawal"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="referrerCommissionMaxPromotion">Referrer Commission Max Promotion</Label>
          <Input
            id="referrerCommissionMaxPromotion"
            type="number"
            value={referrerSettings.referrerCommissionMaxPromotion}
            onChange={(e) => setReferrerSettings(prev => ({ ...prev, referrerCommissionMaxPromotion: e.target.value }))}
            placeholder="Enter maximum promotion"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="calculationDays">Calculation Days</Label>
          <Input
            id="calculationDays"
            type="number"
            value={referrerSettings.calculationDays}
            onChange={(e) => setReferrerSettings(prev => ({ ...prev, calculationDays: e.target.value }))}
            placeholder="Enter number of days"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="calculationTime">Calculation Time</Label>
          <Input
            id="calculationTime"
            type="time"
            value={referrerSettings.calculationTime}
            onChange={(e) => setReferrerSettings(prev => ({ ...prev, calculationTime: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={() => handleSave('Referrer')}
          className="bg-[#4caf50] hover:bg-[#45a049] text-white"
        >
          Save Referrer Settings
        </Button>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="paymentType">Payment Type</Label>
          <Select value={paymentSettings.paymentType} onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, paymentType: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual Payment">Manual Payment</SelectItem>
              <SelectItem value="Payment Gateway">Payment Gateway</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="bankAccount">Bank Account (for manual payment)</Label>
          <Input
            id="bankAccount"
            value={paymentSettings.bankAccount}
            onChange={(e) => setPaymentSettings(prev => ({ ...prev, bankAccount: e.target.value }))}
            placeholder="Enter bank account details"
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={() => handleSave('Payment')}
          className="bg-[#4caf50] hover:bg-[#45a049] text-white"
        >
          Save Payment Settings
        </Button>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="language">Language</Label>
          <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
              <SelectItem value="Malay">Malay</SelectItem>
              <SelectItem value="Thai">Thai</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MYR">MYR</SelectItem>
              <SelectItem value="SGD">SGD</SelectItem>
              <SelectItem value="THB">THB</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</SelectItem>
              <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
              <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
              <SelectItem value="Asia/Jakarta">Asia/Jakarta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="hideMobileNumber">Hide Mobile Number</Label>
          <Select value={systemSettings.hideMobileNumber} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, hideMobileNumber: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
              <SelectItem value="Yes (except admin)">Yes (except admin)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="displayLiveTransactions">Display Live Transactions (Dummy transactions)</Label>
          <div className="flex items-center mt-2">
            <Switch
              id="displayLiveTransactions"
              checked={systemSettings.displayLiveTransactions}
              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, displayLiveTransactions: checked }))}
            />
            <span className="ml-2 text-sm text-gray-600">
              {systemSettings.displayLiveTransactions ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={() => handleSave('System')}
          className="bg-[#4caf50] hover:bg-[#45a049] text-white"
        >
          Save System Settings
        </Button>
      </div>
    </div>
  );

  const renderRebateSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Rebate Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="turnoverRebate">Turnover Rebate</Label>
          <div className="relative mt-1">
            <Input
              id="turnoverRebate"
              type="number"
              value={rebateSettings.turnoverRebate}
              onChange={(e) => setRebateSettings(prev => ({ ...prev, turnoverRebate: e.target.value }))}
              placeholder="Enter turnover rebate"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="topupRebate">Topup Rebate</Label>
          <div className="relative mt-1">
            <Input
              id="topupRebate"
              type="number"
              value={rebateSettings.topupRebate}
              onChange={(e) => setRebateSettings(prev => ({ ...prev, topupRebate: e.target.value }))}
              placeholder="Enter topup rebate"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
      </div>
      
      <div>
        <Label>Lose Rebate Type</Label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="daily"
              name="loseRebateType"
              value="daily"
              checked={rebateSettings.loseRebateType === 'daily'}
              onChange={(e) => setRebateSettings(prev => ({ ...prev, loseRebateType: e.target.value }))}
              className="h-4 w-4 text-[#3949ab] border-gray-300 focus:ring-[#3949ab]"
            />
            <Label htmlFor="daily">Daily</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="weekly"
              name="loseRebateType"
              value="weekly"
              checked={rebateSettings.loseRebateType === 'weekly'}
              onChange={(e) => setRebateSettings(prev => ({ ...prev, loseRebateType: e.target.value }))}
              className="h-4 w-4 text-[#3949ab] border-gray-300 focus:ring-[#3949ab]"
            />
            <Label htmlFor="weekly">Weekly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="monthly"
              name="loseRebateType"
              value="monthly"
              checked={rebateSettings.loseRebateType === 'monthly'}
              onChange={(e) => setRebateSettings(prev => ({ ...prev, loseRebateType: e.target.value }))}
              className="h-4 w-4 text-[#3949ab] border-gray-300 focus:ring-[#3949ab]"
            />
            <Label htmlFor="monthly">Monthly</Label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="dailyLoseRebate">Daily Lose Rebate</Label>
          <div className="relative mt-1">
            <Input
              id="dailyLoseRebate"
              type="number"
              value={rebateSettings.dailyLoseRebate}
              onChange={(e) => setRebateSettings(prev => ({ ...prev, dailyLoseRebate: e.target.value }))}
              placeholder="Enter daily rebate"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="weeklyLoseRebate">Weekly Lose Rebate</Label>
          <div className="relative mt-1">
            <Input
              id="weeklyLoseRebate"
              type="number"
              value={rebateSettings.weeklyLoseRebate}
              onChange={(e) => setRebateSettings(prev => ({ ...prev, weeklyLoseRebate: e.target.value }))}
              placeholder="Enter weekly rebate"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="monthlyLoseRebate">Monthly Lose Rebate</Label>
          <div className="relative mt-1">
            <Input
              id="monthlyLoseRebate"
              type="number"
              value={rebateSettings.monthlyLoseRebate}
              onChange={(e) => setRebateSettings(prev => ({ ...prev, monthlyLoseRebate: e.target.value }))}
              placeholder="Enter monthly rebate"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={() => handleSave('Rebate')}
          className="bg-[#4caf50] hover:bg-[#45a049] text-white"
        >
          Save Rebate Settings
        </Button>
      </div>
    </div>
  );

  const renderAgentSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Agent Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="agentCommissionPercentage">Agent Commission % (Downline lose total amount)</Label>
          <div className="relative mt-1">
            <Input
              id="agentCommissionPercentage"
              type="number"
              value={agentSettings.agentCommissionPercentage}
              onChange={(e) => setAgentSettings(prev => ({ ...prev, agentCommissionPercentage: e.target.value }))}
              placeholder="Enter commission percentage"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="agentCommissionMinWithdraw">Agent Commission Min Withdraw</Label>
          <Input
            id="agentCommissionMinWithdraw"
            type="number"
            value={agentSettings.agentCommissionMinWithdraw}
            onChange={(e) => setAgentSettings(prev => ({ ...prev, agentCommissionMinWithdraw: e.target.value }))}
            placeholder="Enter minimum withdrawal"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="agentCommissionMinWithdrawTurnover">Agent Commission Min Withdraw Turnover</Label>
          <Input
            id="agentCommissionMinWithdrawTurnover"
            type="number"
            value={agentSettings.agentCommissionMinWithdrawTurnover}
            onChange={(e) => setAgentSettings(prev => ({ ...prev, agentCommissionMinWithdrawTurnover: e.target.value }))}
            placeholder="Enter minimum turnover"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="agentCommissionMaxWithdraw">Agent Commission Max Withdraw</Label>
          <Input
            id="agentCommissionMaxWithdraw"
            type="number"
            value={agentSettings.agentCommissionMaxWithdraw}
            onChange={(e) => setAgentSettings(prev => ({ ...prev, agentCommissionMaxWithdraw: e.target.value }))}
            placeholder="Enter maximum withdrawal"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="agentCommissionMaxPromotion">Agent Commission Max Promotion</Label>
          <Input
            id="agentCommissionMaxPromotion"
            type="number"
            value={agentSettings.agentCommissionMaxPromotion}
            onChange={(e) => setAgentSettings(prev => ({ ...prev, agentCommissionMaxPromotion: e.target.value }))}
            placeholder="Enter maximum promotion"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="agentCalculationDays">Calculation Days</Label>
          <Input
            id="agentCalculationDays"
            type="number"
            value={agentSettings.calculationDays}
            onChange={(e) => setAgentSettings(prev => ({ ...prev, calculationDays: e.target.value }))}
            placeholder="Enter number of days"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="agentCalculationTime">Calculation Time</Label>
          <Input
            id="agentCalculationTime"
            type="time"
            value={agentSettings.calculationTime}
            onChange={(e) => setAgentSettings(prev => ({ ...prev, calculationTime: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={() => handleSave('Agent')}
          className="bg-[#4caf50] hover:bg-[#45a049] text-white"
        >
          Save Agent Settings
        </Button>
      </div>
    </div>
  );
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Transaction':
        return renderTransactionSettings();
      case 'Member':
        return renderMemberSettings();
      case 'Promotion':
        return renderPromotionSettings();
      case 'Referrer':
        return renderReferrerSettings();
      case 'Payment':
        return renderPaymentSettings();
      case 'System':
        return renderSystemSettings();
      case 'Rebate':
        return renderRebateSettings();
      case 'Agent':
        return renderAgentSettings();
      default:
        return renderTransactionSettings();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
        
        {/* Sliding Tab Navigation */}
        <div className="relative">
          <div className="flex bg-gray-100 rounded-lg p-1 relative overflow-x-auto">
            {/* Sliding indicator */}
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
                onClick={() => setActiveTab(tab as SettingsTab)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 relative z-10 whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}