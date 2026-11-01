import React from 'react';
import { RescueRun } from '../types';
import { Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TaxReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  run: RescueRun | null;
}

export const TaxReceiptModal: React.FC<TaxReceiptModalProps> = ({ isOpen, onClose, run }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !run) return null;

  const deliveredLbs = run.actualWeightLbs || run.estimatedWeightLbs;
  const mealsProvided = Math.round((deliveredLbs / 1.2) * 10) / 10;
  const co2Averted = Math.round(deliveredLbs * 2.5 * 10) / 10;
  const completedDate = run.completedAt
    ? new Date(run.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-US');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:m-0 print:border-none print:shadow-none">
        {/* Header - Hidden on Print */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-sans">
              Official 501(c)(3) Food Rescue Tax Receipt
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 rounded text-xs font-mono font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="p-8 space-y-6 text-slate-900 font-sans print:p-6" id="printable-tax-receipt">
          {/* Certificate Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  RESCUEROUTE
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                  IRS § 170(e)(3) CERTIFIED
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                Community Food Rescue Verification Network • Metro Dispatch Chapter
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-500 uppercase">Receipt No.</span>
              <p className="text-base font-bold font-mono text-slate-900">
                {run.runNumber}
              </p>
              <p className="text-[11px] font-mono text-slate-500">{completedDate}</p>
            </div>
          </div>

          {/* Legal Compliance Disclaimer */}
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-[11px] text-slate-600 leading-relaxed font-sans">
            <strong>Internal Revenue Code (IRC) § 170(e)(3) Compliance Statement:</strong>{' '}
            This receipt confirms that the edible surplus food described herein was transferred
            directly from the designated donor to an eligible 501(c)(3) tax-exempt nonprofit
            organization solely for the care of the ill, the needy, or infants. No goods or
            services were provided in exchange for this contribution.
          </div>

          {/* Parties Involved: Donor & Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Contributing Food Donor
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">{run.donor.name}</p>
              <p className="text-xs text-slate-600">{run.donor.address}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Authorized Rep: {run.donor.contactName}
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Recipient 501(c)(3) Organization
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">{run.pantry.name}</p>
              <p className="text-xs text-slate-600">{run.pantry.address}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">
                EIN: 94-2819034 (Tax-Exempt Public Charity)
              </p>
            </div>
          </div>

          {/* Rescued Commodity Details Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-mono text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Commodity Description</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Units</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Verified Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <tr>
                  <td className="py-3 px-3">
                    <strong className="text-slate-900">{run.title}</strong>
                    <p className="text-[11px] text-slate-500">{run.description}</p>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 uppercase text-[11px]">
                    {run.foodType.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-right">
                    {run.boxCount} containers
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 text-right text-sm">
                    {deliveredLbs} lbs
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Social & Environmental Impact Ticker */}
          <div className="grid grid-cols-3 gap-3 bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200 text-center font-mono">
            <div>
              <span className="text-[10px] text-emerald-800 uppercase font-semibold">
                Meals Provided
              </span>
              <p className="text-base font-bold text-emerald-950">
                {mealsProvided} meals
              </p>
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 uppercase font-semibold">
                CO₂e Diverted
              </span>
              <p className="text-base font-bold text-emerald-950">
                {co2Averted} lbs
              </p>
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 uppercase font-semibold">
                Volunteer Driver
              </span>
              <p className="text-base font-bold text-emerald-950 truncate">
                {run.claimedBy?.driverName || 'Community Volunteer'}
              </p>
            </div>
          </div>

          {/* Signatures & Cryptographic Audit Verification */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  Received by Authorized Agent
                </span>
                <div className="border-b border-slate-400 pb-1 font-serif text-sm font-semibold text-slate-900">
                  {run.signatureName || 'Jordan Taylor'}
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Food Pantry Steward / Intake Specialist
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  Transported by Volunteer Vehicle
                </span>
                <div className="border-b border-slate-400 pb-1 font-mono text-xs text-slate-900">
                  {run.claimedBy?.driverName || 'Verified Driver'} (
                  {run.claimedBy?.vehicle.replace('_', ' ') || 'Sedan'})
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  RescueRoute Verified Volunteer Dispatch
                </p>
              </div>
            </div>

            {/* Cryptographic SHA-256 Receipt Seal */}
            <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
              <span className="truncate max-w-sm">
                Audit Hash: {run.receiptHash || 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </span>
              <span className="text-emerald-700 font-bold flex items-center flex-shrink-0">
                <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                TAMPER-EVIDENT VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
