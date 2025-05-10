import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDay } from "@/components/ui/calendar-day";
import { TimeSlot } from "@/components/ui/time-slot";
import { getAvailabilityForDateRange, getAvailableTimeSlots } from "@/lib/google-calendar";
import { formatDate, formatTime, formatCurrency, generateTimeSlots } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Clock, DollarSign, MapPin, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WaitlistForm } from "@/components/waitlist-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function ArtistPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const artistId = parseInt(params.id);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  
  // Fetch artist data
  const { data: artist, isLoading: isLoadingArtist } = useQuery({
    queryKey: ["/api/artists", artistId],
    queryFn: async () => {
      const res = await fetch(`/api/artists/${artistId}`);
      if (!res.ok) throw new Error("Failed to fetch artist");
      return res.json();
    },
  });
  
  // Fetch schedules for the artist
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["/api/artists", artistId, "schedules"],
    queryFn: async () => {
      const res = await fetch(`/api/artists/${artistId}/schedules`);
      if (!res.ok) throw new Error("Failed to fetch schedules");
      return res.json();
    },
    enabled: !!artistId,
  });
  
  // Generate calendar availability data
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  
  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ["/api/availability", artistId, startOfMonth.toISOString(), endOfMonth.toISOString()],
    queryFn: () => getAvailabilityForDateRange(artistId, startOfMonth, endOfMonth),
    enabled: !!artistId,
  });
  
  // Get time slots for selected date
  const { data: timeSlots, isLoading: isLoadingTimeSlots } = useQuery({
    queryKey: ["/api/timeslots", artistId, selectedDate?.toISOString()],
    queryFn: () => {
      if (!selectedDate) return [];
      return getAvailableTimeSlots(artistId, selectedDate);
    },
    enabled: !!artistId && !!selectedDate,
  });
  
  // Generate days for the calendar
  const days = [];
  const firstDay = new Date(startOfMonth);
  const lastDay = new Date(endOfMonth);
  
  // Add days from previous month to fill the first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek; i > 0; i--) {
    const day = new Date(firstDay);
    day.setDate(day.getDate() - i);
    days.push({
      date: day,
      isCurrentMonth: false,
      availability: "unavailable" as const,
    });
  }
  
  // Add days of current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const day = new Date(startOfMonth);
    day.setDate(d);
    
    // Check availability for this day
    let dayAvailability: "available" | "limited" | "unavailable" = "unavailable";
    if (availability) {
      const availabilityItem = availability.find(item => 
        item.date.toDateString() === day.toDateString()
      );
      dayAvailability = availabilityItem?.status || "unavailable";
    }
    
    days.push({
      date: day,
      isCurrentMonth: true,
      availability: dayAvailability,
    });
  }
  
  // Add days from next month to fill the last week
  const lastDayOfWeek = lastDay.getDay();
  for (let i = 1; i < 7 - lastDayOfWeek; i++) {
    const day = new Date(lastDay);
    day.setDate(day.getDate() + i);
    days.push({
      date: day,
      isCurrentMonth: false,
      availability: "unavailable" as const,
    });
  }
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };
  
  // Handle schedule selection
  const handleScheduleSelect = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
  };
  
  // Handle booking button click
  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book an appointment",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!selectedDate || !selectedTimeSlot || !selectedScheduleId) {
      toast({
        title: "Incomplete selection",
        description: "Please select a date, time, and service",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to booking confirmation page with selected details
    navigate(`/booking?artist=${artistId}&date=${selectedDate.toISOString()}&time=${selectedTimeSlot}&service=${selectedScheduleId}`);
  };
  
  // Handle waitlist join button click
  const handleJoinWaitlist = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join the waitlist",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setIsWaitlistOpen(true);
  };
  
  // Generate week day names
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  if (isLoadingArtist) {
    return (
      <div className="min-h-screen bg-gray-900 text-light">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <Skeleton className="h-96 w-full rounded-lg" />
              </div>
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-900 text-light">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-heading mb-4">Artist Not Found</h1>
            <p className="text-gray-400 mb-8">The artist you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-light">
      <Header />
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Artist Profile Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="rounded-lg overflow-hidden mb-6">
                <img 
                  src={artist.profileImage || "https://pixabay.com/get/g6abe3c74e2f438860b22a25bebe7b82f0065d48cb3fec7ce85cc240034284576a533bec90200c2574a078b7858abbf4e427863fd312ea5f96a780d24b8486948_1280.jpg"} 
                  alt={artist.fullName} 
                  className="w-full h-[400px] object-cover"
                />
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                <h3 className="text-xl font-medium border-b border-gray-700 pb-2">Contact Information</h3>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-secondary mr-3 mt-0.5" />
                  <div>
                    <p className="text-light font-medium">Phone</p>
                    <p className="text-gray-400">Call studio at (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-secondary mr-3 mt-0.5" />
                  <div>
                    <p className="text-light font-medium">Location</p>
                    <p className="text-gray-400">123 Ink Street, Tattoo District</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-secondary mr-3 mt-0.5" />
                  <div>
                    <p className="text-light font-medium">Working Hours</p>
                    <p className="text-gray-400">Tue-Sat: 10AM - 6PM</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-secondary mr-3 mt-0.5" />
                  <div>
                    <p className="text-light font-medium">Starting Price</p>
                    <p className="text-gray-400">From $120/hour</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h1 className="text-4xl font-heading text-light mb-2">{artist.fullName}</h1>
              <p className="text-secondary font-accent text-lg mb-6">{artist.specialty}</p>
              
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-gray-300">{artist.bio}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-3xl font-heading text-primary mb-1">5+</span>
                  <span className="text-gray-400 text-sm text-center">Years Experience</span>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-3xl font-heading text-primary mb-1">200+</span>
                  <span className="text-gray-400 text-sm text-center">Satisfied Clients</span>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-3xl font-heading text-primary mb-1">3</span>
                  <span className="text-gray-400 text-sm text-center">Award Winning Designs</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-heading text-light">Portfolio Highlights</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <img 
                    src="https://pixabay.com/get/g44de7c5cdceaec95fa83701e15f6dd93cfb81e68e2cc8e21aae20672465653b5d36c289f1edea32798b4801de40af957447129158c892acde113ffcfa6de974e_1280.jpg" 
                    alt="Tattoo example 1" 
                    className="w-full h-32 object-cover rounded-md" 
                  />
                  <img 
                    src="https://pixabay.com/get/g9489f838e78306e05d885448040f14b42718771bbb9e8b7f355f15c63fca06459e5d44a6414409b778e0b187e58f12cc9a7af2a1f911a6d2abffb7d2a7def41f_1280.jpg" 
                    alt="Tattoo example 2" 
                    className="w-full h-32 object-cover rounded-md" 
                  />
                  <img 
                    src="https://pixabay.com/get/gd8a8b287352083e7488f7378184a3a8181d7d4ef833efc0d8420119d5096ae594664a81f3f12ecabee3fa9656c2d129e5d90e15b109036d1f01f86e0e0f2f2f8_1280.jpg" 
                    alt="Tattoo example 3" 
                    className="w-full h-32 object-cover rounded-md" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Interface */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-heading text-light mb-6">Book a Session with {artist.fullName}</h2>
            
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="services">Available Services</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h3 className="text-xl font-heading text-light mb-4">Select a Date</h3>
                    
                    {isLoadingAvailability ? (
                      <div className="flex justify-center py-8">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <>
                        {/* Days of week header */}
                        <div className="grid grid-cols-7 mb-2 text-center">
                          {weekDays.map((day) => (
                            <div key={day} className="text-gray-500 text-sm">{day}</div>
                          ))}
                        </div>
                        
                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {days.map((day, index) => (
                            <CalendarDay
                              key={index}
                              day={day.date.getDate()}
                              isCurrentMonth={day.isCurrentMonth}
                              availability={day.availability}
                              isSelected={selectedDate?.toDateString() === day.date.toDateString()}
                              onClick={() => {
                                if (day.isCurrentMonth && day.availability !== "unavailable") {
                                  handleDateSelect(day.date);
                                }
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Legend */}
                        <div className="mt-4 flex items-center text-xs flex-wrap gap-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-success rounded-full mr-1"></div>
                            <span className="text-gray-400">Available</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-warning rounded-full mr-1"></div>
                            <span className="text-gray-400">Limited</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-500 opacity-50 rounded-full mr-1"></div>
                            <span className="text-gray-400">Unavailable</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Time Slots */}
                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h3 className="text-xl font-heading text-light mb-4">
                      {selectedDate 
                        ? `Available Times for ${formatDate(selectedDate)}` 
                        : "Select a date to see available times"}
                    </h3>
                    
                    {selectedDate ? (
                      isLoadingTimeSlots ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[...Array(12)].map((_, index) => (
                            <Skeleton key={index} className="h-12" />
                          ))}
                        </div>
                      ) : timeSlots && timeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {timeSlots.map((slot, index) => (
                            <TimeSlot
                              key={index}
                              time={formatTime(slot.startTime)}
                              isAvailable={slot.isAvailable}
                              isSelected={selectedTimeSlot === formatTime(slot.startTime)}
                              onClick={() => handleTimeSlotSelect(formatTime(slot.startTime))}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No available time slots for this date.</p>
                          <Button variant="outline" className="mt-4" onClick={() => setSelectedDate(null)}>
                            Select a Different Date
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-400">Please select a date from the calendar to see available time slots.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Service Selection */}
                {selectedTimeSlot && (
                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h3 className="text-xl font-heading text-light mb-4">Select a Service</h3>
                    
                    {isLoadingSchedules ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                          <Skeleton key={index} className="h-20" />
                        ))}
                      </div>
                    ) : schedules && schedules.length > 0 ? (
                      <div className="space-y-4">
                        {schedules.map((schedule: any) => (
                          <div
                            key={schedule.id}
                            className={`p-4 border rounded-lg transition-all cursor-pointer ${
                              selectedScheduleId === schedule.id
                                ? "border-primary bg-primary bg-opacity-10"
                                : "border-gray-700 hover:border-gray-500"
                            }`}
                            onClick={() => handleScheduleSelect(schedule.id)}
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
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No services available for this artist.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Booking Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Dialog open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Join Waitlist</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-light">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-heading">Join Waitlist for {artist.fullName}</DialogTitle>
                      </DialogHeader>
                      <WaitlistForm 
                        artistId={artistId} 
                        onSuccess={() => setIsWaitlistOpen(false)} 
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    className="bg-primary text-white"
                    disabled={!selectedDate || !selectedTimeSlot || !selectedScheduleId}
                    onClick={handleBookNow}
                  >
                    Book Now
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="services" className="space-y-6">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <h3 className="text-xl font-heading text-light mb-4">Available Services</h3>
                  
                  {isLoadingSchedules ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, index) => (
                        <Skeleton key={index} className="h-20" />
                      ))}
                    </div>
                  ) : schedules && schedules.length > 0 ? (
                    <div className="space-y-4">
                      {schedules.map((schedule: any) => (
                        <div key={schedule.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-light text-lg">{schedule.name}</h4>
                              <p className="text-gray-400 mt-1">{schedule.description}</p>
                              <div className="flex items-center mt-2 text-sm text-gray-400">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{schedule.durationMinutes} minutes</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-secondary text-lg font-medium">{formatCurrency(schedule.price)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No services available for this artist.</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <h3 className="text-xl font-heading text-light mb-4">Booking Process</h3>
                  
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3">
                        <span className="text-white font-medium">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-light">Select a Date</h4>
                        <p className="text-gray-400 text-sm">Choose from available dates on the calendar</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3">
                        <span className="text-white font-medium">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-light">Choose a Time Slot</h4>
                        <p className="text-gray-400 text-sm">Select from available time slots for your chosen date</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3">
                        <span className="text-white font-medium">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-light">Select a Service</h4>
                        <p className="text-gray-400 text-sm">Choose the type of tattoo service you need</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3">
                        <span className="text-white font-medium">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-light">Confirm Booking</h4>
                        <p className="text-gray-400 text-sm">Review your details and confirm your appointment</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <h3 className="text-xl font-heading text-light mb-4">Can't Find a Suitable Time?</h3>
                  
                  <p className="text-gray-400 mb-4">
                    Join our waitlist to get notified when {artist.fullName} has cancellations or adds new availability.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-success mr-2 flex-shrink-0" />
                      <span className="text-gray-300">Get priority access to new openings</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-success mr-2 flex-shrink-0" />
                      <span className="text-gray-300">Specify your preferred dates and times</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-success mr-2 flex-shrink-0" />
                      <span className="text-gray-300">Our AI will match you with the best available slot</span>
                    </div>
                  </div>
                  
                  <Button onClick={handleJoinWaitlist} variant="outline" className="w-full">
                    Join the Waitlist
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
