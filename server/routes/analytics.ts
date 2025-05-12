import { Express, Request, Response } from "express";
import { 
  getAppointmentAnalytics, 
  getArtistAnalytics, 
  getStudioAnalytics, 
  getWaitlistAnalytics,
  getAiInsights
} from "../analytics-service";

export function setupAnalyticsRoutes(app: Express): void {
  // Get studio-wide analytics
  app.get("/api/analytics/studio", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isArtist) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      // Parse date range from query parameters
      const startDateStr = req.query.startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDateStr = req.query.endDate as string || new Date().toISOString();
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const analytics = await getStudioAnalytics(startDate, endDate);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting studio analytics:", error);
      res.status(500).json({ message: "Failed to retrieve studio analytics" });
    }
  });
  
  // Get artist-specific analytics
  app.get("/api/analytics/artists/:artistId", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const artistId = parseInt(req.params.artistId);
      
      // Only allow artists to view their own analytics or admins to view any artist's analytics
      if (!req.user!.isArtist) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Parse date range from query parameters
      const startDateStr = req.query.startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDateStr = req.query.endDate as string || new Date().toISOString();
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const analytics = await getArtistAnalytics(artistId, startDate, endDate);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting artist analytics:", error);
      res.status(500).json({ message: "Failed to retrieve artist analytics" });
    }
  });
  
  // Get appointment analytics
  app.get("/api/analytics/appointments", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isArtist) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      // Parse date range from query parameters
      const startDateStr = req.query.startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDateStr = req.query.endDate as string || new Date().toISOString();
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      // Optional artistId filter
      const artistId = req.query.artistId ? parseInt(req.query.artistId as string) : undefined;
      
      const analytics = await getAppointmentAnalytics(startDate, endDate, artistId);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting appointment analytics:", error);
      res.status(500).json({ message: "Failed to retrieve appointment analytics" });
    }
  });
  
  // Get waitlist analytics
  app.get("/api/analytics/waitlist", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isArtist) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      // Parse date range from query parameters
      const startDateStr = req.query.startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDateStr = req.query.endDate as string || new Date().toISOString();
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      // Optional artistId filter
      const artistId = req.query.artistId ? parseInt(req.query.artistId as string) : undefined;
      
      const analytics = await getWaitlistAnalytics(startDate, endDate, artistId);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting waitlist analytics:", error);
      res.status(500).json({ message: "Failed to retrieve waitlist analytics" });
    }
  });
  
  // Get AI-generated insights based on analytics data
  app.get("/api/analytics/insights", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isArtist) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      // Parse date range from query parameters
      const startDateStr = req.query.startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDateStr = req.query.endDate as string || new Date().toISOString();
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      // Optional artistId filter
      const artistId = req.query.artistId ? parseInt(req.query.artistId as string) : undefined;
      
      const insights = await getAiInsights(startDate, endDate, artistId);
      res.json(insights);
    } catch (error) {
      console.error("Error getting AI insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });
}