import React, { useState } from 'react';
import { RescueRun } from '../types';
import { formatTimeRemaining, formatStorageBadge } from '../utils/formatters';
import {
  Navigation,
  CheckCircle2,
  Phone,
  Thermometer,
  ExternalLink,
  Car,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface DriverManifestViewProps {
  activeRuns: RescueRun[];
  onConfirmPickup: (runId: string, temperatureF: number) => void;
  onCompleteDelivery: (
    runId: string,
    actualLbs: number,
    signatureName: string,
    notes: string
  ) => void;
  onSelectRunFromDispatch: () => void;
}

export const DriverManifestView: React.FC<DriverManifestViewProps> = ({
  activeRuns,
  onConfirmPickup,
  onCompleteDelivery,
  onSelectRunFromDispatch,
}) => {
  const [selectedRunId, setSelectedRunId] = useState<string>(activeRuns[0]?.id || '');
  const [tempInput, setTempInput] = useState<string>('38');
  const [actualWeightInput, setActualWeightInput] = useState<string>('');
  const [signatureInput, setSignatureInput] = useState<string>('Jordan Taylor');
  const [notesInput, setNotesInput] = useState<string>('Delivered in clean insulated cooler bags.');
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentRun = activeRuns.find((r) => r.id === selectedRunId) || activeRuns[0];

  const handlePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRun) return;

    const temp = parseFloat(tempInput);
    if (isNaN(temp)) {
      setValidationError('Please enter a valid temperature reading in °F');
      return;
    }

    setValidationError(null);
    onConfirmPickup(currentRun.id, temp);
  };

  const handleDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRun) return;

    const weight = parseFloat(actualWeightInput || currentRun.estimatedWeightLbs.toString());
    if (isNaN(weight) || weight <= 0) {
      setValidationError('Actual received weight must be greater than 0 lbs');
      return;
    }

    if (!signatureInput.trim()) {
      setValidationError('Please enter the name of the pantry staff/volunteer receiving the food');
      return;
    }

    setValidationError(null);
    onCompleteDelivery(currentRun.id, weight, signatureInput.trim(), notesInput);
  };

  if (!currentRun) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-sans">
          No Active Rescue Runs Assigned
        </h2>
        <p className="text-xs text-slate-500 font-mono mt-1.5 max-w-xs mx-auto">
          You currently have no claimed food runs in your vehicle queue.
        </p>
        <button
          onClick={onSelectRunFromDispatch}
          className="mt-6 inline-flex items-center px-4 py-2.5 rounded-md text-xs font-mono font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-colors"
        >
          Browse Open Surplus Runs on Dispatch Board
        </button>
      </div>
    );
  }

  const isPickedUp = currentRun.status === 'picked_up';
  const timer = formatTimeRemaining(currentRun.expiresAt);
  const storageBadge = formatStorageBadge(currentRun.storageRequirement);

  const googleMapsUrl = isPickedUp
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        currentRun.pantry.address
      )}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        currentRun.donor.address
      )}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* Run Selector Pills if Driver Has Multiple Runs */}
      {activeRuns.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {activeRuns.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setSelectedRunId(r.id);
                setValidationError(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-colors border ${
                r.id === currentRun.id
                  ? 'bg-emerald-800 text-white border-emerald-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {r.runNumber} • {r.status === 'picked_up' ? 'In Transit' : 'Pickup Pending'}
            </button>
          ))}
        </div>
      )}

      {/* Driver Mission Card Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              {isPickedUp ? 'PHASE 2 / 2: EN ROUTE TO PANTRY' : 'PHASE 1 / 2: DONOR PICKUP'}
            </span>
            <h1 className="text-base font-bold font-sans text-white mt-0.5">
              {currentRun.title}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Run {currentRun.runNumber} • {currentRun.estimatedWeightLbs} lbs • {currentRun.boxCount} boxes
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                timer.urgency === 'critical'
                  ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {timer.text}
            </span>
          </div>
        </div>

        {/* Phase Indicator Strip */}
        <div className="grid grid-cols-2 text-center text-xs font-mono font-bold border-b border-slate-200">
          <div
            className={`py-2 border-r border-slate-200 flex items-center justify-center space-x-1.5 ${
              !isPickedUp ? 'bg-amber-50 text-amber-900' : 'bg-slate-50 text-slate-400'
            }`}
          >
            <span>1. Collect from Donor</span>
            {isPickedUp && <Check className="w-3.5 h-3.5 text-emerald-600" />}
          </div>
          <div
            className={`py-2 flex items-center justify-center space-x-1.5 ${
              isPickedUp ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-400'
            }`}
          >
            <span>2. Deliver to Pantry</span>
          </div>
        </div>

        {/* Dynamic Location Details Based on Phase */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="uppercase font-semibold">
                {isPickedUp ? 'Destination Pantry' : 'Donor Pickup Location'}
              </span>
              <span>{isPickedUp ? currentRun.pantry.operatingHours : 'Loading Dock'}</span>
            </div>

            <p className="text-base font-bold text-slate-900">
              {isPickedUp ? currentRun.pantry.name : currentRun.donor.name}
            </p>
            <p className="text-xs text-slate-600">
              {isPickedUp ? currentRun.pantry.address : currentRun.donor.address}
            </p>

            <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900 font-mono">
              <strong>Instructions:</strong>{' '}
              {isPickedUp
                ? currentRun.pantry.urgencyNote || 'Deliver to volunteer coordinator at intake counter.'
                : currentRun.donor.dockInstructions}
            </div>

            {/* Quick Dial and Navigation Actions */}
            <div className="pt-2 flex space-x-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-lg text-xs font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Navigation className="w-4 h-4 mr-2 text-emerald-400" />
                Open GPS in Google Maps
                <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
              </a>

              <a
                href={`tel:${
                  isPickedUp ? currentRun.pantry.contactPhone : currentRun.donor.contactPhone
                }`}
                className="inline-flex items-center justify-center px-4 py-3 rounded-lg text-xs font-mono font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
                title="Call site coordinator"
              >
                <Phone className="w-4 h-4 text-slate-600" />
              </a>
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-mono text-red-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Phase 1 Form: Confirm Pickup */}
          {!isPickedUp ? (
            <form onSubmit={handlePickup} className="space-y-4 pt-2">
              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-900">
                    <Thermometer className="w-4 h-4 text-emerald-700" />
                    <span>Cold-Chain Temperature Verification</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${storageBadge.bgClass} ${storageBadge.textClass} ${storageBadge.borderClass}`}
                  >
                    {storageBadge.label}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      value={tempInput}
                      onChange={(e) => setTempInput(e.target.value)}
                      placeholder="e.g. 38"
                      className="w-full pl-3 pr-8 py-2 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400">
                      °F
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 flex-1">
                    Target: Chilled (&lt;41°F) or Hot (&gt;140°F) per USDA safety rules.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-lg text-sm font-mono font-bold text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-200 transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>Confirm Food Collected &amp; Depart to Pantry</span>
              </button>
            </form>
          ) : (
            /* Phase 2 Form: Complete Delivery & Receipt */
            <form onSubmit={handleDelivery} className="space-y-4 pt-2">
              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                  Delivery Sign-Off &amp; 501(c)(3) Receipt Log
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-500 mb-1">
                      Verified Scale Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={currentRun.estimatedWeightLbs}
                      onChange={(e) => setActualWeightInput(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-500 mb-1">
                      Pantry Steward Signer Name
                    </label>
                    <input
                      type="text"
                      value={signatureInput}
                      onChange={(e) => setSignatureInput(e.target.value)}
                      placeholder="e.g. Jordan Taylor"
                      className="w-full px-3 py-2 text-sm font-sans text-slate-900 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">
                    Delivery Notes / Condition
                  </label>
                  <input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="e.g. Clean handoff, placed in walk-in cooler."
                    className="w-full px-3 py-2 text-xs font-sans text-slate-900 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-lg text-sm font-mono font-bold text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-200 transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>Complete Rescue Run &amp; Generate Tax Receipt</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
