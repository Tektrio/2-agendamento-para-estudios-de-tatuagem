import { cn } from "@/lib/utils";

interface TimeSlotProps {
  time: string;
  isAvailable: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export function TimeSlot({
  time,
  isAvailable,
  isSelected = false,
  onClick,
}: TimeSlotProps) {
  // Generate class names based on availability and selection state
  const slotClass = cn(
    "time-slot py-3 px-4 rounded-md border transition-all text-center text-sm",
    {
      "opacity-50 cursor-not-allowed border-gray-700": !isAvailable,
      "cursor-pointer hover:border-primary hover:bg-primary hover:bg-opacity-20 border-gray-700": isAvailable && !isSelected,
      "bg-primary bg-opacity-20 border-primary font-medium": isSelected,
    }
  );
  
  return (
    <div 
      className={slotClass}
      onClick={isAvailable ? onClick : undefined}
    >
      {time}
    </div>
  );
}
