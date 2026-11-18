import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 px-3.5 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 shadow-sm">
      <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span>Offline Mode — Cached repository views available</span>
    </div>
  );
};
