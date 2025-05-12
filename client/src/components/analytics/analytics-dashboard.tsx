import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import { CalendarIcon, Loader2, TrendingUp, RefreshCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function AnalyticsDashboard({ artistId }: { artistId?: number }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Set default date range to last 30 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  // Helper function to format dates for API requests
  const formatDateForApi = (date: Date) => date.toISOString();
  
  // Get AI insights
  const { 
    data: insights, 
    isLoading: insightsLoading,
    refetch: refetchInsights 
  } = useQuery({
    queryKey: [
      "/api/analytics/insights", 
      dateRange?.from ? formatDateForApi(dateRange.from) : undefined, 
      dateRange?.to ? formatDateForApi(dateRange.to) : undefined,
      artistId
    ],
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams();
        
        if (dateRange?.from) {
          searchParams.append("startDate", formatDateForApi(dateRange.from));
        }
        
        if (dateRange?.to) {
          searchParams.append("endDate", formatDateForApi(dateRange.to));
        }
        
        if (artistId) {
          searchParams.append("artistId", artistId.toString());
        }
        
        const res = await fetch(`/api/analytics/insights?${searchParams.toString()}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch analytics insights");
        }
        
        return res.json();
      } catch (error) {
        console.error("Error fetching insights:", error);
        toast({
          title: "Error",
          description: "Failed to load analytics insights",
          variant: "destructive",
        });
        return { insights: [], recommendations: [] };
      }
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });
  
  // Get studio analytics
  const { 
    data: studioData, 
    isLoading: studioLoading, 
    refetch: refetchStudio 
  } = useQuery({
    queryKey: [
      "/api/analytics/studio", 
      dateRange?.from ? formatDateForApi(dateRange.from) : undefined, 
      dateRange?.to ? formatDateForApi(dateRange.to) : undefined
    ],
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams();
        
        if (dateRange?.from) {
          searchParams.append("startDate", formatDateForApi(dateRange.from));
        }
        
        if (dateRange?.to) {
          searchParams.append("endDate", formatDateForApi(dateRange.to));
        }
        
        const res = await fetch(`/api/analytics/studio?${searchParams.toString()}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch studio analytics");
        }
        
        return res.json();
      } catch (error) {
        console.error("Error fetching studio analytics:", error);
        toast({
          title: "Error",
          description: "Failed to load studio analytics",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });
  
  // Get artist-specific analytics if artistId is provided
  const { 
    data: artistData, 
    isLoading: artistLoading,
    refetch: refetchArtist
  } = useQuery({
    queryKey: [
      `/api/analytics/artists/${artistId}`, 
      dateRange?.from ? formatDateForApi(dateRange.from) : undefined, 
      dateRange?.to ? formatDateForApi(dateRange.to) : undefined
    ],
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams();
        
        if (dateRange?.from) {
          searchParams.append("startDate", formatDateForApi(dateRange.from));
        }
        
        if (dateRange?.to) {
          searchParams.append("endDate", formatDateForApi(dateRange.to));
        }
        
        const res = await fetch(`/api/analytics/artists/${artistId}?${searchParams.toString()}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch artist analytics");
        }
        
        return res.json();
      } catch (error) {
        console.error("Error fetching artist analytics:", error);
        toast({
          title: "Error",
          description: "Failed to load artist analytics",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!artistId && !!dateRange?.from && !!dateRange?.to,
  });
  
  // Get appointment analytics
  const { 
    data: appointmentData, 
    isLoading: appointmentLoading,
    refetch: refetchAppointment
  } = useQuery({
    queryKey: [
      "/api/analytics/appointments", 
      dateRange?.from ? formatDateForApi(dateRange.from) : undefined, 
      dateRange?.to ? formatDateForApi(dateRange.to) : undefined,
      artistId
    ],
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams();
        
        if (dateRange?.from) {
          searchParams.append("startDate", formatDateForApi(dateRange.from));
        }
        
        if (dateRange?.to) {
          searchParams.append("endDate", formatDateForApi(dateRange.to));
        }
        
        if (artistId) {
          searchParams.append("artistId", artistId.toString());
        }
        
        const res = await fetch(`/api/analytics/appointments?${searchParams.toString()}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch appointment analytics");
        }
        
        return res.json();
      } catch (error) {
        console.error("Error fetching appointment analytics:", error);
        toast({
          title: "Error",
          description: "Failed to load appointment analytics",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });
  
  // Get waitlist analytics
  const { 
    data: waitlistData, 
    isLoading: waitlistLoading,
    refetch: refetchWaitlist
  } = useQuery({
    queryKey: [
      "/api/analytics/waitlist", 
      dateRange?.from ? formatDateForApi(dateRange.from) : undefined, 
      dateRange?.to ? formatDateForApi(dateRange.to) : undefined,
      artistId
    ],
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams();
        
        if (dateRange?.from) {
          searchParams.append("startDate", formatDateForApi(dateRange.from));
        }
        
        if (dateRange?.to) {
          searchParams.append("endDate", formatDateForApi(dateRange.to));
        }
        
        if (artistId) {
          searchParams.append("artistId", artistId.toString());
        }
        
        const res = await fetch(`/api/analytics/waitlist?${searchParams.toString()}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch waitlist analytics");
        }
        
        return res.json();
      } catch (error) {
        console.error("Error fetching waitlist analytics:", error);
        toast({
          title: "Error",
          description: "Failed to load waitlist analytics",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });
  
  // Function to refresh all data
  const handleRefreshData = () => {
    refetchInsights();
    refetchStudio();
    if (artistId) refetchArtist();
    refetchAppointment();
    refetchWaitlist();
    
    toast({
      title: "Refreshing Data",
      description: "Analytics data is being updated",
    });
  };
  
  // Check if any of the data is loading
  const isLoading = insightsLoading || studioLoading || artistLoading || appointmentLoading || waitlistLoading;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            {dateRange?.from && dateRange?.to ? (
              <>
                <CalendarIcon className="inline-block w-4 h-4 mr-1" />
                {format(dateRange.from, "MMM d, yyyy")} — {format(dateRange.to, "MMM d, yyyy")}
              </>
            ) : (
              "Select a date range to view analytics"
            )}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className="w-[300px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
            {artistId && <TabsTrigger value="artist">Artist</TabsTrigger>}
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${studioData?.totalRevenue?.toFixed(2) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {studioData?.businessGrowth > 0 ? "+" : ""}
                    {studioData?.businessGrowth?.toFixed(1) || 0}% from previous period
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Appointments
                  </CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointmentData?.completedAppointments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {appointmentData?.appointmentGrowth > 0 ? "+" : ""}
                    {appointmentData?.appointmentGrowth?.toFixed(1) || 0}% from previous period
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Waitlist Conversion
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {studioData?.waitlistConversionRate?.toFixed(1) || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {waitlistData?.convertedToAppointments || 0} conversions from waitlist
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Retention Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {studioData?.customerRetentionRate?.toFixed(1) || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Of clients return for another appointment
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Studio Performance</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  {studioData ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Top Performing Artists</h3>
                        <div className="space-y-2">
                          {studioData.artistPerformance?.slice(0, 3).map((artist: { artistName: string; revenue: number }, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="font-medium">{artist.artistName}</span>
                              <span className="text-sm text-muted-foreground">${artist.revenue.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Popular Styles</h3>
                        <div className="space-y-2">
                          {studioData.popularStyles?.slice(0, 3).map((style: { style: string; count: number }, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="font-medium">{style.style}</span>
                              <span className="text-sm text-muted-foreground">{style.count} appointments</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No studio data available</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Key Recommendations</CardTitle>
                  <CardDescription>
                    AI-generated insights to improve your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights?.recommendations?.slice(0, 3).map((recommendation: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="mt-0.5 bg-primary/10 p-1 rounded-full">
                          <TrendingUp className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    )) || (
                      <li className="text-muted-foreground">No recommendations available</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Analytics</CardTitle>
                <CardDescription>
                  Detailed metrics about appointments in the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted rounded-lg p-3">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Appointments</h3>
                        <p className="text-2xl font-bold">{appointmentData.totalAppointments}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Completed</h3>
                        <p className="text-2xl font-bold">{appointmentData.completedAppointments}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Cancelled</h3>
                        <p className="text-2xl font-bold">{appointmentData.cancelledAppointments}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Top Schedules</h3>
                      <div className="space-y-2">
                        {appointmentData.topSchedules?.map((schedule: { name: string; count: number; revenue: number }, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="font-medium">{schedule.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground">{schedule.count} bookings</span>
                              <span className="text-sm font-medium">${schedule.revenue.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Appointments by Day</h3>
                      <div className="space-y-2">
                        {appointmentData.appointmentsByDay?.filter((day: { count: number }) => day.count > 0).map((day: { day: string; count: number }, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="font-medium">{day.day}</span>
                            <span className="text-sm text-muted-foreground">{day.count} appointments</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No appointment data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="waitlist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Waitlist Analytics</CardTitle>
                <CardDescription>
                  Detailed metrics about waitlist entries in the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {waitlistData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted rounded-lg p-3">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Entries</h3>
                        <p className="text-2xl font-bold">{waitlistData.totalEntries}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Entries</h3>
                        <p className="text-2xl font-bold">{waitlistData.activeEntries}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Converted to Bookings</h3>
                        <p className="text-2xl font-bold">{waitlistData.convertedToAppointments}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Top Requested Styles</h3>
                      <div className="space-y-2">
                        {waitlistData.topRequestedStyles?.map((style: { style: string; count: number }, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="font-medium">{style.style}</span>
                            <span className="text-sm text-muted-foreground">{style.count} requests</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Top Requested Artists</h3>
                      <div className="space-y-2">
                        {waitlistData.topRequestedArtists?.map((artist: { artistId: number; artistName: string; count: number }, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="font-medium">{artist.artistName}</span>
                            <span className="text-sm text-muted-foreground">{artist.count} requests</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No waitlist data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {artistId && (
            <TabsContent value="artist" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Artist Performance</CardTitle>
                  <CardDescription>
                    Performance metrics for {artistData?.artistName || "the selected artist"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {artistData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted rounded-lg p-3">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Appointments</h3>
                          <p className="text-2xl font-bold">{artistData.totalAppointments}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Revenue</h3>
                          <p className="text-2xl font-bold">${artistData.revenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Average Rating</h3>
                          <p className="text-2xl font-bold">{artistData.averageRating.toFixed(1)}/5</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Popular Schedules</h3>
                        <div className="space-y-2">
                          {artistData.popularSchedules?.map((schedule: { name: string; count: number }, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="font-medium">{schedule.name}</span>
                              <span className="text-sm text-muted-foreground">{schedule.count} bookings</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Busy Hours</h3>
                        <div className="space-y-2">
                          {artistData.busyHours?.slice(0, 5).map((slot: { hour: number; count: number }, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="font-medium">{slot.hour}:00</span>
                              <span className="text-sm text-muted-foreground">{slot.count} appointments</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No artist data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Insights</CardTitle>
                <CardDescription>
                  Machine learning-powered analysis of your studio's performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Key Insights</h3>
                      <ul className="space-y-3">
                        {insights.insights?.map((insight: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="mt-0.5 bg-primary/10 p-1 rounded-full">
                              <TrendingUp className="h-3 w-3 text-primary" />
                            </div>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Recommendations</h3>
                      <ul className="space-y-3">
                        {insights.recommendations?.map((recommendation: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="mt-0.5 bg-primary/10 p-1 rounded-full">
                              <TrendingUp className="h-3 w-3 text-primary" />
                            </div>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No insights available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}