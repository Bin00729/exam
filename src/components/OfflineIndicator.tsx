import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  pendingSyncCount,
  isSyncing = false,
  onManualSync,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Network Connectivity Pill */}
      {isOnline ? (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700"
          title="Internet connection active"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Online</span>
        </div>
      ) : (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-xs font-semibold text-amber-800 animate-pulse"
          title="Device is offline. All responses will be saved in offline storage."
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          <span>Offline Safe</span>
        </div>
      )}

      {/* Offline Sync Queue Pill if items are pending */}
      {pendingSyncCount > 0 && (
        <button
          onClick={onManualSync}
          disabled={!isOnline || isSyncing}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition cursor-pointer ${
            isOnline
              ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
              : 'bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed'
          }`}
          title={isOnline ? 'Click to sync queued submissions' : 'Waiting for network'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-red-600' : ''}`} />
          <span>Sync ({pendingSyncCount})</span>
        </button>
      )}

      {pendingSyncCount === 0 && (
        <div
          className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-500"
          title="All local exam data synchronized"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px]">Synced</span>
        </div>
      )}
    </div>
  );
};
