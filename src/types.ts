export type FoodType = 'prepared_meals' | 'dairy_chilled' | 'fresh_produce' | 'bakery_dry';

export type StorageRequirement = 'hot_holding' | 'chilled' | 'frozen' | 'ambient';

export type VehicleType = 'compact_sedan' | 'hatchback_midsize' | 'suv_van' | 'truck_insulated';

export type RescueStatus = 'pending_dispatch' | 'claimed' | 'picked_up' | 'completed' | 'expired';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface DonorLocation {
  id: string;
  name: string;
  type: 'supermarket' | 'dining_hall' | 'bakery' | 'caterer' | 'farm_market';
  address: string;
  city: string;
  coordinates: LocationCoordinates;
  contactName: string;
  contactPhone: string;
  dockInstructions: string;
}

export interface PantryLocation {
  id: string;
  name: string;
  type: 'student_pantry' | 'community_fridge' | 'shelter' | 'youth_center';
  address: string;
  city: string;
  coordinates: LocationCoordinates;
  contactName: string;
  contactPhone: string;
  operatingHours: string;
  urgencyNote?: string;
}

export interface VolunteerDriver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: VehicleType;
  licensePlate: string;
  hasCoolerBags: boolean;
  totalRescuesCompleted: number;
  totalLbsTransported: number;
}

export interface RescueRun {
  id: string;
  runNumber: string;
  donor: DonorLocation;
  pantry: PantryLocation;
  foodType: FoodType;
  title: string;
  description: string;
  estimatedWeightLbs: number;
  actualWeightLbs?: number;
  boxCount: number;
  storageRequirement: StorageRequirement;
  recommendedVehicle: VehicleType;
  status: RescueStatus;
  createdAt: string; // ISO string
  expiresAt: string; // ISO string
  claimedBy?: {
    driverId: string;
    driverName: string;
    driverPhone: string;
    vehicle: VehicleType;
    claimedAt: string;
  };
  pickupConfirmedAt?: string;
  pickupTemperatureF?: number;
  completedAt?: string;
  deliveryNotes?: string;
  notes?: string;
  signatureName?: string;
  receiptHash?: string;
}

export interface RouteStop {
  id: string;
  type: 'pickup' | 'dropoff';
  runId: string;
  runNumber: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
  cargoDescription: string;
  weightLbs: number;
  estimatedArrivalMin: number;
  urgencyLevel: 'critical' | 'warning' | 'normal';
  instructions: string;
  phone: string;
  isCompleted: boolean;
}

export interface OptimizedRoutePlan {
  id: string;
  stops: RouteStop[];
  totalDistanceMiles: number;
  estimatedDurationMins: number;
  totalLbs: number;
  totalStops: number;
  fuelSavedGallons: number;
  co2DivertedLbs: number;
  calculatedAt: string;
}
