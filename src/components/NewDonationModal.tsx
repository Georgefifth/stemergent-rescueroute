import React, { useState } from 'react';
import {
  DonorLocation,
  PantryLocation,
  FoodType,
  StorageRequirement,
  VehicleType,
  RescueRun,
} from '../types';
import { formatVehicleDetails } from '../utils/formatters';
import { Plus, X, Car } from 'lucide-react';

interface NewDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donors: DonorLocation[];
  pantries: PantryLocation[];
  onAddRun: (newRun: RescueRun) => void;
}

export const NewDonationModal: React.FC<NewDonationModalProps> = ({
  isOpen,
  onClose,
  donors,
  pantries,
  onAddRun,
}) => {
  const [selectedDonorId, setSelectedDonorId] = useState<string>(donors[0]?.id || '');
  const [selectedPantryId, setSelectedPantryId] = useState<string>(pantries[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [foodType, setFoodType] = useState<FoodType>('prepared_meals');
  const [storageRequirement, setStorageRequirement] = useState<StorageRequirement>('chilled');
  const [weightLbs, setWeightLbs] = useState<string>('60');
  const [boxCount, setBoxCount] = useState<string>('4');
  const [expiryMinutes, setExpiryMinutes] = useState<string>('90');
  const [dockNotes, setDockNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compute recommended vehicle dynamically
  const weight = parseFloat(weightLbs) || 0;
  let recommendedVehicle: VehicleType = 'compact_sedan';
  if (weight > 300) {
    recommendedVehicle = 'truck_insulated';
  } else if (weight > 150) {
    recommendedVehicle = 'suv_van';
  } else if (weight > 75) {
    recommendedVehicle = 'hatchback_midsize';
  }
  const vDetails = formatVehicleDetails(recommendedVehicle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title or food item description is required.';
    }
    if (!weightLbs || isNaN(weight) || weight <= 0) {
      newErrors.weightLbs = 'Weight must be greater than 0 lbs.';
    }
    const boxes = parseInt(boxCount, 10);
    if (!boxCount || isNaN(boxes) || boxes <= 0) {
      newErrors.boxCount = 'Box count must be at least 1.';
    }
    const mins = parseInt(expiryMinutes, 10);
    if (!expiryMinutes || isNaN(mins) || mins <= 0) {
      newErrors.expiryMinutes = 'Safe expiration window must be greater than 0 minutes.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const donor = donors.find((d) => d.id === selectedDonorId) || donors[0];
    const pantry = pantries.find((p) => p.id === selectedPantryId) || pantries[0];

    const runNumber = `RR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + mins * 60000).toISOString();

    const newRun: RescueRun = {
      id: `run-${Date.now()}`,
      runNumber,
      donor: {
        ...donor,
        dockInstructions: dockNotes.trim() || donor.dockInstructions,
      },
      pantry,
      foodType,
      title: title.trim(),
      description: description.trim() || `${title} from ${donor.name}`,
      estimatedWeightLbs: weight,
      boxCount: boxes,
      storageRequirement,
      recommendedVehicle,
      status: 'pending_dispatch',
      createdAt: now.toISOString(),
      expiresAt,
      notes: dockNotes.trim(),
    };

    onAddRun(newRun);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-sans">
              Log Urgent Food Surplus Alert
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Donor & Recipient Pantry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Source Food Donor
              </label>
              <select
                value={selectedDonorId}
                onChange={(e) => setSelectedDonorId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-sans border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {donors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Destination Community Pantry
              </label>
              <select
                value={selectedPantryId}
                onChange={(e) => setSelectedPantryId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-sans border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {pantries.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Surplus Item Name / Summary *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. 50 Fresh Prepared Deli Box Meals"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                errors.title ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] font-mono text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Item Details &amp; Packaging Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Packed in clean sealed trays. Contains chicken sandwiches, fruit, and salads."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Category & Storage Requirement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Food Category
              </label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value as FoodType)}
                className="w-full px-3 py-2 text-xs font-sans border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="prepared_meals">Prepared Hot / Cold Meals</option>
                <option value="dairy_chilled">Dairy, Milk &amp; Cheese</option>
                <option value="fresh_produce">Fresh Produce, Fruits &amp; Greens</option>
                <option value="bakery_dry">Bakery, Bread &amp; Pastries</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Required Storage
              </label>
              <select
                value={storageRequirement}
                onChange={(e) => setStorageRequirement(e.target.value as StorageRequirement)}
                className="w-full px-3 py-2 text-xs font-sans border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="chilled">Chilled (&lt;41°F)</option>
                <option value="hot_holding">Hot Holding (&gt;140°F)</option>
                <option value="ambient">Ambient (Room Temperature)</option>
                <option value="frozen">Frozen (&lt;0°F)</option>
              </select>
            </div>
          </div>

          {/* Weight, Box Count, Expiration Window */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Estimated Weight (lbs) *
              </label>
              <input
                type="number"
                step="1"
                value={weightLbs}
                onChange={(e) => {
                  setWeightLbs(e.target.value);
                  if (errors.weightLbs) setErrors((prev) => ({ ...prev, weightLbs: '' }));
                }}
                className={`w-full px-3 py-2 text-sm font-mono border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  errors.weightLbs ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              {errors.weightLbs && (
                <p className="text-[11px] font-mono text-red-600 mt-1">{errors.weightLbs}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Box / Container Count *
              </label>
              <input
                type="number"
                step="1"
                value={boxCount}
                onChange={(e) => {
                  setBoxCount(e.target.value);
                  if (errors.boxCount) setErrors((prev) => ({ ...prev, boxCount: '' }));
                }}
                className={`w-full px-3 py-2 text-sm font-mono border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  errors.boxCount ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              {errors.boxCount && (
                <p className="text-[11px] font-mono text-red-600 mt-1">{errors.boxCount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Safe Window (Minutes) *
              </label>
              <input
                type="number"
                step="5"
                value={expiryMinutes}
                onChange={(e) => {
                  setExpiryMinutes(e.target.value);
                  if (errors.expiryMinutes) setErrors((prev) => ({ ...prev, expiryMinutes: '' }));
                }}
                className={`w-full px-3 py-2 text-sm font-mono border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  errors.expiryMinutes ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              {errors.expiryMinutes && (
                <p className="text-[11px] font-mono text-red-600 mt-1">
                  {errors.expiryMinutes}
                </p>
              )}
            </div>
          </div>

          {/* Dynamic Vehicle Match Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-800">
              <Car className="w-4 h-4 text-emerald-700" />
              <span>Recommended Vehicle:</span>
              <strong className="text-emerald-800">{vDetails.label}</strong>
            </div>
            <span className="text-slate-500 text-[11px]">{vDetails.description}</span>
          </div>

          {/* Dock Instructions Override */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Loading Dock Instructions for Driver
            </label>
            <input
              type="text"
              value={dockNotes}
              onChange={(e) => setDockNotes(e.target.value)}
              placeholder="e.g. Ring buzzer at service gate; ask for shift supervisor."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Modal Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-xs font-mono font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md text-xs font-mono font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-colors"
            >
              Publish Surplus Alert &amp; Dispatch Fleet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
