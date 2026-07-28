// Default restaurant coordinates — used only as fallback if settings can't be fetched
const DEFAULT_RESTAURANT_LAT = 22.6378;
const DEFAULT_RESTAURANT_LNG = 75.8073;
const DEFAULT_DELIVERY_RADIUS_KM = 4;
const DEFAULT_BASE_DELIVERY_CHARGE = 20;
const DEFAULT_DISTANCE_SLABS = [
  { maxKm: 2, charge: 20 },
  { maxKm: 4, charge: 40 },
];

// Haversine formula to calculate straight-line distance between two coordinates in km
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function checkDeliveryAvailability(
  distanceKm: number,
  deliveryRadiusKm: number = DEFAULT_DELIVERY_RADIUS_KM
): boolean {
  return distanceKm <= deliveryRadiusKm;
}

export function calculateDeliveryCharge(
  distanceKm: number,
  deliveryRadiusKm: number = DEFAULT_DELIVERY_RADIUS_KM,
  distanceSlabs: { maxKm: number; charge: number }[] = DEFAULT_DISTANCE_SLABS,
  baseDeliveryCharge: number = DEFAULT_BASE_DELIVERY_CHARGE
): number {
  if (!checkDeliveryAvailability(distanceKm, deliveryRadiusKm)) {
    return -1; // -1 = out of range
  }

  const applicableSlab = [...distanceSlabs]
    .sort((a, b) => a.maxKm - b.maxKm)
    .find((slab) => distanceKm <= slab.maxKm);

  return applicableSlab ? applicableSlab.charge : baseDeliveryCharge;
}

export function getRestaurantCoordinates(settings?: {
  latitude?: number;
  longitude?: number;
}): { lat: number; lng: number } {
  return {
    lat: settings?.latitude ?? DEFAULT_RESTAURANT_LAT,
    lng: settings?.longitude ?? DEFAULT_RESTAURANT_LNG,
  };
}

// Reverse geocode using Google Maps Geocoding API
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.results?.length > 0) {
      return data.results[0].formatted_address;
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
