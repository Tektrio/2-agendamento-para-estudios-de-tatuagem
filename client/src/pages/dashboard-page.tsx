import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { handleCancellation } from "@/lib/ai-service";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Info, Loader2, MapPin, MoreHorizontal, Trash, User } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cancelAppointmentId, setCancelAppointmentId] = useState<number | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  
  // Fetch user appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/appointments"],
    queryFn: async () => {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return res.json();
    },
    enabled: !!user,
  });
  
  // Fetch user waitlist entries
  const { data: waitlistEntries, isLoading: isLoadingWaitlist } = useQuery({
    queryKey: ["/api/waitlist"],
    queryFn: async () => {
      const res = await fetch("/api/waitlist");
      if (!res.ok) throw new Error("Failed to fetch waitlist");
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch artists
  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
    queryFn: async () => {
      const res = await fetch("/api/artists");
      if (!res.ok) throw new Error("Failed to fetch artists");
      return res.json();
    },
    enabled: !!user,
  });
  
  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}`, { status });
      return res.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      
      // Get AI suggestions for the cancellation
      if (cancellationReason) {
        try {
          const suggestions = await handleCancellation(cancelAppointmentId!, cancellationReason);
          setAiSuggestions(suggestions);
          setShowAiSuggestions(true);
        } catch (error) {
          console.error("Failed to get AI suggestions:", error);
        }
      }
      
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
      
      setCancelAppointmentId(null);
      setCancellationReason("");
      setShowCancellationDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle cancellation
  const handleCancelAppointment = (appointmentId: number) => {
    setCancelAppointmentId(appointmentId);
    setShowCancellationDialog(true);
  };
  
  const confirmCancellation = () => {
    if (cancelAppointmentId) {
      cancelAppointmentMutation.mutate({
        id: cancelAppointmentId,
        status: "cancelled",
      });
    }
  };
  
  // Function to get artist data
  const getArtistById = (artistId: number) => {
    return artists?.find((artist: any) => artist.id === artistId);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-light">
      <Header />
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-heading text-light text-center mb-3">Your Dashboard</h1>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">Manage your appointments, waitlist entries, and account settings.</p>
          
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appointments">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-heading text-light mb-6">Your Appointments</h2>
                
                {isLoadingAppointments ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-6">
                    {appointments.map((appointment: any) => {
                      const artist = getArtistById(appointment.artistId);
                      const isPastAppointment = new Date(appointment.startTime) < new Date();
                      const isCancelled = appointment.status === "cancelled";
                      
                      return (
                        <Card key={appointment.id} className={`bg-gray-800 border-gray-700 ${isCancelled ? 'opacity-60' : ''}`}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl text-light">
                                  {isCancelled && <span className="text-error">[Cancelled] </span>}
                                  {artist ? artist.fullName : "Unknown Artist"}
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                  {formatDate(appointment.startTime)} at {formatTime(appointment.startTime)}
                                </CardDescription>
                              </div>
                              {!isPastAppointment && !isCancelled && (
                                <Button 
                                  variant="ghost" 
                                  className="text-gray-400 hover:text-error"
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-start">
                                <Clock className="h-5 w-5 text-secondary mr-2 flex-shrink-0" />
                                <div className="text-gray-300">
                                  Duration: {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                                </div>
                              </div>
                              <div className="flex items-start">
                                <MapPin className="h-5 w-5 text-secondary mr-2 flex-shrink-0" />
                                <div className="text-gray-300">
                                  123 Ink Street, Tattoo District, TC 12345
                                </div>
                              </div>
                              {appointment.notes && (
                                <div className="flex items-start">
                                  <Info className="h-5 w-5 text-secondary mr-2 flex-shrink-0" />
                                  <div className="text-gray-300">
                                    Notes: {appointment.notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="border-t border-gray-700 pt-4">
                            {isPastAppointment ? (
                              <div className="text-gray-400 text-sm">
                                This appointment has already passed.
                              </div>
                            ) : isCancelled ? (
                              <div className="text-gray-400 text-sm">
                                This appointment was cancelled.
                              </div>
                            ) : (
                              <Button className="bg-primary text-white" onClick={() => window.open(`/artists/${artist?.id}`, '_blank')}>
                                View Artist
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                      <Calendar className="h-12 w-12 text-gray-500 mb-4" />
                      <h3 className="text-xl font-medium text-light mb-2">No Appointments Found</h3>
                      <p className="text-gray-400 mb-6">You don't have any scheduled appointments yet.</p>
                      <Button className="bg-primary text-white" onClick={() => window.location.href = "/booking"}>
                        Book an Appointment
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="waitlist">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-heading text-light mb-6">Your Waitlist Entries</h2>
                
                {isLoadingWaitlist ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : waitlistEntries && waitlistEntries.length > 0 ? (
                  <div className="space-y-6">
                    {waitlistEntries.map((entry: any) => {
                      const artist = entry.artistId ? getArtistById(entry.artistId) : null;
                      
                      return (
                        <Card key={entry.id} className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <div className="flex justify-between">
                              <div>
                                <CardTitle className="text-xl text-light">
                                  {artist ? artist.fullName : "Any Available Artist"}
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                  Added on {formatDate(entry.createdAt)}
                                </CardDescription>
                              </div>
                              <div className="flex items-center">
                                <div className="bg-warning bg-opacity-10 px-3 py-1 rounded-full text-warning text-sm">
                                  Waiting
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Tattoo Style</h4>
                                <p className="text-light">{entry.tattooStyle}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Size</h4>
                                <p className="text-light">{entry.tattooSize}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Preferred Dates</h4>
                                <p className="text-light">{entry.preferredDates}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Budget Range</h4>
                                <p className="text-light">{entry.budgetRange}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                                <p className="text-light">{entry.description}</p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="border-t border-gray-700 pt-4">
                            <div className="w-full flex justify-between items-center">
                              <div className="text-gray-400 text-sm">
                                <div className="flex items-center">
                                  <Info className="h-4 w-4 mr-1" />
                                  We'll notify you when a slot becomes available.
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                className="text-error border-error"
                              >
                                Remove
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                      <Clock className="h-12 w-12 text-gray-500 mb-4" />
                      <h3 className="text-xl font-medium text-light mb-2">No Waitlist Entries</h3>
                      <p className="text-gray-400 mb-6">You haven't joined any waitlists yet.</p>
                      <Button className="bg-primary text-white" onClick={() => window.location.href = "/"}>
                        Browse Artists
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="profile">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-heading text-light mb-6">Your Profile</h2>
                
                <Card className="bg-gray-800 border-gray-700 mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-light">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-6">
                      <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mr-4">
                        {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-light">{user?.fullName}</h3>
                        <p className="text-gray-400">{user?.username}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                          <div className="bg-gray-700 px-4 py-2 rounded-md text-light">
                            {user?.email}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                          <div className="bg-gray-700 px-4 py-2 rounded-md text-light">
                            {user?.phone || 'Not provided'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-700 pt-4">
                    <Button className="bg-primary text-white">
                      Edit Profile
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-light">Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-light font-medium mb-2">Notification Preferences</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="email-notifications" 
                              className="rounded bg-gray-700 border-gray-600 mr-2"
                              defaultChecked
                            />
                            <label htmlFor="email-notifications" className="text-gray-300">Email notifications</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="sms-notifications" 
                              className="rounded bg-gray-700 border-gray-600 mr-2"
                              defaultChecked
                            />
                            <label htmlFor="sms-notifications" className="text-gray-300">SMS notifications</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="app-notifications" 
                              className="rounded bg-gray-700 border-gray-600 mr-2"
                              defaultChecked
                            />
                            <label htmlFor="app-notifications" className="text-gray-300">App notifications</label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-light font-medium mb-2">Account Security</h3>
                        <Button variant="outline">Change Password</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Cancellation Dialog */}
      <Dialog open={showCancellationDialog} onOpenChange={setShowCancellationDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-light">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading">Cancel Appointment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please provide a reason for cancellation. This helps us improve our service.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-light mb-1">Reason for Cancellation</label>
              <select 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-light"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                <option value="schedule_conflict">Schedule Conflict</option>
                <option value="personal_emergency">Personal Emergency</option>
                <option value="change_of_mind">Change of Mind</option>
                <option value="found_different_artist">Found Different Artist</option>
                <option value="financial_reasons">Financial Reasons</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {cancellationReason === "other" && (
              <div>
                <label className="block text-sm font-medium text-light mb-1">Additional Details</label>
                <textarea 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-light"
                  rows={3}
                  placeholder="Please provide more details..."
                ></textarea>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCancellationDialog(false)}
            >
              Keep Appointment
            </Button>
            <Button 
              className="bg-error text-white mb-2 sm:mb-0"
              onClick={confirmCancellation}
              disabled={!cancellationReason || cancelAppointmentMutation.isPending}
            >
              {cancelAppointmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Suggestions Dialog */}
      <Dialog open={showAiSuggestions} onOpenChange={setShowAiSuggestions}>
        <DialogContent className="bg-gray-900 border-gray-800 text-light">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading">AI-Generated Suggestions</DialogTitle>
            <DialogDescription className="text-gray-400">
              Based on your cancellation reason, our AI has some alternative suggestions for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {aiSuggestions?.message && (
              <p className="text-light">{aiSuggestions.message}</p>
            )}
            
            {aiSuggestions?.suggestedDates && aiSuggestions.suggestedDates.length > 0 && (
              <div>
                <h3 className="text-light font-medium mb-2">Alternative Dates</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {aiSuggestions.suggestedDates.map((date: Date, index: number) => (
                    <div key={index} className="bg-gray-800 p-2 rounded text-center text-sm border border-gray-700">
                      {formatDate(date)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {aiSuggestions?.suggestedArtists && aiSuggestions.suggestedArtists.length > 0 && (
              <div>
                <h3 className="text-light font-medium mb-2">Alternative Artists</h3>
                <div className="space-y-2">
                  {aiSuggestions.suggestedArtists.map((artist: any, index: number) => (
                    <div key={index} className="bg-gray-800 p-3 rounded border border-gray-700 flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                        <img 
                          src={artist.profileImage || "https://example.com/placeholder.jpg"} 
                          alt={artist.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="text-light font-medium">{artist.name}</p>
                        <p className="text-gray-400 text-sm">{artist.specialty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              className="bg-primary text-white w-full sm:w-auto"
              onClick={() => {
                setShowAiSuggestions(false);
                window.location.href = "/booking";
              }}
            >
              Book New Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
