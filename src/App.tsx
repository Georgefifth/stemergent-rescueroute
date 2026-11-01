import { useState, useEffect } from 'react';
import { RescueRun, VolunteerDriver, VehicleType } from './types';
import {
  SAMPLE_DONORS,
  SAMPLE_PANTRIES,
  SAMPLE_DRIVERS,
  INITIAL_RESCUE_RUNS,
} from './mockData';
import { generateReceiptHash } from './utils/formatters';
import { Header } from './components/Header';
import { MetricsRibbon } from './components/MetricsRibbon';
import { InteractiveMap } from './components/InteractiveMap';
import { RescueCard } from './components/RescueCard';
import { RouteOptimizerModal } from './components/RouteOptimizerModal';
import { DriverManifestView } from './components/DriverManifestView';
import { TaxReceiptModal } from './components/TaxReceiptModal';
import { NewDonationModal } from './components/NewDonationModal';
import { TaxLedgerView } from './components/TaxLedgerView';
import {
  Filter,
  Navigation,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const STORAGE_KEY = 'rescueroute_runs_v1';

export function App() {
  // Load runs from localStorage or fallback to initial mock data
  const [runs, setRuns] = useState<RescueRun[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_RESCUE_RUNS;
  });

  const [drivers] = useState<VolunteerDriver[]>(SAMPLE_DRIVERS);
  const [currentTab, setCurrentTab] = useState<'dispatch' | 'driver' | 'ledger'>('dispatch');

  // Filters
  const [vehicleFilter, setVehicleFilter] = useState<VehicleType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'claimed' | 'completed'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'warning'>('all');

  // Multi-stop route optimizer selection
  const [selectedRouteRunIds, setSelectedRouteRunIds] = useState<string[]>([]);
  const [isRouteOptimizerOpen, setIsRouteOptimizerOpen] = useState(false);

  // Modals
  const [isNewDonationOpen, setIsNewDonationOpen] = useState(false);
  const [selectedReceiptRun, setSelectedReceiptRun] = useState<RescueRun | null>(null);

  // Toast / Status notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(
    null
  );

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
    } catch {
      // Ignore
    }
  }, [runs]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Metrics calculations
  const completedRuns = runs.filter((r) => r.status === 'completed');
  const totalLbs = completedRuns.reduce(
    (acc, r) => acc + (r.actualWeightLbs || r.estimatedWeightLbs),
    0
  );
  const totalMeals = totalLbs / 1.2;
  const totalCo2Lbs = totalLbs * 2.5;

  const criticalRuns = runs.filter(
    (r) =>
      r.status === 'pending_dispatch' &&
      (new Date(r.expiresAt).getTime() - Date.now()) / 60000 <= 30
  );

  // Filtered runs for dispatch board
  const filteredRuns = runs.filter((run) => {
    if (vehicleFilter !== 'all' && run.recommendedVehicle !== vehicleFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && run.status !== 'pending_dispatch') return false;
      if (statusFilter === 'claimed' && run.status !== 'claimed' && run.status !== 'picked_up')
        return false;
      if (statusFilter === 'completed' && run.status !== 'completed') return false;
    }
    if (urgencyFilter !== 'all') {
      const minutesLeft = (new Date(run.expiresAt).getTime() - Date.now()) / 60000;
      if (urgencyFilter === 'critical' && minutesLeft > 30) return false;
      if (urgencyFilter === 'warning' && (minutesLeft <= 30 || minutesLeft > 90)) return false;
    }
    return true;
  });

  // Handler: Claim a run for volunteer driver
  const handleClaimRun = (run: RescueRun) => {
    const driver = drivers[0]; // Default to Alex Rivera for quick action
    setRuns((prev) =>
      prev.map((r) =>
        r.id === run.id
          ? {
              ...r,
              status: 'claimed',
              claimedBy: {
                driverId: driver.id,
                driverName: driver.name,
                driverPhone: driver.phone,
                vehicle: driver.vehicle,
                claimedAt: new Date().toISOString(),
              },
            }
          : r
      )
    );
    showToast(
      `Claimed ${run.runNumber}! Assigned to ${driver.name} (${driver.vehicle.replace('_', ' ')}). Opening Driver Manifest.`
    );
    // Switch to driver tab
    setCurrentTab('driver');
  };

  // Handler: Unclaim
  const handleUnclaimRun = (runId: string) => {
    setRuns((prev) =>
      prev.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: 'pending_dispatch',
              claimedBy: undefined,
            }
          : r
      )
    );
    showToast(`Released run back to open dispatch pool.`, 'info');
  };

  // Handler: Driver confirms pickup with temperature
  const handleConfirmPickup = (runId: string, temperatureF: number) => {
    setRuns((prev) =>
      prev.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: 'picked_up',
              pickupConfirmedAt: new Date().toISOString(),
              pickupTemperatureF: temperatureF,
            }
          : r
      )
    );
    showToast(`Pickup verified at ${temperatureF}°F! En route to community pantry.`);
  };

  // Handler: Driver completes delivery
  const handleCompleteDelivery = async (
    runId: string,
    actualLbs: number,
    signatureName: string,
    notes: string
  ) => {
    const run = runs.find((r) => r.id === runId);
    const hash = await generateReceiptHash(`${runId}-${actualLbs}-${signatureName}`);

    setRuns((prev) =>
      prev.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: 'completed',
              actualWeightLbs: actualLbs,
              completedAt: new Date().toISOString(),
              signatureName,
              deliveryNotes: notes,
              receiptHash: hash,
            }
          : r
      )
    );

    showToast(
      `Rescue completed! Verified ${actualLbs} lbs delivered. 501(c)(3) tax receipt generated.`
    );

    if (run) {
      setSelectedReceiptRun({
        ...run,
        actualWeightLbs: actualLbs,
        signatureName,
        receiptHash: hash,
        completedAt: new Date().toISOString(),
      });
    }
  };

  // Handler: Add new surplus run
  const handleAddNewRun = (newRun: RescueRun) => {
    setRuns((prev) => [newRun, ...prev]);
    showToast(`Surplus Alert ${newRun.runNumber} published! Available for vehicle dispatch.`);
  };

  // Handler: Reset demo data
  const handleResetDemoData = () => {
    setRuns(INITIAL_RESCUE_RUNS);
    setSelectedRouteRunIds([]);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Reset to original verified community dataset.', 'info');
  };

  // Handler: Batch dispatch from Route Optimizer
  const handleBatchDispatch = (driverId: string, runIds: string[]) => {
    const driver = drivers.find((d) => d.id === driverId) || drivers[0];
    setRuns((prev) =>
      prev.map((r) =>
        runIds.includes(r.id)
          ? {
              ...r,
              status: 'claimed',
              claimedBy: {
                driverId: driver.id,
                driverName: driver.name,
                driverPhone: driver.phone,
                vehicle: driver.vehicle,
                claimedAt: new Date().toISOString(),
              },
            }
          : r
      )
    );
    setSelectedRouteRunIds([]);
    showToast(
      `Dispatched ${runIds.length} stops to ${driver.name} (${driver.vehicle.replace('_', ' ')}). Launching Driver Manifest.`
    );
    setCurrentTab('driver');
  };

  const toggleRouteSelection = (runId: string) => {
    setSelectedRouteRunIds((prev) =>
      prev.includes(runId) ? prev.filter((id) => id !== runId) : [...prev, runId]
    );
  };

  const selectedRouteRuns = runs.filter((r) => selectedRouteRunIds.includes(r.id));
  const activeDriverRuns = runs.filter((r) => r.status === 'claimed' || r.status === 'picked_up');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center space-x-2 text-xs font-mono animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewDonation={() => setIsNewDonationOpen(true)}
        onResetDemoData={handleResetDemoData}
        activeDriverCount={drivers.length}
        criticalCount={criticalRuns.length}
      />

      {/* Metrics Ribbon (Always visible on Dispatch & Driver) */}
      <MetricsRibbon
        totalLbs={totalLbs}
        totalMeals={totalMeals}
        totalCo2Lbs={totalCo2Lbs}
        criticalCount={criticalRuns.length}
        completedRunsCount={completedRuns.length}
      />

      {/* Main Content Areas Based on Active Tab */}
      <main className="flex-1">
        {currentTab === 'dispatch' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Top Interactive Radar Map */}
            <InteractiveMap
              runs={runs}
              onSelectRun={(run) => {
                showToast(`Inspecting donor: ${run.donor.name} • ${run.title}`, 'info');
              }}
            />

            {/* Filter Bar & Route Batch Action Bar */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              {/* Vehicle & Urgency Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-500 mr-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold uppercase">Filters:</span>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">All Statuses ({runs.length})</option>
                  <option value="pending">Open for Claims</option>
                  <option value="claimed">Claimed / In Transit</option>
                  <option value="completed">Completed &amp; Verified</option>
                </select>

                {/* Vehicle ("Car") Filter */}
                <select
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">Any Vehicle Type</option>
                  <option value="compact_sedan">Compact Sedan (&lt;90 lbs)</option>
                  <option value="hatchback_midsize">Hatchback / Mid-size (&lt;180 lbs)</option>
                  <option value="suv_van">SUV / Minivan (&lt;400 lbs)</option>
                  <option value="truck_insulated">Cargo Van / Truck (&gt;400 lbs)</option>
                </select>

                {/* Urgency Filter */}
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">All Time Windows</option>
                  <option value="critical">🚨 Critical (&lt; 30 min left)</option>
                  <option value="warning">⚠️ Warning (&lt; 90 min left)</option>
                </select>

                {(vehicleFilter !== 'all' || statusFilter !== 'all' || urgencyFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setVehicleFilter('all');
                      setStatusFilter('all');
                      setUrgencyFilter('all');
                    }}
                    className="text-xs font-mono text-emerald-700 hover:text-emerald-800 underline ml-2"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Multi-Stop Route Optimizer Action Trigger */}
              <div className="flex items-center space-x-2">
                {selectedRouteRunIds.length > 0 && (
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {selectedRouteRunIds.length} stops staged
                  </span>
                )}
                <button
                  onClick={() => setIsRouteOptimizerOpen(true)}
                  disabled={selectedRouteRunIds.length === 0}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-md text-xs font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Launch Route Optimizer ({selectedRouteRunIds.length})
                </button>
              </div>
            </div>

            {/* Run Cards Grid or Filter-Zero State */}
            {filteredRuns.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center space-y-3 shadow-sm">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  No rescue runs match current filters
                </h3>
                <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
                  Try clearing the vehicle type or urgency filter to view all available food donations.
                </p>
                <button
                  onClick={() => {
                    setVehicleFilter('all');
                    setStatusFilter('all');
                    setUrgencyFilter('all');
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-md text-xs font-mono font-bold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRuns.map((run) => (
                  <RescueCard
                    key={run.id}
                    run={run}
                    onClaim={handleClaimRun}
                    onUnclaim={handleUnclaimRun}
                    onOpenDriverManifest={() => {
                      setCurrentTab('driver');
                    }}
                    onViewTaxReceipt={(r) => setSelectedReceiptRun(r)}
                    onToggleRouteSelection={toggleRouteSelection}
                    isSelectedForRoute={selectedRouteRunIds.includes(run.id)}
                    selectedVehicleFilter={vehicleFilter}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'driver' && (
          <DriverManifestView
            activeRuns={activeDriverRuns}
            onConfirmPickup={handleConfirmPickup}
            onCompleteDelivery={handleCompleteDelivery}
            onSelectRunFromDispatch={() => setCurrentTab('dispatch')}
          />
        )}

        {currentTab === 'ledger' && (
          <TaxLedgerView
            runs={runs}
            onOpenReceipt={(run) => setSelectedReceiptRun(run)}
          />
        )}
      </main>

      {/* Modals */}
      <NewDonationModal
        isOpen={isNewDonationOpen}
        onClose={() => setIsNewDonationOpen(false)}
        donors={SAMPLE_DONORS}
        pantries={SAMPLE_PANTRIES}
        onAddRun={handleAddNewRun}
      />

      <RouteOptimizerModal
        isOpen={isRouteOptimizerOpen}
        onClose={() => setIsRouteOptimizerOpen(false)}
        selectedRuns={selectedRouteRuns}
        drivers={drivers}
        onDispatchRoute={handleBatchDispatch}
      />

      <TaxReceiptModal
        isOpen={!!selectedReceiptRun}
        onClose={() => setSelectedReceiptRun(null)}
        run={selectedReceiptRun}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            RescueRoute • STEMergent Hacks 2026 Open Source Community Project
          </span>
          <span className="text-slate-600">
            Compliant with USDA &amp; IRC § 170(e)(3) Food Safety Guidelines
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
