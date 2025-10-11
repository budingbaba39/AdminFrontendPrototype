import { useState } from 'react';
import { Gateway, gatewaysData } from './GatewayData';
import { Bank, banksData } from './BankData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Edit, Trash2, RefreshCw } from 'lucide-react';

type ModalMode = 'create' | 'edit' | null;

export default function BankSetupManagement() {
  const [gateways, setGateways] = useState<Gateway[]>(gatewaysData);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const [formData, setFormData] = useState({
    gatewayType: 'Bank Transfer' as 'Bank Transfer',
    bankId: 0,
    description: '',
    bankInSlip: 'REQUIRED' as 'REQUIRED' | 'OPTIONAL' | 'DISABLE',
    bankInTime: 'REQUIRED' as 'REQUIRED' | 'DISABLE',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Helper function to get bank info
  const getBankInfo = (bankId: number): Bank | undefined => {
    return banksData.find(bank => bank.id === bankId);
  };

  // Get filtered gateways
  const getFilteredGateways = () => {
    return gateways.filter(gateway => {
      if (filterStatus !== 'All' && gateway.status !== filterStatus) return false;
      return true;
    });
  };

  const filteredGateways = getFilteredGateways();

  const handleResetFilters = () => {
    setFilterStatus('All');
  };

  const openModal = (mode: ModalMode, gateway?: Gateway) => {
    setModalMode(mode);
    setValidationErrors({});

    if (mode === 'create') {
      setFormData({
        gatewayType: 'Bank Transfer',
        bankId: 0,
        description: '',
        bankInSlip: 'REQUIRED',
        bankInTime: 'REQUIRED',
        status: 'Active'
      });
      setSelectedGateway(null);
    } else if (gateway) {
      setFormData({
        gatewayType: gateway.gatewayType,
        bankId: gateway.bankId,
        description: bank?.description || '',
        bankInSlip: gateway.bankInSlip,
        bankInTime: gateway.bankInTime,
        status: gateway.status
      });
      setSelectedGateway(gateway);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedGateway(null);
    setFormData({
      gatewayType: 'Bank Transfer',
      bankId: 0,
      description: '',
      bankInSlip: 'REQUIRED',
      bankInTime: 'REQUIRED',
      status: 'Active'
    });
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.gatewayType) errors.gatewayType = 'Gateway type is required';
    if (!formData.bankId || formData.bankId === 0) errors.bankId = 'Bank is required';
    if (!formData.bankInSlip) errors.bankInSlip = 'Bank In Slip setting is required';
    if (!formData.bankInTime) errors.bankInTime = 'Bank In Time setting is required';
    if (!formData.status) errors.status = 'Status is required';

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

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (modalMode === 'create') {
      const newId = Math.max(...gateways.map(g => g.id), 0) + 1;
      const newGatewayId = `GW${String(newId).padStart(3, '0')}`;
      const newGateway: Gateway = {
        id: newId,
        gatewayId: newGatewayId,
        gatewayType: formData.gatewayType,
        bankId: formData.bankId,
        bankInSlip: formData.bankInSlip,
        bankInTime: formData.bankInTime,
        status: formData.status,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setGateways([...gateways, newGateway]);
    } else if (modalMode === 'edit' && selectedGateway) {
      setGateways(gateways.map(g =>
        g.id === selectedGateway.id
          ? {
              ...g,
              bankId: formData.bankId,
              bankInSlip: formData.bankInSlip,
              bankInTime: formData.bankInTime,
              status: formData.status
            }
          : g
      ));
    }

    closeModal();
  };

  const handleDeleteGateway = (id: number) => {
    if (window.confirm('Are you sure you want to delete this gateway?')) {
      setGateways(gateways.filter(g => g.id !== id));
    }
  };

  const getBankTransferBanks = () => {
    return banksData.filter(bank => bank.bankType === 'Bank Transfer');
  };

  const getBadgeClassName = (type: string, value: string) => {
    if (type === 'slip') {
      if (value === 'REQUIRED') return 'bg-green-100 text-green-700 font-semibold';
      if (value === 'OPTIONAL') return 'bg-yellow-100 text-yellow-700 font-semibold';
      if (value === 'DISABLE') return 'bg-red-100 text-red-700 font-semibold';
    }
    if (type === 'time') {
      if (value === 'REQUIRED') return 'bg-green-100 text-green-700 font-semibold';
      if (value === 'DISABLE') return 'bg-red-100 text-red-700 font-semibold';
    }
    if (type === 'status') {
      if (value === 'Active') return 'bg-green-100 text-green-700 font-semibold';
      if (value === 'Inactive') return 'bg-red-100 text-red-700 font-semibold';
    }
    return '';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bank Setup Management</h1>
        <Button
          onClick={() => openModal('create')}
          className="bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white"
        >
          CREATE GATEWAY
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Gateway Type</label>
            <div className="w-full px-3 py-2 border rounded-md bg-gray-50">
              <Badge className="bg-blue-100 text-blue-800 font-semibold">Bank Transfer</Badge>
            </div>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Gateway ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Gateway Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Bank Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Bank Account Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Bank Account Number</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Description</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Bank In Slip</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Bank In Time</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGateways.map((gateway) => {
                const bank = getBankInfo(gateway.bankId);
                return (
                  <tr key={gateway.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{gateway.gatewayId}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-blue-100 text-blue-800 font-semibold">
                        {gateway.gatewayType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{bank?.bankName || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-900">{bank?.accountName || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-900 font-mono">{bank?.accountNo || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-900">{bank?.description || 'N/A'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getBadgeClassName('slip', gateway.bankInSlip)}>
                        {gateway.bankInSlip}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getBadgeClassName('time', gateway.bankInTime)}>
                        {gateway.bankInTime}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getBadgeClassName('status', gateway.status)}>
                        {gateway.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal('edit', gateway)}
                          className="bg-[#2196f3] text-white hover:bg-[#1976d2] border-[#2196f3] h-7 px-3 text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          EDIT
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGateway(gateway.id)}
                          className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] h-7 px-3 text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          DELETE
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredGateways.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No gateways found
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
              {modalMode === 'create' ? 'Create New Gateway' : 'Edit Gateway'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Gateway Configuration Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Gateway Configuration</h3>
              <div className="space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Payment Gateway Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.gatewayType}
                    onChange={(e) => handleInputChange('gatewayType', e.target.value)}
                    disabled={modalMode === 'edit'}
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.gatewayType ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${modalMode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                  {validationErrors.gatewayType && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.gatewayType}</p>
                  )}
                  {modalMode === 'edit' && (
                    <p className="text-xs text-gray-500 mt-1">Gateway type cannot be changed after creation</p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Bank Account <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.bankId}
                    onChange={(e) => handleInputChange('bankId', parseInt(e.target.value))}
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.bankId ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value={0}>Select a bank account</option>
                    {getBankTransferBanks().map(bank => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bankName} - {bank.accountName}
                      </option>
                    ))}
                  </select>
                  {validationErrors.bankId && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.bankId}</p>
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Bank Description <span className="text-red-600">*</span></label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>handleInputChange('description', e.target.value)}
                    placeholder="Enter bank description..."
                    className={`w-full min-h-[80px] px-3 py-2 rounded-md border ${validationErrors.description? 'border-red-500' : 'border-gray-300'
                    } bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {validationErrors.description && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.description}</p>)}
                </div>
              </div>
            </div>

            {/* Deposit Settings Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 pb-2 border-b">Deposit Settings</h3>
              <div className="space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Bank In Slip (Upload Receipt) <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.bankInSlip}
                    onChange={(e) => handleInputChange('bankInSlip', e.target.value)}
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.bankInSlip ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="REQUIRED">REQUIRED</option>
                    <option value="OPTIONAL">OPTIONAL</option>
                    <option value="DISABLE">DISABLE</option>
                  </select>
                  {validationErrors.bankInSlip && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.bankInSlip}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Controls whether deposit receipt upload is required, optional, or disabled</p>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Bank In Time (Deposit Time) <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.bankInTime}
                    onChange={(e) => handleInputChange('bankInTime', e.target.value)}
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.bankInTime ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="REQUIRED">REQUIRED</option>
                    <option value="DISABLE">DISABLE</option>
                  </select>
                  {validationErrors.bankInTime && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.bankInTime}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Controls whether deposit time tracking is required or disabled</p>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`w-full h-9 px-3 rounded-md border ${validationErrors.status ? 'border-red-500' : 'border-gray-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {validationErrors.status && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.status}</p>
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
              {modalMode === 'create' ? 'CREATE GATEWAY' : 'UPDATE GATEWAY'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
