import { useState } from 'react';
import AdminLoginPage from './imports/AdminLoginPage';
import ResponsiveAdminDashboard from './components/ResponsiveAdminDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'deposit' | 'withdrawal' | 'adjustment' | 'transaction-record' | 'user-record' | 'level' | 'tag' | 'promotion' | 'promotion-record' | 'promotion-list' | 'promotion-ongoing' | 'rebate' | 'rebate-record' | 'rebate-setup' | 'cashback' | 'cashback-record' | 'cashback-setup' | 'cashback-schedule' | 'commission' | 'commission-record' | 'game-kiosk' | 'settings' | 'security' | 'bank-list' | 'bank-setup' | 'bank-report' | 'report' | 'admin-tool' | 'api' | 'change-log' | 'display' | 'domain' | 'page' | 'staff' | 'theme' | 'tools'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleNavigation = (page: 'dashboard' | 'deposit' | 'withdrawal' | 'adjustment' | 'transaction-record' | 'user-record' | 'level' | 'tag' | 'promotion' | 'promotion-record' | 'promotion-list' | 'promotion-ongoing' | 'rebate' | 'rebate-record' | 'rebate-setup' | 'cashback' | 'cashback-record' | 'cashback-setup' | 'cashback-schedule' | 'commission' | 'commission-record' | 'game-kiosk' | 'settings' | 'security' | 'bank-list' | 'bank-setup' | 'bank-report' | 'report' | 'admin-tool' | 'api' | 'change-log' | 'display' | 'domain' | 'page' | 'staff' | 'theme' | 'tools') => {
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
      currentPage={currentPage as 'dashboard' | 'deposit' | 'withdrawal' | 'adjustment' | 'transaction-record' | 'user-record' | 'level' | 'tag' | 'promotion' | 'promotion-record' | 'promotion-list' | 'promotion-ongoing' | 'rebate' | 'rebate-record' | 'rebate-setup' | 'cashback' | 'cashback-record' | 'cashback-setup' | 'cashback-schedule' | 'commission' | 'commission-record' | 'game-kiosk' | 'settings' | 'security' | 'bank-list' | 'bank-setup' | 'bank-report' | 'report' | 'admin-tool' | 'api' | 'change-log' | 'display' | 'domain' | 'page' | 'staff' | 'theme' | 'tools'}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
    />
  );
}