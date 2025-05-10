import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  users, artists, schedules, appointments, waitlist, tattooStyles,
  type User, type InsertUser, 
  type Artist, type InsertArtist, 
  type Schedule, type InsertSchedule, 
  type Appointment, type InsertAppointment, 
  type Waitlist, type InsertWaitlist,
  type TattooStyle, type InsertTattooStyle 
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Artist methods
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistByUserId(userId: number): Promise<Artist | undefined>;
  getAllArtists(): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: number, artist: Partial<InsertArtist>): Promise<Artist | undefined>;
  
  // Schedule methods
  getSchedule(id: number): Promise<Schedule | undefined>;
  getSchedulesByArtistId(artistId: number): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  
  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUserId(userId: number): Promise<Appointment[]>;
  getAppointmentsByArtistId(artistId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  
  // Waitlist methods
  getWaitlistEntry(id: number): Promise<Waitlist | undefined>;
  getWaitlistEntriesByUserId(userId: number): Promise<Waitlist[]>;
  getWaitlistEntriesByArtistId(artistId: number): Promise<Waitlist[]>;
  createWaitlistEntry(waitlistEntry: InsertWaitlist): Promise<Waitlist>;
  updateWaitlistEntry(id: number, waitlistEntry: Partial<InsertWaitlist>): Promise<Waitlist | undefined>;
  
  // Tattoo Style methods
  getTattooStyle(id: number): Promise<TattooStyle | undefined>;
  getAllTattooStyles(): Promise<TattooStyle[]>;
  createTattooStyle(tattooStyle: InsertTattooStyle): Promise<TattooStyle>;
}

export class MemStorage implements IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // Data stores
  private users: Map<number, User>;
  private artists: Map<number, Artist>;
  private schedules: Map<number, Schedule>;
  private appointments: Map<number, Appointment>;
  private waitlistEntries: Map<number, Waitlist>;
  private tattooStyles: Map<number, TattooStyle>;
  
  // ID counters
  private userIdCounter: number;
  private artistIdCounter: number;
  private scheduleIdCounter: number;
  private appointmentIdCounter: number;
  private waitlistIdCounter: number;
  private tattooStyleIdCounter: number;

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    this.users = new Map();
    this.artists = new Map();
    this.schedules = new Map();
    this.appointments = new Map();
    this.waitlistEntries = new Map();
    this.tattooStyles = new Map();
    
    this.userIdCounter = 1;
    this.artistIdCounter = 1;
    this.scheduleIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.waitlistIdCounter = 1;
    this.tattooStyleIdCounter = 1;

    // Initialize with some tattoo styles
    this.initTattooStyles();
  }

  // Initialize tattoo styles
  private async initTattooStyles() {
    const styles = [
      { name: "Traditional", description: "Bold lines and solid colors", imageUrl: "https://pixabay.com/get/g9489f838e78306e05d885448040f14b42718771bbb9e8b7f355f15c63fca06459e5d44a6414409b778e0b187e58f12cc9a7af2a1f911a6d2abffb7d2a7def41f_1280.jpg" },
      { name: "Realism", description: "Photorealistic detail and shading", imageUrl: "https://images.unsplash.com/photo-1462331321792-cc44368b8894?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80" },
      { name: "Watercolor", description: "Vibrant colors with painterly aesthetic", imageUrl: "https://pixabay.com/get/gd8a8b287352083e7488f7378184a3a8181d7d4ef833efc0d8420119d5096ae594664a81f3f12ecabee3fa9656c2d129e5d90e15b109036d1f01f86e0e0f2f2f8_1280.jpg" },
      { name: "Geometric", description: "Precise lines and patterns", imageUrl: "https://pixabay.com/get/gd34131068cf1f3b0267c5f0bd7daf9d64fb1cc25c5b2ea5ebd5bed3018917c718d73a327f42fc7771af30fad9d07743efc1de0f6a8d4e96dfaac8516520c9656_1280.jpg" },
      { name: "Japanese", description: "Traditional Japanese art themes", imageUrl: "https://pixabay.com/get/g44de7c5cdceaec95fa83701e15f6dd93cfb81e68e2cc8e21aae20672465653b5d36c289f1edea32798b4801de40af957447129158c892acde113ffcfa6de974e_1280.jpg" },
      { name: "Minimalist", description: "Simple, clean lines and designs", imageUrl: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80" }
    ];

    for (const style of styles) {
      await this.createTattooStyle(style);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.users.set(id, newUser);
    return newUser;
  }

  // Artist methods
  async getArtist(id: number): Promise<Artist | undefined> {
    return this.artists.get(id);
  }

  async getArtistByUserId(userId: number): Promise<Artist | undefined> {
    return Array.from(this.artists.values()).find(
      (artist) => artist.userId === userId,
    );
  }

  async getAllArtists(): Promise<Artist[]> {
    return Array.from(this.artists.values());
  }

  async createArtist(artist: InsertArtist): Promise<Artist> {
    const id = this.artistIdCounter++;
    const newArtist: Artist = { ...artist, id };
    this.artists.set(id, newArtist);
    return newArtist;
  }

  async updateArtist(id: number, artist: Partial<InsertArtist>): Promise<Artist | undefined> {
    const existingArtist = this.artists.get(id);
    if (!existingArtist) {
      return undefined;
    }
    const updatedArtist: Artist = { ...existingArtist, ...artist };
    this.artists.set(id, updatedArtist);
    return updatedArtist;
  }

  // Schedule methods
  async getSchedule(id: number): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }

  async getSchedulesByArtistId(artistId: number): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(
      (schedule) => schedule.artistId === artistId,
    );
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleIdCounter++;
    const newSchedule: Schedule = { ...schedule, id };
    this.schedules.set(id, newSchedule);
    return newSchedule;
  }

  async updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const existingSchedule = this.schedules.get(id);
    if (!existingSchedule) {
      return undefined;
    }
    const updatedSchedule: Schedule = { ...existingSchedule, ...schedule };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId,
    );
  }

  async getAppointmentsByArtistId(artistId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.artistId === artistId,
    );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const createdAt = new Date();
    const newAppointment: Appointment = { ...appointment, id, createdAt };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existingAppointment = this.appointments.get(id);
    if (!existingAppointment) {
      return undefined;
    }
    const updatedAppointment: Appointment = { ...existingAppointment, ...appointment };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Waitlist methods
  async getWaitlistEntry(id: number): Promise<Waitlist | undefined> {
    return this.waitlistEntries.get(id);
  }

  async getWaitlistEntriesByUserId(userId: number): Promise<Waitlist[]> {
    return Array.from(this.waitlistEntries.values()).filter(
      (entry) => entry.userId === userId,
    );
  }

  async getWaitlistEntriesByArtistId(artistId: number): Promise<Waitlist[]> {
    return Array.from(this.waitlistEntries.values()).filter(
      (entry) => entry.artistId === artistId,
    );
  }

  async createWaitlistEntry(waitlistEntry: InsertWaitlist): Promise<Waitlist> {
    const id = this.waitlistIdCounter++;
    const createdAt = new Date();
    const newWaitlistEntry: Waitlist = { ...waitlistEntry, id, createdAt };
    this.waitlistEntries.set(id, newWaitlistEntry);
    return newWaitlistEntry;
  }

  async updateWaitlistEntry(id: number, waitlistEntry: Partial<InsertWaitlist>): Promise<Waitlist | undefined> {
    const existingWaitlistEntry = this.waitlistEntries.get(id);
    if (!existingWaitlistEntry) {
      return undefined;
    }
    const updatedWaitlistEntry: Waitlist = { ...existingWaitlistEntry, ...waitlistEntry };
    this.waitlistEntries.set(id, updatedWaitlistEntry);
    return updatedWaitlistEntry;
  }

  // Tattoo Style methods
  async getTattooStyle(id: number): Promise<TattooStyle | undefined> {
    return this.tattooStyles.get(id);
  }

  async getAllTattooStyles(): Promise<TattooStyle[]> {
    return Array.from(this.tattooStyles.values());
  }

  async createTattooStyle(tattooStyle: InsertTattooStyle): Promise<TattooStyle> {
    const id = this.tattooStyleIdCounter++;
    const newTattooStyle: TattooStyle = { ...tattooStyle, id };
    this.tattooStyles.set(id, newTattooStyle);
    return newTattooStyle;
  }
}

export const storage = new MemStorage();
