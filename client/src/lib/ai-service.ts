import { apiRequest } from "./queryClient";

export interface RecommendationRequest {
  tattooStyle: string;
  tattooSize: string;
  preferredDates: string;
  budgetRange: string;
  description: string;
}

export interface Artist {
  id: number;
  userId: number;
  specialty: string;
  bio: string;
  profileImage: string | null;
  calendarId: string | null;
  isAvailable: boolean;
  fullName: string;
}

export interface Schedule {
  id: number;
  artistId: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number | null;
  isActive: boolean;
}

export interface Recommendation {
  artist: Artist;
  schedules: Schedule[];
  availableDates: string[];
  message: string;
}

export async function getAiRecommendation(
  request: RecommendationRequest
): Promise<Recommendation> {
  const res = await apiRequest("POST", "/api/ai/recommend", request);
  return res.json();
}

export async function joinWaitlist(request: {
  artistId?: number;
  tattooStyle: string;
  tattooSize: string;
  preferredDates: string;
  budgetRange: string;
  description: string;
}): Promise<{ id: number }> {
  const res = await apiRequest("POST", "/api/waitlist", request);
  return res.json();
}

// AI-powered function for cancellation management
export async function handleCancellation(
  appointmentId: number,
  reason: string
): Promise<{
  message: string;
  suggestedDates?: string[];
  suggestedArtists?: Artist[];
}> {
  try {
    const res = await apiRequest(
      "POST", 
      `/api/appointments/${appointmentId}/cancel`, 
      { reason }
    );
    
    const data = await res.json();
    
    // Convert suggested dates from strings to Date objects if needed
    const suggestedDates = data.suggestions.suggestedDates || [];
    
    // Get suggested artists
    const suggestedArtistIds = data.suggestions.suggestedArtistIds || [];
    
    // In a real application, we would fetch the full artist details here
    // For simplicity, we're just returning the basic info from the API
    
    return {
      message: data.suggestions.message,
      suggestedDates,
      suggestedArtists: data.suggestions.suggestedArtists || []
    };
  } catch (error) {
    console.error("Error handling cancellation:", error);
    throw new Error("Failed to process cancellation. Please try again.");
  }
}
