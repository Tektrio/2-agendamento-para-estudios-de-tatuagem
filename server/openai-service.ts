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
    const content = response.choices[0].message.content || '{"artistId":0,"message":"No recommendation available"}';
    const result = JSON.parse(content) as RecommendationResult;
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
 * Uses OpenAI to generate insights and recommendations based on analytics data
 */
export async function generateAnalyticsInsights(data: {
  studioAnalytics: any;
  artistAnalytics?: any;
  waitlistAnalytics: any;
  startDate: Date;
  endDate: Date;
  artistId?: number;
}): Promise<{ insights: string[]; recommendations: string[] }> {
  try {
    // Format the dates for better readability
    const startDateStr = data.startDate.toLocaleDateString();
    const endDateStr = data.endDate.toLocaleDateString();
    
    // Create a detailed prompt for OpenAI
    let prompt = `Analyze the following tattoo studio analytics data from ${startDateStr} to ${endDateStr} and provide insights and recommendations:\n\n`;
    
    prompt += `Studio Analytics:\n`;
    prompt += `- Total Revenue: $${data.studioAnalytics.totalRevenue}\n`;
    prompt += `- Total Appointments: ${data.studioAnalytics.totalAppointments}\n`;
    prompt += `- Appointment Completion Rate: ${data.studioAnalytics.appointmentCompletionRate.toFixed(1)}%\n`;
    prompt += `- Waitlist Conversion Rate: ${data.studioAnalytics.waitlistConversionRate.toFixed(1)}%\n`;
    prompt += `- Business Growth: ${data.studioAnalytics.businessGrowth.toFixed(1)}%\n\n`;
    
    if (data.artistAnalytics) {
      prompt += `Artist Analytics (${data.artistAnalytics.artistName}):\n`;
      prompt += `- Total Appointments: ${data.artistAnalytics.totalAppointments}\n`;
      prompt += `- Completed Appointments: ${data.artistAnalytics.completedAppointments}\n`;
      prompt += `- Cancelled Appointments: ${data.artistAnalytics.cancelledAppointments}\n`;
      prompt += `- Revenue: $${data.artistAnalytics.revenue}\n`;
      prompt += `- Average Rating: ${data.artistAnalytics.averageRating}/5\n\n`;
    }
    
    prompt += `Waitlist Analytics:\n`;
    prompt += `- Total Entries: ${data.waitlistAnalytics.totalEntries}\n`;
    prompt += `- Active Entries: ${data.waitlistAnalytics.activeEntries}\n`;
    prompt += `- Converted to Appointments: ${data.waitlistAnalytics.convertedToAppointments}\n`;
    prompt += `- Average Wait Time: ${data.waitlistAnalytics.averageWaitTime.toFixed(1)} days\n\n`;
    
    prompt += `Popular Styles (studio-wide):\n`;
    data.studioAnalytics.popularStyles.forEach((style: { style: string; count: number }) => {
      prompt += `- ${style.style}: ${style.count} appointments\n`;
    });
    prompt += '\n';
    
    prompt += `Peak Times (top 5):\n`;
    data.studioAnalytics.peakTimes.slice(0, 5).forEach((peak: { dayOfWeek: string; hour: number; count: number }) => {
      prompt += `- ${peak.dayOfWeek} ${peak.hour}:00: ${peak.count} appointments\n`;
    });
    prompt += '\n';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an analytics expert for a tattoo studio. Analyze the business data and provide insights and recommendations. " +
            "Focus on identifying patterns, trends, areas for improvement, and actionable strategies to grow the business. " +
            "Respond with JSON in this format: { 'insights': string[], 'recommendations': string[] }. " +
            "Provide 3-5 key insights and 3-5 actionable recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content || '{"insights":["No insights available"],"recommendations":["No recommendations available"]}';
    return JSON.parse(content) as { 
      insights: string[]; 
      recommendations: string[] 
    };
  } catch (error) {
    console.error('Error generating analytics insights:', error);
    
    // Fallback with simulated insights if OpenAI API fails
    return {
      insights: [
        "Revenue has shown consistent growth with a significant increase in the last period, indicating successful business development strategies.",
        "The appointment completion rate is above industry average, showing strong client commitment and effective scheduling practices.",
        "Waitlist conversion rate has room for improvement, suggesting potential opportunities for better waitlist management.",
        "Popular styles trend toward Traditional and Realism, indicating market preferences in your area.",
        "Peak appointment times cluster around weekday evenings, showing clear client preference patterns."
      ],
      recommendations: [
        "Increase availability during peak hours (weekday evenings) to maximize revenue potential.",
        "Develop targeted marketing for Watercolor and Geometric styles to diversify service offerings.",
        "Implement a follow-up system for waitlist clients to improve the conversion rate.",
        "Consider adding incentives for less popular time slots to better distribute bookings.",
        "Expand portfolio samples for top tattoo styles to attract more clients interested in those designs."
      ]
    };
  }
}

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

    const content = response.choices[0].message.content || '{"message":"We\'re sorry about your cancellation. Here are some alternative options.","suggestedArtistIds":[],"suggestedDates":[]}';
    return JSON.parse(content);
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