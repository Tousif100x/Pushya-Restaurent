export function getRestaurantStatus() {
  const now = new Date();
  
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const timeInMinutes = currentHour * 60 + currentMinute;
  
  const openTime = 10 * 60; // 10:00 AM
  const closeTime = 23 * 60 + 30; // 11:30 PM

  const isOpen = timeInMinutes >= openTime && timeInMinutes < closeTime;
  
  if (isOpen) {
    return {
      isOpen: true,
      text: "Open Now",
      subtext: "Closes at 11:30 PM"
    };
  } else {
    return {
      isOpen: false,
      text: "Closed",
      subtext: "Opens tomorrow at 10:00 AM"
    };
  }
}
