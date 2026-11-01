import React, { useState } from 'react';
import { RescueRun, RouteStop } from '../types';
import { Navigation, Info } from 'lucide-react';

interface InteractiveMapProps {
  runs: RescueRun[];
  activeRouteStops?: RouteStop[];
  onSelectRun: (run: RescueRun) => void;
  selectedRunId?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  runs,
  activeRouteStops = [],
  onSelectRun,
  selectedRunId,
}) => {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  // Map coordinate boundary box normalized to SVG viewport 800 x 480
  // San Francisco / Metro coordinates range:
  // Lat: 37.765 to 37.795
  // Lng: -122.435 to -122.400
  const minLat = 37.765;
  const maxLat = 37.795;
  const minLng = -122.435;
  const maxLng = -122.400;

  const projectToSvg = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    // Invert Y because SVG coordinates increase downwards
    const y = ((maxLat - lat) / (maxLat - minLat)) * 400 + 40;
    return { x: Math.max(40, Math.min(760, x)), y: Math.max(40, Math.min(440, y)) };
  };

  // Compile unique Donors & Pantries from runs
  const donors = Array.from(new Map(runs.map((r) => [r.donor.id, r.donor])).values());
  const pantries = Array.from(new Map(runs.map((r) => [r.pantry.id, r.pantry])).values());

  // Generate path string for activeRouteStops
  const routePoints = activeRouteStops.map((stop) =>
    projectToSvg(stop.coordinates.lat, stop.coordinates.lng)
  );

  const routePathD = routePoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      {/* Map Header */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide">
            Metro Community Corridor Dispatch Radar
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({donors.length} Donors • {pantries.length} Pantries)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block border border-amber-300"></span>
            <span className="text-slate-300">Surplus Donor</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-emerald-600 inline-block border border-emerald-400"></span>
            <span className="text-slate-300">Community Pantry</span>
          </div>
          {activeRouteStops.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-0.5 bg-emerald-400 border-t-2 border-dashed border-emerald-400 inline-block"></span>
              <span className="text-emerald-400 font-bold">Optimized Sequence</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas Map Area */}
      <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-950 overflow-hidden select-none">
        <svg
          viewBox="0 0 800 480"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Grid Pattern for Industrial Logistics Look */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </pattern>
            {/* Pulsing Marker Animation */}
            <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="800" height="480" fill="#090d16" />
          <rect width="800" height="480" fill="url(#grid)" />

          {/* Simulated Geographic Arteries / Highway Lines */}
          <g stroke="#1e293b" strokeWidth="3" opacity="0.6">
            <path d="M 50 180 Q 300 240 750 200" fill="none" />
            <path d="M 180 30 Q 220 250 260 450" fill="none" />
            <path d="M 520 20 Q 500 240 560 460" fill="none" />
            <path d="M 100 380 Q 400 320 720 390" fill="none" />
          </g>

          {/* Render Active Route Path */}
          {activeRouteStops.length > 1 && (
            <g>
              <path
                d={routePathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-[dash_20s_linear_infinite]"
              />
              <path
                d={routePathD}
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                opacity="0.9"
              />
            </g>
          )}

          {/* Render Connections Between Active Unassigned Runs */}
          {activeRouteStops.length === 0 &&
            runs
              .filter((r) => r.status === 'pending_dispatch' || r.status === 'claimed')
              .map((run) => {
                const donorPt = projectToSvg(run.donor.coordinates.lat, run.donor.coordinates.lng);
                const pantryPt = projectToSvg(
                  run.pantry.coordinates.lat,
                  run.pantry.coordinates.lng
                );
                const isSelected = selectedRunId === run.id;

                return (
                  <line
                    key={`conn-${run.id}`}
                    x1={donorPt.x}
                    y1={donorPt.y}
                    x2={pantryPt.x}
                    y2={pantryPt.y}
                    stroke={isSelected ? '#10b981' : '#334155'}
                    strokeWidth={isSelected ? '2.5' : '1'}
                    strokeDasharray={isSelected ? '5 3' : '2 4'}
                    opacity={isSelected ? 0.9 : 0.4}
                  />
                );
              })}

          {/* Render Pantries (Destination Squares) */}
          {pantries.map((pantry) => {
            const pt = projectToSvg(pantry.coordinates.lat, pantry.coordinates.lng);
            const isHovered = hoveredLocation === pantry.id;

            return (
              <g
                key={`pantry-marker-${pantry.id}`}
                transform={`translate(${pt.x}, ${pt.y})`}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => setHoveredLocation(pantry.id)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                {/* Visual Anchor */}
                <rect
                  x="-12"
                  y="-12"
                  width="24"
                  height="24"
                  rx="6"
                  fill="#065f46"
                  stroke="#34d399"
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  P
                </text>

                {/* Label Tag */}
                <g transform="translate(16, -14)">
                  <rect
                    x="0"
                    y="0"
                    width={pantry.name.length * 5.8 + 12}
                    height="18"
                    rx="3"
                    fill="#0f172a"
                    stroke="#1e293b"
                    strokeWidth="1"
                    opacity={isHovered ? 1 : 0.8}
                  />
                  <text
                    x="6"
                    y="13"
                    fill="#a7f3d0"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {pantry.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render Donors (Pickup Circles) */}
          {donors.map((donor) => {
            const pt = projectToSvg(donor.coordinates.lat, donor.coordinates.lng);
            const associatedRuns = runs.filter((r) => r.donor.id === donor.id);
            const hasCritical = associatedRuns.some(
              (r) =>
                r.status === 'pending_dispatch' &&
                (new Date(r.expiresAt).getTime() - Date.now()) / 60000 <= 30
            );
            const isHovered = hoveredLocation === donor.id;

            return (
              <g
                key={`donor-marker-${donor.id}`}
                transform={`translate(${pt.x}, ${pt.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredLocation(donor.id)}
                onMouseLeave={() => setHoveredLocation(null)}
                onClick={() => {
                  if (associatedRuns.length > 0) {
                    onSelectRun(associatedRuns[0]);
                  }
                }}
              >
                {/* Warning Glow for Critical Perishables */}
                {hasCritical && (
                  <circle
                    r="20"
                    fill="#ef4444"
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                <circle
                  r="11"
                  fill={hasCritical ? '#b91c1c' : '#d97706'}
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  D
                </text>

                {/* Donor Label */}
                <g transform="translate(15, -14)">
                  <rect
                    x="0"
                    y="0"
                    width={donor.name.length * 5.6 + 12}
                    height="18"
                    rx="3"
                    fill="#0f172a"
                    stroke={hasCritical ? '#ef4444' : '#334155'}
                    strokeWidth="1"
                    opacity={isHovered ? 1 : 0.85}
                  />
                  <text
                    x="6"
                    y="13"
                    fill={hasCritical ? '#fca5a5' : '#fde68a'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {donor.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render Route Stop Order Numbers if route active */}
          {activeRouteStops.map((stop, index) => {
            const pt = projectToSvg(stop.coordinates.lat, stop.coordinates.lng);
            return (
              <g key={`route-seq-${stop.id}`} transform={`translate(${pt.x}, ${pt.y - 24})`}>
                <circle r="9" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {index + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Quick Helper Overlay */}
        <div className="absolute bottom-2 left-2 bg-slate-900/90 text-slate-300 text-[11px] font-mono px-2.5 py-1 rounded border border-slate-700/80 backdrop-blur-sm pointer-events-none flex items-center space-x-2">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click any donor node (D) to inspect active food rescue run &amp; dock notes.</span>
        </div>
      </div>
    </div>
  );
};
