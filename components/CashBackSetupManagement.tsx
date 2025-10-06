import { useState } from 'react';
import { CashBackSetup, CashBackAmountTier, cashBackSetupsData } from './CashBackSetupData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';

export default function CashBackSetupManagement() {
  const [cashbackSetups, setCashbackSetups] = useState<CashBackSetup[]>(cashBackSetupsData);
  const [filterName, setFilterName] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCashback, setSelectedCashback] = useState<CashBackSetup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cashbackType: 'By Net Lose Only' as 'By Net Lose Only' | 'By Net Deposit' | 'By Total WinLose Only',
    minLimit: 1,
    maxLimit: 99999,
    amountTiers: [{ amountMoreThanOrEqual: 0, cashbackPercentage: 0 }] as CashBackAmountTier[]
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Filter cashback setups
  const filteredCashbackSetups = cashbackSetups.filter(cashback => {
    if (filterName && !cashback.name.toLowerCase().includes(filterName.toLowerCase())) return false;
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
      amountTiers: [...prev.amountTiers, { amountMoreThanOrEqual: 0, cashbackPercentage: 0 }]
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
  const handleTierChange = (index: number, field: 'amountMoreThanOrEqual' | 'cashbackPercentage', value: number) => {
    setFormData(prev => {
      const updatedTiers = [...prev.amountTiers];
      updatedTiers[index] = { ...updatedTiers[index], [field]: value };
      // Auto-sort by amountMoreThanOrEqual ascending
      updatedTiers.sort((a, b) => a.amountMoreThanOrEqual - b.amountMoreThanOrEqual);
      return { ...prev, amountTiers: updatedTiers };
    });
  };

  // Get dynamic column label based on cashback type
  const getAmountColumnLabel = (): string => {
    switch (formData.cashbackType) {
      case 'By Net Lose Only':
        return 'WinLoss More Than or Equal';
      case 'By Net Deposit':
        return 'Positive Amount More Than or Equal';
      case 'By Total WinLose Only':
        return 'TotalWinLoss More Than or Equal';
      default:
        return 'Amount More Than or Equal';
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'CashBack name is required';
    if (formData.minLimit <= 0) errors.minLimit = 'Min limit must be greater than 0';
    if (formData.maxLimit < formData.minLimit) errors.maxLimit = 'Max limit must be >= min limit';
    if (formData.amountTiers.length === 0) errors.amountTiers = 'At least one tier is required';

    // Check for empty tier values
    const hasEmptyTiers = formData.amountTiers.some(t =>
      t.amountMoreThanOrEqual === 0 || t.cashbackPercentage === 0
    );
    if (hasEmptyTiers) errors.amountTiers = 'All tier amounts and percentages must be filled';

    // Check for duplicate amounts
    const amounts = formData.amountTiers.map(t => t.amountMoreThanOrEqual);
    const hasDuplicates = amounts.some((amt, idx) => amounts.indexOf(amt) !== idx);
    if (hasDuplicates) errors.amountTiers = 'Duplicate tier amounts are not allowed';

    // Check cashback percentage range
    const invalidPercentage = formData.amountTiers.some(t =>
      t.cashbackPercentage < 0 || t.cashbackPercentage > 100
    );
    if (invalidPercentage) errors.amountTiers = 'CashBack percentage must be between 0-100%';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open create modal
  const openCreateModal = () => {
    setFormData({
      name: '',
      cashbackType: 'By Net Lose Only',
      minLimit: 1,
      maxLimit: 99999,
      amountTiers: [{ amountMoreThanOrEqual: 0, cashbackPercentage: 0 }]
    });
    setValidationErrors({});
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (cashback: CashBackSetup) => {
    setSelectedCashback(cashback);
    setFormData({
      name: cashback.name,
      cashbackType: cashback.cashbackType,
      minLimit: cashback.minLimit,
      maxLimit: cashback.maxLimit,
      amountTiers: [...cashback.amountTiers]
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCashback(null);
    setFormData({
      name: '',
      cashbackType: 'By Net Lose Only',
      minLimit: 1,
      maxLimit: 99999,
      amountTiers: [{ amountMoreThanOrEqual: 0, cashbackPercentage: 0 }]
    });
    setValidationErrors({});
  };

  // Create cashback
  const handleCreateCashback = () => {
    if (!validateForm()) return;

    const newCashback: CashBackSetup = {
      id: Math.max(...cashbackSetups.map(r => r.id), 0) + 1,
      name: formData.name,
      cashbackType: formData.cashbackType,
      minLimit: formData.minLimit,
      maxLimit: formData.maxLimit,
      amountTiers: formData.amountTiers,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setCashbackSetups([...cashbackSetups, newCashback]);
    closeModal();
  };

  // Edit cashback
  const handleEditCashback = () => {
    if (!validateForm() || !selectedCashback) return;

    setCashbackSetups(cashbackSetups.map(r =>
      r.id === selectedCashback.id
        ? {
            ...selectedCashback,
            name: formData.name,
            cashbackType: formData.cashbackType,
            minLimit: formData.minLimit,
            maxLimit: formData.maxLimit,
            amountTiers: formData.amountTiers
          }
        : r
    ));

    closeModal();
  };

  // Delete cashback
  const handleDeleteCashback = (id: number) => {
    if (window.confirm('Are you sure you want to delete this cashback setup?')) {
      setCashbackSetups(cashbackSetups.filter(r => r.id !== id));
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
          <h2 className="text-xl font-semibold text-gray-900">CashBack Setup Management</h2>
          <Button
            onClick={openCreateModal}
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

      {/* CashBack Setups Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Min Limit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Max Limit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Settings</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCashbackSetups.map((cashback) => (
                <tr key={cashback.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{cashback.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{cashback.cashbackType}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(cashback.minLimit)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(cashback.maxLimit)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {cashback.amountTiers.length > 0 && (
                      <span>&gt;= {cashback.amountTiers[0].amountMoreThanOrEqual} = {cashback.amountTiers[0].cashbackPercentage}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => openEditModal(cashback)}
                        className="bg-[#2196f3] text-white hover:bg-[#1976d2] h-7 px-3 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </Button>
                      <Button
                        onClick={() => handleDeleteCashback(cashback.id)}
                        className="bg-[#f44336] text-white hover:bg-[#d32f2f] h-7 px-3 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCashbackSetups.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No cashback setups found
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
              {showCreateModal ? 'Create CashBack Setup' : 'Edit CashBack Setup'}
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
                    placeholder="Enter cashback name"
                    className="h-9"
                  />
                  {validationErrors.name && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-medium text-gray-700">CashBack Type *</label>
                    <div className="relative group">
                      <button
                        type="button"
                        className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center cursor-help"
                      >
                        i
                      </button>
                      <div className="absolute left-0 bottom-6 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64 z-10">
                        <div className="space-y-1">
                          <p><strong>By Net Lose Only:</strong> Counts winloss with netlose</p>
                          <p><strong>By Net Deposit:</strong> Deposit - Withdraw(required) = Positive Amount</p>
                          <p><strong>By Total WinLoss:</strong> Count total winloss with net Lose(selected providers)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={formData.cashbackType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cashbackType: e.target.value as 'By Net Lose Only' | 'By Net Deposit' | 'By Total WinLose Only'
                    }))}
                    className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="By Net Lose Only">By Net Lose Only</option>
                    <option value="By Net Deposit">By Net Deposit</option>
                    <option value="By Total WinLose Only">By Total WinLose Only</option>
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
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">{getAmountColumnLabel()}</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 border-b">CashBack(%)</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.amountTiers.map((tier, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 text-sm text-gray-700">{getAmountColumnLabel()}</td>
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
                          <Input
                            type="number"
                            step="0.1"
                            value={tier.cashbackPercentage || ''}
                            onChange={(e) => handleTierChange(index, 'cashbackPercentage', parseFloat(e.target.value) || 0)}
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
                onClick={showCreateModal ? handleCreateCashback : handleEditCashback}
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
