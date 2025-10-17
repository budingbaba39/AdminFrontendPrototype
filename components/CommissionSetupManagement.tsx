import { useState } from 'react';
import { CommissionSetup, sampleCommissionSetups } from './CommissionSetupData';
import { initialLevels } from './LevelData';
import { providersData, categoryLabels } from './ProviderData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, RefreshCw } from 'lucide-react';

type ModalMode = 'create' | 'edit' | null;
type ActiveTab = 'basic' | 'eligibility';

// Default form data
const getDefaultFormData = (): CommissionSetup => ({
  id: '',
  name: '',
  targetType: 'Deposit - Withdraw',
  commissionPercentage: 0,
  targetMultiplier: 1,
  creditLessThan: 0,
  levelIds: [],
  providerIds: [],
  status: 'Active',
  createdDate: new Date().toISOString().split('T')[0],
  createdBy: 'ADMIN001'
});

export default function CommissionSetupManagement() {
  const [commissions, setCommissions] = useState<CommissionSetup[]>(sampleCommissionSetups);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('basic');
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
    setActiveTab('basic');
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
      setFormData({ ...commission });
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

    if (!formData.name.trim()) errors.name = 'Commission name is required';
    if (formData.commissionPercentage < 0 || formData.commissionPercentage > 100) {
      errors.commissionPercentage = 'Commission percentage must be between 0-100%';
    }
    if (formData.targetMultiplier <= 0) errors.targetMultiplier = 'Target multiplier must be greater than 0';
    if (formData.creditLessThan <= 0) errors.creditLessThan = 'Credit less than must be greater than 0';

    // Level validation for all types
    if (!formData.levelIds || formData.levelIds.length === 0) {
      errors.levelIds = 'At least one level must be selected';
    }

    // Provider validation ONLY for Valid Bet
    if (formData.targetType === 'Valid Bet') {
      if (!formData.providerIds || formData.providerIds.length === 0) {
        errors.providerIds = 'At least one provider must be selected for Valid Bet target type';
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Commission Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Credit Less Than</th>
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
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{commission.commissionPercentage}%</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(commission.creditLessThan)}</td>
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
                onClick={() => setActiveTab('basic')}
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === 'basic'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Basic Info
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
              {activeTab === 'basic' && (
                <div className="space-y-6 py-2">
                  {/* Basic Info Section */}
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
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Commission Percentage (%) *</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.commissionPercentage}
                          onChange={(e) => handleInputChange('commissionPercentage', parseFloat(e.target.value) || 0)}
                          placeholder="0-100"
                          className="w-full h-10"
                        />
                        {validationErrors.commissionPercentage && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.commissionPercentage}</p>
                        )}
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
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Credit Less Than *</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.creditLessThan}
                          onChange={(e) => handleInputChange('creditLessThan', parseFloat(e.target.value) || 0)}
                          placeholder="Maximum credit threshold"
                          className="w-full h-10"
                        />
                        {validationErrors.creditLessThan && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.creditLessThan}</p>
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
                                checked={(formData.levelIds?.length || 0) === initialLevels.length}
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
                                formData.levelIds?.includes(level.id) ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => toggleLevel(level.id)}
                            >
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={formData.levelIds?.includes(level.id) || false}
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
                        <span className="font-semibold">{formData.levelIds?.length || 0}</span> level(s) selected out of <span className="font-semibold">{initialLevels.length}</span>
                      </p>
                    </div>
                    {validationErrors.levelIds && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.levelIds}</p>
                    )}
                  </div>

                  {/* Provider Selection - ONLY show for 'Valid Bet' */}
                  {formData.targetType === 'Valid Bet' && (
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Provider Selection</h3>
                        {/* Category Filter */}
                        <div className="flex gap-2 flex-wrap pb-3 mb-3">
                          <Button
                            type="button"
                            onClick={() => setProviderCategoryFilter('all')}
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
                                      providersData.filter(p => providerCategoryFilter === 'all' || p.category === providerCategoryFilter).every(p => formData.providerIds?.includes(p.id))
                                    }
                                    onChange={() => {
                                      const filtered = providersData.filter(p => providerCategoryFilter === 'all' || p.category === providerCategoryFilter);
                                      const filteredIds = filtered.map(p => p.id);
                                      const allFilteredSelected = filteredIds.every(id => formData.providerIds?.includes(id));

                                      if (allFilteredSelected) {
                                        handleInputChange('providerIds', (formData.providerIds || []).filter(id => !filteredIds.includes(id)));
                                      } else {
                                        handleInputChange('providerIds', [...new Set([...(formData.providerIds || []), ...filteredIds])]);
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
                                .filter(p => providerCategoryFilter === 'all' || p.category === providerCategoryFilter)
                                .map((provider) => (
                                <tr
                                  key={provider.id}
                                  className={`hover:bg-gray-50 cursor-pointer ${
                                    formData.providerIds?.includes(provider.id) ? 'bg-blue-50' : ''
                                  }`}
                                  onClick={() => toggleProvider(provider.id)}
                                >
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={formData.providerIds?.includes(provider.id) || false}
                                      onChange={() => toggleProvider(provider.id)}
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
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">{formData.providerIds?.length || 0}</span> provider(s) selected out of <span className="font-semibold">{providersData.length}</span> total
                            {providerCategoryFilter !== 'all' && (
                              <span> ({providersData.filter(p => p.category === providerCategoryFilter).length} in current filter)</span>
                            )}
                          </p>
                        </div>
                        {validationErrors.providerIds && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.providerIds}</p>
                        )}
                      </div>
                  )}

                  {/* Info message for non-Valid Bet types */}
                  {formData.targetType !== 'Valid Bet' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <p className="text-lg font-semibold text-yellow-800 mb-2">
                        Provider Selection Not Applicable
                      </p>
                      <p className="text-sm text-yellow-700">
                        Provider selection is only applicable for "Valid Bet" target type.
                        For "{formData.targetType}", only level selection is required.
                      </p>
                    </div>
                  )}
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
