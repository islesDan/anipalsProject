import { useState } from 'react';
import { AppShell } from './layouts/AppShell';
import { AuthLayout } from './layouts/AuthLayout';
import { CreatePlayerPage } from './pages/CreatePlayerPage';
import { DashboardPage } from './pages/DashboardPage';
import { FriendsPage } from './pages/FriendsPage';
import { GachaPage } from './pages/GachaPage';
import { InventoryPage } from './pages/InventoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TradingPage } from './pages/TradingPage';
import { TutorialPage } from './pages/TutorialPage';
import type { PageId } from './types/game';

function App() {
  const [activePage, setActivePage] = useState<PageId>('login');

  if (activePage === 'login') {
    return (
      <AuthLayout>
        <LoginPage onNavigate={setActivePage} />
      </AuthLayout>
    );
  }

  if (activePage === 'register') {
    return (
      <AuthLayout>
        <RegisterPage onNavigate={setActivePage} />
      </AuthLayout>
    );
  }

  if (activePage === 'create-player') {
    return (
      <AuthLayout>
        <CreatePlayerPage onNavigate={setActivePage} />
      </AuthLayout>
    );
  }

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'tutorial' && <TutorialPage onNavigate={setActivePage} />}
      {activePage === 'dashboard' && <DashboardPage onNavigate={setActivePage} />}
      {activePage === 'inventory' && <InventoryPage />}
      {activePage === 'gacha' && <GachaPage />}
      {activePage === 'trading' && <TradingPage />}
      {activePage === 'friends' && <FriendsPage />}
    </AppShell>
  );
}

export default App;
