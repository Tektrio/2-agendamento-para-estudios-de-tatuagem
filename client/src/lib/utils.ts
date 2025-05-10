import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Price upon consultation";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status.toLowerCase()) {
    case "available":
      return { bg: "bg-success bg-opacity-10", text: "text-success" };
    case "limited":
      return { bg: "bg-warning bg-opacity-10", text: "text-warning" };
    case "unavailable":
    case "booked":
      return { bg: "bg-error bg-opacity-10", text: "text-error" };
    default:
      return { bg: "bg-gray-500 bg-opacity-10", text: "text-gray-500" };
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function generateTimeSlots(
  startHour: number = 9,
  endHour: number = 18,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  const totalMinutesInDay = (endHour - startHour) * 60;
  const totalSlots = totalMinutesInDay / intervalMinutes;

  for (let i = 0; i < totalSlots; i++) {
    const minutesSinceMidnight = startHour * 60 + i * intervalMinutes;
    const hours = Math.floor(minutesSinceMidnight / 60);
    const minutes = minutesSinceMidnight % 60;
    
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    
    slots.push(`${formattedHours}:${formattedMinutes} ${ampm}`);
  }

  return slots;
}

export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getTattooSizeDuration(size: string): number {
  switch (size.toLowerCase()) {
    case "small":
      return 120; // 2 hours
    case "medium":
      return 240; // 4 hours
    case "large":
      return 360; // 6 hours
    case "extra-large":
      return 480; // 8 hours
    default:
      return 120;
  }
}
