import { useState, ChangeEvent } from 'react';
import { CashBackSetup, CashBackAmountTier, cashBackSetupsData, ProviderCashBackSetting, CashBackSetupFormula } from './CashBackSetupData';
import { initialLevels } from './LevelData';
import { providersData, categoryLabels, Provider } from './ProviderData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, RefreshCw, Upload, X, Plus } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type ModalMode = 'create' | 'edit' | null;
type ActiveTab = 'info' | 'details' | 'languages' | 'eligibility';
type LanguageTab = 'english' | 'chinese' | 'malay';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Default translations
const getDefaultTranslations = () => ({
  english: { name: '', description: '', images: [] as string[] },
  chinese: { name: '', description: '', images: [] as string[] },
  malay: { name: '', description: '', images: [] as string[] }
});

// Default form data
const getDefaultFormData = (): CashBackSetup => ({
  id: '',
  name: '',
  cashbackType: 'By Net Lose Only',
  targetMultiplier: 1,
  claimableCreditLessThan: 0,
  allowInterTransfer: false,
  status: 'Active',
  timeFrom: '00:00',
  timeTo: '23:59',
  unlockRateWin: 0,
  unlockAmountLose: 0,
  maxTotalPayoutAmount: 0,
  maxWithdrawAmount: 0,
  maxWithdrawPercentage: 0,
  recurring: 'Immediate',
  includeRebate: false,
  requireApproval: false,
  cashbackCalculationType: 'Percentage',
  amountTiers: [{ amountMoreThanOrEqual: 0, cashbackPercentage: 0, cashbackAmount: 0, providerIds: undefined, formula: '' }],
  translations: getDefaultTranslations(),
  levelIds: [],
  providerSettings: {},
  createdDate: new Date().toISOString().split('T')[0],
  createdBy: 'ADMIN001'
});

export default function CashBackSetupManagement() {
  const [cashbacks, setCashbacks] = useState<CashBackSetup[]>(cashBackSetupsData);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');
  const [languageTab, setLanguageTab] = useState<LanguageTab>('english');
  const [editingCashback, setEditingCashback] = useState<CashBackSetup | null>(null);

  // Filter states
  const [filterName, setFilterName] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<CashBackSetup>(getDefaultFormData());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Provider category filter for eligibility tab
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<string>('all');

  // Provider selection modal states for Amount Settings tiers
  const [showTierProviderModal, setShowTierProviderModal] = useState(false);
  const [currentTierIndex, setCurrentTierIndex] = useState<number | null>(null);
  const [tierProviderCategoryFilter, setTierProviderCategoryFilter] = useState<string>('all');

  // Get filtered cashbacks
  const getFilteredCashbacks = () => {
    return cashbacks.filter(cashback => {
      if (filterName && !cashback.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      return true;
    });
  };

  const handleResetFilters = () => {
    setFilterName('');
  };

  const openModal = (mode: ModalMode, cashback?: CashBackSetup) => {
    setModalMode(mode);
    setActiveTab('info');
    setLanguageTab('english');
    setValidationErrors({});

    if (mode === 'create') {
      const newFormData = getDefaultFormData();
      // Generate new ID in CASH format
      const maxNumericId = Math.max(
        ...cashbacks.map(c => {
          const match = c.id.match(/CASH(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }),
        0
      );
      newFormData.id = `CASH${String(maxNumericId + 1).padStart(3, '0')}`;
      setFormData(newFormData);
      setEditingCashback(null);
    } else if (cashback) {
      const editData = {
        ...cashback,
        translations: cashback.translations || getDefaultTranslations(),
        cashbackCalculationType: cashback.cashbackCalculationType || 'Percentage' // Default to Percentage if not set
      };
      setFormData(editData);
      setEditingCashback(cashback);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingCashback(null);
    setFormData(getDefaultFormData());
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Info Tab validations
    if (!formData.name.trim()) errors.name = 'CashBack name is required';
    if (formData.targetMultiplier <= 0) errors.targetMultiplier = 'Target multiplier must be greater than 0';
    if (formData.claimableCreditLessThan <= 0) errors.claimableCreditLessThan = 'Claimable credit less than must be greater than 0';

    // Details Tab validations
    if (formData.unlockRateWin < 0 || formData.unlockRateWin > 100) {
      errors.unlockRateWin = 'Unlock rate must be between 0-100%';
    }
    if (formData.unlockAmountLose < 0) {
      errors.unlockAmountLose = 'Unlock amount cannot be negative';
    }
    if (formData.maxTotalPayoutAmount < 0) {
      errors.maxTotalPayoutAmount = 'Max total payout amount cannot be negative';
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
    const thresholds = formData.amountTiers.map(t => t.amountMoreThanOrEqual);
    const hasDuplicates = thresholds.some((amt, idx) => thresholds.indexOf(amt) !== idx);
    if (hasDuplicates) {
      errors.amountTiers = 'Duplicate tier thresholds are not allowed';
    }

    // Validate percentage ranges if using percentage type
    if (formData.cashbackCalculationType === 'Percentage') {
      const invalidPercentage = formData.amountTiers.some(t =>
        t.cashbackPercentage < 0 || t.cashbackPercentage > 100
      );
      if (invalidPercentage) {
        errors.amountTiers = 'Tier percentage must be between 0-100%';
      }
    }

    // Validate amount if using amount type
    if (formData.cashbackCalculationType === 'Amount') {
      const invalidAmount = formData.amountTiers.some(t =>
        t.cashbackAmount < 0
      );
      if (invalidAmount) {
        errors.amountTiers = 'CashBack amount cannot be negative';
      }
    }

    // Eligibility validations
    if (formData.levelIds.length === 0) {
      errors.levelIds = 'At least one level must be selected';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (modalMode === 'create') {
      setCashbacks([...cashbacks, formData]);
    } else if (modalMode === 'edit') {
      setCashbacks(cashbacks.map(c => c.id === formData.id ? formData : c));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this cashback setup?')) {
      setCashbacks(cashbacks.filter(c => c.id !== id));
    }
  };

  const handleInputChange = (field: keyof CashBackSetup, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  // Get filtered providers based on category
  const getFilteredProviders = () => {
    if (providerCategoryFilter === 'all') {
      return providersData;
    }
    return providersData.filter(p => p.category === providerCategoryFilter);
  };

  // Toggle provider selection
  const handleProviderToggle = (providerId: number, checked: boolean) => {
    setFormData(prev => {
      const newProviderSettings = { ...prev.providerSettings };

      if (checked) {
        newProviderSettings[providerId] = {
          minBetAmount: 0,
          maxBetAmount: 99999
        };
      } else {
        delete newProviderSettings[providerId];
      }

      return {
        ...prev,
        providerSettings: newProviderSettings
      };
    });
  };

  // Update provider setting
  const handleProviderSettingChange = (
    providerId: number,
    field: keyof ProviderCashBackSetting,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      providerSettings: {
        ...prev.providerSettings,
        [providerId]: {
          ...prev.providerSettings[providerId],
          [field]: value
        }
      }
    }));
  };

  // Select all providers
  const handleSelectAllProviders = () => {
    const filtered = getFilteredProviders();
    const newSettings = { ...formData.providerSettings };

    filtered.forEach(provider => {
      if (!newSettings[provider.id]) {
        newSettings[provider.id] = {
          minBetAmount: 0,
          maxBetAmount: 99999
        };
      }
    });

    setFormData(prev => ({ ...prev, providerSettings: newSettings }));
  };

  // Deselect all providers
  const handleDeselectAllProviders = () => {
    setFormData(prev => ({ ...prev, providerSettings: {} }));
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

  // Amount tier management functions (NO AUTO-SORT)
  const handleAddTier = () => {
    setFormData(prev => ({
      ...prev,
      amountTiers: [...prev.amountTiers, { amountMoreThanOrEqual: 0, cashbackPercentage: 0, cashbackAmount: 0, providerIds: [], formula: '' }]
    }));
  };

  const handleDeleteTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amountTiers: prev.amountTiers.filter((_, i) => i !== index)
    }));
  };

  const handleTierChange = (index: number, field: 'amountMoreThanOrEqual' | 'cashbackPercentage' | 'cashbackAmount' | 'providerIds' | 'formula', value: number | string | number[] | undefined) => {
    setFormData(prev => {
      const updatedTiers = [...prev.amountTiers];
      updatedTiers[index] = { ...updatedTiers[index], [field]: value };
      // NO SORT - keep manual order
      return { ...prev, amountTiers: updatedTiers };
    });
  };

  // Open provider selection modal for a specific tier
  const handleOpenTierProviderModal = (tierIndex: number) => {
    setCurrentTierIndex(tierIndex);
    setTierProviderCategoryFilter('all');
    setShowTierProviderModal(true);
  };

  // Toggle provider in tier
  const handleToggleTierProvider = (providerId: number) => {
    if (currentTierIndex === null) return;

    setFormData(prev => {
      const updatedTiers = [...prev.amountTiers];
      const currentProviders = updatedTiers[currentTierIndex].providerIds || [];

      if (currentProviders.includes(providerId)) {
        updatedTiers[currentTierIndex].providerIds = currentProviders.filter(id => id !== providerId);
      } else {
        updatedTiers[currentTierIndex].providerIds = [...currentProviders, providerId];
      }

      return { ...prev, amountTiers: updatedTiers };
    });
  };

  // Select all providers for tier
  const handleSelectAllTierProviders = () => {
    if (currentTierIndex === null) return;

    const filtered = providersData.filter(p => tierProviderCategoryFilter === 'all' || p.category === tierProviderCategoryFilter);
    const filteredIds = filtered.map(p => p.id);

    setFormData(prev => {
      const updatedTiers = [...prev.amountTiers];
      const currentProviders = updatedTiers[currentTierIndex].providerIds || [];
      const newProviders = [...new Set([...currentProviders, ...filteredIds])];
      updatedTiers[currentTierIndex].providerIds = newProviders;
      return { ...prev, amountTiers: updatedTiers };
    });
  };

  // Deselect all providers for tier
  const handleDeselectAllTierProviders = () => {
    if (currentTierIndex === null) return;

    const filtered = providersData.filter(p => tierProviderCategoryFilter === 'all' || p.category === tierProviderCategoryFilter);
    const filteredIds = filtered.map(p => p.id);

    setFormData(prev => {
      const updatedTiers = [...prev.amountTiers];
      const currentProviders = updatedTiers[currentTierIndex].providerIds || [];
      updatedTiers[currentTierIndex].providerIds = currentProviders.filter(id => !filteredIds.includes(id));
      return { ...prev, amountTiers: updatedTiers };
    });
  };

  // Dynamic label functions
  const getAmountColumnLabel = (): string => {
    switch (formData.cashbackType) {
      case 'By Net Lose Only':
        return 'WinLoss ';
      case 'By Net Deposit':
        return 'Positive Amount';
      case 'By Total WinLose Only':
        return 'TotalWinLoss';
      default:
        return 'Amount';
    }
  };

  const getProviderTargetLabel = (): string => {
    switch (formData.cashbackType) {
      case 'By Net Lose Only':
        return 'WinLoss Amount';
      case 'By Net Deposit':
        return 'Positive Amount';
      case 'By Total WinLose Only':
        return 'TotalWinLoss Amount';
      default:
        return 'Target Amount';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredCashbacks = getFilteredCashbacks();

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Header with Title and Create Button */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">CashBack Setup Management</h2>
          <Button
            onClick={() => openModal('create')}
            className="bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white font-semibold"
          >
            CREATE CASHBACK
          </Button>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="CashBack Name"
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

      {/* CashBack Setups Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Target Multiplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Levels</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Providers</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCashbacks.map((cashback) => (
                <tr key={cashback.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{cashback.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{cashback.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge className="bg-blue-100 text-blue-800 font-semibold">
                      {cashback.cashbackType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      className={`font-semibold ${
                        cashback.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {cashback.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{cashback.targetMultiplier}x</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {cashback.levelIds && cashback.levelIds.length > 0 ? (
                        cashback.levelIds.map(levelId => {
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
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {cashback.providerSettings && Object.keys(cashback.providerSettings).length > 0 ? (
                        <>
                          {Object.keys(cashback.providerSettings).slice(0, 2).map(providerIdStr => {
                            const providerId = Number(providerIdStr);
                            const provider = providersData.find(p => p.id === providerId);
                            return provider ? (
                              <Badge key={providerId} variant="secondary" className="text-xs">
                                {provider.name}
                              </Badge>
                            ) : null;
                          })}
                          {Object.keys(cashback.providerSettings).length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{Object.keys(cashback.providerSettings).length - 2} more
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">No providers</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{cashback.createdDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => openModal('edit', cashback)}
                        className="bg-[#2196f3] text-white hover:bg-[#1976d2] h-7 px-3 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </Button>
                      <Button
                        onClick={() => handleDelete(cashback.id)}
                        className="bg-[#f44336] text-white hover:bg-[#d32f2f] h-7 px-3 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCashbacks.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    No cashback setups found
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
              {modalMode === 'create' ? 'CREATE CASHBACK' : 'EDIT CASHBACK'}
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
            <div className="flex-1 pl-4 overflow-y-auto min-h-[500px]">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-6 py-2">
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Basic Information</h3>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">CashBack Name *</label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter cashback name"
                          className="w-full h-10"
                        />
                        {validationErrors.name && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">CashBack Type *</label>
                        <select
                          value={formData.cashbackType}
                          onChange={(e) => handleInputChange('cashbackType', e.target.value as 'By Net Lose Only' | 'By Net Deposit' | 'By Total WinLose Only')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="By Net Lose Only">By Net Lose Only</option>
                          <option value="By Net Deposit">By Net Deposit</option>
                          <option value="By Total WinLose Only">By Total WinLose Only</option>
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Time From *</label>
                          <Input
                            type="time"
                            value={formData.timeFrom}
                            onChange={(e) => handleInputChange('timeFrom', e.target.value)}
                            className="w-full h-10"
                          />
                        </div>

                        <div>
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
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6 py-2">
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">CashBack Details</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Unlock Rate Win (%) &lt;=</label>
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
                          {validationErrors.unlockRateWin && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.unlockRateWin}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Unlock Amount Lose &lt;=</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.unlockAmountLose}
                            onChange={(e) => handleInputChange('unlockAmountLose', parseFloat(e.target.value) || 0)}
                            placeholder="Enter amount"
                            className="w-full h-10"
                          />
                          {validationErrors.unlockAmountLose && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.unlockAmountLose}</p>
                          )}
                        </div>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Max Total Payout Amount</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.maxTotalPayoutAmount}
                          onChange={(e) => handleInputChange('maxTotalPayoutAmount', parseFloat(e.target.value) || 0)}
                          placeholder="Enter amount"
                          className="w-full h-10"
                        />
                        {validationErrors.maxTotalPayoutAmount && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.maxTotalPayoutAmount}</p>
                        )}
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
                          {validationErrors.maxWithdrawAmount && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.maxWithdrawAmount}</p>
                          )}
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
                          {validationErrors.maxWithdrawPercentage && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.maxWithdrawPercentage}</p>
                          )}
                        </div>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Recurring</label>
                        <select
                          value={formData.recurring}
                          onChange={(e) => handleInputChange('recurring', e.target.value as 'Immediate' | 'One Time' | 'Recurring')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="Immediate">Immediate</option>
                          <option value="One Time">One Time</option>
                          <option value="Recurring">Recurring</option>
                        </select>
                      </div>

                      {/* Conditional Reset Frequency */}
                      {formData.recurring === 'Recurring' && (
                        <>
                          <div className="w-full">
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Reset Frequency</label>
                            <select
                              value={formData.resetFrequency || ''}
                              onChange={(e) => {
                                const newFrequency = e.target.value as 'Everyday' | 'Every Week' | 'Every Month' | '';
                                handleInputChange('resetFrequency', newFrequency);
                                // Clear resetFrequencyDay when changing frequency
                                if (newFrequency !== formData.resetFrequency) {
                                  handleInputChange('resetFrequencyDay', undefined);
                                }
                              }}
                              className="w-full h-10 px-3 py-2 border rounded-md"
                            >
                              <option value="">Select frequency</option>
                              <option value="Everyday">Everyday</option>
                              <option value="Every Week">Every Week</option>
                              <option value="Every Month">Every Month</option>
                            </select>
                          </div>

                          {/* Day of Week for Every Week */}
                          {formData.resetFrequency === 'Every Week' && (
                            <div className="w-full">
                              <label className="block text-sm font-semibold mb-2 text-gray-700">Day of Week</label>
                              <select
                                value={formData.resetFrequencyDay as string || ''}
                                onChange={(e) => handleInputChange('resetFrequencyDay', e.target.value)}
                                className="w-full h-10 px-3 py-2 border rounded-md"
                              >
                                <option value="">Select day</option>
                                {WEEKDAYS.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Day of Month for Every Month */}
                          {formData.resetFrequency === 'Every Month' && (
                            <div className="w-full">
                              <label className="block text-sm font-semibold mb-2 text-gray-700">Day of Month</label>
                              <select
                                value={formData.resetFrequencyDay as number || ''}
                                onChange={(e) => handleInputChange('resetFrequencyDay', parseInt(e.target.value))}
                                className="w-full h-10 px-3 py-2 border rounded-md"
                              >
                                <option value="">Select day</option>
                                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
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
                      </div>

                      {/* CashBack Calculation Type */}
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">CashBack Calculation Type</label>
                        <select
                          value={formData.cashbackCalculationType}
                          onChange={(e) => handleInputChange('cashbackCalculationType', e.target.value as 'Percentage' | 'Amount')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                        >
                          <option value="Percentage">Percentage</option>
                          <option value="Amount">Amount</option>
                        </select>
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
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">{getAmountColumnLabel()}</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">Formula</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">
                              {formData.cashbackCalculationType === 'Percentage' ? 'CashBack Percentage (%)' : 'CashBack Amount'}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">Provider</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900 border-b">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.amountTiers.map((tier, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {getAmountColumnLabel()}
                              </td>
                              <td className="px-4 py-2">
                                <select
                                  value={tier.formula || ''}
                                  onChange={(e) => handleTierChange(index, 'formula', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border rounded h-8"
                                >
                                  <option value="">Please Select</option>
                                  <option value="MORE_THAN">MORE_THAN</option>
                                  <option value="MORE_THAN_OR_EQUAL">MORE_THAN_OR_EQUAL</option>
                                  <option value="EQUAL">EQUAL</option>
                                  <option value="LESS_THAN">LESS_THAN</option>
                                  <option value="LESS_THAN_OR_EQUAL">LESS_THAN_OR_EQUAL</option>
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  value={tier.amountMoreThanOrEqual || ''}
                                  onChange={(e) => handleTierChange(index, 'amountMoreThanOrEqual', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-4 py-2">
                                {formData.cashbackCalculationType === 'Percentage' ? (
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={tier.cashbackPercentage || ''}
                                    onChange={(e) => handleTierChange(index, 'cashbackPercentage', parseFloat(e.target.value) || 0)}
                                    placeholder="0.0"
                                    className="h-8"
                                  />
                                ) : (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={tier.cashbackAmount || ''}
                                    onChange={(e) => handleTierChange(index, 'cashbackAmount', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="h-8"
                                  />
                                )}
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenTierProviderModal(index)}
                                  className="w-full px-3 py-1.5 border rounded-md text-left bg-white hover:bg-gray-50 text-sm h-8"
                                >
                                  {!tier.providerIds || tier.providerIds.length === 0
                                    ? 'Select providers'
                                    : `${tier.providerIds.length} selected`}
                                </button>
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

              {/* Eligibility Tab */}
              {activeTab === 'eligibility' && (
                <div className="space-y-6">
                  {/* Levels Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Levels</h3>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left w-16">
                              <input
                                type="checkbox"
                                checked={formData.levelIds?.length === initialLevels.length}
                                onChange={toggleAllLevels}
                                className="w-4 h-4"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {initialLevels.map(level => (
                            <tr key={level.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 w-16">
                                <input
                                  type="checkbox"
                                  checked={formData.levelIds?.includes(level.id)}
                                  onChange={() => toggleLevel(level.id)}
                                  className="w-4 h-4"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {level.levelName}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {validationErrors.levelIds && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.levelIds}</p>
                    )}
                  </div>

                  {/* Providers Section with Settings Table */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Providers</h3>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => setProviderCategoryFilter('all')}
                          variant={providerCategoryFilter === 'all' ? 'default' : 'outline'}
                          className="h-8 text-xs"
                        >
                          All Categories
                        </Button>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <Button
                            key={key}
                            onClick={() => setProviderCategoryFilter(key)}
                            variant={providerCategoryFilter === key ? 'default' : 'outline'}
                            className="h-8 text-xs"
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Provider Settings Table */}
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-center w-16">
                              <input
                                type="checkbox"
                                checked={getFilteredProviders().length > 0 && getFilteredProviders().every(p => !!formData.providerSettings[p.id])}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleSelectAllProviders();
                                  } else {
                                    handleDeselectAllProviders();
                                  }
                                }}
                                className="w-4 h-4"
                              />
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Category</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Provider Name</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Min Bet Amount</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Max Bet Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {getFilteredProviders().map(provider => {
                            const settings = formData.providerSettings[provider.id] || {
                              minBetAmount: 0,
                              maxBetAmount: 99999
                            };
                            const isSelected = !!formData.providerSettings[provider.id];

                            return (
                              <tr key={provider.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleProviderToggle(provider.id, e.target.checked)}
                                    className="w-4 h-4"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {categoryLabels[provider.category]}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <span className="font-medium">{provider.name}</span>
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    type="number"
                                    value={settings.minBetAmount}
                                    onChange={(e) => handleProviderSettingChange(provider.id, 'minBetAmount', Number(e.target.value))}
                                    placeholder="0"
                                    className="w-28 h-8 text-sm"
                                    step="0.01"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    type="number"
                                    value={settings.maxBetAmount}
                                    onChange={(e) => handleProviderSettingChange(provider.id, 'maxBetAmount', Number(e.target.value))}
                                    placeholder="99999"
                                    className="w-28 h-8 text-sm"
                                    step="0.01"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {Object.keys(formData.providerSettings).length} provider(s)
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

      {/* Tier Provider Selection Modal */}
      <Dialog open={showTierProviderModal} onOpenChange={setShowTierProviderModal}>
        <DialogContent className="max-w-[60vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              Select Providers for Amount Tier
            </DialogTitle>
          </DialogHeader>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap pb-3 border-b">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                onClick={() => setTierProviderCategoryFilter(key === 'all' ? 'all' : key)}
                className={`h-8 text-xs ${
                  tierProviderCategoryFilter === (key === 'all' ? 'all' : key)
                    ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Provider List Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-center w-16">
                    <input
                      type="checkbox"
                      checked={
                        currentTierIndex !== null &&
                        providersData.filter(p => tierProviderCategoryFilter === 'all' || p.category === tierProviderCategoryFilter).length > 0 &&
                        providersData.filter(p => tierProviderCategoryFilter === 'all' || p.category === tierProviderCategoryFilter).every(p =>
                          (formData.amountTiers[currentTierIndex]?.providerIds || []).includes(p.id)
                        )
                      }
                      onChange={() => {
                        const filtered = providersData.filter(p => tierProviderCategoryFilter === 'all' || p.category === tierProviderCategoryFilter);
                        const filteredIds = filtered.map(p => p.id);
                        const currentProviders = currentTierIndex !== null ? (formData.amountTiers[currentTierIndex]?.providerIds || []) : [];
                        const allFilteredSelected = filteredIds.every(id => currentProviders.includes(id));

                        if (allFilteredSelected) {
                          handleDeselectAllTierProviders();
                        } else {
                          handleSelectAllTierProviders();
                        }
                      }}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Provider Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {providersData
                  .filter(p => tierProviderCategoryFilter === 'all' || p.category === tierProviderCategoryFilter)
                  .map((provider) => {
                    const isSelected = currentTierIndex !== null && (formData.amountTiers[currentTierIndex]?.providerIds || []).includes(provider.id);

                    return (
                      <tr
                        key={provider.id}
                        className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                        onClick={() => handleToggleTierProvider(provider.id)}
                      >
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleTierProvider(provider.id)}
                            className="w-4 h-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="secondary" className="text-xs">
                            {categoryLabels[provider.category] || provider.category}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">{provider.name}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-3 border-t mt-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded flex-1 mr-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">
                  {currentTierIndex !== null ? (formData.amountTiers[currentTierIndex]?.providerIds || []).length : 0}
                </span> provider(s) selected out of <span className="font-semibold">{providersData.length}</span> total
                {tierProviderCategoryFilter !== 'all' && (
                  <span> ({providersData.filter(p => p.category === tierProviderCategoryFilter).length} in current filter)</span>
                )}
              </p>
            </div>
            <Button
              onClick={() => setShowTierProviderModal(false)}
              className="bg-[#3949ab] text-white hover:bg-[#2c3785]"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
