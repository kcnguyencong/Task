import React from 'react';
import { useStore } from './store/useStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TaskManagementScreen } from './components/tasks/TaskManagementScreen';
import { AIWorkspaceScreen } from './components/workspace/AIWorkspaceScreen';

export const App: React.FC = () => {
  const { currentTab } = useStore();

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
