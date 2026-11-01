import React, { useEffect, useState } from 'react';
import { RescueRun, VehicleType } from '../types';
import {
  formatTimeRemaining,
  formatVehicleDetails,
  formatStorageBadge,
} from '../utils/formatters';
import {
  Clock,
  Car,
  FileText,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

interface RescueCardProps {
  run: RescueRun;
  onClaim: (run: RescueRun) => void;
  onUnclaim: (runId: string) => void;
  onOpenDriverManifest: (run: RescueRun) => void;
  onViewTaxReceipt: (run: RescueRun) => void;
  onToggleRouteSelection: (runId: string) => void;
  isSelectedForRoute: boolean;
  selectedVehicleFilter?: VehicleType | 'all';
}

export const RescueCard: React.FC<RescueCardProps> = ({
  run,
  onClaim,
  onUnclaim,
  onOpenDriverManifest,
  onViewTaxReceipt,
  onToggleRouteSelection,
  isSelectedForRoute,
}) => {
  // Real-time ticking state for perishability countdown
  const [timer, setTimer] = useState(() => formatTimeRemaining(run.expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(formatTimeRemaining(run.expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [run.expiresAt]);

  const vehicleInfo = formatVehicleDetails(run.recommendedVehicle);
  const storageBadge = formatStorageBadge(run.storageRequirement);

  const urgencyStyles = {
    critical: {
      border: 'border-red-300',
      badge: 'bg-red-100 text-red-800 border-red-200',
      bar: 'bg-red-600',
    },
    warning: {
      border: 'border-amber-300',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      bar: 'bg-amber-500',
    },
    normal: {
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      bar: 'bg-emerald-600',
    },
    expired: {
      border: 'border-slate-300',
      badge: 'bg-slate-200 text-slate-700 border-slate-300',
      bar: 'bg-slate-400',
    },
  }[timer.urgency];

  // Percentage of 3-hour cold chain window remaining
  const percentRemaining = Math.max(0, Math.min(100, (timer.minutesLeft / 180) * 100));

  return (
    <div
      className={`bg-white rounded-lg border transition-all duration-150 overflow-hidden ${
        isSelectedForRoute
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
          : `border-slate-200 hover:border-slate-300 shadow-sm`
      }`}
    >
      {/* Top Countdown Urgency Ribbon */}
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-xs text-slate-300 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-white tracking-wider">
            {run.runNumber}
          </span>
          <span className="text-slate-600">•</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${storageBadge.bgClass} ${storageBadge.textClass} ${storageBadge.borderClass}`}
          >
            {storageBadge.label}
          </span>
        </div>

        {/* Cold-Chain Urgency Meter */}
        <div className="flex items-center space-x-2">
          <Clock
            className={`w-3.5 h-3.5 ${
              timer.urgency === 'critical' ? 'text-red-400 animate-pulse' : 'text-slate-400'
            }`}
          />
          <span
            className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] border ${urgencyStyles.badge}`}
          >
            {timer.text}
          </span>
        </div>
      </div>

      {/* Perishable Progress Bar */}
      <div className="w-full bg-slate-100 h-1">
        <div
          className={`h-1 transition-all duration-500 ${urgencyStyles.bar}`}
          style={{ width: `${percentRemaining}%` }}
        ></div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Title & Cargo Specs */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 leading-snug font-sans">
              {run.title}
            </h3>
            <div className="text-right flex-shrink-0">
              <span className="text-lg font-bold font-mono text-slate-900">
                {run.actualWeightLbs || run.estimatedWeightLbs} lbs
              </span>
              <p className="text-[11px] text-slate-500 font-mono">
                {run.boxCount} boxes / trays
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
            {run.description}
          </p>
        </div>

        {/* Vehicle Match ("Car" Requirement) */}
        <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-700">
            <Car className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-900">{vehicleInfo.label}</span>
            <span className="text-slate-600 hidden sm:inline">
              (Cap: {vehicleInfo.capacityLbs} lbs)
            </span>
          </div>
          <span className="text-slate-700 font-medium">
            Load: {Math.round((run.estimatedWeightLbs / vehicleInfo.capacityLbs) * 100)}% of trunk
          </span>
        </div>

        {/* Route Corridor Nodes (Donor Pickup -> Pantry Drop-off) */}
        <div className="space-y-2.5 text-xs">
          {/* Pickup Node */}
          <div className="flex items-start space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-mono font-bold text-[10px] mt-0.5 flex-shrink-0 border border-amber-300">
              P
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 truncate">
                  {run.donor.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Pickup</span>
              </div>
              <p className="text-slate-500 truncate">{run.donor.address}</p>
              <p className="text-[11px] text-amber-900 font-mono bg-amber-50/80 px-2 py-0.5 rounded mt-0.5 border border-amber-200/60 inline-block">
                Dock: {run.donor.dockInstructions}
              </p>
            </div>
          </div>

          <div className="border-l-2 border-dashed border-slate-200 ml-2.5 h-3 my-0.5"></div>

          {/* Drop-off Node */}
          <div className="flex items-start space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-[10px] mt-0.5 flex-shrink-0 border border-emerald-300">
              D
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 truncate">
                  {run.pantry.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Destination</span>
              </div>
              <p className="text-slate-500 truncate">{run.pantry.address}</p>
              {run.pantry.urgencyNote && (
                <p className="text-[11px] text-emerald-800 font-mono mt-0.5">
                  Need: {run.pantry.urgencyNote}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Claim Status Metadata */}
        {run.claimedBy && run.status !== 'completed' && (
          <div className="bg-sky-50 border border-sky-200 rounded-md p-2.5 text-xs font-mono text-sky-900 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Car className="w-3.5 h-3.5 text-sky-700" />
              <span>
                Assigned: <strong className="font-semibold">{run.claimedBy.driverName}</strong>
              </span>
            </div>
            <span className="text-sky-700 text-[11px]">En Route</span>
          </div>
        )}

        {/* Action Button Strip */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {run.status === 'pending_dispatch' && (
            <>
              <button
                onClick={() => onClaim(run)}
                className="flex-1 inline-flex items-center justify-center px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors shadow-sm"
              >
                <Car className="w-3.5 h-3.5 mr-1.5" />
                Claim Run (I have a Car)
              </button>

              <button
                onClick={() => onToggleRouteSelection(run.id)}
                className={`px-3 py-2 rounded-md text-xs font-mono font-medium border transition-colors ${
                  isSelectedForRoute
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
                title="Include in multi-stop vehicle route optimizer"
              >
                {isSelectedForRoute ? '✓ In Multi-Route' : '+ Route Optimizer'}
              </button>
            </>
          )}

          {run.status === 'claimed' && (
            <>
              <button
                onClick={() => onOpenDriverManifest(run)}
                className="flex-1 inline-flex items-center justify-center px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                Launch Driver Manifest
              </button>

              <button
                onClick={() => onUnclaim(run.id)}
                className="px-2.5 py-2 rounded-md text-xs font-mono text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
                title="Release run back to dispatch pool"
              >
                Release
              </button>
            </>
          )}

          {run.status === 'completed' && (
            <div className="w-full flex items-center justify-between">
              <span className="inline-flex items-center text-xs font-mono text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                Delivered &amp; Verified
              </span>

              <button
                onClick={() => onViewTaxReceipt(run)}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-mono font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-slate-600" />
                Tax Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
