import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useStore } from './store/useStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TaskManagementScreen } from './components/tasks/TaskManagementScreen';
import { AIWorkspaceScreen } from './components/workspace/AIWorkspaceScreen';
import { LoginScreen } from './components/auth/LoginScreen';

export const App: React.FC = () => {
  const { currentTab, currentUser, authChecked, checkAuthSession } = useStore();

  useEffect(() => {
    void checkAuthSession();
  }, [checkAuthSession]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0c0c0e] text-zinc-300 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-[#E5B54F] animate-spin" />
        <p className="text-xs font-medium text-zinc-400">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-[#0c0c0e] font-sans antialiased text-zinc-100 overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0c0c0e]">
        <Header />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'workspace' ? (
            <AIWorkspaceScreen />
          ) : (
            <TaskManagementScreen />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
