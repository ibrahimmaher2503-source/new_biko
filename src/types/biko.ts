export type ServiceType = 'ride' | 'delivery';

export type OrderStatus =
  | 'bidding'
  | 'driver_assigned'
  | 'on_the_way'
  | 'arrived_pickup'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface LocationSelection {
  displayAddress: string;
  name: string;
  latitude: number;
  longitude: number;
  area?: string;
}

export interface DeliveryDetails {
  recipientName: string;
  recipientPhone: string;
  parcelWeightKg: number;
  declaredValue: number;
  instructions?: string;
}

export interface RouteQuote {
  id: string;
  pickup: LocationSelection;
  destination: LocationSelection;
  distanceKm: number;
  durationMinutes: number;
  suggestedPrice: number;
  minimumCustomerPrice: number;
}

export interface DriverOffer {
  id: string;
  price: number;
  driverPublicId: string;
  driverFirstName: string;
  driverPhotoUrl?: string;
  driverType: 'independent' | 'office';
  officeDisplayName?: string;
  completedTripCount: number;
  rating: number;
  motorcycleBrand: string;
  motorcycleModel: string;
  motorcyclePlateNumber: string;
  distanceMinutes: number;
}

export interface CustomerOrder {
  id: string;
  service: ServiceType;
  pickup: LocationSelection;
  destination: LocationSelection;
  proposedPrice: number;
  agreedPrice?: number;
  driver?: DriverOffer;
  status: OrderStatus;
  createdAt: string;
  biddingExpiresAt: string;
  delivery?: DeliveryDetails;
  deliveryCode?: string;
  distanceKm: number;
  durationMinutes: number;
  cancellationReason?: string;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  walletBalance?: number;
  rating: number;
  totalTrips: number;
}
