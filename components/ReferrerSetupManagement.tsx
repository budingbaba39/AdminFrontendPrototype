import { useState } from 'react';
import { ReferrerSetup, initialReferrerSetups } from './ReferrerSetupData';
import { initialLevels } from './LevelData';
import { initialPromotions } from './PromotionListData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, RefreshCw } from 'lucide-react';

type ModalMode = 'create' | 'edit' | null;

// Get referrer promotions only
const referrerPromotions = initialPromotions.filter(p => p.promoType === 'Referrer');

// Default form data
const getDefaultFormData = (): ReferrerSetup => ({
  id: '',
  levelId: 1,
  name: '',
  targetType: 'By Deposit',
  recurring: 'One Time',
  status: 'Active',
  autoApprovedAmount: 1000,
  maxPayoutPerDownline: 1000,
  promoId: referrerPromotions.length > 0 ? referrerPromotions[0].id : '',
  createdDate: new Date().toISOString().split('T')[0],
  createdBy: 'Admin'
});

export default function ReferrerSetupManagement() {
  const [setups, setSetups] = useState<ReferrerSetup[]>(initialReferrerSetups);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  // Filter states
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterTargetType, setFilterTargetType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<ReferrerSetup>(getDefaultFormData());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Get filtered setups
  const getFilteredSetups = () => {
    return setups.filter(setup => {
      if (filterLevel !== 'all') {
        const level = initialLevels.find(l => l.id === setup.levelId);
        if (level?.levelName.toLowerCase() !== filterLevel) return false;
      }
      if (filterTargetType !== 'all' && setup.targetType !== filterTargetType) return false;
      if (filterStatus !== 'all' && setup.status !== filterStatus) return false;
      return true;
    });
  };

  const handleResetFilters = () => {
    setFilterLevel('all');
    setFilterTargetType('all');
    setFilterStatus('all');
  };

  const openModal = (mode: ModalMode, setup?: ReferrerSetup) => {
    setModalMode(mode);
    setValidationErrors({});

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
    if (typeof formData.autoApprovedAmount !== 'number' || formData.autoApprovedAmount < 0) errors.autoApprovedAmount = 'Must be >= 0';
    if (typeof formData.maxPayoutPerDownline !== 'number' || formData.maxPayoutPerDownline < 0) errors.maxPayoutPerDownline = 'Must be >= 0';
    if (!formData.promoId) errors.promoId = 'Promo Type is required';

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {initialLevels.map(level => (
                <SelectItem key={level.id} value={level.levelName.toLowerCase()}>
                  {level.levelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterTargetType} onValueChange={setFilterTargetType}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Target Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="By Deposit">By Deposit</SelectItem>
              <SelectItem value="By Register">By Register</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Auto Approved Amount &lt;=</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Max Payout Amount (Per Downline)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Promo Type</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredSetups.map((setup) => {
                const level = initialLevels.find(l => l.id === setup.levelId);
                const promo = initialPromotions.find(p => p.id === setup.promoId);
                const levelName = level?.levelName?.toLowerCase() || 'bronze';
                return (
                  <tr key={setup.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Badge className={`text-xs font-semibold px-2 py-0.5 ${
                        levelName === 'gold' ? 'bg-yellow-500 text-white' :
                        levelName === 'silver' ? 'bg-gray-400 text-white' :
                        'bg-amber-700 text-white'
                      }`}>
                        {levelName.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{setup.name}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      ${setup.autoApprovedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      ${setup.maxPayoutPerDownline.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-xs">{setup.createdDate}</td>
                    <td className="px-4 py-3 text-gray-900">{promo?.promoName || 'Unknown'}</td>
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
                );
              })}
              {filteredSetups.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
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
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              {modalMode === 'create' ? 'CREATE REFERRER SETUP' : 'EDIT REFERRER SETUP'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="w-full">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Level *</label>
              <select
                value={formData.levelId}
                onChange={(e) => handleInputChange('levelId', parseInt(e.target.value))}
                className="w-full h-10 px-3 py-2 border rounded-md"
              >
                {initialLevels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.levelName}
                  </option>
                ))}
              </select>
            </div>

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
              <label className="block text-sm font-semibold mb-2 text-gray-700">Auto Approved Amount &lt;= *</label>
              <Input
                type="number"
                min="0"
                value={formData.autoApprovedAmount}
                onChange={(e) => handleInputChange('autoApprovedAmount', e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="1000"
                className="w-full h-10"
              />
              {validationErrors.autoApprovedAmount && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.autoApprovedAmount}</p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Max Payout Amount (Per Downline) *</label>
              <Input
                type="number"
                min="0"
                value={formData.maxPayoutPerDownline}
                onChange={(e) => handleInputChange('maxPayoutPerDownline', e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="1000"
                className="w-full h-10"
              />
              {validationErrors.maxPayoutPerDownline && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.maxPayoutPerDownline}</p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Promo Type *</label>
              <select
                value={formData.promoId}
                onChange={(e) => handleInputChange('promoId', e.target.value)}
                className="w-full h-10 px-3 py-2 border rounded-md"
              >
                {referrerPromotions.length === 0 ? (
                  <option value="">No Referrer Promotions Available</option>
                ) : (
                  referrerPromotions.map(promo => (
                    <option key={promo.id} value={promo.id}>
                      {promo.promoName}
                    </option>
                  ))
                )}
              </select>
              {validationErrors.promoId && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.promoId}</p>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t-2">
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
