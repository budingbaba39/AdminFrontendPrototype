import { useState, ChangeEvent, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Trash2, Edit, Eye, List, TrendingUp, RefreshCw, Percent, DollarSign, X } from 'lucide-react';
import { Level, initialLevels, levelColors, ProviderBetLimit, ProviderRebateAssignment, ProviderCashbackAssignment } from './LevelData';
import { Bank, banksData } from './BankData';
import { Provider, providersData, categoryLabels } from './ProviderData';
import { rebateSetupsData } from './RebateSetupData';
import { cashBackSetupsData } from './CashBackSetupData';

export default function LevelManagement() {
  const [levels, setLevels] = useState<Level[]>(initialLevels);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'info' | 'languages'>('info');
  const [showBankListModal, setShowBankListModal] = useState(false);
  const [selectedLevelForBanks, setSelectedLevelForBanks] = useState<number | null>(null);
  const [selectedBanks, setSelectedBanks] = useState<number[]>([]);
  const [showBetLimitModal, setShowBetLimitModal] = useState(false);
  const [selectedLevelForProviders, setSelectedLevelForProviders] = useState<number | null>(null);
  const [providerBetLimits, setProviderBetLimits] = useState<ProviderBetLimit[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [tempMinBet, setTempMinBet] = useState<number>(0);
  const [tempMaxBet, setTempMaxBet] = useState<number>(0);
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<string>('all');
  const betLimitFormRef = useRef<HTMLDivElement>(null);
  const [showRebateSetupModal, setShowRebateSetupModal] = useState(false);
  const [showCashbackSetupModal, setShowCashbackSetupModal] = useState(false);
  const [selectedLevelForRebate, setSelectedLevelForRebate] = useState<Level | null>(null);
  const [selectedLevelForCashback, setSelectedLevelForCashback] = useState<Level | null>(null);
  const [rebateAssignments, setRebateAssignments] = useState<ProviderRebateAssignment[]>([]);
  const [cashbackAssignments, setCashbackAssignments] = useState<ProviderCashbackAssignment[]>([]);
  const [rebateProviderSearch, setRebateProviderSearch] = useState('');
  const [rebateCategoryFilter, setRebateCategoryFilter] = useState<number | 'all'>('all');
  const [rebateCategoryToApply, setRebateCategoryToApply] = useState<number | ''>('');
  const [cashbackProviderSearch, setCashbackProviderSearch] = useState('');
  const [cashbackCategoryFilter, setCashbackCategoryFilter] = useState<number | 'all'>('all');
  const [cashbackCategoryToApply, setCashbackCategoryToApply] = useState<number | ''>('');

  const [formData, setFormData] = useState<Omit<Level, 'id' | 'createdDate'>>({
    levelName: '',
    levelNameTranslations: {
      english: '',
      chinese: '',
      malay: ''
    },
    maxWithdrawAmountPerTransaction: 0,
    maxWithdrawAmountPerDay: 0,
    maxWithdrawCountPerDay: 0,
    depositTurnoverRate: 1,
    autoUpgradeAmount: 0,
    remark: '',
    status: 'Active',
    autoUpgrade: true,
    autoDowngrade: true,
    resetFrequencyType: 'Every Month',
    resetFrequencyValue: '1',
    isDefault: true,
    image: ''
  });

  // Filter levels based on search and status
  const filteredLevels = levels.filter(level => {
    const matchesSearch = level.levelName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || level.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSearch = () => {
    // Filtering is reactive, this is just for explicit search button
  };

  const handleReset = () => {
    setSearchFilter('');
    setStatusFilter('All');
  };

  const resetForm = () => {
    setFormData({
      levelName: '',
      levelNameTranslations: {
        english: '',
        chinese: '',
        malay: ''
      },
      maxWithdrawAmountPerTransaction: 0,
      maxWithdrawAmountPerDay: 0,
      maxWithdrawCountPerDay: 0,
      depositTurnoverRate: 1,
      autoUpgradeAmount: 0,
      remark: '',
      status: 'Active',
      autoUpgrade: true,
      autoDowngrade: true,
      resetFrequencyType: 'Every Month',
      resetFrequencyValue: '1',
      isDefault: true,
      image: ''
    });
    setImagePreview('');
    setActiveTab('info');
  };

  const handleCreateLevel = () => {
    // Validation
    if (formData.depositTurnoverRate <= 0) {
      alert('Deposit Turnover Rate must be greater than 0');
      return;
    }
    if (formData.autoUpgradeAmount < 0) {
      alert('Auto Upgrade Amount must be >= 0');
      return;
    }

    const newLevel: Level = {
      ...formData,
      id: levels.length > 0 ? Math.max(...levels.map(l => l.id)) + 1 : 1,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setLevels(prev => [...prev, newLevel]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEditLevel = () => {
    if (!selectedLevel) return;

    // Validation
    if (formData.depositTurnoverRate <= 0) {
      alert('Deposit Turnover Rate must be greater than 0');
      return;
    }
    if (formData.autoUpgradeAmount < 0) {
      alert('Auto Upgrade Amount must be >= 0');
      return;
    }

    setLevels(prev => prev.map(level =>
      level.id === selectedLevel.id
        ? { ...formData, id: level.id, createdDate: level.createdDate }
        : level
    ));

    setShowEditModal(false);
    setSelectedLevel(null);
    resetForm();
  };

  const handleDeleteLevel = (id: number) => {
    if (window.confirm('Are you sure you want to delete this level?')) {
      setLevels(prev => prev.filter(level => level.id !== id));
    }
  };

  const handleEditClick = (level: Level) => {
    setSelectedLevel(level);
    setFormData({
      levelName: level.levelName,
      levelNameTranslations: level.levelNameTranslations || {
        english: '',
        chinese: '',
        malay: ''
      },
      maxWithdrawAmountPerTransaction: level.maxWithdrawAmountPerTransaction,
      maxWithdrawAmountPerDay: level.maxWithdrawAmountPerDay,
      maxWithdrawCountPerDay: level.maxWithdrawCountPerDay,
      depositTurnoverRate: level.depositTurnoverRate,
      autoUpgradeAmount: level.autoUpgradeAmount,
      remark: level.remark || '',
      status: level.status,
      autoUpgrade: level.autoUpgrade,
      autoDowngrade: level.autoDowngrade,
      resetFrequencyType: level.resetFrequencyType,
      resetFrequencyValue: level.resetFrequencyValue,
      isDefault: level.isDefault,
      image: level.image || ''
    });
    setImagePreview(level.image || '');
    setActiveTab('info');
    setShowEditModal(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setFormData(prev => ({ ...prev, image: base64Image }));
        setImagePreview(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBankList = (levelId: number) => {
    setSelectedLevelForBanks(levelId);
    setSelectedBanks([]); // Reset selection or load saved banks for this level
    setShowBankListModal(true);
  };

  const handleRebateSetup = (level: Level) => {
    setSelectedLevelForRebate(level);
    setShowRebateSetupModal(true);
  };

  const handleCashbackSetup = (level: Level) => {
    setSelectedLevelForCashback(level);
    setShowCashbackSetupModal(true);
  };

  // Initialize rebate assignments when modal opens
  useEffect(() => {
    if (showRebateSetupModal && selectedLevelForRebate) {
      setRebateAssignments(selectedLevelForRebate.providerRebateAssignments || []);
      setRebateProviderSearch('');
      setRebateCategoryFilter('all');
      setRebateCategoryToApply('');
    }
  }, [showRebateSetupModal, selectedLevelForRebate]);

  // Initialize cashback assignments when modal opens
  useEffect(() => {
    if (showCashbackSetupModal && selectedLevelForCashback) {
      setCashbackAssignments(selectedLevelForCashback.providerCashbackAssignments || []);
      setCashbackProviderSearch('');
      setCashbackCategoryFilter('all');
      setCashbackCategoryToApply('');
    }
  }, [showCashbackSetupModal, selectedLevelForCashback]);

  // Get assigned rebates for a provider
  const getProviderRebates = (providerId: number): number[] => {
    const assignment = rebateAssignments.find(a => a.providerId === providerId);
    return assignment?.rebateSetupIds || [];
  };

  // Add rebate to provider
  const handleAddRebate = (providerId: number, rebateId: number) => {
    setRebateAssignments(prev => {
      const existing = prev.find(a => a.providerId === providerId);
      if (existing) {
        if (!existing.rebateSetupIds.includes(rebateId)) {
          return prev.map(a =>
            a.providerId === providerId
              ? { ...a, rebateSetupIds: [...a.rebateSetupIds, rebateId] }
              : a
          );
        }
        return prev;
      } else {
        return [...prev, { providerId, rebateSetupIds: [rebateId] }];
      }
    });
  };

  // Remove rebate from provider
  const handleRemoveRebate = (providerId: number, rebateId: number) => {
    setRebateAssignments(prev =>
      prev.map(a =>
        a.providerId === providerId
          ? { ...a, rebateSetupIds: a.rebateSetupIds.filter(id => id !== rebateId) }
          : a
      ).filter(a => a.rebateSetupIds.length > 0)
    );
  };

  // Save rebate setup
  const handleSaveRebateSetup = () => {
    if (!selectedLevelForRebate) return;

    setLevels(prev => prev.map(level =>
      level.id === selectedLevelForRebate.id
        ? { ...level, providerRebateAssignments: rebateAssignments }
        : level
    ));

    console.log(`Saved rebate assignments for ${selectedLevelForRebate.levelName}:`, rebateAssignments);
    setShowRebateSetupModal(false);
  };

  // Get assigned cashbacks for a provider
  const getProviderCashbacks = (providerId: number): number[] => {
    const assignment = cashbackAssignments.find(a => a.providerId === providerId);
    return assignment?.cashbackSetupIds || [];
  };

  // Add cashback to provider
  const handleAddCashback = (providerId: number, cashbackId: number) => {
    setCashbackAssignments(prev => {
      const existing = prev.find(a => a.providerId === providerId);
      if (existing) {
        if (!existing.cashbackSetupIds.includes(cashbackId)) {
          return prev.map(a =>
            a.providerId === providerId
              ? { ...a, cashbackSetupIds: [...a.cashbackSetupIds, cashbackId] }
              : a
          );
        }
        return prev;
      } else {
        return [...prev, { providerId, cashbackSetupIds: [cashbackId] }];
      }
    });
  };

  // Remove cashback from provider
  const handleRemoveCashback = (providerId: number, cashbackId: number) => {
    setCashbackAssignments(prev =>
      prev.map(a =>
        a.providerId === providerId
          ? { ...a, cashbackSetupIds: a.cashbackSetupIds.filter(id => id !== cashbackId) }
          : a
      ).filter(a => a.cashbackSetupIds.length > 0)
    );
  };

  // Save cashback setup
  const handleSaveCashbackSetup = () => {
    if (!selectedLevelForCashback) return;

    setLevels(prev => prev.map(level =>
      level.id === selectedLevelForCashback.id
        ? { ...level, providerCashbackAssignments: cashbackAssignments }
        : level
    ));

    console.log(`Saved cashback assignments for ${selectedLevelForCashback.levelName}:`, cashbackAssignments);
    setShowCashbackSetupModal(false);
  };

  // Apply rebate to all providers
  const handleApplyRebateToAll = () => {
    if (!rebateCategoryToApply || !selectedLevelForRebate) return;

    const allProviderIds = selectedLevelForRebate.providerBetLimits?.map(bl => bl.providerId) || [];

    setRebateAssignments(prev => {
      const newAssignments = [...prev];

      allProviderIds.forEach(providerId => {
        const existingIndex = newAssignments.findIndex(a => a.providerId === providerId);

        if (existingIndex >= 0) {
          // Provider exists, add rebate if not already assigned
          if (!newAssignments[existingIndex].rebateSetupIds.includes(rebateCategoryToApply)) {
            newAssignments[existingIndex].rebateSetupIds.push(rebateCategoryToApply);
          }
        } else {
          // Provider doesn't exist, create new assignment
          newAssignments.push({ providerId, rebateSetupIds: [rebateCategoryToApply] });
        }
      });

      return newAssignments;
    });

    setRebateCategoryToApply('');
  };

  // Apply cashback to all providers
  const handleApplyCashbackToAll = () => {
    if (!cashbackCategoryToApply || !selectedLevelForCashback) return;

    const allProviderIds = selectedLevelForCashback.providerBetLimits?.map(bl => bl.providerId) || [];

    setCashbackAssignments(prev => {
      const newAssignments = [...prev];

      allProviderIds.forEach(providerId => {
        const existingIndex = newAssignments.findIndex(a => a.providerId === providerId);

        if (existingIndex >= 0) {
          // Provider exists, add cashback if not already assigned
          if (!newAssignments[existingIndex].cashbackSetupIds.includes(cashbackCategoryToApply)) {
            newAssignments[existingIndex].cashbackSetupIds.push(cashbackCategoryToApply);
          }
        } else {
          // Provider doesn't exist, create new assignment
          newAssignments.push({ providerId, cashbackSetupIds: [cashbackCategoryToApply] });
        }
      });

      return newAssignments;
    });

    setCashbackCategoryToApply('');
  };

  const handleToggleBank = (bankId: number) => {
    setSelectedBanks(prev =>
      prev.includes(bankId)
        ? prev.filter(id => id !== bankId)
        : [...prev, bankId]
    );
  };

  const handleToggleAllBanks = () => {
    if (selectedBanks.length === banksData.length) {
      setSelectedBanks([]);
    } else {
      setSelectedBanks(banksData.map(bank => bank.id));
    }
  };

  const handleSaveBankList = () => {
    console.log(`Saved banks for level ${selectedLevelForBanks}:`, selectedBanks);
    // Here you would save the bank selections for this level
    setShowBankListModal(false);
  };

  const handleViewBetLimit = (levelId: number) => {
    setSelectedLevelForProviders(levelId);
    const level = levels.find(l => l.id === levelId);
    setProviderBetLimits(level?.providerBetLimits || []); // Load saved bet limits for this level
    setSelectedProviderId(null);
    setTempMinBet(0);
    setTempMaxBet(0);
    setProviderCategoryFilter('all');
    setShowBetLimitModal(true);
  };

  const handleSelectProvider = (providerId: number) => {
    setSelectedProviderId(providerId);
    const existingLimit = providerBetLimits.find(limit => limit.providerId === providerId);
    if (existingLimit) {
      setTempMinBet(existingLimit.minBet);
      setTempMaxBet(existingLimit.maxBet);
    } else {
      setTempMinBet(0);
      setTempMaxBet(0);
    }

    // Scroll to bottom to show min/max bet fields
    setTimeout(() => {
      betLimitFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const handleUpdateBetLimit = () => {
    if (selectedProviderId === null) return;

    setProviderBetLimits(prev => {
      const existing = prev.find(limit => limit.providerId === selectedProviderId);
      if (existing) {
        return prev.map(limit =>
          limit.providerId === selectedProviderId
            ? { ...limit, minBet: tempMinBet, maxBet: tempMaxBet }
            : limit
        );
      } else {
        return [...prev, { providerId: selectedProviderId, minBet: tempMinBet, maxBet: tempMaxBet }];
      }
    });
  };

  const handleRemoveBetLimit = (providerId: number) => {
    setProviderBetLimits(prev => prev.filter(limit => limit.providerId !== providerId));
    if (selectedProviderId === providerId) {
      setSelectedProviderId(null);
      setTempMinBet(0);
      setTempMaxBet(0);
    }
  };

  const getFilteredProviders = () => {
    if (providerCategoryFilter === 'all') {
      return providersData;
    }
    return providersData.filter(p => p.category === providerCategoryFilter);
  };

  const handleSaveBetLimit = () => {
    if (selectedLevelForProviders === null) return;

    setLevels(prev => prev.map(level =>
      level.id === selectedLevelForProviders
        ? { ...level, providerBetLimits }
        : level
    ));

    console.log(`Saved bet limits for level ${selectedLevelForProviders}:`, providerBetLimits);
    setShowBetLimitModal(false);
  };

  const getLevelBadgeColors = (levelName: string) => {
    return levelColors[levelName] || levelColors.Default;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getResetFrequencyOptions = () => {
    if (formData.resetFrequencyType === 'Every Month') {
      return Array.from({ length: 29 }, (_, i) => (i + 1).toString());
    } else {
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    }
  };

  const renderLevelImage = (level: Level) => {
    if (level.image) {
      return (
        <img
          src={level.image}
          alt={level.levelName}
          className="w-[100px] h-[100px] object-cover rounded"
        />
      );
    } else {
      const colors = getLevelBadgeColors(level.levelName);
      return (
        <div
          className="w-[100px] h-[100px] rounded flex items-center justify-center font-bold text-lg"
          style={{ backgroundColor: colors.badgeColor, color: colors.fontColor }}
        >
          {level.levelName.substring(0, 2).toUpperCase()}
        </div>
      );
    }
  };

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Level Management</h2>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white h-9 text-sm font-semibold px-6"
          >
            CREATE LEVEL
          </Button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
            className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <Input
            placeholder="Search level name..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="h-9 max-w-md"
          />

          <Button
            onClick={handleSearch}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6"
          >
            SEARCH
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="text-sm text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            RESET
          </Button>
        </div>
      </div>

      {/* Level List Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Level Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Max Withdraw/Transaction</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Max Withdraw/Day</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Max Count/Day</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredLevels.map((level) => (
                <tr key={level.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {renderLevelImage(level)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {level.levelName}
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {formatCurrency(level.maxWithdrawAmountPerTransaction)}
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {formatCurrency(level.maxWithdrawAmountPerDay)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900 font-medium">
                    {level.maxWithdrawCountPerDay}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      className={`font-semibold ${
                        level.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {level.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(level)}
                        className="bg-[#2196f3] text-white hover:bg-[#1976d2] border-[#2196f3] h-7 px-2"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBankList(level.id)}
                        className="bg-[#9c27b0] text-white hover:bg-[#7b1fa2] border-[#9c27b0] h-7 px-2"
                      >
                        <List className="w-3 h-3 mr-1" />
                        BANKLIST
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBetLimit(level.id)}
                        className="bg-[#ff9800] text-white hover:bg-[#f57c00] border-[#ff9800] h-7 px-2"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        VIEW BET LIMIT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRebateSetup(level)}
                        className="bg-[#00bcd4] text-white hover:bg-[#0097a7] border-[#00bcd4] h-7 px-2"
                      >
                        <Percent className="w-3 h-3 mr-1" />
                        REBATE SETUP
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCashbackSetup(level)}
                        className="bg-[#4caf50] text-white hover:bg-[#388e3c] border-[#4caf50] h-7 px-2"
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        CASHBACK SETUP
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLevel(level.id)}
                        className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] h-7 px-2"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLevels.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No levels found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Level Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">CREATE LEVEL</DialogTitle>
          </DialogHeader>
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar Tabs */}
            <div className="w-48 border-r pr-4 space-y-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Info Settings
              </button>
              <button
                onClick={() => setActiveTab('languages')}
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === 'languages'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Languages
              </button>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 pl-4 overflow-y-auto min-h-[500px]">
              {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level Name *</label>
                <Input
                  value={formData.levelName}
                  onChange={(e) => setFormData(prev => ({ ...prev, levelName: e.target.value }))}
                  className="w-full h-9"
                  placeholder="e.g., Platinum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Amount Per Transaction *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxWithdrawAmountPerTransaction}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxWithdrawAmountPerTransaction: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Amount Per Day *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxWithdrawAmountPerDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxWithdrawAmountPerDay: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Count Per Day *</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.maxWithdrawCountPerDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxWithdrawCountPerDay: parseInt(e.target.value) || 0 }))}
                  className="w-full h-9"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Turnover Rate * (must be &gt; 0)</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.1"
                  value={formData.depositTurnoverRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, depositTurnoverRate: parseFloat(e.target.value) || 1 }))}
                  className="w-full h-9"
                  placeholder="1.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto Upgrade Amount &gt;= *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.autoUpgradeAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, autoUpgradeAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full h-9"
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Upgrade *</label>
                <select
                  value={formData.autoUpgrade ? 'Yes' : 'No'}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoUpgrade: e.target.value === 'Yes' }))}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Downgrade *</label>
                <select
                  value={formData.autoDowngrade ? 'Yes' : 'No'}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoDowngrade: e.target.value === 'Yes' }))}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Frequency Type *</label>
                <select
                  value={formData.resetFrequencyType}
                  onChange={(e) => {
                    const newType = e.target.value as 'Every Month' | 'Every Week';
                    setFormData(prev => ({
                      ...prev,
                      resetFrequencyType: newType,
                      resetFrequencyValue: newType === 'Every Month' ? '1' : 'Monday'
                    }));
                  }}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Every Month">Every Month</option>
                  <option value="Every Week">Every Week</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Frequency Value *</label>
                <select
                  value={formData.resetFrequencyValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, resetFrequencyValue: e.target.value }))}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getResetFrequencyOptions().map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default *</label>
              <select
                value={formData.isDefault ? 'Yes' : 'No'}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.value === 'Yes' }))}
                className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add any additional notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload (Optional, recommended 100px × 100px)</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full h-9"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="w-[100px] h-[100px] object-cover rounded border" />
                </div>
              )}
            </div>
          </div>
              )}

              {activeTab === 'languages' && (
          <div className="space-y-4 min-h-[500px]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level Name (English) *</label>
                <Input
                  value={formData.levelNameTranslations?.english || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    levelNameTranslations: {
                      ...prev.levelNameTranslations!,
                      english: e.target.value
                    }
                  }))}
                  className="w-full h-9"
                  placeholder="e.g., Platinum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level Name (Chinese) *</label>
                <Input
                  value={formData.levelNameTranslations?.chinese || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    levelNameTranslations: {
                      ...prev.levelNameTranslations!,
                      chinese: e.target.value
                    }
                  }))}
                  className="w-full h-9"
                  placeholder="e.g., 白金"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level Name (Malay) *</label>
                <Input
                  value={formData.levelNameTranslations?.malay || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    levelNameTranslations: {
                      ...prev.levelNameTranslations!,
                      malay: e.target.value
                    }
                  }))}
                  className="w-full h-9"
                  placeholder="e.g., Platinum"
                />
              </div>
            </div>
          </div>
              )}
            </div>
          </div>

            <div className="flex gap-3 pt-3 border-t mt-4">
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleCreateLevel}
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
              >
                CREATE LEVEL
              </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Edit Level Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">EDIT LEVEL</DialogTitle>
          </DialogHeader>
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar Tabs */}
            <div className="w-48 border-r pr-4 space-y-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Info Settings
              </button>
              <button
                onClick={() => setActiveTab('languages')}
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === 'languages'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Languages
              </button>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 pl-4 overflow-y-auto min-h-[500px]">
              {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level Name *</label>
                <Input
                  value={formData.levelName}
                  onChange={(e) => setFormData(prev => ({ ...prev, levelName: e.target.value }))}
                  className="w-full h-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Amount Per Transaction *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxWithdrawAmountPerTransaction}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxWithdrawAmountPerTransaction: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Amount Per Day *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxWithdrawAmountPerDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxWithdrawAmountPerDay: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Count Per Day *</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.maxWithdrawCountPerDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxWithdrawCountPerDay: parseInt(e.target.value) || 0 }))}
                  className="w-full h-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Turnover Rate * (must be &gt; 0)</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.1"
                  value={formData.depositTurnoverRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, depositTurnoverRate: parseFloat(e.target.value) || 1 }))}
                  className="w-full h-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto Upgrade Amount &gt;= *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.autoUpgradeAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, autoUpgradeAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Upgrade *</label>
                <select
                  value={formData.autoUpgrade ? 'Yes' : 'No'}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoUpgrade: e.target.value === 'Yes' }))}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Downgrade *</label>
                <select
                  value={formData.autoDowngrade ? 'Yes' : 'No'}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoDowngrade: e.target.value === 'Yes' }))}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Frequency Type *</label>
                <select
                  value={formData.resetFrequencyType}
                  onChange={(e) => {
                    const newType = e.target.value as 'Every Month' | 'Every Week';
                    setFormData(prev => ({
                      ...prev,
                      resetFrequencyType: newType,
                      resetFrequencyValue: newType === 'Every Month' ? '1' : 'Monday'
                    }));
                  }}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Every Month">Every Month</option>
                  <option value="Every Week">Every Week</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Frequency Value *</label>
                <select
                  value={formData.resetFrequencyValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, resetFrequencyValue: e.target.value }))}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getResetFrequencyOptions().map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default *</label>
              <select
                value={formData.isDefault ? 'Yes' : 'No'}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.value === 'Yes' }))}
                className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload (Optional, recommended 100px × 100px)</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full h-9"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="w-[100px] h-[100px] object-cover rounded border" />
                </div>
              )}
            </div>
          </div>
              )}

              {activeTab === 'languages' && (
          <div className="space-y-4 min-h-[500px]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level Name (English) *</label>
                <Input
                  value={formData.levelNameTranslations?.english || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    levelNameTranslations: {
                      ...prev.levelNameTranslations!,
                      english: e.target.value
                    }
                  }))}
                  className="w-full h-9"
                  placeholder="e.g., Platinum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level Name (Chinese) *</label>
                <Input
                  value={formData.levelNameTranslations?.chinese || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    levelNameTranslations: {
                      ...prev.levelNameTranslations!,
                      chinese: e.target.value
                    }
                  }))}
                  className="w-full h-9"
                  placeholder="e.g., 白金"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level Name (Malay) *</label>
                <Input
                  value={formData.levelNameTranslations?.malay || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    levelNameTranslations: {
                      ...prev.levelNameTranslations!,
                      malay: e.target.value
                    }
                  }))}
                  className="w-full h-9"
                  placeholder="e.g., Platinum"
                />
              </div>
            </div>
          </div>
              )}
            </div>
          </div>

            <div className="flex gap-3 pt-3 border-t mt-4">
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedLevel(null);
                  resetForm();
                }}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleEditLevel}
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
              >
                UPDATE LEVEL
              </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Bank List Modal */}
      <Dialog open={showBankListModal} onOpenChange={setShowBankListModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              Bank List - {levels.find(l => l.id === selectedLevelForBanks)?.levelName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase w-12">
                      <input
                        type="checkbox"
                        checked={selectedBanks.length === banksData.length}
                        onChange={handleToggleAllBanks}
                        className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Bank Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Bank Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Account Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Account No</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {banksData.map((bank) => (
                    <tr
                      key={bank.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedBanks.includes(bank.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleToggleBank(bank.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedBanks.includes(bank.id)}
                          onChange={() => handleToggleBank(bank.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-[#3949ab] border-gray-300 rounded focus:ring-[#3949ab]"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        <Badge className="bg-blue-100 text-blue-800 font-semibold">
                          {bank.bankType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {bank.bankName}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {bank.accountName}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-mono">
                        {bank.accountNo}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={bank.status === 'Active' ? 'bg-green-100 text-green-700 font-semibold' : 'bg-red-100 text-red-700 font-semibold'}>
                          {bank.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{selectedBanks.length}</span> bank(s) selected out of <span className="font-semibold">{banksData.length}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t mt-4">
            <Button
              onClick={() => setShowBankListModal(false)}
              variant="outline"
              className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSaveBankList}
              className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
            >
              SAVE SELECTION
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Bet Limit Modal */}
      <Dialog open={showBetLimitModal} onOpenChange={setShowBetLimitModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              Bet Limit Providers - {levels.find(l => l.id === selectedLevelForProviders)?.levelName}
            </DialogTitle>
          </DialogHeader>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap pb-3 border-b">
            <Button
              onClick={() => setProviderCategoryFilter('all')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'all'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </Button>
            <Button
              onClick={() => setProviderCategoryFilter('cricket')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'cricket'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏏 Cricket
            </Button>
            <Button
              onClick={() => setProviderCategoryFilter('slot')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'slot'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎰 Slot
            </Button>
            <Button
              onClick={() => setProviderCategoryFilter('3d-game')}
              className={`h-8 text-xs ${
                providerCategoryFilter === '3d-game'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎮 3D Game
            </Button>
            <Button
              onClick={() => setProviderCategoryFilter('live-casino')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'live-casino'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎲 Live Casino
            </Button>
            <Button
              onClick={() => setProviderCategoryFilter('fishing')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'fishing'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎣 Fishing
            </Button>
            <Button
              onClick={() => setProviderCategoryFilter('esports')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'esports'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎮 Esports
            </Button>
            <Button
              onClick={() => setProviderCategoryFilter('sports')}
              className={`h-8 text-xs ${
                providerCategoryFilter === 'sports'
                  ? 'bg-[#3949ab] text-white hover:bg-[#2c3785]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⚽ Sports
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase w-12">SELECT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Provider Name</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Min Bet</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Max Bet</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {getFilteredProviders().map((provider) => {
                    const betLimit = providerBetLimits.find(limit => limit.providerId === provider.id);
                    return (
                      <tr
                        key={provider.id}
                        className={`hover:bg-gray-50 ${
                          selectedProviderId === provider.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="radio"
                            name="selectedProvider"
                            checked={selectedProviderId === provider.id}
                            onChange={() => handleSelectProvider(provider.id)}
                            className="w-4 h-4 text-[#3949ab] border-gray-300 focus:ring-[#3949ab]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-[#3949ab] text-white font-semibold">
                            {categoryLabels[provider.category]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {provider.name}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-900">
                          {betLimit ? `$${betLimit.minBet.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-900">
                          {betLimit ? `$${betLimit.maxBet.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {betLimit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveBetLimit(provider.id)}
                              className="bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336] h-6 px-2 text-xs"
                            >
                              REMOVE
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bet Limit Input Section */}
            {selectedProviderId !== null && (
              <div ref={betLimitFormRef} className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Set Bet Limit for {providersData.find(p => p.id === selectedProviderId)?.name}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Bet *</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tempMinBet}
                      onChange={(e) => setTempMinBet(parseFloat(e.target.value) || 0)}
                      className="w-full h-9"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Bet *</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tempMaxBet}
                      onChange={(e) => setTempMaxBet(parseFloat(e.target.value) || 0)}
                      className="w-full h-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpdateBetLimit}
                  className="mt-3 w-full bg-[#2196f3] hover:bg-[#1976d2] text-white h-9"
                >
                  UPDATE BET LIMIT
                </Button>
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{providerBetLimits.length}</span> provider(s) have bet limits configured
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t mt-4">
            <Button
              onClick={() => setShowBetLimitModal(false)}
              variant="outline"
              className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSaveBetLimit}
              className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
            >
              SAVE BET LIMITS
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rebate Setup Modal */}
      <Dialog open={showRebateSetupModal} onOpenChange={setShowRebateSetupModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              Rebate Setup - {selectedLevelForRebate?.levelName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-700">
              Assign rebate setups to providers with configured bet limits for <strong>{selectedLevelForRebate?.levelName}</strong> level.
            </p>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Provider</label>
                <Input
                  placeholder="Search provider name..."
                  value={rebateProviderSearch}
                  onChange={(e) => setRebateProviderSearch(e.target.value)}
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Rebate Category</label>
                <select
                  value={rebateCategoryFilter}
                  onChange={(e) => setRebateCategoryFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Rebates</option>
                  {rebateSetupsData.map(rebate => (
                    <option key={rebate.id} value={rebate.id}>{rebate.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Apply to All Providers */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Apply Rebate to All Providers</label>
              <div className="flex gap-3">
                <select
                  value={rebateCategoryToApply}
                  onChange={(e) => setRebateCategoryToApply(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="flex-1 h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Rebate Category</option>
                  {rebateSetupsData.map(rebate => (
                    <option key={rebate.id} value={rebate.id}>{rebate.name}</option>
                  ))}
                </select>
                <Button
                  onClick={handleApplyRebateToAll}
                  disabled={!rebateCategoryToApply}
                  className="bg-[#2196f3] text-white hover:bg-[#1976d2] h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  APPLY TO ALL
                </Button>
              </div>
            </div>

            {selectedLevelForRebate?.providerBetLimits && selectedLevelForRebate.providerBetLimits.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase w-12">No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase w-1/4">Provider</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase w-24">Min Bet</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase w-24">Max Bet</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedLevelForRebate.providerBetLimits
                      .filter((betLimit) => {
                        const provider = providersData.find(p => p.id === betLimit.providerId);
                        if (!provider) return false;

                        // Filter by provider name
                        if (rebateProviderSearch && !provider.name.toLowerCase().includes(rebateProviderSearch.toLowerCase())) {
                          return false;
                        }

                        // Filter by rebate category
                        if (rebateCategoryFilter !== 'all') {
                          const assignedRebateIds = getProviderRebates(provider.id);
                          if (!assignedRebateIds.includes(rebateCategoryFilter)) {
                            return false;
                          }
                        }

                        return true;
                      })
                      .map((betLimit, index) => {
                      const provider = providersData.find(p => p.id === betLimit.providerId);
                      if (!provider) return null;

                      const assignedRebateIds = getProviderRebates(provider.id);

                      return (
                        <tr key={provider.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{index + 1}.</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[#3949ab] text-white font-semibold text-xs">
                                {categoryLabels[provider.category]}
                              </Badge>
                              <span className="font-medium text-gray-900 text-sm">{provider.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">${betLimit.minBet.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">${betLimit.maxBet.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-2">
                              {/* Render assigned rebates as badges with X button */}
                              {assignedRebateIds.map(rebateId => {
                                const rebate = rebateSetupsData.find(r => r.id === rebateId);
                                if (!rebate) return null;
                                return (
                                  <div key={rebateId} className="flex items-center gap-2">
                                    <Badge className="bg-blue-100 text-blue-800 font-medium text-xs">
                                      {rebate.name}
                                    </Badge>
                                    <button
                                      onClick={() => handleRemoveRebate(provider.id, rebateId)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Dropdown for new selection */}
                              <select
                                className="w-full px-3 py-1 border rounded text-sm bg-white"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAddRebate(provider.id, parseInt(e.target.value));
                                    e.target.value = '';
                                  }
                                }}
                              >
                                <option value="">Please Select</option>
                                {rebateSetupsData
                                  .filter(r => !assignedRebateIds.includes(r.id))
                                  .map(rebate => (
                                    <option key={rebate.id} value={rebate.id}>
                                      {rebate.name}
                                    </option>
                                  ))
                                }
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No providers with bet limits configured for this level.
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t">
              <Button
                onClick={() => setShowRebateSetupModal(false)}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleSaveRebateSetup}
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
              >
                SAVE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CashBack Setup Modal */}
      <Dialog open={showCashbackSetupModal} onOpenChange={setShowCashbackSetupModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              CashBack Setup - {selectedLevelForCashback?.levelName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-700">
              Assign cashback setups to providers with configured bet limits for <strong>{selectedLevelForCashback?.levelName}</strong> level.
            </p>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Provider</label>
                <Input
                  placeholder="Search provider name..."
                  value={cashbackProviderSearch}
                  onChange={(e) => setCashbackProviderSearch(e.target.value)}
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by CashBack Category</label>
                <select
                  value={cashbackCategoryFilter}
                  onChange={(e) => setCashbackCategoryFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All CashBacks</option>
                  {cashBackSetupsData.map(cashback => (
                    <option key={cashback.id} value={cashback.id}>{cashback.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Apply to All Providers */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Apply CashBack to All Providers</label>
              <div className="flex gap-3">
                <select
                  value={cashbackCategoryToApply}
                  onChange={(e) => setCashbackCategoryToApply(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="flex-1 h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select CashBack Category</option>
                  {cashBackSetupsData.map(cashback => (
                    <option key={cashback.id} value={cashback.id}>{cashback.name}</option>
                  ))}
                </select>
                <Button
                  onClick={handleApplyCashbackToAll}
                  disabled={!cashbackCategoryToApply}
                  className="bg-[#4caf50] text-white hover:bg-[#45a049] h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  APPLY TO ALL
                </Button>
              </div>
            </div>

            {selectedLevelForCashback?.providerBetLimits && selectedLevelForCashback.providerBetLimits.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase w-12">No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase w-1/4">Provider</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase w-24">Min Bet</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase w-24">Max Bet</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedLevelForCashback.providerBetLimits
                      .filter((betLimit) => {
                        const provider = providersData.find(p => p.id === betLimit.providerId);
                        if (!provider) return false;

                        // Filter by provider name
                        if (cashbackProviderSearch && !provider.name.toLowerCase().includes(cashbackProviderSearch.toLowerCase())) {
                          return false;
                        }

                        // Filter by cashback category
                        if (cashbackCategoryFilter !== 'all') {
                          const assignedCashbackIds = getProviderCashbacks(provider.id);
                          if (!assignedCashbackIds.includes(cashbackCategoryFilter)) {
                            return false;
                          }
                        }

                        return true;
                      })
                      .map((betLimit, index) => {
                      const provider = providersData.find(p => p.id === betLimit.providerId);
                      if (!provider) return null;

                      const assignedCashbackIds = getProviderCashbacks(provider.id);

                      return (
                        <tr key={provider.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{index + 1}.</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[#3949ab] text-white font-semibold text-xs">
                                {categoryLabels[provider.category]}
                              </Badge>
                              <span className="font-medium text-gray-900 text-sm">{provider.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">${betLimit.minBet.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">${betLimit.maxBet.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-2">
                              {/* Render assigned cashbacks as badges with X button */}
                              {assignedCashbackIds.map(cashbackId => {
                                const cashback = cashBackSetupsData.find(c => c.id === cashbackId);
                                if (!cashback) return null;
                                return (
                                  <div key={cashbackId} className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800 font-medium text-xs">
                                      {cashback.name}
                                    </Badge>
                                    <button
                                      onClick={() => handleRemoveCashback(provider.id, cashbackId)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Dropdown for new selection */}
                              <select
                                className="w-full px-3 py-1 border rounded text-sm bg-white"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAddCashback(provider.id, parseInt(e.target.value));
                                    e.target.value = '';
                                  }
                                }}
                              >
                                <option value="">Please Select</option>
                                {cashBackSetupsData
                                  .filter(c => !assignedCashbackIds.includes(c.id))
                                  .map(cashback => (
                                    <option key={cashback.id} value={cashback.id}>
                                      {cashback.name}
                                    </option>
                                  ))
                                }
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No providers with bet limits configured for this level.
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t">
              <Button
                onClick={() => setShowCashbackSetupModal(false)}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleSaveCashbackSetup}
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
              >
                SAVE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}