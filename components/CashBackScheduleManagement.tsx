import { useState } from 'react';
import { CashBackSchedule, sampleCashBackSchedules } from './CashBackScheduleData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, RefreshCw } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CashBackScheduleManagement() {
  const [schedules, setSchedules] = useState<CashBackSchedule[]>(sampleCashBackSchedules);
  const [filterType, setFilterType] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<CashBackSchedule | null>(null);
  const [formData, setFormData] = useState({
    type: 'Recurring' as 'Recurring',
    cashbackType: 'By Net Lose Only' as 'By Net Lose Only' | 'By Net Deposit' | 'By Total WinLose Only',
    status: 'Active' as 'Active' | 'Inactive',
    autoApprovedAmount: 0,
    resetFrequency: 'Everyday' as 'Everyday' | 'Every Week' | 'Every Month',
    resetFrequencyDay: 'Monday' as string | number
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Filter schedules by type
  const filteredSchedules = schedules.filter(schedule => {
    if (filterType && schedule.type !== filterType) return false;
    return true;
  });

  // Handle search (reactive filtering)
  const handleSearch = () => {
    // Filtering is reactive
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilterType('');
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.autoApprovedAmount <= 0) errors.autoApprovedAmount = 'Auto approved amount must be greater than 0';

    if (formData.type === 'Recurring') {
      if (!formData.resetFrequency) errors.resetFrequency = 'Reset frequency is required';
      if (formData.resetFrequency === 'Every Week' && !formData.resetFrequencyDay) errors.resetFrequencyDay = 'Day of week is required';
      if (formData.resetFrequency === 'Every Month') {
        const dayNum = typeof formData.resetFrequencyDay === 'number' ? formData.resetFrequencyDay : parseInt(formData.resetFrequencyDay as string) || 0;
        if (!formData.resetFrequencyDay || dayNum < 1 || dayNum > 28) {
          errors.resetFrequencyDay = 'Day of month must be between 1-28';
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open create modal
  const openCreateModal = () => {
    setFormData({
      type: 'Recurring',
      cashbackType: 'By Net Lose Only',
      status: 'Active',
      autoApprovedAmount: 0,
      resetFrequency: 'Everyday',
      resetFrequencyDay: 'Monday'
    });
    setValidationErrors({});
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (schedule: CashBackSchedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      type: schedule.type,
      cashbackType: schedule.cashbackType,
      status: schedule.status,
      autoApprovedAmount: schedule.autoApprovedAmount,
      resetFrequency: schedule.resetFrequency || 'Everyday',
      resetFrequencyDay: schedule.resetFrequencyDay || 'Monday'
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedSchedule(null);
    setFormData({
      type: 'Recurring',
      cashbackType: 'By Net Lose Only',
      status: 'Active',
      autoApprovedAmount: 0,
      resetFrequency: 'Everyday',
      resetFrequencyDay: 'Monday'
    });
    setValidationErrors({});
  };

  // Create schedule
  const handleCreateSchedule = () => {
    if (!validateForm()) return;

    const newSchedule: CashBackSchedule = {
      id: Math.max(...schedules.map(s => s.id), 0) + 1,
      type: formData.type,
      cashbackType: formData.cashbackType,
      status: formData.status,
      autoApprovedAmount: formData.autoApprovedAmount,
      resetFrequency: formData.type === 'Recurring' ? formData.resetFrequency : undefined,
      resetFrequencyDay: formData.type === 'Recurring' ? formData.resetFrequencyDay : undefined,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setSchedules([...schedules, newSchedule]);
    closeModal();
  };

  // Edit schedule
  const handleEditSchedule = () => {
    if (!validateForm() || !selectedSchedule) return;

    setSchedules(schedules.map(s =>
      s.id === selectedSchedule.id
        ? {
            ...selectedSchedule,
            type: formData.type,
            cashbackType: formData.cashbackType,
            status: formData.status,
            autoApprovedAmount: formData.autoApprovedAmount,
            resetFrequency: formData.type === 'Recurring' ? formData.resetFrequency : undefined,
            resetFrequencyDay: formData.type === 'Recurring' ? formData.resetFrequencyDay : undefined
          }
        : s
    ));

    closeModal();
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format reset frequency display
  const formatResetFrequency = (schedule: CashBackSchedule): string => {
    if (schedule.type !== 'Recurring' || !schedule.resetFrequency) return '-';
    let display = schedule.resetFrequency;
    if (schedule.resetFrequencyDay) {
      display += ` (${typeof schedule.resetFrequencyDay === 'string' ? schedule.resetFrequencyDay : schedule.resetFrequencyDay})`;
    }
    return display;
  };

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Header with Title and Create Button */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">CashBack Schedule Management</h2>
          <Button
            onClick={openCreateModal}
            className="bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white font-semibold"
          >
            ADD SCHEDULE
          </Button>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Recurring">Recurring</SelectItem>
            </SelectContent>
          </Select>

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

      {/* Schedules Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Auto Approved Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Reset Frequency</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{schedule.cashbackType}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{schedule.createdDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(schedule.autoApprovedAmount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      schedule.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-center">{formatResetFrequency(schedule)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <Button
                        onClick={() => openEditModal(schedule)}
                        className="bg-[#2196f3] text-white hover:bg-[#1976d2] h-7 px-3 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No schedules found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal || showEditModal} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              {showCreateModal ? 'Add CashBack Schedule' : 'Edit CashBack Schedule'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Type Selection - Only Recurring */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Input
                value="Recurring"
                disabled
                className="h-9 bg-gray-100"
              />
            </div>

            {/* CashBack Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CashBack Type *</label>
              <Select value={formData.cashbackType} onValueChange={(value) => setFormData(prev => ({ ...prev, cashbackType: value as 'By Net Lose Only' | 'By Net Deposit' | 'By Total WinLose Only' }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="By Net Lose Only">By Net Lose Only</SelectItem>
                  <SelectItem value="By Net Deposit">By Net Deposit</SelectItem>
                  <SelectItem value="By Total WinLose Only">By Total WinLose Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'Active' | 'Inactive' }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto Approved Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto Approved Amount </label>
              <Input
                type="number"
                value={formData.autoApprovedAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, autoApprovedAmount: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="h-9"
              />
              {validationErrors.autoApprovedAmount && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.autoApprovedAmount}</p>
              )}
            </div>

            {/* Recurring Options */}
            {formData.type === 'Recurring' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reset Frequency *</label>
                  <Select value={formData.resetFrequency} onValueChange={(value) => setFormData(prev => ({ ...prev, resetFrequency: value as 'Everyday' | 'Every Week' | 'Every Month' }))}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Everyday">Everyday</SelectItem>
                      <SelectItem value="Every Week">Every Week</SelectItem>
                      <SelectItem value="Every Month">Every Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.resetFrequency === 'Every Week' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week *</label>
                    <Select value={formData.resetFrequencyDay as string} onValueChange={(value) => setFormData(prev => ({ ...prev, resetFrequencyDay: value }))}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEEKDAYS.map(day => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.resetFrequencyDay && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.resetFrequencyDay}</p>
                    )}
                  </div>
                )}
                {formData.resetFrequency === 'Every Month' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month (1-28) *</label>
                    <Select
                      value={typeof formData.resetFrequencyDay === 'number' ? formData.resetFrequencyDay.toString() : formData.resetFrequencyDay}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, resetFrequencyDay: parseInt(value) }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.resetFrequencyDay && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.resetFrequencyDay}</p>
                    )}
                  </div>
                )}
              </>
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
              onClick={showCreateModal ? handleCreateSchedule : handleEditSchedule}
              className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
            >
              {showCreateModal ? 'ADD' : 'UPDATE'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}