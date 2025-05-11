import session from "express-session";
import { Store as SessionStore } from "express-session";
import connectPg from "connect-pg-simple";
import { 
  users, artists, schedules, appointments, waitlist, tattooStyles,
  type User, type InsertUser, 
  type Artist, type InsertArtist, 
  type Schedule, type InsertSchedule, 
  type Appointment, type InsertAppointment, 
  type Waitlist, type InsertWaitlist,
  type TattooStyle, type InsertTattooStyle 
} from "@shared/schema";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

// PostgreSQL storage implementation
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // Initialize default tattoo styles
  async initTattooStyles() {
    const styles = [
      { name: "Traditional", description: "Bold lines and solid colors", imageUrl: "https://pixabay.com/get/g9489f838e78306e05d885448040f14b42718771bbb9e8b7f355f15c63fca06459e5d44a6414409b778e0b187e58f12cc9a7af2a1f911a6d2abffb7d2a7def41f_1280.jpg" },
      { name: "Realism", description: "Photorealistic detail and shading", imageUrl: "https://images.unsplash.com/photo-1462331321792-cc44368b8894?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80" },
      { name: "Watercolor", description: "Vibrant colors with painterly aesthetic", imageUrl: "https://pixabay.com/get/gd8a8b287352083e7488f7378184a3a8181d7d4ef833efc0d8420119d5096ae594664a81f3f12ecabee3fa9656c2d129e5d90e15b109036d1f01f86e0e0f2f2f8_1280.jpg" },
      { name: "Geometric", description: "Precise lines and patterns", imageUrl: "https://pixabay.com/get/gd34131068cf1f3b0267c5f0bd7daf9d64fb1cc25c5b2ea5ebd5bed3018917c718d73a327f42fc7771af30fad9d07743efc1de0f6a8d4e96dfaac8516520c9656_1280.jpg" },
      { name: "Japanese", description: "Traditional Japanese art themes", imageUrl: "https://pixabay.com/get/g44de7c5cdceaec95fa83701e15f6dd93cfb81e68e2cc8e21aae20672465653b5d36c289f1edea32798b4801de40af957447129158c892acde113ffcfa6de974e_1280.jpg" },
      { name: "Minimalist", description: "Simple, clean lines and designs", imageUrl: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80" }
    ];
    
    // Check if styles already exist
    const existingStyles = await db.select().from(tattooStyles);
    if (existingStyles.length > 0) {
      console.log("Tattoo styles already exist in database");
      return;
    }
    
    // Insert the styles
    for (const style of styles) {
      await this.createTattooStyle(style);
      console.log(`Created tattoo style in database: ${style.name}`);
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }
  
  // Artist methods
  async getArtist(id: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
  }
  
  async getArtistByUserId(userId: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    return artist;
  }
  
  async getAllArtists(): Promise<Artist[]> {
    return await db.select().from(artists);
  }
  
  async createArtist(artist: InsertArtist): Promise<Artist> {
    const [createdArtist] = await db.insert(artists).values(artist).returning();
    return createdArtist;
  }
  
  async updateArtist(id: number, artist: Partial<InsertArtist>): Promise<Artist | undefined> {
    const [updatedArtist] = await db
      .update(artists)
      .set(artist)
      .where(eq(artists.id, id))
      .returning();
    return updatedArtist;
  }
  
  // Schedule methods
  async getSchedule(id: number): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id));
    return schedule;
  }
  
  async getSchedulesByArtistId(artistId: number): Promise<Schedule[]> {
    return await db.select().from(schedules).where(eq(schedules.artistId, artistId));
  }
  
  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const [createdSchedule] = await db.insert(schedules).values(schedule).returning();
    return createdSchedule;
  }
  
  async updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const [updatedSchedule] = await db
      .update(schedules)
      .set(schedule)
      .where(eq(schedules.id, id))
      .returning();
    return updatedSchedule;
  }
  
  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }
  
  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.userId, userId));
  }
  
  async getAppointmentsByArtistId(artistId: number): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.artistId, artistId));
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [createdAppointment] = await db.insert(appointments).values(appointment).returning();
    return createdAppointment;
  }
  
  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(appointment)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }
  
  // Waitlist methods
  async getWaitlistEntry(id: number): Promise<Waitlist | undefined> {
    const [entry] = await db.select().from(waitlist).where(eq(waitlist.id, id));
    return entry;
  }
  
  async getWaitlistEntriesByUserId(userId: number): Promise<Waitlist[]> {
    return await db.select().from(waitlist).where(eq(waitlist.userId, userId));
  }
  
  async getWaitlistEntriesByArtistId(artistId: number): Promise<Waitlist[]> {
    return await db.select().from(waitlist).where(eq(waitlist.artistId, artistId));
  }
  
  async createWaitlistEntry(waitlistEntry: InsertWaitlist): Promise<Waitlist> {
    const [entry] = await db.insert(waitlist).values(waitlistEntry).returning();
    return entry;
  }
  
  async updateWaitlistEntry(id: number, waitlistEntry: Partial<InsertWaitlist>): Promise<Waitlist | undefined> {
    const [updatedEntry] = await db
      .update(waitlist)
      .set(waitlistEntry)
      .where(eq(waitlist.id, id))
      .returning();
    return updatedEntry;
  }
  
  // Tattoo Style methods
  async getTattooStyle(id: number): Promise<TattooStyle | undefined> {
    const [style] = await db.select().from(tattooStyles).where(eq(tattooStyles.id, id));
    return style;
  }
  
  async getAllTattooStyles(): Promise<TattooStyle[]> {
    return await db.select().from(tattooStyles);
  }
  
  async createTattooStyle(tattooStyle: InsertTattooStyle): Promise<TattooStyle> {
    const [style] = await db.insert(tattooStyles).values(tattooStyle).returning();
    return style;
  }
}