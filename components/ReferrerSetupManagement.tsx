import { useState } from 'react';
import { ReferrerSetup, initialReferrerSetups } from './ReferrerSetupData';
import { initialLevels, levelColors } from './LevelData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, RefreshCw } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

type ModalMode = 'create' | 'edit' | null;
type TabType = 'info' | 'details' | 'languages' | 'eligibility';
type LanguageType = 'english' | 'chinese' | 'malay';

// Default form data
const getDefaultFormData = (): ReferrerSetup => ({
  id: '',
  name: '',
  allowInterTransfer: false,
  unlockRateWin: 0,
  unlockAmountLose: 0,
  minDeposit: 0,
  maxTotalPayoutAmount: 0,
  bonusRate: 0,
  bonusFixedAmount: 0,
  bonusRandom: { min: 0, max: 0 },
  maxWithdrawAmount: 0,
  maxWithdrawPercentage: 0,
  claimableCreditLessThan: 0,
  validFrom: new Date().toISOString().split('T')[0],
  validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'Active',
  targetType: 'By Deposit',
  targetMultiplier: 1,
  recurring: 'One Time',
  timeFrom: '00:00',
  timeTo: '23:59',
  includeRebate: false,
  requireApproval: false,
  autoApprovedAmount: 0,
  levelIds: [],
  translations: {
    english: { name: '', description: '', images: [] },
    chinese: { name: '', description: '', images: [] },
    malay: { name: '', description: '', images: [] }
  },
  createdDate: new Date().toISOString().split('T')[0],
  createdBy: 'Admin'
});

export default function ReferrerSetupManagement() {
  const [setups, setSetups] = useState<ReferrerSetup[]>(initialReferrerSetups);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [activeLanguageTab, setActiveLanguageTab] = useState<LanguageType>('english');

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<ReferrerSetup>(getDefaultFormData());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Get filtered setups
  const getFilteredSetups = () => {
    return setups.filter(setup => {
      if (filterStatus !== 'all' && setup.status !== filterStatus) return false;
      return true;
    });
  };

  const handleResetFilters = () => {
    setFilterStatus('all');
  };

  const openModal = (mode: ModalMode, setup?: ReferrerSetup) => {
    setModalMode(mode);
    setValidationErrors({});
    setActiveTab('info');
    setActiveLanguageTab('english');

    if (mode === 'create') {
      const newFormData = getDefaultFormData();
      // Generate new ID
      const maxNumericId = Math.max(
        ...setups.map(s => {
          const match = s.id.match(/REF(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }),
        0
      );
      newFormData.id = `REF${String(maxNumericId + 1).padStart(3, '0')}`;
      setFormData(newFormData);
    } else if (setup) {
      setFormData({ ...setup });
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setFormData(getDefaultFormData());
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (typeof formData.autoApprovedAmount !== 'number' || formData.autoApprovedAmount < 0)
      errors.autoApprovedAmount = 'Must be >= 0';
    if (!formData.validFrom) errors.validFrom = 'Valid From is required';
    if (!formData.validTo) errors.validTo = 'Valid To is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const dataToSave = {
      ...formData,
      createdDate: modalMode === 'create' ? new Date().toISOString().split('T')[0] : formData.createdDate,
      createdBy: modalMode === 'create' ? 'Admin' : formData.createdBy
    };

    if (modalMode === 'create') {
      setSetups([...setups, dataToSave]);
    } else if (modalMode === 'edit') {
      setSetups(setups.map(s => s.id === dataToSave.id ? dataToSave : s));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this referrer setup?')) {
      setSetups(setups.filter(s => s.id !== id));
    }
  };

  const handleInputChange = (field: keyof ReferrerSetup, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleLevel = (levelId: number) => {
    setFormData(prev => ({
      ...prev,
      levelIds: prev.levelIds.includes(levelId)
        ? prev.levelIds.filter(id => id !== levelId)
        : [...prev.levelIds, levelId]
    }));
  };

  const toggleAllLevels = () => {
    const allLevelIds = initialLevels.map(l => l.id);
    setFormData(prev => ({
      ...prev,
      levelIds: (prev.levelIds.length === allLevelIds.length) ? [] : allLevelIds
    }));
  };

  const handleTranslationChange = (language: LanguageType, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations!,
        [language]: {
          ...prev.translations![language],
          [field]: value
        }
      }
    }));
  };

  const filteredSetups = getFilteredSetups();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Referrer Setup Management</h1>
        <Button
          onClick={() => openModal('create')}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          CREATE REFERRER SETUP
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <div className="grid grid-cols-1 gap-3 mb-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button className="bg-green-600 hover:bg-green-700 text-white h-9">
            SEARCH
          </Button>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="text-sm text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400 h-9"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            RESET
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Target Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Auto Approved Amount &lt;=</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredSetups.map((setup) => (
                <tr key={setup.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {setup.levelIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {setup.levelIds.map(levelId => {
                          const level = initialLevels.find(l => l.id === levelId);
                          const levelName = level?.levelName?.toLowerCase() || 'bronze';
                          return (
                            <Badge key={levelId} className={`text-xs font-semibold px-2 py-0.5 ${
                              levelName === 'gold' ? 'bg-yellow-500 text-white' :
                              levelName === 'silver' ? 'bg-gray-400 text-white' :
                              'bg-amber-700 text-white'
                            }`}>
                              {levelName.toUpperCase()}
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">All levels</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{setup.name}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-purple-100 text-purple-800 font-semibold text-xs">
                      {setup.targetType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    ${setup.autoApprovedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-gray-900 text-xs">{setup.createdDate}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      className={`font-semibold ${
                        setup.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {setup.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal('edit', setup)}
                        className="bg-[#2196f3] text-white hover:bg-[#1976d2] border-[#2196f3] h-7 px-2"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(setup.id)}
                        className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] h-7 px-2"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSetups.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No referrer setups found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalMode !== null} onOpenChange={closeModal}>
        <DialogContent className="max-w-[60vw] w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              {modalMode === 'create' ? 'CREATE REFERRER SETUP' : 'EDIT REFERRER SETUP'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 flex-1 overflow-hidden">
            {/* Left Sidebar - Tabs */}
            <div className="w-48 flex-shrink-0 border-r pr-4 space-y-2 overflow-y-auto">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('languages')}
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === 'languages'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Languages
              </button>
              <button
                onClick={() => setActiveTab('eligibility')}
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === 'eligibility'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Eligibility
              </button>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 overflow-y-auto">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-6 py-2">
                  {/* Basic Info Section */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Basic Info</h3>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Name *</label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter referrer setup name"
                          className="w-full h-10"
                        />
                        {validationErrors.name && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Allow Inter Transfer *</label>
                        <select
                          value={formData.allowInterTransfer ? 'Yes' : 'No'}
                          onChange={(e) => handleInputChange('allowInterTransfer', e.target.value === 'Yes')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Section */}
                  <div className="space-y-4">
                    <div className="w-full">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Valid From *</label>
                      <Input
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => handleInputChange('validFrom', e.target.value)}
                        className="w-full h-10"
                      />
                      {validationErrors.validFrom && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.validFrom}</p>
                      )}
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Valid To *</label>
                      <Input
                        type="date"
                        value={formData.validTo}
                        onChange={(e) => handleInputChange('validTo', e.target.value)}
                        className="w-full h-10"
                      />
                      {validationErrors.validTo && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.validTo}</p>
                      )}
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value as 'Active' | 'Inactive')}
                        className="w-full h-10 px-3 py-2 border rounded-md"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Time From *</label>
                      <Input
                        type="time"
                        value={formData.timeFrom}
                        onChange={(e) => handleInputChange('timeFrom', e.target.value)}
                        className="w-full h-10"
                      />
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Time To *</label>
                      <Input
                        type="time"
                        value={formData.timeTo}
                        onChange={(e) => handleInputChange('timeTo', e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6 py-2">
                  {/* Bonus Info Section */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Bonus Info</h3>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Unlock Rate (%) {'<='} *</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.unlockRateWin}
                          onChange={(e) => handleInputChange('unlockRateWin', parseFloat(e.target.value) || 0)}
                          placeholder="0-100"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Unlock Amount {'<='} *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.unlockAmountLose}
                          onChange={(e) => handleInputChange('unlockAmountLose', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Min Deposit *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.minDeposit}
                          onChange={(e) => handleInputChange('minDeposit', parseFloat(e.target.value) || 0)}
                          placeholder="Minimum deposit amount"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Max Total Payout Amount *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.maxTotalPayoutAmount}
                          onChange={(e) => handleInputChange('maxTotalPayoutAmount', parseFloat(e.target.value) || 0)}
                          placeholder="Maximum total payout"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Bonus Rate (%) *</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.bonusRate}
                          onChange={(e) => handleInputChange('bonusRate', parseFloat(e.target.value) || 0)}
                          placeholder="0-100"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Max Withdraw Amount *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.maxWithdrawAmount}
                          onChange={(e) => handleInputChange('maxWithdrawAmount', parseFloat(e.target.value) || 0)}
                          placeholder="Maximum withdrawal"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Max Withdraw Percentage (%) *</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.maxWithdrawPercentage}
                          onChange={(e) => handleInputChange('maxWithdrawPercentage', parseFloat(e.target.value) || 0)}
                          placeholder="0-100"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Claimable Credit Less Than *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.claimableCreditLessThan}
                          onChange={(e) => handleInputChange('claimableCreditLessThan', parseFloat(e.target.value) || 0)}
                          placeholder="Credit limit"
                          className="w-full h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Referrer Specific Section */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Referrer Specific</h3>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Target Type *</label>
                        <select
                          value={formData.targetType}
                          onChange={(e) => handleInputChange('targetType', e.target.value as 'By Deposit' | 'By Register')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="By Deposit">By Deposit</option>
                          <option value="By Register">By Register</option>
                        </select>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Target Multiplier *</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.targetMultiplier}
                          onChange={(e) => handleInputChange('targetMultiplier', parseFloat(e.target.value) || 0)}
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Recurring *</label>
                        <select
                          value={formData.recurring}
                          className="w-full h-10 px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
                          disabled
                        >
                          <option value="One Time">One Time</option>
                        </select>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Include Rebate</label>
                        <select
                          value={formData.includeRebate ? 'Yes' : 'No'}
                          onChange={(e) => handleInputChange('includeRebate', e.target.value === 'Yes')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Require Approval</label>
                        <select
                          value={formData.requireApproval ? 'Yes' : 'No'}
                          onChange={(e) => handleInputChange('requireApproval', e.target.value === 'Yes')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Auto Approved Amount &lt;= *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.autoApprovedAmount}
                          onChange={(e) => handleInputChange('autoApprovedAmount', parseFloat(e.target.value) || 0)}
                          className="w-full h-10"
                        />
                        {validationErrors.autoApprovedAmount && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.autoApprovedAmount}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Languages Tab */}
              {activeTab === 'languages' && (
                <div className="space-y-4 py-2">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Multi-Language Content</h3>

                  {/* Language Sub-tabs */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setActiveLanguageTab('english')}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        activeLanguageTab === 'english'
                          ? 'bg-[#3949ab] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setActiveLanguageTab('chinese')}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        activeLanguageTab === 'chinese'
                          ? 'bg-[#3949ab] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Chinese
                    </button>
                    <button
                      onClick={() => setActiveLanguageTab('malay')}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        activeLanguageTab === 'malay'
                          ? 'bg-[#3949ab] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Malay
                    </button>
                  </div>

                  {/* Language Content */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Name ({activeLanguageTab.charAt(0).toUpperCase() + activeLanguageTab.slice(1)})
                      </label>
                      <Input
                        type="text"
                        value={formData.translations?.[activeLanguageTab]?.name || ''}
                        onChange={(e) => handleTranslationChange(activeLanguageTab, 'name', e.target.value)}
                        placeholder={`Enter name in ${activeLanguageTab}`}
                        className="w-full h-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Description ({activeLanguageTab.charAt(0).toUpperCase() + activeLanguageTab.slice(1)})
                      </label>
                      <ReactQuill
                        value={formData.translations?.[activeLanguageTab]?.description || ''}
                        onChange={(value) => handleTranslationChange(activeLanguageTab, 'description', value)}
                        className="bg-white"
                        theme="snow"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Eligibility Tab */}
              {activeTab === 'eligibility' && (
                <div className="space-y-4 min-h-[500px]">
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Level Selection</h3>
                    <div className="bg-white rounded-lg border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left w-16">
                              <input
                                type="checkbox"
                                checked={formData.levelIds.length === initialLevels.length}
                                onChange={toggleAllLevels}
                                className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Level Name</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                          {initialLevels.map((level) => (
                            <tr
                              key={level.id}
                              className={`hover:bg-gray-50 cursor-pointer ${
                                formData.levelIds.includes(level.id) ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => toggleLevel(level.id)}
                            >
                              <td className="px-4 py-3 w-16">
                                <input
                                  type="checkbox"
                                  checked={formData.levelIds.includes(level.id)}
                                  onChange={() => toggleLevel(level.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                                />
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {level.levelName}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">{formData.levelIds.length}</span> level(s) selected out of <span className="font-semibold">{initialLevels.length}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t-2 mt-4">
            <Button
              onClick={closeModal}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-2 text-base font-semibold"
              size="lg"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-base font-semibold shadow-md"
              size="lg"
            >
              {modalMode === 'create' ? 'CREATE' : 'UPDATE'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
