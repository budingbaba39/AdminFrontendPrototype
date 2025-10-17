import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { RefreshCw } from 'lucide-react';
import ProfileContent from './ProfileContent';
import { sampleUsers, User } from './UserData';
import { ReferrerBonus, referrerBonusList } from './ReferrerBonusListData';
import { initialReferrerSetups } from './ReferrerSetupData';
import { getStatusColor } from './transactionData';

type BonusStatus = 'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED';

// Helper function to get user details from username
const getUserDetails = (username: string) => {
  const user = sampleUsers.find(u => u.id === username);
  return {
    name: user?.name || username,
    mobile: user?.mobile || 'N/A',
    referrerId: user?.referrer_by || null
  };
};

// Helper function to get referrer setup details
const getReferrerSetupDetails = (referrerSetupId: string) => {
  const setup = initialReferrerSetups.find(s => s.id === referrerSetupId);
  return {
    name: setup?.name || 'Unknown Setup',
    targetType: setup?.targetType || 'N/A',
    createdDate: setup?.createdDate || 'N/A',
    autoApprovedAmount: setup?.autoApprovedAmount || 0
  };
};

export default function ReferrerBonusListManagement() {
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    dateFrom: '',
    dateTo: ''
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [activeStatus, setActiveStatus] = useState<BonusStatus>('ALL');
  const [bonuses, setBonuses] = useState(referrerBonusList);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<Map<string, User>>(new Map());
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<ReferrerBonus | null>(null);

  // Remark modal (view/edit mode)
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkBonus, setRemarkBonus] = useState<ReferrerBonus | null>(null);
  const [remarkText, setRemarkText] = useState('');

  // Remark inputs for pending records
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});

  // Filter bonuses based on search and status
  const filteredBonuses = hasSearched
    ? bonuses.filter(bonus => {
        // Status filter
        if (activeStatus !== 'ALL' && bonus.status !== activeStatus) return false;

        // Get user details for filtering
        const userDetails = getUserDetails(bonus.username);

        // Search filters
        if (searchFilters.username) {
          const searchTerm = searchFilters.username.toLowerCase();
          const matchesUsername = userDetails.name.toLowerCase().includes(searchTerm);
          const matchesMobile = userDetails.mobile.includes(searchFilters.username);
          if (!matchesUsername && !matchesMobile) return false;
        }
        if (searchFilters.dateFrom && new Date(bonus.submitTime) < new Date(searchFilters.dateFrom)) return false;
        if (searchFilters.dateTo && new Date(bonus.submitTime) > new Date(searchFilters.dateTo + ' 23:59:59')) return false;

        return true;
      })
      .sort((a, b) => {
        const dateA = a.submitTime;
        const dateB = b.submitTime;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
    : [];

  // Calculate status counts
  const statusCounts = {
    ALL: bonuses.length,
    PENDING: bonuses.filter(b => b.status === 'PENDING').length,
    COMPLETED: bonuses.filter(b => b.status === 'COMPLETED').length,
    REJECTED: bonuses.filter(b => b.status === 'REJECTED').length,
  };

  const totalAmount = filteredBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleReset = () => {
    setSearchFilters({
      username: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleUserNameClick = (bonus: ReferrerBonus) => {
    let user = usersData.get(bonus.username);

    if (!user) {
      const foundUser = sampleUsers.find(u => u.id === bonus.username);

      if (foundUser) {
        user = foundUser;
      } else {
        // Create fallback user if not found
        const userDetails = getUserDetails(bonus.username);
        user = {
          id: bonus.username,
          registerDate: bonus.submitTime,
          name: userDetails.name,
          username: bonus.username,
          mobile: userDetails.mobile,
          credit: 0,
          bankAccount: '',
          bank: '',
          referrer_code: `REF-${bonus.username}-XXXX`,
          referrer_by: userDetails.referrerId,
          agent: 'AGENT001',
          winLoss: 0,
          lastDeposit: bonus.submitTime,
          lastLogin: bonus.submitTime,
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

      setUsersData(prev => new Map(prev).set(bonus.username, user!));
    }

    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsersData(prev => new Map(prev).set(updatedUser.id, updatedUser));
    setSelectedUser(updatedUser);
  };

  const handleReferrerNameClick = (referrerId: string) => {
    const referrerUser = sampleUsers.find(u => u.id === referrerId);
    if (referrerUser) {
      setSelectedUser(referrerUser);
      setShowProfileModal(true);
    }
  };

  const handleSubmitBonus = (bonus: ReferrerBonus) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const remark = remarkInputs[bonus.id] || '';
    setBonuses(prev => prev.map(b =>
      b.id === bonus.id
        ? {
            ...b,
            status: 'COMPLETED' as const,
            completeTime: currentTime,
            handler: 'ADMIN001',
            remark
          }
        : b
    ));

    const newRemarkInputs = { ...remarkInputs };
    delete newRemarkInputs[bonus.id];
    setRemarkInputs(newRemarkInputs);
  };

  const handleCancelBonus = (bonus: ReferrerBonus) => {
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const remark = remarkInputs[bonus.id] || '';
    setBonuses(prev => prev.map(b =>
      b.id === bonus.id
        ? {
            ...b,
            status: 'REJECTED' as const,
            rejectTime: currentTime,
            handler: 'ADMIN001',
            remark
          }
        : b
    ));

    const newRemarkInputs = { ...remarkInputs };
    delete newRemarkInputs[bonus.id];
    setRemarkInputs(newRemarkInputs);
  };

  const handleOpenRemarkModal = (bonus: ReferrerBonus) => {
    setRemarkBonus(bonus);
    setRemarkText(bonus.remark || '');
    setShowRemarkModal(true);
  };

  const handleSaveRemark = () => {
    if (!remarkBonus) return;

    setBonuses(prev => prev.map(b =>
      b.id === remarkBonus.id
        ? { ...b, remark: remarkText || undefined }
        : b
    ));

    setShowRemarkModal(false);
    setRemarkBonus(null);
    setRemarkText('');
  };

  const handleViewClick = (bonus: ReferrerBonus) => {
    setSelectedBonus(bonus);
    setShowViewModal(true);
  };


  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Referrer Bonus List Search & Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <Input
            placeholder="Username / Mobile No"
            value={searchFilters.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="h-9"
          />

          <Input
            type="date"
            placeholder="Date From (Submit Time)"
            value={searchFilters.dateFrom}
            onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            className="h-9"
          />

          <Input
            type="date"
            placeholder="Date To (Submit Time)"
            value={searchFilters.dateTo}
            onChange={(e) => handleInputChange('dateTo', e.target.value)}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div></div>
          <div></div>
          <div></div>
          <Button
            onClick={handleSearch}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6"
          >
            SEARCH
          </Button>
        </div>

        <div className="border-t pt-3 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-6 items-center">
              <span className="text-sm text-gray-600">
                Record: <span className="font-semibold text-gray-900">{filteredBonuses.length}</span>
              </span>
              <span className="text-sm text-gray-600">
                Total: <span className="font-semibold text-gray-900">${totalAmount.toFixed(2)}</span>
              </span>
              <Button
                onClick={handleReset}
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

      {/* Status Filter Bar */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="relative">
            <div className="flex bg-gray-100 rounded-lg p-1 relative">
              <div
                className="absolute top-1 bottom-1 bg-[#3949ab] rounded-md transition-all duration-300 ease-in-out shadow-sm"
                style={{
                  width: `calc(${100 / 4}% - 0.25rem)`,
                  left: `calc(${(['ALL', 'PENDING', 'COMPLETED', 'REJECTED'].indexOf(activeStatus) * 100) / 4}% + 0.125rem)`,
                }}
              />
              {(['ALL', 'PENDING', 'COMPLETED', 'REJECTED'] as BonusStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 relative z-10 ${
                    activeStatus === status
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()} ({statusCounts[status]})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Referrer Bonus List */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Username</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Confirmed Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Referee</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Referrer Setup</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Target Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Submit Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">C/R Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Handler</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Remark</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredBonuses.map((bonus) => {
                  const userDetails = getUserDetails(bonus.username);
                  const refereeDetails = getUserDetails(bonus.referee);
                  const referrerSetup = getReferrerSetupDetails(bonus.referrerSetupId);

                  return (
                  <tr key={bonus.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <span
                        className="text-gray-900 font-medium cursor-pointer hover:text-blue-600 hover:underline"
                        onClick={() => handleUserNameClick(bonus)}
                      >
                        {userDetails.name}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-green-600 font-semibold text-xs">
                      ${bonus.amount.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-green-600 font-semibold text-xs">
                      ${bonus.confirmedAmount.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {bonus.referee ? (
                        <span
                          className="text-blue-600 font-medium cursor-pointer hover:underline"
                          onClick={() => handleReferrerNameClick(bonus.referee)}
                        >
                          {refereeDetails.name}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-900 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <div>Name: {referrerSetup.name}</div>
                        <div>Created: {referrerSetup.createdDate}</div>
                        <div>Auto Approved: ${referrerSetup.autoApprovedAmount.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-900 text-xs">{referrerSetup.targetType}</td>
                    <td className="px-3 py-2 text-gray-900 text-xs">{bonus.submitTime}</td>
                    <td className="px-3 py-2 text-gray-900 text-xs">
                      {bonus.completeTime || bonus.rejectTime || '-'}
                    </td>
                    <td className="px-3 py-2 text-blue-600 text-xs">{bonus.handler || '-'}</td>
                    <td className="px-3 py-2">
                      <Badge className={`${getStatusColor(bonus.status)} text-xs font-semibold px-2 py-1`}>
                        {bonus.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      {bonus.status === 'PENDING' ? (
                        <Input
                          type="text"
                          value={remarkInputs[bonus.id] || bonus.remark || ''}
                          onChange={(e) => setRemarkInputs({ ...remarkInputs, [bonus.id]: e.target.value })}
                          className="h-7 w-28 text-xs"
                        />
                      ) : (
                        <span className="text-gray-900 text-xs max-w-40 truncate block" title={bonus.remark}>
                          {bonus.remark || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {bonus.status === 'PENDING' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSubmitBonus(bonus)}
                              className="bg-[#4caf50] text-white hover:bg-[#45a049] border-[#4caf50] text-xs h-6 px-2"
                            >
                              SUBMIT
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBonus(bonus)}
                              className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] text-xs h-6 px-2"
                            >
                              CANCEL
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRemarkModal(bonus)}
                            className="bg-[#3949ab] text-white hover:bg-[#2c3582] border-[#3949ab] text-xs h-6 px-2"
                          >
                            REMARK
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="w-[1200px] h-[700px] max-w-none overflow-hidden">
          <div className="overflow-y-auto h-[calc(700px-80px)] p-1">
            {selectedUser && (
              <ProfileContent
                user={selectedUser}
                onUserUpdate={handleUserUpdate}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>



      {/* Remark Modal (View/Edit) */}
      <Dialog open={showRemarkModal} onOpenChange={setShowRemarkModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Remark</DialogTitle>
          </DialogHeader>
          {remarkBonus && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Username:</label>
                  <Input
                    value={remarkBonus.username}
                    readOnly
                    className="w-full h-10 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Amount:</label>
                  <Input
                    value={`$${remarkBonus.amount.toFixed(2)}`}
                    readOnly
                    className="w-full h-10 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Remark:</label>
                  <textarea
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="Enter remark..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  onClick={() => setShowRemarkModal(false)}
                  variant="outline"
                  className="h-10 px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRemark}
                  className="h-10 px-6 bg-[#3949ab] hover:bg-[#2c3582] text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="w-[800px] max-w-none">
          <DialogHeader>
            <DialogTitle>Referrer Bonus Details</DialogTitle>
          </DialogHeader>
          {selectedBonus && (() => {
            const userDetails = getUserDetails(selectedBonus.username);
            const refereeDetails = getUserDetails(selectedBonus.referee);
            const referrerSetup = getReferrerSetupDetails(selectedBonus.referrerSetupId);

            return (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">ID:</label>
                  <p className="text-sm text-gray-900">{selectedBonus.id}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Username (Referrer):</label>
                  <p className="text-sm text-gray-900">{selectedBonus.username}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Name:</label>
                  <p className="text-sm text-gray-900">{userDetails.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Mobile:</label>
                  <p className="text-sm text-gray-900">{userDetails.mobile}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Amount:</label>
                  <p className="text-sm text-green-600 font-semibold">${selectedBonus.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Confirmed Amount:</label>
                  <p className="text-sm text-green-600 font-semibold">${selectedBonus.confirmedAmount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Referee (Signed Up):</label>
                  <p className="text-sm text-blue-600">{selectedBonus.referee || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Status:</label>
                  <Badge className={`${getStatusColor(selectedBonus.status)} text-xs font-semibold px-2 py-1`}>
                    {selectedBonus.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Submit Time:</label>
                  <p className="text-sm text-gray-900">{selectedBonus.submitTime}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Complete/Reject Time:</label>
                  <p className="text-sm text-gray-900">{selectedBonus.completeTime || selectedBonus.rejectTime || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Handler:</label>
                  <p className="text-sm text-blue-600">{selectedBonus.handler || '-'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Referrer Setup Details:</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md space-y-1">
                    <p className="text-sm text-gray-900">Name: {referrerSetup.name}</p>
                    <p className="text-sm text-gray-900">Created Date: {referrerSetup.createdDate}</p>
                    <p className="text-sm text-gray-900">Auto Approved Amount: ${referrerSetup.autoApprovedAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-900">Referrer Setup ID: {selectedBonus.referrerSetupId}</p>
                  </div>
                </div>
                {selectedBonus.remark && (
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Remark:</label>
                    <p className="text-sm text-gray-900">{selectedBonus.remark}</p>
                  </div>
                )}
              </div>
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
