import { useState, ChangeEvent } from 'react';
import { CommissionSetup, CommissionAmountTier, sampleCommissionSetups } from './CommissionSetupData';
import { initialLevels } from './LevelData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, RefreshCw, Upload, X, Plus } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type ModalMode = 'create' | 'edit' | null;
type ActiveTab = 'info' | 'details' | 'languages';
type LanguageTab = 'english' | 'chinese' | 'malay';

// Default translations
const getDefaultTranslations = () => ({
  english: { name: '', description: '', images: [] as string[] },
  chinese: { name: '', description: '', images: [] as string[] },
  malay: { name: '', description: '', images: [] as string[] }
});

// Default form data
const getDefaultFormData = (): CommissionSetup => ({
  id: '',
  name: '',
  targetType: 'Deposit - Withdraw',
  targetMultiplier: 1,
  claimableCreditLessThan: 0,
  allowInterTransfer: false,
  status: 'Active',
  commissionType: 'Percentage',
  unlockRateWin: 0,
  unlockAmountLose: 0,
  maxPayoutPerDownline: 0,
  maxPayoutAmount: 0,
  maxWithdrawAmount: 0,
  maxWithdrawPercentage: 0,
  amountTiers: [{ threshold: 0, amount: 0, percentage: 0 }],
  translations: getDefaultTranslations(),
  levelIds: [],
  providerIds: [],
  createdDate: new Date().toISOString().split('T')[0],
  createdBy: 'ADMIN001'
});

export default function CommissionSetupManagement() {
  const [commissions, setCommissions] = useState<CommissionSetup[]>(sampleCommissionSetups);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');
  const [languageTab, setLanguageTab] = useState<LanguageTab>('english');
  const [editingCommission, setEditingCommission] = useState<CommissionSetup | null>(null);

  // Filter states
  const [filterName, setFilterName] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<CommissionSetup>(getDefaultFormData());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Provider category filter for eligibility tab
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<string>('all');

  // Get filtered commissions
  const getFilteredCommissions = () => {
    return commissions.filter(comm => {
      if (filterName && !comm.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      return true;
    });
  };

  const handleResetFilters = () => {
    setFilterName('');
  };

  const openModal = (mode: ModalMode, commission?: CommissionSetup) => {
    setModalMode(mode);
    setActiveTab('info');
    setLanguageTab('english');
    setValidationErrors({});

    if (mode === 'create') {
      const newFormData = getDefaultFormData();
      // Generate new ID in COMM format
      const maxNumericId = Math.max(
        ...commissions.map(c => {
          const match = c.id.match(/COMM(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }),
        0
      );
      newFormData.id = `COMM${String(maxNumericId + 1).padStart(3, '0')}`;
      setFormData(newFormData);
      setEditingCommission(null);
    } else if (commission) {
      const editData = {
        ...commission,
        translations: commission.translations || getDefaultTranslations()
      };
      setFormData(editData);
      setEditingCommission(commission);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingCommission(null);
    setFormData(getDefaultFormData());
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Info Tab validations
    if (!formData.name.trim()) errors.name = 'Commission name is required';
    if (formData.targetMultiplier <= 0) errors.targetMultiplier = 'Target multiplier must be greater than 0';
    if (formData.claimableCreditLessThan <= 0) errors.claimableCreditLessThan = 'Claimable credit less than must be greater than 0';

    // Details Tab validations (optional fields, just check ranges if provided)
    if (formData.unlockRateWin < 0 || formData.unlockRateWin > 100) {
      errors.unlockRateWin = 'Unlock rate must be between 0-100%';
    }
    if (formData.unlockAmountLose < 0) {
      errors.unlockAmountLose = 'Unlock amount cannot be negative';
    }
    if (formData.maxPayoutPerDownline < 0) {
      errors.maxPayoutPerDownline = 'Max payout per downline cannot be negative';
    }
    if (formData.maxPayoutAmount < 0) {
      errors.maxPayoutAmount = 'Max payout amount cannot be negative';
    }
    if (formData.maxWithdrawAmount < 0) {
      errors.maxWithdrawAmount = 'Max withdraw amount cannot be negative';
    }
    if (formData.maxWithdrawPercentage < 0 || formData.maxWithdrawPercentage > 100) {
      errors.maxWithdrawPercentage = 'Max withdraw percentage must be between 0-100%';
    }

    // Amount Tiers validations
    if (formData.amountTiers.length === 0) {
      errors.amountTiers = 'At least one tier is required';
    }

    // Check for duplicate thresholds
    const thresholds = formData.amountTiers.map(t => t.threshold);
    const hasDuplicates = thresholds.some((amt, idx) => thresholds.indexOf(amt) !== idx);
    if (hasDuplicates) {
      errors.amountTiers = 'Duplicate tier thresholds are not allowed';
    }

    // Validate percentage ranges if using percentage type
    if (formData.commissionType === 'Percentage') {
      const invalidPercentage = formData.amountTiers.some(t =>
        t.percentage < 0 || t.percentage > 100
      );
      if (invalidPercentage) {
        errors.amountTiers = 'Tier percentage must be between 0-100%';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Clear provider fields if not Valid Bet
    const dataToSave = { ...formData };
    if (dataToSave.targetType !== 'Valid Bet') {
      dataToSave.providerIds = [];
    }

    if (modalMode === 'create') {
      setCommissions([...commissions, dataToSave]);
    } else if (modalMode === 'edit') {
      setCommissions(commissions.map(c => c.id === dataToSave.id ? dataToSave : c));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this commission setup?')) {
      setCommissions(commissions.filter(c => c.id !== id));
    }
  };

  const handleInputChange = (field: keyof CommissionSetup, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Clear providers when changing away from Valid Bet
      if (field === 'targetType' && value !== 'Valid Bet') {
        updated.providerIds = [];
      }

      return updated;
    });
  };

  const toggleLevel = (levelId: number) => {
    setFormData(prev => ({
      ...prev,
      levelIds: prev.levelIds?.includes(levelId)
        ? prev.levelIds.filter(id => id !== levelId)
        : [...(prev.levelIds || []), levelId]
    }));
  };

  const toggleAllLevels = () => {
    const allLevelIds = initialLevels.map(l => l.id);
    setFormData(prev => ({
      ...prev,
      levelIds: (prev.levelIds?.length === allLevelIds.length) ? [] : allLevelIds
    }));
  };

  const toggleProvider = (providerId: number) => {
    setFormData(prev => ({
      ...prev,
      providerIds: prev.providerIds?.includes(providerId)
        ? prev.providerIds.filter(id => id !== providerId)
        : [...(prev.providerIds || []), providerId]
    }));
  };

  // Language image upload handlers
  const handleLanguageImageUpload = (lang: LanguageTab, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setFormData(prev => ({
          ...prev,
          translations: {
            ...prev.translations!,
            [lang]: {
              ...prev.translations![lang],
              images: [...(prev.translations![lang].images || []), base64Image]
            }
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLanguageImage = (lang: LanguageTab, index: number) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations!,
        [lang]: {
          ...prev.translations![lang],
          images: prev.translations![lang].images.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleLanguageFieldChange = (lang: LanguageTab, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations!,
        [lang]: {
          ...prev.translations![lang],
          [field]: value
        }
      }
    }));
  };

  // Amount tier management functions
  const handleAddTier = () => {
    setFormData(prev => ({
      ...prev,
      amountTiers: [...prev.amountTiers, { threshold: 0, amount: 0, percentage: 0 }]
    }));
  };

  const handleDeleteTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amountTiers: prev.amountTiers.filter((_, i) => i !== index)
    }));
  };

  const handleTierChange = (index: number, field: 'threshold' | 'amount' | 'percentage', value: number) => {
    setFormData(prev => {
      const updatedTiers = [...prev.amountTiers];
      updatedTiers[index] = { ...updatedTiers[index], [field]: value };
      return { ...prev, amountTiers: updatedTiers };
    });
  };

  // Get dynamic label for target type column
  const getTargetTypeLabel = (targetType: string): string => {
    switch (targetType) {
      case 'Deposit - Withdraw':
        return 'Deposit - Withdraw More Than';
      case 'Deposit - Withdraw - Rebate - Bonus':
        return 'Deposit - Withdraw - Rebate - Bonus More Than';
      case 'Valid Bet':
        return 'Valid Bet More Than';
      default:
        return 'More Than';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredCommissions = getFilteredCommissions();

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Header with Title and Create Button */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Commission Setup Management</h2>
          <Button
            onClick={() => openModal('create')}
            className="bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white font-semibold"
          >
            CREATE COMMISSION
          </Button>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Commission Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="h-9"
          />

          <Button
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold"
          >
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

      {/* Commission Setups Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Commission Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Target Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Claimable Credit Less Than</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCommissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {commission.levelIds && commission.levelIds.length > 0 ? (
                        commission.levelIds.map(levelId => {
                          const level = initialLevels.find(l => l.id === levelId);
                          const levelName = level?.levelName?.toLowerCase() || 'bronze';
                          return level ? (
                            <Badge key={levelId} className={`text-xs font-semibold px-2 py-0.5 ${
                              levelName === 'gold' ? 'bg-yellow-500 text-white' :
                              levelName === 'silver' ? 'bg-gray-400 text-white' :
                              'bg-amber-700 text-white'
                            }`}>
                              {levelName.toUpperCase()}
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        <span className="text-gray-400 text-xs">No levels</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{commission.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      className={`font-semibold ${
                        commission.targetType === 'Valid Bet'
                          ? 'bg-blue-100 text-blue-800'
                          : commission.targetType === 'Deposit - Withdraw'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {commission.targetType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(commission.claimableCreditLessThan)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => openModal('edit', commission)}
                        className="bg-[#2196f3] text-white hover:bg-[#1976d2] h-7 px-3 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </Button>
                      <Button
                        onClick={() => handleDelete(commission.id)}
                        className="bg-[#f44336] text-white hover:bg-[#d32f2f] h-7 px-3 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCommissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No commission setups found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalMode !== null} onOpenChange={closeModal}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              {modalMode === 'create' ? 'CREATE COMMISSION' : 'EDIT COMMISSION'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar Tabs */}
            <div className="w-48 border-r pr-4 space-y-2">
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
            </div>

            {/* Right Content Area */}
            <div className="flex-1 pl-4 overflow-y-auto min-h-[500px]">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-6 py-2">
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Basic Information</h3>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Commission Name *</label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter commission name"
                          className="w-full h-10"
                        />
                        {validationErrors.name && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Target Type *</label>
                        <select
                          value={formData.targetType}
                          onChange={(e) => handleInputChange('targetType', e.target.value as 'Deposit - Withdraw' | 'Deposit - Withdraw - Rebate - Bonus' | 'Valid Bet')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="Deposit - Withdraw">Deposit - Withdraw</option>
                          <option value="Deposit - Withdraw - Rebate - Bonus">Deposit - Withdraw - Rebate - Bonus</option>
                          <option value="Valid Bet">Valid Bet</option>
                        </select>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Target Multiplier *</label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={formData.targetMultiplier}
                          onChange={(e) => handleInputChange('targetMultiplier', parseFloat(e.target.value) || 0)}
                          placeholder="e.g., 1, 1.5, 2"
                          className="w-full h-10"
                        />
                        {validationErrors.targetMultiplier && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.targetMultiplier}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Claimable Credit Less Than *</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.claimableCreditLessThan}
                          onChange={(e) => handleInputChange('claimableCreditLessThan', parseFloat(e.target.value) || 0)}
                          placeholder="Maximum claimable credit threshold"
                          className="w-full h-10"
                        />
                        {validationErrors.claimableCreditLessThan && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.claimableCreditLessThan}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Allow Inter-Transfer</label>
                        <select
                          value={formData.allowInterTransfer ? 'Yes' : 'No'}
                          onChange={(e) => handleInputChange('allowInterTransfer', e.target.value === 'Yes')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
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
                    </div>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6 py-2">
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Commission Details</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Unlock Rate (%) &lt;=</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.unlockRateWin}
                            onChange={(e) => handleInputChange('unlockRateWin', parseFloat(e.target.value) || 0)}
                            placeholder="0-100"
                            className="w-full h-10"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Unlock Amount &lt;=</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.unlockAmountLose}
                            onChange={(e) => handleInputChange('unlockAmountLose', parseFloat(e.target.value) || 0)}
                            placeholder="Enter amount"
                            className="w-full h-10"
                          />
                        </div>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Max Payout Per Downline</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.maxPayoutPerDownline}
                          onChange={(e) => handleInputChange('maxPayoutPerDownline', parseFloat(e.target.value) || 0)}
                          placeholder="Enter amount"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Max Payout Amount</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.maxPayoutAmount}
                          onChange={(e) => handleInputChange('maxPayoutAmount', parseFloat(e.target.value) || 0)}
                          placeholder="Enter amount"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Max Withdraw Amount</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.maxWithdrawAmount}
                            onChange={(e) => handleInputChange('maxWithdrawAmount', parseFloat(e.target.value) || 0)}
                            placeholder="Enter amount"
                            className="w-full h-10"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Max Withdraw Percentage (%)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.maxWithdrawPercentage}
                            onChange={(e) => handleInputChange('maxWithdrawPercentage', parseFloat(e.target.value) || 0)}
                            placeholder="0-100"
                            className="w-full h-10"
                          />
                        </div>
                        
                      </div>
                      <div>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Commission Type </label>
                        <select
                          value={formData.commissionType}
                          onChange={(e) => handleInputChange('commissionType', e.target.value as 'Percentage' | 'Amount')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="Percentage">Percentage</option>
                          <option value="Amount">Amount</option>
                        </select>
                      </div>
                    </div>
                  </div>
                    </div>
                  </div>

                  {/* Amount Settings Section */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <h3 className="text-lg font-bold text-gray-800">Amount Settings</h3>
                      <Button
                        onClick={handleAddTier}
                        className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Row
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">
                              {getTargetTypeLabel(formData.targetType)}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">
                              {formData.commissionType === 'Percentage' ? 'Commission Percentage (%)' : 'Commission Amount'}
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900 border-b">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.amountTiers.map((tier, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {getTargetTypeLabel(formData.targetType)}
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  value={tier.threshold || ''}
                                  onChange={(e) => handleTierChange(index, 'threshold', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-4 py-2">
                                {formData.commissionType === 'Percentage' ? (
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={tier.percentage || ''}
                                    onChange={(e) => handleTierChange(index, 'percentage', parseFloat(e.target.value) || 0)}
                                    placeholder="0.0"
                                    className="h-8"
                                  />
                                ) : (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={tier.amount || ''}
                                    onChange={(e) => handleTierChange(index, 'amount', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="h-8"
                                  />
                                )}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <Button
                                  onClick={() => handleDeleteTier(index)}
                                  className="bg-[#f44336] text-white hover:bg-[#d32f2f] h-7 px-2 text-xs"
                                  disabled={formData.amountTiers.length === 1}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {validationErrors.amountTiers && (
                      <p className="text-red-600 text-sm mt-2">{validationErrors.amountTiers}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Languages Tab */}
              {activeTab === 'languages' && (
                <div className="space-y-6 py-2">
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Multi-Language Content</h3>

                    {/* Language Sub-tabs */}
                    <div className="flex gap-2 mb-6">
                      <button
                        onClick={() => setLanguageTab('english')}
                        className={`px-6 py-2 rounded font-medium transition-colors ${
                          languageTab === 'english'
                            ? 'bg-[#3949ab] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguageTab('chinese')}
                        className={`px-6 py-2 rounded font-medium transition-colors ${
                          languageTab === 'chinese'
                            ? 'bg-[#3949ab] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Chinese
                      </button>
                      <button
                        onClick={() => setLanguageTab('malay')}
                        className={`px-6 py-2 rounded font-medium transition-colors ${
                          languageTab === 'malay'
                            ? 'bg-[#3949ab] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Malay
                      </button>
                    </div>

                    {/* Language Content */}
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Name</label>
                        <Input
                          type="text"
                          value={formData.translations?.[languageTab]?.name || ''}
                          onChange={(e) => handleLanguageFieldChange(languageTab, 'name', e.target.value)}
                          placeholder={`Enter name in ${languageTab}`}
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                        <ReactQuill
                          key={`description-${languageTab}`}
                          value={formData.translations?.[languageTab]?.description || ''}
                          onChange={(value) => handleLanguageFieldChange(languageTab, 'description', value)}
                          className="bg-white"
                          theme="snow"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Images</label>
                        <div className="space-y-3">
                          {/* Image Upload Button */}
                          <div>
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#3949ab] text-white rounded hover:bg-[#2c3785] transition-colors">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleLanguageImageUpload(languageTab, e)}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {/* Image Previews */}
                          {formData.translations?.[languageTab]?.images && formData.translations[languageTab].images.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                              {formData.translations[languageTab].images.map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={img}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-32 object-cover rounded border"
                                  />
                                  <button
                                    onClick={() => removeLanguageImage(languageTab, idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t-2 mt-6">
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
