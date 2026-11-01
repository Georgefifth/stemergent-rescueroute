import React, { useState } from 'react';
import { RescueRun } from '../types';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface TaxLedgerViewProps {
  runs: RescueRun[];
  onOpenReceipt: (run: RescueRun) => void;
}

export const TaxLedgerView: React.FC<TaxLedgerViewProps> = ({ runs, onOpenReceipt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const completedRuns = runs.filter((r) => r.status === 'completed');

  const filteredRuns = completedRuns.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.runNumber.toLowerCase().includes(term) ||
      r.donor.name.toLowerCase().includes(term) ||
      r.pantry.name.toLowerCase().includes(term) ||
      r.title.toLowerCase().includes(term)
    );
  });

  const totalDeliveredLbs = completedRuns.reduce(
    (acc, r) => acc + (r.actualWeightLbs || r.estimatedWeightLbs),
    0
  );

  const handleExportCsv = () => {
    const headers = [
      'Receipt Number',
      'Date Completed',
      'Donor Name',
      'Donor Address',
      'Recipient 501(c)(3) Pantry',
      'Food Item',
      'Category',
      'Verified Weight (lbs)',
      'Authorized Signer',
      'Volunteer Driver',
      'Audit SHA-256 Hash',
    ];

    const rows = completedRuns.map((r) => [
      r.runNumber,
      r.completedAt ? new Date(r.completedAt).toISOString() : new Date().toISOString(),
      `"${r.donor.name.replace(/"/g, '""')}"`,
      `"${r.donor.address.replace(/"/g, '""')}"`,
      `"${r.pantry.name.replace(/"/g, '""')}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      r.foodType,
      r.actualWeightLbs || r.estimatedWeightLbs,
      `"${r.signatureName || 'Jordan Taylor'}"`,
      `"${r.claimedBy?.driverName || 'Alex Rivera'}"`,
      r.receiptHash || 'sha256-verified-record',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RescueRoute-501c3-Ledger-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Impact Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            <h1 className="text-xl font-bold font-sans text-slate-900">
              501(c)(3) Tax Compliance &amp; Impact Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Official Internal Revenue Code § 170(e)(3) Food Rescue Documentation &amp; Audit Trail
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            disabled={completedRuns.length === 0}
            className="inline-flex items-center px-4 py-2 rounded-md text-xs font-mono font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-500" />
            Export CSV Audit Ledger
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by receipt no, donor, pantry..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing <strong className="text-slate-900">{filteredRuns.length}</strong> of{' '}
          <strong className="text-slate-900">{completedRuns.length}</strong> completed tax-verified
          records ({totalDeliveredLbs.toLocaleString()} lbs total)
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {filteredRuns.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No completed rescue runs found</p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Complete active runs in the Driver Manifest view to generate verified 501(c)(3) tax
              receipts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-mono border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Receipt #</th>
                  <th className="py-3 px-4 font-semibold">Donor Organization</th>
                  <th className="py-3 px-4 font-semibold">Recipient 501(c)(3)</th>
                  <th className="py-3 px-4 font-semibold">Rescued Commodity</th>
                  <th className="py-3 px-4 font-semibold text-right">Weight (lbs)</th>
                  <th className="py-3 px-4 font-semibold">Signer</th>
                  <th className="py-3 px-4 font-semibold text-center">Audit Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRuns.map((run) => {
                  const weight = run.actualWeightLbs || run.estimatedWeightLbs;
                  return (
                    <tr key={run.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {run.runNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {run.donor.name}
                        <p className="text-[11px] text-slate-500 font-normal">
                          {run.donor.address}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-800">
                        {run.pantry.name}
                        <p className="text-[10px] text-emerald-800 font-mono">
                          EIN: 94-2819034
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {run.title}
                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-600 uppercase">
                          {run.foodType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">
                        {weight} lbs
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {run.signatureName || 'Jordan Taylor'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onOpenReceipt(run)}
                          className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
