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

// Simulated AI function for cancellation management
export function handleCancellation(
  appointmentId: number,
  reason: string
): Promise<{
  message: string;
  suggestedDates?: Date[];
  suggestedArtists?: Artist[];
}> {
  // This would connect to a real AI service in production
  return Promise.resolve({
    message: "Your appointment has been canceled. We've analyzed your preferences and have some alternative suggestions for you.",
    suggestedDates: [
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ],
    suggestedArtists: [],
  });
}
