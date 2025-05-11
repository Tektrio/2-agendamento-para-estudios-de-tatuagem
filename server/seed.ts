import { storage } from "./storage";
import { hashPassword } from "./auth";

/**
 * Seeds the database with test users and data for development
 */
export async function seedDatabase() {
  console.log("Seeding database with test data...");
  
  try {
    // Create test users
    const users = [
      {
        username: "customer",
        password: await hashPassword("password123"),
        email: "customer@example.com",
        fullName: "Test Customer",
        phone: "555-123-4567",
        isArtist: false
      },
      {
        username: "artist1",
        password: await hashPassword("password123"),
        email: "artist1@example.com",
        fullName: "John Ink",
        phone: "555-987-6543",
        isArtist: true
      },
      {
        username: "artist2",
        password: await hashPassword("password123"),
        email: "artist2@example.com",
        fullName: "Sarah Colors",
        phone: "555-567-8901",
        isArtist: true
      },
      {
        username: "admin",
        password: await hashPassword("admin123"),
        email: "admin@example.com",
        fullName: "Admin User",
        phone: "555-789-0123",
        isArtist: true
      }
    ];
    
    // Create the users
    const createdUsers = [];
    
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (!existingUser) {
        const user = await storage.createUser(userData);
        createdUsers.push(user);
        console.log(`Created user: ${user.username}`);
      } else {
        console.log(`User ${userData.username} already exists`);
        createdUsers.push(existingUser);
      }
    }
    
    // Create artist profiles for the artist users
    const artistSpecs = [
      {
        userId: createdUsers[1].id, // artist1
        specialty: "Traditional, Neo-Traditional",
        bio: "Specializing in bold lines and vibrant colors, John has 10+ years of experience in traditional and neo-traditional styles.",
        profileImage: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
        isAvailable: true,
        calendarId: null
      },
      {
        userId: createdUsers[2].id, // artist2
        specialty: "Watercolor, Japanese",
        bio: "Sarah is known for her fluid watercolor techniques and intricate Japanese-inspired designs with 8 years of professional experience.",
        profileImage: "https://images.unsplash.com/photo-1619091330992-01415921adde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
        isAvailable: true,
        calendarId: null
      },
      {
        userId: createdUsers[3].id, // admin
        specialty: "Blackwork, Geometric",
        bio: "Studio owner and lead artist specializing in precise blackwork and geometric designs. Over 15 years of experience and numerous awards.",
        profileImage: "https://images.unsplash.com/photo-1487222444274-d49229d7f8c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
        isAvailable: true,
        calendarId: null
      }
    ];
    
    // Create the artist profiles
    for (const artistData of artistSpecs) {
      // Check if artist already exists
      const existingArtist = await storage.getArtistByUserId(artistData.userId);
      
      if (!existingArtist) {
        const artist = await storage.createArtist(artistData);
        console.log(`Created artist profile for user ID: ${artist.userId}`);
        
        // Create schedules for each artist
        const schedules = [
          {
            artistId: artist.id,
            name: "Small Tattoo Session",
            description: "1-2 hour session for small designs up to 3 inches",
            durationMinutes: 90,
            price: 150,
            isActive: true
          },
          {
            artistId: artist.id,
            name: "Medium Tattoo Session",
            description: "3-5 hour session for medium-sized designs",
            durationMinutes: 240,
            price: 400,
            isActive: true
          },
          {
            artistId: artist.id,
            name: "Large Tattoo Session",
            description: "Full day session for large or complex designs",
            durationMinutes: 480,
            price: 800,
            isActive: true
          }
        ];
        
        for (const scheduleData of schedules) {
          const schedule = await storage.createSchedule(scheduleData);
          console.log(`Created schedule: ${schedule.name} for artist ID: ${artist.id}`);
        }
      } else {
        console.log(`Artist profile for user ID: ${artistData.userId} already exists`);
      }
    }
    
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}