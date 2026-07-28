import { NextResponse } from "next/server";

/**
 * Utility to parse time strings like "10:00 AM" or "22:00" into minutes since midnight
 */
function parseTimeToMinutes(timeStr: string): number {
  const normalized = timeStr.trim().toUpperCase();
  
  // Handle 12-hour format like "10:00 AM" or "10:00 PM"
  const match12 = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1]);
    const mins = parseInt(match12[2]);
    const period = match12[3];
    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours !== 12) hours += 12;
    return hours * 60 + mins;
  }
  
  // Handle 24-hour format like "22:00"
  const match24 = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return parseInt(match24[1]) * 60 + parseInt(match24[2]);
  }
  
  return -1;
}

export function checkRestaurantOpen(settings: {
  openingTime: string;
  closingTime: string;
  isAcceptingOrders: boolean;
  holidayMode: boolean;
}): { isOpen: boolean; reason: string } {
  if (settings.holidayMode) {
    return { isOpen: false, reason: "Holiday / Closed today" };
  }
  if (!settings.isAcceptingOrders) {
    return { isOpen: false, reason: `Not accepting orders (Opens ${settings.openingTime})` };
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(settings.openingTime);
  const closeMinutes = parseTimeToMinutes(settings.closingTime);

  if (openMinutes === -1 || closeMinutes === -1) {
    // Can't parse time, allow orders
    return { isOpen: true, reason: "" };
  }

  if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
    return { isOpen: true, reason: "" };
  }

  // Closed
  const opens = nowMinutes < openMinutes ? settings.openingTime : `tomorrow at ${settings.openingTime}`;
  return { isOpen: false, reason: `Closed — Opens ${opens}` };
}
