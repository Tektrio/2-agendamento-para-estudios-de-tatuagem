import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Redirect } from "wouter";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { storage } from "@/lib/queryClient";

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Get the artist ID from the URL if it exists
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const artistIdParam = urlParams.get("artistId");
  const artistId = artistIdParam ? parseInt(artistIdParam) : undefined;
  
  // Get artist data if an artist ID is provided
  const { data: artistData, isLoading: artistLoading } = useQuery({
    queryKey: [artistId ? `/api/artists/${artistId}` : null],
    queryFn: async () => {
      if (!artistId) return null;
      const res = await fetch(`/api/artists/${artistId}`);
      if (!res.ok) throw new Error("Failed to fetch artist");
      return res.json();
    },
    enabled: !!artistId,
  });
  
  // Check if the currently logged in user is allowed to access this page
  // Only artists (and admins) should be able to access the analytics page
  if (!isLoading && !user?.isArtist) {
    return <Redirect to="/" />;
  }
  
  if (isLoading || (artistId && artistLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>
          {artistData 
            ? `Analytics for ${artistData.fullName} | InkSync Tattoo Studio` 
            : "Studio Analytics | InkSync Tattoo Studio"}
        </title>
        <meta 
          name="description" 
          content="Advanced analytics dashboard for monitoring studio performance, appointments, and waitlist trends."
        />
      </Helmet>
      
      <div className="container py-8 px-4 mx-auto max-w-7xl">
        <AnalyticsDashboard artistId={artistId} />
      </div>
    </>
  );
}