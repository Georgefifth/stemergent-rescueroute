import React from 'react';
import { Truck, Plus, RefreshCw, Smartphone, ClipboardList, Award } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dispatch' | 'driver' | 'ledger';
  setCurrentTab: (tab: 'dispatch' | 'driver' | 'ledger') => void;
  onOpenNewDonation: () => void;
  onResetDemoData: () => void;
  activeDriverCount: number;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewDonation,
  onResetDemoData,
  activeDriverCount,
  criticalCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      {/* Top Operational Status Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-emerald-400 font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5 inline-block"></span>
            DISPATCH ACTIVE
          </span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-slate-300">
            {activeDriverCount} Volunteer Vehicles on Fleet
          </span>
          {criticalCount > 0 && (
            <>
              <span className="text-slate-500">|</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-red-950 text-red-400 border border-red-800">
                ⚠️ {criticalCount} Cold-Chain Expirations &lt; 30m
              </span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
          <span>STEMergent Hacks 2026</span>
          <span className="text-slate-600">•</span>
          <button
            onClick={onResetDemoData}
            title="Reset system to verified community test data"
            className="hover:text-slate-200 flex items-center transition-colors underline decoration-slate-600 underline-offset-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 sm:h-16 gap-2">
          {/* Logo & Brand Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-800 flex items-center justify-center text-white shadow-sm border border-emerald-900 flex-shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-sans">
                    RescueRoute
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                    Dispatch
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 hidden md:block">
                  Surplus Food Recovery &amp; Volunteer Vehicle Route Coordinator
                </p>
              </div>
            </div>

            {/* Mobile-only Quick Add Button */}
            <button
              onClick={onOpenNewDonation}
              className="sm:hidden inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-mono font-semibold text-white bg-emerald-700 hover:bg-emerald-800"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Alert
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 sm:pb-0">
            <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto justify-around sm:justify-start">
              <button
                onClick={() => setCurrentTab('dispatch')}
                className={`flex items-center px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  currentTab === 'dispatch'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 mr-1 text-slate-500" />
                <span>Dispatch</span>
              </button>

              <button
                onClick={() => setCurrentTab('driver')}
                className={`flex items-center px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  currentTab === 'driver'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>Driver</span>
                <span className="ml-1 px-1 py-0.2 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800 font-bold hidden xs:inline">
                  Car
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('ledger')}
                className={`flex items-center px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  currentTab === 'ledger'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 mr-1 text-amber-600" />
                <span>501(c)(3)</span>
              </button>
            </nav>

            {/* Desktop-only Primary Action Button */}
            <div className="hidden sm:flex items-center ml-2">
              <button
                onClick={onOpenNewDonation}
                className="inline-flex items-center px-3.5 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-mono font-bold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Log Surplus Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
