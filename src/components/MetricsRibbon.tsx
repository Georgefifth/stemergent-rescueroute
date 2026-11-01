import React from 'react';
import { Scale, Utensils, Leaf, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MetricsRibbonProps {
  totalLbs: number;
  totalMeals: number;
  totalCo2Lbs: number;
  criticalCount: number;
  completedRunsCount: number;
}

export const MetricsRibbon: React.FC<MetricsRibbonProps> = ({
  totalLbs,
  totalMeals,
  totalCo2Lbs,
  criticalCount,
  completedRunsCount,
}) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Rescued Poundage Metric */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-800">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                Food Rescued
              </p>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                  {totalLbs.toLocaleString()}
                </span>
                <span className="text-xs text-slate-600 font-mono font-medium">lbs</span>
              </div>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                From {completedRunsCount} verified runs
              </p>
            </div>
          </div>

          {/* Meals Provided Metric (Feeding America Formula) */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="p-2 rounded-md bg-sky-100 text-sky-800">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                Meals Provided
              </p>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                  {Math.round(totalMeals).toLocaleString()}
                </span>
                <span className="text-xs text-slate-600 font-mono font-medium">meals</span>
              </div>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                Feeding America standard (1.2 lbs/meal)
              </p>
            </div>
          </div>

          {/* Carbon Emissions Averted */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="p-2 rounded-md bg-amber-100 text-amber-800">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                CO₂e Diverted
              </p>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                  {Math.round(totalCo2Lbs).toLocaleString()}
                </span>
                <span className="text-xs text-slate-600 font-mono font-medium">lbs</span>
              </div>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                Prevented landfill methane emissions
              </p>
            </div>
          </div>

          {/* Cold-Chain Urgency Monitor */}
          <div
            className={`p-3 rounded-lg border flex items-start space-x-3 transition-colors ${
              criticalCount > 0
                ? 'bg-red-50/80 border-red-200'
                : 'bg-emerald-50/50 border-emerald-200'
            }`}
          >
            <div
              className={`p-2 rounded-md ${
                criticalCount > 0
                  ? 'bg-red-100 text-red-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {criticalCount > 0 ? (
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                Cold-Chain Health
              </p>
              <div className="flex items-baseline space-x-1">
                <span
                  className={`text-xl sm:text-2xl font-bold font-mono ${
                    criticalCount > 0 ? 'text-red-700' : 'text-emerald-800'
                  }`}
                >
                  {criticalCount > 0 ? `${criticalCount} Urgencies` : '100% Safe'}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                {criticalCount > 0
                  ? 'Urgent driver pickup required < 30m'
                  : 'All runs within safe temperature limit'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
