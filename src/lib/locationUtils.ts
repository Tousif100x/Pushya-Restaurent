import { restaurantDetails } from "@/data/menu";

// Haversine formula to calculate straight-line distance between two coordinates in km
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Number(distance.toFixed(2));
}

// Check if customer is within delivery radius
export function checkDeliveryAvailability(distanceKm: number): boolean {
  return distanceKm <= restaurantDetails.deliveryRadiusKm;
}

// Calculate delivery charge based on distance slabs
export function calculateDeliveryCharge(distanceKm: number): number {
  if (!checkDeliveryAvailability(distanceKm)) {
    return -1; // -1 signifies out of range
  }
  
  // Find the applicable slab
  const applicableSlab = restaurantDetails.distanceSlabs
    .sort((a, b) => a.maxKm - b.maxKm)
    .find(slab => distanceKm <= slab.maxKm);

  if (applicableSlab) {
    return applicableSlab.charge;
  }
  
  // Fallback to base charge if within radius but no specific slab matches
  return restaurantDetails.baseDeliveryCharge;
}

// Reverse geocode using Google Maps Geocoding API
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("Google Maps API Key is missing. Returning coordinates as fallback.");
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.error("Geocoding failed:", data.status);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
