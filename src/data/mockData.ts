import { LocationSelection, CustomerOrder, DriverOffer, CustomerProfile } from '../types/biko';

export const CAIRO_LOCATIONS: LocationSelection[] = [
  {
    name: 'ميدان التحرير',
    displayAddress: 'ميدان التحرير، وسط البلد، القاهرة',
    latitude: 30.0444,
    longitude: 31.2357,
    area: 'وسط البلد',
  },
  {
    name: 'سيتي ستارز مول',
    displayAddress: 'شارع عمر بن الخطاب، مدينة نصر، القاهرة',
    latitude: 30.0734,
    longitude: 31.3458,
    area: 'مدينة نصر',
  },
  {
    name: 'كايرو فيستيفال سيتي',
    displayAddress: 'الطريق الدائري، التجمع الخامس، القاهرة الجديدة',
    latitude: 30.0305,
    longitude: 31.4072,
    area: 'التجمع الخامس',
  },
  {
    name: 'كورنيش المعادي',
    displayAddress: 'شارع كورنيش النيل، المعادي، القاهرة',
    latitude: 29.9602,
    longitude: 31.2569,
    area: 'المعادي',
  },
  {
    name: 'ميدان مصطفى محمود',
    displayAddress: 'شارع جامعة الدول العربية، المهندسين، الجيزة',
    latitude: 30.0544,
    longitude: 31.2001,
    area: 'المهندسين',
  },
  {
    name: 'أوبرا مصر - الزمالك',
    displayAddress: 'الجزيرة، حي الزمالك، القاهرة',
    latitude: 30.0426,
    longitude: 31.2238,
    area: 'الزمالك',
  },
  {
    name: 'جامعة القاهرة',
    displayAddress: 'شارع جامعة القاهرة، الدقي، الجيزة',
    latitude: 30.0276,
    longitude: 31.2089,
    area: 'الدقي',
  },
  {
    name: 'مول مصر',
    displayAddress: 'طريق الواحات، مدينة 6 أكتوبر، الجيزة',
    latitude: 29.9723,
    longitude: 30.9781,
    area: '6 أكتوبر',
  },
];

export const MOCK_PROFILE: CustomerProfile = {
  id: 'usr_cairo_9823',
  fullName: 'إبراهيم ماهر',
  phone: '+20 101 234 5678',
  email: 'ibrahim.maher@biko.app',
  rating: 4.95,
  totalTrips: 34,
};

export const MOCK_DRIVERS: DriverOffer[] = [
  {
    id: 'off_01',
    driverPublicId: 'drv_901',
    driverFirstName: 'كابتن محمود رزق',
    driverType: 'independent',
    completedTripCount: 412,
    rating: 4.9,
    motorcycleBrand: 'بجاج',
    motorcycleModel: 'بوكسر 150',
    motorcyclePlateNumber: 'ق هـ ر 8421',
    price: 35,
    distanceMinutes: 2,
  },
  {
    id: 'off_02',
    driverPublicId: 'drv_902',
    driverFirstName: 'كابتن أحمد سامي',
    driverType: 'office',
    officeDisplayName: 'مكتب بيكو إكسبريس المعادي',
    completedTripCount: 680,
    rating: 4.95,
    motorcycleBrand: 'هوندا',
    motorcycleModel: 'وينج 200cc',
    motorcyclePlateNumber: 'س ن و 1934',
    price: 40,
    distanceMinutes: 4,
  },
  {
    id: 'off_03',
    driverPublicId: 'drv_903',
    driverFirstName: 'كابتن طارق عبد الفتاح',
    driverType: 'independent',
    completedTripCount: 185,
    rating: 4.8,
    motorcycleBrand: 'دايون',
    motorcycleModel: 'دايون 4 ماكس',
    motorcyclePlateNumber: 'ج ب ع 5512',
    price: 32,
    distanceMinutes: 6,
  },
  {
    id: 'off_04',
    driverPublicId: 'drv_904',
    driverFirstName: 'كابتن عمر جلال',
    driverType: 'office',
    officeDisplayName: 'فرسان التوصيل السريع',
    completedTripCount: 520,
    rating: 4.88,
    motorcycleBrand: 'بينيلي',
    motorcycleModel: 'TNT 150',
    motorcyclePlateNumber: 'ص ل م 6743',
    price: 45,
    distanceMinutes: 3,
  },
];

export const INITIAL_ORDER_HISTORY: CustomerOrder[] = [
  {
    id: 'ord_cairo_1092',
    service: 'ride',
    pickup: CAIRO_LOCATIONS[0], // التحرير
    destination: CAIRO_LOCATIONS[5], // الزمالك
    proposedPrice: 30,
    agreedPrice: 35,
    status: 'completed',
    createdAt: '2026-11-10T14:30:00Z',
    biddingExpiresAt: '2026-11-10T14:32:00Z',
    distanceKm: 4.2,
    durationMinutes: 12,
    driver: MOCK_DRIVERS[0],
  },
  {
    id: 'ord_cairo_1088',
    service: 'delivery',
    pickup: CAIRO_LOCATIONS[1], // سيتي ستارز
    destination: CAIRO_LOCATIONS[2], // التجمع الخامس
    proposedPrice: 50,
    agreedPrice: 55,
    status: 'completed',
    createdAt: '2026-11-08T18:15:00Z',
    biddingExpiresAt: '2026-11-08T18:17:00Z',
    distanceKm: 11.5,
    durationMinutes: 22,
    driver: MOCK_DRIVERS[1],
    delivery: {
      recipientName: 'كريم عبد العزيز',
      recipientPhone: '+20 112 998 7654',
      parcelWeightKg: 2.5,
      declaredValue: 450,
      instructions: 'تسليم عند البوابة رقم 3 للكمبوند',
    },
    deliveryCode: '7419',
  },
  {
    id: 'ord_cairo_1075',
    service: 'ride',
    pickup: CAIRO_LOCATIONS[4], // المهندسين
    destination: CAIRO_LOCATIONS[6], // الدقي
    proposedPrice: 25,
    status: 'cancelled',
    cancellationReason: 'تغيير في خطة المشوار',
    createdAt: '2026-11-05T09:20:00Z',
    biddingExpiresAt: '2026-11-05T09:22:00Z',
    distanceKm: 3.1,
    durationMinutes: 9,
  },
];

/**
 * Calculates suggested fare based on Biko rules:
 * Base Price (15 EGP) + 4 EGP per km
 * Minimum Customer Price starts at 70% of suggested price (inDrive style)
 */
export function calculateQuote(
  pickup: LocationSelection,
  destination: LocationSelection,
  service: 'ride' | 'delivery'
): { distanceKm: number; durationMinutes: number; suggestedPrice: number; minPrice: number } {
  // Approximate haversine distance
  const lat1 = pickup.latitude;
  const lon1 = pickup.longitude;
  const lat2 = destination.latitude;
  const lon2 = destination.longitude;

  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distanceKm = Math.round(R * c * 1.35 * 10) / 10; // 1.35 route factor
  if (distanceKm < 1.5) distanceKm = 1.8;

  const durationMinutes = Math.max(6, Math.round(distanceKm * 2.2));
  const baseFare = service === 'ride' ? 14 : 18;
  const ratePerKm = service === 'ride' ? 3.8 : 4.5;
  const suggestedPrice = Math.round(baseFare + distanceKm * ratePerKm);
  const minPrice = Math.round(suggestedPrice * 0.7);

  return {
    distanceKm,
    durationMinutes,
    suggestedPrice,
    minPrice,
  };
}
