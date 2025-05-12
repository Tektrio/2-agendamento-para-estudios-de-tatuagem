import { Express, Request, Response } from "express";
import {
  getAuthUrl,
  getTokens,
  getAvailableTimeSlots,
  getAvailabilityForDateRange,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  connectArtistToCalendar,
} from "../google-calendar-service";
import { storage } from "../storage";

export function setupCalendarRoutes(app: Express): void {
  // Generate Google OAuth URL for artist to connect their calendar
  app.get("/api/calendar/auth-url", (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isArtist) {
        return res.status(401).json({ message: "Unauthorized. Artists only." });
      }

      const authUrl = getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({ message: "Failed to generate authentication URL" });
    }
  });

  // Handle OAuth callback from Google
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code is required" });
      }
      
      if (!req.isAuthenticated() || !req.user!.isArtist) {
        return res.status(401).json({ message: "Unauthorized. Artists only." });
      }
      
      // Get artist for the current user
      const artist = await storage.getArtistByUserId(req.user!.id);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist profile not found" });
      }
      
      // Connect artist to Google Calendar
      await connectArtistToCalendar(artist.id, code);
      
      // Redirect to artist dashboard or settings page
      res.redirect("/dashboard?calendar=connected");
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      res.status(500).json({ message: "Failed to connect Google Calendar" });
    }
  });

  // Get available time slots for a specific date
  app.get(
    "/api/artists/:artistId/calendar/slots",
    async (req: Request, res: Response) => {
      try {
        const artistId = parseInt(req.params.artistId);
        const dateParam = req.query.date as string;
        
        if (!dateParam) {
          return res.status(400).json({ message: "Date parameter is required" });
        }
        
        const date = new Date(dateParam);
        
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        
        const slots = await getAvailableTimeSlots(artistId, date);
        res.json(slots);
      } catch (error) {
        console.error("Error fetching time slots:", error);
        res.status(500).json({ message: "Failed to fetch available time slots" });
      }
    }
  );

  // Get availability for a date range
  app.get(
    "/api/artists/:artistId/calendar/availability",
    async (req: Request, res: Response) => {
      try {
        const artistId = parseInt(req.params.artistId);
        const startDateParam = req.query.startDate as string;
        const endDateParam = req.query.endDate as string;
        
        if (!startDateParam || !endDateParam) {
          return res.status(400).json({ message: "Start date and end date are required" });
        }
        
        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        
        const availability = await getAvailabilityForDateRange(
          artistId,
          startDate,
          endDate
        );
        
        res.json(availability);
      } catch (error) {
        console.error("Error fetching availability:", error);
        res.status(500).json({ message: "Failed to fetch availability" });
      }
    }
  );

  // Create a calendar event for an appointment
  app.post(
    "/api/artists/:artistId/calendar/events",
    async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const artistId = parseInt(req.params.artistId);
        const { startTime, endTime, scheduleId, userId, notes } = req.body;
        
        if (!startTime || !endTime || !scheduleId) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        
        // Check if user is authorized to create this appointment
        const isArtist = req.user!.isArtist;
        const isCurrentUserAppointment = userId === req.user!.id;
        
        if (!isArtist && !isCurrentUserAppointment) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        const eventId = await createCalendarEvent(artistId, {
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          userId: userId || req.user!.id,
          scheduleId,
          notes,
        });
        
        res.status(201).json({ eventId });
      } catch (error) {
        console.error("Error creating calendar event:", error);
        res.status(500).json({ message: "Failed to create calendar event" });
      }
    }
  );

  // Update a calendar event
  app.patch(
    "/api/artists/:artistId/calendar/events/:eventId",
    async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const artistId = parseInt(req.params.artistId);
        const eventId = req.params.eventId;
        const { startTime, endTime, notes } = req.body;
        
        // Ensure the user is either the artist or the appointment owner
        const appointment = await storage.getAppointment(parseInt(eventId));
        
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        
        const isArtist = req.user!.isArtist;
        const isAppointmentOwner = appointment.userId === req.user!.id;
        
        if (!isArtist && !isAppointmentOwner) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        const success = await updateCalendarEvent(artistId, eventId, {
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
          notes,
        });
        
        res.json({ success });
      } catch (error) {
        console.error("Error updating calendar event:", error);
        res.status(500).json({ message: "Failed to update calendar event" });
      }
    }
  );

  // Delete a calendar event
  app.delete(
    "/api/artists/:artistId/calendar/events/:eventId",
    async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const artistId = parseInt(req.params.artistId);
        const eventId = req.params.eventId;
        
        // Ensure the user is either the artist or the appointment owner
        const appointment = await storage.getAppointment(parseInt(eventId));
        
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        
        const isArtist = req.user!.isArtist;
        const isAppointmentOwner = appointment.userId === req.user!.id;
        
        if (!isArtist && !isAppointmentOwner) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        const success = await deleteCalendarEvent(artistId, eventId);
        
        res.json({ success });
      } catch (error) {
        console.error("Error deleting calendar event:", error);
        res.status(500).json({ message: "Failed to delete calendar event" });
      }
    }
  );
}