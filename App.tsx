// Updated App.tsx (full code with changes)
import { useState } from 'react';
import AdminLoginPage from './imports/AdminLoginPage';
import ResponsiveAdminDashboard from './components/ResponsiveAdminDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'deposit' | 'withdrawal' | 'adjustment' | 'ongoing' | 'transaction-record' | 'user-record' | 'level' | 'tag' | 'promotion' | 'promotion-record' | 'promotion-setup' | 'promotion-ongoing' | 'rebate' | 'rebate-record' | 'rebate-setup' | 'rebate-release' | 'rebate-schedule' | 'rebate-ongoing' | 'cashback' | 'cashback-record' | 'cashback-setup' | 'cashback-release' | 'cashback-schedule' | 'cashback-ongoing' | 'commission' | 'commission-record' | 'commission-setup' | 'commission-release' | 'commission-schedule' | 'commission-ongoing' | 'referrer-setup' | 'referrer-record' | 'game-kiosk' | 'settings' | 'security' | 'bank-list' | 'bank-setup' | 'bank-report' | 'report' | 'admin-tool' | 'api' | 'change-log' | 'display' | 'domain' | 'page' | 'staff' | 'theme' | 'tools' | 'kyc-management'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleNavigation = (page: 'dashboard' | 'deposit' | 'withdrawal' | 'adjustment' | 'ongoing' | 'transaction-record' | 'user-record' | 'level' | 'tag' | 'promotion' | 'promotion-record' | 'promotion-setup' | 'promotion-ongoing' | 'rebate' | 'rebate-record' | 'rebate-setup' | 'rebate-release' | 'rebate-schedule' | 'rebate-ongoing' | 'cashback' | 'cashback-record' | 'cashback-setup' | 'cashback-release' | 'cashback-schedule' | 'cashback-ongoing' | 'commission' | 'commission-record' | 'commission-setup' | 'commission-release' | 'commission-schedule' | 'commission-ongoing' | 'referrer-setup' | 'referrer-record' | 'game-kiosk' | 'settings' | 'security' | 'bank-list' | 'bank-setup' | 'bank-report' | 'report' | 'admin-tool' | 'api' | 'change-log' | 'display' | 'domain' | 'page' | 'staff' | 'theme' | 'tools' | 'kyc-management') => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  if (!isLoggedIn && currentPage === 'login') {
    return <AdminLoginPage onLogin={handleLogin} />;
  }

  return (
    <ResponsiveAdminDashboard
      currentPage={currentPage as 'dashboard' | 'deposit' | 'withdrawal' | 'adjustment' | 'ongoing' | 'transaction-record' | 'user-record' | 'level' | 'tag' | 'promotion' | 'promotion-record' | 'promotion-setup' | 'promotion-ongoing' | 'rebate' | 'rebate-record' | 'rebate-setup' | 'rebate-release' | 'rebate-schedule' | 'rebate-ongoing' | 'cashback' | 'cashback-record' | 'cashback-setup' | 'cashback-release' | 'cashback-schedule' | 'cashback-ongoing' | 'commission' | 'commission-record' | 'commission-setup' | 'commission-release' | 'commission-schedule' | 'commission-ongoing' | 'referrer-setup' | 'referrer-record' | 'game-kiosk' | 'settings' | 'security' | 'bank-list' | 'bank-setup' | 'bank-report' | 'report' | 'admin-tool' | 'api' | 'change-log' | 'display' | 'domain' | 'page' | 'staff' | 'theme' | 'tools' | 'kyc-management'}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
    />
  );
}