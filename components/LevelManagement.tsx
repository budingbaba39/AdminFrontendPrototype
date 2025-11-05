import { useState, ChangeEvent, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Trash2, Edit, List, TrendingUp, RefreshCw, Percent, DollarSign, X, UserPlus } from 'lucide-react';
import { Level, initialLevels, levelColors, ProviderBetLimit } from './LevelData';
import { Bank, banksData } from './BankData';
import { Provider, providersData, categoryLabels } from './ProviderData';
import { rebateSetupsData } from './RebateSetupData';
import { cashBackSetupsData } from './CashBackSetupData';
import { sampleCommissionSetups, CommissionSetup } from './CommissionSetupData';
import { initialReferrerSetups, ReferrerSetup } from './ReferrerSetupData';
import { initialPromotions } from './PromotionSetupData';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function LevelManagement() {
  const [levels, setLevels] = useState<Level[]>(initialLevels);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'info' | 'languages'>('info');
  const [languageTab, setLanguageTab] = useState<'english' | 'chinese' | 'malay'>('english');
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
  const [selectedRebateIds, setSelectedRebateIds] = useState<string[]>([]);
  const [selectedCashbackIds, setSelectedCashbackIds] = useState<string[]>([]);
  const [rebateNameFilter, setRebateNameFilter] = useState('');
  const [cashbackNameFilter, setCashbackNameFilter] = useState('');
  const [cashbackTargetTypeFilter, setCashbackTargetTypeFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{type: 'error' | 'success' | 'warning', message: string} | null>(null);

  // Commission Setup Modal
  const [showCommissionSetupModal, setShowCommissionSetupModal] = useState(false);
  const [selectedLevelForCommission, setSelectedLevelForCommission] = useState<Level | null>(null);
  const [selectedCommissionIds, setSelectedCommissionIds] = useState<string[]>([]);
  const [commissionNameFilter, setCommissionNameFilter] = useState('');
  const [commissionTargetTypeFilter, setCommissionTargetTypeFilter] = useState<string>('all');

  // Referrer Setup Modal
  const [showReferrerSetupModal, setShowReferrerSetupModal] = useState(false);
  const [selectedLevelForReferrer, setSelectedLevelForReferrer] = useState<Level | null>(null);
  const [selectedReferrerIds, setSelectedReferrerIds] = useState<string[]>([]);
  const [referrerNameFilter, setReferrerNameFilter] = useState('');
  const [referrerTargetTypeFilter, setReferrerTargetTypeFilter] = useState<string>('all');

  const [formData, setFormData] = useState<Omit<Level, 'id' | 'createdDate'>>({
    levelName: '',
    levelNameTranslations: {
      chinese: '',
      malay: ''
    },
    maxWithdrawAmountPerTransaction: 0,
    maxWithdrawAmountPerDay: 0,
    minWithdrawAmount: 0,
    minDepositAmount: 0,
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

  const [languageTranslations, setLanguageTranslations] = useState({
    english: { name: '', description: '', image: '' },
    chinese: { name: '', description: '', image: '' },
    malay: { name: '', description: '', image: '' }
  });

  const [validationErrors, setValidationErrors] = useState({
    englishName: false,
    depositTurnoverRate: false
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
        chinese: '',
        malay: ''
      },
      maxWithdrawAmountPerTransaction: 0,
      maxWithdrawAmountPerDay: 0,
      minWithdrawAmount: 0,
      minDepositAmount: 0,
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
    setLanguageTranslations({
      english: { name: '', description: '', image: '' },
      chinese: { name: '', description: '', image: '' },
      malay: { name: '', description: '', image: '' }
    });
    setImagePreview('');
    setActiveTab('info');
    setLanguageTab('english');
    setValidationErrors({
      englishName: false,
      depositTurnoverRate: false
    });
  };

  const handleCreateLevel = () => {
    // Validation
    const errors = {
      englishName: !languageTranslations.english.name || languageTranslations.english.name.trim() === '',
      depositTurnoverRate: formData.depositTurnoverRate <= 0
    };

    setValidationErrors(errors);

    if (errors.englishName || errors.depositTurnoverRate) {
      return;
    }

    const newLevel: Level = {
      ...formData,
      id: levels.length > 0 ? Math.max(...levels.map(l => l.id)) + 1 : 1,
      createdDate: new Date().toISOString().split('T')[0],
      translations: languageTranslations
    };

    setLevels(prev => [...prev, newLevel]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEditLevel = () => {
    if (!selectedLevel) return;

    // Validation
    if (!formData.levelName || formData.levelName.trim() === '') {
      alert('Level Name is required');
      return;
    }
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
        ? {
            ...formData,
            id: selectedLevel.id,
            createdDate: level.createdDate,
            providerBetLimits: level.providerBetLimits,
            providerRebateAssignments: level.providerRebateAssignments,
            providerCashbackAssignments: level.providerCashbackAssignments,
            translations: languageTranslations
          }
        : level
    ));

    console.log('Updated level:', formData.levelName);
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
    const translations = level.levelNameTranslations || {
      chinese: '',
      malay: ''
    };
    setFormData({
      levelName: level.levelName,
      levelNameTranslations: translations,
      maxWithdrawAmountPerTransaction: level.maxWithdrawAmountPerTransaction,
      maxWithdrawAmountPerDay: level.maxWithdrawAmountPerDay,
      minWithdrawAmount: level.minWithdrawAmount,
      minDepositAmount: level.minDepositAmount,
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
    // Load translations, with English name defaulting to levelName if not set
    const loadedTranslations = level.translations || {
      english: { name: '', description: '', image: '' },
      chinese: { name: '', description: '', image: '' },
      malay: { name: '', description: '', image: '' }
    };

    // Ensure English name is synced with levelName
    if (!loadedTranslations.english.name && level.levelName) {
      loadedTranslations.english.name = level.levelName;
    }

    setLanguageTranslations(loadedTranslations);
    setImagePreview(level.image || '');
    setActiveTab('info');
    setLanguageTab('english');
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

  const handleLanguageImageUpload = (lang: 'english' | 'chinese' | 'malay', e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setLanguageTranslations(prev => ({
          ...prev,
          [lang]: { ...prev[lang], image: base64Image }
        }));

        // Sync English image with the deprecated image field
        if (lang === 'english') {
          setFormData(prev => ({ ...prev, image: base64Image }));
          setImagePreview(base64Image);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLanguageImage = (lang: 'english' | 'chinese' | 'malay') => {
    setLanguageTranslations(prev => ({
      ...prev,
      [lang]: { ...prev[lang], image: '' }
    }));

    // Sync English image removal with the deprecated image field
    if (lang === 'english') {
      setFormData(prev => ({ ...prev, image: '' }));
      setImagePreview('');
    }
  };

  const handleBankList = (levelId: number) => {
    setSelectedLevelForBanks(levelId);
    setSelectedBanks([]); // Reset selection or load saved banks for this level
    setShowBankListModal(true);
  };

  const handleRebateSetup = (level: Level) => {
    setSelectedLevelForRebate(level);
    setSelectedRebateIds(level.rebateSetupIds || []);
    setNotification(null);
    setShowRebateSetupModal(true);
  };

  // Handler to toggle rebate selection
  const handleToggleRebate = (rebateId: string) => {
    const isCurrentlySelected = selectedRebateIds.includes(rebateId);

    if (isCurrentlySelected) {
      // Remove from selection
      setSelectedRebateIds(prev => prev.filter(id => id !== rebateId));
      setNotification(null);
    } else {
      // Get the new rebate being added
      const newRebate = rebateSetupsData.find(r => r.id === rebateId);
      if (!newRebate) return;

      // Since rebate only has 1 type, limit to 1 selection total
      if (selectedRebateIds.length >= 1) {
        const existingRebate = rebateSetupsData.find(r => r.id === selectedRebateIds[0]);
        setNotification({
          type: 'warning',
          message: `Maximum reached! You can only select 1 rebate setup. Currently selected: "${existingRebate?.name}". Deselect it before selecting another.`
        });
        return;
      }

      // Add to selection
      setSelectedRebateIds(prev => [...prev, rebateId]);
      setNotification(null);
    }
  };

  const handleCashbackSetup = (level: Level) => {
    setSelectedLevelForCashback(level);
    setSelectedCashbackIds(level.cashbackSetupIds || []);
    setNotification(null);
    setShowCashbackSetupModal(true);
  };

  // Handler to open Commission Setup Modal
  const handleCommissionSetup = (level: Level) => {
    setSelectedLevelForCommission(level);
    setSelectedCommissionIds(level.commissionSetupIds || []);
    setNotification(null);
    setShowCommissionSetupModal(true);
  };

  // Handler to toggle commission selection
  const handleToggleCommission = (commissionId: string) => {
    const isCurrentlySelected = selectedCommissionIds.includes(commissionId);

    if (isCurrentlySelected) {
      // Remove from selection
      setSelectedCommissionIds(prev => prev.filter(id => id !== commissionId));
      setNotification(null);
    } else {
      // Get the new commission being added
      const newCommission = sampleCommissionSetups.find(c => c.id === commissionId);
      if (!newCommission) return;

      // Validation: No duplicate target types
      const existingTypes = selectedCommissionIds
        .map(id => sampleCommissionSetups.find(c => c.id === id)?.targetType)
        .filter(Boolean);

      if (newCommission && existingTypes.includes(newCommission.targetType)) {
        const duplicateCommission = selectedCommissionIds
          .map(id => sampleCommissionSetups.find(c => c.id === id))
          .find(c => c?.targetType === newCommission.targetType);
        setNotification({
          type: 'error',
          message: `Cannot select duplicate commission target types! A setup with target type "${newCommission.targetType}" is already selected: "${duplicateCommission?.name}". Only ONE setup per target type is allowed.`
        });
        return;
      }

      // Validation: Max 3 commission setups (one from each target type)
      if (selectedCommissionIds.length >= 3) {
        const selectedSetupNames = selectedCommissionIds
          .map(id => sampleCommissionSetups.find(c => c.id === id)?.name)
          .filter(Boolean)
          .join('", "');
        setNotification({
          type: 'warning',
          message: `Maximum reached! You can only select up to 3 commission setups (one from each target type). Currently selected: "${selectedSetupNames}". Deselect a setup before selecting another.`
        });
        return;
      }

      // Add to selection
      setSelectedCommissionIds(prev => [...prev, commissionId]);
      setNotification(null);
    }
  };

  // Handler to save Commission Setup
  const handleSaveCommissionSetup = () => {
    if (!selectedLevelForCommission) return;

    setLevels(prev => prev.map(level =>
      level.id === selectedLevelForCommission.id
        ? { ...level, commissionSetupIds: selectedCommissionIds }
        : level
    ));

    console.log(`Saved commission setups for ${selectedLevelForCommission.levelName}:`, selectedCommissionIds);
    setShowCommissionSetupModal(false);
  };

  // Handler to open Referrer Setup Modal
  const handleReferrerSetup = (level: Level) => {
    setSelectedLevelForReferrer(level);
    setSelectedReferrerIds(level.referrerSetupIds || []);
    setNotification(null);
    setShowReferrerSetupModal(true);
  };

  // Handler to toggle referrer selection
  const handleToggleReferrer = (referrerId: string) => {
    const isCurrentlySelected = selectedReferrerIds.includes(referrerId);

    if (isCurrentlySelected) {
      // Remove from selection
      setSelectedReferrerIds(prev => prev.filter(id => id !== referrerId));
      setNotification(null);
    } else {
      // Get the new referrer being added
      const newReferrer = initialReferrerSetups.find(r => r.id === referrerId);
      if (!newReferrer) return;

      // Get targetType from the linked promotion
      const newReferrerPromo = initialPromotions.find(p => p.id === newReferrer.promoId);
      const newReferrerTargetType = newReferrerPromo?.targetType;

      // Validation: No duplicate target types
      const existingTypes = selectedReferrerIds
        .map(id => {
          const referrer = initialReferrerSetups.find(r => r.id === id);
          const promo = referrer ? initialPromotions.find(p => p.id === referrer.promoId) : null;
          return promo?.targetType;
        })
        .filter(Boolean);

      if (newReferrer && newReferrerTargetType && existingTypes.includes(newReferrerTargetType)) {
        const duplicateReferrer = selectedReferrerIds
          .map(id => initialReferrerSetups.find(r => r.id === id))
          .find(r => {
            const promo = r ? initialPromotions.find(p => p.id === r.promoId) : null;
            return promo?.targetType === newReferrerTargetType;
          });
        setNotification({
          type: 'error',
          message: `Cannot select duplicate referrer target types! A setup with target type "${newReferrerTargetType}" is already selected: "${duplicateReferrer?.name}". Only ONE setup per target type is allowed.`
        });
        return;
      }

      // Validation: Max 2 referrer setups (one from each target type)
      if (selectedReferrerIds.length >= 2) {
        const selectedSetupNames = selectedReferrerIds
          .map(id => initialReferrerSetups.find(r => r.id === id)?.name)
          .filter(Boolean)
          .join('", "');
        setNotification({
          type: 'warning',
          message: `Maximum reached! You can only select up to 2 referrer setups (one from each target type). Currently selected: "${selectedSetupNames}". Deselect a setup before selecting another.`
        });
        return;
      }

      // Add to selection
      setSelectedReferrerIds(prev => [...prev, referrerId]);
      setNotification(null);
    }
  };

  // Handler to save Referrer Setup
  const handleSaveReferrerSetup = () => {
    if (!selectedLevelForReferrer) return;

    setLevels(prev => prev.map(level =>
      level.id === selectedLevelForReferrer.id
        ? { ...level, referrerSetupIds: selectedReferrerIds }
        : level
    ));

    console.log(`Saved referrer setups for ${selectedLevelForReferrer.levelName}:`, selectedReferrerIds);
    setShowReferrerSetupModal(false);
  };

  // Handler to toggle cashback selection
  const handleToggleCashback = (cashbackId: string) => {
    const isCurrentlySelected = selectedCashbackIds.includes(cashbackId);

    if (isCurrentlySelected) {
      // Remove from selection
      setSelectedCashbackIds(prev => prev.filter(id => id !== cashbackId));
      setNotification(null);
    } else {
      // Get the new cashback being added
      const newCashback = cashBackSetupsData.find(c => c.id === cashbackId);
      if (!newCashback) return;

      // Get existing selected cashbacks with their types
      const existingCashbacks = selectedCashbackIds
        .map(id => cashBackSetupsData.find(c => c.id === id))
        .filter((c): c is NonNullable<typeof c> => c !== undefined);

      // Check if this type is already selected
      const duplicateType = existingCashbacks.find(c => c.cashbackType === newCashback.cashbackType);

      if (duplicateType) {
        setNotification({
          type: 'error',
          message: `Cannot select duplicate cashback types! You already selected "${duplicateType.name}" with type "${duplicateType.cashbackType}". Only ONE setup per cashback type is allowed.`
        });
        return;
      }

      // Cashback has 3 types, so limit to 3 selections total (one from each type)
      if (selectedCashbackIds.length >= 3) {
        const selectedSetupNames = selectedCashbackIds
          .map(id => cashBackSetupsData.find(c => c.id === id)?.name)
          .filter(Boolean)
          .join('", "');
        setNotification({
          type: 'warning',
          message: `Maximum reached! You can only select up to 3 cashback setups (one from each cashback type). Currently selected: "${selectedSetupNames}". Deselect a setup before selecting another.`
        });
        return;
      }

      // Add to selection
      setSelectedCashbackIds(prev => [...prev, cashbackId]);
      setNotification(null);
    }
  };

  // Save rebate setup
  const handleSaveRebateSetup = () => {
    if (!selectedLevelForRebate) return;

    setLevels(prev => prev.map(level =>
      level.id === selectedLevelForRebate.id
        ? { ...level, rebateSetupIds: selectedRebateIds }
        : level
    ));

    console.log(`Saved rebate setups for ${selectedLevelForRebate.levelName}:`, selectedRebateIds);
    setShowRebateSetupModal(false);
  };

  // Save cashback setup
  const handleSaveCashbackSetup = () => {
    if (!selectedLevelForCashback) return;

    setLevels(prev => prev.map(level =>
      level.id === selectedLevelForCashback.id
        ? { ...level, cashbackSetupIds: selectedCashbackIds }
        : level
    ));

    console.log(`Saved cashback setups for ${selectedLevelForCashback.levelName}:`, selectedCashbackIds);
    setShowCashbackSetupModal(false);
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
    const colors = levelColors[levelName] || levelColors['Default'];
    return colors || { badgeColor: '#6b7280', fontColor: '#ffffff' };
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getResetFrequencyOptions = () => {
    if (formData.resetFrequencyType === 'Every Month') {
      return Array.from({ length: 28 }, (_, i) => (i + 1).toString());
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
                        onClick={() => handleCommissionSetup(level)}
                        className="bg-[#ff9800] text-white hover:bg-[#f57c00] border-[#ff9800] h-7 px-2"
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        COMMISSION SETUP
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReferrerSetup(level)}
                        className="bg-[#9c27b0] text-white hover:bg-[#7b1fa2] border-[#9c27b0] h-7 px-2"
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        REFERRER SETUP
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"> Minimum Deposit Amount</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minDepositAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, minDepositAmount: parseFloat(e.target.value) || 0, }))}
                    className="w-full h-9"
                    placeholder="0.00"
                  />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Withdraw Amount</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minWithdrawAmount}
                    onChange={(e) =>setFormData((prev) => ({...prev,minWithdrawAmount: parseFloat(e.target.value) || 0,}))}
                    className="w-full h-9"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Amount Per Transaction</label>
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
              </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Amount Per Day</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Count Per Day</label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Turnover Rate * (must be &gt; 0)</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.1"
                  value={formData.depositTurnoverRate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, depositTurnoverRate: parseFloat(e.target.value) || 1 }));
                    setValidationErrors(prev => ({ ...prev, depositTurnoverRate: false }));
                  }}
                  className={`w-full h-9 ${validationErrors.depositTurnoverRate ? 'border-red-500 border-2' : ''}`}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto Upgrade Amount &gt;=</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Upgrade</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Downgrade</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Frequency Type</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Frequency Value</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Default</label>
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

          </div>
              )}

              {activeTab === 'languages' && (
          <div className="space-y-4 min-h-[500px]">
            {/* Language Tab Selection */}
            <div className="flex gap-2 border-b pb-2">
              <button
                onClick={() => setLanguageTab('english')}
                className={`px-6 py-2 rounded-t font-medium transition-colors ${
                  languageTab === 'english'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguageTab('chinese')}
                className={`px-6 py-2 rounded-t font-medium transition-colors ${
                  languageTab === 'chinese'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chinese
              </button>
              <button
                onClick={() => setLanguageTab('malay')}
                className={`px-6 py-2 rounded-t font-medium transition-colors ${
                  languageTab === 'malay'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Malay
              </button>
            </div>

            {/* Language Content */}
            <div className="space-y-4 pt-2">
              {/* Name Input */}
              <div className="w-full">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Name ({languageTab.charAt(0).toUpperCase() + languageTab.slice(1)}) {languageTab === 'english' ? '*' : ''}
                </label>
                <Input
                  type="text"
                  value={languageTranslations[languageTab].name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setLanguageTranslations(prev => ({
                      ...prev,
                      [languageTab]: { ...prev[languageTab], name: newName }
                    }));

                    // Sync English name with the main levelName field
                    if (languageTab === 'english') {
                      setFormData(prev => ({ ...prev, levelName: newName }));
                      setValidationErrors(prev => ({ ...prev, englishName: false }));
                    }
                  }}
                  placeholder="Enter level name"
                  className={`w-full h-10 ${languageTab === 'english' && validationErrors.englishName ? 'border-red-500 border-2' : ''}`}
                />
              </div>

              {/* Description Rich Text */}
              <div className="w-full">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Description ({languageTab.charAt(0).toUpperCase() + languageTab.slice(1)})
                </label>
                <ReactQuill
                  key={`description-${languageTab}`}
                  value={languageTranslations[languageTab].description}
                  onChange={(value) => setLanguageTranslations(prev => ({
                    ...prev,
                    [languageTab]: { ...prev[languageTab], description: value }
                  }))}
                  className="bg-white"
                  theme="snow"
                />
              </div>

              {/* Level Image Upload */}
              <div className="w-full">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Level Image ({languageTab.charAt(0).toUpperCase() + languageTab.slice(1)})
                </label>
                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLanguageImageUpload(languageTab, e)}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#3949ab] file:text-white
                      hover:file:bg-[#2c3785] cursor-pointer"
                  />
                </div>

                {/* Image Preview */}
                {languageTranslations[languageTab].image ? (
                  <div className="relative group inline-block">
                    <img
                      src={languageTranslations[languageTab].image}
                      alt={`Level ${languageTab}`}
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => removeLanguageImage(languageTab)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                    No image uploaded
                  </div>
                )}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                    value={formData.status}
                    onChange={(e) =>setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                    className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
               </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Deposit Amount *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minDepositAmount}
                  onChange={(e) =>setFormData((prev) => ({...prev,minDepositAmount: parseFloat(e.target.value) || 0,}))}
                  className="w-full h-9"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Withdraw Amount *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minWithdrawAmount}
                  onChange={(e) =>setFormData(prev => ({...prev,minWithdrawAmount: parseFloat(e.target.value) || 0, }))}
                  className="w-full h-9"
                  placeholder="0.00"
                />
              </div>
                    
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Amount Per Transaction *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxWithdrawAmountPerTransaction}
                  onChange={(e) =>setFormData(prev => ({...prev, maxWithdrawAmountPerTransaction: parseFloat(e.target.value) || 0,}))}
                  className="w-full h-9"
                  />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Amount Per Day</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxWithdrawAmountPerDay}
                  onChange={(e) =>setFormData(prev => ({...prev,maxWithdrawAmountPerDay: parseFloat(e.target.value) || 0,}))}
                  className="w-full h-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdraw Count Per Day</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.maxWithdrawCountPerDay}
                  onChange={(e) =>setFormData(prev => ({...prev,maxWithdrawCountPerDay: parseInt(e.target.value) || 0,}))}
                  className="w-full h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto Upgrade Amount &gt;=</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Upgrade</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Downgrade</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Frequency Type</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Frequency Value</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Default</label>
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

          </div>
              )}

              {activeTab === 'languages' && (
          <div className="space-y-4 min-h-[500px]">
            {/* Language Tab Selection */}
            <div className="flex gap-2 border-b pb-2">
              <button
                onClick={() => setLanguageTab('english')}
                className={`px-6 py-2 rounded-t font-medium transition-colors ${
                  languageTab === 'english'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguageTab('chinese')}
                className={`px-6 py-2 rounded-t font-medium transition-colors ${
                  languageTab === 'chinese'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chinese
              </button>
              <button
                onClick={() => setLanguageTab('malay')}
                className={`px-6 py-2 rounded-t font-medium transition-colors ${
                  languageTab === 'malay'
                    ? 'bg-[#3949ab] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Malay
              </button>
            </div>

            {/* Language Content */}
            <div className="space-y-4 pt-2">
              {/* Name Input */}
              <div className="w-full">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Name ({languageTab.charAt(0).toUpperCase() + languageTab.slice(1)}) {languageTab === 'english' ? '*' : ''}
                </label>
                <Input
                  type="text"
                  value={languageTranslations[languageTab].name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setLanguageTranslations(prev => ({
                      ...prev,
                      [languageTab]: { ...prev[languageTab], name: newName }
                    }));

                    // Sync English name with the main levelName field
                    if (languageTab === 'english') {
                      setFormData(prev => ({ ...prev, levelName: newName }));
                      setValidationErrors(prev => ({ ...prev, englishName: false }));
                    }
                  }}
                  placeholder="Enter level name"
                  className={`w-full h-10 ${languageTab === 'english' && validationErrors.englishName ? 'border-red-500 border-2' : ''}`}
                />
              </div>

              {/* Description Rich Text */}
              <div className="w-full">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Description ({languageTab.charAt(0).toUpperCase() + languageTab.slice(1)})
                </label>
                <ReactQuill
                  key={`description-${languageTab}`}
                  value={languageTranslations[languageTab].description}
                  onChange={(value) => setLanguageTranslations(prev => ({
                    ...prev,
                    [languageTab]: { ...prev[languageTab], description: value }
                  }))}
                  className="bg-white"
                  theme="snow"
                />
              </div>

              {/* Level Image Upload */}
              <div className="w-full">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Level Image ({languageTab.charAt(0).toUpperCase() + languageTab.slice(1)})
                </label>
                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLanguageImageUpload(languageTab, e)}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#3949ab] file:text-white
                      hover:file:bg-[#2c3785] cursor-pointer"
                  />
                </div>

                {/* Image Preview */}
                {languageTranslations[languageTab].image ? (
                  <div className="relative group inline-block">
                    <img
                      src={languageTranslations[languageTab].image}
                      alt={`Level ${languageTab}`}
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => removeLanguageImage(languageTab)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                    No image uploaded
                  </div>
                )}
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Description</th>
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
                      <td className="px-4 py-3 text-gray-900">
                        {bank.description}
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
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              Rebate Setup - {selectedLevelForRebate?.levelName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-700">
              Select rebate setup for <strong>{selectedLevelForRebate?.levelName}</strong> level.
              Only 1 rebate type available - cannot select duplicate types.
            </p>

            {/* Counter */}
            <div className="bg-cyan-50 border border-cyan-200 rounded p-3">
              <p className="text-sm font-semibold text-gray-900">
                {selectedRebateIds.length}/1 setup selected
              </p>
            </div>

            {/* Notification */}
            {notification && (
              <div className={`p-4 rounded-lg border-l-4 ${
                notification.type === 'error'
                  ? 'bg-red-50 border-red-500'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {notification.type === 'error' && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    {notification.type === 'warning' && (
                      <span className="text-yellow-500 text-xl font-bold">⚠</span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      notification.type === 'error'
                        ? 'text-red-800'
                        : notification.type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-green-800'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotification(null)}
                    className="ml-3 flex-shrink-0 hover:opacity-70"
                  >
                    <X className={`h-4 w-4 ${
                      notification.type === 'error'
                        ? 'text-red-500'
                        : notification.type === 'warning'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* Filter Section */}
            <div className="bg-gray-50 p-3 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
              <Input
                placeholder="Search rebate name..."
                value={rebateNameFilter}
                onChange={(e) => setRebateNameFilter(e.target.value || '')}
                className="w-full h-9"
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase w-16">SELECT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Rebate Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Rebate</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rebateSetupsData.filter((rebate) => {
                    if (rebateNameFilter && !rebate.name.toLowerCase().includes(rebateNameFilter.toLowerCase())) {
                      return false;
                    }
                    return true;
                  }).map((rebate) => (
                    <tr
                      key={rebate.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedRebateIds.includes(rebate.id) ? 'bg-cyan-50' : ''
                      }`}
                      onClick={() => handleToggleRebate(rebate.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRebateIds.includes(rebate.id)}
                          onChange={() => handleToggleRebate(rebate.id)}
                          className="w-4 h-4 text-[#00bcd4] border-gray-300 focus:ring-[#00bcd4] rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{rebate.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className="bg-cyan-100 text-cyan-800 font-semibold text-xs">
                          {rebate.rebateType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {rebate.rebateCalculationType === 'Percentage'
                          ? (rebate.amountTiers[0]?.rebatePercentage ? `${rebate.amountTiers[0].rebatePercentage}%` : '-')
                          : (rebate.amountTiers[0]?.rebateAmount ? `$${rebate.amountTiers[0].rebateAmount.toLocaleString()}` : '-')
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`font-semibold text-xs ${
                          rebate.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rebate.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedRebateIds.length > 0 && (
              <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded">
                <p className="text-sm font-semibold text-gray-900 mb-2">Selected Setups ({selectedRebateIds.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRebateIds.map(id => {
                    const rebate = rebateSetupsData.find(r => r.id === id);
                    return rebate ? (
                      <Badge key={id} className="bg-cyan-600 text-white font-medium text-xs">
                        {rebate.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
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
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              CashBack Setup - {selectedLevelForCashback?.levelName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-700">
              Select up to 3 cashback setups for <strong>{selectedLevelForCashback?.levelName}</strong> level.
              Cannot select duplicate cashback types.
            </p>

            {/* Counter */}
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm font-semibold text-gray-900">
                {selectedCashbackIds.length}/3 setups selected
              </p>
            </div>

            {/* Notification */}
            {notification && (
              <div className={`p-4 rounded-lg border-l-4 ${
                notification.type === 'error'
                  ? 'bg-red-50 border-red-500'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {notification.type === 'error' && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    {notification.type === 'warning' && (
                      <span className="text-yellow-500 text-xl font-bold">⚠</span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      notification.type === 'error'
                        ? 'text-red-800'
                        : notification.type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-green-800'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotification(null)}
                    className="ml-3 flex-shrink-0 hover:opacity-70"
                  >
                    <X className={`h-4 w-4 ${
                      notification.type === 'error'
                        ? 'text-red-500'
                        : notification.type === 'warning'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
                <Input
                  placeholder="Search cashback name..."
                  value={cashbackNameFilter}
                  onChange={(e) => setCashbackNameFilter(e.target.value || '')}
                  className="w-full h-9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CashBack Type</label>
                <select
                  value={cashbackTargetTypeFilter}
                  onChange={(e) => setCashbackTargetTypeFilter(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All CashBack Types</option>
                  <option value="By Net Lose Only">By Net Lose Only</option>
                  <option value="By Net Deposit">By Net Deposit</option>
                  <option value="By Total WinLose Only">By Total WinLose Only</option>
                </select>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase w-16">SELECT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CashBack Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CashBack</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cashBackSetupsData.filter((cashback) => {
                    if (cashbackNameFilter && !cashback.name.toLowerCase().includes(cashbackNameFilter.toLowerCase())) {
                      return false;
                    }
                    if (cashbackTargetTypeFilter !== 'all' && cashback.cashbackType !== cashbackTargetTypeFilter) {
                      return false;
                    }
                    return true;
                  }).map((cashback) => (
                    <tr
                      key={cashback.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedCashbackIds.includes(cashback.id) ? 'bg-green-50' : ''
                      }`}
                      onClick={() => handleToggleCashback(cashback.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCashbackIds.includes(cashback.id)}
                          onChange={() => handleToggleCashback(cashback.id)}
                          className="w-4 h-4 text-[#4caf50] border-gray-300 focus:ring-[#4caf50] rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{cashback.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className="bg-green-100 text-green-800 font-semibold text-xs">
                          {cashback.cashbackType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {cashback.cashbackCalculationType === 'Percentage'
                          ? (cashback.amountTiers[0]?.cashbackPercentage ? `${cashback.amountTiers[0].cashbackPercentage}%` : '-')
                          : (cashback.amountTiers[0]?.cashbackAmount ? `$${cashback.amountTiers[0].cashbackAmount.toLocaleString()}` : '-')
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`font-semibold text-xs ${
                          cashback.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cashback.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCashbackIds.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm font-semibold text-gray-900 mb-2">Selected Setups ({selectedCashbackIds.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCashbackIds.map(id => {
                    const cashback = cashBackSetupsData.find(c => c.id === id);
                    return cashback ? (
                      <Badge key={id} className="bg-green-600 text-white font-medium text-xs">
                        {cashback.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
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

      {/* Commission Setup Modal */}
      <Dialog open={showCommissionSetupModal} onOpenChange={setShowCommissionSetupModal}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              Commission Setup - {selectedLevelForCommission?.levelName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-700">
              Select up to 3 commission setups for <strong>{selectedLevelForCommission?.levelName}</strong> level.
              Cannot select duplicate commission target types.
            </p>

            {/* Counter */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-semibold text-gray-900">
                {selectedCommissionIds.length}/3 setups selected
              </p>
            </div>

            {/* Notification */}
            {notification && (
              <div className={`p-4 rounded-lg border-l-4 ${
                notification.type === 'error'
                  ? 'bg-red-50 border-red-500'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {notification.type === 'error' && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    {notification.type === 'warning' && (
                      <span className="text-yellow-500 text-xl font-bold">⚠</span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      notification.type === 'error'
                        ? 'text-red-800'
                        : notification.type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-green-800'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotification(null)}
                    className="ml-3 flex-shrink-0 hover:opacity-70"
                  >
                    <X className={`h-4 w-4 ${
                      notification.type === 'error'
                        ? 'text-red-500'
                        : notification.type === 'warning'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
                <Input
                  placeholder="Search commission name..."
                  value={commissionNameFilter}
                  onChange={(e) => setCommissionNameFilter(e.target.value || '')}
                  className="w-full h-9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
                <select
                  value={commissionTargetTypeFilter}
                  onChange={(e) => setCommissionTargetTypeFilter(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Target Types</option>
                  <option value="Deposit - Withdraw">Deposit - Withdraw</option>
                  <option value="Deposit - Withdraw - Rebate - Bonus">Deposit - Withdraw - Rebate - Bonus</option>
                  <option value="Valid Bet">Valid Bet</option>
                </select>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase w-16">SELECT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Commission Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Target Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Commission</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sampleCommissionSetups.filter((commission) => {
                    if (commissionNameFilter && !commission.name.toLowerCase().includes(commissionNameFilter.toLowerCase())) {
                      return false;
                    }
                    if (commissionTargetTypeFilter !== 'all' && commission.targetType !== commissionTargetTypeFilter) {
                      return false;
                    }
                    return true;
                  }).map((commission) => (
                    <tr
                      key={commission.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedCommissionIds.includes(commission.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleToggleCommission(commission.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCommissionIds.includes(commission.id)}
                          onChange={() => handleToggleCommission(commission.id)}
                          className="w-4 h-4 text-[#3949ab] border-gray-300 focus:ring-[#3949ab] rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{commission.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className="bg-blue-100 text-blue-800 font-semibold text-xs">
                          {commission.targetType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {commission.commissionType === 'Percentage'
                          ? (commission.amountTiers[0]?.percentage ? `${commission.amountTiers[0].percentage}%` : '-')
                          : (commission.amountTiers[0]?.amount ? `$${commission.amountTiers[0].amount.toLocaleString()}` : '-')
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`font-semibold text-xs ${
                          commission.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {commission.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCommissionIds.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold text-gray-900 mb-2">Selected Setups:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCommissionIds.map(id => {
                    const commission = sampleCommissionSetups.find(c => c.id === id);
                    return commission ? (
                      <Badge key={id} className="bg-blue-600 text-white font-medium text-xs">
                        {commission.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t">
              <Button
                onClick={() => setShowCommissionSetupModal(false)}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleSaveCommissionSetup}
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
              >
                SAVE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Referrer Setup Modal */}
      <Dialog open={showReferrerSetupModal} onOpenChange={setShowReferrerSetupModal}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold text-lg">
              Referrer Setup - {selectedLevelForReferrer?.levelName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-700">
              Select up to 2 referrer setups for <strong>{selectedLevelForReferrer?.levelName}</strong> level.
              Cannot select duplicate referrer target types.
            </p>

            {/* Counter */}
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <p className="text-sm font-semibold text-gray-900">
                {selectedReferrerIds.length}/2 setups selected
              </p>
            </div>

            {/* Notification */}
            {notification && (
              <div className={`p-4 rounded-lg border-l-4 ${
                notification.type === 'error'
                  ? 'bg-red-50 border-red-500'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {notification.type === 'error' && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    {notification.type === 'warning' && (
                      <span className="text-yellow-500 text-xl font-bold">⚠</span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      notification.type === 'error'
                        ? 'text-red-800'
                        : notification.type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-green-800'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotification(null)}
                    className="ml-3 flex-shrink-0 hover:opacity-70"
                  >
                    <X className={`h-4 w-4 ${
                      notification.type === 'error'
                        ? 'text-red-500'
                        : notification.type === 'warning'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
                <Input
                  placeholder="Search referrer name..."
                  value={referrerNameFilter}
                  onChange={(e) => setReferrerNameFilter(e.target.value || '')}
                  className="w-full h-9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
                <select
                  value={referrerTargetTypeFilter}
                  onChange={(e) => setReferrerTargetTypeFilter(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Target Types</option>
                  <option value="By Deposit">By Deposit</option>
                  <option value="By Register">By Register</option>
                </select>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase w-16">SELECT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Referrer Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Target Type</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {initialReferrerSetups.filter((referrer) => {
                    if (referrerNameFilter && !referrer.name.toLowerCase().includes(referrerNameFilter.toLowerCase())) {
                      return false;
                    }
                    const promo = initialPromotions.find(p => p.id === referrer.promoId);
                    if (referrerTargetTypeFilter !== 'all' && promo?.targetType !== referrerTargetTypeFilter) {
                      return false;
                    }
                    return true;
                  }).map((referrer) => {
                    const promo = initialPromotions.find(p => p.id === referrer.promoId);
                    return (
                    <tr
                      key={referrer.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedReferrerIds.includes(referrer.id) ? 'bg-purple-50' : ''
                      }`}
                      onClick={() => handleToggleReferrer(referrer.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedReferrerIds.includes(referrer.id)}
                          onChange={() => handleToggleReferrer(referrer.id)}
                          className="w-4 h-4 text-[#9c27b0] border-gray-300 focus:ring-[#9c27b0] rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{referrer.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className="bg-purple-100 text-purple-800 font-semibold text-xs">
                          {promo?.targetType || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`font-semibold text-xs ${
                          referrer.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {referrer.status}
                        </Badge>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedReferrerIds.length > 0 && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
                <p className="text-sm font-semibold text-gray-900 mb-2">Selected Setups:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReferrerIds.map(id => {
                    const referrer = initialReferrerSetups.find(r => r.id === id);
                    return referrer ? (
                      <Badge key={id} className="bg-purple-600 text-white font-medium text-xs">
                        {referrer.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t">
              <Button
                onClick={() => setShowReferrerSetupModal(false)}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleSaveReferrerSetup}
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