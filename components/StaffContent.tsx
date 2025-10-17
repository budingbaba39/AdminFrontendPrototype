import { useState } from 'react';
import { Staff, initialStaffData, roleOptions, sampleIPLog, IPLogEntry } from './StaffData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Edit, FileText, RefreshCw } from 'lucide-react';

type ModalMode = 'create' | 'edit' | 'iplog' | null;

export default function StaffContent() {
  const [staffList, setStaffList] = useState<Staff[]>(initialStaffData);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Filter states
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Staff001',
    status: 'Active' as 'Active' | 'Inactive' | 'Locked' | 'Deleted'
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Generate new staff ID
  const generateStaffId = () => {
    const maxId = Math.max(...staffList.map(s => {
      const match = s.id.match(/STAFF(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }), 0);
    return `STAFF${String(maxId + 1).padStart(3, '0')}`;
  };

  // Get filtered staff list
  const getFilteredStaff = () => {
    return staffList.filter(staff => {
      if (filterName && !staff.name.toLowerCase().includes(filterName.toLowerCase())
          && !staff.username.toLowerCase().includes(filterName.toLowerCase())) {
        return false;
      }
      if (filterRole !== 'All' && staff.role !== filterRole) return false;
      if (filterStatus !== 'All' && staff.status !== filterStatus) return false;
      return true;
    });
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else {
      // Check for duplicate username (excluding current staff in edit mode)
      const duplicate = staffList.find(s =>
        s.username === formData.username &&
        (modalMode === 'create' || s.id !== selectedStaff?.id)
      );
      if (duplicate) {
        errors.username = 'Username already exists';
      }
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create staff
  const handleCreateStaff = () => {
    if (!validateForm()) return;

    const newStaff: Staff = {
      id: generateStaffId(),
      username: formData.username,
      name: formData.name,
      password: formData.password,
      role: formData.role,
      status: formData.status,
      createdBy: 'ADMIN001',
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setStaffList([...staffList, newStaff]);
    closeModal();
  };

  // Handle edit staff
  const handleEditStaff = () => {
    if (!validateForm() || !selectedStaff) return;

    const updatedStaff = staffList.map(staff =>
      staff.id === selectedStaff.id
        ? {
            ...staff,
            username: formData.username,
            name: formData.name,
            password: formData.password,
            role: formData.role,
            status: formData.status
          }
        : staff
    );

    setStaffList(updatedStaff);
    closeModal();
  };

  // Open create modal
  const openCreateModal = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'Staff001',
      status: 'Active'
    });
    setValidationErrors({});
    setSelectedStaff(null);
    setModalMode('create');
  };

  // Open edit modal
  const openEditModal = (staff: Staff) => {
    setFormData({
      name: staff.name,
      username: staff.username,
      password: staff.password,
      role: staff.role,
      status: staff.status
    });
    setValidationErrors({});
    setSelectedStaff(staff);
    setModalMode('edit');
  };

  // Open IP log modal
  const openIPLogModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setModalMode('iplog');
  };

  // Close modal
  const closeModal = () => {
    setModalMode(null);
    setSelectedStaff(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'Staff001',
      status: 'Active'
    });
    setValidationErrors({});
  };

  // Reset filters
  const resetFilters = () => {
    setFilterName('');
    setFilterRole('All');
    setFilterStatus('All');
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Locked':
        return 'bg-purple-100 text-purple-800';
      case 'Deleted':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStaff = getFilteredStaff();

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <Button
          onClick={openCreateModal}
          className="bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white font-semibold"
        >
          CREATE STAFF
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Name / Username</label>
            <Input
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Search name or username"
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
            >
              <option value="All">All</option>
              {roleOptions.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Locked">Locked</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={() => {}}
              className="bg-[#4caf50] hover:bg-[#45a049] text-white font-semibold flex-1"
            >
              SEARCH
            </Button>
            <Button
              onClick={resetFilters}
              variant="outline"
              className="font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Username</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Password</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{staff.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{staff.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{staff.password}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{staff.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{staff.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{staff.lastLogin}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${getStatusBadgeColor(staff.status)} font-semibold text-xs`}>
                      {staff.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => openEditModal(staff)}
                        size="sm"
                        className="bg-[#2196f3] hover:bg-[#1976d2] text-white font-semibold h-7 px-2 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </Button>
                      <Button
                        onClick={() => openIPLogModal(staff)}
                        size="sm"
                        className="bg-[#9c27b0] hover:bg-[#7b1fa2] text-white font-semibold h-7 px-2 text-xs"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        IP LOG
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStaff.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No staff members found
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] text-xl font-bold">
              {modalMode === 'create' ? 'CREATE STAFF' : 'EDIT STAFF'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter staff name"
                className="h-10"
              />
              {validationErrors.name && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Username *</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                className="h-10"
              />
              {validationErrors.username && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Password *</label>
              <Input
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                className="h-10"
              />
              {validationErrors.password && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
              >
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Locked">Locked</option>
                <option value="Deleted">Deleted</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={closeModal}
              variant="outline"
              className="flex-1 font-semibold"
            >
              CANCEL
            </Button>
            <Button
              onClick={modalMode === 'create' ? handleCreateStaff : handleEditStaff}
              className="flex-1 bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white font-semibold"
            >
              {modalMode === 'create' ? 'CREATE STAFF' : 'UPDATE STAFF'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* IP Log Modal */}
      <Dialog open={modalMode === 'iplog'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] text-xl font-bold">
              IP LOG HISTORY - {selectedStaff?.username}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">IP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">ISP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">City</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Country</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">User Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sampleIPLog.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{log.timestamp}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{log.ip}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{log.isp}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{log.city}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{log.country}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{log.userAgent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={closeModal}
              variant="outline"
              className="font-semibold"
            >
              CLOSE
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
