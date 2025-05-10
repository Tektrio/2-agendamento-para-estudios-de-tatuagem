import { cn } from "@/lib/utils";

interface CalendarDayProps {
  day: number;
  isCurrentMonth?: boolean;
  availability?: "available" | "limited" | "unavailable";
  isSelected?: boolean;
  onClick?: () => void;
}

export function CalendarDay({
  day,
  isCurrentMonth = true,
  availability = "unavailable",
  isSelected = false,
  onClick,
}: CalendarDayProps) {
  // Determine disabled state
  const isDisabled = !isCurrentMonth || availability === "unavailable";
  
  // Generate class names based on availability and selection state
  const dayClass = cn(
    "calendar-day h-12 flex items-center justify-center rounded-md text-sm transition-all",
    {
      "opacity-30 cursor-not-allowed": isDisabled,
      "cursor-pointer hover:bg-primary hover:bg-opacity-20": !isDisabled,
      "bg-primary bg-opacity-20 font-bold": isSelected,
      "border-b-2 border-success": availability === "available",
      "border-b-2 border-warning": availability === "limited",
    }
  );
  
  return (
    <div 
      className={dayClass}
      onClick={!isDisabled ? onClick : undefined}
    >
      {day}
    </div>
  );
}
