import React, { useMemo, useState, useEffect } from 'react';
import { RescueRun, VolunteerDriver } from '../types';
import { optimizeMultiStopRoute } from '../utils/geo';
import { formatVehicleDetails } from '../utils/formatters';
import {
  Navigation,
  X,
  AlertCircle,
} from 'lucide-react';

interface RouteOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRuns: RescueRun[];
  drivers: VolunteerDriver[];
  onDispatchRoute: (driverId: string, runIds: string[]) => void;
}

export const RouteOptimizerModal: React.FC<RouteOptimizerModalProps> = ({
  isOpen,
  onClose,
  selectedRuns,
  drivers,
  onDispatchRoute,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Compute optimized plan
  const plan = useMemo(() => {
    return optimizeMultiStopRoute(selectedRuns);
  }, [selectedRuns]);

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);
  const vehicleInfo = selectedDriver ? formatVehicleDetails(selectedDriver.vehicle) : null;

  const isOverweight = Boolean(
    vehicleInfo && plan.totalLbs > vehicleInfo.capacityLbs
  );

  const handleDispatch = () => {
    if (!selectedDriverId) return;
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      onDispatchRoute(
        selectedDriverId,
        selectedRuns.map((r) => r.id)
      );
      onClose();
    }, 400);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center text-white border border-emerald-700">
              <Navigation className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans">
                Multi-Stop Vehicle Route Optimizer
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                TSP Heuristic Sequencing • {selectedRuns.length} Rescue Runs Combined
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {selectedRuns.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-800">
                No runs selected for batch routing
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Select at least 1 or 2 pending surplus donations from the Dispatch Board by clicking
                &quot;+ Route Optimizer&quot; to calculate an efficient multi-stop itinerary.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-mono font-semibold rounded-md hover:bg-slate-800"
              >
                Return to Dispatch Board
              </button>
            </div>
          ) : (
            <>
              {/* Trip Efficiency Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">
                    Total Distance
                  </span>
                  <p className="text-lg font-bold font-mono text-slate-900">
                    {plan.totalDistanceMiles} mi
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">
                    Est. Transit Time
                  </span>
                  <p className="text-lg font-bold font-mono text-slate-900">
                    ~{plan.estimatedDurationMins} min
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">
                    Total Cargo
                  </span>
                  <p className="text-lg font-bold font-mono text-slate-900">
                    {plan.totalLbs} lbs
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">
                    Gas Saved
                  </span>
                  <p className="text-lg font-bold font-mono text-emerald-800">
                    +{plan.fuelSavedGallons} gal
                  </p>
                </div>
              </div>

              {/* Driver & Vehicle Selection ("Car" matching) */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                <label className="block text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                  Assign Volunteer Driver &amp; Vehicle
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {drivers.map((driver) => {
                    const isSelected = driver.id === selectedDriverId;
                    const vDetails = formatVehicleDetails(driver.vehicle);

                    return (
                      <div
                        key={driver.id}
                        onClick={() => setSelectedDriverId(driver.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">
                            {driver.name}
                          </span>
                          {driver.hasCoolerBags && (
                            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded">
                              Cooler Bags
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-600 mt-1">
                          {vDetails.label}
                        </p>
                        <div className="mt-2 text-[10px] font-mono text-slate-500 flex justify-between">
                          <span>Max: {vDetails.capacityLbs} lbs</span>
                          <span>Plate: {driver.licensePlate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isOverweight && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-xs font-mono text-red-800 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                    <span>
                      Cargo weight ({plan.totalLbs} lbs) exceeds {selectedDriver?.name}&apos;s vehicle
                      capacity ({vehicleInfo?.capacityLbs} lbs). Select an SUV or remove a run.
                    </span>
                  </div>
                )}
              </div>

              {/* Sequenced Route Itinerary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                    Optimized Itinerary Sequence ({plan.stops.length} Stops)
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-800 font-semibold">
                    Earliest expiring pickups prioritized
                  </span>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                  {plan.stops.map((stop, idx) => {
                    const isPickup = stop.type === 'pickup';

                    return (
                      <div
                        key={stop.id}
                        className="p-3 bg-white flex items-start space-x-3 text-xs"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                            isPickup
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 truncate">
                              {stop.name}
                            </span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              ~+{stop.estimatedArrivalMin} min
                            </span>
                          </div>
                          <p className="text-slate-500 truncate">{stop.address}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                isPickup
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isPickup ? 'PICKUP' : 'FINAL DROP-OFF'}
                            </span>
                            <span className="text-slate-600 font-mono text-[11px]">
                              {stop.cargoDescription}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-md text-xs font-mono font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDispatch}
                  disabled={isOptimizing || isOverweight}
                  className="inline-flex items-center px-5 py-2.5 rounded-md text-xs font-mono font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                  {isOptimizing ? (
                    'Sequencing Route...'
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5 mr-1.5" />
                      Dispatch Optimized Route to {selectedDriver?.name || 'Driver'}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
