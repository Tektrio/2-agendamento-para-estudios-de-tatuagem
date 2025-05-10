import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertArtistSchema, 
  insertScheduleSchema, 
  insertAppointmentSchema, 
  insertWaitlistSchema 
} from "@shared/schema";
import { getArtistRecommendation, generateWaitlistMessage, getCancellationSuggestions } from "./openai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API Routes
  // Artists
  app.get("/api/artists", async (_req, res) => {
    try {
      const artists = await storage.getAllArtists();
      
      // Fetch user data for each artist to get full name
      const artistsWithUsers = await Promise.all(
        artists.map(async (artist) => {
          const user = await storage.getUser(artist.userId);
          return {
            ...artist,
            fullName: user?.fullName || "",
            email: user?.email || "",
          };
        })
      );
      
      res.json(artistsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.get("/api/artists/:id", async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const artist = await storage.getArtist(artistId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      const user = await storage.getUser(artist.userId);
      
      res.json({
        ...artist,
        fullName: user?.fullName || "",
        email: user?.email || "",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artist" });
    }
  });

  app.post("/api/artists", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const result = insertArtistSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid artist data", errors: result.error.format() });
      }
      
      const artist = await storage.createArtist(result.data);
      res.status(201).json(artist);
    } catch (error) {
      res.status(500).json({ message: "Failed to create artist" });
    }
  });

  app.patch("/api/artists/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const artistId = parseInt(req.params.id);
      const artist = await storage.getArtist(artistId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // Only allow updates if the user is the artist or an admin
      if (artist.userId !== req.user!.id && !req.user!.isArtist) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = insertArtistSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid artist data", errors: result.error.format() });
      }
      
      const updatedArtist = await storage.updateArtist(artistId, result.data);
      res.json(updatedArtist);
    } catch (error) {
      res.status(500).json({ message: "Failed to update artist" });
    }
  });

  // Schedules
  app.get("/api/artists/:artistId/schedules", async (req, res) => {
    try {
      const artistId = parseInt(req.params.artistId);
      const schedules = await storage.getSchedulesByArtistId(artistId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isArtist) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const result = insertScheduleSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid schedule data", errors: result.error.format() });
      }
      
      // Verify artist ownership
      const artist = await storage.getArtistByUserId(req.user!.id);
      
      if (!artist || artist.id !== result.data.artistId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const schedule = await storage.createSchedule(result.data);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to create schedule" });
    }
  });

  // Appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      let appointments;
      
      if (req.user!.isArtist) {
        const artist = await storage.getArtistByUserId(req.user!.id);
        
        if (!artist) {
          return res.status(404).json({ message: "Artist not found" });
        }
        
        appointments = await storage.getAppointmentsByArtistId(artist.id);
      } else {
        appointments = await storage.getAppointmentsByUserId(req.user!.id);
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const result = insertAppointmentSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid appointment data", errors: result.error.format() });
      }
      
      // If not the user making the appointment, verify permissions
      if (result.data.userId !== req.user!.id && !req.user!.isArtist) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const appointment = await storage.createAppointment(result.data);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check permissions: only appointment owner or artist can update
      const isOwner = appointment.userId === req.user!.id;
      let isArtist = false;
      
      if (req.user!.isArtist) {
        const artist = await storage.getArtistByUserId(req.user!.id);
        isArtist = artist ? artist.id === appointment.artistId : false;
      }
      
      if (!isOwner && !isArtist) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = insertAppointmentSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid appointment data", errors: result.error.format() });
      }
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, result.data);
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Waitlist
  app.post("/api/waitlist", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const data = { ...req.body, userId: req.user!.id };
      const result = insertWaitlistSchema.safeParse(data);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid waitlist data", errors: result.error.format() });
      }
      
      const waitlistEntry = await storage.createWaitlistEntry(result.data);
      res.status(201).json(waitlistEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create waitlist entry" });
    }
  });

  app.get("/api/waitlist", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      let waitlistEntries;
      
      if (req.user!.isArtist) {
        const artist = await storage.getArtistByUserId(req.user!.id);
        
        if (!artist) {
          return res.status(404).json({ message: "Artist not found" });
        }
        
        waitlistEntries = await storage.getWaitlistEntriesByArtistId(artist.id);
      } else {
        waitlistEntries = await storage.getWaitlistEntriesByUserId(req.user!.id);
      }
      
      res.json(waitlistEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch waitlist entries" });
    }
  });

  // Tattoo Styles
  app.get("/api/tattoo-styles", async (_req, res) => {
    try {
      const styles = await storage.getAllTattooStyles();
      res.json(styles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tattoo styles" });
    }
  });

  // AI Recommendation endpoint
  app.post("/api/ai/recommend", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const schema = z.object({
        tattooStyle: z.string(),
        tattooSize: z.string(),
        preferredDates: z.string(),
        budgetRange: z.string(),
        description: z.string(),
      });
      
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid recommendation data", errors: result.error.format() });
      }
      
      // Get all artists for recommendation
      const artists = await storage.getAllArtists();
      
      if (artists.length === 0) {
        return res.status(404).json({ message: "No artists available for recommendation" });
      }
      
      // Get artist user data for all artists to include full names
      const artistsWithUserData = await Promise.all(
        artists.map(async (artist) => {
          const user = await storage.getUser(artist.userId);
          return {
            ...artist,
            fullName: user?.fullName || "",
            bio: artist.bio || ""
          };
        })
      );
      
      // Use OpenAI to recommend the best artist match
      const aiRecommendation = await getArtistRecommendation(
        artistsWithUserData,
        result.data
      );
      
      // Find the recommended artist
      const artistRecommendation = artists.find(artist => artist.id === aiRecommendation.artistId);
      
      if (!artistRecommendation) {
        return res.status(404).json({ message: "Recommended artist not found" });
      }
      
      // Get schedules for this artist
      const schedules = await storage.getSchedulesByArtistId(artistRecommendation.id);
      
      // Generate available dates (in production, this would be fetched from Google Calendar)
      const today = new Date();
      const availableDates = [];
      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Skip weekends for demo purposes
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          availableDates.push(date);
        }
      }
      
      // Get artist user data for the name
      const artistUser = await storage.getUser(artistRecommendation.userId);
      
      const recommendation = {
        artist: {
          ...artistRecommendation,
          fullName: artistUser?.fullName || "",
        },
        schedules,
        availableDates,
        message: aiRecommendation.message
      };
      
      res.json(recommendation);
    } catch (error) {
      console.error("AI recommendation error:", error);
      res.status(500).json({ message: "Failed to generate recommendation" });
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
