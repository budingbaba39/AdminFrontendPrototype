import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Copy, Check, X } from 'lucide-react';

// Sample kiosk data
const sampleKiosks = [
  {
    id: 'KIOSK001',
    siteName: 'FA',
    env: 'Production',
    apiStatus: 'ACTIVE',
    needTopUp: true,
    needWhitelist: false,
    kioskUsername: 'fa_admin',
    kioskPassword: 'fa123456',
    siteUrl: 'https://play.fa666.com/jsp.html',
    howToCheckUrl: 'https://static.owlxyt.com/media/3d9a75120f686635294.jpg',
    remark: 'Main production site',
    status: 'ACTIVE'
  },
  {
    id: 'KIOSK002',
    siteName: 'GXWICKETS',
    env: 'Production',
    apiStatus: 'ERROR',
    needTopUp: false,
    needWhitelist: false,
    kioskUsername: 'gx_admin',
    kioskPassword: 'gx789012',
    siteUrl: 'https://gxwickets.com',
    howToCheckUrl: '',
    remark: 'Cricket betting site',
    status: 'ACTIVE'
  },
  {
    id: 'KIOSK003',
    siteName: 'JIMI',
    env: 'Production',
    apiStatus: 'ACTIVE',
    needTopUp: true,
    needWhitelist: true,
    kioskUsername: 'jimi_user',
    kioskPassword: 'jimi345678',
    siteUrl: 'https://jimi.games',
    howToCheckUrl: '',
    remark: '',
    status: 'ACTIVE'
  },
  {
    id: 'KIOSK004',
    siteName: 'TURBO',
    env: 'Staging',
    apiStatus: 'ACTIVE',
    needTopUp: false,
    needWhitelist: false,
    kioskUsername: 'turbo_test',
    kioskPassword: 'turbo999',
    siteUrl: 'https://staging.turbo.com',
    howToCheckUrl: '',
    remark: 'Testing environment',
    status: 'INACTIVE'
  },
  {
    id: 'KIOSK005',
    siteName: 'MEGA88',
    env: 'Production',
    apiStatus: 'ERROR',
    needTopUp: true,
    needWhitelist: false,
    kioskUsername: 'mega88_admin',
    kioskPassword: 'mega123',
    siteUrl: 'https://mega88.com',
    howToCheckUrl: '',
    remark: 'VIP casino site',
    status: 'ACTIVE'
  }
];

type KioskStatus = 'ALL' | 'ACTIVE' | 'INACTIVE';

export default function GameKioskManagement() {
  const [searchFilters, setSearchFilters] = useState({
    siteName: '',
    env: 'all',
    kioskUsername: '',
    remark: ''
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState<KioskStatus>('ALL');
  const [kiosks, setKiosks] = useState(sampleKiosks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKiosk, setNewKiosk] = useState({
    siteName: '',
    env: 'Production',
    kioskUsername: '',
    kioskPassword: '',
    needTopUp: false,
    needWhitelist: false,
    siteUrl: '',
    remark: ''
  });

  // Filter kiosks based on search and status
  const filteredKiosks = hasSearched 
    ? kiosks.filter(kiosk => {
        // Status filter
        if (activeStatusFilter !== 'ALL' && kiosk.status !== activeStatusFilter) return false;
        
        // Environment filter
        if (searchFilters.env && searchFilters.env !== 'all' && kiosk.env !== searchFilters.env) return false;
        
        // Other filters
        if (searchFilters.siteName && !kiosk.siteName.toLowerCase().includes(searchFilters.siteName.toLowerCase())) return false;
        if (searchFilters.kioskUsername && !kiosk.kioskUsername.toLowerCase().includes(searchFilters.kioskUsername.toLowerCase())) return false;
        if (searchFilters.remark && !kiosk.remark.toLowerCase().includes(searchFilters.remark.toLowerCase())) return false;
        
        return true;
      })
    : [];

  // Calculate status counts
  const statusCounts = hasSearched ? {
    ALL: kiosks.length,
    ACTIVE: kiosks.filter(k => k.status === 'ACTIVE').length,
    INACTIVE: kiosks.filter(k => k.status === 'INACTIVE').length,
  } : { ALL: 0, ACTIVE: 0, INACTIVE: 0 };

  const handleSearch = () => {
    setHasSearched(true);
    setActiveStatusFilter('ALL');
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateKiosk = () => {
    const kioskId = `KIOSK${String(kiosks.length + 1).padStart(3, '0')}`;
    const newKioskData = {
      id: kioskId,
      siteName: newKiosk.siteName,
      env: newKiosk.env,
      apiStatus: 'ACTIVE',
      needTopUp: newKiosk.needTopUp,
      needWhitelist: newKiosk.needWhitelist,
      kioskUsername: newKiosk.kioskUsername,
      kioskPassword: newKiosk.kioskPassword,
      siteUrl: newKiosk.siteUrl,
      howToCheckUrl: '',
      remark: newKiosk.remark,
      status: 'ACTIVE' as const
    };

    setKiosks(prev => [...prev, newKioskData]);
    setShowCreateModal(false);
    setNewKiosk({
      siteName: '',
      env: 'Production',
      kioskUsername: '',
      kioskPassword: '',
      needTopUp: false,
      needWhitelist: false,
      siteUrl: '',
      remark: ''
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'INACTIVE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getApiStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500 text-white';
      case 'ERROR': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEnvColor = (env: string) => {
    return env === 'Production' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Disclaimer */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="text-red-800 text-sm space-y-1">
          <p><strong>DISCLAIMER</strong></p>
          <p>1. Please do not share the kiosk password and change password frequently to prevent fraud and unauthorised access.</p>
          <p>2. Please take note that entering the wrong game credit ratio will affect the game point (pt) fee. Please double-check before submitting. Else please ignore this message.</p>
          <p>3. Please take note that entering the wrong game currency will affect the game point (pt) fee. Please double-check before submitting. Else please ignore this message.</p>
          <p>4. Please take note that staging env is just for API testing purpose, in order for player to access into game and bet, kindly ensure to obtain PRODUCTION env from provider.</p>
        </div>
      </div>

      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Game Kiosk Search & Filter</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Site Name"
            value={searchFilters.siteName}
            onChange={(e) => handleInputChange('siteName', e.target.value)}
            className="h-10"
          />
          
          <Select value={searchFilters.env} onValueChange={(value) => handleInputChange('env', value)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="Staging">Staging</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Kiosk Username"
            value={searchFilters.kioskUsername}
            onChange={(e) => handleInputChange('kioskUsername', e.target.value)}
            className="h-10"
          />
          
          <Input
            placeholder="Remark"
            value={searchFilters.remark}
            onChange={(e) => handleInputChange('remark', e.target.value)}
            className="h-10"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-10 text-sm font-semibold px-8"
          >
            Add Kiosk
          </Button>
          <Button 
            onClick={handleSearch}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-10 text-sm font-semibold px-8"
          >
            SEARCH
          </Button>
        </div>
      </div>

      {/* Results Summary Bar */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              <span className="text-sm text-gray-600">
                Record: <span className="font-semibold text-gray-900">{filteredKiosks.length}</span>
              </span>
              <span className="text-sm text-gray-600">
                Active Sites: <span className="font-semibold text-gray-900">
                  {filteredKiosks.filter(k => k.status === 'ACTIVE').length}
                </span>
              </span>
            </div>
            <span className="text-sm text-[#3949ab] font-medium">ADVANCED</span>
          </div>
        </div>
      )}
      
      {/* Status Filter Bar */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="relative">
            <div className="flex bg-gray-100 rounded-lg p-1 relative">
              {/* Sliding indicator */}
              <div 
                className="absolute top-1 bottom-1 bg-[#3949ab] rounded-md transition-all duration-300 ease-in-out shadow-sm"
                style={{
                  width: `calc(${100 / 3}% - 0.25rem)`,
                  left: `calc(${(Object.keys(statusCounts).indexOf(activeStatusFilter) * 100) / 3}% + 0.125rem)`,
                }}
              />
              {(Object.keys(statusCounts) as KioskStatus[]).map((status, index) => (
                <button
                  key={status}
                  onClick={() => setActiveStatusFilter(status)}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 relative z-10 ${
                    activeStatusFilter === status
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

      {/* Kiosk List */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Site Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Env</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">API</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Need Top Up</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Need Whitelist</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Kiosk Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Kiosk Password</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Site Url</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">How To Check</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredKiosks.map((kiosk, index) => (
                  <tr key={kiosk.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#2196f3] text-white hover:bg-[#1976d2] border-[#2196f3] text-xs h-6 px-2"
                        >
                          EDIT
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] text-xs h-6 px-2"
                        >
                          CLEAR
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{kiosk.siteName}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${getEnvColor(kiosk.env)} text-xs font-semibold px-2 py-1`}>
                        {kiosk.env}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getApiStatusColor(kiosk.apiStatus)} text-xs font-semibold px-2 py-1`}>
                        {kiosk.apiStatus === 'ACTIVE' ? '✓' : '✗'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {kiosk.needTopUp ? (
                        <Check className="w-4 h-4 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {kiosk.needWhitelist ? (
                        <Check className="w-4 h-4 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{kiosk.kioskUsername}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{'*'.repeat(8)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {kiosk.siteUrl ? (
                        <a href={kiosk.siteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-xs">
                          {kiosk.siteUrl.substring(0, 30)}...
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {kiosk.howToCheckUrl ? (
                        <a href={kiosk.howToCheckUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-xs">
                          View Guide
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{kiosk.remark || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Kiosk Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#fa0505] font-semibold">KIOSK</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <Input
                value={newKiosk.siteName}
                onChange={(e) => setNewKiosk(prev => ({ ...prev, siteName: e.target.value }))}
                className="w-full"
                placeholder="(A) = Active status, (I) = Inactive status"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kiosk Username</label>
              <Input
                value={newKiosk.kioskUsername}
                onChange={(e) => setNewKiosk(prev => ({ ...prev, kioskUsername: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kiosk Password</label>
              <Input
                value={newKiosk.kioskPassword}
                onChange={(e) => setNewKiosk(prev => ({ ...prev, kioskPassword: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Env</label>
              <Select value={newKiosk.env} onValueChange={(value) => setNewKiosk(prev => ({ ...prev, env: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Staging">Staging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select defaultValue="Active">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
              <Input
                value={newKiosk.remark}
                onChange={(e) => setNewKiosk(prev => ({ ...prev, remark: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleCreateKiosk}
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
              >
                SUBMIT
              </Button>
              <Button 
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}