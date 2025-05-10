import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAvailabilityForDateRange, getAvailableTimeSlots } from "@/lib/google-calendar";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { TimeSlot } from "@/components/ui/time-slot";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export interface Artist {
  id: number;
  fullName: string;
  specialty: string;
  profileImage: string;
}

export interface Schedule {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

interface BookingFormProps {
  artists: Artist[];
  initialArtistId?: number;
}

export function BookingForm({ artists, initialArtistId }: BookingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Booking form state
  const [currentStep, setCurrentStep] = useState(initialArtistId ? 2 : 1);
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(initialArtistId || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  
  // Fetch schedules for selected artist
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["/api/artists", selectedArtistId, "schedules"],
    queryFn: async () => {
      if (!selectedArtistId) return [];
      const res = await fetch(`/api/artists/${selectedArtistId}/schedules`);
      if (!res.ok) throw new Error("Failed to fetch schedules");
      return res.json();
    },
    enabled: !!selectedArtistId,
  });
  
  // Generate calendar availability data
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  
  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ["/api/availability", selectedArtistId, startOfMonth.toISOString(), endOfMonth.toISOString()],
    queryFn: () => {
      if (!selectedArtistId) return [];
      return getAvailabilityForDateRange(selectedArtistId, startOfMonth, endOfMonth);
    },
    enabled: !!selectedArtistId && currentStep >= 2,
  });
  
  // Get time slots for selected date
  const { data: timeSlots, isLoading: isLoadingTimeSlots } = useQuery({
    queryKey: ["/api/timeslots", selectedArtistId, selectedDate?.toISOString()],
    queryFn: () => {
      if (!selectedArtistId || !selectedDate) return [];
      return getAvailableTimeSlots(selectedArtistId, selectedDate);
    },
    enabled: !!selectedArtistId && !!selectedDate && currentStep >= 3,
  });
  
  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const res = await apiRequest("POST", "/api/appointments", appointmentData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment booked!",
        description: "Your tattoo appointment has been successfully scheduled.",
      });
      // Reset form or redirect
      setCurrentStep(6); // Success step
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSelectArtist = (artistId: number) => {
    setSelectedArtistId(artistId);
    setCurrentStep(2);
  };
  
  const handleSelectDate = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setCurrentStep(3);
  };
  
  const handleSelectTimeSlot = (time: string) => {
    setSelectedTimeSlot(time);
    setCurrentStep(4);
  };
  
  const handleScheduleSelect = (scheduleId: string) => {
    setSelectedScheduleId(parseInt(scheduleId));
    setCurrentStep(5);
  };
  
  const handleSubmitBooking = () => {
    if (!user || !selectedArtistId || !selectedDate || !selectedTimeSlot || !selectedScheduleId) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields to book your appointment.",
        variant: "destructive",
      });
      return;
    }
    
    // Parse time slot and create timestamps
    const [time, period] = selectedTimeSlot.split(" ");
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    // Convert to 24-hour format
    if (period === "PM" && hour < 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }
    
    // Set start and end times
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, minute, 0, 0);
    
    const selectedSchedule = schedules?.find((s: Schedule) => s.id === selectedScheduleId);
    const durationMinutes = selectedSchedule?.durationMinutes || 60;
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    
    // Create appointment
    createAppointmentMutation.mutate({
      userId: user.id,
      artistId: selectedArtistId,
      scheduleId: selectedScheduleId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: "scheduled",
      notes,
    });
  };
  
  const getStepContent = () => {
    switch (currentStep) {
      case 1: // Select Artist
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <div 
                key={artist.id}
                className="bg-gray-900 rounded-lg p-5 border border-gray-800 hover:border-primary cursor-pointer transition duration-200"
                onClick={() => handleSelectArtist(artist.id)}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img 
                      src={artist.profileImage} 
                      alt={artist.fullName} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="text-light font-medium">{artist.fullName}</h3>
                    <p className="text-secondary text-xs">{artist.specialty}</p>
                  </div>
                </div>
                <div className="mt-4 flex">
                  <Button 
                    className="w-full bg-primary hover:bg-opacity-90 text-light py-2 rounded text-sm transition duration-200"
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 2: // Choose Date
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            {isLoadingAvailability ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDate}
                className="mx-auto"
                disabled={[
                  { before: new Date() },
                  (date) => {
                    if (!availability) return false;
                    const dayAvailability = availability.find(
                      (day) => day.date.toDateString() === date.toDateString()
                    );
                    return dayAvailability?.status === "unavailable";
                  }
                ]}
              />
            )}
            
            <div className="mt-4 flex items-center text-xs">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 bg-success rounded-full mr-1"></div>
                <span className="text-gray-400">Available</span>
              </div>
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 bg-warning rounded-full mr-1"></div>
                <span className="text-gray-400">Limited</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 opacity-50 rounded-full mr-1"></div>
                <span className="text-gray-400">Unavailable</span>
              </div>
            </div>
          </div>
        );
        
      case 3: // Select Time
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-xl font-heading text-light mb-4">
              Select Time for {selectedDate ? formatDate(selectedDate) : ""}
            </h3>
            
            {isLoadingTimeSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots?.map((slot, index) => (
                  <TimeSlot
                    key={index}
                    time={formatTime(slot.startTime)}
                    isAvailable={slot.isAvailable}
                    isSelected={selectedTimeSlot === formatTime(slot.startTime)}
                    onClick={() => handleSelectTimeSlot(formatTime(slot.startTime))}
                  />
                ))}
              </div>
            )}
          </div>
        );
        
      case 4: // Select Service
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-xl font-heading text-light mb-4">
              Select Service
            </h3>
            
            {isLoadingSchedules ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {schedules?.map((schedule: Schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
                      selectedScheduleId === schedule.id
                        ? "border-primary bg-primary bg-opacity-10"
                        : "border-gray-700 hover:border-gray-500"
                    }`}
                    onClick={() => handleScheduleSelect(schedule.id.toString())}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-light">{schedule.name}</h4>
                      <span className="text-secondary">{formatCurrency(schedule.price)}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{schedule.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      Duration: {schedule.durationMinutes} minutes
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 5: // Your Details
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-xl font-heading text-light mb-4">
              Booking Details
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="text-gray-400 text-sm">Artist</div>
                <div className="text-light">
                  {artists.find(a => a.id === selectedArtistId)?.fullName}
                </div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="text-gray-400 text-sm">Date & Time</div>
                <div className="text-light">
                  {selectedDate && formatDate(selectedDate)}, {selectedTimeSlot}
                </div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="text-gray-400 text-sm">Service</div>
                <div className="text-light">
                  {schedules?.find((s: Schedule) => s.id === selectedScheduleId)?.name}
                </div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="text-gray-400 text-sm">Price</div>
                <div className="text-light">
                  {formatCurrency(schedules?.find((s: Schedule) => s.id === selectedScheduleId)?.price || 0)}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-light mb-2">
                Additional Notes
              </label>
              <Textarea
                id="notes"
                placeholder="Any specific details about your tattoo idea or special requirements..."
                className="w-full bg-gray-800 border border-gray-700 text-light"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        );
        
      case 6: // Confirmation
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 text-center">
            <div className="w-16 h-16 bg-success bg-opacity-20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-xl font-heading text-light mb-2">
              Booking Confirmed!
            </h3>
            
            <p className="text-gray-400 mb-6">
              Your appointment has been scheduled. We've sent a confirmation to your email with all the details.
            </p>
            
            <div className="space-y-3">
              <Button
                className="w-full bg-primary text-white"
                onClick={() => window.location.href = "/dashboard"}
              >
                View My Appointments
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = "/"}
              >
                Return to Home
              </Button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex flex-col md:flex-row border-b border-gray-800 mb-8">
        <button 
          className={`booking-step-btn flex-1 text-center py-4 border-b-2 ${
            currentStep === 1 
              ? "border-primary text-primary font-medium" 
              : "border-transparent text-gray-500 font-medium"
          }`}
          onClick={() => setCurrentStep(1)}
          disabled={createAppointmentMutation.isPending}
        >
          1. Select Artist
        </button>
        <button 
          className={`booking-step-btn flex-1 text-center py-4 border-b-2 ${
            currentStep === 2 
              ? "border-primary text-primary font-medium" 
              : currentStep > 2
                ? "border-transparent text-gray-300 font-medium"
                : "border-transparent text-gray-500 font-medium"
          }`}
          onClick={() => selectedArtistId && setCurrentStep(2)}
          disabled={!selectedArtistId || createAppointmentMutation.isPending}
        >
          2. Choose Date
        </button>
        <button 
          className={`booking-step-btn flex-1 text-center py-4 border-b-2 ${
            currentStep === 3 
              ? "border-primary text-primary font-medium" 
              : currentStep > 3
                ? "border-transparent text-gray-300 font-medium"
                : "border-transparent text-gray-500 font-medium"
          }`}
          onClick={() => selectedDate && setCurrentStep(3)}
          disabled={!selectedDate || createAppointmentMutation.isPending}
        >
          3. Select Time
        </button>
        <button 
          className={`booking-step-btn flex-1 text-center py-4 border-b-2 ${
            currentStep === 4 
              ? "border-primary text-primary font-medium" 
              : currentStep > 4
                ? "border-transparent text-gray-300 font-medium"
                : "border-transparent text-gray-500 font-medium"
          }`}
          onClick={() => selectedTimeSlot && setCurrentStep(4)}
          disabled={!selectedTimeSlot || createAppointmentMutation.isPending}
        >
          4. Select Service
        </button>
        <button 
          className={`booking-step-btn flex-1 text-center py-4 border-b-2 ${
            currentStep === 5 || currentStep === 6
              ? "border-primary text-primary font-medium" 
              : "border-transparent text-gray-500 font-medium"
          }`}
          onClick={() => selectedScheduleId && setCurrentStep(5)}
          disabled={!selectedScheduleId || createAppointmentMutation.isPending}
        >
          5. Confirm
        </button>
      </div>
      
      {/* Step Content */}
      <div className="booking-step active">
        {getStepContent()}
      </div>
      
      {/* Navigation Buttons */}
      {currentStep !== 6 && (
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || createAppointmentMutation.isPending}
          >
            Back
          </Button>
          
          {currentStep === 5 ? (
            <Button
              onClick={handleSubmitBooking}
              disabled={createAppointmentMutation.isPending}
              className="bg-primary text-white"
            >
              {createAppointmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (currentStep === 1 && selectedArtistId) setCurrentStep(2);
                else if (currentStep === 2 && selectedDate) setCurrentStep(3);
                else if (currentStep === 3 && selectedTimeSlot) setCurrentStep(4);
                else if (currentStep === 4 && selectedScheduleId) setCurrentStep(5);
              }}
              disabled={
                (currentStep === 1 && !selectedArtistId) ||
                (currentStep === 2 && !selectedDate) ||
                (currentStep === 3 && !selectedTimeSlot) ||
                (currentStep === 4 && !selectedScheduleId) ||
                createAppointmentMutation.isPending
              }
              className="bg-primary text-white"
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
