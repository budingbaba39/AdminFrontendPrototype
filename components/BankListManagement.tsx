import { useState, useRef } from 'react';
import { Bank, banksData } from './BankData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Edit, Trash2, X, RefreshCw } from 'lucide-react';

type ModalMode = 'create' | 'edit' | null;

export default function BankListManagement() {
  const [banks, setBanks] = useState<Bank[]>(banksData);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [filterBankName, setFilterBankName] = useState<string[]>([]);
  const [filterBankType, setFilterBankType] = useState<string>('All');
  const [showBankNameDropdown, setShowBankNameDropdown] = useState(false);

  const [formData, setFormData] = useState({
    bankName: '',
    bankType: 'Bank Transfer',
    accountName: '',
    accountNo: '',
    accountQRImage: '',
    description: '',
    maxCountPerDay: 50,
    maxAmountPerDay: 100000
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [qrImagePreview, setQRImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get unique bank names for filter
  const uniqueBankNames = Array.from(new Set(banks.map(b => b.bankName))).sort();

  // Get filtered banks
  const getFilteredBanks = () => {
    return banks.filter(bank => {
      if (filterBankName.length > 0 && !filterBankName.includes(bank.bankName)) return false;
      if (filterBankType !== 'All' && bank.bankType !== filterBankType) return false;
      return true;
    });
  };

  const filteredBanks = getFilteredBanks();

  const handleResetFilters = () => {
    setFilterBankName([]);
    setFilterBankType('All');
  };

  const openModal = (mode: ModalMode, bank?: Bank) => {
    setModalMode(mode);
    setValidationErrors({});

    if (mode === 'create') {
      setFormData({
        bankName: '',
        bankType: 'Bank Transfer',
        accountName: '',
        accountNo: '',
        accountQRImage: '',
        description: '',
        maxCountPerDay: 50,
        maxAmountPerDay: 100000
      });
      setQRImagePreview('');
      setSelectedBank(null);
    } else if (bank) {
      setFormData({
        bankName: bank.bankName,
        bankType: bank.bankType,
        accountName: bank.accountName,
        accountNo: bank.accountNo,
        accountQRImage: bank.accountQRImage || '',
        description: bank.description,
        maxCountPerDay: bank.maxCountPerDay,
        maxAmountPerDay: bank.maxAmountPerDay
      });
      setQRImagePreview(bank.accountQRImage || '');
      setSelectedBank(bank);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedBank(null);
    setFormData({
      bankName: '',
      bankType: 'Bank Transfer',
      accountName: '',
      accountNo: '',
      accountQRImage: '',
      description: '',
      maxCountPerDay: 50,
      maxAmountPerDay: 100000
    });
    setValidationErrors({});
    setQRImagePreview('');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.bankName.trim()) errors.bankName = 'Bank name is required';
    if (!formData.bankType.trim()) errors.bankType = 'Bank type is required';
    if (!formData.accountName.trim()) errors.accountName = 'Account name is required';
    if (!formData.accountNo.trim()) errors.accountNo = 'Account number is required';
    if (formData.maxCountPerDay <= 0) errors.maxCountPerDay = 'Max count per day must be greater than 0';
    if (formData.maxAmountPerDay <= 0) errors.maxAmountPerDay = 'Max amount per day must be greater than 0';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setQRImagePreview(base64String);
        handleInputChange('accountQRImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setQRImagePreview('');
    handleInputChange('accountQRImage', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (modalMode === 'create') {
      const newBank: Bank = {
        id: Math.max(...banks.map(b => b.id), 0) + 1,
        bankName: formData.bankName,
        bankType: formData.bankType,
        accountName: formData.accountName,
        accountNo: formData.accountNo,
        accountQRImage: formData.accountQRImage || undefined,
        description: formData.description,
        maxCountPerDay: formData.maxCountPerDay,
        maxAmountPerDay: formData.maxAmountPerDay
      };
      setBanks([...banks, newBank]);
    } else if (modalMode === 'edit' && selectedBank) {
      setBanks(banks.map(b =>
        b.id === selectedBank.id
          ? {
              ...b,
              bankName: formData.bankName,
              bankType: formData.bankType,
              accountName: formData.accountName,
              accountNo: formData.accountNo,
              accountQRImage: formData.accountQRImage || undefined,
              description: formData.description,
              maxCountPerDay: formData.maxCountPerDay,
              maxAmountPerDay: formData.maxAmountPerDay
            }
          : b
      ));
    }

    closeModal();
  };

  const handleDeleteBank = (id: number) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      setBanks(banks.filter(b => b.id !== id));
    }
  };

  const toggleBankNameFilter = (bankName: string) => {
    setFilterBankName(prev =>
      prev.includes(bankName) ? prev.filter(n => n !== bankName) : [...prev, bankName]
    );
  };

  const toggleAllBankNames = () => {
    setFilterBankName(prev => prev.length === uniqueBankNames.length ? [] : uniqueBankNames);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bank List Management</h1>
        <Button
          onClick={() => openModal('create')}
          className="bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white"
        >
          CREATE BANK
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-2">Bank Name</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBankNameDropdown(!showBankNameDropdown)}
                className="w-full px-3 py-2 border rounded-md text-left bg-white"
              >
                {filterBankName.length === 0 ? 'Select banks' : `${filterBankName.length} selected`}
              </button>
              {showBankNameDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <label className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterBankName.length === uniqueBankNames.length}
                        onChange={toggleAllBankNames}
                      />
                      <span className="font-medium">Select All</span>
                    </label>
                  </div>
                  {uniqueBankNames.map(bankName => (
                    <div key={bankName} className="p-2">
                      <label className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterBankName.includes(bankName)}
                          onChange={() => toggleBankNameFilter(bankName)}
                        />
                        <span>{bankName}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {filterBankName.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filterBankName.map(bankName => (
                  <Badge key={bankName} variant="secondary" className="text-xs">
                    {bankName}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => toggleBankNameFilter(bankName)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bank Type</label>
            <select
              value={filterBankType}
              onChange={(e) => setFilterBankType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="All">All</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="bg-[#4caf50] hover:bg-[#45a049] text-white">
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
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Bank Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Bank Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Account Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Account Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Description</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Max Count/Day</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Max Amount/Day</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBanks.map((bank) => (
                <tr key={bank.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{bank.bankName}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-blue-100 text-blue-800 font-semibold">
                      {bank.bankType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{bank.accountName}</td>
                  <td className="px-4 py-3 text-gray-900 font-mono">{bank.accountNo}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={bank.description}>
                    {bank.description}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900 font-medium">{bank.maxCountPerDay}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                    {formatCurrency(bank.maxAmountPerDay)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal('edit', bank)}
                        className="bg-[#2196f3] text-white hover:bg-[#1976d2] border-[#2196f3] h-7 px-3 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBank(bank.id)}
                        className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] h-7 px-3 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBanks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No banks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              {modalMode === 'create' ? 'Create New Bank Account' : 'Edit Bank Account'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Basic Information</h3>
              <div className="space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Bank Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="Enter bank name"
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.bankName ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {validationErrors.bankName && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.bankName}</p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Bank Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.bankType}
                    onChange={(e) => handleInputChange('bankType', e.target.value)}
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.bankType ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                  {validationErrors.bankType && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.bankType}</p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Account Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={formData.accountName}
                    onChange={(e) => handleInputChange('accountName', e.target.value)}
                    placeholder="Enter account name"
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.accountName ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {validationErrors.accountName && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.accountName}</p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Account Number <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={formData.accountNo}
                    onChange={(e) => handleInputChange('accountNo', e.target.value)}
                    placeholder="Enter account number"
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.accountNo ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {validationErrors.accountNo && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.accountNo}</p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Transaction Limits Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Transaction Limits</h3>
              <div className="space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Max Count Per Day <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.maxCountPerDay}
                    onChange={(e) => handleInputChange('maxCountPerDay', parseInt(e.target.value) || 0)}
                    min={1}
                    placeholder="Maximum transactions per day"
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.maxCountPerDay ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {validationErrors.maxCountPerDay && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.maxCountPerDay}</p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Max Amount Per Day <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.maxAmountPerDay}
                    onChange={(e) => handleInputChange('maxAmountPerDay', parseInt(e.target.value) || 0)}
                    min={1}
                    placeholder="Maximum amount per day"
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.maxAmountPerDay ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {validationErrors.maxAmountPerDay && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.maxAmountPerDay}</p>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">QR Code Image</h3>
              <div className="space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Account QR Image (Optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full h-9"
                  />
                  {qrImagePreview && (
                    <div className="mt-2">
                      <img src={qrImagePreview} alt="Preview" className="w-[100px] h-[100px] object-cover rounded border" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4 border-t mt-6">
            <Button
              onClick={closeModal}
              variant="outline"
              className="flex-1 h-10 bg-gray-500 text-white hover:bg-gray-600 border-gray-500"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 h-10 bg-[#4caf50] hover:bg-[#45a049] text-white"
            >
              {modalMode === 'create' ? 'CREATE' : 'UPDATE'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
