/**
 * Site configuration - static constants for layout components.
 * For live updates (open/close, delivery radius), use /api/restaurant/settings.
 * This file is intentionally kept as a static source of truth so the UI
 * renders correctly even before the DB is reached.
 */
export const siteConfig = {
  name: "Pushya Pizza & Sandwich Planet",
  shortName: "Pushya Planet",
  slogan: "Taste Jo Dil Ko Bhaye",
  phone: "9098382993",
  secondaryPhone: "9111221940",
  whatsapp: "9098382993",
  address: "Shri Krishna Paradise, Near, Rau Cir, Rau, Indore",
  latitude: 22.6378,
  longitude: 75.8073,
  mapLink: "https://maps.google.com/?q=Pushya+Pizza+and+Sandwich+Planet+Rau",
  openingTime: "08:00 AM",
  closingTime: "10:00 PM",
  deliveryRadiusKm: 4,
  baseDeliveryCharge: 20,
  estimatedPrepTime: "25-30 mins",
};
