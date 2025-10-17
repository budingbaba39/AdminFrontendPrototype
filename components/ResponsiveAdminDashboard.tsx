// Updated ResponsiveAdminDashboard.tsx (full code with changes)
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import svgPaths from '../imports/svg-2qgv7o5blg';
import DashboardContent from './DashboardContent';
import DepositManagement from './DepositManagement';
import WithdrawalManagement from './WithdrawalManagement';
import TransactionRecordManagement from './TransactionRecordManagement';
import UserContent from './UserContent';
import LevelContent from './LevelContent';
import GameKioskContent from './GamekioskContent';
import SettingsContent from './SettingsContent';
import SecurityContent from './SecurityContent';
import BankManagement from "./BankManagement";
import BankListContent from './BankListContent';
import BankSetupContent from './BankSetupContent';
import TagContent from './TagContent';
import PromotionContent from './PromotionContent';
import PromotionListContent from './PromotionListContent';
import PromotionOngoingContent from './PromotionOngoingContent';
import RebateRecordContent from './RebateRecordContent';
import RebateSetupContent from './RebateSetupContent';
import RebateScheduleContent from './RebateScheduleContent';
import RebateReleaseContent from './RebateReleaseContent';
import CashBackSetupContent from './CashBackSetupContent';
import CashBackRecordContent from './CashBackRecordContent';
import CashBackScheduleContent from './CashBackScheduleContent';
import CashBackReleaseContent from './CashBackReleaseContent';
import CommissionRecordContent from './CommissionRecordContent';
import CommissionSetupContent from './CommissionSetupContent';
import CommissionReleaseContent from './CommissionReleaseContent';
import CommissionScheduleContent from './CommissionScheduleContent';
import ReferrerSetupContent from './ReferrerSetupContent';
import ReferrerBonusListContent from './ReferrerBonusListContent';
import KYCContent from './KYCContent';
import StaffManagement from './StaffManagement';

// Define page type to avoid repetition
type PageType = 'dashboard' | 'deposit' | 'withdrawal' | 'adjustment' | 'transaction-record' | 'user-record' | 'level' | 'tag' | 'promotion' | 'promotion-record' | 'promotion-list' | 'promotion-ongoing' | 'rebate' | 'rebate-record' | 'rebate-setup' | 'rebate-release' | 'rebate-schedule' | 'cashback' | 'cashback-record' | 'cashback-setup' | 'cashback-release' | 'cashback-schedule' | 'commission' | 'commission-record' | 'commission-setup' | 'commission-release' | 'commission-schedule' | 'referrer-setup' | 'referrer-bonus-list' | 'game-kiosk' | 'settings' | 'security' | 'bank-list' | 'bank-setup' | 'bank-report' | 'report' | 'admin-tool' | 'api' | 'change-log' | 'display' | 'domain' | 'page' | 'staff' | 'theme' | 'tools' | 'kyc-management';

interface ResponsiveAdminDashboardProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

// Individual menu items
const singleMenuItems = [
  { id: 'staff', label: '9. STAFF' },
  { id: 'game-kiosk', label: '10. GAME KIOSK' },
  { id: 'settings', label: '11. SETTINGS' },
  { id: 'security', label: '12. SECURITY' },
  { id: 'report', label: '13. REPORT' },
  { id: 'admin-tool', label: '14. ADMIN TOOL' },
  { id: 'api', label: '15. API' },
  { id: 'change-log', label: '16. CHANGE LOG' },
  { id: 'display', label: '17. DISPLAY' },
  { id: 'domain', label: '18. DOMAIN' },
  { id: 'page', label: '19. PAGE' },
  { id: 'theme', label: '20. THEME' },
  { id: 'tools', label: '21. TOOLS' },
];

const bottomMenuItems = [
  { id: 'help', label: 'HELP CENTER' },
  { id: 'kyc-management', label: 'KYC MANAGEMENT' },
  { id: 'logout', label: 'LOG OUT' },
];

function MenuItem({ item, isActive, onClick }: { item: any; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-3 rounded-lg text-sm font-semibold uppercase tracking-[-0.14px] transition-colors ${
        isActive
          ? 'bg-white text-[#3949ab]'
          : 'bg-white text-[#3949ab] hover:bg-[#f0f0f0]'
      }`}
    >
      <span className="flex-1 text-left">{item.label}</span>
    </button>
  );
}

function UserMenuItem({ currentPage, onNavigate }: {
  currentPage: string;
  onNavigate: (page: PageType) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isUserActive = ['user-record', 'level','tag'].includes(currentPage);

  // Auto-expand if we're on any user page
  useEffect(() => {
    if (isUserActive) {
      setIsExpanded(true);
    }
  }, [isUserActive]);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center p-3 rounded-lg text-sm font-semibold uppercase tracking-[-0.14px] transition-colors ${
          isUserActive
            ? 'bg-white text-[#3949ab]'
            : 'bg-white text-[#3949ab] hover:bg-[#f0f0f0]'
        }`}
      >
        <span className="flex-1 text-left">1. USER</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {isExpanded && (
        <div className="ml-6 mt-2 space-y-1">
          <button
            onClick={() => onNavigate('user-record')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'user-record'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">1.1 USER RECORD</span>
          </button>

          <button
            onClick={() => onNavigate('level')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'level'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">1.2 LEVEL</span>
          </button>

          <button
            onClick={() => onNavigate('tag')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'tag'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">1.3 TAG</span>
          </button>
          
        </div>
      )}
    </div>
  );
}

function TransactionMenuItem({ currentPage, onNavigate }: {
  currentPage: string;
  onNavigate: (page: PageType) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isTransactionActive = ['deposit', 'withdrawal', 'adjustment'].includes(currentPage);

  // Auto-expand if we're on any transaction page
  useEffect(() => {
    if (isTransactionActive) {
      setIsExpanded(true);
    }
  }, [isTransactionActive]);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center p-3 rounded-lg text-sm font-semibold uppercase tracking-[-0.14px] transition-colors ${
          isTransactionActive
            ? 'bg-white text-[#3949ab]'
            : 'bg-white text-[#3949ab] hover:bg-[#f0f0f0]'
        }`}
      >
        <span className="flex-1 text-left">2. TRANSACTION</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {isExpanded && (
        <div className="ml-6 mt-2 space-y-1">
          <button
            onClick={() => onNavigate('deposit')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'deposit'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">2.1 DEPOSIT</span>
          </button>

          <button
            onClick={() => onNavigate('withdrawal')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'withdrawal'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">2.2 WITHDRAW</span>
          </button>

          <button
            onClick={() => onNavigate('adjustment')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'adjustment'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">2.3 ADJUSTMENT</span>
          </button>
        </div>
      )}
    </div>
  );
}

function PromotionMenuItem({ currentPage, onNavigate }: {
  currentPage: string;
  onNavigate: (page: PageType) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPromotionActive = ['promotion', 'promotion-record', 'promotion-list', 'promotion-ongoing'].includes(currentPage);

  useEffect(() => {
    if (isPromotionActive) {
      setIsExpanded(true);
    }
  }, [isPromotionActive]);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center p-3 rounded-lg text-sm font-semibold uppercase tracking-[-0.14px] transition-colors ${
          isPromotionActive
            ? 'bg-white text-[#3949ab]'
            : 'bg-white text-[#3949ab] hover:bg-[#f0f0f0]'
        }`}
      >
        <span className="flex-1 text-left">3. PROMOTION</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="ml-6 mt-2 space-y-1">
          <button
            onClick={() => onNavigate('promotion-list')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'promotion-list'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">3.1 PROMOTION LIST</span>
          </button>

          <button
            onClick={() => onNavigate('promotion')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'promotion'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">3.2 PROMOTION RECORD</span>
          </button>

          <button
            onClick={() => onNavigate('promotion-ongoing')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'promotion-ongoing'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">3.3 PROMOTION ONGOING</span>
          </button>
        </div>
      )}
    </div>
  );
}

function RebateMenuItem({ currentPage, onNavigate }: {
  currentPage: string;
  onNavigate: (page: PageType) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRebateActive = ['rebate', 'rebate-record', 'rebate-setup', 'rebate-release', 'rebate-schedule'].includes(currentPage);

  useEffect(() => {
    if (isRebateActive) {
      setIsExpanded(true);
    }
  }, [isRebateActive]);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center p-3 rounded-lg text-sm font-semibold uppercase tracking-[-0.14px] transition-colors ${
          isRebateActive
            ? 'bg-white text-[#3949ab]'
            : 'bg-white text-[#3949ab] hover:bg-[#f0f0f0]'
        }`}
      >
        <span className="flex-1 text-left">4. REBATE</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="ml-6 mt-2 space-y-1">
          <button
            onClick={() => onNavigate('rebate-record')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'rebate-record'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">4.1 REBATE RECORD</span>
          </button>

          <button
            onClick={() => onNavigate('rebate-setup')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'rebate-setup'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">4.2 REBATE SETUP</span>
          </button>

          <button
            onClick={() => onNavigate('rebate-release')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'rebate-release'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">4.3 REBATE RELEASE</span>
          </button>

          <button
            onClick={() => onNavigate('rebate-schedule')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'rebate-schedule'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">4.4 REBATE SCHEDULE</span>
          </button>
        </div>
      )}
    </div>
  );
}

function CashBackMenuItem({ currentPage, onNavigate }: {
  currentPage: string;
  onNavigate: (page: PageType) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCashBackActive = ['cashback', 'cashback-record', 'cashback-setup', 'cashback-release', 'cashback-schedule'].includes(currentPage);

  useEffect(() => {
    if (isCashBackActive) {
      setIsExpanded(true);
    }
  }, [isCashBackActive]);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center p-3 rounded-lg text-sm font-semibold uppercase tracking-[-0.14px] transition-colors ${
          isCashBackActive
            ? 'bg-white text-[#3949ab]'
            : 'bg-white text-[#3949ab] hover:bg-[#f0f0f0]'
        }`}
      >
        <span className="flex-1 text-left">5. CASHBACK</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="ml-6 mt-2 space-y-1">
          <button
            onClick={() => onNavigate('cashback-record')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'cashback-record'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">5.1 CASHBACK RECORD</span>
          </button>

          <button
            onClick={() => onNavigate('cashback-setup')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'cashback-setup'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">5.2 CASHBACK SETUP</span>
          </button>

          <button
            onClick={() => onNavigate('cashback-release')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'cashback-release'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">5.3 CASHBACK RELEASE</span>
          </button>

          <button
            onClick={() => onNavigate('cashback-schedule')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'cashback-schedule'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">5.4 CASHBACK SCHEDULE</span>
          </button>
        </div>
      )}
    </div>
  );
}

function CommissionMenuItem({ currentPage, onNavigate }: {
  currentPage: string;
  onNavigate: (page: PageType) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCommissionActive = ['commission', 'commission-record', 'commission-setup', 'commission-release', 'commission-schedule'].includes(currentPage);

  useEffect(() => {
    if (isCommissionActive) {
      setIsExpanded(true);
    }
  }, [isCommissionActive]);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center p-3 rounded-lg text-sm font-semibold uppercase tracking-[-0.14px] transition-colors ${
          isCommissionActive
            ? 'bg-white text-[#3949ab]'
            : 'bg-white text-[#3949ab] hover:bg-[#f0f0f0]'
        }`}
      >
        <span className="flex-1 text-left">6. COMMISSION</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="ml-6 mt-2 space-y-1">
          <button
            onClick={() => onNavigate('commission-record')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'commission-record'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">6.1 COMMISSION RECORD</span>
          </button>
          <button
            onClick={() => onNavigate('commission-setup')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'commission-setup'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">6.2 COMMISSION SETUP</span>
          </button>
          <button
            onClick={() => onNavigate('commission-release')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'commission-release'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">6.3 COMMISSION RELEASE</span>
          </button>
          <button
            onClick={() => onNavigate('commission-schedule')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'commission-schedule'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">6.4 COMMISSION SCHEDULE</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ReferrerMenuItem({ currentPage, onNavigate }: {
  currentPage: string;
  onNavigate: (page: PageType) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isReferrerActive = ['referrer-setup', 'referrer-bonus-list'].includes(currentPage);

  useEffect(() => {
    if (isReferrerActive) {
      setIsExpanded(true);
    }
  }, [isReferrerActive]);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center p-3 rounded-lg text-sm font-semibold uppercase tracking-[-0.14px] transition-colors ${
          isReferrerActive
            ? 'bg-white text-[#3949ab]'
            : 'bg-white text-[#3949ab] hover:bg-[#f0f0f0]'
        }`}
      >
        <span className="flex-1 text-left">7. REFERRER</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="ml-6 mt-2 space-y-1">
          <button
            onClick={() => onNavigate('referrer-setup')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'referrer-setup'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">7.1 REFERRER SETUP</span>
          </button>

          <button
            onClick={() => onNavigate('referrer-bonus-list')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'referrer-bonus-list'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">7.2 REFERRER BONUS LIST</span>
          </button>
        </div>
      )}
    </div>
  );
}

function BankMenuItem({ currentPage, onNavigate }: {
  currentPage: string;
  onNavigate: (page: PageType) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isBankActive = ['bank-list', 'bank-setup', 'bank-report'].includes(currentPage);

  useEffect(() => {
    if (isBankActive) {
      setIsExpanded(true);
    }
  }, [isBankActive]);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center p-3 rounded-lg text-sm font-semibold uppercase tracking-[-0.14px] transition-colors ${
          isBankActive
            ? 'bg-white text-[#3949ab]'
            : 'bg-white text-[#3949ab] hover:bg-[#f0f0f0]'
        }`}
      >
        <span className="flex-1 text-left">8. BANK</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="ml-6 mt-2 space-y-1">
          <button
            onClick={() => onNavigate('bank-list')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'bank-list'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">8.1 BANK LIST</span>
          </button>

          {/* <button
            onClick={() => onNavigate('bank-setup')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'bank-setup'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">8.2 BANK SETUP</span>
          </button> */}

          <button
            onClick={() => onNavigate('bank-report')}
            className={`w-full flex items-center p-2 rounded-lg text-sm font-medium tracking-[-0.14px] transition-colors ${
              currentPage === 'bank-report'
                ? 'bg-[#e8eaf6] text-[#3949ab]'
                : 'text-[#3949ab] hover:bg-[#f0f0f0]'
            }`}
          >
            <span className="text-left">8.2 BANK REPORT</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({ currentPage, onNavigate, onLogout, className = "" }: {
  currentPage: string;
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
  className?: string;
}) {
  return (
    <div className={`bg-white border-r border-[#e8eaf6] ${className}`}>
      <div className="flex flex-col h-full p-4 gap-6">
        {/* Search */}
        <div className="bg-[#e8eaf6] p-3 rounded-lg flex items-center">
          <span className="text-[#5c6bc0] text-sm font-semibold uppercase tracking-[-0.14px]">
            Search...
          </span>
        </div>

        {/* SMS Credit */}
        <div className="px-3">
          <span className="text-[#3949ab] text-sm font-medium">
            SMS Credit: 0.00
          </span>
        </div>

        {/* Main Menu */}
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {/* 1. User Submenu */}
          <UserMenuItem currentPage={currentPage} onNavigate={onNavigate} />

          {/* 2. Transaction Submenu */}
          <TransactionMenuItem currentPage={currentPage} onNavigate={onNavigate} />

          {/* 3. Promotion Submenu */}
          <PromotionMenuItem currentPage={currentPage} onNavigate={onNavigate} />

          {/* 4. Rebate Submenu */}
          <RebateMenuItem currentPage={currentPage} onNavigate={onNavigate} />

          {/* 5. CashBack Submenu */}
          <CashBackMenuItem currentPage={currentPage} onNavigate={onNavigate} />

          {/* 6. Commission Submenu */}
          <CommissionMenuItem currentPage={currentPage} onNavigate={onNavigate} />

          {/* 7. Referrer Submenu */}
          <ReferrerMenuItem currentPage={currentPage} onNavigate={onNavigate} />

          {/* 8. Bank Submenu */}
          <BankMenuItem currentPage={currentPage} onNavigate={onNavigate} />

          {/* 9-11. Individual menu items */}
          {singleMenuItems.slice(0, 3).map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              isActive={currentPage === item.id}
              onClick={() => onNavigate(item.id as any)}
            />
          ))}

          {/* 11-20. Individual menu items */}
          {singleMenuItems.slice(3).map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              isActive={currentPage === item.id}
              onClick={() => onNavigate(item.id as any)}
            />
          ))}
        </div>

        {/* Bottom Menu */}
        <div className="flex flex-col gap-2 border-t border-[#e8eaf6] pt-4">
          <MenuItem
            item={bottomMenuItems[0]}
            isActive={false}
            onClick={() => {}}
          />
          <div className="h-px bg-[#e8eaf6] my-2" />
          <MenuItem
            item={bottomMenuItems[1]}
            isActive={currentPage === 'kyc-management'}
            onClick={() => onNavigate('kyc-management')}
          />
          <div className="h-px bg-[#e8eaf6] my-2" />
          <MenuItem
            item={bottomMenuItems[2]}
            isActive={false}
            onClick={onLogout}
          />
          
          {/* Night mode toggle */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center">
              <span className="text-[#3949ab] text-sm font-semibold uppercase tracking-[-0.14px]">
                Night Mode
              </span>
            </div>
            <div className="bg-[#9fa8da] w-9 h-5 rounded-full relative">
              <div className="absolute bg-white w-4 h-4 rounded-full top-0.5 left-0.5">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ onToggleSidebar, currentPage, onNavigate }: {
  onToggleSidebar: () => void;
  currentPage: string;
  onNavigate: (page: 'dashboard' | 'deposit' | 'withdrawal' | 'adjustment' | 'transaction-record' | 'user-record' | 'level' | 'tag' | 'promotion' | 'promotion-record' | 'promotion-list' | 'rebate' | 'rebate-record' | 'rebate-setup' | 'rebate-release' | 'rebate-schedule' | 'cashback' | 'cashback-record' | 'cashback-setup' | 'cashback-release' | 'cashback-schedule' | 'commission' | 'commission-record' | 'game-kiosk' | 'settings' | 'security' | 'bank-list' | 'bank-setup' | 'bank-report' | 'report' | 'admin-tool' | 'api' | 'change-log' | 'display' | 'domain' | 'page' | 'staff' | 'theme' | 'tools') => void;
}) {
  return (
    <div className="bg-white border-b border-[#e0e0e0] shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 h-[85px]">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-4 h-4">
              <svg className="w-full h-full" fill="none" viewBox="0 0 14 14">
                <path clipRule="evenodd" d={svgPaths.p13f23570} fill="var(--fill-0, #171212)" fillRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-lg text-[#171212]">DemoGame88</span>
          </div>
        </div>


        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Action buttons */}
          <Button variant="ghost" size="sm" className="bg-[#f5f0f0] rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707 .707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          </Button>
          
          <Button variant="ghost" size="sm" className="bg-[#f5f0f0] rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
          
          <Button variant="ghost" size="sm" className="bg-[#f5f0f0] rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>
          
          <Button variant="ghost" size="sm" className="bg-[#f5f0f0] rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </Button>
          
          <Button variant="ghost" size="sm" className="bg-[#f5f0f0] rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook to detect screen size changes
function useScreenSize() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isDesktop;
}

export default function ResponsiveAdminDashboard({ currentPage, onNavigate, onLogout }: ResponsiveAdminDashboardProps) {
  const isDesktop = useScreenSize();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Reset sidebar state when switching between desktop and mobile
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'deposit':
        return <DepositManagement />;
      case 'withdrawal':
        return <WithdrawalManagement />;
      case 'adjustment':
        return <TransactionRecordManagement />; // Using existing component for adjustment
      case 'promotion':
        return <PromotionContent />;
      case 'promotion-record':
        return <PromotionContent />; // Using existing component for promotion record
      case 'promotion-list':
        return <PromotionListContent />;
      case 'promotion-ongoing':
        return <PromotionOngoingContent />;
      case 'rebate':
      case 'rebate-record':
        return <RebateRecordContent />;
      case 'rebate-setup':
        return <RebateSetupContent />;
      case 'rebate-schedule':
        return <RebateScheduleContent />;
      case 'rebate-release':
        return <RebateReleaseContent />;
      case 'cashback':
      case 'cashback-record':
        return <CashBackRecordContent />;
      case 'cashback-setup':
        return <CashBackSetupContent />;
      case 'cashback-schedule':
        return <CashBackScheduleContent />;
      case 'cashback-release':
        return <CashBackReleaseContent />;
      case 'commission':
      case 'commission-record':
        return <CommissionRecordContent />;
      case 'commission-setup':
        return <CommissionSetupContent />;
      case 'commission-release':
        return <CommissionReleaseContent />;
      case 'commission-schedule':
        return <CommissionScheduleContent />;
      case 'referrer-setup':
        return <ReferrerSetupContent />;
      case 'referrer-bonus-list':
        return <ReferrerBonusListContent />;
      case 'transaction-record':
        return <TransactionRecordManagement />;
      case 'user-record':
        return <UserContent />;
      case 'level':
        return <LevelContent />;
      case 'tag':
        return <TagContent />;
      case 'staff':
        return <StaffManagement />;
      case 'game-kiosk':
        return <GameKioskContent />;
      case 'settings':
        return <SettingsContent />;
      case 'security':
        return <SecurityContent />;
      case 'bank-list':
        return <BankListContent />;
      case 'bank-setup':
        return <BankSetupContent />;
      case 'bank-report':
        return <BankManagement />;
      case 'kyc-management':
        return <KYCContent />;
      case 'report':
      case 'admin-tool':
      case 'api':
      case 'change-log':
      case 'display':
      case 'domain':
      case 'page':
      case 'staff':
      case 'theme':
      case 'tools':
        return <div className="p-6"><h1 className="text-2xl font-bold">{currentPage.toUpperCase().replace('-', ' ')}</h1><p>This functionality is coming soon.</p></div>;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={handleToggleSidebar} currentPage={currentPage} onNavigate={onNavigate} />
      
      <div className="flex h-[calc(100vh-85px)]">
        {/* Desktop Sidebar - now toggleable */}
        {isDesktop && (
          <div 
            className={`transition-all duration-300 ease-in-out bg-white border-r border-[#e8eaf6] ${
              sidebarOpen ? 'w-[230px]' : 'w-0'
            } overflow-hidden`}
          >
            <Sidebar 
              currentPage={currentPage} 
              onNavigate={onNavigate} 
              onLogout={onLogout}
              className="h-full w-[230px]" // Fixed width for content inside
            />
          </div>
        )}

        {/* Mobile Sidebar - overlay behavior */}
        {!isDesktop && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-[230px] p-0">
              <Sidebar 
                currentPage={currentPage} 
                onNavigate={(page) => {
                  onNavigate(page);
                  setSidebarOpen(false);
                }} 
                onLogout={() => {
                  onLogout();
                  setSidebarOpen(false);
                }}
                className="h-full"
              />
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content */}
        <div 
          className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
            isDesktop ? 'ml-0' : ''
          }`}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}