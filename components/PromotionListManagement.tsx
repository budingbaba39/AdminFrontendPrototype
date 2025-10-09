import { useState } from 'react';
import { Promotion, initialPromotions } from './PromotionListData';
import { initialLevels } from './LevelData';
import { providersData, categoryLabels } from './ProviderData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, X, RefreshCw } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type ModalMode = 'create' | 'edit' | 'view' | null;
type ActiveTab = 'info' | 'details' | 'languages' | 'eligibility';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_IN_MONTH: Record<string, number> = {
  'January': 31, 'February': 29, 'March': 31, 'April': 30,
  'May': 31, 'June': 30, 'July': 31, 'August': 31,
  'September': 30, 'October': 31, 'November': 30, 'December': 31
};

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Default form data
const getDefaultFormData = (): Promotion => ({
  id: '',
  promoName: '',
  promoType: 'Deposit',
  allowInterTransfer: false,
  unlockRateWin: 0,
  unlockAmountLose: 0,
  minTimeOfDeposit: 0,
  minDeposit: 1,
  maxClaimBonus: 1,
  bonusRate: 0,
  bonusFixedAmount: 0,
  bonusRandom: { min: 0, max: 0 },
  maxWithdraw: 0,
  validFrom: '',
  validTo: '',
  status: 'Active',
  targetType: 'Valid Bet',
  targetMultiplier: 1,
  recurring: 'Immediate',
  timeFrom: '00:00',
  timeTo: '23:59',
  includeRebate: false,
  requireApproval: false,
  levelIds: [],
  providerIds: [],
  memberApplied: 0,
  createdDate: new Date().toISOString().split('T')[0]
});

// Default language translations
const getDefaultTranslations = () => ({
  english: { title: '', name: '' },
  chinese: { title: '', name: '' },
  malay: { title: '', name: '' }
});

export default function PromotionListManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Filter states
  const [filterPromoType, setFilterPromoType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPromoId, setFilterPromoId] = useState<string>('');
  const [filterPromoName, setFilterPromoName] = useState<string>('');
  const [filterValidFrom, setFilterValidFrom] = useState<string>('');
  const [filterLevels, setFilterLevels] = useState<number[]>([]);
  const [filterProviders, setFilterProviders] = useState<number[]>([]);

  // Form state
  const [formData, setFormData] = useState<Promotion>(getDefaultFormData());
  const [languageTranslations, setLanguageTranslations] = useState(getDefaultTranslations());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Multi-select dropdowns visibility
  const [showFilterLevelDropdown, setShowFilterLevelDropdown] = useState(false);
  const [showFilterProviderModal, setShowFilterProviderModal] = useState(false);
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<string>('all');
  const [filterProviderCategoryFilter, setFilterProviderCategoryFilter] = useState<string>('all');

  // Get filtered promotions
  const getFilteredPromotions = () => {
    return promotions.filter(promo => {
      if (filterPromoType !== 'All' && promo.promoType !== filterPromoType) return false;
      if (filterStatus !== 'All' && promo.status !== filterStatus) return false;
      if (filterPromoId && !promo.id.includes(filterPromoId)) return false;
      if (filterPromoName && !promo.promoName.toLowerCase().includes(filterPromoName.toLowerCase())) return false;
      if (filterValidFrom && promo.validFrom < filterValidFrom) return false;
      if (filterLevels.length > 0 && !filterLevels.some(levelId => promo.levelIds.includes(levelId))) return false;
      if (filterProviders.length > 0 && !filterProviders.some(providerId => promo.providerIds.includes(providerId))) return false;
      return true;
    });
  };

  const handleResetFilters = () => {
    setFilterPromoType('All');
    setFilterStatus('All');
    setFilterPromoId('');
    setFilterPromoName('');
    setFilterValidFrom('');
    setFilterLevels([]);
    setFilterProviders([]);
  };

  const openModal = (mode: ModalMode, promotion?: Promotion) => {
    setModalMode(mode);
    setActiveTab('info');
    setValidationErrors({});

    if (mode === 'create') {
      const newFormData = getDefaultFormData();
      // Generate new ID in PROMO format
      const maxNumericId = Math.max(
        ...promotions.map(p => {
          const match = p.id.match(/PROMO(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }),
        0
      );
      newFormData.id = `PROMO${String(maxNumericId + 1).padStart(3, '0')}`;
      setFormData(newFormData);
      setEditingPromotion(null);
      setLanguageTranslations(getDefaultTranslations());
    } else if (promotion) {
      setFormData({ ...promotion });
      setEditingPromotion(promotion);
      setLanguageTranslations(promotion.translations || getDefaultTranslations());
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingPromotion(null);
    setFormData(getDefaultFormData());
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.promoName.trim()) errors.promoName = 'Promotion name is required';
    if (formData.minDeposit <= 0) errors.minDeposit = 'Min deposit must be greater than 0';
    if (formData.maxClaimBonus < formData.minDeposit) errors.maxClaimBonus = 'Max claim bonus must be >= min deposit';
    if (formData.bonusRate < 0 || formData.bonusRate > 100) errors.bonusRate = 'Bonus rate must be between 0-100%';
    if (formData.unlockRateWin < 0 || formData.unlockRateWin > 100) errors.unlockRateWin = 'Unlock rate must be between 0-100%';
    if (formData.targetMultiplier <= 0) errors.targetMultiplier = 'Target multiplier must be greater than 0';
    if (!formData.validFrom) errors.validFrom = 'Valid from date is required';
    if (!formData.validTo) errors.validTo = 'Valid to date is required';
    if (formData.validFrom && formData.validTo && formData.validTo <= formData.validFrom) {
      errors.validTo = 'Valid to must be after valid from';
    }
    if (formData.timeTo <= formData.timeFrom) errors.timeTo = 'Time to must be after time from';
    if (formData.levelIds.length === 0) errors.levelIds = 'At least one level must be selected';
    if (formData.providerIds.length === 0) errors.providerIds = 'At least one provider must be selected';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (modalMode === 'create') {
      setPromotions([...promotions, { ...formData, memberApplied: 0 }]);
    } else if (modalMode === 'edit') {
      setPromotions(promotions.map(p => p.id === formData.id ? formData : p));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      setPromotions(promotions.filter(p => p.id !== id));
    }
  };

  const handleInputChange = (field: keyof Promotion, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Clear reset frequency fields when changing to "Immediate" or "One Time"
      if (field === 'recurring' && (value === 'Immediate' || value === 'One Time')) {
        updated.resetFrequency = undefined;
        updated.resetFrequencyMonth = undefined;
        updated.resetFrequencyDay = undefined;
      }

      // Clear day when changing reset frequency
      if (field === 'resetFrequency') {
        updated.resetFrequencyDay = undefined;
      }

      return updated;
    });
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
      levelIds: prev.levelIds.length === allLevelIds.length ? [] : allLevelIds
    }));
  };

  const toggleProvider = (providerId: number) => {
    setFormData(prev => ({
      ...prev,
      providerIds: prev.providerIds.includes(providerId)
        ? prev.providerIds.filter(id => id !== providerId)
        : [...prev.providerIds, providerId]
    }));
  };

  const toggleFilterLevel = (levelId: number) => {
    setFilterLevels(prev =>
      prev.includes(levelId) ? prev.filter(id => id !== levelId) : [...prev, levelId]
    );
  };

  const toggleAllFilterLevels = () => {
    const allLevelIds = initialLevels.map(l => l.id);
    setFilterLevels(prev => prev.length === allLevelIds.length ? [] : allLevelIds);
  };

  const toggleFilterProvider = (providerId: number) => {
    setFilterProviders(prev =>
      prev.includes(providerId) ? prev.filter(id => id !== providerId) : [...prev, providerId]
    );
  };

  const getDaysForMonth = (month: string): number[] => {
    const maxDay = DAYS_IN_MONTH[month] || 31;
    return Array.from({ length: maxDay }, (_, i) => i + 1);
  };

  const filteredPromotions = getFilteredPromotions();
  const isReadOnly = modalMode === 'view';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promotion List Management</h1>
        <Button
          onClick={() => openModal('create')}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          CREATE PROMOTION
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Promotion Type</label>
            <select
              value={filterPromoType}
              onChange={(e) => setFilterPromoType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="All">All</option>
              <option value="Deposit">Deposit</option>
              <option value="Free">Free</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Promotion ID</label>
            <Input
              type="text"
              value={filterPromoId}
              onChange={(e) => setFilterPromoId(e.target.value)}
              placeholder="Search by ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Promotion Name</label>
            <Input
              type="text"
              value={filterPromoName}
              onChange={(e) => setFilterPromoName(e.target.value)}
              placeholder="Search by name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Valid From</label>
            <Input
              type="date"
              value={filterValidFrom}
              onChange={(e) => setFilterValidFrom(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">Level</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilterLevelDropdown(!showFilterLevelDropdown)}
                className="w-full px-3 py-2 border rounded-md text-left bg-white"
              >
                {filterLevels.length === 0 ? 'Select levels' : `${filterLevels.length} selected`}
              </button>
              {showFilterLevelDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <label className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterLevels.length === initialLevels.length}
                        onChange={toggleAllFilterLevels}
                      />
                      <span className="font-medium">Select All</span>
                    </label>
                  </div>
                  {initialLevels.map(level => (
                    <div key={level.id} className="p-2">
                      <label className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterLevels.includes(level.id)}
                          onChange={() => toggleFilterLevel(level.id)}
                        />
                        <span>{level.levelName}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {filterLevels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filterLevels.map(levelId => {
                  const level = initialLevels.find(l => l.id === levelId);
                  return level ? (
                    <Badge key={levelId} variant="secondary" className="text-xs">
                      {level.levelName}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => toggleFilterLevel(levelId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <button
              type="button"
              onClick={() => setShowFilterProviderModal(true)}
              className="w-full px-3 py-2 border rounded-md text-left bg-white hover:bg-gray-50 text-sm"
            >
              {filterProviders.length === 0 ? 'Select providers' : `${filterProviders.length} selected`}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            SEARCH
          </Button>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="text-sm text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Promotion Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Promotion ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Promotion Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Level Applied</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Valid From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Valid To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Bonus Rate (%)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Bonus (Fixed Amount)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Bonus (Random)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Member Applied</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredPromotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Badge
                    className={`font-semibold ${
                      promo.promoType === 'Deposit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {promo.promoType}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-900">{promo.id}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{promo.promoName}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {promo.levelIds.map(levelId => {
                      const level = initialLevels.find(l => l.id === levelId);
                      return level ? (
                        <Badge key={levelId} variant="outline" className="text-xs">
                          {level.levelName}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-900">{promo.validFrom}</td>
                <td className="px-4 py-3 text-gray-900">{promo.validTo}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{promo.bonusRate}%</td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  ${promo.bonusFixedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {promo.bonusRandom.min > 0 || promo.bonusRandom.max > 0
                    ? `$${promo.bonusRandom.min}-$${promo.bonusRandom.max}`
                    : '$0'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {promo.providerIds.slice(0, 2).map(providerId => {
                      const provider = providersData.find(p => p.id === providerId);
                      return provider ? (
                        <Badge key={providerId} variant="secondary" className="text-xs">
                          {provider.icon} {provider.name}
                        </Badge>
                      ) : null;
                    })}
                    {promo.providerIds.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{promo.providerIds.length - 2} more
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">{promo.memberApplied}</td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    className={`font-semibold ${
                      promo.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {promo.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal('edit', promo)}
                      className="bg-[#2196f3] text-white hover:bg-[#1976d2] border-[#2196f3] h-7 px-2"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      EDIT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(promo.id)}
                      className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] h-7 px-2"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      DELETE
                    </Button>
                  </div>
                </td>
                </tr>
              ))}
              {filteredPromotions.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                    No promotions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit/View Modal */}
      <Dialog open={modalMode !== null} onOpenChange={closeModal}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              {modalMode === 'create' ? 'CREATE PROMOTION' : modalMode === 'edit' ? 'EDIT PROMOTION' : 'VIEW PROMOTION'}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
              >
                Eligibility
              </button>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 pl-4 overflow-y-auto min-h-[500px]">
              {activeTab === 'info' && (
                <div className="space-y-6 py-2">
                  {/* Basic Info Section */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Basic Info</h3>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Promo Name *</label>
                        <Input
                          type="text"
                          value={formData.promoName}
                          onChange={(e) => handleInputChange('promoName', e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Enter promotion name"
                          className="w-full h-10"
                        />
                        {validationErrors.promoName && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.promoName}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Promo Type *</label>
                        <select
                          value={formData.promoType}
                          onChange={(e) => handleInputChange('promoType', e.target.value as 'Deposit' | 'Free')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                          disabled={isReadOnly}
                        >
                          <option value="Deposit">Deposit</option>
                          <option value="Free">Free</option>
                        </select>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Allow Inter Transfer *</label>
                        <select
                          value={formData.allowInterTransfer ? 'Yes' : 'No'}
                          onChange={(e) => handleInputChange('allowInterTransfer', e.target.value === 'Yes')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                          disabled={isReadOnly}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-4">
                      {/* Valid From */}
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Valid From *</label>
                        <Input
                          type="date"
                          value={formData.validFrom}
                          onChange={(e) => handleInputChange('validFrom', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full h-10"
                        />
                        {validationErrors.validFrom && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.validFrom}</p>
                        )}
                      </div>

                      {/* Valid To */}
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Valid To *</label>
                        <Input
                          type="date"
                          value={formData.validTo}
                          onChange={(e) => handleInputChange('validTo', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full h-10"
                        />
                        {validationErrors.validTo && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.validTo}</p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Status *</label>
                        <select
                          value={formData.status}
                          onChange={(e) => handleInputChange('status', e.target.value as 'Active' | 'Inactive')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                          disabled={isReadOnly}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      {/* Time From */}
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Time From *</label>
                        <Input
                          type="time"
                          value={formData.timeFrom}
                          onChange={(e) => handleInputChange('timeFrom', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full h-10"
                        />
                      </div>

                      {/* Time To */}
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Time To *</label>
                        <Input
                          type="time"
                          value={formData.timeTo}
                          onChange={(e) => handleInputChange('timeTo', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full h-10"
                        />
                        {validationErrors.timeTo && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.timeTo}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6 py-2">
                  {/* Bonus Info Section - moved here */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Bonus Info</h3>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Unlock Rate (%) *</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.unlockRateWin}
                          onChange={(e) => handleInputChange('unlockRateWin', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          placeholder="0-100"
                          className="w-full h-10"
                        />
                        {validationErrors.unlockRateWin && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.unlockRateWin}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          Unlock Amount {'<='} *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.unlockAmountLose}
                          onChange={(e) => handleInputChange('unlockAmountLose', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          placeholder="0"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Min Time of Deposit *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.minTimeOfDeposit}
                          onChange={(e) => handleInputChange('minTimeOfDeposit', parseInt(e.target.value) || 0)}
                          disabled={isReadOnly}
                          placeholder="0"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Min Deposit *</label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.minDeposit}
                          onChange={(e) => handleInputChange('minDeposit', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          placeholder="Minimum deposit amount"
                          className="w-full h-10"
                        />
                        {validationErrors.minDeposit && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.minDeposit}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Max Claim Bonus *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.maxClaimBonus}
                          onChange={(e) => handleInputChange('maxClaimBonus', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          placeholder="Maximum bonus"
                          className="w-full h-10"
                        />
                        {validationErrors.maxClaimBonus && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.maxClaimBonus}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Bonus Rate (%) *</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.bonusRate}
                          onChange={(e) => handleInputChange('bonusRate', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          placeholder="0-100"
                          className="w-full h-10"
                        />
                        {validationErrors.bonusRate && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.bonusRate}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Bonus Fixed Amount *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.bonusFixedAmount}
                          onChange={(e) => handleInputChange('bonusFixedAmount', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          placeholder="Fixed bonus"
                          className="w-full h-10"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Bonus Random *</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Min</label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Min amount"
                              value={formData.bonusRandom.min}
                              onChange={(e) => handleInputChange('bonusRandom', {
                                ...formData.bonusRandom,
                                min: parseFloat(e.target.value) || 0
                              })}
                              disabled={isReadOnly}
                              className="w-full h-10"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Max</label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Max amount"
                              value={formData.bonusRandom.max}
                              onChange={(e) => handleInputChange('bonusRandom', {
                                ...formData.bonusRandom,
                                max: parseFloat(e.target.value) || 0
                              })}
                              disabled={isReadOnly}
                              className="w-full h-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Max withdraw (less than 1 is percent, otherwise is fix value)
 *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.maxWithdraw}
                          onChange={(e) => handleInputChange('maxWithdraw', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          placeholder="Maximum withdrawal"
                          className="w-full h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Target Type *</label>
                        <select
                          value={formData.targetType}
                          onChange={(e) => handleInputChange('targetType', e.target.value as 'Valid Bet' | 'By Balance WinOver')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                          disabled={isReadOnly}
                        >
                          <option value="Valid Bet">Valid Bet</option>
                          <option value="By Balance WinOver">By Balance WinOver</option>
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
                          disabled={isReadOnly}
                          placeholder="e.g., 1.5"
                          className="w-full h-10"
                        />
                        {validationErrors.targetMultiplier && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.targetMultiplier}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Recurring *</label>
                        <select
                          value={formData.recurring}
                          onChange={(e) => handleInputChange('recurring', e.target.value as 'Immediate' | 'One Time' | 'Recurring')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                          disabled={isReadOnly}
                        >
                          <option value="Immediate">Immediate</option>
                          <option value="One Time">One Time</option>
                          <option value="Recurring">Recurring</option>
                        </select>
                      </div>

                      {formData.recurring === 'Recurring' && (
                        <>
                          <div className="w-full">
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Reset Frequency *</label>
                            <select
                              value={formData.resetFrequency || ''}
                              onChange={(e) => handleInputChange('resetFrequency', e.target.value as 'Everyday' | 'Every Week' | 'Every Month')}
                              className="w-full h-10 px-3 py-2 border rounded-md"
                              disabled={isReadOnly}
                            >
                              <option value="">Select frequency</option>
                              <option value="Everyday">Everyday</option>
                              <option value="Every Week">Every Week</option>
                              <option value="Every Month">Every Month</option>
                            </select>
                          </div>

                          {formData.resetFrequency === 'Every Week' && (
                            <div className="w-full">
                              <label className="block text-sm font-semibold mb-2 text-gray-700">Day of Week *</label>
                              <select
                                value={formData.resetFrequencyDay as string || ''}
                                onChange={(e) => handleInputChange('resetFrequencyDay', e.target.value)}
                                className="w-full h-10 px-3 py-2 border rounded-md"
                                disabled={isReadOnly}
                              >
                                <option value="">Select day</option>
                                {WEEKDAYS.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {formData.resetFrequency === 'Every Month' && (
                            <div className="w-full">
                              <label className="block text-sm font-semibold mb-2 text-gray-700">Day of Month (1-28) *</label>
                              <select
                                value={formData.resetFrequencyDay as number || ''}
                                onChange={(e) => handleInputChange('resetFrequencyDay', parseInt(e.target.value))}
                                className="w-full h-10 px-3 py-2 border rounded-md"
                                disabled={isReadOnly}
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

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Include Rebate *</label>
                        <select
                          value={formData.includeRebate ? 'Yes' : 'No'}
                          onChange={(e) => handleInputChange('includeRebate', e.target.value === 'Yes')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                          disabled={isReadOnly}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Require Approval *</label>
                        <select
                          value={formData.requireApproval ? 'Yes' : 'No'}
                          onChange={(e) => handleInputChange('requireApproval', e.target.value === 'Yes')}
                          className="w-full h-10 px-3 py-2 border rounded-md"
                          disabled={isReadOnly}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'languages' && (
                <div className="space-y-4 min-h-[500px]">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">English</h3>
                      <div className="space-y-4">
                        <div className="w-full">
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Title (English) *</label>
                          <ReactQuill
                            value={languageTranslations.english.title}
                            onChange={(value) => setLanguageTranslations(prev => ({
                              ...prev,
                              english: { ...prev.english, title: value }
                            }))}
                            readOnly={isReadOnly}
                            className="bg-white"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Name (English) *</label>
                          <ReactQuill
                            value={languageTranslations.english.name}
                            onChange={(value) => setLanguageTranslations(prev => ({
                              ...prev,
                              english: { ...prev.english, name: value }
                            }))}
                            readOnly={isReadOnly}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Chinese</h3>
                      <div className="space-y-4">
                        <div className="w-full">
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Title (Chinese) *</label>
                          <ReactQuill
                            value={languageTranslations.chinese.title}
                            onChange={(value) => setLanguageTranslations(prev => ({
                              ...prev,
                              chinese: { ...prev.chinese, title: value }
                            }))}
                            readOnly={isReadOnly}
                            className="bg-white"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Name (Chinese) *</label>
                          <ReactQuill
                            value={languageTranslations.chinese.name}
                            onChange={(value) => setLanguageTranslations(prev => ({
                              ...prev,
                              chinese: { ...prev.chinese, name: value }
                            }))}
                            readOnly={isReadOnly}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Malay</h3>
                      <div className="space-y-4">
                        <div className="w-full">
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Title (Malay) *</label>
                          <ReactQuill
                            value={languageTranslations.malay.title}
                            onChange={(value) => setLanguageTranslations(prev => ({
                              ...prev,
                              malay: { ...prev.malay, title: value }
                            }))}
                            readOnly={isReadOnly}
                            className="bg-white"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Name (Malay) *</label>
                          <ReactQuill
                            value={languageTranslations.malay.name}
                            onChange={(value) => setLanguageTranslations(prev => ({
                              ...prev,
                              malay: { ...prev.malay, name: value }
                            }))}
                            readOnly={isReadOnly}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'eligibility' && (
                <div className="space-y-4 min-h-[500px]">
                  {/* Level Selection */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Level Selection</h3>
                    <div className="bg-white rounded-lg border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase w-12">
                              <input
                                type="checkbox"
                                checked={formData.levelIds.length === initialLevels.length}
                                onChange={toggleAllLevels}
                                disabled={isReadOnly}
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
                              onClick={() => !isReadOnly && toggleLevel(level.id)}
                            >
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={formData.levelIds.includes(level.id)}
                                  onChange={() => toggleLevel(level.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={isReadOnly}
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
                    {validationErrors.levelIds && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.levelIds}</p>
                    )}
                  </div>

                  {/* Provider Selection */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Provider Selection</h3>
                    {/* Category Filter */}
                    <div className="flex gap-2 flex-wrap pb-3 mb-3">
                      <Button
                        type="button"
                        onClick={() => setProviderCategoryFilter('all')}
                        disabled={isReadOnly}
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
                        disabled={isReadOnly}
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
                        disabled={isReadOnly}
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
                        disabled={isReadOnly}
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
                        disabled={isReadOnly}
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
                        disabled={isReadOnly}
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
                        disabled={isReadOnly}
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
                        disabled={isReadOnly}
                        className={`h-8 text-xs ${
                          providerCategoryFilter === 'sports'
                            ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        ⚽ Sports
                      </Button>
                    </div>

                    <div className="bg-white rounded-lg border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase w-12">
                              <input
                                type="checkbox"
                                checked={
                                  providersData.filter(p => providerCategoryFilter === 'all' || p.category === providerCategoryFilter).length > 0 &&
                                  providersData.filter(p => providerCategoryFilter === 'all' || p.category === providerCategoryFilter).every(p => formData.providerIds.includes(p.id))
                                }
                                onChange={() => {
                                  const filtered = providersData.filter(p => providerCategoryFilter === 'all' || p.category === providerCategoryFilter);
                                  const filteredIds = filtered.map(p => p.id);
                                  const allFilteredSelected = filteredIds.every(id => formData.providerIds.includes(id));

                                  if (allFilteredSelected) {
                                    handleInputChange('providerIds', formData.providerIds.filter(id => !filteredIds.includes(id)));
                                  } else {
                                    handleInputChange('providerIds', [...new Set([...formData.providerIds, ...filteredIds])]);
                                  }
                                }}
                                disabled={isReadOnly}
                                className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Provider Name</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                          {providersData
                            .filter(p => providerCategoryFilter === 'all' || p.category === providerCategoryFilter)
                            .map((provider) => (
                            <tr
                              key={provider.id}
                              className={`hover:bg-gray-50 cursor-pointer ${
                                formData.providerIds.includes(provider.id) ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => !isReadOnly && toggleProvider(provider.id)}
                            >
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={formData.providerIds.includes(provider.id)}
                                  onChange={() => toggleProvider(provider.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={isReadOnly}
                                  className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Badge className="bg-[#3949ab] text-white font-semibold">
                                  {categoryLabels[provider.category]}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {provider.name}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">{formData.providerIds.length}</span> provider(s) selected out of <span className="font-semibold">{providersData.length}</span> total
                        {providerCategoryFilter !== 'all' && (
                          <span> ({providersData.filter(p => p.category === providerCategoryFilter).length} in current filter)</span>
                        )}
                      </p>
                    </div>
                    {validationErrors.providerIds && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.providerIds}</p>
                    )}
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
              {isReadOnly ? 'CLOSE' : 'CANCEL'}
            </Button>
            {!isReadOnly && (
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-base font-semibold shadow-md"
                size="lg"
              >
                {modalMode === 'create' ? 'CREATE PROMOTION' : 'UPDATE PROMOTION'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Provider Selection Modal */}
      <Dialog open={showFilterProviderModal} onOpenChange={setShowFilterProviderModal}>
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
              onClick={() => setFilterProviderCategoryFilter('all')}
              className={`h-8 text-xs ${
                filterProviderCategoryFilter === 'all'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </Button>
            <Button
              type="button"
              onClick={() => setFilterProviderCategoryFilter('cricket')}
              className={`h-8 text-xs ${
                filterProviderCategoryFilter === 'cricket'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏏 Cricket
            </Button>
            <Button
              type="button"
              onClick={() => setFilterProviderCategoryFilter('slot')}
              className={`h-8 text-xs ${
                filterProviderCategoryFilter === 'slot'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎰 Slot
            </Button>
            <Button
              type="button"
              onClick={() => setFilterProviderCategoryFilter('3d-game')}
              className={`h-8 text-xs ${
                filterProviderCategoryFilter === '3d-game'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎮 3D Game
            </Button>
            <Button
              type="button"
              onClick={() => setFilterProviderCategoryFilter('live-casino')}
              className={`h-8 text-xs ${
                filterProviderCategoryFilter === 'live-casino'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎲 Live Casino
            </Button>
            <Button
              type="button"
              onClick={() => setFilterProviderCategoryFilter('fishing')}
              className={`h-8 text-xs ${
                filterProviderCategoryFilter === 'fishing'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎣 Fishing
            </Button>
            <Button
              type="button"
              onClick={() => setFilterProviderCategoryFilter('esports')}
              className={`h-8 text-xs ${
                filterProviderCategoryFilter === 'esports'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎮 Esports
            </Button>
            <Button
              type="button"
              onClick={() => setFilterProviderCategoryFilter('sports')}
              className={`h-8 text-xs ${
                filterProviderCategoryFilter === 'sports'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⚽ Sports
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase w-12">
                      <input
                        type="checkbox"
                        checked={
                          providersData.filter(p => filterProviderCategoryFilter === 'all' || p.category === filterProviderCategoryFilter).length > 0 &&
                          providersData.filter(p => filterProviderCategoryFilter === 'all' || p.category === filterProviderCategoryFilter).every(p => filterProviders.includes(p.id))
                        }
                        onChange={() => {
                          const filtered = providersData.filter(p => filterProviderCategoryFilter === 'all' || p.category === filterProviderCategoryFilter);
                          const filteredIds = filtered.map(p => p.id);
                          const allFilteredSelected = filteredIds.every(id => filterProviders.includes(id));

                          if (allFilteredSelected) {
                            setFilterProviders(filterProviders.filter(id => !filteredIds.includes(id)));
                          } else {
                            setFilterProviders([...new Set([...filterProviders, ...filteredIds])]);
                          }
                        }}
                        className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Provider Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {providersData
                    .filter(p => filterProviderCategoryFilter === 'all' || p.category === filterProviderCategoryFilter)
                    .map((provider) => (
                    <tr
                      key={provider.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        filterProviders.includes(provider.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => toggleFilterProvider(provider.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={filterProviders.includes(provider.id)}
                          onChange={() => toggleFilterProvider(provider.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-[#3949ab] text-white font-semibold">
                          {categoryLabels[provider.category]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {provider.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t mt-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded flex-1 mr-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{filterProviders.length}</span> provider(s) selected out of <span className="font-semibold">{providersData.length}</span> total
                {filterProviderCategoryFilter !== 'all' && (
                  <span> ({providersData.filter(p => p.category === filterProviderCategoryFilter).length} in current filter)</span>
                )}
              </p>
            </div>
            <Button
              onClick={() => setShowFilterProviderModal(false)}
              className="bg-[#4caf50] hover:bg-[#45a049] text-white"
            >
              APPLY
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
