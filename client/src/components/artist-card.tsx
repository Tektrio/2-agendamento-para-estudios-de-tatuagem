import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "@/lib/utils";

interface ArtistCardProps {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  status: "Available" | "Limited Slots" | "Fully Booked";
  compact?: boolean;
}

export function ArtistCard({
  id,
  name,
  specialty,
  bio,
  image,
  status,
  compact = false,
}: ArtistCardProps) {
  const statusColors = getStatusColor(status.toLowerCase());
  
  if (compact) {
    return (
      <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 hover:border-primary cursor-pointer transition duration-200">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
            <img src={image} alt={name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-light font-medium">{name}</h3>
            <p className="text-secondary text-xs">{specialty}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Next available:</span>
          <span className="text-light">
            {status === "Available" 
              ? "Today" 
              : status === "Limited Slots" 
                ? "This week" 
                : "Next month"}
          </span>
        </div>
        <div className="mt-4 flex">
          <Link href={`/artists/${id}`}>
            <Button 
              className="w-full bg-primary hover:bg-opacity-90 text-light transition duration-200"
              disabled={status === "Fully Booked"}
            >
              {status === "Fully Booked" ? "Join Waitlist" : "Select"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="artist-card bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-primary h-full flex flex-col">
      <img 
        src={image} 
        alt={`${name} - Tattoo Artist`} 
        className="w-full h-64 object-cover object-center"
      />
      <div className="p-5 flex-grow">
        <h3 className="text-xl font-heading text-light">{name}</h3>
        <p className="text-secondary font-accent text-sm mb-2">{specialty}</p>
        <p className="text-gray-400 text-sm mb-4">{bio}</p>
        <div className="flex justify-between items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors.bg} ${statusColors.text}`}>
            {status}
          </span>
          <Link href={`/artists/${id}`}>
            <a className="text-primary hover:text-secondary transition duration-200 text-sm font-semibold">
              View Portfolio
            </a>
          </Link>
        </div>
      </div>
      <Link href={status === "Fully Booked" ? "/waitlist" : `/booking?artist=${id}`}>
        <a className={`block text-center py-3 text-light font-medium transition duration-200 ${
          status === "Fully Booked" 
            ? "bg-gray-700 cursor-not-allowed opacity-75" 
            : "bg-primary hover:bg-opacity-90"
        }`}>
          {status === "Fully Booked" ? "Join Waitlist" : "Book Session"}
        </a>
      </Link>
    </div>
  );
}
