import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { insertWaitlistSchema } from "@shared/schema";
import { generateWaitlistMessage } from "../openai-service";

export function setupWaitlistRoutes(app: Express): void {
  // Get all waitlist entries for artist
  app.get("/api/artists/:artistId/waitlist", async (req: Request, res: Response) => {
    try {
      const artistId = parseInt(req.params.artistId);
      if (isNaN(artistId)) {
        return res.status(400).json({ message: "Invalid artist ID" });
      }

      const waitlistEntries = await storage.getWaitlistEntriesByArtistId(artistId);
      return res.status(200).json(waitlistEntries);
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      return res.status(500).json({ message: "Failed to fetch waitlist entries" });
    }
  });

  // Get waitlist entries for logged in user
  app.get("/api/waitlist", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user!.id;
      const waitlistEntries = await storage.getWaitlistEntriesByUserId(userId);
      return res.status(200).json(waitlistEntries);
    } catch (error) {
      console.error("Error fetching user waitlist entries:", error);
      return res.status(500).json({ message: "Failed to fetch waitlist entries" });
    }
  });

  // Add user to waitlist
  app.post("/api/waitlist", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user!.id;
      
      // Validate request data
      const result = insertWaitlistSchema.safeParse({
        ...req.body,
        userId,
        createdAt: new Date(),
        isActive: true
      });

      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid waitlist data", 
          errors: result.error.errors 
        });
      }

      // If preferences are provided, generate a personalized message
      let aiGeneratedMessage = "";
      if (
        req.body.tattooStyle || 
        req.body.tattooSize || 
        req.body.preferredDates || 
        req.body.budgetRange || 
        req.body.description
      ) {
        try {
          aiGeneratedMessage = await generateWaitlistMessage({
            tattooStyle: req.body.tattooStyle || "",
            tattooSize: req.body.tattooSize || "",
            preferredDates: req.body.preferredDates || "",
            budgetRange: req.body.budgetRange || "",
            description: req.body.description || ""
          });
        } catch (aiError) {
          console.error("Error generating AI waitlist message:", aiError);
          // Continue without AI message if there's an error
        }
      }

      // Create waitlist entry
      const waitlistEntry = await storage.createWaitlistEntry({
        ...result.data,
        // Append AI message if available
        description: aiGeneratedMessage 
          ? `${result.data.description}\n\nAI Recommendation: ${aiGeneratedMessage}` 
          : result.data.description
      });

      return res.status(201).json(waitlistEntry);
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      return res.status(500).json({ message: "Failed to add to waitlist" });
    }
  });

  // Update waitlist entry
  app.patch("/api/waitlist/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid waitlist entry ID" });
      }

      // Check if entry exists
      const existingEntry = await storage.getWaitlistEntry(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Waitlist entry not found" });
      }

      // Check if user owns the entry or is an artist associated with the entry
      const userId = req.user!.id;
      const userIsArtist = req.user!.isArtist;
      
      if (existingEntry.userId !== userId && (!userIsArtist || !existingEntry.artistId)) {
        return res.status(403).json({ message: "Not authorized to update this waitlist entry" });
      }

      // Update entry
      const updatedEntry = await storage.updateWaitlistEntry(entryId, req.body);
      return res.status(200).json(updatedEntry);
    } catch (error) {
      console.error("Error updating waitlist entry:", error);
      return res.status(500).json({ message: "Failed to update waitlist entry" });
    }
  });

  // Delete from waitlist
  app.delete("/api/waitlist/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid waitlist entry ID" });
      }

      // Check if entry exists
      const existingEntry = await storage.getWaitlistEntry(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Waitlist entry not found" });
      }

      // Check if user owns the entry
      const userId = req.user!.id;
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this waitlist entry" });
      }

      // Soft delete by setting isActive to false
      const updatedEntry = await storage.updateWaitlistEntry(entryId, { isActive: false });
      return res.status(200).json(updatedEntry);
    } catch (error) {
      console.error("Error removing from waitlist:", error);
      return res.status(500).json({ message: "Failed to remove from waitlist" });
    }
  });
}