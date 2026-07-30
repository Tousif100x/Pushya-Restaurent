import { NextResponse } from "next/server";

/**
 * Utility to parse time strings like "10:00 AM", "12:00 AM", "11:59 PM" or "22:00" into minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  const normalized = timeStr.trim().toUpperCase();
  
  // Handle 12-hour format like "10:00 AM" or "10:00 PM"
  const match12 = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1]);
    const mins = parseInt(match12[2]);
    const period = match12[3];
    if (period === "AM" && hours === 12) hours = 0; // 12:00 AM = 00:00 midnight
    if (period === "PM" && hours !== 12) hours += 12; // 01:00 PM = 13:00, 12:00 PM = 12:00 noon
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
    return { isOpen: false, reason: `Not accepting orders right now` };
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(settings.openingTime);
  const closeMinutes = parseTimeToMinutes(settings.closingTime);

  if (openMinutes === -1 || closeMinutes === -1) {
    // If invalid format, fallback to open
    return { isOpen: true, reason: "" };
  }

  // Standard same-day hours (e.g. 08:00 AM to 11:00 PM)
  if (closeMinutes > openMinutes) {
    if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
      return { isOpen: true, reason: "" };
    }
  } else {
    // Overnight hours (e.g. 08:00 AM to 12:00 AM / 01:00 AM)
    if (nowMinutes >= openMinutes || nowMinutes < closeMinutes) {
      return { isOpen: true, reason: "" };
    }
  }

  // Closed
  const opens = nowMinutes < openMinutes ? settings.openingTime : `tomorrow at ${settings.openingTime}`;
  return { isOpen: false, reason: `Closed — Opens ${opens}` };
}
