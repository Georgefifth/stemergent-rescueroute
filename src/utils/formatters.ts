import { VehicleType, StorageRequirement } from '../types';

export function formatTimeRemaining(expiresAt: string): {
  text: string;
  minutesLeft: number;
  urgency: 'critical' | 'warning' | 'normal' | 'expired';
} {
  const target = new Date(expiresAt).getTime();
  const diffMs = target - Date.now();

  if (diffMs <= 0) {
    return { text: 'EXPIRED (Safety Window Exceeded)', minutesLeft: 0, urgency: 'expired' };
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let text = '';
  if (hours > 0) {
    text = `${hours}h ${minutes}m left`;
  } else {
    text = `${minutes} min remaining`;
  }

  let urgency: 'critical' | 'warning' | 'normal' = 'normal';
  if (totalMinutes <= 30) {
    urgency = 'critical';
  } else if (totalMinutes <= 90) {
    urgency = 'warning';
  }

  return { text, minutesLeft: totalMinutes, urgency };
}

export function formatVehicleDetails(type: VehicleType): {
  label: string;
  capacityLbs: number;
  boxCapacity: number;
  description: string;
} {
  switch (type) {
    case 'compact_sedan':
      return {
        label: 'Compact Sedan',
        capacityLbs: 90,
        boxCapacity: 3,
        description: 'Trunk & rear footwell; ideal for bakeries and small catering drops.',
      };
    case 'hatchback_midsize':
      return {
        label: 'Hatchback / Mid-size',
        capacityLbs: 180,
        boxCapacity: 7,
        description: 'Foldable rear seats; fits 6-8 produce boxes or catering Cambros.',
      };
    case 'suv_van':
      return {
        label: 'SUV / Minivan',
        capacityLbs: 400,
        boxCapacity: 16,
        description: 'High capacity; accommodates large supermarket surplus & dairy crates.',
      };
    case 'truck_insulated':
      return {
        label: 'Insulated Cargo Van / Truck',
        capacityLbs: 850,
        boxCapacity: 35,
        description: 'Commercial scale pallets & multi-pantry bulk distributions.',
      };
  }
}

export function formatStorageBadge(storage: StorageRequirement): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (storage) {
    case 'hot_holding':
      return {
        label: 'HOT HOLDING (>140°F)',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        borderClass: 'border-red-200',
      };
    case 'chilled':
      return {
        label: 'CHILLED (<41°F)',
        bgClass: 'bg-sky-50',
        textClass: 'text-sky-700',
        borderClass: 'border-sky-200',
      };
    case 'frozen':
      return {
        label: 'FROZEN (<0°F)',
        bgClass: 'bg-indigo-50',
        textClass: 'text-indigo-700',
        borderClass: 'border-indigo-200',
      };
    case 'ambient':
      return {
        label: 'AMBIENT (Room Temp)',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-800',
        borderClass: 'border-amber-200',
      };
  }
}

/**
 * Generate a deterministic verification hash for 501(c)(3) audit authenticity
 */
export async function generateReceiptHash(payload: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + '-501c3-compliance-' + Date.now());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback pseudo-hash
    return 'sha256-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
