import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BookingForm } from "@/components/booking-form";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function BookingPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { user, isLoading: isLoadingUser } = useAuth();
  
  const searchParams = new URLSearchParams(search);
  const artistId = searchParams.get("artist") ? parseInt(searchParams.get("artist")!) : undefined;
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const serviceId = searchParams.get("service") ? parseInt(searchParams.get("service")!) : undefined;
  const isCustom = searchParams.get("custom") === "true";
  const isLastMinute = searchParams.get("lastMinute") === "true";
  
  // Fetch all artists
  const { data: artists, isLoading: isLoadingArtists } = useQuery({
    queryKey: ["/api/artists"],
    queryFn: async () => {
      const res = await fetch("/api/artists");
      if (!res.ok) throw new Error("Failed to fetch artists");
      return res.json();
    },
  });
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoadingUser && !user) {
      navigate("/auth");
    }
  }, [user, isLoadingUser, navigate]);
  
  // Page content based on URL parameters
  const getPageTitle = () => {
    if (isCustom) return "Custom Booking Request";
    if (isLastMinute) return "Last-Minute Availability";
    return "Book Your Appointment";
  };
  
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-900 text-light">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-light">
      <Header />
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-heading text-light text-center mb-3">{getPageTitle()}</h1>
          
          {isCustom ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
                <h2 className="text-xl font-heading text-light mb-4">Custom Request Form</h2>
                <p className="text-gray-300 mb-6">
                  Need something specific? Fill out the form below and our team will work with you to arrange a custom booking.
                </p>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-light mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-light"
                      defaultValue={user.fullName}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-light mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-light"
                      defaultValue={user.email}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-light mb-2">Preferred Artist</label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-light">
                      <option value="">Select an artist (optional)</option>
                      {artists?.map((artist: any) => (
                        <option key={artist.id} value={artist.id}>{artist.fullName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-light mb-2">Tattoo Description</label>
                    <textarea 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-light"
                      rows={4}
                      placeholder="Describe your tattoo idea in detail"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-light mb-2">Preferred Dates/Times</label>
                    <textarea 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-light"
                      rows={2}
                      placeholder="List any specific dates or times you prefer"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-light mb-2">Special Requirements</label>
                    <textarea 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-light"
                      rows={3}
                      placeholder="Any additional information or special requests"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button className="bg-primary text-white">Submit Custom Request</Button>
                  </div>
                </form>
              </div>
            </div>
          ) : isLastMinute ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
                <h2 className="text-xl font-heading text-light mb-4">Last-Minute Availability</h2>
                <p className="text-gray-300 mb-6">
                  These slots have just opened up due to cancellations or schedule changes. Book quickly as they won't last long!
                </p>
                
                {isLoadingArtists ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : artists && artists.length > 0 ? (
                  <div className="space-y-4">
                    {/* Last-minute slots would typically be generated dynamically */}
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                          <img 
                            src={artists[0].profileImage || "https://pixabay.com/get/g6abe3c74e2f438860b22a25bebe7b82f0065d48cb3fec7ce85cc240034284576a533bec90200c2574a078b7858abbf4e427863fd312ea5f96a780d24b8486948_1280.jpg"} 
                            alt={artists[0].fullName} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-light">{artists[0].fullName}</h3>
                          <p className="text-secondary text-xs">{artists[0].specialty}</p>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="bg-warning bg-opacity-10 px-3 py-1 rounded-full text-warning text-sm">
                          Today at 2:00 PM
                        </div>
                        <div className="text-gray-300 text-sm md:ml-2">Small/Medium Tattoo (1-2hrs)</div>
                        <Button 
                          className="bg-accent hover:bg-opacity-90 text-white ml-auto w-full md:w-auto"
                          onClick={() => navigate(`/booking?artist=${artists[0].id}`)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                          <img 
                            src={artists.length > 1 ? artists[1].profileImage : "https://pixabay.com/get/g6abe3c74e2f438860b22a25bebe7b82f0065d48cb3fec7ce85cc240034284576a533bec90200c2574a078b7858abbf4e427863fd312ea5f96a780d24b8486948_1280.jpg"} 
                            alt={artists.length > 1 ? artists[1].fullName : "Artist"} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-light">{artists.length > 1 ? artists[1].fullName : "Artist"}</h3>
                          <p className="text-secondary text-xs">{artists.length > 1 ? artists[1].specialty : "Tattoo Artist"}</p>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="bg-success bg-opacity-10 px-3 py-1 rounded-full text-success text-sm">
                          Tomorrow at 10:00 AM
                        </div>
                        <div className="text-gray-300 text-sm md:ml-2">Medium Tattoo (3-4hrs)</div>
                        <Button 
                          className="bg-accent hover:bg-opacity-90 text-white ml-auto w-full md:w-auto"
                          onClick={() => navigate(`/booking?artist=${artists.length > 1 ? artists[1].id : artists[0].id}`)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No last-minute openings available at the moment. Check back soon!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">Follow these simple steps to book your tattoo session with your preferred artist.</p>
              
              {isLoadingArtists ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : (
                <BookingForm 
                  artists={artists || []} 
                  initialArtistId={artistId}
                />
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
