import React from 'react';
import { History, BookOpen } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';

interface NavbarProps {
  currentView: 'dashboard' | 'history' | 'exam' | 'results';
  onNavigate: (view: 'dashboard' | 'history') => void;
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  onManualSync: () => void;
  submissionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isOnline,
  pendingSyncCount,
  isSyncing,
  onManualSync,
  submissionsCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo with Increased Prominent Size */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3.5 cursor-pointer group select-none"
        >
          {/* Prominent Logo */}
          <div className="flex-shrink-0 transition-transform group-hover:scale-105">
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                Bahir Dar Academy
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
                ባህር ዳር አካዳሚ
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium hidden sm:inline">Online Examination Portal</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="text-slate-400 font-mono text-[11px]">bahirdaracademy.github.io</span>
            </div>
          </div>
        </div>

        {/* Navigation & Utilities */}
        <div className="flex items-center gap-3">
          {/* Dashboard / History Tabs */}
          {currentView !== 'exam' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-red-600" />
                <span>Exams</span>
              </button>
              <button
                onClick={() => onNavigate('history')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'history'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-600" />
                <span>My Results ({submissionsCount})</span>
              </button>
            </div>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Offline Status */}
          <OfflineIndicator
            isOnline={isOnline}
            pendingSyncCount={pendingSyncCount}
            isSyncing={isSyncing}
            onManualSync={onManualSync}
          />
        </div>
      </div>
    </header>
  );
};
