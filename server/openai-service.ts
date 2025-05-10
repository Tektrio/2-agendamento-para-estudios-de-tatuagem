import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ArtistData {
  id: number;
  fullName: string;
  specialty: string;
  bio: string;
}

export interface ScheduleData {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  durationMinutes: number;
}

export interface UserPreferences {
  tattooStyle: string;
  tattooSize: string;
  preferredDates: string;
  budgetRange: string;
  description: string;
}

export interface RecommendationResult {
  artistId: number;
  message: string;
}

/**
 * Uses OpenAI to recommend a tattoo artist based on user preferences
 */
export async function getArtistRecommendation(
  artists: ArtistData[],
  preferences: UserPreferences
): Promise<RecommendationResult> {
  try {
    const formattedArtists = artists.map(artist => ({
      id: artist.id,
      name: artist.fullName,
      specialty: artist.specialty,
      bio: artist.bio,
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI recommendation system for a tattoo studio. Your task is to match clients with the ideal tattoo artist based on their preferences. " +
            "Analyze the client requirements and artist specialties to make the best match. " +
            "Respond with JSON in this format: { 'artistId': number, 'message': string }. " +
            "The message should explain why this artist is a good match in an engaging, persuasive way."
        },
        {
          role: "user",
          content: JSON.stringify({
            preferences,
            availableArtists: formattedArtists
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content) as RecommendationResult;
    return result;
  } catch (error) {
    console.error("Error getting artist recommendation:", error);
    
    // Fallback to random artist if OpenAI API fails
    const randomArtist = artists[Math.floor(Math.random() * artists.length)];
    return {
      artistId: randomArtist.id,
      message: `We recommend ${randomArtist.fullName} who specializes in ${randomArtist.specialty}.`
    };
  }
}

/**
 * Uses OpenAI to generate a personalized message for a waitlist entry
 */
export async function generateWaitlistMessage(
  preferences: UserPreferences
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI assistant for a tattoo studio. Generate a short, personalized confirmation message for a client who has joined the waitlist. " +
            "The message should acknowledge their preferences and assure them they'll be notified when a suitable spot becomes available. " +
            "Keep the message under 150 words and make it sound friendly and professional."
        },
        {
          role: "user",
          content: JSON.stringify(preferences)
        }
      ]
    });

    return response.choices[0].message.content || "Thank you for joining our waitlist. We'll notify you when a suitable appointment becomes available.";
  } catch (error) {
    console.error("Error generating waitlist message:", error);
    return "Thank you for joining our waitlist. We'll notify you when a suitable appointment becomes available.";
  }
}

/**
 * Uses OpenAI to suggest alternative dates or artists when an appointment is canceled
 */
export async function getCancellationSuggestions(
  originalAppointmentDetails: {
    date: string;
    artistId: number;
    artistName: string;
    schedule: string;
  },
  reason: string,
  availableArtists: ArtistData[],
  availableDates: string[]
): Promise<{
  message: string;
  suggestedArtistIds: number[];
  suggestedDates: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI assistant for a tattoo studio handling appointment cancellations. " +
            "Based on the cancellation reason and original appointment details, suggest alternative artists and dates. " +
            "Respond with JSON in this format: { 'message': string, 'suggestedArtistIds': number[], 'suggestedDates': string[] }. " +
            "Select 2-3 alternative artists and dates. The message should be empathetic and helpful."
        },
        {
          role: "user",
          content: JSON.stringify({
            originalAppointment: originalAppointmentDetails,
            cancellationReason: reason,
            availableArtists: availableArtists.map(artist => ({
              id: artist.id,
              name: artist.fullName,
              specialty: artist.specialty
            })),
            availableDates
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error getting cancellation suggestions:", error);
    
    // Fallback to simple suggestions if OpenAI API fails
    return {
      message: "We're sorry about your cancellation. Here are some alternative options that might work for you.",
      suggestedArtistIds: availableArtists.slice(0, 2).map(a => a.id),
      suggestedDates: availableDates.slice(0, 3)
    };
  }
}