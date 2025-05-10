import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (for both clients and artists)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  isArtist: boolean("is_artist").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    fullName: true,
    phone: true,
    isArtist: true,
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Artist schema
export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specialty: text("specialty").notNull(),
  bio: text("bio").notNull(),
  profileImage: text("profile_image"),
  calendarId: text("calendar_id"),
  isAvailable: boolean("is_available").default(true).notNull(),
});

export const insertArtistSchema = createInsertSchema(artists)
  .pick({
    userId: true,
    specialty: true,
    bio: true,
    profileImage: true,
    calendarId: true,
    isAvailable: true,
  });

export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;

// Schedule schema
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").notNull().references(() => artists.id),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull(),
  price: integer("price"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertScheduleSchema = createInsertSchema(schedules)
  .pick({
    artistId: true,
    name: true,
    description: true,
    durationMinutes: true,
    price: true,
    isActive: true,
  });

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

// Appointment schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  artistId: integer("artist_id").notNull().references(() => artists.id),
  scheduleId: integer("schedule_id").notNull().references(() => schedules.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  googleEventId: text("google_event_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments)
  .pick({
    userId: true,
    artistId: true,
    scheduleId: true,
    startTime: true,
    endTime: true,
    status: true,
    notes: true,
    googleEventId: true,
  });

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Waitlist schema
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  artistId: integer("artist_id").references(() => artists.id),
  tattooStyle: text("tattoo_style"),
  tattooSize: text("tattoo_size"),
  preferredDates: text("preferred_dates"),
  budgetRange: text("budget_range"),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWaitlistSchema = createInsertSchema(waitlist)
  .pick({
    userId: true,
    artistId: true,
    tattooStyle: true,
    tattooSize: true,
    preferredDates: true,
    budgetRange: true,
    description: true,
    isActive: true,
  });

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = typeof waitlist.$inferSelect;

// Tattoo Style schema
export const tattooStyles = pgTable("tattoo_styles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
});

export const insertTattooStyleSchema = createInsertSchema(tattooStyles)
  .pick({
    name: true,
    description: true,
    imageUrl: true,
  });

export type InsertTattooStyle = z.infer<typeof insertTattooStyleSchema>;
export type TattooStyle = typeof tattooStyles.$inferSelect;
