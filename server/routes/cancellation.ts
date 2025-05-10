import { Express } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { getCancellationSuggestions } from "../openai-service";

export function setupCancellationRoutes(app: Express): void {
  // Handle appointment cancellations
  app.post("/api/appointments/:id/cancel", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check permissions: only appointment owner or artist can cancel
      const isOwner = appointment.userId === req.user!.id;
      let isArtist = false;
      
      if (req.user!.isArtist) {
        const artist = await storage.getArtistByUserId(req.user!.id);
        isArtist = artist ? artist.id === appointment.artistId : false;
      }
      
      if (!isOwner && !isArtist) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate cancellation reason
      const schema = z.object({
        reason: z.string().min(1, "Reason is required")
      });
      
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid cancellation request", errors: result.error.format() });
      }
      
      // Get artist and schedule information for the appointment
      const artist = await storage.getArtist(appointment.artistId);
      const schedule = await storage.getSchedule(appointment.scheduleId);
      const artistUser = await storage.getUser(artist?.userId || 0);
      
      if (!artist || !schedule || !artistUser) {
        return res.status(500).json({ message: "Failed to get appointment details" });
      }
      
      // Generate available dates (in production, this would be fetched from Google Calendar)
      const today = new Date();
      const availableDates = [];
      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Skip weekends for demo purposes
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          availableDates.push(date.toISOString().split('T')[0]);
        }
      }
      
      // Get all artists for alternative suggestions
      const allArtists = await storage.getAllArtists();
      
      const availableArtistsData = await Promise.all(
        allArtists.filter(a => a.id !== appointment.artistId).map(async (artist) => {
          const user = await storage.getUser(artist.userId);
          return {
            id: artist.id,
            fullName: user?.fullName || "",
            specialty: artist.specialty,
            bio: artist.bio
          };
        })
      );
      
      // Use OpenAI to generate suggestions
      const suggestions = await getCancellationSuggestions(
        {
          date: appointment.startTime.toISOString(),
          artistId: appointment.artistId,
          artistName: artistUser.fullName,
          schedule: schedule.name
        },
        result.data.reason,
        availableArtistsData,
        availableDates
      );
      
      // Update the appointment status to cancelled
      const updatedAppointment = await storage.updateAppointment(appointmentId, {
        status: "cancelled"
      });
      
      // Return the updated appointment and AI suggestions
      res.json({
        appointment: updatedAppointment,
        suggestions
      });
    } catch (error) {
      console.error("Error handling cancellation:", error);
      res.status(500).json({ message: "Failed to process cancellation" });
    }
  });
}