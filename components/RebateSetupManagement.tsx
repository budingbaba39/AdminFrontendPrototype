import { useState } from 'react';
import { RebateSetup, RebateAmountTier, rebateSetupsData } from './RebateSetupData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';

export default function RebateSetupManagement() {
  const [rebateSetups, setRebateSetups] = useState<RebateSetup[]>(rebateSetupsData);
  const [filterName, setFilterName] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRebate, setSelectedRebate] = useState<RebateSetup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rebateType: 'Valid Bet' as 'Valid Bet',
    minLimit: 1,
    maxLimit: 99999,
    amountTiers: [{ validBetMoreThan: 0, rebatePercentage: 0 }] as RebateAmountTier[]
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Filter rebate setups
  const filteredRebateSetups = rebateSetups.filter(rebate => {
    if (filterName && !rebate.name.toLowerCase().includes(filterName.toLowerCase())) return false;
    return true;
  });

  // Handle search
  const handleSearch = () => {
    // Filtering is already reactive, this is just for the button click
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilterName('');
  };

  // Handle add tier
  const handleAddTier = () => {
    setFormData(prev => ({
      ...prev,
      amountTiers: [...prev.amountTiers, { validBetMoreThan: 0, rebatePercentage: 0 }]
    }));
  };

  // Handle delete tier
  const handleDeleteTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amountTiers: prev.amountTiers.filter((_, i) => i !== index)
    }));
  };

  // Handle tier change with auto-sort
  const handleTierChange = (index: number, field: 'validBetMoreThan' | 'rebatePercentage', value: number) => {
    setFormData(prev => {
      const updatedTiers = [...prev.amountTiers];
      updatedTiers[index] = { ...updatedTiers[index], [field]: value };
      // Auto-sort by validBetMoreThan ascending
      updatedTiers.sort((a, b) => a.validBetMoreThan - b.validBetMoreThan);
      return { ...prev, amountTiers: updatedTiers };
    });
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Rebate name is required';
    if (formData.minLimit <= 0) errors.minLimit = 'Min limit must be greater than 0';
    if (formData.maxLimit < formData.minLimit) errors.maxLimit = 'Max limit must be >= min limit';
    if (formData.amountTiers.length === 0) errors.amountTiers = 'At least one tier is required';

    // Check for empty tier values
    const hasEmptyTiers = formData.amountTiers.some(t =>
      t.validBetMoreThan === 0 || t.rebatePercentage === 0
    );
    if (hasEmptyTiers) errors.amountTiers = 'All tier amounts and percentages must be filled';

    // Check for duplicate amounts
    const amounts = formData.amountTiers.map(t => t.validBetMoreThan);
    const hasDuplicates = amounts.some((amt, idx) => amounts.indexOf(amt) !== idx);
    if (hasDuplicates) errors.amountTiers = 'Duplicate tier amounts are not allowed';

    // Check rebate percentage range
    const invalidPercentage = formData.amountTiers.some(t =>
      t.rebatePercentage < 0 || t.rebatePercentage > 100
    );
    if (invalidPercentage) errors.amountTiers = 'Rebate percentage must be between 0-100%';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open create modal
  const openCreateModal = () => {
    setFormData({
      name: '',
      rebateType: 'Valid Bet',
      minLimit: 1,
      maxLimit: 99999,
      amountTiers: [{ validBetMoreThan: 0, rebatePercentage: 0 }]
    });
    setValidationErrors({});
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (rebate: RebateSetup) => {
    setSelectedRebate(rebate);
    setFormData({
      name: rebate.name,
      rebateType: rebate.rebateType,
      minLimit: rebate.minLimit,
      maxLimit: rebate.maxLimit,
      amountTiers: [...rebate.amountTiers]
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedRebate(null);
    setFormData({
      name: '',
      rebateType: 'Valid Bet',
      minLimit: 1,
      maxLimit: 99999,
      amountTiers: [{ validBetMoreThan: 0, rebatePercentage: 0 }]
    });
    setValidationErrors({});
  };

  // Create rebate
  const handleCreateRebate = () => {
    if (!validateForm()) return;

    const newRebate: RebateSetup = {
      id: Math.max(...rebateSetups.map(r => r.id), 0) + 1,
      name: formData.name,
      rebateType: formData.rebateType,
      minLimit: formData.minLimit,
      maxLimit: formData.maxLimit,
      amountTiers: formData.amountTiers,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setRebateSetups([...rebateSetups, newRebate]);
    closeModal();
  };

  // Edit rebate
  const handleEditRebate = () => {
    if (!validateForm() || !selectedRebate) return;

    setRebateSetups(rebateSetups.map(r =>
      r.id === selectedRebate.id
        ? {
            ...selectedRebate,
            name: formData.name,
            rebateType: formData.rebateType,
            minLimit: formData.minLimit,
            maxLimit: formData.maxLimit,
            amountTiers: formData.amountTiers
          }
        : r
    ));

    closeModal();
  };

  // Delete rebate
  const handleDeleteRebate = (id: number) => {
    if (window.confirm('Are you sure you want to delete this rebate setup?')) {
      setRebateSetups(rebateSetups.filter(r => r.id !== id));
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Header with Title and Create Button */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Rebate Setup Management</h2>
          <Button
            onClick={openCreateModal}
            className="bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white font-semibold"
          >
            CREATE REBATE
          </Button>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Rebate Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="h-9"
          />

          <Button
            onClick={handleSearch}
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

      {/* Rebate Setups Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Min Limit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Max Limit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Settings</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRebateSetups.map((rebate) => (
                <tr key={rebate.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{rebate.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{rebate.rebateType}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(rebate.minLimit)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(rebate.maxLimit)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {rebate.amountTiers.length > 0 && (
                      <span>&gt;= {rebate.amountTiers[0].validBetMoreThan} = {rebate.amountTiers[0].rebatePercentage}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => openEditModal(rebate)}
                        className="bg-[#2196f3] text-white hover:bg-[#1976d2] h-7 px-3 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </Button>
                      <Button
                        onClick={() => handleDeleteRebate(rebate.id)}
                        className="bg-[#f44336] text-white hover:bg-[#d32f2f] h-7 px-3 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRebateSetups.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No rebate setups found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal || showEditModal} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              {showCreateModal ? 'Create Rebate Setup' : 'Edit Rebate Setup'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Section 1: Basic Details */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Basic Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rebate name"
                    className="h-9"
                  />
                  {validationErrors.name && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rebate Type *</label>
                  <select
                    value={formData.rebateType}
                    onChange={(e) => setFormData(prev => ({ ...prev, rebateType: e.target.value as 'Valid Bet' }))}
                    className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Valid Bet">Valid Bet</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Limit *</label>
                    <Input
                      type="number"
                      value={formData.minLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, minLimit: parseFloat(e.target.value) || 1 }))}
                      placeholder="1"
                      className="h-9"
                    />
                    {validationErrors.minLimit && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.minLimit}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Limit *</label>
                    <Input
                      type="number"
                      value={formData.maxLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxLimit: parseFloat(e.target.value) || 99999 }))}
                      placeholder="99999"
                      className="h-9"
                    />
                    {validationErrors.maxLimit && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.maxLimit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Amount Setting */}
            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="text-lg font-bold text-gray-800">Amount Setting</h3>
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
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">Valid Bet More Than</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">Rebate(%)</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.amountTiers.map((tier, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 text-sm text-gray-700">Valid Bet More Than</td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            value={tier.validBetMoreThan || ''}
                            onChange={(e) => handleTierChange(index, 'validBetMoreThan', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="h-8"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={tier.rebatePercentage || ''}
                            onChange={(e) => handleTierChange(index, 'rebatePercentage', parseFloat(e.target.value) || 0)}
                            placeholder="0.0"
                            className="h-8"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button
                            onClick={() => handleDeleteTier(index)}
                            className="bg-[#f44336] text-white hover:bg-[#d32f2f] h-7 px-2 text-xs"
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={closeModal}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
              <Button
                onClick={showCreateModal ? handleCreateRebate : handleEditRebate}
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
              >
                {showCreateModal ? 'CREATE' : 'UPDATE'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
