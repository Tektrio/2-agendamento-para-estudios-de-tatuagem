import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isToday, isSameDay, addWeeks, subWeeks } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { TimeSlot, getAvailableTimeSlots } from "@/lib/google-calendar";
import { cn } from "@/lib/utils";

interface CalendarScheduleProps {
  artistId: number;
  onSlotSelect: (slot: { startTime: Date; endTime: Date }) => void;
  className?: string;
}

export function CalendarSchedule({ 
  artistId, 
  onSlotSelect, 
  className 
}: CalendarScheduleProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function fetchTimeSlots() {
      setLoading(true);
      try {
        const slots = await getAvailableTimeSlots(artistId, selectedDate);
        setTimeSlots(slots);
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast({
          title: "Failed to load schedule",
          description: "Could not fetch available time slots. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchTimeSlots();
  }, [artistId, selectedDate, toast]);
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };
  
  const nextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };
  
  const prevWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };
  
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));
  
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    
    onSlotSelect({
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "MMMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border border-gray-800 rounded-md overflow-hidden">
        <div className="grid grid-cols-7 text-center">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                "py-2 font-medium border-b border-gray-800",
                isToday(day) && "bg-primary bg-opacity-10"
              )}
            >
              <p className="text-xs text-gray-400">
                {format(day, "EEE")}
              </p>
              <p className={isSameDay(day, selectedDate) ? "text-primary" : ""}>
                {format(day, "d")}
              </p>
            </div>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="p-4 space-y-2">
            <h3 className="font-medium mb-2">
              Available Times - {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {timeSlots.length === 0 ? (
                <p className="col-span-full text-center text-gray-400 py-4">
                  No available time slots
                </p>
              ) : (
                timeSlots.map((slot, i) => (
                  <Button
                    key={i}
                    variant={slot.isAvailable ? "outline" : "ghost"}
                    size="sm"
                    className={cn(
                      "text-xs py-1 px-2",
                      slot.isAvailable
                        ? "hover:bg-primary hover:text-primary-foreground cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!slot.isAvailable}
                    onClick={() => handleTimeSlotSelect(slot)}
                  >
                    {format(slot.startTime, "h:mm a")}
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}