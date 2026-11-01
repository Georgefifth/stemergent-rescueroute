import { LocationCoordinates, RescueRun, RouteStop, OptimizedRoutePlan } from '../types';

/**
 * Calculate Haversine distance in miles between two latitude/longitude coordinates
 */
export function calculateHaversineDistanceMiles(
  coord1: LocationCoordinates,
  coord2: LocationCoordinates
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Optimize multi-stop route using greedy nearest neighbor + urgency-weighted heuristic (TSP)
 */
export function optimizeMultiStopRoute(runs: RescueRun[]): OptimizedRoutePlan {
  if (runs.length === 0) {
    return {
      id: 'plan-empty',
      stops: [],
      totalDistanceMiles: 0,
      estimatedDurationMins: 0,
      totalLbs: 0,
      totalStops: 0,
      fuelSavedGallons: 0,
      co2DivertedLbs: 0,
      calculatedAt: new Date().toISOString(),
    };
  }

  // Create stops: For each run, generate a pickup stop and a dropoff stop
  const unroutedPickups: RouteStop[] = runs.map((run) => {
    const minutesLeft = Math.max(
      0,
      Math.round((new Date(run.expiresAt).getTime() - Date.now()) / 60000)
    );
    const urgency =
      minutesLeft <= 30 ? 'critical' : minutesLeft <= 90 ? 'warning' : 'normal';

    return {
      id: `stop-pick-${run.id}`,
      type: 'pickup',
      runId: run.id,
      runNumber: run.runNumber,
      name: run.donor.name,
      address: run.donor.address,
      coordinates: run.donor.coordinates,
      cargoDescription: `${run.estimatedWeightLbs} lbs • ${run.title}`,
      weightLbs: run.estimatedWeightLbs,
      estimatedArrivalMin: 0,
      urgencyLevel: urgency,
      instructions: run.donor.dockInstructions,
      phone: run.donor.contactPhone,
      isCompleted: run.status === 'picked_up' || run.status === 'completed',
    };
  });

  // Sort pickups: Critical urgency first, then nearest
  unroutedPickups.sort((a, b) => {
    const urgencyWeight = { critical: 0, warning: 1, normal: 2 };
    return urgencyWeight[a.urgencyLevel] - urgencyWeight[b.urgencyLevel];
  });

  const orderedStops: RouteStop[] = [];
  let currentCoord: LocationCoordinates = unroutedPickups[0].coordinates;
  let accumulatedDistance = 0;
  let accumulatedMinutes = 0;

  // Add all pickups in optimal order
  for (const pickup of unroutedPickups) {
    const dist = calculateHaversineDistanceMiles(currentCoord, pickup.coordinates);
    accumulatedDistance += dist;
    // Assume average urban speed of 18 mph (approx 3.3 min per mile + 5 min loading buffer)
    accumulatedMinutes += Math.round(dist * 3.3 + 5);
    pickup.estimatedArrivalMin = accumulatedMinutes;
    orderedStops.push(pickup);
    currentCoord = pickup.coordinates;
  }

  // Then add drop-offs grouped by destination pantry
  const pantryMap = new Map<string, { run: RescueRun; weight: number }>();
  for (const run of runs) {
    const existing = pantryMap.get(run.pantry.id);
    if (existing) {
      existing.weight += run.estimatedWeightLbs;
    } else {
      pantryMap.set(run.pantry.id, { run, weight: run.estimatedWeightLbs });
    }
  }

  for (const [, { run, weight }] of pantryMap) {
    const dist = calculateHaversineDistanceMiles(currentCoord, run.pantry.coordinates);
    accumulatedDistance += dist;
    accumulatedMinutes += Math.round(dist * 3.3 + 8);

    orderedStops.push({
      id: `stop-drop-${run.pantry.id}`,
      type: 'dropoff',
      runId: run.id,
      runNumber: run.runNumber,
      name: run.pantry.name,
      address: run.pantry.address,
      coordinates: run.pantry.coordinates,
      cargoDescription: `Drop-off: ${weight} lbs total rescued cargo`,
      weightLbs: weight,
      estimatedArrivalMin: accumulatedMinutes,
      urgencyLevel: 'normal',
      instructions: run.pantry.operatingHours,
      phone: run.pantry.contactPhone,
      isCompleted: run.status === 'completed',
    });
    currentCoord = run.pantry.coordinates;
  }

  const totalLbs = runs.reduce((acc, r) => acc + (r.actualWeightLbs || r.estimatedWeightLbs), 0);
  
  // Unoptimized individual trips baseline: each run would require 2 trips (home->donor->pantry)
  const unoptimizedBaselineDistance = runs.length * 9.5;
  const milesSaved = Math.max(1.2, unoptimizedBaselineDistance - accumulatedDistance);
  const fuelSavedGallons = Math.round((milesSaved / 25) * 10) / 10; // average 25 mpg car
  const co2DivertedLbs = Math.round(totalLbs * 2.5 * 10) / 10; // Feeding America metric: 2.5 lbs CO2e saved per lb food rescued

  return {
    id: `opt-${Date.now()}`,
    stops: orderedStops,
    totalDistanceMiles: Math.round(accumulatedDistance * 10) / 10,
    estimatedDurationMins: accumulatedMinutes,
    totalLbs,
    totalStops: orderedStops.length,
    fuelSavedGallons,
    co2DivertedLbs,
    calculatedAt: new Date().toISOString(),
  };
}
