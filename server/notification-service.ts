import twilio from 'twilio';
import { storage } from './storage';

// Twilio credentials
// In a production app, these would be stored as environment variables
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client if credentials are available
let twilioClient: twilio.Twilio | null = null;

if (twilioAccountSid && twilioAuthToken) {
  twilioClient = twilio(twilioAccountSid, twilioAuthToken);
} else {
  console.warn('Twilio credentials not provided. SMS notifications will be simulated.');
}

// Types
export type NotificationType = 
  | 'appointment_confirmation' 
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'waitlist_notification'
  | 'new_availability';

export interface NotificationOptions {
  userId: number;
  appointmentId?: number;
  artistId?: number;
  customMessage?: string;
  date?: Date;
  additionalData?: Record<string, any>;
}

/**
 * Send an SMS notification to a user
 */
export async function sendSmsNotification(
  type: NotificationType,
  options: NotificationOptions
): Promise<boolean> {
  try {
    // Get user to send the notification to
    const user = await storage.getUser(options.userId);
    
    if (!user || !user.phone) {
      console.warn(`Cannot send SMS to user ${options.userId}: User not found or no phone number`);
      return false;
    }
    
    // Get message content based on notification type
    const message = await generateMessageContent(type, options);
    
    // In a production environment, send the message via Twilio
    if (twilioClient && twilioPhoneNumber) {
      await twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: user.phone,
      });
      
      console.log(`SMS sent to ${user.phone}: ${message}`);
      return true;
    } else {
      // Simulate SMS in development environment
      console.log(`[SIMULATED SMS to ${user.phone}]: ${message}`);
      return true;
    }
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
}

/**
 * Generate notification message content based on type and data
 */
async function generateMessageContent(
  type: NotificationType,
  options: NotificationOptions
): Promise<string> {
  const { userId, appointmentId, artistId, customMessage, date, additionalData } = options;
  
  // Get user data
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }
  
  // Get artist data if provided
  let artist = null;
  let artistName = '';
  
  if (artistId) {
    artist = await storage.getArtist(artistId);
    if (artist) {
      const artistUser = await storage.getUser(artist.userId);
      artistName = artistUser?.fullName || 'your artist';
    }
  }
  
  // Get appointment data if provided
  let appointment = null;
  let appointmentTime = '';
  let appointmentDate = '';
  
  if (appointmentId) {
    appointment = await storage.getAppointment(appointmentId);
    if (appointment) {
      appointmentTime = new Date(appointment.startTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      appointmentDate = new Date(appointment.startTime).toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
  }
  
  // If a custom message is provided, use it
  if (customMessage) {
    return customMessage;
  }
  
  // Generate message based on notification type
  switch (type) {
    case 'appointment_confirmation':
      return `Hi ${user.fullName}! Your appointment with ${artistName} at InkSync Tattoo is confirmed for ${appointmentDate} at ${appointmentTime}. See you soon!`;
      
    case 'appointment_reminder':
      return `Reminder: Your tattoo appointment with ${artistName} at InkSync Tattoo is tomorrow, ${appointmentDate} at ${appointmentTime}. Please arrive 15 minutes early. Reply if you need to reschedule.`;
      
    case 'appointment_cancelled':
      return `Hi ${user.fullName}, your appointment at InkSync Tattoo on ${appointmentDate} at ${appointmentTime} has been cancelled. Please contact us to reschedule.`;
      
    case 'waitlist_notification':
      const openingDate = date ? date.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }) : 'soon';
      
      return `Good news, ${user.fullName}! A slot has opened up at InkSync Tattoo ${openingDate}. Reply YES to book or call us to discuss details.`;
      
    case 'new_availability':
      return `Hi ${user.fullName}! ${artistName} just added new availability at InkSync Tattoo. Check our booking system to secure your spot!`;
      
    default:
      return `InkSync Tattoo: Thanks for being a valued client, ${user.fullName}! Check our website for the latest updates.`;
  }
}

/**
 * Send appointment confirmation notification
 */
export async function sendAppointmentConfirmation(
  userId: number,
  appointmentId: number
): Promise<boolean> {
  return sendSmsNotification('appointment_confirmation', {
    userId,
    appointmentId
  });
}

/**
 * Send appointment reminder notification
 */
export async function sendAppointmentReminder(
  userId: number,
  appointmentId: number
): Promise<boolean> {
  return sendSmsNotification('appointment_reminder', {
    userId,
    appointmentId
  });
}

/**
 * Send cancellation notification
 */
export async function sendCancellationNotification(
  userId: number,
  appointmentId: number,
  reason?: string
): Promise<boolean> {
  let message = await generateMessageContent('appointment_cancelled', {
    userId,
    appointmentId
  });
  
  if (reason) {
    message += ` Reason: ${reason}`;
  }
  
  return sendSmsNotification('appointment_cancelled', {
    userId,
    appointmentId,
    customMessage: message
  });
}

/**
 * Send waitlist notification when a slot opens up
 */
export async function sendWaitlistNotification(
  userId: number,
  artistId: number,
  date: Date
): Promise<boolean> {
  return sendSmsNotification('waitlist_notification', {
    userId,
    artistId,
    date
  });
}

/**
 * Send notification about new availability
 */
export async function sendNewAvailabilityNotification(
  userId: number,
  artistId: number
): Promise<boolean> {
  return sendSmsNotification('new_availability', {
    userId,
    artistId
  });
}

/**
 * Send custom notification
 */
export async function sendCustomNotification(
  userId: number,
  message: string
): Promise<boolean> {
  return sendSmsNotification('waitlist_notification', {
    userId,
    customMessage: message
  });
}