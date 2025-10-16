import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RefreshCw, ZoomIn, ZoomOut, X, Settings } from 'lucide-react';
import { KYCSettings, KYCSubmission, initialKYCSubmissions, defaultKYCSettings } from './KYCData';
import { sampleUsers, User } from './UserData';
import ProfileContent from './ProfileContent';

type KYCStatus = 'ALL' | 'Pending' | 'Approved' | 'Rejected';

export default function KYCManagement() {
  // KYC Settings State
  const [kycSettings, setKycSettings] = useState<KYCSettings>(defaultKYCSettings);

  // KYC Submissions State
  const [submissions, setSubmissions] = useState<KYCSubmission[]>(initialKYCSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<KYCStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});
  const rowsPerPage = 10;

  // Modal States
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ type: string; url: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<Map<string, User>>(new Map());
  const [currentModal, setCurrentModal] = useState<'remark' | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [remarkText, setRemarkText] = useState('');

  // Handle KYC Requirement Change
  const handleRequirementChange = (requirement: 'Before Deposit' | 'Before Withdraw') => {
    setKycSettings({ ...kycSettings, requirement });
  };

  // Handle Passport Toggle
  const handlePassportToggle = () => {
    setKycSettings({ ...kycSettings, passportRequired: !kycSettings.passportRequired });
  };

  // Handle IC Toggle
  const handleIcToggle = () => {
    const newIcRequired = !kycSettings.icRequired;
    setKycSettings({
      ...kycSettings,
      icRequired: newIcRequired,
      icFrontRequired: newIcRequired ? kycSettings.icFrontRequired : false,
      icBackRequired: newIcRequired ? kycSettings.icBackRequired : false,
      icSelfieRequired: newIcRequired ? kycSettings.icSelfieRequired : false
    });
  };

  // Handle IC Sub-option Toggles
  const handleIcFrontToggle = () => {
    setKycSettings({ ...kycSettings, icFrontRequired: !kycSettings.icFrontRequired });
  };

  const handleIcBackToggle = () => {
    setKycSettings({ ...kycSettings, icBackRequired: !kycSettings.icBackRequired });
  };

  const handleIcSelfieToggle = () => {
    setKycSettings({ ...kycSettings, icSelfieRequired: !kycSettings.icSelfieRequired });
  };

  // Save Settings
  const handleSaveSettings = () => {
    console.log('KYC Settings saved:', kycSettings);
    setShowSettingsModal(false);
  };

  // Handle Status Change
  const handleApprove = (submissionId: string) => {
    const remark = remarkInputs[submissionId] || '';
    const now = new Date();
    const processedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setSubmissions(submissions.map(sub =>
      sub.id === submissionId ? { ...sub, status: 'Approved' as const, remark, processedDate, handler: 'admin' } : sub
    ));

    const newRemarkInputs = { ...remarkInputs };
    delete newRemarkInputs[submissionId];
    setRemarkInputs(newRemarkInputs);
  };

  const handleReject = (submissionId: string) => {
    const remark = remarkInputs[submissionId] || '';
    const now = new Date();
    const processedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setSubmissions(submissions.map(sub =>
      sub.id === submissionId ? { ...sub, status: 'Rejected' as const, remark, processedDate, handler: 'admin' } : sub
    ));

    const newRemarkInputs = { ...remarkInputs };
    delete newRemarkInputs[submissionId];
    setRemarkInputs(newRemarkInputs);
  };

  // View Document
  const handleViewDocument = (type: string, url: string) => {
    setSelectedDocument({ type, url });
    setShowDocumentModal(true);
    setZoomLevel(100);
  };

  // Handle Remark Save
  const handleSaveRemark = () => {
    if (selectedSubmission) {
      setSubmissions(submissions.map(sub =>
        sub.id === selectedSubmission.id ? { ...sub, remark: remarkText } : sub
      ));
      setCurrentModal(null);
      setSelectedSubmission(null);
      setRemarkText('');
    }
  };

  // Get Status Badge Color (matching CommissionRecordManagement style)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Approved':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // Get Document Type Badge Color
  const getDocumentTypeBadgeColor = (docType: string) => {
    switch (docType) {
      case 'Passport':
        return 'bg-blue-100 text-blue-700';
      case 'IC':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Handle User Click
  const handleUserClick = (submission: KYCSubmission) => {
    let user = usersData.get(submission.userId);

    if (!user) {
      user = sampleUsers.find(u => u.id === submission.userId);

      if (!user) {
        user = {
          id: submission.userId,
          registerDate: submission.submissionDate.split(' ')[0],
          name: submission.username,
          mobile: '1234567890',
          credit: 0,
          bankAccount: 'N/A',
          bank: 'N/A',
          referrer_code: 'N/A',
          referrer_by: null,
          agent: 'Direct',
          winLoss: 0,
          lastDeposit: submission.submissionDate,
          lastLogin: submission.submissionDate,
          betHistory: 'View',
          status: 'ACTIVE',
          ip: '192.168.1.100',
          depositCount: 0,
          depositTotal: 0,
          withdrawCount: 0,
          withdrawTotal: 0,
          bonusCount: 0,
          bonusTotal: 0,
          manualCount: 0,
          manualTotal: 0,
          commissionCount: 0,
          commissionTotal: 0,
          level: 'bronze',
          tags: []
        };
      }

      setUsersData(prev => new Map(prev).set(submission.userId, user!));
    }

    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsersData(prev => new Map(prev).set(updatedUser.id, updatedUser));
    setSelectedUser(updatedUser);
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeStatus === 'ALL' || sub.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  // Get Status Counts
  const statusCounts = {
    ALL: submissions.length,
    Pending: submissions.filter(s => s.status === 'Pending').length,
    Approved: submissions.filter(s => s.status === 'Approved').length,
    Rejected: submissions.filter(s => s.status === 'Rejected').length
  };

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / rowsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">KYC Management</h2>
          <Button
            onClick={() => setShowSettingsModal(true)}
            className="bg-[#3949ab] hover:bg-[#2c3582] text-white h-9"
          >
            <Settings className="w-4 h-4 mr-2" />
            KYC Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <Input
            placeholder="User ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />

          <Button
            onClick={() => setCurrentPage(1)}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6"
          >
            SEARCH
          </Button>
        </div>

        <div className="border-t pt-3 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-6 items-center">
              <span className="text-sm text-gray-600">
                Record: <span className="font-semibold text-gray-900">{filteredSubmissions.length}</span>
              </span>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                variant="outline"
                size="sm"
                className="text-sm text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400 h-8 px-3"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                RESET
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Sliding Tab */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="relative">
          <div className="flex bg-gray-100 rounded-lg p-1 relative">
            <div
              className="absolute top-1 bottom-1 bg-[#3949ab] rounded-md transition-all duration-300 ease-in-out shadow-sm"
              style={{
                width: `calc(${100 / 4}% - 0.25rem)`,
                left: `calc(${(['ALL', 'Pending', 'Approved', 'Rejected'].indexOf(activeStatus) * 100) / 4}% + 0.125rem)`,
              }}
            />
            {(['ALL', 'Pending', 'Approved', 'Rejected'] as KYCStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 relative z-10 ${
                  activeStatus === status
                    ? 'text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KYC Record List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Username</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Submission Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Documents</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Complete/Reject Time</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Handler</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Remark</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {paginatedSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <span
                      className="text-gray-900 font-medium cursor-pointer hover:text-blue-600 hover:underline text-xs"
                      onClick={() => handleUserClick(submission)}
                    >
                      {submission.userId}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-900 text-xs">{submission.submissionDate}</td>
                  <td className="px-3 py-2">
                    <Badge className={`${getStatusColor(submission.status)} text-xs font-semibold px-2 py-1`}>
                      {submission.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument('Front', submission.documents.front)}
                        className="text-xs h-6 px-2"
                      >
                        Front
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument('Back', submission.documents.back)}
                        className="text-xs h-6 px-2"
                      >
                        Back
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument('Selfie', submission.documents.selfie)}
                        className="text-xs h-6 px-2"
                      >
                        Selfie
                      </Button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-900 text-xs">{submission.processedDate || '-'}</td>
                  <td className="px-3 py-2 text-gray-900 text-xs">{submission.handler || '-'}</td>
                  <td className="px-3 py-2">
                    {submission.status === 'Pending' ? (
                      <Input
                        type="text"
                        value={remarkInputs[submission.id] || submission.remark || ''}
                        onChange={(e) => setRemarkInputs({ ...remarkInputs, [submission.id]: e.target.value })}
                        className="h-7 w-28 text-xs"
                      />
                    ) : (
                      <span className="text-gray-900 text-xs max-w-40 truncate block" title={submission.remark}>
                        {submission.remark || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {submission.status === 'Pending' ? (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(submission.id)}
                          className="bg-[#4caf50] text-white hover:bg-[#45a049] border-[#4caf50] text-xs h-6 px-2"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(submission.id)}
                          className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] text-xs h-6 px-2"
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setRemarkText(submission.remark || '');
                          setCurrentModal('remark');
                        }}
                        className="bg-[#3949ab] text-white hover:bg-[#2c3582] border-[#3949ab] text-xs h-6 px-2"
                      >
                        REMARK
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-[#3949ab] text-white" : ""}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KYC Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* KYC Requirement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">KYC Requirement:</label>
              <Select value={kycSettings.requirement} onValueChange={(value) => handleRequirementChange(value as 'Before Deposit' | 'Before Withdraw')}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select KYC Requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Before Deposit">Before Deposit</SelectItem>
                  <SelectItem value="Before Withdraw">Before Withdraw</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Document Type Configuration */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Optional Documents:</label>

              {/* Passport */}
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={kycSettings.passportRequired}
                  onChange={handlePassportToggle}
                  className="w-4 h-4 text-[#3949ab] focus:ring-[#3949ab] rounded"
                />
                <span className="text-sm text-gray-700">Passport (Optional Attachment)</span>
              </label>

              {/* IC */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kycSettings.icRequired}
                    onChange={handleIcToggle}
                    className="w-4 h-4 text-[#3949ab] focus:ring-[#3949ab] rounded"
                  />
                  <span className="text-sm text-gray-700">IC (Identity Card)</span>
                </label>

                {/* IC Sub-options */}
                {kycSettings.icRequired && (
                  <div className="ml-6 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kycSettings.icFrontRequired}
                        onChange={handleIcFrontToggle}
                        className="w-4 h-4 text-[#3949ab] focus:ring-[#3949ab] rounded"
                      />
                      <span className="text-sm text-gray-600">Front</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kycSettings.icBackRequired}
                        onChange={handleIcBackToggle}
                        className="w-4 h-4 text-[#3949ab] focus:ring-[#3949ab] rounded"
                      />
                      <span className="text-sm text-gray-600">Back</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kycSettings.icSelfieRequired}
                        onChange={handleIcSelfieToggle}
                        className="w-4 h-4 text-[#3949ab] focus:ring-[#3949ab] rounded"
                      />
                      <span className="text-sm text-gray-600">Selfie</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowSettingsModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="bg-[#3949ab] hover:bg-[#2c3582] text-white"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>View Document - {selectedDocument?.type}</DialogTitle>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {/* Zoom Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">{zoomLevel}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            {/* Document Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[400px]">
              {selectedDocument?.url ? (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.type}
                  style={{ width: `${zoomLevel}%` }}
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <p className="text-lg font-medium">No document image available</p>
                  <p className="text-sm mt-2">Document preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <ProfileContent
              user={selectedUser}
              onUpdate={handleUserUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Remark Modal */}
      <Dialog open={currentModal === 'remark'} onOpenChange={(open) => !open && setCurrentModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Remark</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remark:</label>
              <textarea
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3949ab] text-sm"
                placeholder="Enter remark..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setCurrentModal(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveRemark}
                className="bg-[#3949ab] hover:bg-[#2c3582] text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
